/**
 * fb-publish-detect — wykrywa publikację posta przez usera.
 * Strategia: MutationObserver na toast publikacji + zniknięcie composer dialogu.
 * Plus: wykrywa logout / wygasłą sesję FB.
 */

const PUBLISH_KEYWORDS = [
  'twój post', 'opublikowano', 'opublikowano post', 'opublikowano w', 'udostępniono',
  'post został', 'post został opublikowany',
  'post shared', 'shared to', 'your post', 'your post is now', 'published',
];

const PUBLISH_RE = new RegExp(PUBLISH_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

// Keywords wskazujące na blokadę / restriction / captcha FB.
// Po wykryciu → wysyłamy BLOCK_DETECTED do service-worker → kill switch 24h.
const BLOCK_KEYWORDS = [
  'security check', 'kontrola bezpieczeństwa', 'potwierdź swoją tożsamość', 'confirm your identity',
  'captcha', 'recaptcha',
  'temporarily blocked', 'tymczasowo zablokowany', 'tymczasowo zablokowane',
  'slow down', 'zwolnij tempo', 'you are posting too quickly', 'publikujesz zbyt szybko',
  'we limit how often', 'ograniczamy częstotliwość',
  'account restricted', 'konto ograniczone', 'this feature is currently blocked',
  'ta funkcja jest obecnie zablokowana', 'naruszenie standardów',
  'community standards', 'standardów społeczności',
];
const BLOCK_RE = new RegExp(
  BLOCK_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

function detectBlockOnPage(): { matched: boolean; keyword?: string } {
  // Skanuj tylko widoczny tekst (alerts + dialogs + main content)
  const containers = document.querySelectorAll('[role="alert"], [role="dialog"], [role="status"], main, [data-pagelet]');
  for (const el of Array.from(containers)) {
    const txt = (el.textContent ?? '').slice(0, 2000);
    const m = txt.match(BLOCK_RE);
    if (m) return { matched: true, keyword: m[0] };
  }
  return { matched: false };
}

const PUBLISH_TIMEOUT_MS = 120_000; // 2 minuty
let publishObserver: MutationObserver | null = null;
let dialogPresent = false;
let watchStartedAt = 0;
let _currentTargetId: string | null = null;

function detectLoginRequired(): boolean {
  if (location.href.includes('/login/')) return true;
  return Boolean(
    document.querySelector('form[action*="/login/"][action*="login"]') ||
      document.querySelector('input[name="email"][id="email"][type="text"]') ||
      document.querySelector('input[name="pass"][id="pass"][type="password"]'),
  );
}

function findFbPostUrl(): string | undefined {
  // Po publikacji w group feed pojawia się link "Wyświetl post" lub anchor /posts/<id>
  const links = Array.from(document.querySelectorAll('a[href*="/posts/"], a[href*="/permalink/"]')) as HTMLAnchorElement[];
  for (const a of links) {
    if (a.offsetParent !== null) return a.href.split('?')[0];
  }
  return undefined;
}

function stopWatch(): void {
  publishObserver?.disconnect();
  publishObserver = null;
  _currentTargetId = null;
  dialogPresent = false;
}

function startPublishWatch(targetId: string): void {
  if (publishObserver) stopWatch();
  watchStartedAt = Date.now();
  _currentTargetId = targetId;
  console.log('[MapJob detect] Start watch dla target', targetId);

  let resolved = false;

  publishObserver = new MutationObserver(() => {
    if (resolved) return;

    if (Date.now() - watchStartedAt > PUBLISH_TIMEOUT_MS) {
      console.log('[MapJob detect] Timeout');
      resolved = true;
      chrome.runtime.sendMessage({ type: 'PUBLISH_TIMEOUT', targetId });
      stopWatch();
      return;
    }

    if (detectLoginRequired()) {
      console.log('[MapJob detect] Login required');
      resolved = true;
      chrome.runtime.sendMessage({ type: 'LOGIN_REQUIRED', targetId });
      stopWatch();
      return;
    }

    // KILL SWITCH — FB pokazuje captcha / blokadę / restriction
    const block = detectBlockOnPage();
    if (block.matched) {
      console.error('[MapJob detect] 🚨 BLOCK DETECTED:', block.keyword);
      resolved = true;
      chrome.runtime.sendMessage({
        type: 'BLOCK_DETECTED',
        targetId,
        reason: 'fb_block_message',
        keyword: block.keyword,
      });
      stopWatch();
      return;
    }

    // 1. Toast aler/status
    const alerts = Array.from(document.querySelectorAll('[role="alert"], [role="status"], [data-testid*="toast"]'));
    for (const a of alerts) {
      const txt = (a.textContent ?? '').slice(0, 200);
      if (PUBLISH_RE.test(txt)) {
        console.log('[MapJob detect] Toast match:', txt);
        const fbPostUrl = findFbPostUrl();
        resolved = true;
        chrome.runtime.sendMessage({ type: 'PUBLISH_DETECTED', targetId, fbPostUrl, toastText: txt });
        stopWatch();
        return;
      }
    }

    // 2. Composer dialog closed
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog && (dialog as HTMLElement).offsetParent !== null) {
      dialogPresent = true;
    } else if (dialogPresent) {
      // Dialog był, teraz znikł — daj 1.5s na toast, potem oznacz jako posted
      setTimeout(() => {
        if (resolved || !publishObserver) return;
        const fbPostUrl = findFbPostUrl();
        console.log('[MapJob detect] Dialog closed bez toastu, oznaczam jako posted');
        resolved = true;
        chrome.runtime.sendMessage({ type: 'PUBLISH_DETECTED', targetId, fbPostUrl, reason: 'dialog_closed' });
        stopWatch();
      }, 1500);
      dialogPresent = false;
    }
  });

  publishObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
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
  if (msg?.type === 'SCRAPE_ENGAGEMENT' && msg.fbPostUrl) {
    void scrapeEngagement(msg.fbPostUrl).then((data) => {
      sendResponse({ ok: true, ...data });
    });
    return true; // async
  }
  return false;
});

