/**
 * fb-publish-detect — content script wykrywający kliknięcie "Publikuj" przez usera.
 * Strategia: MutationObserver na body szukający toastu z PL/EN ("opublikowano",
 * "udostępniono", "post shared") + zniknięcia dialogu composera.
 *
 * Po wykryciu → message do background {type: 'PUBLISH_DETECTED', fbPostUrl?}.
 */

const PUBLISH_KEYWORDS = [
  'opublikow', // opublikowano, opublikowano post
  'udost[eę]pnion',
  'post shared',
  'shared to',
  'post został',
  'twój post', // toast "Twój post został opublikowany"
];
const PUBLISH_RE = new RegExp(PUBLISH_KEYWORDS.join('|'), 'i');

let publishObserver: MutationObserver | null = null;
let dialogPresent = false;
let watchStartedAt = 0;
let currentTargetId: string | null = null;
const PUBLISH_TIMEOUT_MS = 90_000;

function detectLoginRequired(): boolean {
  return Boolean(
    document.querySelector('form[action*="/login/"]') ||
      document.querySelector('input[name="email"][id="email"]'),
  );
}

function findPossibleFbPostUrl(): string | undefined {
  // Po publikacji w group feed pojawia się link "Wyświetl post" lub anchor /posts/<id>
  const link = document.querySelector('a[href*="/posts/"]') as HTMLAnchorElement | null;
  return link?.href;
}

function stopWatch(): void {
  publishObserver?.disconnect();
  publishObserver = null;
  currentTargetId = null;
}

function startPublishWatch(targetId: string): void {
  if (publishObserver) stopWatch();
  watchStartedAt = Date.now();
  currentTargetId = targetId;

  publishObserver = new MutationObserver(() => {
    if (Date.now() - watchStartedAt > PUBLISH_TIMEOUT_MS) {
      chrome.runtime.sendMessage({
        type: 'PUBLISH_TIMEOUT',
        targetId,
      });
      stopWatch();
      return;
    }

    if (detectLoginRequired()) {
      chrome.runtime.sendMessage({ type: 'LOGIN_REQUIRED', targetId });
      stopWatch();
      return;
    }

    // 1. Szukaj toast aler
    const alerts = Array.from(document.querySelectorAll('[role="alert"], [role="status"]'));
    for (const a of alerts) {
      const txt = a.textContent ?? '';
      if (PUBLISH_RE.test(txt)) {
        const fbPostUrl = findPossibleFbPostUrl();
        chrome.runtime.sendMessage({
          type: 'PUBLISH_DETECTED',
          targetId,
          fbPostUrl,
          toastText: txt,
        });
        stopWatch();
        return;
      }
    }

    // 2. Wykrywanie zamknięcia dialogu composera (był otwarty, teraz nie ma)
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
      dialogPresent = true;
    } else if (dialogPresent) {
      // Dialog był, teraz znikł — prawdopodobnie post poszedł
      // Daj 1.5s na toast — jeśli nie pojawi się, raportuj "dialog_closed"
      setTimeout(() => {
        if (!publishObserver) return; // już rozwiązane
        const fbPostUrl = findPossibleFbPostUrl();
        chrome.runtime.sendMessage({
          type: 'PUBLISH_DETECTED',
          targetId,
          fbPostUrl,
          reason: 'dialog_closed',
        });
        stopWatch();
      }, 1500);
      dialogPresent = false;
    }
  });

  publishObserver.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'WATCH_PUBLISH' && msg.targetId) {
    startPublishWatch(msg.targetId);
    sendResponse({ ok: true });
    return false;
  }
  if (msg?.type === 'STOP_WATCH') {
    stopWatch();
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
