import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing, glowShadowPrimary } from '@/constants/theme';
import {
  StreakData,
  getStreakData,
  recordDailyActivity,
  getStreakFlameEmoji,
  getNextStreakMilestone,
  getLast7DaysActivity,
} from '@/lib/streaks';
import { triggerLightHaptic } from '@/lib/haptics';

export function StreakBadgeWidget({ compact = false }: { compact?: boolean }) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const flameScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    recordDailyActivity().then((res) => {
      setStreak(res.data);
    }).catch(() => {
      getStreakData().then(setStreak).catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (streak && streak.currentStreak > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [streak?.currentStreak]);

  if (!streak) return null;

  const flameEmoji = getStreakFlameEmoji(streak.currentStreak);
  const milestoneInfo = getNextStreakMilestone(streak.currentStreak);
  const weekDots = getLast7DaysActivity(streak);

  const handleOpenModal = () => {
    triggerLightHaptic();
    setModalVisible(true);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactPill}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Animated.Text style={[styles.flameText, { transform: [{ scale: flameScale }] }]}>
          {flameEmoji}
        </Animated.Text>
        <Text style={styles.compactStreakText}>
          {streak.currentStreak} {streak.currentStreak === 1 ? 'día' : 'días'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.widgetCard}
        onPress={handleOpenModal}
        activeOpacity={0.85}
      >
        <View style={styles.widgetLeft}>
          <Animated.View style={[styles.flameCircle, { transform: [{ scale: flameScale }] }]}>
            <Text style={styles.flameEmoji}>{flameEmoji}</Text>
          </Animated.View>

          <View style={styles.streakTextGroup}>
            <View style={styles.streakHeaderRow}>
              <Text style={styles.streakCountNumber}>{streak.currentStreak}</Text>
              <Text style={styles.streakCountLabel}>
                {streak.currentStreak === 1 ? 'DÍA DE RACHA' : 'DÍAS DE RACHA'}
              </Text>
            </View>
            <Text style={styles.streakSubtitle}>
              {milestoneInfo.daysRemaining > 0
                ? `Faltan ${milestoneInfo.daysRemaining} días para la insignia de ${milestoneInfo.nextMilestone} días`
                : `¡Racha legendaria alcanzada! Récord: ${streak.longestStreak} días`}
            </Text>
          </View>
        </View>

        {/* 7 Days Dots */}
        <View style={styles.dotsRow}>
          {weekDots.map((d, i) => (
            <View key={i} style={styles.dotCol}>
              <View
                style={[
                  styles.dayDot,
                  d.active && styles.dayDotActive,
                  d.isToday && styles.dayDotToday,
                ]}
              >
                {d.active ? <Text style={styles.dotCheck}>✓</Text> : null}
              </View>
              <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
                {d.dayName}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Full Streak Roadmap Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔥 Tu Racha de Conexión</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Triple Card */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxNumber}>{streak.currentStreak}</Text>
                <Text style={styles.statBoxLabel}>Racha Actual</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxNumber}>{streak.longestStreak}</Text>
                <Text style={styles.statBoxLabel}>Racha Récord</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxNumber}>{streak.totalDaysActive}</Text>
                <Text style={styles.statBoxLabel}>Días Totales</Text>
              </View>
            </View>

            {/* Roadmap Milestones */}
            <Text style={styles.sectionHeader}>Logros de Racha:</Text>
            <View style={styles.milestonesList}>
              {[
                { days: 3, label: 'Chispa Inicial 🔥', desc: '3 días consecutivos explorando' },
                { days: 7, label: 'Hábito Íntimo 🌟', desc: '1 semana de conexión continua' },
                { days: 14, label: 'Llama Púrpura 💜', desc: '2 semanas de complicidad y juego' },
                { days: 30, label: 'Maestro/a de Racha 👑', desc: '1 mes completo de constancia' },
                { days: 100, label: 'Leyenda Viviente ✨', desc: '100 días de trayectoria kink' },
              ].map((m) => {
                const isUnlocked = streak.currentStreak >= m.days;
                return (
                  <View
                    key={m.days}
                    style={[
                      styles.milestoneRow,
                      isUnlocked && styles.milestoneRowUnlocked,
                    ]}
                  >
                    <Text style={styles.milestoneIcon}>{isUnlocked ? '🏆' : '🔒'}</Text>
                    <View style={styles.milestoneInfo}>
                      <Text style={[styles.milestoneTitle, isUnlocked && styles.milestoneTitleUnlocked]}>
                        {m.label} ({m.days}d)
                      </Text>
                      <Text style={styles.milestoneDesc}>{m.desc}</Text>
                    </View>
                    {isUnlocked ? (
                      <View style={styles.unlockedTag}>
                        <Text style={styles.unlockedTagText}>CONSEGUIDO</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCtaBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCtaBtnText}>¡A seguir explorando! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Compact Pill
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.15)',
    borderColor: '#fb923c',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  flameText: {
    fontSize: 14,
  },
  compactStreakText: {
    color: '#fb923c',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },

  // Main Card
  widgetCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 146, 60, 0.35)',
    marginVertical: spacing.xs,
    gap: spacing.sm,
    ...glowShadowPrimary,
  },
  widgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderWidth: 1.5,
    borderColor: '#fb923c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameEmoji: {
    fontSize: 22,
  },
  streakTextGroup: {
    flex: 1,
    gap: 2,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakCountNumber: {
    color: '#fb923c',
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    lineHeight: 28,
  },
  streakCountLabel: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  streakSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
  },

  // 7-day mini row
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  dotCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: '#fb923c',
    borderColor: '#fb923c',
  },
  dayDotToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dotCheck: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  dayLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 9,
  },
  dayLabelToday: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1.5,
    borderColor: '#fb923c',
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBoxNumber: {
    color: '#fb923c',
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  statBoxLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  milestonesList: {
    gap: spacing.xs,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    opacity: 0.6,
  },
  milestoneRowUnlocked: {
    borderColor: '#fb923c',
    backgroundColor: 'rgba(251, 146, 60, 0.12)',
    opacity: 1,
  },
  milestoneIcon: {
    fontSize: 18,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  milestoneTitleUnlocked: {
    color: colors.text,
  },
  milestoneDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  unlockedTag: {
    backgroundColor: '#fb923c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unlockedTagText: {
    color: '#000',
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  modalCtaBtn: {
    backgroundColor: '#fb923c',
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  modalCtaBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
