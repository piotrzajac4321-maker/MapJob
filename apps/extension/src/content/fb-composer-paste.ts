/**
 * Wkleja treść posta w composer grupy FB.
 * NIE klika "Publikuj" — user musi sam (zgodność z ToS).
 */

interface PasteMessage {
  type: 'PASTE_POST';
  text: string;
  targetId: string;
  imageDataUrls?: string[];
}

async function waitFor<T extends HTMLElement = HTMLElement>(selectors: string[], timeoutMs = 8000): Promise<T | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel) as T | null;
        if (el && el.offsetParent !== null) return el;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

function findComposerTrigger(): HTMLElement | null {
  // "Napisz coś" / "Write something" tile w group feed
  const candidates = Array.from(
    document.querySelectorAll('[role="button"], [role="textbox"], [aria-label]'),
  ) as HTMLElement[];

  for (const el of candidates) {
    if ((el as HTMLElement).offsetParent === null) continue;
    const text = (el.textContent ?? '').toLowerCase().slice(0, 80);
    const aria = (el.getAttribute('aria-label') ?? '').toLowerCase();
    if (
      text.includes('napisz coś') ||
      text.includes('write something') ||
      aria.includes('napisz coś') ||
      aria.includes('write something') ||
      aria.includes('create a post') ||
      aria.includes('utwórz post')
    ) {
      return el;
    }
  }
  return null;
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

async function attachImages(dataUrls: string[]): Promise<boolean> {
  if (dataUrls.length === 0) return true;
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return false;

  // Znajdź input file (ukryty)
  const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (fileInput) {
    const files = await Promise.all(dataUrls.map((u, i) => dataUrlToFile(u, `image-${i}.png`)));
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 1500));
    return true;
  }

  // Fallback: drop event
  const dropTarget = dialog.querySelector('[role="textbox"]') ?? dialog;
  const files = await Promise.all(dataUrls.map((u, i) => dataUrlToFile(u, `image-${i}.png`)));
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  dropTarget.dispatchEvent(
    new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }),
  );
  await new Promise((r) => setTimeout(r, 1500));
  return true;
}

async function pasteText(text: string, imageDataUrls?: string[]): Promise<{ ok: boolean; error?: string }> {
  console.log('[MapJob] Próbuję wkleić post (', text.length, 'znaków)');

  // ANTI-BAN: krótki random scroll przed kliknięciem composera (symuluje przeglądanie feedu)
  try {
    const scrollAmount = 200 + Math.floor(Math.random() * 600);
    window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1500));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 800));
  } catch {}

  // Czy composer jest otwarty?
  let textbox = await waitFor<HTMLElement>(
    [
      '[role="dialog"] [role="textbox"][contenteditable="true"][data-lexical-editor="true"]',
      '[role="dialog"] [role="textbox"][contenteditable="true"]',
      '[role="dialog"] [contenteditable="true"]',
    ],
    1500,
  );

  if (!textbox) {
    const trigger = findComposerTrigger();
    if (!trigger) return { ok: false, error: 'Nie znaleziono triggera composera' };
    console.log('[MapJob] Klikam trigger composera');
    trigger.click();
    await new Promise((r) => setTimeout(r, 1500));
    textbox = await waitFor<HTMLElement>(
      [
        '[role="dialog"] [role="textbox"][contenteditable="true"][data-lexical-editor="true"]',
        '[role="dialog"] [role="textbox"][contenteditable="true"]',
        '[role="dialog"] [contenteditable="true"]',
      ],
      6000,
    );
  }

  if (!textbox) return { ok: false, error: 'Nie udało się otworzyć composera' };

  console.log('[MapJob] Composer otwarty, wklejam tekst');
  textbox.focus();
  await new Promise((r) => setTimeout(r, 200));

  const ok = document.execCommand('insertText', false, text);
  if (!ok) {
    // Plan B: clipboardData + paste event
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    textbox.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }

  await new Promise((r) => setTimeout(r, 500));

  // Załącz obrazy
  if (imageDataUrls && imageDataUrls.length > 0) {
    const attached = await attachImages(imageDataUrls);
    if (!attached) console.warn('[MapJob] Nie udało się dołączyć obrazów');
  }

  return { ok: true };
}

chrome.runtime.onMessage.addListener((msg: PasteMessage, _sender, sendResponse) => {
  if (msg?.type === 'PASTE_POST') {
    void pasteText(msg.text, msg.imageDataUrls).then((r) => {
      sendResponse({ ...r, targetId: msg.targetId });
    });
    return true;
  }
  return false;
});

chrome.runtime.sendMessage({ type: 'CONTENT_READY', page: 'group' }).catch(() => {});
console.log('[MapJob] Composer script gotowy na', location.href);
