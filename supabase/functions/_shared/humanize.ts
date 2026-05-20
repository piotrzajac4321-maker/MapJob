// Skopiowane z packages/shared/src/humanize/* (self-contained dla Edge Function).

export interface AntiAiFinding {
  code: string;
  severity: 'block' | 'warn';
  message: string;
}

export interface AntiAiReport {
  findings: AntiAiFinding[];
  blocked: boolean;
  cleanedText: string;
}

const BANNED_PHRASES: { phrase: RegExp; code: string; message: string }[] = [
  { phrase: /w\s+dzisiejszym\s+(dynamicznie\s+)?(zmieniaj[ąa]cym\s+si[eę]\s+)?[sś]wiecie/i, code: 'cliche_modern_world', message: '"W dzisiejszym świecie"' },
  { phrase: /w\s+(erze|dobie)\s+(cyfrow|internetu|technologii)/i, code: 'cliche_digital_era', message: '"W erze cyfrowej"' },
  { phrase: /\bwarto\s+pami[ęe]ta[ćc]\b/i, code: 'cliche_worth_remembering', message: '"Warto pamiętać"' },
  { phrase: /\bpodsumowuj[ąa]c\b/i, code: 'cliche_summarizing', message: '"Podsumowując"' },
  { phrase: /\breasumuj[ąa]c\b/i, code: 'cliche_resumming', message: '"Reasumując"' },
  { phrase: /\bz\s+pewno[śs]ci[ąa]\b/i, code: 'cliche_for_sure', message: '"Z pewnością"' },
  { phrase: /\bniew[ąa]tpliwie\b/i, code: 'cliche_undoubtedly', message: '"Niewątpliwie"' },
  { phrase: /\bsynergi(czn|i)/i, code: 'cliche_synergy', message: 'Synergia' },
  { phrase: /\bholistyczn/i, code: 'cliche_holistic', message: 'Holistyczny' },
  { phrase: /\bkompleksowe\s+rozwi[ąa]zani/i, code: 'cliche_comprehensive', message: 'Kompleksowe rozwiązanie' },
  { phrase: /\bzapraszamy\s+do\s+wsp[óo][łl]pracy\b/i, code: 'cliche_invite_cooperation', message: 'Zapraszamy do współpracy' },
  { phrase: /\bz\s+dum[ąa]\s+prezentujemy\b/i, code: 'cliche_proudly_present', message: 'Z dumą prezentujemy' },
  { phrase: /\bmamy\s+przyjemno[śs][ćc]\b/i, code: 'cliche_have_pleasure', message: 'Mamy przyjemność' },
  { phrase: /\brewolucyjn/i, code: 'cliche_revolutionary', message: 'Rewolucyjny' },
  { phrase: /\binnowacyjn/i, code: 'cliche_innovative', message: 'Innowacyjny' },
  { phrase: /\blider(em|a)?\s+(na\s+)?rynk/i, code: 'cliche_market_leader', message: 'Lider rynku' },
  { phrase: /\bprofesjonaln[ąa]?\s+obs[łl]ug/i, code: 'cliche_professional_service', message: 'Profesjonalna obsługa' },
  { phrase: /\bindywidualne\s+podej[śs]ci/i, code: 'cliche_individual_approach', message: 'Indywidualne podejście' },
  { phrase: /\bnajwy[żz]szej?\s+jako[śs]ci\b/i, code: 'cliche_highest_quality', message: 'Najwyższa jakość' },
];

