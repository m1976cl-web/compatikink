import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalNotificationTask {
  id: string;
  title: string;
  body: string;
  triggerSeconds: number;
  scheduledAt: string;
  type: 'aftercare' | 'security_checkin' | 'daily_task' | 'vault_reminder';
  phase?: 1 | 2 | 3;
}

export const AFTERCARE_PHASES = [
  {
    phase: 1 as const,
    triggerSeconds: 15 * 60, // 900s
    title: '🪷 Aftercare — Fase 1: Estado Físico (15m)',
    body: 'Es hora de hidratarte, estirarte y verificar tu estado físico.',
  },
  {
    phase: 2 as const,
    triggerSeconds: 30 * 60, // 1800s
    title: '💬 Aftercare — Fase 2: Recarga Emocional (30m)',
    body: 'Revisa tu batería emocional y conversa abiertamente con tu pareja.',
  },
  {
    phase: 3 as const,
    triggerSeconds: 24 * 60 * 60, // 86400s
    title: '📓 Aftercare — Fase 3: Check-in del Día Siguiente (24h)',
    body: 'Reflexiona sobre la sesión de ayer y registra tus impresiones en el diario de la Bóveda.',
  },
];

const NOTIFICATIONS_STORAGE_KEY = 'compatikink_scheduled_notifications_v1';

export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number,
  type: LocalNotificationTask['type'],
  phase?: LocalNotificationTask['phase']
): Promise<string> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const task: LocalNotificationTask = {
    id,
    title,
    body,
    triggerSeconds,
    scheduledAt: new Date().toISOString(),
    type,
    ...(phase !== undefined ? { phase } : {}),
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

/**
 * Schedules all 3 progressive aftercare protocol notifications.
 * Phase 1 (15 min): Physical state, hydration, rest.
 * Phase 2 (30 min): Emotional battery, partner conversation.
 * Phase 3 (24h): Next-day check-in, vault journal entry.
 * @param sessionName Optional discreet session label
 * @returns Array of scheduled notification IDs [phase1Id, phase2Id, phase3Id]
 */
export async function schedule3PhaseAftercareProtocol(sessionName?: string): Promise<string[]> {
  const notificationIds: string[] = [];
  for (const phaseConfig of AFTERCARE_PHASES) {
    const id = await scheduleLocalNotification(
      phaseConfig.title,
      phaseConfig.body,
      phaseConfig.triggerSeconds,
      'aftercare',
      phaseConfig.phase
    );
    notificationIds.push(id);
  }
  return notificationIds;
}

/**
 * Cancels all currently scheduled aftercare notifications from storage.
 */
export async function cancelScheduledAftercareNotifications(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return;
    const existing: LocalNotificationTask[] = JSON.parse(raw);
    const filtered = existing.filter((task) => task.type !== 'aftercare');
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
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
