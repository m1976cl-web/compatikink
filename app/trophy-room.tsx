import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, spacing, radii, glowShadowPrimary } from '@/constants/theme';
import { getUserGamificationData, UserGamificationData, KinkBadge, EXPLORATION_LEVELS } from '@/lib/badgesXP';
import { notify } from '@/lib/notify';

export default function TrophyRoomScreen() {
  const [gamificationData, setGamificationData] = useState<UserGamificationData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'Todos' | 'Desbloqueados' | 'Bloqueados' | 'Racha' | 'Seguridad'>('Todos');
  const [selectedBadge, setSelectedBadge] = useState<KinkBadge | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserGamificationData();
    setGamificationData(data);
  };

  const tabs = ['Todos', 'Desbloqueados', 'Bloqueados', 'Racha', 'Seguridad'] as const;

  const filteredBadges = gamificationData?.badges.filter(badge => {
    if (selectedTab === 'Todos') return true;
    if (selectedTab === 'Desbloqueados') return badge.unlockedAt;
    if (selectedTab === 'Bloqueados') return !badge.unlockedAt;
    if (selectedTab === 'Racha') return badge.category === 'streaks';
    if (selectedTab === 'Seguridad') return badge.category === 'onboarding' || badge.id === 'guardian_zk';
    return true;
  });

  const currentLevelInfo = gamificationData ? EXPLORATION_LEVELS.find(l => l.level === gamificationData.currentLevel) : null;
  const maxXP = currentLevelInfo ? currentLevelInfo.maxXP : 0;
  const minXP = currentLevelInfo ? currentLevelInfo.minXP : 0;
  const progressPercent = maxXP === Infinity ? 100 : (gamificationData ? ((gamificationData.totalXP - minXP) / (maxXP - minXP)) * 100 : 0);

  return (
    <ScreenContainer title="🏆 Sala de Trofeos & Rango">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {gamificationData && (
          <>
            {/* Top Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <Text style={styles.levelBadge}>⭐ Nivel {gamificationData.currentLevel}</Text>
                <Text style={styles.totalXP}>{gamificationData.totalXP} XP</Text>
              </View>
              <Text style={styles.levelTitle}>{gamificationData.levelTitle}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, progressPercent))}%` }]} />
              </View>
              {maxXP !== Infinity && (
                <Text style={styles.progressText}>
                  {gamificationData.totalXP} / {maxXP} XP para el siguiente nivel
                </Text>
              )}
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 3D-styled Grid of Medals */}
            <View style={styles.grid}>
              {filteredBadges?.map(badge => {
                const isUnlocked = !!badge.unlockedAt;
                return (
                  <TouchableOpacity
                    key={badge.id}
                    style={[styles.medalCard, isUnlocked ? styles.medalUnlocked : styles.medalLocked]}
                    onPress={() => setSelectedBadge(badge)}
                  >
                    <Text style={[styles.medalEmoji, !isUnlocked && styles.medalEmojiLocked]}>
                      {isUnlocked ? badge.emoji : '🔒'}
                    </Text>
                    <Text style={[styles.medalTitle, !isUnlocked && styles.medalTitleLocked]} numberOfLines={2}>
                      {badge.title}
                    </Text>
                    {isUnlocked && <Text style={styles.unlockedTag}>Desbloqueado</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Tap modal on medal */}
        <Modal visible={!!selectedBadge} transparent animationType="fade" onRequestClose={() => setSelectedBadge(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedBadge(null)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              {selectedBadge && (
                <>
                  <Text style={styles.modalEmoji}>{selectedBadge.unlockedAt ? selectedBadge.emoji : '🔒'}</Text>
                  <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
                  <Text style={styles.modalXP}>+{selectedBadge.xpReward} XP</Text>
                  <Text style={styles.modalDescription}>{selectedBadge.description}</Text>
                  <View style={styles.modalLore}>
                    <Text style={styles.modalLoreText}>
                      {selectedBadge.unlockedAt 
                        ? `Desbloqueado el ${new Date(selectedBadge.unlockedAt).toLocaleDateString()}`
                        : 'Sigue explorando para descubrir cómo desbloquear este logro.'}
                    </Text>
                  </View>
                  {selectedBadge.unlockedAt && (
                    <TouchableOpacity style={styles.shareButton} onPress={() => notify('Logro copiado', 'Puedes compartirlo con tus amigos.')}>
                      <Text style={styles.shareButtonText}>Compartir Logro</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBadge(null)}>
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    ...glowShadowPrimary(0.15),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  totalXP: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  levelTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: 28,
    marginBottom: spacing.md,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'right',
  },
  tabsContainer: {
    marginBottom: spacing.lg,
  },
  tabsContent: {
    gap: spacing.sm,
  },
  tabButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  medalCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  medalUnlocked: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    ...glowShadowPrimary(0.2),
  },
  medalLocked: {
    backgroundColor: 'rgba(21, 13, 36, 0.5)',
    borderColor: colors.borderSubtle,
  },
  medalEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  medalEmojiLocked: {
    opacity: 0.5,
  },
  medalTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    textAlign: 'center',
  },
  medalTitleLocked: {
    color: colors.textMuted,
  },
  unlockedTag: {
    marginTop: spacing.xs,
    color: colors.success,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...glowShadowPrimary(0.3),
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalXP: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  modalDescription: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalLore: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  modalLoreText: {
    color: colors.textMuted,
    fontFamily: fonts.displayItalic || fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shareButtonText: {
    color: '#000',
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: spacing.sm,
  },
  closeButtonText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },
});