const EM_DASH_RE = /—/g;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function runAntiAiFilter(text: string): AntiAiReport {
  const findings: AntiAiFinding[] = [];
  let cleaned = text;

  for (const rule of BANNED_PHRASES) {
    if (rule.phrase.test(text)) {
      findings.push({ code: rule.code, severity: 'block', message: rule.message });
    }
  }

  if (EM_DASH_RE.test(text)) {
    cleaned = cleaned.replace(EM_DASH_RE, ' - ');
    findings.push({ code: 'em_dash', severity: 'warn', message: 'Em-dashes zamienione na zwykłe myślniki.' });
  }

  const emojiCount = (text.match(EMOJI_RE) ?? []).length;
  if (emojiCount > 2) {
    findings.push({ code: 'emoji_spam', severity: 'block', message: `Za dużo emoji (${emojiCount}).` });
  }

  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  if (lengths.length >= 4) {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const stddev = Math.sqrt(lengths.reduce((acc, n) => acc + (n - mean) ** 2, 0) / lengths.length);
    if (stddev < 3) {
      findings.push({
        code: 'too_uniform_sentences',
        severity: 'warn',
        message: `Wszystkie zdania ~${mean.toFixed(0)} słów (σ=${stddev.toFixed(1)}).`,
      });
    }
  }

  const hasNumber = /\d/.test(text);
  const hasProperNoun = /(?<=[^.!?]\s)[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/.test(text);
  if (!hasNumber && !hasProperNoun) {
    findings.push({ code: 'too_generic', severity: 'warn', message: 'Zero konkretów (brak liczb i nazw własnych).' });
  }

  if (/[A-ZĄĆĘŁŃÓŚŹŻ]{20,}/.test(text)) {
    findings.push({ code: 'caps_lock', severity: 'block', message: 'Caps lock w treści.' });
  }

  if ((text.match(/\baby\s+\w+ć\b/gi) ?? []).length >= 2) {
    findings.push({ code: 'aby_inf_repetition', severity: 'warn', message: '"Aby + bezokolicznik" wielokrotnie.' });
  }

  const blocked = findings.some((f) => f.severity === 'block');
  return { findings, blocked, cleanedText: cleaned };
}

const COLLOQUIAL_TOKENS = [
  'no bo', 'no to', 'i tak', 'serio', 'odzywaj', 'wjedź', 'daj znać', 'pisz',
  'dzwoń', 'macie', 'spoko', 'domknąć', 'rekru', 'cv-k', 'lead', 'krótko mówiąc',
  'konkretnie', 'tagnij', 'tagnijcie', 'dm', 'po sąsiedzku', 'u nas', 'tu w',
];

const INDUSTRY_JARGON = [
  'kandydat', 'rekrutacja', 'stawka', 'premia', 'zlecenie', 'kontrakt', 'umowa', 'b2b',
  'cv', 'rozmowa', 'aplikacja', 'screening', 'oferta', 'klient', 'sprzedaż', 'pipeline',
];

export function computeHumanScore(text: string): number {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

  let score = 50;

  const numbers = (text.match(/\d+/g) ?? []).length;
  score += Math.min(15, numbers * 3);

  const properNouns = (text.match(/(?<=[^.!?]\s|^)[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{3,}/g) ?? []).length;
  score += Math.min(10, properNouns * 2);

  if (sentences.length >= 3) {
    const lens = sentences.map((s) => s.split(/\s+/).length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const stddev = Math.sqrt(lens.reduce((acc, n) => acc + (n - mean) ** 2, 0) / lens.length);
    score += Math.min(15, Math.round(stddev * 2));
    if (lens.some((l) => l <= 5)) score += 5;
  }

  score += Math.min(15, COLLOQUIAL_TOKENS.filter((t) => lower.includes(t)).length * 4);
  score += Math.min(8, INDUSTRY_JARGON.filter((t) => lower.includes(t)).length * 2);

  const ai = runAntiAiFilter(text);
  const blocks = ai.findings.filter((f) => f.severity === 'block').length;
  const warns = ai.findings.filter((f) => f.severity === 'warn').length;
  score -= blocks * 25 + warns * 8;

  if (text.length > 900) score -= Math.min(15, Math.round((text.length - 900) / 50));
  if (text.length < 50 || wordCount < 10) score -= 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}
