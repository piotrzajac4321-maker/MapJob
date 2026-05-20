/**
 * License management — 7-dni trial bez karty + płatne klucze.
 *
 * Flow:
 * 1. Pierwszy start: user podaje email → POST /mjfb_licenses (status='trial', 7 dni).
 * 2. Każdy start + co 24h: GET /mjfb_v_license_status?device_id=eq.X → cache lokalnie.
 * 3. Klucz: user wkleja → RPC mjfb_activate_license → status='active'.
 * 4. Expired → killSwitch, blokuj wszystkie akcje (poza Settings + aktywacja).
 */

import { getCloudConfig } from './cloud.js';
import { getDeviceId } from './store.js';

const CACHE_KEY = 'license_cache_v1';
const CACHE_TTL_MS = 6 * 3600 * 1000; // 6h

export type LicenseStatus = 'trial' | 'active' | 'expired' | 'blocked' | 'unknown';
export type LicensePlan = 'trial' | 'basic' | 'pro' | 'studio' | 'lifetime';

export interface License {
  deviceId: string;
  email?: string;
  phone?: string;
  plan: LicensePlan;
  status: LicenseStatus;
  computedStatus: LicenseStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  paidUntil?: string;
  monthlyPublicationsCap: number;
  secondsRemaining: number;
  fetchedAt: number;
}

interface LicenseCache {
  license: License | null;
  fetchedAt: number;
}

async function getCache(): Promise<LicenseCache | null> {
  const { [CACHE_KEY]: data } = await chrome.storage.local.get(CACHE_KEY);
  return (data as LicenseCache | undefined) ?? null;
}

async function setCache(cache: LicenseCache): Promise<void> {
  await chrome.storage.local.set({ [CACHE_KEY]: cache });
}

/**
 * Fetch licencji z bazy. Cache 6h, force żeby pominąć.
 */
export async function fetchLicense(opts: { force?: boolean } = {}): Promise<License | null> {
  const cached = await getCache();
  if (!opts.force && cached?.license && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.license;
  }

  const deviceId = await getDeviceId();
  const config = getCloudConfig();
  try {
    const res = await fetch(
      `${config.url}/rest/v1/mjfb_v_license_status?device_id=eq.${encodeURIComponent(deviceId)}`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
      },
    );
    if (!res.ok) {
      console.warn('[MapJob license] fetch failed:', res.status);
      // Zwróć cache jeśli mamy, choćby przestarzały (graceful degradation)
      return cached?.license ?? null;
    }
    const rows = (await res.json()) as Array<{
      device_id: string;
      email?: string;
      phone?: string;
      plan: LicensePlan;
      status: LicenseStatus;
      computed_status: LicenseStatus;
      trial_started_at?: string;
      trial_ends_at?: string;
      paid_until?: string;
      monthly_publications_cap: number;
      seconds_remaining: number;
    }>;

    if (rows.length === 0) {
      // Brak rekordu — user nie aktywował trialu jeszcze
      await setCache({ license: null, fetchedAt: Date.now() });
      return null;
    }

    const row = rows[0]!;
    const license: License = {
      deviceId: row.device_id,
      email: row.email,
      phone: row.phone,
      plan: row.plan,
      status: row.status,
      computedStatus: row.computed_status,
      trialStartedAt: row.trial_started_at,
      trialEndsAt: row.trial_ends_at,
      paidUntil: row.paid_until,
      monthlyPublicationsCap: row.monthly_publications_cap,
      secondsRemaining: row.seconds_remaining,
      fetchedAt: Date.now(),
    };
    await setCache({ license, fetchedAt: Date.now() });
    return license;
  } catch (err) {
    console.warn('[MapJob license] network error:', err);
    return cached?.license ?? null;
  }
}

/**
 * Start trialu 7 dni. Tworzy device w mjfb_devices (jeśli nie istnieje) i mjfb_licenses.
 */
/**
 * Normalizuje polski numer telefonu — usuwa spacje, myślniki, dodaje +48.
 * Akceptuje: "+48 123 456 789", "123 456 789", "123-456-789", "+48123456789".
 */
export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  // +48XXXXXXXXX (12) lub XXXXXXXXX (9) lub 48XXXXXXXXX (11)
  if (/^\+48\d{9}$/.test(cleaned)) return cleaned;
  if (/^48\d{9}$/.test(cleaned)) return '+' + cleaned;
  if (/^\d{9}$/.test(cleaned)) return '+48' + cleaned;
  return null;
}

