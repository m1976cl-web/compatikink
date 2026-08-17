import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  VaultSession,
  encryptPayload,
  decryptPayload,
  isSealedBlob,
  isSensitiveStorageKey,
} from '@/lib/cryptoVault';
import { getInitiatorToken } from '@/lib/storage/sessionStorage';
import { setCurrentProfile } from '@/lib/storage/profileStorage';

const TOKEN_KEY = 'initiator_token';
const CURRENT_PROFILE_NICKNAME_KEY = 'current_profile_nickname';
const PROFILES_KEY = 'local_user_profiles';
const SESSIONS_KEY = 'local_sessions';

export async function panicWipeData(): Promise<void> {
  VaultSession.lock();

  const keys = await AsyncStorage.getAllKeys();
  const keysToRemove = keys.filter(
    (k) =>
      isSensitiveStorageKey(k) ||
      k.startsWith('initiator_') ||
      k.startsWith('local_sessions') ||
      k.startsWith('scene_agreements_') ||
      k.startsWith('local_user_profiles') ||
      k.startsWith('current_profile_') ||
      k.startsWith('scene_debriefs_') ||
      k.startsWith('guest_draft_') ||
      k.startsWith('guest_profile_') ||
      k.startsWith('private_album_') ||
      k.startsWith('dating_') ||
      k.startsWith('user_wishlist') ||
      k.startsWith('custom_activities') ||
      k.startsWith('ds_') ||
      k.startsWith('ephemeral_') ||
      k.startsWith('linked_') ||
      k.startsWith('partner_') ||
      k.startsWith('joint_') ||
      k.includes('compatikink') ||
      k.includes('vault')
  );
  if (keysToRemove.length > 0) {
    await AsyncStorage.multiRemove(keysToRemove);
  }

  const remaining = await AsyncStorage.getAllKeys();
  const extra = remaining.filter(
    (k) =>
      k.startsWith('ck_') ||
      k === TOKEN_KEY ||
      k === CURRENT_PROFILE_NICKNAME_KEY ||
      k === PROFILES_KEY ||
      k === SESSIONS_KEY
  );
  if (extra.length > 0) {
    await AsyncStorage.multiRemove(extra);
  }

  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  await setCurrentProfile(null);
}

export async function exportUserDataJSON(passphrase?: string): Promise<string> {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Se requiere una contraseña de exportación (mín. 4 caracteres) para el backup cifrado.');
  }

  const keys = await AsyncStorage.getAllKeys();
  const data: Record<string, string | null> = {};
  for (const key of keys) {
    data[key] = await AsyncStorage.getItem(key);
  }
  const bundle = {
    version: '2.0-encrypted',
    kdf: 'PBKDF2-SHA-256',
    exportedAt: new Date().toISOString(),
    storageData: data,
  };
  return encryptPayload(bundle, passphrase);
}

export async function importUserDataJSON(jsonString: string, passphrase?: string): Promise<number> {
  let parsed: { storageData?: Record<string, string | null> };

  if (isSealedBlob(jsonString)) {
    if (!passphrase) {
      throw new Error('Este backup está cifrado. Indica la contraseña de exportación.');
    }
    parsed = await decryptPayload(jsonString, passphrase);
  } else {
    parsed = JSON.parse(jsonString);
  }

  if (!parsed || !parsed.storageData) {
    throw new Error('Formato de backup no válido.');
  }
  const entries = Object.entries(parsed.storageData as Record<string, string | null>);
  let count = 0;
  for (const [key, val] of entries) {
    if (val !== null) {
      await AsyncStorage.setItem(key, val);
      count++;
    }
  }
  return count;
}

export async function purgeAllUserData(): Promise<void> {
  try {
    const token = await getInitiatorToken();
    if (token) {
      const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
      if (isSupabaseConfigured && supabase) {
        await supabase.rpc('purge_user_session_by_token', { p_token: token });
      }
    }
  } catch {
    // Best-effort remote wipe ignore
  }

  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {}
  }

  await AsyncStorage.clear();

  const { VaultLockGateAPI } = await import('@/lib/cryptoVault');
  VaultLockGateAPI.lock();
}
