import { VaultSession } from '@/lib/cryptoVault';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Sensitive prefix `fetish_lab_` → sealed ck1: when vault is unlocked. */
const LEISURE_PROGRESS_KEY = 'fetish_lab_leisure_progress_v1';

/**
 * Save step data for the Leisure Suite Larry game.
 * The data can be any serialisable value; it will be encrypted with the current vault key.
 */
export async function saveGameStep(step: number, data: unknown): Promise<void> {
  const existing = await loadGameProgress();
  const updated = { ...existing, [step]: data };
  const sealed = await VaultSession.seal(updated);
  await AsyncStorage.setItem(LEISURE_PROGRESS_KEY, sealed);
}

/** Load all saved progress for the game. Returns a map of step -> data. */
export async function loadGameProgress(): Promise<Record<number, unknown>> {
  const raw = await AsyncStorage.getItem(LEISURE_PROGRESS_KEY);
  if (!raw) return {};
  try {
    const opened = await VaultSession.open<Record<number, unknown>>(raw);
    return opened ?? {};
  } catch {
    return {};
  }
}
