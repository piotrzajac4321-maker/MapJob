/**
 * Service worker — orchestrator standalone (bez backendu).
 *
 * Pętla:
 * 1. Co 30s: pobierz next target z lokalnego store.
 * 2. Otwórz tab grupy, wyślij PASTE_POST do content script.
 * 3. Aktywuj tab → user widzi composer wypełniony, klika Publikuj.
 * 4. fb-publish-detect raportuje PUBLISH_DETECTED → mark posted.
 */

import {
  pickNextTarget,
  updateTarget,
  markGroupPosted,
  logActivity,
  getSettings,
  getDeviceId,
} from '../lib/store';
import * as cloud from '../lib/cloud';

const ALARM_TICK = 'mapjob-tick';
const ALARM_ENGAGEMENT = 'mapjob-engagement';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 0.5 });
  chrome.alarms.create(ALARM_ENGAGEMENT, { periodInMinutes: 30 });
  console.log('[MapJob BG] Extension installed');
  const deviceId = await getDeviceId();
  void cloud.registerDevice(deviceId, `Chrome — ${navigator.platform}`);
});
chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 0.5 });
  chrome.alarms.create(ALARM_ENGAGEMENT, { periodInMinutes: 30 });
  const deviceId = await getDeviceId();
  void cloud.pingDevice(deviceId);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_TICK) void tick();
  if (alarm.name === ALARM_ENGAGEMENT) void scrapeEngagementBatch();
});

