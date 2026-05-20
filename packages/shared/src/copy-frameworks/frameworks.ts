import type { Framework } from '../types/index.js';

const AIDA = `## AIDA — Attention, Interest, Desire, Action
**Kiedy:** świadomość, nowa oferta, ciepły lead.
- **A**ttention — hook zatrzymujący scroll (pytanie, dana, kontra-oczekiwanie).
- **I**nterest — rozwiń kontekst pasujący do persony.
- **D**esire — pokaż "after state": jak będzie po skorzystaniu.
- **A**ction — JEDEN konkretny CTA.

Przykład struktury (oferta pracy):
> Szukasz pracy w okolicy bez 2h dojazdu? [A]
> Mamy 3 wakaty w [dzielnica] w tym tygodniu. [I]
> Stawka od X PLN, hybryda 2/3, decyzja w 5 dni. [D]
> Zostaw numer w komentarzu — odzywamy się dzisiaj. [A]`;

const PAS = `## PAS — Problem, Agitation, Solution
**Kiedy:** mocno emocjonalne, lead gen, sprzedaż, gdy odbiorca już zna ból.
- **P**roblem — nazwij konkretny ból.
- **A**gitation — pogłęb: koszt czasu, pieniędzy, frustracji.
- **S**olution — produkt/oferta jako precyzyjna odpowiedź na P.

Przykład (sprzedażowy):
> Twoja stara klima dmucha już tylko ciepłe powietrze? [P]
> Lipiec za rogiem, serwisy zarobione, ceny w górę o 30%. [A]
> Montujemy nową w 4h, gwarancja 5 lat, 2 990 PLN z robocizną. Zostały 4 terminy w lipcu. [S]`;

const BAB = `## BAB — Before, After, Bridge
**Kiedy:** transformacja jest wyraźnie lepsza niż stan obecny.
- **B**efore — stan obecny odbiorcy.
- **A**fter — stan po skorzystaniu z oferty.
- **B**ridge — oferta jako most.`;

const U4 = `## 4U — Useful, Urgent, Unique, Ultra-specific
**Kiedy:** krótkie posty, headline'y. Min. 3/4 spełnione.
- **U**seful — daje wartość.
- **U**rgent — czas / okazja.
- **U**nique — czego nie ma konkurencja.
- **U**ltra-specific — liczba, miasto, branża, %.

Test "Znajdź pracę szybciej" → 2/4 = słaby.
Lepiej: "Oferty IT w Krakowie — 47 nowych w tym tygodniu" → 4/4.`;

const FAB = `## FAB — Features, Advantages, Benefits
**Kiedy:** dłuższe sprzedażowe, B2B.
- **F**eature — co produkt MA.
- **A**dvantage — co to UMOŻLIWIA.
- **B**enefit — co to ZNACZY DLA MNIE.

Reklama bez Benefit = lista funkcji, której nikt nie czyta.`;

const PASTOR = `## PASTOR — Person, Amplify, Story, Testimony, Offer, Response
**Kiedy:** długie formy, lead nurturing, post storytelling.
- **P**erson/Problem — do kogo i co go boli.
- **A**mplify — koszt niezadziałania.
- **S**tory — case / mini-historia.
- **T**estimony — cytat + liczba.
- **O**ffer — co dostają.
- **R**esponse — jeden CTA.`;

const FRAMEWORK_MAP: Record<Framework, string> = {
  AIDA,
  PAS,
  BAB,
  '4U': U4,
  FAB,
  PASTOR,
};

export function getFrameworkSection(framework: Framework): string {
  return FRAMEWORK_MAP[framework];
}

export const ALL_FRAMEWORKS_SECTION = Object.values(FRAMEWORK_MAP).join('\n\n');
