/**
 * Testy quick stats — best hour, success rate, next post estimation.
 */
import { describe, it, expect } from 'vitest';
import { computeQuickStats, formatNextPost, formatHour } from '../src/lib/stats';
import { upsertGroups, saveTargets, setSettings } from '../src/lib/store';

describe('formatNextPost', () => {
  it.each([
    [null, '—'],
    [10, 'za chwilę'],
    [45, '45 s'],
    [120, '2 min'],
    [3600, '1h'],
    [7200, '2h'],
    [5400, '1h 30m'],
  ])('formatNextPost(%s) = %s', (sec, expected) => {
    expect(formatNextPost(sec)).toBe(expected);
  });
});

describe('formatHour', () => {
  it.each([[null, '—'], [0, '00:00'], [9, '09:00'], [14, '14:00'], [23, '23:00']])(
    'formatHour(%s) = %s', (h, expected) => {
      expect(formatHour(h)).toBe(expected);
    },
  );
});

describe('computeQuickStats — pusty stan', () => {
  it('zwraca zera gdy nic nie ma', async () => {
    const s = await computeQuickStats();
    expect(s.todayPosted).toBe(0);
    expect(s.todayPlanned).toBe(0);
    expect(s.successRate).toBe(0);
    expect(s.bestHour).toBeNull();
    expect(s.nextPostInSeconds).toBeNull();
  });
});

describe('computeQuickStats — best hour', () => {
  it('zwraca godzinę z najwięcej postów (≥4)', async () => {
    const now = Date.now();
    // 5 postów o 10:00, 2 o 14:00
    const at = (h: number, daysAgo = 0) => {
      const d = new Date(now - daysAgo * 86400_000);
      d.setHours(h, 30, 0, 0);
      return d.getTime();
    };
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: at(10, 0), renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: at(10, 1), renderedText: 'x' },
      { id: 't3', campaignId: 'c1', groupId: 'g3', status: 'posted', postedAt: at(10, 2), renderedText: 'x' },
      { id: 't4', campaignId: 'c1', groupId: 'g4', status: 'posted', postedAt: at(10, 3), renderedText: 'x' },
      { id: 't5', campaignId: 'c1', groupId: 'g5', status: 'posted', postedAt: at(10, 4), renderedText: 'x' },
      { id: 't6', campaignId: 'c1', groupId: 'g6', status: 'posted', postedAt: at(14, 0), renderedText: 'x' },
      { id: 't7', campaignId: 'c1', groupId: 'g7', status: 'posted', postedAt: at(14, 1), renderedText: 'x' },
    ]);

    const s = await computeQuickStats();
    expect(s.bestHour).toBe(10);
    expect(s.bestHourSuccessCount).toBe(5);
  });

  it('zwraca null gdy < 4 postów w jednej godzinie', async () => {
    const now = Date.now();
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: now, renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: now, renderedText: 'x' },
    ]);
    const s = await computeQuickStats();
    expect(s.bestHour).toBeNull();
  });
});

describe('computeQuickStats — success rate', () => {
  it('liczy posted / (posted + failed + skipped)', async () => {
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: Date.now(), renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: Date.now(), renderedText: 'x' },
      { id: 't3', campaignId: 'c1', groupId: 'g3', status: 'posted', postedAt: Date.now(), renderedText: 'x' },
      { id: 't4', campaignId: 'c1', groupId: 'g4', status: 'failed', renderedText: 'x' },
      { id: 't5', campaignId: 'c1', groupId: 'g5', status: 'pending', renderedText: 'x' }, // nie liczone
    ]);
    const s = await computeQuickStats();
    expect(s.successRate).toBe(75); // 3 / 4 = 75%
    expect(s.totalAttempts).toBe(4);
    expect(s.totalPosted).toBe(3);
  });
});

describe('computeQuickStats — todayPosted', () => {
  it('liczy tylko publikacje z dzisiaj', async () => {
    const now = Date.now();
    const yesterday = now - 86400_000 - 3600_000; // > 24h temu
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: now - 100, renderedText: 'x' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: now - 1000, renderedText: 'x' },
      { id: 't3', campaignId: 'c1', groupId: 'g3', status: 'posted', postedAt: yesterday, renderedText: 'x' },
    ]);
    const s = await computeQuickStats();
    expect(s.todayPosted).toBe(2);
  });
});

describe('computeQuickStats — nextPostInSeconds', () => {
  it('null gdy paused', async () => {
    await setSettings({ paused: true });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1' }]);
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' },
    ]);
    const s = await computeQuickStats();
    expect(s.nextPostInSeconds).toBeNull();
  });

  it('null gdy killSwitch', async () => {
    await setSettings({ paused: false, killSwitch: true });
    await upsertGroups([{ fbGroupId: 'g1', name: 'A', url: 'https://fb.com/g1' }]);
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' },
    ]);
    const s = await computeQuickStats();
    expect(s.nextPostInSeconds).toBeNull();
  });

  it('liczy gdy są pendingi i grupa aktywna', async () => {
    await setSettings({ paused: false, killSwitch: false, minDelaySeconds: 60, maxDelaySeconds: 180 });
    await upsertGroups([{ fbGroupId: 'g1', name: 'Praca WWA', url: 'https://fb.com/g1' }]);
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'pending', renderedText: 'x' },
    ]);
    const s = await computeQuickStats();
    expect(s.nextPostInSeconds).not.toBeNull();
    // średni delay 120s + bez cooldown
    expect(s.nextPostInSeconds).toBeGreaterThanOrEqual(60);
    expect(s.nextPostInSeconds).toBeLessThanOrEqual(180);
    expect(s.nextGroupName).toBe('Praca WWA');
  });
});
