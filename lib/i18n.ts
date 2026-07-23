import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'es' | 'en';

const LANG_KEY = 'app_language';

export async function getSavedLanguage(): Promise<Language> {
  const lang = await AsyncStorage.getItem(LANG_KEY);
  return (lang as Language) || 'es';
}

export async function saveLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export const TRANSLATIONS = {
  es: {
    welcome: 'Compatikink',
    tagline: 'Define tus preferencias, invita a alguien y recibe un reporte de compatibilidad privado y consensuado.',
    quickProfileTitle: 'Crear Perfil Rápido',
    quickProfileDesc: 'Solo 10 preguntas · ~2 minutos · Privado',
    createPersonalProfile: 'Crear Perfil Personal',
    registerDesc: 'Registra tu nombre + PIN de 4 dígitos',
    myAgreements: '📋 Mis Acuerdos de Escena',
    comparePoly: '👥 Comparar Parejas (Poli / Multi-Vínculo)',
    panicWipe: '🛡️ Borrado de Emergencia',
    trends: '📊 Radar de Tendencias',
    logout: 'Cerrar Sesión',
  },
  en: {
    welcome: 'Compatikink',
    tagline: 'Define your preferences, invite someone, and receive a private, consensual compatibility report.',
    quickProfileTitle: 'Create Quick Profile',
    quickProfileDesc: 'Only 10 key questions · ~2 mins · Private',
    createPersonalProfile: 'Create Personal Profile',
    registerDesc: 'Register your name + 4-digit PIN',
    myAgreements: '📋 My Scene Agreements',
    comparePoly: '👥 Compare Partners (Poly / Multi-Bond)',
    panicWipe: '🛡️ Emergency Panic Wipe',
    trends: '📊 Community Trends Radar',
    logout: 'Log Out',
  },
};
