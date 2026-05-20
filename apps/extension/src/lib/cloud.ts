/**
 * Cloud sync — wysyła dane do projektu Supabase "Apka fb" (afqibinzwgdidumvjxyo).
 * Używa publishable key i RLS anon (na każdą operację OK).
 *
 * Strategia: fire-and-forget. Local jest source of truth, cloud to mirror dla analytics.
 * Jeśli sync padnie, extension dalej działa lokalnie.
 */

const SUPA_URL = 'https://afqibinzwgdidumvjxyo.supabase.co';
const SUPA_KEY = 'sb_publishable_VhLOmFJm4sgHiQesoNioBg_YlSjwWLi';

const COMMON_HEADERS: Record<string, string> = {
  apikey: SUPA_KEY,
  Authorization: `Bearer ${SUPA_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
};

let syncEnabled = true; // wyłączone jeśli REST zwraca 404 (schema nie wgrana)

async function call(path: string, init: RequestInit = {}): Promise<Response | null> {
  if (!syncEnabled) return null;
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1${path}`, {
      ...init,
      headers: { ...COMMON_HEADERS, ...(init.headers ?? {}) },
    });
    if (res.status === 404) {
      console.warn('[MapJob cloud] schema nie wgrana — wyłączam sync');
      syncEnabled = false;
    } else if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[MapJob cloud] HTTP', res.status, txt.slice(0, 200));
    }
    return res;
  } catch (err) {
    console.warn('[MapJob cloud] network error:', err);
    return null;
  }
}

export async function registerDevice(deviceId: string, label?: string): Promise<void> {
  await call('/devices?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: deviceId,
      label: label ?? null,
      last_seen_at: new Date().toISOString(),
    }),
  });
}

export async function pingDevice(deviceId: string): Promise<void> {
  await call(`/devices?id=eq.${encodeURIComponent(deviceId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
  });
}

export interface CloudGroup {
  fbGroupId: string;
  name: string;
  url: string;
  membersCount?: number;
  privacy?: 'public' | 'private' | 'unknown';
  isActive?: boolean;
}

export async function syncGroups(deviceId: string, groups: CloudGroup[]): Promise<void> {
  if (groups.length === 0) return;
  const rows = groups.map((g) => ({
    device_id: deviceId,
    fb_group_id: g.fbGroupId,
    name: g.name,
    url: g.url,
    members_count: g.membersCount ?? null,
    privacy: g.privacy ?? 'unknown',
    is_active: g.isActive ?? true,
  }));
  await call('/imported_groups?on_conflict=device_id,fb_group_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

export interface CloudPublication {
  id: string;
  fbGroupId: string;
  groupName?: string;
  campaignName?: string;
  postTitle?: string;
  postBody: string;
  status: 'pending' | 'queued' | 'in_progress' | 'posted' | 'skipped' | 'failed';
  scheduledAt?: number;
  attemptedAt?: number;
  postedAt?: number;
  fbPostUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

function tsOrNull(t?: number): string | null {
  return t ? new Date(t).toISOString() : null;
}

export async function upsertPublication(deviceId: string, p: CloudPublication): Promise<void> {
  await call('/publications?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: p.id,
      device_id: deviceId,
      fb_group_id: p.fbGroupId,
      group_name: p.groupName ?? null,
      campaign_name: p.campaignName ?? null,
      post_title: p.postTitle ?? null,
      post_body: p.postBody,
      status: p.status,
      scheduled_at: tsOrNull(p.scheduledAt),
      attempted_at: tsOrNull(p.attemptedAt),
      posted_at: tsOrNull(p.postedAt),
      fb_post_url: p.fbPostUrl ?? null,
      error_code: p.errorCode ?? null,
      error_message: p.errorMessage ?? null,
    }),
  });
}

export async function updatePublicationStatus(
  publicationId: string,
  patch: Partial<{ status: CloudPublication['status']; postedAt: number; fbPostUrl: string; errorCode: string; errorMessage: string }>,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.postedAt !== undefined) body.posted_at = tsOrNull(patch.postedAt);
  if (patch.fbPostUrl !== undefined) body.fb_post_url = patch.fbPostUrl;
  if (patch.errorCode !== undefined) body.error_code = patch.errorCode;
  if (patch.errorMessage !== undefined) body.error_message = patch.errorMessage;

  await call(`/publications?id=eq.${encodeURIComponent(publicationId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export interface CloudActivity {
  eventType: 'scrape' | 'post_started' | 'post_done' | 'post_failed' | 'login_needed' | 'campaign_started' | 'sync';
  message: string;
  fbGroupId?: string;
  meta?: Record<string, unknown>;
}

export async function logActivity(deviceId: string, activity: CloudActivity): Promise<void> {
  await call('/activity_log', {
    method: 'POST',
    body: JSON.stringify({
      device_id: deviceId,
      event_type: activity.eventType,
      message: activity.message,
      fb_group_id: activity.fbGroupId ?? null,
      meta: activity.meta ?? {},
    }),
  });
}

export async function recordEngagement(publicationId: string, reactions: number, comments: number, shares = 0): Promise<void> {
  await call('/engagement', {
    method: 'POST',
    body: JSON.stringify({
      publication_id: publicationId,
      reactions_count: reactions,
      comments_count: comments,
      shares_count: shares,
    }),
  });
}

export function getCloudConfig(): { url: string; key: string } {
  return { url: SUPA_URL, key: SUPA_KEY };
}
