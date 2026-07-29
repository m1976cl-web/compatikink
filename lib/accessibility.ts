import AsyncStorage from '@react-native-async-storage/async-storage';

const A11Y_KEY = 'app_accessibility_settings_v1';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSizeScale: 'normal' | 'large' | 'extra_large';
  screenReaderHints: boolean;
}

export const DEFAULT_A11Y: AccessibilitySettings = {
  highContrast: false,
  fontSizeScale: 'normal',
  screenReaderHints: true,
};

export async function getAccessibilitySettings(): Promise<AccessibilitySettings> {
  const raw = await AsyncStorage.getItem(A11Y_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_A11Y;
}

export async function saveAccessibilitySettings(settings: AccessibilitySettings): Promise<void> {
  await AsyncStorage.setItem(A11Y_KEY, JSON.stringify(settings));
}
