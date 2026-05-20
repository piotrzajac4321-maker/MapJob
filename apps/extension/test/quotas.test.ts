/**
 * Testy quotas — sprawdza że limity są właściwie egzekwowane.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkAllQuotas,
  canAddPublications,
  canAddGroups,
  canAddImages,
  getQuotaUsage,
  DEFAULT_LIMITS,
} from '../src/lib/quotas';
import { upsertGroups, saveTargets, savePost } from '../src/lib/store';

describe('Quotas — usage tracking', () => {
  it('zero everything na początku', async () => {
    const u = await getQuotaUsage();
    expect(u.publicationsThisMonth).toBe(0);
    expect(u.groupsImported).toBe(0);
    expect(u.imagesStored).toBe(0);
  });

  it('liczy publikacje w tym miesiącu', async () => {
    const now = Date.now();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await saveTargets([
      { id: 't1', campaignId: 'c1', groupId: 'g1', status: 'posted', postedAt: monthStart + 1000, renderedText: 'a' },
      { id: 't2', campaignId: 'c1', groupId: 'g2', status: 'posted', postedAt: now - 100, renderedText: 'b' },
      // Sprzed miesięcy
      { id: 't3', campaignId: 'c1', groupId: 'g3', status: 'posted', postedAt: monthStart - 86400_000, renderedText: 'c' },
      // Pending nie liczymy
      { id: 't4', campaignId: 'c1', groupId: 'g4', status: 'pending', renderedText: 'd' },
    ]);
    const u = await getQuotaUsage();
    expect(u.publicationsThisMonth).toBe(2);
  });

  it('liczy grupy i zdjęcia', async () => {
    await upsertGroups([
      { fbGroupId: '111', name: 'A', url: 'https://fb.com/111' },
      { fbGroupId: '222', name: 'B', url: 'https://fb.com/222' },
    ]);
    await savePost({
      id: 'p1', title: 'Test', type: 'job', body: 'body', createdAt: Date.now(),
      imageDataUrls: ['data:image/jpeg;base64,a', 'data:image/jpeg;base64,b', 'data:image/jpeg;base64,c'],
    });
    const u = await getQuotaUsage();
    expect(u.groupsImported).toBe(2);
    expect(u.imagesStored).toBe(3);
  });
});

describe('Quotas — blokady', () => {
  it('publications: zwraca błąd gdy próbujesz przekroczyć', async () => {
    // Wypełnij do 498/500 publikacji tego miesiąca
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const targets = Array.from({ length: 498 }, (_, i) => ({
      id: `t${i}`,
      campaignId: 'c1',
      groupId: `g${i}`,
      status: 'posted' as const,
      postedAt: monthStart + i,
      renderedText: 'x',
    }));
    await saveTargets(targets);

    // 2 więcej — OK
    expect(await canAddPublications(2)).toBeNull();
    // 3 więcej — blokada
    const err = await canAddPublications(3);
    expect(err).not.toBeNull();
    expect(err).toContain('500');
  });

  it('grupy: zwraca błąd gdy próbujesz przekroczyć 200', async () => {
    const groups = Array.from({ length: 200 }, (_, i) => ({
      fbGroupId: `g${i}`,
      name: `Grupa ${i}`,
      url: `https://fb.com/${i}`,
    }));
    await upsertGroups(groups);

    expect(await canAddGroups(0)).toBeNull();
    const err = await canAddGroups(1);
    expect(err).not.toBeNull();
    expect(err).toContain('200');
  });

  it('zdjęcia: zwraca błąd przy >50 łącznie', async () => {
    // 50 zdjęć w 1 poście (czyli MAX_IMAGES_PER_POST przekroczony jest osobno)
    // Symulujemy 49 zdjęć w storage
    await savePost({
      id: 'p1', title: 'T', type: 'job', body: 'b', createdAt: Date.now(),
      imageDataUrls: Array.from({ length: 49 }, (_, i) => `data:image/jpeg;base64,${i}`),
    });
    expect(await canAddImages(1)).toBeNull();
    const err = await canAddImages(2);
    expect(err).not.toBeNull();
    expect(err).toContain('50');
  });
});

describe('Quotas — checkAllQuotas raport', () => {
  it('zwraca pełen status: ok / warn / critical / blocked', async () => {
    // Wpisuje 80% publikacji (400/500) → warn
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    await saveTargets(
      Array.from({ length: 400 }, (_, i) => ({
        id: `t${i}`,
        campaignId: 'c1',
        groupId: `g${i}`,
        status: 'posted' as const,
        postedAt: monthStart + i,
        renderedText: 'x',
      })),
    );
    const q = await checkAllQuotas();
    expect(q.publications.percent).toBe(80);
    expect(q.publications.warning).toBe('warn');
    expect(q.anyBlocked).toBe(false);
  });

  it('anyBlocked = true gdy któryś przekroczony', async () => {
    await upsertGroups(
      Array.from({ length: DEFAULT_LIMITS.totalGroups + 5 }, (_, i) => ({
        fbGroupId: `g${i}`, name: `${i}`, url: `https://fb.com/${i}`,
      })),
    );
    const q = await checkAllQuotas();
    expect(q.groups.warning).toBe('blocked');
    expect(q.anyBlocked).toBe(true);
  });
});
