/**
 * fb-groups-scrape — content script aktywny na /groups/joins/ i /groups/feed/.
 * Czeka aż popup wyśle message {type: 'SCRAPE_GROUPS'}, scrolluje, parsuje karty grup,
 * zwraca listę do background → upsert do Supabase.
 */

import { querySelectorAllWithFallback, ACTIVE_SELECTORS } from './selectors/registry';

interface ScrapedGroup {
  fbGroupId: string;
  name: string;
  url: string;
  membersCount?: number;
}

function parseGroupCard(card: Element): ScrapedGroup | null {
  const href = (card as HTMLAnchorElement).href;
  const match = href.match(/\/groups\/(\d+)/);
  if (!match) return null;
  const fbGroupId = match[1] ?? '';
  if (!fbGroupId) return null;

  // Name: aria-label najczęściej najpewniejszy
  const ariaLabel = card.getAttribute('aria-label');
  let name = ariaLabel ?? '';
  if (!name) {
    const nameEl = card.querySelector('span[dir="auto"], div[dir="auto"]');
    name = nameEl?.textContent?.trim() ?? '';
  }
  if (!name) return null;

  // Members count z tekstu wewnątrz karty
  const cardText = card.textContent ?? '';
  const membersMatch = cardText.match(/(\d[\d\s ]*)\s*(tys|tysięcy|tysiące|tysiąc|k|members|członków|członkowie)/i);
  let membersCount: number | undefined;
  if (membersMatch && membersMatch[1]) {
    const raw = membersMatch[1].replace(/[\s ]/g, '');
    const num = parseInt(raw, 10);
    const isThousands = /tys|k(?!\w)/i.test(membersMatch[2] ?? '');
    membersCount = isNaN(num) ? undefined : isThousands ? num * 1000 : num;
  }

  return { fbGroupId, name, url: `https://www.facebook.com/groups/${fbGroupId}/`, membersCount };
}

async function scrollToBottom(maxScrolls = 80): Promise<void> {
  let lastHeight = 0;
  for (let i = 0; i < maxScrolls; i++) {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    const newHeight = document.body.scrollHeight;
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
  }
}

async function scrapeAll(): Promise<ScrapedGroup[]> {
  await scrollToBottom();

  const cards = querySelectorAllWithFallback(document, ACTIVE_SELECTORS.groupCard);
  const groups = new Map<string, ScrapedGroup>();

  for (const card of cards) {
    const g = parseGroupCard(card);
    if (g) groups.set(g.fbGroupId, g);
  }

  return Array.from(groups.values());
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'SCRAPE_GROUPS') {
    void scrapeAll().then((groups) => {
      sendResponse({ ok: true, groups });
    });
    return true; // keep channel open
  }
  return false;
});

// Sygnalizuj że content script się załadował (popup pokazuje status)
chrome.runtime.sendMessage({ type: 'CONTENT_READY', context: 'groups-list' }).catch(() => {});
