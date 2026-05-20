/**
 * Scraping listy grup z facebook.com/groups/joins/ albo /groups/feed/.
 * Działa po przesłaniu {type:'SCRAPE_GROUPS'} z popup.
 * Strategia: stabilne ankry zamiast klas (klasy FB są zmienne x1abc_xyz),
 * auto-scroll przez 60-120s, batch upsert do chrome.storage.
 */

interface ScrapedGroup {
  fbGroupId: string;
  name: string;
  url: string;
  membersCount?: number;
  privacy?: 'public' | 'private' | 'unknown';
}

function parseMembersFromText(text: string): number | undefined {
  // "47 tys. członków" / "1,2 mln członków" / "234 members"
  const m1 = text.match(/(\d[\d\s.,]*)\s*(tys|tysięcy|k|tysiąc)/i);
  if (m1) {
    const n = parseFloat(m1[1]!.replace(/[\s,]/g, '.').replace(/\./g, (_, i, s) => i === s.length - 4 ? '.' : ''));
    return Math.round(n * 1000);
  }
  const m2 = text.match(/(\d[\d\s.,]*)\s*(mln|mln\.|million)/i);
  if (m2) {
    const n = parseFloat(m2[1]!.replace(/[\s,]/g, '.'));
    return Math.round(n * 1_000_000);
  }
  const m3 = text.match(/(\d[\d\s,]{2,})\s*(członków|members|member)/i);
  if (m3) {
    const n = parseInt(m3[1]!.replace(/[\s,]/g, ''), 10);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function parseGroupCard(card: Element): ScrapedGroup | null {
  const anchor = card.tagName === 'A' ? (card as HTMLAnchorElement) : card.querySelector('a[href*="/groups/"]');
  if (!anchor) return null;
  const href = (anchor as HTMLAnchorElement).href;
  const match = href.match(/\/groups\/(\d+)/);
  if (!match || !match[1]) return null;
  const fbGroupId = match[1];

  // Nazwa: aria-label albo pierwszy widoczny span z tekstem
  let name = '';
  const al = (anchor as HTMLElement).getAttribute('aria-label');
  if (al && al.length > 2 && !/^\d+$/.test(al)) name = al;
  if (!name) {
    const spans = card.querySelectorAll('span, div[dir="auto"]');
    for (const s of spans) {
      const t = s.textContent?.trim() ?? '';
      if (t.length > 2 && t.length < 200 && !/^\d+\s*(tys|członków|members|·)/.test(t) && t.indexOf('@') === -1) {
        name = t;
        break;
      }
    }
  }
  if (!name) return null;

  const text = card.textContent ?? '';
  const membersCount = parseMembersFromText(text);
  const privacy: 'public' | 'private' | 'unknown' =
    /publiczn|public/i.test(text) ? 'public' : /prywatn|private/i.test(text) ? 'private' : 'unknown';

  return {
    fbGroupId,
    name,
    url: `https://www.facebook.com/groups/${fbGroupId}/`,
    membersCount,
    privacy,
  };
}

async function autoScroll(maxScrolls = 100): Promise<void> {
  let stableCount = 0;
  let lastHeight = 0;
  for (let i = 0; i < maxScrolls && stableCount < 4; i++) {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
    const h = document.documentElement.scrollHeight;
    if (h === lastHeight) stableCount++;
    else stableCount = 0;
    lastHeight = h;
  }
  window.scrollTo(0, 0);
}

async function scrapeAll(): Promise<ScrapedGroup[]> {
  console.log('[MapJob] Rozpoczynam scraping grup...');
  await autoScroll();

  const groups = new Map<string, ScrapedGroup>();

  // Wszystkie anchor-i z /groups/<id>/
  const anchors = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
  console.log(`[MapJob] Znaleziono ${anchors.length} potencjalnych ankrów grup`);

  for (const a of anchors) {
    const href = (a as HTMLAnchorElement).href;
    // Filter out non-group-page links (events, posts itp.)
    if (/\/groups\/\d+\/(posts|events|media|files|guides|search|members|admin)/.test(href)) continue;
    if (!/\/groups\/\d+\/?(\?|$)/.test(href)) continue;

    // Wez najbardziej "outer" container (card)
    let card: Element = a;
    let parent = a.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      // Jeśli parent zawiera tekst dłuższy niż samo a, prawdopodobnie jest card-em
      if ((parent.textContent ?? '').length > (card.textContent ?? '').length * 1.5) {
        card = parent;
      }
      parent = parent.parentElement;
      depth++;
    }

    const g = parseGroupCard(card);
    if (g && !groups.has(g.fbGroupId)) {
      groups.set(g.fbGroupId, g);
    }
  }

  console.log(`[MapJob] Zescrapowano ${groups.size} unikalnych grup`);
  return Array.from(groups.values());
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'SCRAPE_GROUPS') {
    void scrapeAll().then((groups) => {
      sendResponse({ ok: true, groups, count: groups.length });
    }).catch((err) => {
      console.error('[MapJob] Scrape error:', err);
      sendResponse({ ok: false, error: String(err) });
    });
    return true; // keep channel open for async
  }
  return false;
});

// Ping
chrome.runtime.sendMessage({ type: 'CONTENT_READY', page: 'groups-list' }).catch(() => {});
console.log('[MapJob] Content script załadowany na', location.href);
