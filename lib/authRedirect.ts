/**
 * OAuth / deep-link redirect helpers for Expo web (GitHub Pages base path).
 */

import Constants from 'expo-constants';

const PAGES_ORIGIN = 'https://m1976cl-web.github.io';
const PAGES_BASE = '/compatikink';

/** Public web base path (Expo experiments.baseUrl). */
export function getWebBasePath(): string {
  const fromEnv = process.env.EXPO_PUBLIC_BASE_PATH;
  if (fromEnv) return fromEnv.replace(/\/$/, '') || '';
  const extra = Constants.expoConfig?.extra as { basePath?: string } | undefined;
  if (extra?.basePath) return extra.basePath.replace(/\/$/, '');
  return PAGES_BASE;
}

/**
 * Redirect URL after Google OAuth (must be in Supabase Auth redirect allow list).
 * Web: current origin + basePath + /auth
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const { origin, pathname } = window.location;
    const onPages = pathname.startsWith(PAGES_BASE) || origin.includes('github.io');
    const base = onPages ? getWebBasePath() : '';
    return `${origin}${base}/auth`;
  }
  return `${PAGES_ORIGIN}${PAGES_BASE}/auth`;
}

export const AUTH_REDIRECT_ALLOWLIST = [
  `${PAGES_ORIGIN}${PAGES_BASE}`,
  `${PAGES_ORIGIN}${PAGES_BASE}/`,
  `${PAGES_ORIGIN}${PAGES_BASE}/auth`,
  'http://localhost:8081/auth',
  'http://localhost:19006/auth',
  'http://127.0.0.1:8081/auth',
];
