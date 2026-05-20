/**
 * Standalone storage — wszystko lokalnie w chrome.storage.
 * Brak backendu, brak Supabase. MVP self-contained.
 */

export interface FBGroup {
  fbGroupId: string;
  name: string;
  url: string;
  membersCount?: number;
  privacy?: 'public' | 'private' | 'unknown';
  cooldownMinutes: number;
  dailyCap: number;
  lastPostedAt?: number;
  isActive: boolean;
  tags: string[];
  postApprovalRequired?: boolean;
}

export interface PostTemplate {
  id: string;
  title: string;
  type: 'job' | 'sales' | 'other';
  body: string;
  imageDataUrls: string[];
  createdAt: number;
}

export interface CampaignTarget {
  id: string;
  campaignId: string;
  groupId: string;
  status: 'pending' | 'queued' | 'in_progress' | 'posted' | 'skipped' | 'failed';
  scheduledAt?: number;
  attemptedAt?: number;
  postedAt?: number;
  errorCode?: string;
  errorMessage?: string;
  renderedText: string;
}

export interface Campaign {
  id: string;
  name: string;
  postId: string;
  status: 'draft' | 'running' | 'paused' | 'done';
  minDelaySeconds: number;
  maxDelaySeconds: number;
  dailyCap: number;
  createdAt: number;
}

export interface ExtensionSettings {
  paused: boolean;
  globalDailyCap: number;
  defaultCooldownMinutes: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  paused: false,
  globalDailyCap: 100,
  defaultCooldownMinutes: 240,
  minDelaySeconds: 90,
  maxDelaySeconds: 240,
};

// ============ GROUPS ============
export async function getGroups(): Promise<FBGroup[]> {
  const { groups } = await chrome.storage.local.get('groups');
  return (groups as FBGroup[]) ?? [];
}

export async function saveGroups(groups: FBGroup[]): Promise<void> {
  await chrome.storage.local.set({ groups });
}

export async function upsertGroups(scraped: Array<Pick<FBGroup, 'fbGroupId' | 'name' | 'url' | 'membersCount' | 'privacy'>>): Promise<{ added: number; updated: number }> {
  const existing = await getGroups();
  const byId = new Map(existing.map((g) => [g.fbGroupId, g]));
  let added = 0;
  let updated = 0;

  for (const s of scraped) {
    const cur = byId.get(s.fbGroupId);
    if (cur) {
      cur.name = s.name;
      cur.url = s.url;
      if (s.membersCount) cur.membersCount = s.membersCount;
      if (s.privacy) cur.privacy = s.privacy;
      updated++;
    } else {
      byId.set(s.fbGroupId, {
        fbGroupId: s.fbGroupId,
        name: s.name,
        url: s.url,
        membersCount: s.membersCount,
        privacy: s.privacy ?? 'unknown',
        cooldownMinutes: 240,
        dailyCap: 2,
        isActive: true,
        tags: [],
      });
      added++;
    }
  }
  await saveGroups(Array.from(byId.values()));
  return { added, updated };
}

// ============ POSTS ============
export async function getPosts(): Promise<PostTemplate[]> {
  const { posts } = await chrome.storage.local.get('posts');
  return (posts as PostTemplate[]) ?? [];
}

export async function savePost(post: PostTemplate): Promise<void> {
  const all = await getPosts();
  const idx = all.findIndex((p) => p.id === post.id);
  if (idx >= 0) all[idx] = post;
  else all.unshift(post);
  await chrome.storage.local.set({ posts: all });
}

export async function deletePost(id: string): Promise<void> {
  const all = await getPosts();
  await chrome.storage.local.set({ posts: all.filter((p) => p.id !== id) });
}

// ============ CAMPAIGNS ============
export async function getCampaigns(): Promise<Campaign[]> {
  const { campaigns } = await chrome.storage.local.get('campaigns');
  return (campaigns as Campaign[]) ?? [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  return (await getCampaigns()).find((c) => c.id === id) ?? null;
}

export async function saveCampaign(c: Campaign): Promise<void> {
  const all = await getCampaigns();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  await chrome.storage.local.set({ campaigns: all });
}

export async function getTargets(campaignId?: string): Promise<CampaignTarget[]> {
  const { targets } = await chrome.storage.local.get('targets');
  const all = (targets as CampaignTarget[]) ?? [];
  return campaignId ? all.filter((t) => t.campaignId === campaignId) : all;
}

export async function saveTargets(newTargets: CampaignTarget[]): Promise<void> {
  const { targets } = await chrome.storage.local.get('targets');
  const all = (targets as CampaignTarget[]) ?? [];
  await chrome.storage.local.set({ targets: [...all, ...newTargets] });
}

export async function updateTarget(id: string, patch: Partial<CampaignTarget>): Promise<void> {
  const { targets } = await chrome.storage.local.get('targets');
  const all = (targets as CampaignTarget[]) ?? [];
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) {
    const current = all[idx];
    if (!current) return;
    all[idx] = { ...current, ...patch };
    await chrome.storage.local.set({ targets: all });
  }
}

