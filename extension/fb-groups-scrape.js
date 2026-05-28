console.log('[MapJob] Content script załadowany na', location.href);

const GROUP_ID_RE = /\/groups\/([^/?#]+)/;
const EXCLUDED_IDS = new Set([
  'joins', 'feed', 'discover', 'create', 'search', 'mygroups',
  'browse', 'category', 'invites', 'requests'
]);

function collectIntoMap(groups) {
  for (const a of document.querySelectorAll('a[href*="/groups/"]')) {
    const href = a.getAttribute('href') || '';
    const m = href.match(GROUP_ID_RE);
    if (!m) continue;
    const id = m[1];
    if (EXCLUDED_IDS.has(id)) continue;
    if (/^\d+$/.test(id) && id.length < 5) continue;

    const raw = (a.innerText || a.getAttribute('aria-label') || '').trim();
    if (!raw) continue;
    const name = raw.split('\n')[0].trim();
    if (!name || name.length < 2) continue;

    const existing = groups.get(id);
    if (!existing || existing.name.length < name.length) {
      groups.set(id, {
        id,
        name,
        url: `https://www.facebook.com/groups/${id}/`
      });
    }
  }
}

async function scrapeWithScroll({ idleRounds = 6, delayMs = 1500, maxRounds = 400 } = {}, onProgress) {
  const scroller = document.scrollingElement || document.documentElement;
  const groups = new Map();

  collectIntoMap(groups);
  onProgress?.({ count: groups.size, rounds: 0 });

  let lastSize = groups.size;
  let lastHeight = scroller.scrollHeight;
  let idle = 0;
  let rounds = 0;

  while (idle < idleRounds && rounds < maxRounds) {
    scroller.scrollTo(0, scroller.scrollHeight);
    window.dispatchEvent(new Event('scroll'));
    await new Promise(r => setTimeout(r, delayMs));
    collectIntoMap(groups);

    const h = scroller.scrollHeight;
    if (h === lastHeight && groups.size === lastSize) {
      idle++;
    } else {
      idle = 0;
      lastHeight = h;
      lastSize = groups.size;
    }
    rounds++;
    onProgress?.({ count: groups.size, rounds });
  }

  scroller.scrollTo(0, 0);
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== 'MAPJOB_SCRAPE_GROUPS') return;

  (async () => {
    try {
      const groups = await scrapeWithScroll(
        { idleRounds: msg.idleRounds, delayMs: msg.delayMs },
        (p) => {
          try {
            chrome.runtime.sendMessage({ type: 'MAPJOB_PROGRESS', ...p });
          } catch (_) {}
        }
      );
      sendResponse({ ok: true, groups });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message || e) });
    }
  })();

  return true;
});
