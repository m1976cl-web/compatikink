/**
 * data/screenRegistry.ts — Screen Classification Registry (Tier 1.2)
 *
 * Classifies every screen as READY, PREVIEW, or STUB based on audit:
 * - READY:   Core invite → guest → report (+ vault / safety / latex guide)
 * - PREVIEW: Suite / demo UI (not multi-device social)
 * - STUB:    Hidden from navigation
 *
 * Used by ModuleGrid to show/hide screens and display status badges.
 */

export type ScreenStatus = 'ready' | 'preview' | 'stub';

export interface ScreenClassification {
  route: string;
  status: ScreenStatus;
  badge?: string;
}

export const SCREEN_REGISTRY: Record<string, ScreenClassification> = {
  // ═══ READY — Core ═════════════════════════════════════════════════
  '/index': { route: '/index', status: 'ready' },
  '/onboarding': { route: '/onboarding', status: 'ready' },
  '/questionnaire': { route: '/questionnaire', status: 'ready' },
  '/quick-profile': { route: '/quick-profile', status: 'ready' },
  '/invite': { route: '/invite', status: 'ready' },
  '/report': { route: '/report', status: 'ready' },
  '/share': { route: '/share', status: 'ready' },
  '/auth': { route: '/auth', status: 'ready' },
  '/backup': { route: '/backup', status: 'ready' },
  '/pass-and-play': { route: '/pass-and-play', status: 'ready' },
  '/compass': { route: '/compass', status: 'ready' },
  '/archetypes': { route: '/archetypes', status: 'ready' },
  '/poly-group': { route: '/poly-group', status: 'ready' },
  '/manual': { route: '/manual', status: 'ready' },
  '/glossary': { route: '/glossary', status: 'ready' },
  '/safety-guide': { route: '/safety-guide', status: 'ready' },
  '/privacy-policy': { route: '/privacy-policy', status: 'ready' },
  '/latex-guide': { route: '/latex-guide', status: 'ready' },

  // ═══ PREVIEW / Demo local ═════════════════════════════════════════
  '/dating': { route: '/dating', status: 'preview', badge: 'Demo local' },
  '/kink-feed': { route: '/kink-feed', status: 'preview', badge: 'Demo local' },
  '/events-munches': { route: '/events-munches', status: 'preview', badge: 'Demo local' },
  '/partner-chat': { route: '/partner-chat', status: 'preview', badge: 'Demo local' },
  '/blue-pages': { route: '/blue-pages', status: 'preview', badge: 'Demo local' },
  '/fantasy-match': { route: '/fantasy-match', status: 'preview', badge: '🚧 Beta' },
  '/ai-assistant': { route: '/ai-assistant', status: 'preview', badge: '🚧 Beta' },
  '/ai-roleplay': { route: '/ai-roleplay', status: 'preview', badge: '🚧 Beta' },
  '/premium': { route: '/premium', status: 'preview', badge: '🚧 Beta' },
  '/achievements': { route: '/achievements', status: 'preview', badge: '🚧 Beta' },
  '/analytics': { route: '/analytics', status: 'preview', badge: '🚧 Beta' },
  '/task-economy': { route: '/task-economy', status: 'preview', badge: '🚧 Beta' },
  '/admin-dashboard': { route: '/admin-dashboard', status: 'preview', badge: '🚧 Beta' },
  '/admin': { route: '/admin', status: 'preview', badge: '🚧 Beta' },
  '/security-audit': { route: '/security-audit', status: 'preview', badge: '🚧 Beta' },
  '/calendar': { route: '/calendar', status: 'preview', badge: '🚧 Beta' },
  '/daily-submissive-act': { route: '/daily-submissive-act', status: 'preview', badge: '🚧 Beta' },
  '/gear-closet': { route: '/gear-closet', status: 'preview', badge: '🚧 Beta' },
  '/kink-roulette': { route: '/kink-roulette', status: 'preview', badge: '🚧 Beta' },
  '/live-scene': { route: '/live-scene', status: 'preview', badge: '🚧 Beta' },
  '/negotiation': { route: '/negotiation', status: 'preview', badge: '🚧 Beta' },
  '/partner-journal': { route: '/partner-journal', status: 'preview', badge: '🚧 Beta' },
  '/private-album': { route: '/private-album', status: 'preview', badge: '🚧 Beta' },
  '/contracts': { route: '/contracts', status: 'preview', badge: '🚧 Beta' },
  '/shibari-guide': { route: '/shibari-guide', status: 'preview', badge: '🚧 Beta' },
  '/music-sync': { route: '/music-sync', status: 'preview', badge: '🚧 Beta' },
  '/pegging': { route: '/pegging', status: 'preview', badge: '🚧 Beta' },
  '/playlists': { route: '/playlists', status: 'preview', badge: '🚧 Beta' },
  '/quick-start-bundle': { route: '/quick-start-bundle', status: 'preview', badge: '🚧 Beta' },
  '/store': { route: '/store', status: 'preview', badge: '🚧 Beta' },
  '/truth-or-dare': { route: '/truth-or-dare', status: 'preview', badge: '🚧 Beta' },
  '/weekly-challenge': { route: '/weekly-challenge', status: 'preview', badge: '🚧 Beta' },
  '/wrapped': { route: '/wrapped', status: 'preview', badge: '🚧 Beta' },
  '/writings': { route: '/writings', status: 'preview', badge: '🚧 Beta' },
  '/astrology': { route: '/astrology', status: 'preview', badge: '🚧 Beta' },
  '/chastity': { route: '/chastity', status: 'preview', badge: '🚧 Beta' },
  '/communities': { route: '/communities', status: 'preview', badge: '🚧 Beta' },
  '/courses': { route: '/courses', status: 'preview', badge: '🚧 Beta' },
  '/events': { route: '/events', status: 'preview', badge: '🚧 Beta' },
  '/hardware': { route: '/hardware', status: 'preview', badge: '🚧 Beta' },

  // ═══ STUB — Hidden ════════════════════════════════════════════════
  '/ai-script': { route: '/ai-script', status: 'stub', badge: '🔒 Próximamente' },
  '/landing': { route: '/landing', status: 'stub', badge: '🔒 Próximamente' },
  '/rituals': { route: '/rituals', status: 'stub', badge: '🔒 Próximamente' },
  '/scene-ai': { route: '/scene-ai', status: 'stub', badge: '🔒 Próximamente' },
};

export function getScreenStatus(route: string): ScreenClassification {
  return SCREEN_REGISTRY[route] ?? { route, status: 'preview' };
}

export function isScreenVisible(route: string): boolean {
  return getScreenStatus(route).status !== 'stub';
}

export function getScreenBadge(route: string): string | undefined {
  return SCREEN_REGISTRY[route]?.badge;
}

export const SCREEN_STATS = {
  get ready() {
    return Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'ready').length;
  },
  get preview() {
    return Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'preview').length;
  },
  get stub() {
    return Object.values(SCREEN_REGISTRY).filter((s) => s.status === 'stub').length;
  },
  get total() {
    return Object.keys(SCREEN_REGISTRY).length;
  },
  get readyCount() { return this.ready; },
  get previewCount() { return this.preview; },
  get stubCount() { return this.stub; },
  get totalCount() { return this.total; },
};
