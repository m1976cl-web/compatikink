import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS, SupportedLocale } from '@/data/translations';

const LOCALE_KEY = 'compatikink_locale_v1';
let currentLocale: SupportedLocale = 'es';
const listeners = new Set<(locale: SupportedLocale) => void>();

export async function initLocale(): Promise<SupportedLocale> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_KEY);
    if (saved === 'es' || saved === 'en') {
      currentLocale = saved;
    }
  } catch {}
  return currentLocale;
}

export function getCurrentLocale(): SupportedLocale {
  return currentLocale;
}

export async function setLocale(newLocale: SupportedLocale): Promise<void> {
  currentLocale = newLocale;
  try {
    await AsyncStorage.setItem(LOCALE_KEY, newLocale);
  } catch {}
  listeners.forEach((listener) => listener(newLocale));
}

export function t(key: string, params?: Record<string, string>): string {
  const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS.es;
  let text = dict[key] || TRANSLATIONS.es[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), v);
    });
  }
  return text;
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<SupportedLocale>(currentLocale);

  useEffect(() => {
    initLocale().then(setLocaleState);
    const listener = (l: SupportedLocale) => setLocaleState(l);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const translate = useCallback(
    (key: string, params?: Record<string, string>) => t(key, params),
    [locale]
  );

  const changeLanguage = useCallback((newLocale: SupportedLocale) => {
    setLocale(newLocale);
  }, []);

  return {
    t: translate,
    locale,
    changeLanguage,
  };
}
