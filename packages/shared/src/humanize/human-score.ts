/**
 * Human-likeness score 0-100. Wyższy = bardziej "ludzki".
 * Heurystyka: pozytywne sygnały (konkrety, wariancja zdań, kolokwializmy, lokalność)
 * minus negatywne (zakazane frazy, equal length, brak konkretów).
 */

import { runAntiAiFilter } from './anti-ai-filter.js';

const COLLOQUIAL_TOKENS = [
  'no bo', 'no to', 'i tak', 'a propos', 'serio', 'mówię ci', 'gadamy', 'odzywaj', 'wjedź',
  'dej znać', 'daj znać', 'pisz', 'dzwoń', 'kogo masz', 'macie', 'spoko', 'ogarniem',
  'domknąć', 'rekru', 'cv-ka', 'cv-kę', 'lead', 'lid', 'krótko mówiąc', 'konkretnie',
  'tagnij', 'tagnijcie', 'dm', 'wiadomość', 'po sąsiedzku', 'u nas', 'tu w',
];

const INDUSTRY_JARGON_HR_SALES = [
  'kandydat', 'rekrutacja', 'stawka', 'premia', 'zlecenie', 'kontrakt', 'umowa', 'b2b',
  'uop', 'uz', 'zarobki', 'wynagrodzenie', 'cv', 'rozmowa', 'aplikacja', 'screening',
  'oferta', 'klient', 'sprzedaż', 'leady', 'domknąć', 'pipeline',
];

export interface HumanScoreBreakdown {
  score: number;
  signals: { name: string; value: number; weight: number }[];
}

export function computeHumanScore(text: string): HumanScoreBreakdown {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let score = 50; // baseline
  const signals: HumanScoreBreakdown['signals'] = [];

  // (+) Konkrety: liczby
  const numbers = (text.match(/\d+/g) ?? []).length;
  const numbersSignal = Math.min(15, numbers * 3);
  score += numbersSignal;
  signals.push({ name: 'numbers', value: numbers, weight: numbersSignal });

  // (+) Nazwy własne (dzielnice, miasta, ulice)
  const properNouns = (text.match(/(?<=[^.!?]\s|^)[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,}/g) ?? []).length;
  const properSignal = Math.min(10, properNouns * 2);
  score += properSignal;
  signals.push({ name: 'proper_nouns', value: properNouns, weight: properSignal });

  // (+) Wariancja długości zdań
  if (sentences.length >= 3) {
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const stddev = Math.sqrt(
      lengths.reduce((acc, n) => acc + (n - mean) ** 2, 0) / lengths.length,
    );
    const varianceSignal = Math.min(15, Math.round(stddev * 2));
    score += varianceSignal;
    signals.push({ name: 'sentence_variance', value: Number(stddev.toFixed(1)), weight: varianceSignal });

    // (+) Bonus za krótkie zdanie (≤5 słów)
    if (lengths.some((l) => l <= 5)) {
      score += 5;
      signals.push({ name: 'has_short_sentence', value: 1, weight: 5 });
    }
  }

  // (+) Kolokwializmy
  const collCount = COLLOQUIAL_TOKENS.filter((t) => lower.includes(t)).length;
  const collSignal = Math.min(15, collCount * 4);
  score += collSignal;
  signals.push({ name: 'colloquial_tokens', value: collCount, weight: collSignal });

  // (+) Branżowy żargon
  const jargonCount = INDUSTRY_JARGON_HR_SALES.filter((t) => lower.includes(t)).length;
  const jargonSignal = Math.min(8, jargonCount * 2);
  score += jargonSignal;
  signals.push({ name: 'industry_jargon', value: jargonCount, weight: jargonSignal });

  // (-) Anti-AI findings
  const aiReport = runAntiAiFilter(text);
  const blocks = aiReport.findings.filter((f) => f.severity === 'block').length;
  const warns = aiReport.findings.filter((f) => f.severity === 'warn').length;
  const penalty = blocks * 25 + warns * 8;
  score -= penalty;
  signals.push({ name: 'ai_penalty', value: -(blocks + warns), weight: -penalty });

  // (-) Za długi post (>900 znaków = ludzie przewijają)
  if (text.length > 900) {
    const lengthPenalty = Math.min(15, Math.round((text.length - 900) / 50));
    score -= lengthPenalty;
    signals.push({ name: 'too_long', value: text.length, weight: -lengthPenalty });
  }

  // (-) Za krótki (<50 znaków = nieskuteczny)
  if (text.length < 50 || wordCount < 10) {
    score -= 20;
    signals.push({ name: 'too_short', value: text.length, weight: -20 });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, signals };
}
