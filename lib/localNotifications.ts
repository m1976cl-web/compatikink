import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalNotificationTask {
  id: string;
  title: string;
  body: string;
  triggerSeconds: number;
  scheduledAt: string;
  type: 'aftercare' | 'security_checkin' | 'daily_task' | 'vault_reminder';
}

const NOTIFICATIONS_STORAGE_KEY = 'compatikink_scheduled_notifications_v1';

export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number,
  type: LocalNotificationTask['type']
): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const task: LocalNotificationTask = {
    id,
    title,
    body,
    triggerSeconds,
    scheduledAt: new Date().toISOString(),
    type,
  };

  // Try Native Expo Notifications if available
  if (Platform.OS !== 'web') {
    try {
      const Notifications = require('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: {
          seconds: triggerSeconds,
        },
      });
    } catch (e) {
      console.warn('Expo Notifications fallback for native:', e);
    }
  } else if (typeof window !== 'undefined' && 'Notification' in window) {
    // Web Notifications API fallback
    if (Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, { body, icon: '/favicon.ico' });
      }, triggerSeconds * 1000);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setTimeout(() => {
            new Notification(title, { body, icon: '/favicon.ico' });
          }, triggerSeconds * 1000);
        }
      });
    }
  }

  // Persist locally for history
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const existing: LocalNotificationTask[] = raw ? JSON.parse(raw) : [];
    existing.push(task);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existing));
  } catch {}

  return id;
}

export async function getScheduledNotifications(): Promise<LocalNotificationTask[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearAllLocalNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch {}
}
