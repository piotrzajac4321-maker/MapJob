/**
 * Service worker (background) — koordynuje całe postowanie.
 *
 * Pętla:
 * 1. `chrome.alarms` budzi nas co 60s.
 * 2. Jeśli paused → skip.
 * 3. Pobierz next target (RPC next_target_for_device).
 * 4. Otwórz/aktywuj tab z grupą.
 * 5. Wyślij PASTE_POST do content scriptu z renderedText (po wariancji per-grupa).
 * 6. Włącz WATCH_PUBLISH. Wait for PUBLISH_DETECTED / PUBLISH_TIMEOUT / LOGIN_REQUIRED.
 * 7. PATCH campaign_targets → posted/failed.
 * 8. Sleep delay_seconds, dalej.
 */

import { getAuth, getSettings } from '../lib/storage';
import { fetchNextTarget, updateTarget, trackEvent } from '../lib/api';
import { variateForGroup } from '../lib/variator';

const ALARM_NAME = 'mapjob-tick';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void tick();
  }
});

let busy = false;

async function tick(): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    const auth = await getAuth();
    if (!auth) return;
    const settings = await getSettings();
    if (settings.paused) return;

    const target = await fetchNextTarget();
    if (!target) return;

    await trackEvent('extension.post_attempted', {
      campaignId: target.campaign_id,
      groupId: target.group_id,
    }, 'campaign_target', target.target_id);

    // Wariancja per grupa
    const variated = variateForGroup(target.rendered_text, `${target.campaign_id}:${target.group_id}`);

    // Otwórz tab i wykonaj postowanie
    const tab = await chrome.tabs.create({ url: target.group_url, active: false });
    if (!tab.id) {
      await updateTarget(target.target_id, {
        status: 'failed',
        error_code: 'no_tab',
        error_message: 'Could not open tab',
      });
      return;
    }

    // Czekaj na complete + content script ready
    await waitForTabLoad(tab.id);

    // Paste
    await chrome.tabs.sendMessage(tab.id, {
      type: 'PASTE_POST',
      text: variated.text,
      targetId: target.target_id,
    }).catch(() => null);

    // Watch
    await chrome.tabs.sendMessage(tab.id, {
      type: 'WATCH_PUBLISH',
      targetId: target.target_id,
    }).catch(() => null);

    // Aktywuj tab żeby user mógł kliknąć Publikuj
    await chrome.tabs.update(tab.id, { active: true });

    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'MapJob — kliknij Publikuj',
      message: `Treść została wklejona w grupie. Sprawdź i kliknij Publikuj.`,
    }).catch(() => null);

    // Delay przed następną iteracją
    const delayMs = Math.max(target.delay_seconds * 1000, settings.minDelayMs);
    await new Promise((r) => setTimeout(r, delayMs));
  } finally {
    busy = false;
  }
}

async function waitForTabLoad(tabId: number, timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, timeoutMs);

    const listener = (id: number, info: chrome.tabs.TabChangeInfo) => {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        // Daj 2s na render JS
        setTimeout(resolve, 2000);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// Listener na eventy z content scriptów
chrome.runtime.onMessage.addListener((msg, sender, _sendResponse) => {
  void handleMessage(msg, sender);
});

async function handleMessage(msg: { type?: string; [k: string]: unknown }, sender: chrome.runtime.MessageSender): Promise<void> {
  switch (msg.type) {
    case 'PUBLISH_DETECTED': {
      const targetId = msg.targetId as string;
      const fbPostUrl = msg.fbPostUrl as string | undefined;
      await updateTarget(targetId, {
        status: 'posted',
        posted_at: new Date().toISOString(),
        fb_post_url: fbPostUrl ?? null,
      });
      await trackEvent('extension.post_posted', { targetId, fbPostUrl }, 'campaign_target', targetId);
      if (sender.tab?.id) {
        await chrome.tabs.sendMessage(sender.tab.id, { type: 'STOP_WATCH' }).catch(() => null);
      }
      break;
    }
    case 'PUBLISH_TIMEOUT': {
      const targetId = msg.targetId as string;
      await updateTarget(targetId, {
        status: 'failed',
        error_code: 'no_publish_detected',
        error_message: 'Timeout — user did not click Publish in 90s',
      });
      await trackEvent('extension.post_failed', { targetId, code: 'no_publish_detected' }, 'campaign_target', targetId);
      break;
    }
    case 'LOGIN_REQUIRED': {
      const targetId = msg.targetId as string;
      await updateTarget(targetId, {
        status: 'failed',
        error_code: 'login_required',
        error_message: 'FB session expired',
      });
      await trackEvent('extension.login_required', { targetId }, 'campaign_target', targetId);
      // Pause wszystko
      const settings = await chrome.storage.local.get('settings');
      await chrome.storage.local.set({
        settings: { ...((settings.settings as object) ?? {}), paused: true },
      });
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'MapJob — wymagane logowanie',
        message: 'Twoja sesja Facebook wygasła. Zaloguj się ponownie, a postowanie wznowi się.',
      }).catch(() => null);
      break;
    }
    case 'CONTENT_READY':
      // ignore — informacyjne
      break;
  }
}
