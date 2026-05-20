/**
 * Testy schedulera + smart pause + duplicateCampaign.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  pickNextTarget,
  upsertGroups,
  saveCampaign,
  saveTargets,
  setSettings,
  duplicateCampaign,
  getCampaigns,
  getTargets,
  savePost,
  DEFAULT_SCHEDULE,
} from '../src/lib/store';

beforeEach(async () => {
  await setSettings({
    paused: false,
    pauseUntil: undefined,
    killSwitch: false,
    sleepHoursEnabled: false,
    globalDailyCap: 50,
    minDelaySeconds: 30,
    maxDelaySeconds: 90,
  });
});

describe('Smart Pause — pauseUntil', () => {
  it('zwraca null gdy pauseUntil w przyszłości', async () => {
    await setSettings({ paused: true, pauseUntil: Date.now() + 3600_000 });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1', cooldownMinutes: 0 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['g1'], status: 'running', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' }]);
    expect(await pickNextTarget()).toBeNull();
  });

  it('auto-wznawia gdy pauseUntil minęło', async () => {
    await setSettings({ paused: true, pauseUntil: Date.now() - 1000 });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1', cooldownMinutes: 0 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['g1'], status: 'running', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' }]);

    const result = await pickNextTarget();
    expect(result).not.toBeNull();
    expect(result?.target.id).toBe('t1');
  });
});

describe('Scheduler — config', () => {
  it('DEFAULT_SCHEDULE ma 7 dni', () => {
    expect(DEFAULT_SCHEDULE.days).toHaveLength(7);
  });

  it('domyślnie pn-pt enabled, sob/niedz disabled', () => {
    expect(DEFAULT_SCHEDULE.days[0]?.enabled).toBe(false); // niedz
    expect(DEFAULT_SCHEDULE.days[1]?.enabled).toBe(true);  // pon
    expect(DEFAULT_SCHEDULE.days[5]?.enabled).toBe(true);  // pt
    expect(DEFAULT_SCHEDULE.days[6]?.enabled).toBe(false); // sob
  });

  it('jeśli enabled i dzień disabled → null', async () => {
    const now = new Date();
    const today = now.getDay();
    // Wyłącz tylko dzisiejszy dzień
    const days: typeof DEFAULT_SCHEDULE.days = [
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
      { enabled: true, startHour: 0, endHour: 23 },
    ];
    days[today] = { enabled: false, startHour: 0, endHour: 23 };

    await setSettings({
      scheduler: { enabled: true, intervalMinutes: 90, jitterMinutes: 20, days },
    });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1', cooldownMinutes: 0 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['g1'], status: 'running', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' }]);

    expect(await pickNextTarget()).toBeNull();
  });

  it('blokuje gdy godzina poza oknem', async () => {
    const now = new Date();
    const today = now.getDay();
    const days: typeof DEFAULT_SCHEDULE.days = Array.from({ length: 7 }, () => ({ enabled: false, startHour: 0, endHour: 23 })) as typeof DEFAULT_SCHEDULE.days;
    // Wyłącz tylko teraz: zacznij okno za godzinę
    const nextHour = (now.getHours() + 2) % 24;
    days[today] = { enabled: true, startHour: nextHour, endHour: 23 };

    await setSettings({
      scheduler: { enabled: true, intervalMinutes: 90, jitterMinutes: 20, days },
    });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1', cooldownMinutes: 0 }]);
    await saveCampaign({ id: 'c1', name: 'T', postId: 'p1', groupIds: ['g1'], status: 'running', createdAt: Date.now() });
    await saveTargets([{ id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' }]);

    expect(await pickNextTarget()).toBeNull();
  });
});

describe('duplicateCampaign', () => {
  it('klonuje kampanię z nowym ID + targets jako pending', async () => {
    await savePost({ id: 'p1', title: 'Post', type: 'job', body: 'oryginał', createdAt: Date.now(), imageDataUrls: [] });
    await saveCampaign({ id: 'c1', name: 'Spawacze WWA', postId: 'p1', groupIds: ['g1', 'g2'], status: 'running', createdAt: Date.now() });
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: Date.now(), renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: Date.now(), renderedText: 'y' },
    ]);

    const cloned = await duplicateCampaign('c1');
    expect(cloned).not.toBeNull();
    expect(cloned!.id).not.toBe('c1');
    expect(cloned!.name).toBe('Klon: Spawacze WWA');
    expect(cloned!.status).toBe('running');

    const allCamps = await getCampaigns();
    expect(allCamps).toHaveLength(2);

    const newTargets = (await getTargets()).filter((t) => t.campaignId === cloned!.id);
    expect(newTargets).toHaveLength(2);
    expect(newTargets.every((t) => t.status === 'pending')).toBe(true);
    expect(newTargets.every((t) => t.renderedText === 'oryginał')).toBe(true);
  });

  it('zwraca null dla nieistniejącej kampanii', async () => {
    const r = await duplicateCampaign('nonexistent');
    expect(r).toBeNull();
  });

  it('drugi klon → "Klon: Spawacze" nie "Klon: Klon: Spawacze"', async () => {
    await savePost({ id: 'p1', title: 'P', type: 'job', body: 'b', createdAt: Date.now(), imageDataUrls: [] });
    await saveCampaign({ id: 'c1', name: 'Spawacze', postId: 'p1', groupIds: [], status: 'running', createdAt: Date.now() });
    const first = await duplicateCampaign('c1');
    expect(first?.name).toBe('Klon: Spawacze');
    const second = await duplicateCampaign(first!.id);
    expect(second?.name).toBe('Klon: Spawacze'); // ten sam prefix, bez podwajania
  });
});
