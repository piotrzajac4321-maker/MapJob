/**
 * Storage layer dla extension — używa chrome.storage.session (wymazany po restart)
 * dla wrażliwych danych (token), chrome.storage.local dla niezmiennych (deviceId, settings).
 */

export interface AuthState {
  token: string;
  orgId: string;
  userId: string;
  deviceId: string;
  expiresAt: number;
}

export interface ExtensionSettings {
  paused: boolean;
  minDelayMs: number;
  maxDelayMs: number;
  lastSyncAt?: number;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  paused: false,
  minDelayMs: 90_000,
  maxDelayMs: 240_000,
};

export async function getDeviceId(): Promise<string> {
  const { deviceId } = await chrome.storage.local.get('deviceId');
  if (deviceId) return deviceId as string;
  const newId = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: newId });
  return newId;
}

export async function getAuth(): Promise<AuthState | null> {
  const { auth } = await chrome.storage.session.get('auth');
  if (!auth) return null;
  if ((auth as AuthState).expiresAt < Date.now()) return null;
  return auth as AuthState;
}

export async function setAuth(state: AuthState): Promise<void> {
  await chrome.storage.session.set({ auth: state });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.session.remove('auth');
}

export async function getSettings(): Promise<ExtensionSettings> {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings as Partial<ExtensionSettings> | undefined) };
}

export async function setSettings(patch: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ settings: { ...current, ...patch } });
}
