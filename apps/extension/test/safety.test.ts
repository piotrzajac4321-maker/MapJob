/**
 * Testy safety — anti-ban logic.
 */
import { describe, it, expect } from 'vitest';
import {
  SAFETY_PRESETS,
  isInSleepHours,
  detectBlockSignal,
  humanizeDelay,
  thinkingDelay,
  DEFAULT_SLEEP_HOURS,
  BLOCK_PAUSE_HOURS,
} from '../src/lib/safety';

describe('SAFETY_PRESETS', () => {
  it('safe ma najniższe limity', () => {
    expect(SAFETY_PRESETS.safe.globalDailyCap).toBeLessThan(SAFETY_PRESETS.standard.globalDailyCap);
    expect(SAFETY_PRESETS.standard.globalDailyCap).toBeLessThan(SAFETY_PRESETS.aggressive.globalDailyCap);
  });

  it('safe ma najdłuższe delays', () => {
    expect(SAFETY_PRESETS.safe.minDelaySeconds).toBeGreaterThan(SAFETY_PRESETS.standard.minDelaySeconds);
    expect(SAFETY_PRESETS.standard.minDelaySeconds).toBeGreaterThan(SAFETY_PRESETS.aggressive.minDelaySeconds);
  });

  it('safe ma najdłuższy cooldown', () => {
    expect(SAFETY_PRESETS.safe.defaultCooldownMinutes).toBeGreaterThan(SAFETY_PRESETS.standard.defaultCooldownMinutes);
  });

  it('safe ma najniższy daily cap per grupa (1)', () => {
    expect(SAFETY_PRESETS.safe.defaultGroupDailyCap).toBe(1);
  });

  it('aggressive ma warning', () => {
    expect(SAFETY_PRESETS.aggressive.warning).toBeTruthy();
    expect(SAFETY_PRESETS.aggressive.warning).toMatch(/ryzyko|risk/i);
  });
});

describe('isInSleepHours', () => {
  it('disabled → zawsze false', () => {
    const sleep = { enabled: false, startHour: 22, endHour: 8 };
    expect(isInSleepHours(sleep, new Date(2026, 4, 20, 3, 0))).toBe(false);
  });

  it('overnight (22-8): 3:00 jest w sleep', () => {
    const sleep = { enabled: true, startHour: 22, endHour: 8 };
    expect(isInSleepHours(sleep, new Date(2026, 4, 20, 3, 0))).toBe(true);
  });

  it('overnight (22-8): 23:30 jest w sleep', () => {
    expect(isInSleepHours(DEFAULT_SLEEP_HOURS, new Date(2026, 4, 20, 23, 30))).toBe(true);
  });

  it('overnight (22-8): 10:00 NIE jest w sleep', () => {
    expect(isInSleepHours(DEFAULT_SLEEP_HOURS, new Date(2026, 4, 20, 10, 0))).toBe(false);
  });

  it('overnight (22-8): 7:59 jeszcze w sleep, 8:00 już nie', () => {
    expect(isInSleepHours(DEFAULT_SLEEP_HOURS, new Date(2026, 4, 20, 7, 59))).toBe(true);
    expect(isInSleepHours(DEFAULT_SLEEP_HOURS, new Date(2026, 4, 20, 8, 0))).toBe(false);
  });

  it('day window (12-15): 13:30 jest w sleep', () => {
    const sleep = { enabled: true, startHour: 12, endHour: 15 };
    expect(isInSleepHours(sleep, new Date(2026, 4, 20, 13, 30))).toBe(true);
    expect(isInSleepHours(sleep, new Date(2026, 4, 20, 11, 30))).toBe(false);
  });
});

describe('detectBlockSignal', () => {
  it.each([
    'Security check, confirm your identity',
    'Tymczasowo zablokowany — spróbuj ponownie później',
    'You are posting too quickly',
    'Captcha',
    'Naruszenie standardów społeczności',
    'This feature is currently blocked',
  ])('wykrywa blokadę: %s', (text) => {
    const r = detectBlockSignal(text);
    expect(r.blocked).toBe(true);
    expect(r.matchedKeyword).toBeTruthy();
  });

  it.each([
    'Twój post został opublikowany',
    'Dodaj zdjęcie',
    'Lubię to',
    'Sprzedam iPhone',
  ])('nie wykrywa fałszywie: %s', (text) => {
    expect(detectBlockSignal(text).blocked).toBe(false);
  });
});

describe('humanizeDelay', () => {
  it('zwraca wartość w zakresie [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const d = humanizeDelay(30, 180);
      expect(d).toBeGreaterThanOrEqual(30);
      expect(d).toBeLessThanOrEqual(180);
    }
  });

  it('rozkład jest blisko centrum (test statystyczny)', () => {
    const samples = Array.from({ length: 1000 }, () => humanizeDelay(60, 300));
    const avg = samples.reduce((s, x) => s + x, 0) / samples.length;
    // Średnia powinna być blisko (60+300)/2 = 180, tolerancja ±30
    expect(avg).toBeGreaterThan(150);
    expect(avg).toBeLessThan(210);
  });
});

describe('thinkingDelay', () => {
  it('zwraca 5-25 sekund w ms', () => {
    for (let i = 0; i < 50; i++) {
      const d = thinkingDelay();
      expect(d).toBeGreaterThanOrEqual(5000);
      expect(d).toBeLessThanOrEqual(25_000);
    }
  });
});

describe('Stałe', () => {
  it('BLOCK_PAUSE_HOURS = 24', () => {
    expect(BLOCK_PAUSE_HOURS).toBe(24);
  });
});
