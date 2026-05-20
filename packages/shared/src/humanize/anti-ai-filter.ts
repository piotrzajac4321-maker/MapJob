/**
 * Anti-AI filter — wykrywa charakterystyczne ślady wygenerowane przez LLM.
 * Używane w Edge Function ai-generate: jeśli post fails → regenerate (max 2x).
 */

export interface AntiAiFinding {
  code: string;
  severity: 'block' | 'warn';
  message: string;
  hint?: string;
}

export interface AntiAiReport {
  findings: AntiAiFinding[];
  blocked: boolean;
  cleanedText: string;
}

const BANNED_PHRASES: { phrase: RegExp; code: string; message: string }[] = [
  { phrase: /w\s+dzisiejszym\s+(dynamicznie\s+)?(zmieniaj[ąa]cym\s+si[eę]\s+)?[sś]wiecie/i, code: 'cliche_modern_world', message: '"W dzisiejszym świecie" — typowy AI-wypełniacz.' },
  { phrase: /w\s+(erze|dobie)\s+(cyfrow|internetu|technologii)/i, code: 'cliche_digital_era', message: '"W erze cyfrowej" — wypełniacz AI.' },
  { phrase: /\bwarto\s+pami[ęe]ta[ćc]\b/i, code: 'cliche_worth_remembering', message: '"Warto pamiętać" — AI-tell.' },
  { phrase: /\bpodsumowuj[ąa]c\b/i, code: 'cliche_summarizing', message: '"Podsumowując" — AI-tell.' },
  { phrase: /\breasumuj[ąa]c\b/i, code: 'cliche_resumming', message: '"Reasumując" — AI-tell.' },
  { phrase: /\bz\s+pewno[śs]ci[ąa]\b/i, code: 'cliche_for_sure', message: '"Z pewnością" — AI-tell.' },
  { phrase: /\bniew[ąa]tpliwie\b/i, code: 'cliche_undoubtedly', message: '"Niewątpliwie" — AI-tell.' },
  { phrase: /\bsynergi(czn|i)/i, code: 'cliche_synergy', message: '"Synergia/synergiczny" — korpomowa AI.' },
  { phrase: /\bholistyczn/i, code: 'cliche_holistic', message: '"Holistyczny" — korpomowa AI.' },
  { phrase: /\bkompleksowe\s+rozwi[ąa]zani/i, code: 'cliche_comprehensive', message: '"Kompleksowe rozwiązanie" — pusta fraza AI.' },
  { phrase: /\bzapraszamy\s+do\s+wsp[óo][łl]pracy\b/i, code: 'cliche_invite_cooperation', message: '"Zapraszamy do współpracy" — zero CTA, korpo.' },
  { phrase: /\bz\s+dum[ąa]\s+prezentujemy\b/i, code: 'cliche_proudly_present', message: '"Z dumą prezentujemy" — korpo-AI.' },
  { phrase: /\bmamy\s+przyjemno[śs][ćc]\b/i, code: 'cliche_have_pleasure', message: '"Mamy przyjemność" — korpomowa.' },
  { phrase: /\brewolucyjn/i, code: 'cliche_revolutionary', message: '"Rewolucyjny" — pusty przymiotnik bez dowodu.' },
  { phrase: /\binnowacyjn/i, code: 'cliche_innovative', message: '"Innowacyjny" — pusty przymiotnik.' },
  { phrase: /\blider(em|a)?\s+(na\s+)?rynk/i, code: 'cliche_market_leader', message: '"Lider rynku" — bez dowodu = AI-tell.' },
  { phrase: /\bprofesjonaln[ąa]?\s+obs[łl]ug/i, code: 'cliche_professional_service', message: '"Profesjonalna obsługa" — pusta fraza.' },
  { phrase: /\bindywidualne\s+podej[śs]ci/i, code: 'cliche_individual_approach', message: '"Indywidualne podejście" — pusta fraza.' },
  { phrase: /\bnajwy[żz]szej?\s+jako[śs]ci\b/i, code: 'cliche_highest_quality', message: '"Najwyższa jakość" — bez liczb = AI.' },
];

