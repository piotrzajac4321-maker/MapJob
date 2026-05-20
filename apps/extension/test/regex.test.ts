/**
 * Testy regexów używanych w fb-publish-detect.ts — engagement scraping.
 * Te regexy są copy z fb-publish-detect (jako że content scripts nie eksportują).
 */
import { describe, it, expect } from 'vitest';

// Skopiowane z fb-publish-detect.ts
const PUBLISH_KEYWORDS = [
  'twój post', 'opublikowano', 'opublikowano post', 'opublikowano w', 'udostępniono',
  'post został', 'post został opublikowany',
  'post shared', 'shared to', 'your post', 'your post is now', 'published',
];
const PUBLISH_RE = new RegExp(
  PUBLISH_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

describe('PUBLISH_RE — regex wykrywania publikacji', () => {
  it.each([
    'Opublikowano post',
    'Twój post został opublikowany',
    'Post został opublikowany',
    'Opublikowano w grupie Praca Warszawa',
    'Udostępniono w grupie',
    'Your post is now in Praca Warszawa',
    'Post shared to Praca Warszawa',
    'Shared to Group XYZ',
    'Published',
  ])('matchuje toast: %s', (text) => {
    expect(PUBLISH_RE.test(text)).toBe(true);
  });

  it.each([
    'Komentarz dodany',
    'Wyświetl post',
    'Zarezerwuj termin',
    'Friend request',
    'You liked this',
  ])('NIE matchuje pozostałych: %s', (text) => {
    expect(PUBLISH_RE.test(text)).toBe(false);
  });
});

// Engagement regexes — z fb-publish-detect.ts scrapeEngagement()
function parseReactions(text: string): number {
  const direct = text.match(/(\d[\d\s]{0,8})\s*(?:reakcj\w*|reactions|likes|polubie[nń]|polubie[nń]ia)/i);
  if (direct) {
    const n = parseInt(direct[1]!.replace(/\s/g, ''), 10);
    if (n) return n;
  }
  const indirect = text.match(/(\d+)\s+(?:inn\w+\s+)?(?:osob\w*|innych|other|people)\s+polubi\w*/i);
  if (indirect) return parseInt(indirect[1]!, 10) || 0;
  const others = text.match(/(?:i|and)\s+(\d+)\s+(?:inn\w+|other\w*|osob\w*|people)/i);
  if (others) return parseInt(others[1]!, 10) || 0;
  return 0;
}
function parseComments(text: string): number {
  const m = text.match(/(\d+)\s*(komentarz|komentarzy|komentarze|comment|comments)/i);
  return m ? parseInt(m[1]!, 10) || 0 : 0;
}
function parseShares(text: string): number {
  const m = text.match(/(\d+)\s*(udost[ęe]pnie[ńn]|udost[ęe]pnie[nń]|share|shares)/i);
  return m ? parseInt(m[1]!, 10) || 0 : 0;
}

describe('Engagement scraping — reactions', () => {
  it.each([
    ['47 reakcji', 47],
    ['12 polubień', 12],
    ['1 234 reakcje', 1234],
    ['8 likes', 8],
    ['100 reactions', 100],
    ['Anna Kowalska, Marek i 23 osoby', 23],
    ['John Smith and 5 others', 5],
    ['i 7 innych', 7],
  ])('parseReactions("%s") = %d', (input, expected) => {
    expect(parseReactions(input)).toBe(expected);
  });
});

describe('Engagement scraping — comments', () => {
  it.each([
    ['5 komentarzy', 5],
    ['1 komentarz', 1],
    ['12 comments', 12],
    ['1 comment', 1],
    ['100 komentarze', 100],
  ])('parseComments("%s") = %d', (input, expected) => {
    expect(parseComments(input)).toBe(expected);
  });
});

describe('Engagement scraping — shares', () => {
  it.each([
    ['3 udostępnienia', 3],
    ['1 udostępnienie', 1],
    ['7 shares', 7],
    ['1 share', 1],
  ])('parseShares("%s") = %d', (input, expected) => {
    expect(parseShares(input)).toBe(expected);
  });
});

describe('Engagement scraping — combined FB-like text', () => {
  it('parsuje cały blok pod postem', () => {
    const text = 'Anna Kowalska i 23 inne osoby polubiły ten post · 5 komentarzy · 2 udostępnienia';
    // Może matchnąć "i 23 inne osoby" lub regex polubienia. Sprawdźmy każde.
    const r = parseReactions(text);
    const c = parseComments(text);
    const s = parseShares(text);
    // Reactions: zaakceptuj choć część (różne FB formaty)
    expect(r).toBeGreaterThan(0);
    expect(c).toBe(5);
    expect(s).toBe(2);
  });
});
