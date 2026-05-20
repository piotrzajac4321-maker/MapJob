/**
 * Lokalny generator postów — bez LLM. Deterministic template engine.
 * Bierze framework + hook + dane → tekst.
 */

export type FrameworkType = 'aida' | 'pas' | 'bab' | 'list';

export interface FrameworkDef {
  id: FrameworkType;
  name: string;
  desc: string;
  fields: { id: string; label: string; placeholder: string; rows?: number }[];
}

export const FRAMEWORKS: Record<FrameworkType, FrameworkDef> = {
  aida: {
    id: 'aida',
    name: 'AIDA',
    desc: 'Attention → Interest → Desire → Action. Klasyczna, dla świadomości i ofert.',
    fields: [
      { id: 'hook', label: 'Hook (≤8 słów)', placeholder: 'Szukasz pracy w okolicy bez 2h dojazdu?', rows: 1 },
      { id: 'interest', label: 'Kontekst (1-2 zdania)', placeholder: 'Mamy 3 wakaty w Pruszkowie w tym tygodniu.', rows: 2 },
      { id: 'desire', label: 'Korzyść / after-state', placeholder: 'Stawka od 7 200 PLN, decyzja w 5 dni.', rows: 2 },
      { id: 'cta', label: 'CTA (jedna konkretna akcja)', placeholder: 'Zostaw numer w komentarzu — odzywam się dzisiaj.', rows: 1 },
    ],
  },
  pas: {
    id: 'pas',
    name: 'PAS',
    desc: 'Problem → Agitation → Solution. Mocno emocjonalne, sprzedażowe, gdy ból znany.',
    fields: [
      { id: 'problem', label: 'Problem (1 zdanie)', placeholder: 'Twoja stara klima dmucha już tylko ciepłe powietrze?', rows: 1 },
      { id: 'agitation', label: 'Pogłęb (koszt czasu/pieniędzy)', placeholder: 'Lipiec za rogiem, serwisy zarobione, ceny rosną o 30%.', rows: 2 },
      { id: 'solution', label: 'Rozwiązanie + warunki', placeholder: 'Montujemy w 4h, gwarancja 5 lat, 2 990 PLN. Zostały 4 terminy.', rows: 2 },
      { id: 'cta', label: 'CTA', placeholder: 'Pisz tu albo dzwoń 600 100 200.', rows: 1 },
    ],
  },
  bab: {
    id: 'bab',
    name: 'BAB',
    desc: 'Before → After → Bridge. Pokazuje transformację — dla sprzedaży kursów/usług.',
    fields: [
      { id: 'before', label: 'Stan obecny (Before)', placeholder: 'W poniedziałek odeszła z pracy bez planu B.', rows: 2 },
      { id: 'after', label: 'Po (After)', placeholder: 'Do piątku miała 3 oferty 2 km od domu.', rows: 2 },
      { id: 'bridge', label: 'Bridge — co to umożliwiło', placeholder: 'Wystarczyło wkleić CV w naszym kreatorze i puścić.', rows: 2 },
      { id: 'cta', label: 'CTA', placeholder: 'Spróbuj — link w komentarzu.', rows: 1 },
    ],
  },
  list: {
    id: 'list',
    name: 'Lista',
    desc: 'Hook + 3-5 punktów + CTA. Skanowalne, dla konkretnych ofert.',
    fields: [
      { id: 'hook', label: 'Hook', placeholder: 'Szukamy 3 spawaczy do Pruszkowa — zaczynacie w poniedziałek.', rows: 1 },
      { id: 'bullets', label: 'Punkty (każdy w nowej linii)', placeholder: '• Stawka 45 zł/h netto, dwie zmiany\n• Dojazd opłacany\n• Decyzja w 24h', rows: 5 },
      { id: 'cta', label: 'CTA', placeholder: 'Pisz w komentarzu lub na PRIV — oddzwaniam dziś.', rows: 1 },
    ],
  },
};

/**
 * Biblioteka hooków — 30+ gotowych, kategoryzowane.
 * Wybierasz, wkleja się do pola hook/before/problem (zależnie od frameworka).
 */
