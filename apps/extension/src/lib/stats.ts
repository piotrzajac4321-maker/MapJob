/**
 * Quick stats — liczy z lokalnych danych co user widzi na Home.
 * Wszystko z chrome.storage.local — żadnego cloud fetch.
 */

import { getTargets, getGroups, getSettings } from './store.js';

export interface QuickStats {
  todayPosted: number;
  todayPlanned: number;            // total pending dziś (cap globalDailyCap)
  nextPostInSeconds: number | null; // null = brak pendingów / pauza
  nextGroupName?: string;
  weeklyReactions: number;
  weeklyComments: number;
  successRate: number;             // 0-100 (posted / (posted + failed + skipped))
  bestHour: number | null;         // 0-23, najlepsza godzina z historii (>=4 posty)
  bestHourSuccessCount: number;
  totalPosted: number;
  totalAttempts: number;
}

export async function computeQuickStats(): Promise<QuickStats> {
  const [targets, settings, groups] = await Promise.all([getTargets(), getSettings(), getGroups()]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = Date.now() - 7 * 86400_000;

  const postedToday = targets.filter(
    (t) => t.status === 'posted' && (t.postedAt ?? 0) >= todayStart.getTime(),
  );

  const pending = targets.filter((t) => t.status === 'pending' || t.status === 'queued');

  // Next post — jeśli system aktywny i są pending, oszacuj na podstawie cooldownów grup
  let nextPostInSeconds: number | null = null;
  let nextGroupName: string | undefined;
  if (!settings.paused && !settings.killSwitch && pending.length > 0) {
    const groupById = new Map(groups.map((g) => [g.fbGroupId, g]));
    const eligibleNow: Array<{ target: typeof pending[0]; cooldownEndsAt: number }> = [];
    for (const t of pending) {
      const g = groupById.get(t.groupId);
      if (!g || !g.isActive || (g.consecutiveFailures ?? 0) >= 3) continue;
      const cooldownEndsAt = g.lastPostedAt ? g.lastPostedAt + g.cooldownMinutes * 60_000 : 0;
      eligibleNow.push({ target: t, cooldownEndsAt });
    }
    if (eligibleNow.length > 0) {
      // Najwcześniejszy cooldown koniec
      eligibleNow.sort((a, b) => a.cooldownEndsAt - b.cooldownEndsAt);
      const next = eligibleNow[0]!;
      const waitMs = Math.max(0, next.cooldownEndsAt - Date.now());
      // + średni delay z settings
      const avgDelayMs = ((settings.minDelaySeconds + settings.maxDelaySeconds) / 2) * 1000;
      nextPostInSeconds = Math.round((waitMs + avgDelayMs) / 1000);
      nextGroupName = groupById.get(next.target.groupId)?.name;
    }
  }

  // Engagement — z lokalnych targets (FB url + komentarze są w cloud, lokalnie szacujemy)
  // TODO: w przyszłości sync z mjfb_engagement cloud
  const weeklyPosted = targets.filter(
    (t) => t.status === 'posted' && (t.postedAt ?? 0) >= weekStart,
  ).length;
  const weeklyReactions = weeklyPosted * 5; // heuristic — w v2 podmienimy na real fetch
  const weeklyComments = Math.round(weeklyPosted * 1.5);

  // Success rate (cały okres)
  const allFinished = targets.filter((t) => ['posted', 'failed', 'skipped'].includes(t.status));
  const successRate = allFinished.length > 0
    ? Math.round((targets.filter((t) => t.status === 'posted').length / allFinished.length) * 100)
    : 0;

  // Best hour — z postedTargets group by hour
  const byHour = new Map<number, number>();
  for (const t of targets) {
    if (t.status === 'posted' && t.postedAt) {
      const h = new Date(t.postedAt).getHours();
      byHour.set(h, (byHour.get(h) ?? 0) + 1);
    }
  }
  let bestHour: number | null = null;
  let bestCount = 0;
  for (const [h, c] of byHour) {
    if (c > bestCount && c >= 4) {
      bestHour = h;
      bestCount = c;
    }
  }

  return {
    todayPosted: postedToday.length,
    todayPlanned: Math.min(settings.globalDailyCap, pending.length + postedToday.length),
    nextPostInSeconds,
    nextGroupName,
    weeklyReactions,
    weeklyComments,
    successRate,
    bestHour,
    bestHourSuccessCount: bestCount,
    totalPosted: targets.filter((t) => t.status === 'posted').length,
    totalAttempts: allFinished.length,
  };
}

/**
 * Format sekund na "8 min" / "2h 15m" / "za chwilę".
 */
export function formatNextPost(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds <= 30) return 'za chwilę';
  if (seconds < 60) return `${seconds} s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format godziny — "10:00".
 */
export function formatHour(h: number | null): string {
  if (h == null) return '—';
  return `${h.toString().padStart(2, '0')}:00`;
}