/**
 * Re-scrape post engagement (reactions + comments + shares).
 * Działa gdy fb-publish-detect content script jest aktywny na stronie posta.
 */
async function scrapeEngagement(fbPostUrl: string): Promise<{ reactions: number; comments: number; shares: number }> {
  console.log('[MapJob detect] Scrape engagement dla', fbPostUrl);

  // Czekaj aż strona się załaduje
  await new Promise((r) => setTimeout(r, 2000));

  const text = document.body.textContent ?? '';

  // Reactions — wiele wariantów FB:
  //  • "47 reakcji" / "47 polubień" / "12 reactions" / "8 likes"
  //  • "Anna i 23 inne osoby polubiły" (FB tak pisze gdy >2 reakcji)
  //  • "John and 5 others"
  let reactions = 0;
  const direct = text.match(/(\d[\d\s]{0,8})\s*(?:reakcj\w*|reactions|likes|polubie[nń]|polubie[nń]ia)/i);
  if (direct) reactions = parseInt(direct[1]!.replace(/\s/g, ''), 10) || 0;
  if (reactions === 0) {
    // "X osób polubiło" lub "X inne osoby polubiły"
    const indirect = text.match(/(\d+)\s+(?:inn\w+\s+)?(?:osob\w*|innych|other|people)\s+polubi\w*/i);
    if (indirect) reactions = parseInt(indirect[1]!, 10) || 0;
  }
  if (reactions === 0) {
    const others = text.match(/(?:i|and)\s+(\d+)\s+(?:inn\w+|other\w*|osob\w*|people)/i);
    if (others) reactions = parseInt(others[1]!, 10) || 0;
  }

  // Comments
  let comments = 0;
  const cMatch = text.match(/(\d+)\s*(komentarz|komentarzy|komentarze|comment|comments)/i);
  if (cMatch) comments = parseInt(cMatch[1]!, 10) || 0;

  // Shares
  let shares = 0;
  const sMatch = text.match(/(\d+)\s*(udost[ęe]pnie[ńn]|udost[ęe]pnie[nń]|share|shares)/i);
  if (sMatch) shares = parseInt(sMatch[1]!, 10) || 0;

  console.log('[MapJob detect] Engagement:', { reactions, comments, shares });
  return { reactions, comments, shares };
}

console.log('[MapJob detect] Detect script gotowy na', location.href);
