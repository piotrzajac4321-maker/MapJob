/**
 * Cienki klient API do Supabase Edge Functions + REST.
 * Używamy custom JWT (extension token) zamiast Supabase Auth — bardziej kontrola.
 */

import { getAuth } from './storage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function authHeaders(): Promise<Record<string, string>> {
  const auth = await getAuth();
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON,
    Authorization: auth ? `Bearer ${auth.token}` : `Bearer ${SUPABASE_ANON}`,
  };
}

export interface NextTarget {
  target_id: string;
  group_id: string;
  campaign_id: string;
  fb_group_id: string;
  group_url: string;
  rendered_text: string;
  delay_seconds: number;
}

export async function fetchNextTarget(): Promise<NextTarget | null> {
  const auth = await getAuth();
  if (!auth) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/next_target_for_device`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ _device_id: auth.deviceId }),
  });

  if (!res.ok) {
    console.warn('fetchNextTarget failed', res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as NextTarget[];
  return data[0] ?? null;
}

export async function updateTarget(
  targetId: string,
  patch: { status?: string; error_code?: string; error_message?: string; fb_post_url?: string; posted_at?: string },
): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/campaign_targets?id=eq.${targetId}`, {
    method: 'PATCH',
    headers: { ...(await authHeaders()), Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
}

export async function trackEvent(action: string, meta: Record<string, unknown>, entityType?: string, entityId?: string): Promise<void> {
  const auth = await getAuth();
  if (!auth) return;

  await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      events: [{ orgId: auth.orgId, action, meta, entityType, entityId }],
    }),
  });
}

export async function upsertGroups(
  fbAccountId: string,
  groups: Array<{ fbGroupId: string; name: string; url: string; membersCount?: number; privacy?: string }>,
): Promise<{ inserted: number; updated: number } | null> {
  const auth = await getAuth();
  if (!auth) return null;

  const rows = groups.map((g) => ({
    org_id: auth.orgId,
    fb_account_id: fbAccountId,
    fb_group_id: g.fbGroupId,
    name: g.name,
    url: g.url,
    members_count: g.membersCount ?? null,
    privacy: g.privacy ?? 'unknown',
  }));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/groups?on_conflict=fb_account_id,fb_group_id`, {
    method: 'POST',
    headers: {
      ...(await authHeaders()),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    console.warn('upsertGroups failed', res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as unknown[];
  return { inserted: data.length, updated: 0 };
}

export async function ensureFbAccount(label: string): Promise<string | null> {
  const auth = await getAuth();
  if (!auth) return null;

  // GET first
  const existing = await fetch(
    `${SUPABASE_URL}/rest/v1/fb_accounts?owner_user_id=eq.${auth.userId}&fb_user_label=eq.${encodeURIComponent(label)}&select=id`,
    { headers: await authHeaders() },
  );
  if (existing.ok) {
    const rows = (await existing.json()) as { id: string }[];
    if (rows[0]) return rows[0].id;
  }

  const ins = await fetch(`${SUPABASE_URL}/rest/v1/fb_accounts`, {
    method: 'POST',
    headers: { ...(await authHeaders()), Prefer: 'return=representation' },
    body: JSON.stringify({
      org_id: auth.orgId,
      owner_user_id: auth.userId,
      fb_user_label: label,
      extension_fingerprint: auth.deviceId,
      last_seen_at: new Date().toISOString(),
    }),
  });

  if (!ins.ok) {
    console.warn('ensureFbAccount failed', ins.status, await ins.text());
    return null;
  }

  const data = (await ins.json()) as { id: string }[];
  return data[0]?.id ?? null;
}
