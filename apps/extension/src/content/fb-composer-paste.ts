/**
 * fb-composer-paste — content script na /groups/<id>/. Czeka aż background wyśle
 * {type: 'PASTE_POST', text}. Otwiera composer (jeśli nie jest otwarty), wkleja tekst.
 * NIE klika "Publikuj" — user musi sam (zgodność z ToS).
 */

import { querySelectorWithFallback, ACTIVE_SELECTORS } from './selectors/registry';

interface PasteMessage {
  type: 'PASTE_POST';
  text: string;
  targetId: string;
}

async function waitFor<T extends Element>(selectors: string[], timeoutMs = 8000): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = querySelectorWithFallback<T>(document, selectors);
    if (el) return el;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

function findComposerTrigger(): HTMLElement | null {
  // "Napisz coś..." / "Write something..." entry tile w group feed
  const candidates = Array.from(
    document.querySelectorAll('[role="button"], [role="textbox"]'),
  ) as HTMLElement[];

  return (
    candidates.find((el) => {
      const text = el.textContent?.toLowerCase() ?? '';
      const aria = el.getAttribute('aria-label')?.toLowerCase() ?? '';
      return (
        text.includes('napisz coś') ||
        text.includes('write something') ||
        aria.includes('napisz') ||
        aria.includes('create post')
      );
    }) ?? null
  );
}

async function pasteText(text: string): Promise<boolean> {
  // Czy composer jest otwarty?
  let textbox = querySelectorWithFallback<HTMLElement>(document, ACTIVE_SELECTORS.composerTextbox);

  if (!textbox) {
    const trigger = findComposerTrigger();
    if (trigger) {
      trigger.click();
      await new Promise((r) => setTimeout(r, 1200));
    }
    textbox = await waitFor<HTMLElement>(ACTIVE_SELECTORS.composerTextbox);
  }

  if (!textbox) {
    return false;
  }

  // Focus + insertText (działa z Lexicalem FB)
  textbox.focus();
  await new Promise((r) => setTimeout(r, 200));

  // execCommand jest "deprecated" ale wciąż jedyny niezawodny sposób na Lexical
  const ok = document.execCommand('insertText', false, text);
  if (!ok) {
    // Plan B: InputEvent
    textbox.dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'insertFromPaste', data: text, bubbles: true }),
    );
  }

  await new Promise((r) => setTimeout(r, 400));
  return true;
}

chrome.runtime.onMessage.addListener((msg: PasteMessage, _sender, sendResponse) => {
  if (msg?.type === 'PASTE_POST') {
    void pasteText(msg.text).then((ok) => {
      sendResponse({ ok, targetId: msg.targetId });
    });
    return true;
  }
  return false;
});

// Sygnał gotowości
chrome.runtime.sendMessage({ type: 'CONTENT_READY', context: 'group-page' }).catch(() => {});
