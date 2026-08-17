import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, glowShadowPrimary } from '@/constants/theme';
import {
  DailyChallenge,
  DailyChallengeCategory,
  getChallengeForDate,
} from '@/data/dailyChallenges';
import {
  isTodayChallengeCompleted,
  completeDailyChallenge,
} from '@/lib/dailyChallenges';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

const CATEGORY_COLORS: Record<DailyChallengeCategory, { color: string; bg: string; emoji: string }> = {
  'Educación': { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', emoji: '📖' },
  'Exploración': { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', emoji: '🎲' },
  'Comunicación': { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', emoji: '💬' },
  'Seguridad & Consent': { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', emoji: '🛡️' },
  'Gear & Deseos': { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', emoji: '🎀' },
};

export function DailyChallengeCard() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<DailyChallenge>(() => getChallengeForDate());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    const today = getChallengeForDate();
    setChallenge(today);
    isTodayChallengeCompleted().then(setIsCompleted).catch(() => {});
  }, []);

  const handleComplete = async () => {
    if (isCompleted || isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await completeDailyChallenge(challenge);
      setIsCompleted(true);
      triggerSuccessHaptic();

      if (res.partnerName) {
        Alert.alert(
          '¡Desafío Cumplido! 🎉',
          `Has ganado +${res.xpEarned} XP y sumado a tu racha. Los puntos se acreditaron a tu vínculo con ${res.partnerName}.`
        );
      } else {
        Alert.alert(
          '¡Desafío Cumplido! 🎉',
          `Has ganado +${res.xpEarned} XP y sumado a tu racha de conexión diaria.`
        );
      }
    } catch {
      Alert.alert('Error', 'No se pudo registrar la completitud del desafío.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleNavigate = () => {
    triggerLightHaptic();
    if (challenge.actionRoute) {
      router.push(challenge.actionRoute as any);
    }
  };

  const catStyle = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS['Educación'];

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* Header Badge Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.dailyTag}>
            <Text style={styles.dailyTagText}>🎯 RETO DEL DÍA {challenge.dayNumber}/31</Text>
          </View>
          <View style={[styles.catBadge, { backgroundColor: catStyle.bg, borderColor: catStyle.color }]}>
            <Text style={[styles.catBadgeText, { color: catStyle.color }]}>
              {catStyle.emoji} {challenge.category}
            </Text>
          </View>
        </View>

        <View style={styles.xpRewardPill}>
          <Text style={styles.xpRewardText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>

      {/* Challenge Title & Desc */}
      <View style={styles.contentWrap}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.desc}>{challenge.description}</Text>
      </View>

      {/* Footer Actions */}
      {isCompleted ? (
        <View style={styles.completedBanner}>
          <Text style={styles.completedBannerIcon}>✅</Text>
          <Text style={styles.completedBannerText}>
            ¡Completado hoy! (+{challenge.xpReward} XP sumados a tu racha)
          </Text>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          {challenge.actionRoute ? (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: catStyle.color }]}
              onPress={handleNavigate}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, { color: catStyle.color }]}>
                {challenge.actionLabel} →
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.claimBtn, isClaiming && { opacity: 0.6 }]}
            onPress={handleComplete}
            disabled={isClaiming}
            activeOpacity={0.85}
          >
            <Text style={styles.claimBtnText}>
              {isClaiming ? 'Registrando...' : 'Marcar Completado ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    marginVertical: spacing.xs,
    gap: spacing.sm,
    ...glowShadowPrimary,
  },
  cardCompleted: {
    borderColor: 'rgba(74, 222, 128, 0.4)',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dailyTag: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  dailyTagText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  catBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  catBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
  },
  xpRewardPill: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  xpRewardText: {
    color: '#fbbf24',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  contentWrap: {
    gap: 3,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  desc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    paddingVertical: 9,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  claimBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: '#4ade80',
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    borderRadius: radii.lg,
    gap: 6,
    marginTop: 2,
  },
  completedBannerIcon: {
    fontSize: 14,
  },
  completedBannerText: {
    color: '#4ade80',
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
});
