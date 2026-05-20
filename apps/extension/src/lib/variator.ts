/**
 * Variator per-grupa — kopia z packages/shared/src/humanize/variator.ts.
 * Cel: lekka wariancja per (campaign, group) żeby FB nie flagował duplikatów.
 */

const OPENING_VARIANTS = ['Hej!', 'Cześć!', 'Witam,', 'Hej grupa,', ''];

const CTA_SYNONYMS: Record<string, string[]> = {
  'napisz w wiadomości': ['napiszcie w DM', 'piszcie w wiadomości', 'DM do mnie'],
  'zostaw numer': ['zostawcie numer', 'wrzućcie numer', 'numer w komentarz'],
  'daj znać': ['dajcie znać', 'odzywajcie się', 'piszcie śmiało'],
  pilnie: ['szybko', 'od zaraz', 'na już'],
  kontakt: ['gadamy', 'odzywaj się', 'pisz'],
};

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function variateForGroup(input: string, seed: string): { text: string; changes: string[] } {
  const rng = mulberry32(hashSeed(seed));
  const changes: string[] = [];
  let out = input.trim();

  if (rng() < 0.7) {
    const opening = OPENING_VARIANTS[Math.floor(rng() * OPENING_VARIANTS.length)] ?? '';
    out = out.replace(/^(hej[!,]?|cze[śs]c[!,]?|witam[!,]?|dzie[nń]\s+dobry[!,]?)\s*/i, '');
    if (opening) out = `${opening} ${out}`;
    changes.push(`opening:${opening || 'none'}`);
  }

  for (const [base, syns] of Object.entries(CTA_SYNONYMS)) {
    const re = new RegExp(`\\b${base}\\b`, 'i');
    if (re.test(out)) {
      const syn = syns[Math.floor(rng() * syns.length)];
      if (syn) {
        out = out.replace(re, syn);
        changes.push(`syn:${base}->${syn}`);
      }
    }
  }

  return { text: out, changes };
}
