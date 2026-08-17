import { Platform } from 'react-native';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

const PUSH_TOKEN_STORAGE_KEY = 'expo_push_token_v1';
const PUSH_PREFS_STORAGE_KEY = 'push_notification_preferences_v1';

export interface PushPreferences {
  enabledAftercare: boolean;
  enabledDsTasks: boolean;
  enabledCommunity: boolean;
  pushToken?: string;
}

export async function requestPushPermissions(): Promise<{ granted: boolean; token?: string }> {
  if (Platform.OS === 'web') {
    // Web Push API Fallback
    if ('Notification' in window) {
      const permission = await window.Notification.requestPermission();
      const granted = permission === 'granted';
      if (granted) {
        const fakeWebToken = `ExponentPushToken[web_${Date.now()}]`;
        await writeJsonStorage(PUSH_TOKEN_STORAGE_KEY, fakeWebToken);
        return { granted: true, token: fakeWebToken };
      }
    }
    return { granted: false };
  }

  // Native Expo Push Token request via dynamic import fallback
  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    await writeJsonStorage(PUSH_TOKEN_STORAGE_KEY, token);
    return { granted: true, token };
  } catch (_e) {
    return { granted: false };
  }
}

export async function getSavedPushToken(): Promise<string | null> {
  return readJsonStorage<string | null>(PUSH_TOKEN_STORAGE_KEY, null);
}

export async function loadPushPreferences(): Promise<PushPreferences> {
  return readJsonStorage<PushPreferences>(PUSH_PREFS_STORAGE_KEY, {
    enabledAftercare: true,
    enabledDsTasks: true,
    enabledCommunity: true,
  });
}

export async function savePushPreferences(prefs: PushPreferences): Promise<void> {
  await writeJsonStorage(PUSH_PREFS_STORAGE_KEY, prefs);
}
