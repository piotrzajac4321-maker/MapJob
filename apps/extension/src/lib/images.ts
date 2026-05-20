/**
 * Obrazki do postów — kompresja + storage + restore.
 *
 * Strategia:
 * - User dodaje 1-4 zdjęcia przez file input lub drag&drop.
 * - Kompresujemy do max 1600px (longer edge), JPEG q=0.8 → ~150-400KB każdy.
 * - Zapis jako data:image/jpeg;base64,... w chrome.storage.local.
 * - Limit chrome.storage.local = 10MB → 4 zdjęcia × ~400KB = 1.6MB OK.
 */

export const MAX_IMAGES_PER_POST = 4;
export const MAX_LONG_EDGE_PX = 1600;
export const JPEG_QUALITY = 0.82;
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB input limit

export interface ImageUploadError {
  file: string;
  reason: string;
}

export interface UploadResult {
  dataUrls: string[];
  errors: ImageUploadError[];
}

/**
 * Konwertuje File do skompresowanego dataURL JPEG.
 * Resize do max 1600px na dłuższym boku.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Plik zbyt duży (${(file.size / 1024 / 1024).toFixed(1)}MB) — limit 15MB.`);
  }
  if (!file.type.startsWith('image/')) {
    throw new Error(`To nie jest obrazek (${file.type || 'nieznany typ'}).`);
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('Nie mogę odczytać obrazka — być może uszkodzony.');
  });

  // Wylicz nowe wymiary
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_LONG_EDGE_PX ? MAX_LONG_EDGE_PX / longest : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  // Rysuj na canvas
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas context niedostępny.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  // Eksport do JPEG
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });
  if (!blob) throw new Error('Nie udało się skompresować obrazka.');

  // Convert do dataURL
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Błąd FileReadera.'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadImages(files: FileList | File[]): Promise<UploadResult> {
  const arr = Array.from(files).slice(0, MAX_IMAGES_PER_POST);
  const dataUrls: string[] = [];
  const errors: ImageUploadError[] = [];

  for (const file of arr) {
    try {
      const url = await fileToCompressedDataUrl(file);
      dataUrls.push(url);
    } catch (err) {
      errors.push({ file: file.name, reason: (err as Error).message });
    }
  }

  return { dataUrls, errors };
}

/**
 * Konwertuje dataURL → Blob (do attachowania w composerze FB przez DataTransfer).
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mimeMatch = head!.match(/data:([^;]+)/);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const binary = atob(body!);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: blob.type });
}

/**
 * Szacuje rozmiar dataURL w bajtach (do walidacji limitu storage).
 */
export function approxDataUrlSize(dataUrl: string): number {
  // base64 -> bytes: 3 bytes per 4 chars
  const body = dataUrl.split(',')[1] ?? '';
  return Math.floor(body.length * 0.75);
}
