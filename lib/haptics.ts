import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_PREF_KEY = 'compatikink_haptics_enabled_v1';
let hapticsEnabledCache: boolean = true;

// Preload haptic preference in memory
AsyncStorage.getItem(HAPTICS_PREF_KEY)
  .then((val) => {
    if (val !== null) {
      hapticsEnabledCache = val === 'true';
    }
  })
  .catch(() => {});

export async function isHapticsEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(HAPTICS_PREF_KEY);
    if (val !== null) {
      hapticsEnabledCache = val === 'true';
      return hapticsEnabledCache;
    }
  } catch {}
  return true;
}

export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  hapticsEnabledCache = enabled;
  try {
    await AsyncStorage.setItem(HAPTICS_PREF_KEY, String(enabled));
  } catch {}
}

function safeHapticsImpact(style: 'light' | 'medium' | 'heavy') {
  if (!hapticsEnabledCache) return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.impactAsync === 'function') {
      const styleMap: Record<string, any> = {
        light: Haptics.ImpactFeedbackStyle?.Light ?? 'light',
        medium: Haptics.ImpactFeedbackStyle?.Medium ?? 'medium',
        heavy: Haptics.ImpactFeedbackStyle?.Heavy ?? 'heavy',
      };
      Haptics.impactAsync(styleMap[style] ?? styleMap.light);
    }
  } catch {
    // Ignore in non-native or node test environments
  }
}

function safeHapticsSelection() {
  if (!hapticsEnabledCache) return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.selectionAsync === 'function') {
      Haptics.selectionAsync();
    }
  } catch {
    // Ignore
  }
}

function safeHapticsNotification(type: 'success' | 'warning' | 'error') {
  if (!hapticsEnabledCache) return;
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.notificationAsync === 'function') {
      const typeMap: Record<string, any> = {
        success: Haptics.NotificationFeedbackType?.Success ?? 'success',
        warning: Haptics.NotificationFeedbackType?.Warning ?? 'warning',
        error: Haptics.NotificationFeedbackType?.Error ?? 'error',
      };
      Haptics.notificationAsync(typeMap[type] ?? typeMap.success);
    }
  } catch {
    // Ignore
  }
}

export function triggerLightHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } else {
      safeHapticsImpact('light');
    }
  } catch {}
}

export function triggerMediumHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    } else {
      safeHapticsImpact('medium');
    }
  } catch {}
}

export function triggerHeavyHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } else {
      safeHapticsImpact('heavy');
    }
  } catch {}
}

export function triggerSelectionHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(5);
      }
    } else {
      safeHapticsSelection();
    }
  } catch {}
}

export function triggerSuccessHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([15, 40, 25]);
      }
    } else {
      safeHapticsNotification('success');
    }
  } catch {}
}

export function triggerWarningHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]);
      }
    } else {
      safeHapticsNotification('warning');
    }
  } catch {}
}

export function triggerErrorHaptic(): void {
  if (!hapticsEnabledCache) return;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([50, 40, 50, 40, 50]);
      }
    } else {
      safeHapticsNotification('error');
    }
  } catch {}
}

interface HapticCallable {
  (style?: 'light' | 'medium' | 'heavy'): void;
  light: () => void;
  medium: () => void;
  heavy: () => void;
  selection: () => void;
  success: () => void;
  warning: () => void;
  error: () => void;
}

export const triggerHaptic: HapticCallable = Object.assign(
  function (style: 'light' | 'medium' | 'heavy' = 'light') {
    if (style === 'heavy') {
      triggerHeavyHaptic();
    } else if (style === 'medium') {
      triggerMediumHaptic();
    } else {
      triggerLightHaptic();
    }
  },
  {
    light: () => triggerLightHaptic(),
    medium: () => triggerMediumHaptic(),
    heavy: () => triggerHeavyHaptic(),
    selection: () => triggerSelectionHaptic(),
    success: () => triggerSuccessHaptic(),
    warning: () => triggerWarningHaptic(),
    error: () => triggerErrorHaptic(),
  }
);
