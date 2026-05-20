/**
 * Testy logiki store.ts — pickNextTarget cooldown, daily cap, eligibility.
 * Mocked chrome.storage z setup.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  pickNextTarget,
  upsertGroups,
  getGroups,
  saveCampaign,
  saveTargets,
  getTargets,
  markGroupPosted,
  updateTarget,
  setSettings,
  getSettings,
  getDeviceId,
} from '../src/lib/store';

describe('Store — group management', () => {
  it('upsertGroups dodaje nowe grupy i updateuje istniejące', async () => {
    const r1 = await upsertGroups([
      { fbGroupId: '111', name: 'Grupa A', url: 'https://fb.com/groups/111', membersCount: 100 },
    ]);
    expect(r1.added).toBe(1);
    expect(r1.updated).toBe(0);

    const r2 = await upsertGroups([
      { fbGroupId: '111', name: 'Grupa A v2', url: 'https://fb.com/groups/111', membersCount: 200 },
      { fbGroupId: '222', name: 'Grupa B', url: 'https://fb.com/groups/222' },
    ]);
    expect(r2.added).toBe(1);
    expect(r2.updated).toBe(1);

    const all = await getGroups();
    expect(all).toHaveLength(2);
    const groupA = all.find((g) => g.fbGroupId === '111');
    expect(groupA?.name).toBe('Grupa A v2');
    expect(groupA?.membersCount).toBe(200);
  });

  it('markGroupPosted ustawia lastPostedAt', async () => {
    await upsertGroups([{ fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111' }]);
    const before = (await getGroups())[0]!;
    expect(before.lastPostedAt).toBeUndefined();

    const now = Date.now();
    await markGroupPosted('111');
    const after = (await getGroups())[0]!;
    expect(after.lastPostedAt).toBeGreaterThanOrEqual(now);
  });
});

describe('pickNextTarget — eligibility', () => {
  beforeEach(async () => {
    await setSettings({
      paused: false,
      minDelaySeconds: 30,
      maxDelaySeconds: 90,
      globalDailyCap: 50,
    });
  });

  it('zwraca null gdy paused', async () => {
    await setSettings({ paused: true });
    expect(await pickNextTarget()).toBeNull();
  });

  it('zwraca null gdy brak running campaigns', async () => {
    await upsertGroups([{ fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111' }]);
    await saveCampaign({ id: 'c1', name: 'Test', postId: 'p1', groupIds: ['111'], status: 'draft', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'x' }]);
    expect(await pickNextTarget()).toBeNull();
  });

  it('pomija grupy w cooldownie', async () => {
    const now = Date.now();
    await upsertGroups([
      { fbGroupId: '111', name: 'Cooled', url: 'https://fb.com/groups/111', cooldownMinutes: 240, isActive: true },
    ]);
    // Simulate recent post 10 min ago — cooldown 240
    const groups = await getGroups();
    groups[0]!.lastPostedAt = now - 10 * 60_000;
    await chrome.storage.local.set({ groups });

    await saveCampaign({ id: 'c1', name: 'Test', postId: 'p1', groupIds: ['111'], status: 'running', createdAt: now });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'x' }]);

    expect(await pickNextTarget()).toBeNull();
  });

  it('pomija nieaktywne grupy', async () => {
    await upsertGroups([{ fbGroupId: '111', name: 'Inactive', url: 'https://fb.com/groups/111' }]);
    // upsertGroups default isActive: true — wymuszam false bezpośrednio
    const groups = await getGroups();
    groups[0]!.isActive = false;
    await chrome.storage.local.set({ groups });

    await saveCampaign({ id: 'c1', name: 'Test', postId: 'p1', groupIds: ['111'], status: 'running', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'x' }]);

    expect(await pickNextTarget()).toBeNull();
  });

  it('enforce per-group daily cap — 2 posty / dzień default', async () => {
    const now = Date.now();
    await upsertGroups([
      { fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111', cooldownMinutes: 0, dailyCap: 2 },
    ]);
    await saveCampaign({ id: 'c1', name: 'Test', postId: 'p1', groupIds: ['111'], status: 'running', createdAt: now });
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: '111', status: 'posted', postedAt: now - 3600_000, renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: '111', status: 'posted', postedAt: now - 1800_000, renderedText: 'y' },
      { id: 't3', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'z' },
    ]);
    // 2 posty już w tej grupie dziś + dailyCap=2 → blokada t3
    const next = await pickNextTarget();
    expect(next).toBeNull();
  });

  it('enforce global daily cap', async () => {
    await setSettings({ globalDailyCap: 1 });
    const now = Date.now();
    await upsertGroups([
      { fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111', cooldownMinutes: 0 },
      { fbGroupId: '222', name: 'B', url: 'https://fb.com/groups/222', cooldownMinutes: 0 },
    ]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['111', '222'], status: 'running', createdAt: now });
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: '111', status: 'posted', postedAt: now - 1000, renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: '222', status: 'pending', renderedText: 'y' },
    ]);

    expect(await pickNextTarget()).toBeNull();
  });

  it('respektuje scheduledAt w przyszłości', async () => {
    const now = Date.now();
    await upsertGroups([{ fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111', cooldownMinutes: 0 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['111'], status: 'running', createdAt: now });
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', scheduledAt: now + 3600_000, renderedText: 'x' },
    ]);

    expect(await pickNextTarget()).toBeNull();
  });

  it('zwraca target gdy wszystko OK', async () => {
    const now = Date.now();
    await upsertGroups([{ fbGroupId: '111', name: 'A', url: 'https://fb.com/groups/111', cooldownMinutes: 240 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['111'], status: 'running', createdAt: now });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'hi' }]);

    const result = await pickNextTarget();
    expect(result).not.toBeNull();
    expect(result?.target.id).toBe('t1');
    expect(result?.group.fbGroupId).toBe('111');
    expect(result?.delaySec).toBeGreaterThanOrEqual(30);
    expect(result?.delaySec).toBeLessThanOrEqual(90);
  });
});

describe('updateTarget', () => {
  it('updateuje pojedynczy target nie ruszając innych', async () => {
    const now = Date.now();
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'a' },
      { id: 't2', campaignId: 'c1', groupId: '222', status: 'pending', renderedText: 'b' },
    ]);
    await updateTarget('t1', { status: 'posted', postedAt: now });

    const all = await getTargets();
    expect(all.find((t) => t.id === 't1')?.status).toBe('posted');
    expect(all.find((t) => t.id === 't1')?.postedAt).toBe(now);
    expect(all.find((t) => t.id === 't2')?.status).toBe('pending');
  });

  it('updateuje target nawet jeśli ID nie istnieje (no-op)', async () => {
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: '111', status: 'pending', renderedText: 'a' }]);
    await updateTarget('nonexistent', { status: 'posted' });
    const all = await getTargets();
    expect(all).toHaveLength(1);
    expect(all[0]!.status).toBe('pending');
  });
});

describe('getDeviceId', () => {
  it('generuje stabilny UUID przy pierwszym wywołaniu', async () => {
    const id1 = await getDeviceId();
    const id2 = await getDeviceId();
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^[0-9a-f-]{36}$/);
  });
});