export interface HookExample {
  id: string;
  category: string;
  text: string;
  vibe: 'pytanie' | 'liczba' | 'lokalność' | 'identyfikacja' | 'deadline' | 'kontra' | 'in_medias_res';
}

export const HOOKS: HookExample[] = [
  // Pytania z bólem
  { id: 'h1', category: 'Pytanie z bólem', vibe: 'pytanie', text: 'Ile godzin tygodniowo tracisz w korkach do pracy?' },
  { id: 'h2', category: 'Pytanie z bólem', vibe: 'pytanie', text: 'Twoja klima dmucha tylko ciepłe powietrze?' },
  { id: 'h3', category: 'Pytanie z bólem', vibe: 'pytanie', text: 'Twoje CV leży i nikt nie dzwoni od miesiąca?' },

  // Lokalność
  { id: 'h4', category: 'Lokalność', vibe: 'lokalność', text: 'Mieszkasz na Bemowie?' },
  { id: 'h5', category: 'Lokalność', vibe: 'lokalność', text: 'Z Pruszkowa albo okolic?' },
  { id: 'h6', category: 'Lokalność', vibe: 'lokalność', text: 'Jest tu ktoś z Mokotowa?' },

  // Statystyka / liczba
  { id: 'h7', category: 'Statystyka', vibe: 'liczba', text: '67% kandydatów odrzuca ofertę przez dojazd.' },
  { id: 'h8', category: 'Statystyka', vibe: 'liczba', text: '43% Polaków zmienia pracę z powodu dojazdów.' },
  { id: 'h9', category: 'Statystyka', vibe: 'liczba', text: '47 nowych ofert w 5 km od Ciebie — w tym tygodniu.' },

  // Identyfikacja persony
  { id: 'h10', category: 'Identyfikacja', vibe: 'identyfikacja', text: 'Mama wracająca po urlopie macierzyńskim?' },
  { id: 'h11', category: 'Identyfikacja', vibe: 'identyfikacja', text: 'Szukasz pierwszej pracy po studiach?' },
  { id: 'h12', category: 'Identyfikacja', vibe: 'identyfikacja', text: 'Pracujesz z domu i tęsknisz za biurem?' },

  // Deadline / limit
  { id: 'h13', category: 'Deadline', vibe: 'deadline', text: 'Do piątku szukamy 3 osób na magazyn w Pruszkowie.' },
  { id: 'h14', category: 'Deadline', vibe: 'deadline', text: 'Zostały 2 miejsca w tej rekrutacji.' },
  { id: 'h15', category: 'Deadline', vibe: 'deadline', text: 'Decyzja w 24h — start w poniedziałek.' },

  // Negacja / kontra
  { id: 'h16', category: 'Kontra', vibe: 'kontra', text: 'To nie jest kolejne ogłoszenie o pracę.' },
  { id: 'h17', category: 'Kontra', vibe: 'kontra', text: 'Stawka nie jest najważniejsza. Czas dojazdu — jest.' },
  { id: 'h18', category: 'Kontra', vibe: 'kontra', text: 'Nie szukamy kogoś z 5-letnim doświadczeniem.' },

  // In medias res — historia
  { id: 'h19', category: 'Historia', vibe: 'in_medias_res', text: 'W poniedziałek odszedł z pracy. Do piątku miał 3 oferty 2 km od domu.' },
  { id: 'h20', category: 'Historia', vibe: 'in_medias_res', text: 'Wczoraj zadzwoniła: "weszłam w 3 dni, dziękuję".' },

  // Konkretna oferta
  { id: 'h21', category: 'Konkretna oferta', vibe: 'liczba', text: 'Spawacz, 8 500 PLN netto, Mokotów. Czytaj dalej.' },
  { id: 'h22', category: 'Konkretna oferta', vibe: 'liczba', text: 'Kierowca C+E, 12 zł/km, baza w Pruszkowie.' },
  { id: 'h23', category: 'Konkretna oferta', vibe: 'liczba', text: 'Praca biurowa, 5 500 PLN + premia, Wola, hybryda 3/2.' },
];

