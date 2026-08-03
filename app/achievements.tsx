import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  checkAndUnlockAchievements,
  Achievement,
  AchievementCategory,
  CATEGORY_LABELS,
  RARITY_LABELS,
} from '@/lib/achievements';

export default function AchievementsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [list, setList] = useState<Achievement[]>([]);
  const [selectedCat, setSelectedCat] = useState<AchievementCategory | 'all'>('all');

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
    if (unlocked >= 15) return ' Gran Maestro/a Fetish ✨';
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
          <Text style={styles.title}>Insignias & Logros Fetish 🎭⚡</Text>
          <Text style={styles.subtitle}>
            Reconocimientos atrevidos, fetichistas y divertidos por explorar tus deseos con seguridad
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
              <Text style={styles.countBadgeText}>{unlockedCount} / {totalCount}</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <TouchableOpacity
            style={[styles.catChip, selectedCat === 'all' && styles.catChipActive]}
            onPress={() => setSelectedCat('all')}
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
                onPress={() => setSelectedCat(catKey)}
              >
                <Text style={[styles.catChipText, isSel && { color: catInfo.color, fontWeight: '800' }]}>
                  {catInfo.emoji} {catInfo.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grid of Badges */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeGrid}>
            {filteredList.map((ach) => {
              const catInfo = CATEGORY_LABELS[ach.category];
              const rarityInfo = RARITY_LABELS[ach.rarity];
              const isUnlocked = ach.unlocked;

              return (
                <View
                  key={ach.id}
                  style={[
                    styles.badgeCard,
                    isUnlocked
                      ? { borderColor: ach.glowColor, backgroundColor: 'rgba(18, 9, 31, 0.92)' }
                      : styles.badgeCardLocked,
                  ]}
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
                    {ach.emoji}
                  </Text>
                  <Text style={[styles.badgeTitle, !isUnlocked && { color: colors.textMuted }]}>
                    {ach.title}
                  </Text>
                  
                  <Text style={styles.badgeDesc}>{ach.description}</Text>

                  {/* Flavor Text / Humor Quote */}
                  {isUnlocked && (
                    <Text style={styles.flavorText}>"{ach.flavorText}"</Text>
                  )}

                  {/* Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isUnlocked
                        ? { backgroundColor: `${ach.glowColor}25`, borderColor: ach.glowColor, borderWidth: 1 }
                        : styles.statusLocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isUnlocked ? { color: ach.glowColor } : { color: colors.textMuted },
                      ]}
                    >
                      {isUnlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 820, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  rankCard: {
    backgroundColor: 'rgba(21, 13, 36, 0.95)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankLabel: { color: colors.textDim, fontSize: 10, fontFamily: fonts.bodySemi, letterSpacing: 1 },
  rankTitle: { color: '#fbbf24', fontSize: fontSize.md, fontFamily: fonts.displaySemi, fontWeight: '800' },
  countBadge: { backgroundColor: colors.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countBadgeText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '900' },
  track: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

  catRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs, paddingBottom: 4 },
  catChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.accentSoft, borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  catChipTextActive: { color: colors.primary, fontWeight: '800' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    width: '47%',
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    gap: 4,
  },
  badgeCardLocked: { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  badgeRarity: { fontSize: 9, fontWeight: '800' },
  catPill: { borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  catPillText: { fontSize: 10 },
  badgeEmoji: { fontSize: 38, marginVertical: 4 },
  badgeTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800', textAlign: 'center' },
  badgeDesc: { color: colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 },
  flavorText: { color: '#fbbf24', fontSize: 9, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 6 },
  statusLocked: { backgroundColor: colors.surfaceLight },
  statusPillText: { fontSize: 10, fontWeight: '800' },
});
