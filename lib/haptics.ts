import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Cross-platform tactile feedback engine with safe Web fallback (navigator.vibrate).
 * Guaranteed never to throw uncaught exceptions.
 */
export const triggerHaptic = {
  light: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch { /* ignore web restriction */ }
      }
      return;
    }
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
  },

  medium: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(20); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* ignore */ }
  },

  heavy: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([30, 50, 30]); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch { /* ignore */ }
  },

  selection: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(8); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.selectionAsync(); } catch { /* ignore */ }
  },

  success: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([15, 30, 15]); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* ignore */ }
  },

  warning: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([30, 30]); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { /* ignore */ }
  },

  error: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([50, 100, 50]); } catch { /* ignore */ }
      }
      return;
    }
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch { /* ignore */ }
  },
};
