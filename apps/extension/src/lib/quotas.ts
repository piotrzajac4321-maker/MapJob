/**
 * Limity per użytkownik — żeby pojedynczy klient nie zabił bazy/kosztów.
 *
 * Konfiguracja sprzedażowa: licencja ~25 zł/m, więc twarde limity:
 * - 500 publikacji / miesiąc (≈17/dzień przy stałym tempie)
 * - 200 grup zaimportowanych
 * - 50 zdjęć w storage (Chrome 10MB i tak nie pozwala więcej)
 *
 * Limity są MIĘKKIE (warning) przy 80% i TWARDE (blokada) przy 100%.
 * Liczone z chrome.storage.local (źródło prawdy: targets z status='posted').
 */

import { getTargets, getGroups, getPosts } from './store.js';

export interface Limits {
  publicationsPerMonth: number;
  totalGroups: number;
  totalImages: number;
}

export const DEFAULT_LIMITS: Limits = {
  publicationsPerMonth: 500,
  totalGroups: 200,
  totalImages: 50,
};

export interface QuotaUsage {
  publicationsThisMonth: number;
  groupsImported: number;
  imagesStored: number;
}

export interface QuotaCheck {
  used: number;
  limit: number;
  percent: number;
  ok: boolean; // false = przekroczone
  warning: 'ok' | 'warn' | 'critical' | 'blocked';
  label: string;
}

function startOfMonth(d = new Date()): number {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export async function getQuotaUsage(): Promise<QuotaUsage> {
  const [targets, groups, posts] = await Promise.all([getTargets(), getGroups(), getPosts()]);
  const monthStart = startOfMonth();
  const publicationsThisMonth = targets.filter(
    (t) => t.status === 'posted' && (t.postedAt ?? 0) >= monthStart,
  ).length;
  const groupsImported = groups.length;
  const imagesStored = posts.reduce((sum, p) => sum + (p.imageDataUrls?.length ?? 0), 0);

  return { publicationsThisMonth, groupsImported, imagesStored };
}

function evalCheck(used: number, limit: number, label: string): QuotaCheck {
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const warning: QuotaCheck['warning'] =
    used >= limit ? 'blocked' :
    percent >= 90 ? 'critical' :
    percent >= 80 ? 'warn' :
    'ok';
  return {
    used,
    limit,
    percent: Math.min(100, percent),
    ok: used < limit,
    warning,
    label,
  };
}

/**
 * Sprawdza wszystkie limity. Zwraca raport.
 */
export async function checkAllQuotas(limits: Limits = DEFAULT_LIMITS): Promise<{
  publications: QuotaCheck;
  groups: QuotaCheck;
  images: QuotaCheck;
  anyBlocked: boolean;
}> {
  const u = await getQuotaUsage();
  const publications = evalCheck(u.publicationsThisMonth, limits.publicationsPerMonth, 'Publikacje / miesiąc');
  const groups = evalCheck(u.groupsImported, limits.totalGroups, 'Zaimportowane grupy');
  const images = evalCheck(u.imagesStored, limits.totalImages, 'Zdjęcia');
  return {
    publications,
    groups,
    images,
    anyBlocked: !publications.ok || !groups.ok || !images.ok,
  };
}

/**
 * Sprawdza limit DODAWANIA N publikacji (do uruchomienia kampanii).
 * Zwraca null jeśli OK, lub komunikat błędu.
 */
export async function canAddPublications(count: number, limits: Limits = DEFAULT_LIMITS): Promise<string | null> {
  const u = await getQuotaUsage();
  const after = u.publicationsThisMonth + count;
  if (after > limits.publicationsPerMonth) {
    const remaining = Math.max(0, limits.publicationsPerMonth - u.publicationsThisMonth);
    return `Limit ${limits.publicationsPerMonth} publikacji/miesiąc. Już wykorzystano ${u.publicationsThisMonth}, próbujesz dodać ${count}. Możesz dodać max ${remaining} więcej.`;
  }
  return null;
}

export async function canAddGroups(count: number, limits: Limits = DEFAULT_LIMITS): Promise<string | null> {
  const u = await getQuotaUsage();
  const after = u.groupsImported + count;
  if (after > limits.totalGroups) {
    const remaining = Math.max(0, limits.totalGroups - u.groupsImported);
    return `Limit ${limits.totalGroups} grup. Masz już ${u.groupsImported}, próbujesz dodać ${count}. Możesz dodać max ${remaining} więcej.`;
  }
  return null;
}

export async function canAddImages(count: number, limits: Limits = DEFAULT_LIMITS): Promise<string | null> {
  const u = await getQuotaUsage();
  const after = u.imagesStored + count;
  if (after > limits.totalImages) {
    const remaining = Math.max(0, limits.totalImages - u.imagesStored);
    return `Limit ${limits.totalImages} zdjęć łącznie. Masz ${u.imagesStored}, próbujesz dodać ${count}. Możesz dodać max ${remaining} więcej.`;
  }
  return null;
}
