/**
 * Variator — przed wklejeniem tekstu do konkretnej grupy FB,
 * generuje lekko różne wersje, żeby uniknąć duplikat-flag FB.
 *
 * Zasady: niewielkie zmiany (nie zmieniają sensu), deterministyczne dla danego seeda
 * (żeby ten sam target zawsze dostał ten sam wariant — replay-safe).
 */

const OPENING_VARIANTS = ['Hej!', 'Cześć!', 'Witam,', 'Hej grupa,', ''];

const CTA_SYNONYMS: Record<string, string[]> = {
  'napisz w wiadomości': ['napiszcie w DM', 'piszcie w wiadomości', 'DM do mnie'],
  'zostaw numer': ['zostawcie numer', 'wrzućcie numer', 'numer w komentarz'],
  'daj znać': ['dajcie znać', 'odzywajcie się', 'piszcie śmiało'],
  'pilnie': ['szybko', 'od zaraz', 'na już'],
  'kontakt': ['gadamy', 'odzywaj się', 'pisz'],
};

const HASHTAG_SHUFFLE_GROUPS = [
  ['#praca', '#pracaoferta', '#szukampracy'],
  ['#warszawa', '#wawa', '#warsaw'],
];

/**
 * Deterministyczny PRNG (mulberry32) — ten sam seed → ten sam wariant.
 */
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

export interface VariateOptions {
  /** Klucz seeda — najczęściej `${campaignId}:${groupId}`. */
  seed: string;
  /** Pominąć dodanie/zmianę powitania na początku. */
  skipOpening?: boolean;
}

export interface VariateResult {
  text: string;
  changes: string[];
}

export function variateForGroup(input: string, opts: VariateOptions): VariateResult {
  const rng = mulberry32(hashSeed(opts.seed));
  const changes: string[] = [];
  let out = input.trim();

  // 1. Opening swap
  if (!opts.skipOpening && rng() < 0.7) {
    const opening = OPENING_VARIANTS[Math.floor(rng() * OPENING_VARIANTS.length)] ?? '';
    // Usuń istniejące powitanie z pierwszej linii (jeśli pasuje do typowych)
    const firstLineCleaned = out.replace(/^(hej[!,]?|cze[śs]c[!,]?|witam[!,]?|dzie[nń]\s+dobry[!,]?)\s*/i, '');
    out = opening ? `${opening} ${firstLineCleaned}` : firstLineCleaned;
    changes.push(`opening:${opening || 'none'}`);
  }

  // 2. CTA synonimy
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

  // 3. Hashtag shuffle (jeśli post zawiera hashtagi z danej grupy, zamień losowo na inny z tej samej grupy)
  for (const group of HASHTAG_SHUFFLE_GROUPS) {
    for (const tag of group) {
      const re = new RegExp(tag.replace('#', '#'), 'i');
      if (re.test(out)) {
        const alternatives = group.filter((t) => t !== tag);
        const replacement = alternatives[Math.floor(rng() * alternatives.length)];
        if (replacement) {
          out = out.replace(re, replacement);
          changes.push(`hashtag:${tag}->${replacement}`);
        }
        break;
      }
    }
  }

  // 4. Drobna mikro-modyfikacja kropek/wykrzykników na końcu (10% szansy)
  if (rng() < 0.1) {
    out = out.replace(/\.\s*$/, '');
    changes.push('drop_trailing_dot');
  }

  return { text: out, changes };
}

/**
 * Hash zawartości — używany do wykrywania duplikatów w campaign_targets.
 */
export async function contentHash(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