export async function startTrial(email: string, phone: string): Promise<{ ok: boolean; error?: string; license?: License }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Nieprawidłowy email' };
  }

  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) {
    return { ok: false, error: 'Nieprawidłowy numer telefonu. Format: 123 456 789 lub +48 123 456 789.' };
  }

  const deviceId = await getDeviceId();
  const config = getCloudConfig();

  try {
    // 1. Upsert device (zwykle już istnieje)
    await fetch(`${config.url}/rest/v1/mjfb_devices?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: deviceId,
        label: `Chrome — ${navigator.platform}`,
        last_seen_at: new Date().toISOString(),
      }),
    });

    // 2. Insert license (trial)
    const res = await fetch(`${config.url}/rest/v1/mjfb_licenses`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        device_id: deviceId,
        email: cleanEmail,
        phone: cleanPhone,
        plan: 'trial',
        status: 'trial',
      }),
    });

    if (res.status === 409 || res.status === 422) {
      // Już istnieje — to znaczy że user już zaczął trial wcześniej
      const fresh = await fetchLicense({ force: true });
      if (fresh) return { ok: true, license: fresh };
      return { ok: false, error: 'Trial już został wykorzystany na tym urządzeniu.' };
    }

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${await res.text().catch(() => '')}` };
    }

    const fresh = await fetchLicense({ force: true });
    return { ok: true, license: fresh ?? undefined };
  } catch {
    return { ok: false, error: 'Brak połączenia z internetem. Spróbuj za chwilę.' };
  }
}

/**
 * Aktywacja kluczem licencyjnym (Basic/Pro/Lifetime).
 */
export async function activateLicense(licenseKey: string): Promise<{ ok: boolean; error?: string; license?: License }> {
  const cleanKey = licenseKey.trim().toUpperCase();
  if (!cleanKey || cleanKey.length < 10) {
    return { ok: false, error: 'Klucz wygląda nieprawidłowo.' };
  }

  const deviceId = await getDeviceId();
  const config = getCloudConfig();

  try {
    const res = await fetch(`${config.url}/rest/v1/rpc/mjfb_activate_license`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_device_id: deviceId,
        p_license_key: cleanKey,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const result = (await res.json()) as { ok: boolean; error?: string; message?: string };
    if (!result.ok) {
      return { ok: false, error: result.message ?? result.error ?? 'Nieznany błąd' };
    }

    const fresh = await fetchLicense({ force: true });
    return { ok: true, license: fresh ?? undefined };
  } catch {
    return { ok: false, error: 'Brak połączenia. Spróbuj ponownie.' };
  }
}

/**
 * Helper UI: ile dni/godzin/minut do końca?
 */
export function formatRemaining(seconds: number): string {
  if (seconds <= 0) return 'wygasło';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days >= 2) return `${days} dni`;
  if (days === 1) return `1 dzień ${hours}h`;
  if (hours >= 2) return `${hours}h ${minutes}m`;
  if (hours === 1) return `1h ${minutes}m`;
  return `${minutes} minut`;
}

/**
 * Czy licencja pozwala na działanie aplikacji?
 */
export function isLicenseValid(license: License | null): boolean {
  if (!license) return false;
  return license.computedStatus === 'trial' || license.computedStatus === 'active';
}

export function getStatusBadge(license: License | null): { text: string; cls: 'success' | 'warning' | 'danger' | 'muted' } {
  if (!license) return { text: 'Brak licencji', cls: 'muted' };
  if (license.computedStatus === 'active') {
    return { text: `${license.plan.toUpperCase()} · ${formatRemaining(license.secondsRemaining)}`, cls: 'success' };
  }
  if (license.computedStatus === 'trial') {
    const days = Math.floor(license.secondsRemaining / 86400);
    return {
      text: `TRIAL · ${formatRemaining(license.secondsRemaining)}`,
      cls: days <= 1 ? 'warning' : 'success',
    };
  }
  if (license.computedStatus === 'expired') return { text: 'WYGASŁO', cls: 'danger' };
  if (license.computedStatus === 'blocked') return { text: 'ZABLOKOWANE', cls: 'danger' };
  return { text: license.computedStatus, cls: 'muted' };
}
