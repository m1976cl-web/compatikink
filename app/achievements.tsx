import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography, glowShadowPrimary } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  checkAndUnlockAchievements,
  Achievement,
  AchievementCategory,
  CATEGORY_LABELS,
  RARITY_LABELS,
} from '@/lib/achievements';
import { TrophyInspectionModal } from '@/components/achievements/TrophyInspectionModal';
import { triggerLightHaptic, triggerSelectionHaptic } from '@/lib/haptics';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function AchievementsScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [list, setList] = useState<Achievement[]>([]);
  const [selectedCat, setSelectedCat] = useState<AchievementCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'showcase' | 'list'>('showcase');
  const [inspectedAchievement, setInspectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    (async () => {
      const all = await checkAndUnlockAchievements();
      setList(all);
    })();
  }, []);

  const unlockedCount = list.filter((a) => a.unlocked).length;
  const totalCount = list.length;
  const progressPct = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

  const getRankTitle = (unlocked: number) => {
    if (unlocked >= 15) return '👑 Gran Maestro/a Fetish ✨';
    if (unlocked >= 10) return '⚡ Alquimista del Látex';
    if (unlocked >= 5) return '🪢 Explorador/a Experimentado/a';
    return '🌱 Iniciado/a Kink';
  };

  const filteredList = selectedCat === 'all'
    ? list
    : list.filter((a) => a.category === selectedCat);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sala de Trofeos & Insignias 🏆⚡</Text>
          <Text style={styles.subtitle}>
            Galería visual de reconocimientos y trofeos por explorar tus deseos con seguridad
          </Text>
        </View>

        {/* User Rank & Progress Banner */}
        <View style={styles.rankCard}>
          <View style={styles.rankRow}>
            <View>
              <Text style={styles.rankLabel}>RANGO KINK ACTUAL:</Text>
              <Text style={styles.rankTitle}>{getRankTitle(unlockedCount)}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unlockedCount} / {totalCount} Desbloqueados</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* View Mode Toggle: Vitrina vs Lista */}
        <View style={styles.viewModeRow}>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'showcase' && styles.viewModeBtnActive]}
            onPress={() => {
              triggerSelectionHaptic();
              setViewMode('showcase');
            }}
          >
            <Text style={[styles.viewModeText, viewMode === 'showcase' && styles.viewModeTextActive]}>
              🏆 Vitrina de Trofeos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
            onPress={() => {
              triggerSelectionHaptic();
              setViewMode('list');
            }}
          >
            <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
              📜 Lista de Desafíos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <TouchableOpacity
            style={[styles.catChip, selectedCat === 'all' && styles.catChipActive]}
            onPress={() => {
              triggerSelectionHaptic();
              setSelectedCat('all');
            }}
          >
            <Text style={[styles.catChipText, selectedCat === 'all' && styles.catChipTextActive]}>
              🌐 Todas ({list.length})
            </Text>
          </TouchableOpacity>

          {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((catKey) => {
            const catInfo = CATEGORY_LABELS[catKey];
            const isSel = selectedCat === catKey;
            return (
              <TouchableOpacity
                key={catKey}
                style={[
                  styles.catChip,
                  isSel && { backgroundColor: `${catInfo.color}25`, borderColor: catInfo.color },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedCat(catKey);
                }}
              >
                <Text style={[styles.catChipText, isSel && { color: catInfo.color, fontWeight: '800' }]}>
                  {catInfo.emoji} {catInfo.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main Content Area */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {viewMode === 'showcase' ? (
            /* ───────────── 🏆 VITRINA DE TROFEOS (PEDESTALES) ───────────── */
            <View style={styles.showcaseGrid}>
              {filteredList.map((ach) => {
                const isUnlocked = ach.unlocked;
                const rarityInfo = RARITY_LABELS[ach.rarity];

                return (
                  <TouchableOpacity
                    key={ach.id}
                    style={[
                      styles.showcasePedestal,
                      isUnlocked
                        ? { borderColor: ach.glowColor, backgroundColor: 'rgba(16, 9, 28, 0.95)' }
                        : styles.showcasePedestalLocked,
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setInspectedAchievement(ach);
                    }}
                    activeOpacity={0.8}
                  >
                    {/* Glowing Ring */}
                    <View
                      style={[
                        styles.trophyRing,
                        isUnlocked
                          ? { borderColor: ach.glowColor, backgroundColor: `${ach.glowColor}15` }
                          : styles.trophyRingLocked,
                      ]}
                    >
                      <Text style={[styles.trophyIcon, !isUnlocked && { opacity: 0.25 }]}>
                        {isUnlocked ? ach.emoji : '🔒'}
                      </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.pedestalTitle} numberOfLines={2}>
                      {ach.title}
                    </Text>

                    {/* Rarity Pill */}
                    <View style={[styles.miniRarityPill, { borderColor: rarityInfo.color }]}>
                      <Text style={[styles.miniRarityText, { color: rarityInfo.color }]}>
                        {ach.rarity.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* ───────────── 📜 LISTA DETALLADA DE HITOS ───────────── */
            <View style={styles.badgeGrid}>
              {filteredList.map((ach) => {
                const catInfo = CATEGORY_LABELS[ach.category];
                const rarityInfo = RARITY_LABELS[ach.rarity];
                const isUnlocked = ach.unlocked;

                return (
                  <TouchableOpacity
                    key={ach.id}
                    style={[
                      styles.badgeCard,
                      isUnlocked
                        ? { borderColor: ach.glowColor, backgroundColor: 'rgba(18, 9, 31, 0.92)' }
                        : styles.badgeCardLocked,
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setInspectedAchievement(ach);
                    }}
                    activeOpacity={0.85}
                  >
                    {/* Badge Top Header */}
                    <View style={styles.badgeHeader}>
                      <Text style={[styles.badgeRarity, { color: rarityInfo.color }]}>
                        {rarityInfo.label}
                      </Text>
                      <View style={[styles.catPill, { backgroundColor: `${catInfo.color}20` }]}>
                        <Text style={[styles.catPillText, { color: catInfo.color }]}>{catInfo.emoji}</Text>
                      </View>
                    </View>

                    <Text style={[styles.badgeEmoji, !isUnlocked && { opacity: 0.25 }]}>
                      {isUnlocked ? ach.emoji : '🔒'}
                    </Text>

                    <Text style={styles.badgeTitle}>{ach.title}</Text>
                    <Text style={styles.badgeDesc}>{ach.description}</Text>

                    {ach.flavorText ? (
                      <Text style={styles.flavorText}>"{ach.flavorText}"</Text>
                    ) : null}

                    <View style={styles.badgeFooter}>
                      <Text style={[styles.badgeStatus, { color: isUnlocked ? '#4ade80' : colors.textMuted }]}>
                        {isUnlocked ? '✨ Desbloqueado' : '🔒 Bloqueado'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Trophy Inspection Modal */}
        <TrophyInspectionModal
          visible={!!inspectedAchievement}
          onClose={() => setInspectedAchievement(null)}
          achievement={inspectedAchievement}
        />
      </View>
    </ScreenContainer>
  );
}

export default function AchievementsScreen() {
  return (
    <RouteFeatureGuard route="/achievements" title="Sala de Trofeos">
      <AchievementsScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 840, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 2 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs, lineHeight: 17 },

  rankCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankLabel: { color: colors.primary, fontSize: 9, fontFamily: fonts.bodyBold, letterSpacing: 1 },
  rankTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md, marginTop: 1 },
  countBadge: { backgroundColor: 'rgba(192, 132, 252, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.md },
  countBadgeText: { color: colors.primary, fontSize: 11, fontFamily: fonts.bodyBold },
  track: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  viewModeRow: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  viewModeBtnActive: { backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: colors.primary },
  viewModeText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  viewModeTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },

  catRow: { gap: 6, paddingVertical: 4 },
  catChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi },
  catChipTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  // Showcase Pedestal Styles
  showcaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  showcasePedestal: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 6,
    ...glowShadowPrimary,
  },
  showcasePedestalLocked: {
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  trophyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  trophyRingLocked: {
    borderColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  trophyIcon: { fontSize: 32 },
  pedestalTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textAlign: 'center',
    minHeight: 30,
  },
  miniRarityPill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniRarityText: { fontSize: 8, fontFamily: fonts.bodyBold },

  // List View Styles
  badgeGrid: { gap: spacing.sm },
  badgeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  badgeCardLocked: { borderColor: colors.border, backgroundColor: 'rgba(255, 255, 255, 0.02)' },
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeRarity: { fontSize: 10, fontFamily: fonts.bodyBold },
  catPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catPillText: { fontSize: 11 },
  badgeEmoji: { fontSize: 28, marginVertical: 2 },
  badgeTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm },
  badgeDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 17 },
  flavorText: { color: colors.primary, fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  badgeFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', paddingTop: 4, marginTop: 4 },
  badgeStatus: { fontSize: 10, fontFamily: fonts.bodyBold },
});
