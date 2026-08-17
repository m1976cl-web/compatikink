import { Platform } from 'react-native';

function safeHapticsImpact(style: any) {
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.impactAsync === 'function') {
      Haptics.impactAsync(style);
    }
  } catch {
    // Ignore in non-native or node test environments
  }
}

function safeHapticsNotification(type: any) {
  try {
    const Haptics = require('expo-haptics');
    if (Haptics && typeof Haptics.notificationAsync === 'function') {
      Haptics.notificationAsync(type);
    }
  } catch {
    // Ignore
  }
}

export function triggerLightHaptic(): void {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } else {
      safeHapticsImpact('light');
    }
  } catch {
    // Ignore
  }
}

export function triggerMediumHaptic(): void {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    } else {
      safeHapticsImpact('medium');
    }
  } catch {
    // Ignore
  }
}

export function triggerSuccessHaptic(): void {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([15, 30, 20]);
      }
    } else {
      safeHapticsNotification('success');
    }
  } catch {
    // Ignore
  }
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
    if (style === 'medium' || style === 'heavy') {
      triggerMediumHaptic();
    } else {
      triggerLightHaptic();
    }
  },
  {
    light: () => triggerLightHaptic(),
    medium: () => triggerMediumHaptic(),
    heavy: () => triggerMediumHaptic(),
    selection: () => triggerLightHaptic(),
    success: () => triggerSuccessHaptic(),
    warning: () => triggerMediumHaptic(),
    error: () => triggerMediumHaptic(),
  }
);