/**
 * Buduje gotowy tekst z framework + dane.
 * Każda sekcja oddzielona pustym wierszem (FB lubi).
 */
export function assemblePost(framework: FrameworkType, data: Record<string, string>): string {
  const def = FRAMEWORKS[framework];
  const parts = def.fields
    .map((f) => (data[f.id] ?? '').trim())
    .filter((p) => p.length > 0);
  return parts.join('\n\n');
}

/**
 * Sugeruje hook na podstawie typu posta (rough heurystyka).
 */
export function suggestHook(postType: 'job' | 'sales' | 'other'): HookExample[] {
  if (postType === 'job') return HOOKS.filter((h) => ['pytanie', 'lokalność', 'identyfikacja', 'deadline', 'liczba'].includes(h.vibe)).slice(0, 6);
  if (postType === 'sales') return HOOKS.filter((h) => ['pytanie', 'kontra', 'deadline', 'in_medias_res', 'liczba'].includes(h.vibe)).slice(0, 6);
  return HOOKS.slice(0, 6);
}

/**
 * Walidacja gotowego tekstu — czy nie jest za krótki/długi/spamowy.
 */
export interface ValidationResult {
  ok: boolean;
  warnings: string[];
  score: number; // 0-100
}

export function validatePost(text: string): ValidationResult {
  const warnings: string[] = [];
  const len = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  let score = 50;

  if (len < 60) {
    warnings.push('Tekst jest bardzo krótki — może być pominięty.');
    score -= 10;
  } else if (len > 1500) {
    warnings.push('Tekst jest długi — FB ucina po ~600 znakach, dodaj "Czytaj więcej" — najważniejsze na początku.');
    score -= 5;
  } else {
    score += 10;
  }

  if (wordCount < 15) {
    warnings.push('Mało słów — przemyśl czy hook + 2-3 zdania nie pomogą.');
    score -= 5;
  } else if (wordCount > 200) {
    warnings.push('Dużo słów — rozważ skrócenie do 80-120.');
    score -= 5;
  }

  // Pozytywne sygnały — konkrety
  const numbers = (text.match(/\d+/g) ?? []).length;
  if (numbers >= 2) score += 10;
  if (numbers === 0) {
    warnings.push('Brak konkretnych liczb — stawki, terminy, miejsca pomagają.');
    score -= 8;
  }

  // Lokalność
  const localWords = /(warszawa|pruszków|bemowo|mokotów|wola|łódź|wrocław|kraków|trójmiasto|poznań|sopot|gdańsk|gdynia|katowice)/i.test(text);
  if (localWords) score += 8;

  // CTA — sprawdź czy jest jakiś call
  const hasCta = /(zostaw|napisz|pisz|dzwoń|kontakt|odzwaniam|link|priv|komentarz|dm)/i.test(text);
  if (!hasCta) {
    warnings.push('Brak wyraźnego CTA — dodaj "Zostaw numer / Pisz w komentarzu / link niżej".');
    score -= 10;
  } else {
    score += 5;
  }

  // Zakazane otwarcia (AI-vibes)
  const aiOpenings = /^(witaj|cześć\W|dzień dobry|szanowni państwo|z dumą prezentujemy|w naszej firmie)/i;
  if (aiOpenings.test(text.trim())) {
    warnings.push('Otwarcie brzmi jak generic intro — usuń "Witaj!" / "Z dumą prezentujemy".');
    score -= 15;
  }

  // Em-dash
  if (text.includes('—')) {
    warnings.push('Em-dash (—) — częsty znak AI. FB go nie zna w wpisach od ludzi. Zamień na "-".');
    score -= 5;
  }

  // Listy z gwiazdkami
  if (/^\s*\*\*/m.test(text)) {
    warnings.push('Markdown bold (**) nie renderuje się w FB. Usuń.');
    score -= 5;
  }

  return {
    ok: warnings.length === 0,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  };
}
