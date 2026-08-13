/**
 * data/screenRegistry.ts — Screen Classification Registry (Tier 1.2)
 *
 * Classifies every screen as READY, PREVIEW, or STUB based on audit:
 * - READY:   Real state management, persistence, functional business logic
 * - PREVIEW: Substantial UI with hardcoded data, no real persistence
 * - STUB:    Minimal skeleton, placeholder content
 *
 * Used by ModuleGrid to show/hide screens and display status badges.
 */

export type ScreenStatus = 'ready' | 'preview' | 'stub';

export interface ScreenClassification {
  route: string;
  status: ScreenStatus;
  badge?: string; // Display badge for non-ready screens
}

export const SCREEN_REGISTRY: Record<string, ScreenClassification> = {
  // ═══ READY — Core invite → guest → report (+ safety/vault) ════════
  '/dating':              { route: '/dating',              status: 'preview', badge: 'Demo local' },
  '/events-munches':      { route: '/events-munches',      status: 'preview', badge: 'Demo local' },
  '/fantasy-match':       { route: '/fantasy-match',       status: 'preview', badge: '🚧 Beta' },
  '/partner-chat':        { route: '/partner-chat',        status: 'preview', badge: 'Demo local' },
  '/kink-feed':           { route: '/kink-feed',           status: 'preview', badge: 'Demo local' },
  '/ai-assistant':        { route: '/ai-assistant',        status: 'preview', badge: '🚧 Beta' },
  '/premium':             { route: '/premium',             status: 'preview', badge: '🚧 Beta' },
  '/achievements':        { route: '/achievements',        status: 'preview', badge: '🚧 Beta' },
  '/analytics':           { route: '/analytics',           status: 'preview', badge: '🚧 Beta' },
  '/blue-pages':          { route: '/blue-pages',          status: 'preview', badge: 'Demo local' },
  '/task-economy':        { route: '/task-economy',        status: 'preview', badge: '🚧 Beta' },
  '/poly-group':          { route: '/poly-group',          status: 'ready' },
  '/pass-and-play':       { route: '/pass-and-play',       status: 'ready' },
  '/compass':             { route: '/compass',             status: 'ready' },
  '/backup':              { route: '/backup',              status: 'ready' },
  '/auth':                { route: '/auth',                status: 'ready' },
  '/admin-dashboard':     { route: '/admin-dashboard',     status: 'preview', badge: '🚧 Beta' },
  '/admin':               { route: '/admin',               status: 'preview', badge: '🚧 Beta' },
  '/calendar':            { route: '/calendar',            status: 'preview', badge: '🚧 Beta' },
  '/daily-submissive-act':{ route: '/daily-submissive-act',status: 'preview', badge: '🚧 Beta' },
  '/gear-closet':         { route: '/gear-closet',         status: 'preview', badge: '🚧 Beta' },
  '/index':               { route: '/index',               status: 'ready' },
  '/invite':              { route: '/invite',              status: 'ready' },
  '/kink-roulette':       { route: '/kink-roulette',       status: 'preview', badge: '🚧 Beta' },
  '/live-scene':          { route: '/live-scene',          status: 'preview', badge: '🚧 Beta' },
  '/negotiation':         { route: '/negotiation',         status: 'preview', badge: '🚧 Beta' },
  '/onboarding':          { route: '/onboarding',          status: 'ready' },
  '/partner-journal':     { route: '/partner-journal',     status: 'preview', badge: '🚧 Beta' },
  '/privacy-policy':      { route: '/privacy-policy',      status: 'ready' },
  '/private-album':       { route: '/private-album',       status: 'preview', badge: '🚧 Beta' },
  '/questionnaire':       { route: '/questionnaire',       status: 'ready' },
  '/quick-profile':       { route: '/quick-profile',       status: 'ready' },
  '/report':              { route: '/report',              status: 'ready' },
  '/security-audit':      { route: '/security-audit',      status: 'preview', badge: '🚧 Beta' },
  '/share':               { route: '/share',               status: 'ready' },
  '/archetypes':          { route: '/archetypes',          status: 'ready' },
  '/contracts':           { route: '/contracts',           status: 'preview', badge: '🚧 Beta' },
  '/shibari-guide':       { route: '/shibari-guide',       status: 'preview', badge: '🚧 Beta' },

  '/kink-feed':           { route: '/kink-feed',           status: 'preview', badge: 'Demo local' },
  '/manual':              { route: '/manual',              status: 'ready' },
  '/music-sync':          { route: '/music-sync',          status: 'preview', badge: '🚧 Beta' },
  '/pegging':             { route: '/pegging',             status: 'preview', badge: '🚧 Beta' },
  '/playlists':           { route: '/playlists',           status: 'preview', badge: '🚧 Beta' },
  '/quick-start-bundle':  { route: '/quick-start-bundle',  status: 'preview', badge: '🚧 Beta' },
  '/safety-guide':        { route: '/safety-guide',        status: 'ready' },
  '/store':               { route: '/store',               status: 'preview', badge: '🚧 Beta' },
  '/truth-or-dare':       { route: '/truth-or-dare',       status: 'preview', badge: '🚧 Beta' },
  '/weekly-challenge':    { route: '/weekly-challenge',     status: 'preview', badge: '🚧 Beta' },
  '/wrapped':             { route: '/wrapped',             status: 'preview', badge: '🚧 Beta' },
  '/writings':            { route: '/writings',            status: 'preview', badge: '🚧 Beta' },
  '/glossary':            { route: '/glossary',            status: 'ready' },
  '/astrology':           { route: '/astrology',           status: 'preview', badge: '🚧 Beta' },
  '/ai-roleplay':         { route: '/ai-roleplay',         status: 'preview', badge: '🚧 Beta' },
  '/chastity':            { route: '/chastity',            status: 'preview', badge: '🚧 Beta' },
  '/communities':         { route: '/communities',         status: 'preview', badge: '🚧 Beta' },
  '/courses':             { route: '/courses',             status: 'preview', badge: '🚧 Beta' },
  '/events':              { route: '/events',              status: 'preview', badge: '🚧 Beta' },
  '/hardware':            { route: '/hardware',            status: 'preview', badge: '🚧 Beta' },

  // ═══ STUB (4 screens) — Hidden from navigation ══════════════════
  '/ai-script':           { route: '/ai-script',           status: 'stub', badge: '🔒 Próximamente' },
  '/landing':             { route: '/landing',             status: 'stub', badge: '🔒 Próximamente' },
  '/rituals':             { route: '/rituals',             status: 'stub', badge: '🔒 Próximamente' },
  '/scene-ai':            { route: '/scene-ai',            status: 'stub', badge: '🔒 Próximamente' },
};

/** Get classification for a route. Returns 'ready' if not registered. */
export function getScreenStatus(route: string): ScreenClassification {
  return SCREEN_REGISTRY[route] || { route, status: 'ready' };
}

/** Check if a screen should be visible in the module grid. */
export function isScreenVisible(route: string): boolean {
  const entry = SCREEN_REGISTRY[route];
  if (!entry) return true;
  return entry.status !== 'stub';
}

/** Get the badge text for a screen, if any. */
export function getScreenBadge(route: string): string | undefined {
  return SCREEN_REGISTRY[route]?.badge;
}

// Summary statistics
export const SCREEN_STATS = {
  ready: Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'ready').length,
  preview: Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'preview').length,
  stub: Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'stub').length,
  total: Object.keys(SCREEN_REGISTRY).length,
};