async function scrapeEngagementBatch(): Promise<void> {
  const deviceId = await getDeviceId();
  const config = cloud.getCloudConfig();
  try {
    const res = await fetch(
      `${config.url}/rest/v1/mjfb_publications?device_id=eq.${encodeURIComponent(deviceId)}&status=eq.posted&fb_post_url=not.is.null&posted_at=gte.${new Date(Date.now() - 24 * 3600 * 1000).toISOString()}&select=id,fb_post_url&limit=10`,
      { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` } },
    );
    if (!res.ok) return;
    const pubs = (await res.json()) as { id: string; fb_post_url: string }[];
    console.log('[MapJob BG] Re-scrape engagement:', pubs.length);
    for (const pub of pubs) {
      try {
        const tab = await chrome.tabs.create({ url: pub.fb_post_url, active: false });
        if (!tab.id) continue;
        await new Promise((r) => setTimeout(r, 4000));
        const result = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_ENGAGEMENT', fbPostUrl: pub.fb_post_url }).catch(() => null);
        if (result?.ok) {
          await cloud.recordEngagement(pub.id, result.reactions ?? 0, result.comments ?? 0, result.shares ?? 0);
        }
        await chrome.tabs.remove(tab.id).catch(() => null);
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.warn('[MapJob BG] Engagement scrape failed:', err);
      }
    }
  } catch (err) {
    console.warn('[MapJob BG] Engagement batch error:', err);
  }
}

let busy = false;

async function tick(): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    const settings = await getSettings();
    if (settings.paused) return;

    const next = await pickNextTarget();
    if (!next) return;

    const { target, group, delaySec } = next;
    console.log('[MapJob BG] Next target:', group.name, 'delay:', delaySec, 's');

    const deviceId = await getDeviceId();
    await updateTarget(target.id, { status: 'in_progress', attemptedAt: Date.now() });
    await logActivity({ type: 'post', message: 'Otwieram grupę', groupName: group.name });

    // Cloud: upsert publication + log
    void cloud.upsertPublication(deviceId, {
      id: target.id,
      fbGroupId: group.fbGroupId,
      groupName: group.name,
      postBody: target.renderedText,
      status: 'in_progress',
      attemptedAt: Date.now(),
    });
    void cloud.logActivity(deviceId, {
      eventType: 'post_started',
      message: `Otwieram grupę: ${group.name}`,
      fbGroupId: group.fbGroupId,
    });

    // Otwórz tab z grupą
    const tab = await chrome.tabs.create({ url: group.url, active: false });
    if (!tab.id) {
      await updateTarget(target.id, { status: 'failed', errorCode: 'no_tab', errorMessage: 'Nie udało się otworzyć karty' });
      return;
    }

    // Czekaj na load
    await waitForTab(tab.id);

    // Re-check grupa jeszcze aktywna (user mógł odznaczyć w międzyczasie)
    const freshGroups = await chrome.storage.local.get('groups');
    const stillActive = (freshGroups.groups as Array<{ fbGroupId: string; isActive: boolean }> | undefined)
      ?.find((g) => g.fbGroupId === group.fbGroupId)?.isActive;
    if (!stillActive) {
      console.log('[MapJob BG] Grupa', group.name, 'została dezaktywowana, skip');
      await updateTarget(target.id, { status: 'skipped', errorCode: 'group_inactive', errorMessage: 'Grupa dezaktywowana przez usera' });
      await chrome.tabs.remove(tab.id).catch(() => null);
      return;
    }

    // Pobierz obrazki z postu (jeśli są)
    const { posts: allPosts = [], campaigns: allCampaigns = [] } = await chrome.storage.local.get(['posts', 'campaigns']);
    const campaign = (allCampaigns as Array<{ id: string; postId: string }>).find((c) => c.id === target.campaignId);
    const post = (allPosts as Array<{ id: string; imageDataUrls?: string[] }>).find((p) => p.id === campaign?.postId);
    const imageDataUrls = post?.imageDataUrls ?? [];

    // Wyślij PASTE_POST z retry (3 próby, 2s/5s backoff)
    // Composer może się otworzyć z opóźnieniem albo FB DOM jeszcze nie gotowy.
    let pasteResp: { ok?: boolean; error?: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      pasteResp = await chrome.tabs.sendMessage(tab.id, {
        type: 'PASTE_POST',
        text: target.renderedText,
        targetId: target.id,
        imageDataUrls,
      }).catch((e) => ({ ok: false, error: String(e) }));

      if (pasteResp?.ok) break;
      if (attempt < 2) {
        console.warn(`[MapJob BG] Paste attempt ${attempt + 1} failed, retry za ${[2, 5][attempt]}s. Err:`, pasteResp?.error);
        await new Promise((r) => setTimeout(r, [2000, 5000][attempt]));
      }
    }

    if (!pasteResp?.ok) {
      await updateTarget(target.id, {
        status: 'failed',
        errorCode: 'paste_failed',
        errorMessage: pasteResp?.error ?? 'Nie udało się wkleić treści po 3 próbach',
      });
      await logActivity({ type: 'fail', message: `Wklejanie nie powiodło się (3× retry)`, groupName: group.name });
      void cloud.updatePublicationStatus(target.id, {
        status: 'failed',
        errorCode: 'paste_failed',
        errorMessage: pasteResp?.error ?? 'paste failed 3×',
      });
      return;
    }

    // Włącz watch
    await chrome.tabs.sendMessage(tab.id, { type: 'WATCH_PUBLISH', targetId: target.id }).catch(() => null);

    // Aktywuj tab — user widzi composer i klika Publikuj
    await chrome.tabs.update(tab.id, { active: true });

    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'MapJob — kliknij Publikuj',
        message: `Treść wklejona w grupie "${group.name}". Sprawdź i kliknij Publikuj.`,
      });
    } catch {}

    // Delay przed następną iteracją
    await new Promise((r) => setTimeout(r, delaySec * 1000));
  } catch (err) {
    console.error('[MapJob BG] tick error:', err);
  } finally {
    busy = false;
  }
}

function waitForTab(tabId: number, timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeoutMs);

    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        setTimeout(resolve, 2200);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// Listener na eventy z content scriptów
chrome.runtime.onMessage.addListener((msg: { type?: string; [k: string]: unknown }, sender) => {
  void handleMessage(msg, sender);
});

async function handleMessage(msg: { type?: string; [k: string]: unknown }, sender: chrome.runtime.MessageSender): Promise<void> {
  if (msg.type === 'PUBLISH_DETECTED') {
    const targetId = msg.targetId as string;
    const fbPostUrl = msg.fbPostUrl as string | undefined;

    // Atomic read of targets+groups, update target → mark group posted → log
    const snap = await chrome.storage.local.get(['targets', 'groups']);
    const target = ((snap.targets as Array<{ id: string; groupId: string }> | undefined) ?? [])
      .find((t) => t.id === targetId);
    if (!target) {
      console.warn('[MapJob BG] PUBLISH_DETECTED dla nieznanego target:', targetId);
      return;
    }

    const postedAt = Date.now();
    await updateTarget(targetId, { status: 'posted', postedAt });
    await markGroupPosted(target.groupId);

    const group = ((snap.groups as Array<{ fbGroupId: string; name: string }> | undefined) ?? [])
      .find((g) => g.fbGroupId === target.groupId);
    await logActivity({ type: 'post', message: 'Opublikowany ✓', groupName: group?.name ?? target.groupId });

    // Cloud sync — fire-and-forget
    const deviceId = await getDeviceId();
    void cloud.updatePublicationStatus(targetId, { status: 'posted', postedAt, fbPostUrl });
    void cloud.logActivity(deviceId, {
      eventType: 'post_done',
      message: 'Opublikowany ✓',
      fbGroupId: target.groupId,
      meta: { fb_post_url: fbPostUrl ?? null },
    });

    if (sender.tab?.id) {
      await chrome.tabs.sendMessage(sender.tab.id, { type: 'STOP_WATCH' }).catch(() => null);
      // Zamknij tab po krótkiej pauzie
      setTimeout(() => chrome.tabs.remove(sender.tab!.id!).catch(() => null), 3000);
    }
  } else if (msg.type === 'PUBLISH_TIMEOUT') {
    const targetId = msg.targetId as string;
    await updateTarget(targetId, {
      status: 'failed',
      errorCode: 'no_publish_detected',
      errorMessage: 'User nie kliknął Publikuj w 90 sekund',
    });
    await logActivity({ type: 'fail', message: 'Nie kliknięto Publikuj' });

    const deviceId = await getDeviceId();
    void cloud.updatePublicationStatus(targetId, {
      status: 'failed',
      errorCode: 'no_publish_detected',
      errorMessage: 'User nie kliknął Publikuj w 90 sekund',
    });
    void cloud.logActivity(deviceId, { eventType: 'post_failed', message: 'Nie kliknięto Publikuj' });
  } else if (msg.type === 'LOGIN_REQUIRED') {
    const targetId = msg.targetId as string;
    if (targetId) {
      await updateTarget(targetId, {
        status: 'failed',
        errorCode: 'login_required',
        errorMessage: 'Sesja Facebook wygasła',
      });
    }
    // Pauza wszystko
    const { settings } = await chrome.storage.local.get('settings');
    await chrome.storage.local.set({
      settings: { ...((settings as object) ?? {}), paused: true },
    });
    await logActivity({ type: 'login_needed', message: 'Wymagane ponowne zalogowanie do FB' });
    try {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'MapJob — wymagane logowanie',
        message: 'Twoja sesja FB wygasła. Zaloguj się ponownie żeby wznowić.',
      });
    } catch {}
  }
}
