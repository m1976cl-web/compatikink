/**
 * Web Notifications Helper — Feature 1
 * Manages Web Notification API permissions and local scheduled reminders
 * for Daily Submissive Acts, Scene Check-ins, and Aftercare.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIF_PREF_KEY = 'compatikink_notification_prefs_v1';

export interface NotificationPrefs {
  enabled: boolean;
  dailyReminderHour: number; // 0-23
  sceneCheckinReminder: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  enabled: false,
  dailyReminderHour: 20, // 8 PM default
  sceneCheckinReminder: true,
};

/** Check if Web Notifications are supported in current browser environment */
export function isNotificationSupported(): boolean {
  if (Platform.OS !== 'web') return false;
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('[Notifications] Permission request error:', err);
    return false;
  }
}

/** Get current permission state */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/** Trigger an immediate web notification */
export function triggerLocalNotification(title: string, body: string, icon = '🖤'): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(`${icon} ${title}`, {
      body,
      icon: '/compatikink/assets/icon.png',
      badge: '/compatikink/assets/icon.png',
      tag: 'compatikink-notification',
    });
    return true;
  } catch (err) {
    console.warn('[Notifications] Trigger error:', err);
    return false;
  }
}

/** Read persistent notification preferences */
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const json = await AsyncStorage.getItem(NOTIF_PREF_KEY);
    if (!json) return DEFAULT_NOTIF_PREFS;
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(json) };
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

/** Save notification preferences */
export async function saveNotificationPrefs(prefs: Partial<NotificationPrefs>): Promise<NotificationPrefs> {
  const current = await getNotificationPrefs();
  const updated = { ...current, ...prefs };
  await AsyncStorage.setItem(NOTIF_PREF_KEY, JSON.stringify(updated));
  return updated;
}
