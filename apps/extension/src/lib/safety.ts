/**
 * Anti-ban safety — PRIORYTET #1.
 *
 * Facebook agresywnie banuje automatyzację. Ten moduł chroni przed:
 * 1. Zbyt szybkim tempem (limity dzienne + delays)
 * 2. Postowaniem w nocy gdy ludzie śpią (sleep hours)
 * 3. Detekcją captcha/blokady → kill switch
 * 4. Identycznymi treściami (variator)
 * 5. Postowaniem zaraz po dołączeniu (cooldown nowych grup)
 * 6. Zbyt regularnymi wzorcami (random jitter w distribution)
 */

export type SafetyMode = 'safe' | 'standard' | 'aggressive';

export interface SafetyPreset {
  id: SafetyMode;
  name: string;
  description: string;
  warning?: string;
  globalDailyCap: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  defaultCooldownMinutes: number;
  defaultGroupDailyCap: number;
}

/**
 * Domyślne presety — testowane empirycznie. SAFE jest naszym defaultem.
 */
export const SAFETY_PRESETS: Record<SafetyMode, SafetyPreset> = {
  safe: {
    id: 'safe',
    name: '🟢 Bezpieczny',
    description: 'Defensywny — minimalne ryzyko bana. Polecane dla nowych kont i kont z ostrzeżeniami.',
    globalDailyCap: 10,            // ~10 postów/dzień max
    minDelaySeconds: 240,          // min 4 minuty między postami
    maxDelaySeconds: 900,          // max 15 minut
    defaultCooldownMinutes: 360,   // 6h pomiędzy postami w tej samej grupie
    defaultGroupDailyCap: 1,       // 1 post/grupa/dzień
  },
  standard: {
    id: 'standard',
    name: '🟡 Standardowy',
    description: 'Zrównoważone tempo — najlepsze proporcje skuteczność/ryzyko. Polecane dla większości kont.',
    globalDailyCap: 25,
    minDelaySeconds: 120,          // 2 minuty
    maxDelaySeconds: 480,          // 8 minut
    defaultCooldownMinutes: 240,   // 4h
    defaultGroupDailyCap: 2,
  },
  aggressive: {
    id: 'aggressive',
    name: '🔴 Agresywny',
    description: 'Wysokie tempo — TYLKO dla starych zaufanych kont bez wcześniejszych ostrzeżeń.',
    warning: '⚠ Ryzyko bana lub ograniczenia konta. NIE używaj na nowych kontach (<6 miesięcy).',
    globalDailyCap: 50,
    minDelaySeconds: 60,           // 1 minuta
    maxDelaySeconds: 240,          // 4 minuty
    defaultCooldownMinutes: 120,   // 2h
    defaultGroupDailyCap: 3,
  },
};

export interface SleepHours {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number;   // 0-23 — jeśli endHour < startHour to overnight
}

export const DEFAULT_SLEEP_HOURS: SleepHours = {
  enabled: true,
  startHour: 22, // od 22:00
  endHour: 8,    // do 8:00
};

/**
 * Sprawdza czy obecna godzina jest w "sleep window" — wtedy NIE postuj.
 */
export function isInSleepHours(sleep: SleepHours, now = new Date()): boolean {
  if (!sleep.enabled) return false;
  const h = now.getHours();
  if (sleep.startHour === sleep.endHour) return false;
  if (sleep.startHour < sleep.endHour) {
    // np. 12-15
    return h >= sleep.startHour && h < sleep.endHour;
  } else {
    // overnight, np. 22-8
    return h >= sleep.startHour || h < sleep.endHour;
  }
}

/**
 * Słowa kluczowe wskazujące że FB nam zwrócił captcha / blokadę / restriction.
 * Skanujemy DOM tych keywordów — jeśli znajdziemy → KILL SWITCH.
 */
export const BLOCK_KEYWORDS = [
  // Captcha / security check
  'security check', 'kontrola bezpieczeństwa', 'potwierdź swoją tożsamość',
  'confirm your identity', 'captcha', 'recaptcha',
  // Rate limit / temp block
  'temporarily blocked', 'tymczasowo zablokowany', 'tymczasowo zablokowane',
  'slow down', 'zwolnij', 'zwolnij tempo',
  'you are posting too quickly', 'publikujesz zbyt szybko',
  'we limit how often you can post', 'ograniczamy częstotliwość',
  // Account restrictions
  'account restricted', 'konto ograniczone', 'this feature is currently blocked',
  'ta funkcja jest obecnie zablokowana', 'naruszenie standardów',
  'community standards', 'standardów społeczności',
  // Login required (osobny kill switch)
  'log in to facebook', 'zaloguj się do facebooka',
];

const BLOCK_RE = new RegExp(
  BLOCK_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i',
);

/**
 * Sprawdza czy tekst zawiera sygnał blokady FB.
 */
export function detectBlockSignal(text: string): { blocked: boolean; matchedKeyword?: string } {
  const m = text.match(BLOCK_RE);
  if (!m) return { blocked: false };
  return { blocked: true, matchedKeyword: m[0] };
}

/**
 * Losowy delay z poissonowskim rozkładem (bardziej naturalny niż uniform).
 * Średni ≈ (min + max) / 2, ale czasem dużo krótszy lub dłuższy.
 */
export function humanizeDelay(minSec: number, maxSec: number): number {
  // Box-Muller dla normalnego rozkładu, potem clamp
  const u1 = Math.max(1e-6, Math.random());
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const center = (minSec + maxSec) / 2;
  const stdDev = (maxSec - minSec) / 4;
  const sampled = center + z * stdDev;
  return Math.max(minSec, Math.min(maxSec, Math.round(sampled)));
}

/**
 * Random "thinking" delay przy interakcji z UI (np. zanim user kliknie Publikuj).
 * 5-25 sekund — symuluje czytanie + edycję.
 */
export function thinkingDelay(): number {
  return 5_000 + Math.floor(Math.random() * 20_000);
}

export interface SafetyState {
  killSwitch: boolean;
  killSwitchReason?: string;
  killSwitchAt?: number;
  consecutiveFailures: number;
}

export const DEFAULT_SAFETY_STATE: SafetyState = {
  killSwitch: false,
  consecutiveFailures: 0,
};

/**
 * Po N consecutive failures w grupie — auto-disable tej grupy.
 */
export const MAX_CONSECUTIVE_GROUP_FAILURES = 3;

/**
 * Po N consecutive failures GLOBALNYCH (różne grupy) — kill switch całego systemu.
 */
export const MAX_CONSECUTIVE_GLOBAL_FAILURES = 5;

/**
 * Po wykryciu blokady FB — auto-pauza na 24h (kill switch).
 * User musi ręcznie wznowić ze świadomością ryzyka.
 */
export const BLOCK_PAUSE_HOURS = 24;
