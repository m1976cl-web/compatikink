/**
 * Feature flags — MVP vs Beta surface.
 * EXPO_PUBLIC_MVP=1 (default) hides social/AI suite and preview screens from home.
 * Set EXPO_PUBLIC_MVP=0 to show the full experimental module grid.
 */

import Constants from 'expo-constants';

function readFlag(name: string, fallback: string): string {
  const fromEnv = process.env[name];
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv;
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  if (extra && typeof extra[name] === 'string') return extra[name];
  return fallback;
}

/** When true (default), home focuses on core: questionnaire → invite → report. */
export const isMvpMode = readFlag('EXPO_PUBLIC_MVP', '1') !== '0';

/** Categories shown in ModuleGrid under MVP. */
export const MVP_MODULE_CATEGORIES = new Set(['explore', 'vault']);

/** Routes always allowed in MVP explore/vault even if registry says preview. */
export const MVP_CORE_ROUTES = new Set([
  '/questionnaire',
  '/quick-profile',
  '/pass-and-play',
  '/manual',
  '/glossary',
  '/safety-guide',
  '/compass',
  '/archetypes',
  '/auth',
  '/backup',
  '/privacy-policy',
  '/invite',
  '/report',
  '/share',
  '/onboarding',
]);
