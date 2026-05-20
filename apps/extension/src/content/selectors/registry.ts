/**
 * Selector registry — abstrakcja nad DOM Facebooka, który zmienia się często.
 * Każda wersja selektorów ma fallbacki; nieudana detekcja → telemetria selector_miss.
 */

export interface SelectorSet {
  version: string;
  groupCard: string[]; // karta grupy w /groups/joins/
  groupCardName: string[]; // nazwa wewnątrz karty
  groupCardMembers: string[]; // tekst "47 tys. członków" wewnątrz karty
  composerDialog: string[]; // dialog "Utwórz post" w grupie
  composerTextbox: string[]; // edytowalne pole tekstowe w composerze
  composerSubmitButton: string[]; // przycisk "Opublikuj"/"Post" (NIE klikamy — tylko detekcja)
  publishToastSelector: string[]; // toast po publikacji
  loginIndicator: string[]; // wykrycie że user nie jest zalogowany
}

export const SELECTORS_V1: SelectorSet = {
  version: 'v1-2026-05',
  groupCard: [
    'div[role="main"] a[href*="/groups/"][role="link"][aria-label]',
    'div[role="main"] a[href*="/groups/"][role="link"]',
  ],
  groupCardName: [
    'span[dir="auto"]',
    'div[dir="auto"]',
  ],
  groupCardMembers: [
    'span:contains("członków")',
    'span:contains("members")',
  ],
  composerDialog: [
    'div[role="dialog"][aria-label*="Utwórz"]',
    'div[role="dialog"][aria-label*="Create"]',
    'div[role="dialog"]',
  ],
  composerTextbox: [
    '[role="dialog"] [role="textbox"][contenteditable="true"][data-lexical-editor="true"]',
    '[role="dialog"] [role="textbox"][contenteditable="true"]',
    '[role="dialog"] [contenteditable="true"]',
  ],
  composerSubmitButton: [
    '[role="dialog"] div[role="button"][aria-label*="Opublikuj"]',
    '[role="dialog"] div[role="button"][aria-label*="Post"]',
    '[role="dialog"] [type="submit"]',
  ],
  publishToastSelector: [
    '[role="alert"]',
    '[role="status"]',
  ],
  loginIndicator: [
    'form[action*="/login/"]',
    'input[name="email"][id="email"]',
  ],
};

export const ACTIVE_SELECTORS: SelectorSet = SELECTORS_V1;

/**
 * Pierwsza pasująca opcja z listy selektorów.
 * Telemetria: zwraca też nazwę pola, żeby raportować miss.
 */
export function querySelectorWithFallback<T extends Element = Element>(
  root: ParentNode,
  selectorList: string[],
): T | null {
  for (const sel of selectorList) {
    try {
      const el = root.querySelector(sel) as T | null;
      if (el) return el;
    } catch {
      // selektor niesyntactic — ignoruj (np. :contains() nie jest standardem)
    }
  }
  return null;
}

export function querySelectorAllWithFallback<T extends Element = Element>(
  root: ParentNode,
  selectorList: string[],
): T[] {
  for (const sel of selectorList) {
    try {
      const els = Array.from(root.querySelectorAll(sel)) as T[];
      if (els.length > 0) return els;
    } catch {
      // ignore
    }
  }
  return [];
}
