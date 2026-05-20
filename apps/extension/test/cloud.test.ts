/**
 * Testy cloud.ts — retry logic, sync status, prefix tabel.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cloud from '../src/lib/cloud';

const originalFetch = globalThis.fetch;

describe('cloud — retry + status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset module-internal state — wymaga re-importu lub clear
  });

  it('getCloudConfig zwraca URL i key', () => {
    const c = cloud.getCloudConfig();
    expect(c.url).toMatch(/^https:\/\//);
    expect(c.key).toBeTruthy();
  });

  it('getSyncStatus zwraca enabled + status', () => {
    const s = cloud.getSyncStatus();
    expect(typeof s.enabled).toBe('boolean');
    expect(['ok', 'offline', 'no_schema', 'unknown']).toContain(s.status);
    expect(typeof s.lastSyncAt).toBe('number');
  });
});

describe('cloud — call() retry behavior', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('sukces 200 → ok status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'x' }), { status: 200 }),
    );
    await cloud.registerDevice('test-dev', 'Test');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const s = cloud.getSyncStatus();
    expect(s.status).toBe('ok');
    expect(s.lastSyncAt).toBeGreaterThan(0);
  });

  it('network error → retry 3x', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const start = Date.now();
    await cloud.registerDevice('test-dev', 'Test');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    // Powinno trwać przynajmniej 1s + 3s = 4s (przed 3. próbą)
    expect(Date.now() - start).toBeGreaterThanOrEqual(3500);
    const s = cloud.getSyncStatus();
    expect(s.status).toBe('offline');
  }, 15_000);

  it('HTTP 500 → NIE retry (server error, nie retry)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('Internal Error', { status: 500 }),
    );
    await cloud.registerDevice('test-dev', 'Test');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const s = cloud.getSyncStatus();
    expect(s.status).toBe('offline');
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });
});

// Note: afterAll wymaga importu
import { afterAll } from 'vitest';