/**
 * Pick next pending/queued target dla aktywnej kampanii.
 * Respektuje cooldown grupy + daily cap.
 */
export async function pickNextTarget(): Promise<{ target: CampaignTarget; group: FBGroup; delaySec: number } | null> {
  const [campaigns, allTargets, groups, settings] = await Promise.all([
    getCampaigns(),
    getTargets(),
    getGroups(),
    getSettings(),
  ]);

  if (settings.paused) return null;

  // Dzienny licznik
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const postedTodayAll = allTargets.filter(
    (t) => t.status === 'posted' && (t.postedAt ?? 0) >= todayStart.getTime(),
  );
  if (postedTodayAll.length >= settings.globalDailyCap) return null;

  // Per-group daily counter — żeby nie spamować pojedynczej grupy
  const postedTodayByGroup = new Map<string, number>();
  for (const t of postedTodayAll) {
    postedTodayByGroup.set(t.groupId, (postedTodayByGroup.get(t.groupId) ?? 0) + 1);
  }

  const runningCampaigns = new Set(campaigns.filter((c) => c.status === 'running').map((c) => c.id));
  const groupById = new Map(groups.map((g) => [g.fbGroupId, g]));

  const eligible = allTargets.filter((t) => {
    if (!runningCampaigns.has(t.campaignId)) return false;
    if (t.status !== 'pending' && t.status !== 'queued') return false;
    if (t.scheduledAt && t.scheduledAt > Date.now()) return false;
    const group = groupById.get(t.groupId);
    if (!group || !group.isActive) return false;
    // Cooldown
    if (group.lastPostedAt) {
      const cooldownMs = group.cooldownMinutes * 60_000;
      if (Date.now() - group.lastPostedAt < cooldownMs) return false;
    }
    // Per-group daily cap (zwykle 2 dziennie żeby FB nie flagował)
    const todayInGroup = postedTodayByGroup.get(t.groupId) ?? 0;
    if (todayInGroup >= group.dailyCap) return false;
    return true;
  });

  if (eligible.length === 0) return null;

  // Random pick z eligible
  const target = eligible[Math.floor(Math.random() * eligible.length)]!;
  const group = groupById.get(target.groupId)!;

  // Random delay
  const min = settings.minDelaySeconds;
  const max = settings.maxDelaySeconds;
  const delaySec = min + Math.floor(Math.random() * (max - min + 1));

  return { target, group, delaySec };
}

// ============ SETTINGS ============
export async function getSettings(): Promise<ExtensionSettings> {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings as Partial<ExtensionSettings> | undefined) };
}

export async function setSettings(patch: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ settings: { ...current, ...patch } });
}

// ============ DEVICE ============
export async function getDeviceId(): Promise<string> {
  const { deviceId } = await chrome.storage.local.get('deviceId');
  if (deviceId) return deviceId as string;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: id });
  return id;
}

// ============ ACTIVITY LOG ============
export interface ActivityEvent {
  ts: number;
  type: 'scrape' | 'post' | 'skip' | 'fail' | 'login_needed';
  message: string;
  groupName?: string;
}

export async function logActivity(event: Omit<ActivityEvent, 'ts'>): Promise<void> {
  const { activity } = await chrome.storage.local.get('activity');
  const all = ((activity as ActivityEvent[]) ?? []).slice(-200);
  all.push({ ts: Date.now(), ...event });
  await chrome.storage.local.set({ activity: all });
}

export async function getActivity(): Promise<ActivityEvent[]> {
  const { activity } = await chrome.storage.local.get('activity');
  return (activity as ActivityEvent[]) ?? [];
}

// ============ MARK POSTED ============
export async function markGroupPosted(fbGroupId: string): Promise<void> {
  const all = await getGroups();
  const g = all.find((x) => x.fbGroupId === fbGroupId);
  if (g) {
    g.lastPostedAt = Date.now();
    await saveGroups(all);
  }
}
