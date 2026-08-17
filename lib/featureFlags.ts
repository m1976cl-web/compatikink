/**
 * Feature flags — MVP vs Beta surface.
 * EXPO_PUBLIC_MVP=1 (default) hides social/AI suite and preview screens from home.
 * Set EXPO_PUBLIC_MVP=0 to show the full experimental module grid.
 */

import Constants from 'expo-constants';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

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

export type FeatureMode = 'mvp_only' | 'all_modules';

const FEATURE_MODE_STORAGE_KEY = 'app_feature_mode_v1';

let cachedFeatureMode: FeatureMode = isMvpMode ? 'mvp_only' : 'all_modules';

/**
 * Loads saved feature mode preference from ZK storage.
 */
export async function getFeatureMode(): Promise<FeatureMode> {
  try {
    const mode = await readJsonStorage<FeatureMode>(FEATURE_MODE_STORAGE_KEY, isMvpMode ? 'mvp_only' : 'all_modules');
    if (mode === 'mvp_only' || mode === 'all_modules') {
      cachedFeatureMode = mode;
      return mode;
    }
  } catch {
    // Return cached / default
  }
  return cachedFeatureMode;
}

/**
 * Saves user feature mode preference (MVP Core vs All Modules/Beta).
 */
export async function setFeatureMode(mode: FeatureMode): Promise<FeatureMode> {
  cachedFeatureMode = mode;
  await writeJsonStorage(FEATURE_MODE_STORAGE_KEY, mode);
  return mode;
}

/**
 * Gets synchronously cached feature mode.
 */
export function getCachedFeatureMode(): FeatureMode {
  return cachedFeatureMode;
}

/**
 * Checks if a module route or item should be visible based on active mode.
 */
export function isModuleVisibleInMode(route: string | undefined, isMvpOnly: boolean, isMvpCoreItem?: boolean): boolean {
  if (!isMvpOnly) return true; // Show all in 'all_modules' mode
  if (isMvpCoreItem === true) return true; // Marked explicitly as MVP core

  // Explicitly frozen social/dating routes in MVP mode
  const FROZEN_SOCIAL_ROUTES = [
    '/dating',
    '/events-munches',
    '/kink-feed',
    '/ephemeral-wishes',
    '/linked-couples',
    '/ds-tasks',
    '/task-economy',
  ];

  if (route && FROZEN_SOCIAL_ROUTES.includes(route)) {
    return false; // Always frozen when isMvpOnly is true
  }

  if (!route) return false;
  return MVP_CORE_ROUTES.has(route);
}
