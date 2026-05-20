/**
 * Test setup — mockuje chrome.storage.local (in-memory) i chrome.runtime.
 * Pozwala testować store.ts bez prawdziwego Chrome.
 */
import { vi, beforeEach } from 'vitest';

interface StorageStore {
  [key: string]: unknown;
}

let store: StorageStore = {};

const chromeMock = {
  storage: {
    local: {
      async get(keys?: string | string[] | null): Promise<StorageStore> {
        if (keys == null) return { ...store };
        if (typeof keys === 'string') {
          return keys in store ? { [keys]: store[keys] } : {};
        }
        if (Array.isArray(keys)) {
          const out: StorageStore = {};
          for (const k of keys) if (k in store) out[k] = store[k];
          return out;
        }
        return {};
      },
      async set(items: StorageStore): Promise<void> {
        Object.assign(store, items);
      },
      async clear(): Promise<void> {
        store = {};
      },
      async remove(keys: string | string[]): Promise<void> {
        const arr = Array.isArray(keys) ? keys : [keys];
        for (const k of arr) delete store[k];
      },
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    getManifest: () => ({ version: '0.1.0' }),
  },
  tabs: {
    create: vi.fn(),
    sendMessage: vi.fn(),
    onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
    remove: vi.fn(),
    query: vi.fn(async () => []),
  },
  alarms: {
    create: vi.fn(),
    onAlarm: { addListener: vi.fn() },
    getAll: vi.fn(async () => []),
  },
  notifications: {
    create: vi.fn(),
  },
};

(globalThis as any).chrome = chromeMock;

beforeEach(() => {
  store = {};
  vi.clearAllMocks();
});

export function getStore(): StorageStore {
  return store;
}
