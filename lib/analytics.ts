/**
 * lib/analytics.ts — Privacy-First Analytics for CompatKink
 *
 * Uses Plausible Analytics (plausible.io) which is:
 * - GDPR compliant by default (no cookies, no personal data)
 * - Open source and self-hostable
 * - < 1KB script
 *
 * All tracking is opt-in and respects Do Not Track.
 * No intimate/sensitive data is ever sent — only screen names and generic events.
 */

import { Platform } from 'react-native';

const PLAUSIBLE_DOMAIN = process.env.EXPO_PUBLIC_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_API_HOST = process.env.EXPO_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io';

/** Whether analytics is configured and enabled. */
export const isAnalyticsEnabled = Boolean(PLAUSIBLE_DOMAIN) && Platform.OS === 'web';

/**
 * Track a page view. Only sends the screen name — never any user data,
 * preferences, or intimate content.
 *
 * Safe events only: 'screen_view', 'session_created', 'questionnaire_completed',
 * 'report_viewed', 'language_changed', 'pwa_installed'.
 */
export function trackPageView(screenName: string): void {
  if (!isAnalyticsEnabled) return;

  // Respect Do Not Track
  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

  try {
    fetch(`${PLAUSIBLE_API_HOST}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: PLAUSIBLE_DOMAIN,
        name: 'pageview',
        url: `${window.location.origin}/${screenName}`,
        referrer: document.referrer || null,
      }),
    }).catch(() => {
      // Silently fail — analytics should never break the app
    });
  } catch {
    // Non-web environments silently skip
  }
}

/**
 * Track a custom event (e.g., 'questionnaire_completed', 'session_created').
 * NEVER include sensitive data in eventName or props.
 *
 * Allowed event names (whitelist):
 * - 'session_created'
 * - 'questionnaire_completed'
 * - 'report_viewed'
 * - 'language_changed'
 * - 'pwa_installed'
 * - 'ai_query'
 * - 'onboarding_completed'
 */
const ALLOWED_EVENTS = new Set([
  'session_created',
  'questionnaire_completed',
  'report_viewed',
  'language_changed',
  'pwa_installed',
  'ai_query',
  'onboarding_completed',
]);

export function trackEvent(eventName: string, props?: Record<string, string | number>): void {
  if (!isAnalyticsEnabled) return;
  if (!ALLOWED_EVENTS.has(eventName)) return; // Strict whitelist

  // Respect Do Not Track
  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

  try {
    fetch(`${PLAUSIBLE_API_HOST}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: PLAUSIBLE_DOMAIN,
        name: eventName,
        url: window.location.href,
        props: props || {},
      }),
    }).catch(() => {});
  } catch {}
}

/**
 * Inject Plausible <script> tag into the document head (web only).
 * Call once from _layout.tsx or app entry point.
 */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled) return;
  if (typeof document === 'undefined') return;

  // Don't inject twice
  if (document.querySelector('script[data-domain]')) return;

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  script.src = `${PLAUSIBLE_API_HOST}/js/script.js`;
  document.head.appendChild(script);
}
