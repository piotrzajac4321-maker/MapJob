/**
 * Actionable insights — co user może zrobić żeby polepszyć wyniki.
 * Liczone z lokalnych targets, groups, posts.
 */

import { getTargets, getGroups, getPosts } from './store.js';

export interface Insight {
  id: string;
  severity: 'info' | 'tip' | 'warning';
  title: string;
  description: string;
  actionLabel?: string;
  actionType?: 'open_groups' | 'open_assistant' | 'open_settings';
}

export async function computeInsights(): Promise<Insight[]> {
  const [targets, groups, posts] = await Promise.all([getTargets(), getGroups(), getPosts()]);
  const insights: Insight[] = [];

  const posted = targets.filter((t) => t.status === 'posted' && t.postedAt);
  const failed = targets.filter((t) => t.status === 'failed');

  // 1. BEST HOUR
  if (posted.length >= 10) {
    const byHour = new Map<number, number>();
    for (const t of posted) {
      const h = new Date(t.postedAt!).getHours();
      byHour.set(h, (byHour.get(h) ?? 0) + 1);
    }
    let bestH = -1, bestC = 0;
    for (const [h, c] of byHour) {
      if (c > bestC) { bestH = h; bestC = c; }
    }
    if (bestH >= 0 && bestC >= 3) {
      insights.push({
        id: 'best_hour',
        severity: 'tip',
        title: `🕐 Twoja godzina mocy: ${bestH.toString().padStart(2, '0')}:00`,
        description: `${bestC} z ${posted.length} ostatnich postów poszło o tej godzinie. Rozważ ustawienie schedulera żeby częściej trafiać w to okno.`,
        actionLabel: 'Otwórz harmonogram',
        actionType: 'open_settings',
      });
    }
  }

  // 2. BEST DAY OF WEEK
  if (posted.length >= 15) {
    const byDay = new Map<number, number>();
    const dayNames = ['niedz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
    for (const t of posted) {
      const d = new Date(t.postedAt!).getDay();
      byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    let bestD = -1, bestC = 0;
    for (const [d, c] of byDay) {
      if (c > bestC) { bestD = d; bestC = c; }
    }
    if (bestD >= 0 && bestC >= 4) {
      insights.push({
        id: 'best_day',
        severity: 'tip',
        title: `📅 Najlepszy dzień: ${dayNames[bestD]}`,
        description: `${bestC} publikacji w ten dzień. Skup się na nim w schedulerze.`,
      });
    }
  }

  // 3. NIESKUTECZNE GRUPY (3+ failures, isActive)
  const groupFailures = new Map<string, { failures: number; total: number; name: string }>();
  for (const t of targets) {
    if (t.status !== 'failed' && t.status !== 'posted') continue;
    const g = groups.find((x) => x.fbGroupId === t.groupId);
    if (!g || !g.isActive) continue;
    const cur = groupFailures.get(t.groupId) ?? { failures: 0, total: 0, name: g.name };
    cur.total += 1;
    if (t.status === 'failed') cur.failures += 1;
    groupFailures.set(t.groupId, cur);
  }
  const badGroups = Array.from(groupFailures.values())
    .filter((g) => g.total >= 3 && g.failures / g.total > 0.5)
    .sort((a, b) => b.failures / b.total - a.failures / a.total);
  if (badGroups.length > 0) {
    const top = badGroups.slice(0, 3);
    insights.push({
      id: 'bad_groups',
      severity: 'warning',
      title: `⚠ ${badGroups.length} ${badGroups.length === 1 ? 'grupa' : 'grupy'} z niskim success rate`,
      description: `${top.map((g) => `"${g.name}" (${g.failures}/${g.total} fail)`).join(', ')} — sprawdź czy nie wymaga aprobaty mod.`,
      actionLabel: 'Przejrzyj grupy',
      actionType: 'open_groups',
    });
  }

  // 4. BRAK GRUP / POSTÓW
  if (groups.length === 0) {
    insights.push({
      id: 'no_groups',
      severity: 'info',
      title: '👥 Brak zaimportowanych grup',
      description: 'Zaimportuj listę grup z FB żeby rozpocząć.',
    });
  } else if (groups.filter((g) => g.isActive).length === 0) {
    insights.push({
      id: 'no_active_groups',
      severity: 'warning',
      title: '⚠ Żadna grupa nie jest aktywna',
      description: 'Aktywuj minimum 1 grupę w zakładce Grupy.',
      actionLabel: 'Otwórz Grupy',
      actionType: 'open_groups',
    });
  }

  if (posts.length === 0) {
    insights.push({
      id: 'no_posts',
      severity: 'info',
      title: '📝 Brak postów',
      description: 'Zacznij od Asystenta — wybierz framework, wypełnij pola.',
      actionLabel: 'Otwórz Asystenta',
      actionType: 'open_assistant',
    });
  }

  // 5. WYSOKI FAILURE RATE GLOBALNY
  if (posted.length + failed.length >= 10) {
    const rate = failed.length / (posted.length + failed.length);
    if (rate > 0.4) {
      insights.push({
        id: 'high_fail_rate',
        severity: 'warning',
        title: `⚠ Wysoki % błędów: ${Math.round(rate * 100)}%`,
        description: 'Coś nie działa. Sprawdź czy jesteś zalogowany do FB i czy DOM się nie zmienił. Spróbuj jednej kampanii ręcznie.',
      });
    }
  }

  return insights;
}