/** Em-dashes (—) — bardzo silny ślad AI w polskim tekście. */
const EM_DASH_RE = /—/g;
/** Sekwencje 3+ emoji = spam/AI. */
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function runAntiAiFilter(text: string): AntiAiReport {
  const findings: AntiAiFinding[] = [];
  let cleaned = text;

  // 1. Zakazane frazy → BLOCK
  for (const rule of BANNED_PHRASES) {
    if (rule.phrase.test(text)) {
      findings.push({
        code: rule.code,
        severity: 'block',
        message: rule.message,
        hint: 'Usuń tę frazę i napisz konkretem.',
      });
    }
  }

  // 2. Em-dashes — autocorrect + warn
  const emDashCount = (text.match(EM_DASH_RE) ?? []).length;
  if (emDashCount > 0) {
    cleaned = cleaned.replace(EM_DASH_RE, ' - ');
    findings.push({
      code: 'em_dash',
      severity: 'warn',
      message: `Wykryto ${emDashCount}× em-dash (—) — typowy ślad AI na PL. Zamieniono na zwykłe myślniki.`,
    });
  }

  // 3. Emoji-spam (>2 emoji)
  const emojiCount = (text.match(EMOJI_RE) ?? []).length;
  if (emojiCount > 2) {
    findings.push({
      code: 'emoji_spam',
      severity: 'block',
      message: `Za dużo emoji (${emojiCount}). Limit 2 na post.`,
    });
  }

  // 4. Zdania o równej długości (>=4 zdania, stddev <5 słów)
  const sentenceLengths = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.split(/\s+/).length);
  if (sentenceLengths.length >= 4) {
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance =
      sentenceLengths.reduce((acc, n) => acc + (n - mean) ** 2, 0) / sentenceLengths.length;
    const stddev = Math.sqrt(variance);
    if (stddev < 3) {
      findings.push({
        code: 'too_uniform_sentences',
        severity: 'warn',
        message: `Wszystkie zdania mają podobną długość (~${mean.toFixed(0)} słów, σ=${stddev.toFixed(1)}). Człowiek miesza krótkie i długie.`,
        hint: 'Dodaj 1-2 krótkie zdania (3-5 słów).',
      });
    }
  }

  // 5. Brak konkretu (zero liczb, zero nazw własnych z dużej litery wewnątrz zdania)
  const hasNumber = /\d/.test(text);
  const hasProperNoun = /(?<=[^.!?]\s)[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/.test(text);
  if (!hasNumber && !hasProperNoun) {
    findings.push({
      code: 'too_generic',
      severity: 'warn',
      message: 'Zero konkretów: brak liczb i brak nazw własnych (miasto, firma, ulica).',
      hint: 'Dodaj kwotę, dzielnicę, godziny lub konkretną liczbę.',
    });
  }

  // 6. Caps lock w linii (>=20 znaków same wielkie litery)
  if (/[A-ZĄĆĘŁŃÓŚŹŻ]{20,}/.test(text)) {
    findings.push({
      code: 'caps_lock',
      severity: 'block',
      message: 'Caps lock w treści — Facebook obniża zasięg, wygląda jak krzyk/AI.',
    });
  }

  // 7. "Aby + bezokolicznik" jako standardowy łącznik (typowy AI tell PL)
  if ((text.match(/\baby\s+\w+ć\b/gi) ?? []).length >= 2) {
    findings.push({
      code: 'aby_inf_repetition',
      severity: 'warn',
      message: 'Wielokrotne "Aby + bezokolicznik" — typowy ślad sztywnego AI po polsku.',
      hint: 'Zamień przynajmniej jeden na pytanie lub tryb rozkazujący.',
    });
  }

  const blocked = findings.some((f) => f.severity === 'block');
  return { findings, blocked, cleanedText: cleaned };
}
