import { VaultSession } from '@/lib/cryptoVault';
import { bytesToBase64, base64ToBytes, sealWithKey, openWithKey } from '@/lib/cryptoVault';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Unique storage key for the leisure game progress
const LEISURE_PROGRESS_KEY = 'leisure_game_progress_v1';

/**
 * Save step data for the Leisure Suite Larry game.
 * The data can be any serialisable value; it will be encrypted with the current vault key.
 */
export async function saveGameStep(step: number, data: unknown): Promise<void> {
  // Retrieve any existing progress (or start a new object)
  const existingRaw = await AsyncStorage.getItem(LEISURE_PROGRESS_KEY);
  const existing = existingRaw ? (await openWithKey(JSON.parse(existingRaw) as string, VaultSession.getKeyOrNull()!)) as Record<number, unknown> : {};
  const updated = { ...existing, [step]: data };
  // Seal the whole progress object once per save to keep it simple
  const sealed = await VaultSession.seal(updated);
  await AsyncStorage.setItem(LEISURE_PROGRESS_KEY, sealed);
}

/** Load all saved progress for the game. Returns a map of step -> data. */
export async function loadGameProgress(): Promise<Record<number, unknown>> {
  const raw = await AsyncStorage.getItem(LEISURE_PROGRESS_KEY);
  if (!raw) return {};
  // If vault is unlocked we can open, otherwise this will throw – caller should handle.
  const opened = await VaultSession.open<Record<number, unknown>>(raw);
  return opened ?? {};
}
