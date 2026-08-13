import { useMemo, useEffect } from 'react';
import { View, TextInput, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ModuleTile } from '@/components/ModuleTile';
import { CategoryTabs } from '@/components/CategoryTabs';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { STATIC_MODULES, ACCENT_COLORS, CATEGORY_TABS } from '@/data/homeModules';
import { isScreenVisible, getScreenBadge } from '@/data/screenRegistry';
import { isMvpMode, MVP_MODULE_CATEGORIES, MVP_CORE_ROUTES } from '@/lib/featureFlags';
import { useResponsive } from '@/hooks/useResponsive';

export type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  category: string;
  route?: string;
  onPress?: () => void;
};

interface ModuleGridProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  onShowPWAInstallModal?: () => void;
  onShowA11yModal?: () => void;
}

const MVP_SUITE_BLOCK = new Set([
  '/dating',
  '/astrology',
  '/admin-dashboard',
  '/security-audit',
  '/fantasy-match',
  '/poly-group',
  '/partner-chat',
  '/partner-journal',
  '/private-album',
  '/premium',
  '/achievements',
  '/analytics',
  '/blue-pages',
  '/task-economy',
  '/contracts',
  '/negotiation',
  '/calendar',
  '/gear-closet',
  '/live-scene',
  '/kink-roulette',
  '/daily-submissive-act',
  '/shibari-guide',
  '/quick-start-bundle',
  '/pegging',
  '/events-munches',
  '/admin',
]);

export function ModuleGrid({
  activeTab,
  onChangeTab,
  searchQuery,
  onChangeSearch,
  onShowPWAInstallModal,
  onShowA11yModal,
}: ModuleGridProps) {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const vaultUnlocked = useHomeStore((s) => s.vaultUnlocked);

  const visibleTabs = useMemo(() => {
    if (!isMvpMode) return CATEGORY_TABS;
    return CATEGORY_TABS.filter((t) => MVP_MODULE_CATEGORIES.has(t.key));
  }, []);

  useEffect(() => {
    if (isMvpMode && !visibleTabs.some((t) => t.key === activeTab)) {
      onChangeTab('explore');
    }
  }, [activeTab, onChangeTab, visibleTabs]);

  const go = (path: string) => () => router.push(path as any);

  const allModules: ModuleDef[] = useMemo(
    () => [
      ...STATIC_MODULES,
      {
        title: 'Cuestionario express',
        description: '25 ítems · ~8 minutos · reanudable',
        mark: '⚡',
        category: 'explore',
        onPress: () => router.push({ pathname: '/questionnaire', params: { mode: 'express' } } as any),
      },
      { title: 'Bóveda Privada', description: 'Álbum de fotos cifrado AES-GCM', mark: '🖼️', category: 'vault', route: '/private-album' },
      { title: 'Cuenta & Bóveda', description: 'Acceso Zero-Knowledge', mark: '🔑', category: 'vault', route: '/auth' },
      { title: 'Backup Cifrado', description: 'Exportar / importar en JSON', mark: '📦', category: 'vault', route: '/backup' },
      { title: 'Admin', description: 'Requiere bóveda + rol local', mark: '🛡️', category: 'vault', route: '/admin' },
      { title: 'Instalar App', description: 'PWA en el dispositivo', mark: '📱', category: 'vault', onPress: onShowPWAInstallModal },
      { title: 'Accesibilidad', description: 'Contraste y tipografía', mark: '♿', category: 'vault', onPress: onShowA11yModal },
    ],
    [onShowPWAInstallModal, onShowA11yModal, router]
  );

  const filteredModules = useMemo(() => {
    let list = allModules.filter((m) => {
      if (m.route && !isScreenVisible(m.route)) return false;
      if (!isMvpMode) return true;
      if (!MVP_MODULE_CATEGORIES.has(m.category)) return false;
      if (m.category === 'social' || m.category === 'ai' || m.category === 'scenes') return false;
      if (!m.route) return true;
      if (MVP_CORE_ROUTES.has(m.route)) return true;
      if (MVP_SUITE_BLOCK.has(m.route)) return false;
      return m.category === 'explore' || m.category === 'vault';
    });

    if (!searchQuery.trim()) {
      const tab = visibleTabs.some((t) => t.key === activeTab) ? activeTab : 'explore';
      list = list.filter((m) => m.category === tab);
    } else {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'vault' && !vaultUnlocked && !searchQuery.trim()) {
      return list.filter((m) => m.route === '/auth' || m.route === '/backup');
    }

    return list;
  }, [allModules, activeTab, searchQuery, vaultUnlocked, visibleTabs]);

  return (
    <View style={styles.container}>
      {isMvpMode ? (
        <Text style={styles.mvpBanner}>
          Modo MVP: cuestionario, invitación y reporte. Suite social/IA oculta (EXPO_PUBLIC_MVP=0 para verla).
        </Text>
      ) : null}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar módulos, herramientas o guías..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onChangeSearch}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onChangeSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!searchQuery.trim() ? (
        <CategoryTabs tabs={visibleTabs} activeKey={activeTab} onTabChange={onChangeTab} />
      ) : (
        <Text style={styles.searchLabel}>
          Resultados de búsqueda ({filteredModules.length}):
        </Text>
      )}

      <View style={styles.grid}>
        {filteredModules.map((m, index) => (
          <View key={m.title} style={isDesktop ? styles.gridColDesktop : styles.gridColMobile}>
            <ModuleTile
              index={index}
              title={m.title}
              description={m.description}
              mark={m.mark}
              accent={ACCENT_COLORS[m.category] || colors.primary}
              badge={m.route ? getScreenBadge(m.route) : undefined}
              onPress={m.onPress || (m.route ? go(m.route) : () => {})}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.xs },
  mvpBanner: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21,13,36,0.9)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.xs,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.xs },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: fontSize.md },
  clearBtn: { padding: spacing.xs },
  clearBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  searchLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  gridColDesktop: { width: '49%' },
  gridColMobile: { width: '100%' },
});
