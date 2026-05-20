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

const ALARM_NAME = 'mapjob-tick';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
  console.log('[MapJob BG] Extension installed');
  const deviceId = await getDeviceId();
  void cloud.registerDevice(deviceId, `Chrome — ${navigator.platform}`);
});
chrome.runtime.onStartup.addListener(async () => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
  const deviceId = await getDeviceId();
  void cloud.pingDevice(deviceId);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) void tick();
});

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

    // Wyślij PASTE_POST
    const pasteResp = await chrome.tabs.sendMessage(tab.id, {
      type: 'PASTE_POST',
      text: target.renderedText,
      targetId: target.id,
    }).catch((e) => ({ ok: false, error: String(e) }));

    if (!pasteResp?.ok) {
      await updateTarget(target.id, {
        status: 'failed',
        errorCode: 'paste_failed',
        errorMessage: pasteResp?.error ?? 'Nie udało się wkleić treści',
      });
      await logActivity({ type: 'fail', message: 'Wklejanie nie powiodło się', groupName: group.name });
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

    // Mark posted
    const { targets, groups } = await chrome.storage.local.get(['targets', 'groups']);
    const target = (targets as any[])?.find((t: any) => t.id === targetId);
    if (target) {
      await updateTarget(targetId, {
        status: 'posted',
        postedAt: Date.now(),
        errorCode: fbPostUrl ? undefined : undefined,
      });
      await markGroupPosted(target.groupId);
      const group = (groups as any[])?.find((g: any) => g.fbGroupId === target.groupId);
      await logActivity({ type: 'post', message: 'Opublikowany ✓', groupName: group?.name ?? target.groupId });

      // Cloud sync
      const deviceId = await getDeviceId();
      void cloud.updatePublicationStatus(targetId, {
        status: 'posted',
        postedAt: Date.now(),
        fbPostUrl,
      });
      void cloud.logActivity(deviceId, {
        eventType: 'post_done',
        message: 'Opublikowany ✓',
        fbGroupId: target.groupId,
        meta: { fb_post_url: fbPostUrl },
      });
    }

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
