import { useMemo, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ModuleTile } from '@/components/ModuleTile';
import { CategoryTabs } from '@/components/CategoryTabs';
import { useHomeStore } from '@/stores/homeStore';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { STATIC_MODULES, ACCENT_COLORS, CATEGORY_TABS } from '@/data/homeModules';
import { isScreenVisible, getScreenBadge } from '@/data/screenRegistry';
import { isMvpMode, MVP_MODULE_CATEGORIES, MVP_CORE_ROUTES, getFeatureMode, setFeatureMode, FeatureMode } from '@/lib/featureFlags';
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
  '/linked-couples',
  '/kink-feed',
  '/events-munches',
  '/ds-tasks',
  '/task-economy',
  '/ephemeral-wishes',
  '/marketplace-dark',
  '/foot-fetish',
  '/tribute',
  '/sissy-training',
  '/chastity',
  '/chastity-wearer',
  '/chastity-keyholder',
  '/chastity-protocol',
  '/chastity-tools',
  '/chastity-cage',
  '/chastity-belt',
  '/chastity-fit',
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
  const profile = useHomeStore((s) => s.profile);

  const [featureMode, setFeatureModeState] = useState<FeatureMode>(isMvpMode ? 'mvp_only' : 'all_modules');

  useEffect(() => {
    getFeatureMode().then(setFeatureModeState);
  }, []);

  const handleToggleFeatureMode = async () => {
    const nextMode: FeatureMode = featureMode === 'mvp_only' ? 'all_modules' : 'mvp_only';
    setFeatureModeState(nextMode);
    await setFeatureMode(nextMode);
  };

  const isMvpEffective = featureMode === 'mvp_only';

  const visibleTabs = useMemo(() => {
    if (!isMvpEffective) return CATEGORY_TABS;
    return CATEGORY_TABS.filter((t) => MVP_MODULE_CATEGORIES.has(t.key));
  }, [isMvpEffective]);

  useEffect(() => {
    if (isMvpEffective && !visibleTabs.some((t) => t.key === activeTab)) {
      onChangeTab('explore');
    }
  }, [activeTab, onChangeTab, visibleTabs, isMvpEffective]);

  const ANON_ALLOWED_ROUTES = [
    '/questionnaire',
    '/invite',
    '/manual',
    '/safety-guide',
    '/glossary',
    '/privacy-policy',
    '/terms',
    '/auth',
    '/onboarding',
    '/guest',
    '/report',
    '/latex-guide',
  ];

  const go = (path: string) => () => {
    const isAnon = !profile || profile.nickname === 'Anónimo';
    const isAllowedInAnon = ANON_ALLOWED_ROUTES.some((r) => path.startsWith(r));

    if (isAnon && !isAllowedInAnon) {
      if (path.startsWith('/wild-feed')) {
        Alert.alert(
          '🔞 Galería Salvaje — Autenticación Requerida',
          'La Galería Salvaje es un espacio exclusivo para usuarios autenticados.\n\nInicia sesión con tu cuenta de Google para ingresar. Una vez adentro, podrás publicar fotos/videos y comentar de forma 100% anónima si lo prefieres.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Iniciar Sesión con Google 🔵', onPress: () => router.push('/auth') },
          ]
        );
        return;
      }

      Alert.alert(
        '🔐 Cuenta Registrada Requerida',
        'En Modo Anónimo puedes responder el test, compartirlo de forma anónima y comparar resultados de compatibilidad con tu pareja.\n\nPara desbloquear esta herramienta avanzada, inicia sesión con tu cuenta de Google.',
        [
          { text: 'Seguir Anónimo', style: 'cancel' },
          { text: 'Iniciar Sesión con Google 🔵', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    router.push(path as any);
  };

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
      if (!isMvpEffective) return true;
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
      return list.filter((m) => m.route === '/auth');
    }

    return list;
  }, [allModules, activeTab, searchQuery, vaultUnlocked, isMvpEffective, visibleTabs]);

  return (
    <View style={styles.container}>
      {/* Search and Feature Flag Bar */}
      <View style={styles.searchRow}>
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

        <TouchableOpacity
          style={[styles.featureToggleChip, !isMvpEffective && styles.featureToggleChipActive]}
          onPress={handleToggleFeatureMode}
        >
          <Text style={[styles.featureToggleChipText, !isMvpEffective && styles.featureToggleChipTextActive]}>
            {isMvpEffective ? '🛡️ Core' : '⚡ Todos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {!searchQuery.trim() && (
        <CategoryTabs
          tabs={visibleTabs}
          activeKey={activeTab}
          onTabChange={onChangeTab}
        />
      )}

      {/* Grid of Modules */}
      <View style={styles.grid}>
        {filteredModules.map((m) => (
          <View
            key={m.title}
            style={isDesktop ? styles.gridColDesktop : styles.gridColMobile}
          >
            <ModuleTile
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21,13,36,0.9)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.35)',
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.xs },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: fontSize.md },
  clearBtn: { padding: spacing.xs },
  clearBtnText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },

  featureToggleChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureToggleChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
  },
  featureToggleChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
  featureToggleChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
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
