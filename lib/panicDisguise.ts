import { readJsonStorage, writeJsonStorage, VaultLockGateAPI } from '@/lib/cryptoVault';
import { triggerLightHaptic, triggerHeavyHaptic, triggerSuccessHaptic } from '@/lib/haptics';

export interface PanicDisguiseSettings {
  isFabEnabled: boolean;
  disguiseMode: 'calculator' | 'notes';
  secretCode: string;
  fabPosition: 'bottom_right' | 'bottom_left';
}

const DEFAULT_SETTINGS: PanicDisguiseSettings = {
  isFabEnabled: true,
  disguiseMode: 'calculator',
  secretCode: '1976',
  fabPosition: 'bottom_right',
};

const STORAGE_KEY = 'panic_disguise_settings_v1';

let isDisguiseActive = false;
const listeners = new Set<(active: boolean) => void>();

export async function getPanicSettings(): Promise<PanicDisguiseSettings> {
  return readJsonStorage<PanicDisguiseSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
}

export async function savePanicSettings(settings: Partial<PanicDisguiseSettings>): Promise<PanicDisguiseSettings> {
  const current = await getPanicSettings();
  const updated = { ...current, ...settings };
  await writeJsonStorage(STORAGE_KEY, updated);
  return updated;
}

export function subscribePanicDisguise(cb: (active: boolean) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isPanicDisguiseActive(): boolean {
  return isDisguiseActive;
}

/**
 * Triggers instant stealth mode:
 * 1. Seals/locks the client-side vault in RAM immediately.
 * 2. Emits haptic alert.
 * 3. Brings up the functional disguised Calculator or Notes overlay.
 */
export function triggerPanicDisguise() {
  isDisguiseActive = true;
  triggerHeavyHaptic();
  // Lock vault in memory immediately
  try {
    VaultLockGateAPI.lock();
  } catch {}

  listeners.forEach((cb) => cb(true));
}

/**
 * Dismisses the panic disguise overlay and returns to normal application flow.
 */
export function dismissPanicDisguise() {
  isDisguiseActive = false;
  triggerSuccessHaptic();
  listeners.forEach((cb) => cb(false));
}
