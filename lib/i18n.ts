import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS, SupportedLocale } from '@/data/translations';

const LOCALE_KEY = 'compatikink_locale_v1';
const SUPPORTED: SupportedLocale[] = ['es', 'en', 'pt'];

let currentLocale: SupportedLocale = 'es';
const listeners = new Set<(locale: SupportedLocale) => void>();

function isSupported(value: string | null | undefined): value is SupportedLocale {
  return value === 'es' || value === 'en' || value === 'pt';
}

export function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'es';
  const raw = (navigator.language || navigator.languages?.[0] || 'es').toLowerCase();
  if (raw.startsWith('pt')) return 'pt';
  if (raw.startsWith('en')) return 'en';
  if (raw.startsWith('es')) return 'es';
  return 'es';
}

function applyDocumentLang(locale: SupportedLocale): void {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

export async function initLocale(): Promise<SupportedLocale> {
  try {
    const saved = await AsyncStorage.getItem(LOCALE_KEY);
    if (isSupported(saved)) {
      currentLocale = saved;
    } else {
      currentLocale = detectBrowserLocale();
    }
  } catch {
    currentLocale = detectBrowserLocale();
  }
  applyDocumentLang(currentLocale);
  return currentLocale;
}

export function getCurrentLocale(): SupportedLocale {
  return currentLocale;
}

export function getSupportedLocales(): SupportedLocale[] {
  return [...SUPPORTED];
}

export async function setLocale(newLocale: SupportedLocale): Promise<void> {
  if (!isSupported(newLocale)) return;
  currentLocale = newLocale;
  applyDocumentLang(newLocale);
  try {
    await AsyncStorage.setItem(LOCALE_KEY, newLocale);
  } catch {}
  listeners.forEach((listener) => listener(newLocale));
}

export function t(key: string, params?: Record<string, string>): string {
  const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS.es;
  let text = dict[key] || TRANSLATIONS.es[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
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
    void setLocale(newLocale);
  }, []);

  return {
    t: translate,
    locale,
    changeLanguage,
  };
}
