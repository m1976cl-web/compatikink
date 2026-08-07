import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  KINK_ROULETTE_CHALLENGES,
  KinkChallenge,
  RouletteIntensity,
} from '@/data/kinkRouletteData';
import { addXpToPartnerLink, getPartnerLinks } from '@/lib/partnerJournal';
import { schedule3PhaseAftercareProtocol } from '@/lib/localNotifications';

export default function KinkRouletteScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [selectedIntensity, setSelectedIntensity] = useState<RouletteIntensity | 'Todas'>('Todas');
  const [currentChallenge, setCurrentChallenge] = useState<KinkChallenge>(KINK_ROULETTE_CHALLENGES[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [completedList, setCompletedList] = useState<string[]>([]);

  const handleSpinRoulette = () => {
    setIsSpinning(true);
    let pool = KINK_ROULETTE_CHALLENGES;
    if (selectedIntensity !== 'Todas') {
      pool = pool.filter((c) => c.intensity === selectedIntensity);
    }
    if (pool.length === 0) pool = KINK_ROULETTE_CHALLENGES;

    // Simulate roulette spin animation
    let count = 0;
    const interval = setInterval(() => {
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setCurrentChallenge(randomItem);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const handleClaimReward = async () => {
    if (!currentChallenge) return;
    const links = await getPartnerLinks();
    if (links.length > 0) {
      await addXpToPartnerLink(links[0].id, currentChallenge.xpReward);
      Alert.alert(
        '¡Reto Cumplido! 🎉',
        `Has ganado +${currentChallenge.xpReward} XP y se han sumado a tu vínculo con ${links[0].partnerName}. Protocolo de Aftercare agendado.`
      );
    } else {
      Alert.alert(
        '¡Reto Cumplido! 🎉',
        `Has ganado +${currentChallenge.xpReward} XP de Afinidad Kink. Protocolo de Aftercare agendado.`
      );
    }
    await schedule3PhaseAftercareProtocol();
    setCompletedList((prev) => [...prev, currentChallenge.id]);
  };

  return (
    <ScreenContainer title="Ruleta Kink & Oráculo" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Oráculo de Fantasías & Ruleta Kink 🔮🎲</Text>
          <Text style={styles.subtitle}>
            Generador de retos dinámicos para parejas consensuados por niveles de intensidad y recompensas XP
          </Text>
        </View>

        {/* Intensity Selector */}
        <View style={styles.intensityRow}>
          <Text style={styles.intensityLabel}>Nivel de Intensidad:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {(['Todas', 'Principiante', 'Intermedio', 'Avanzado'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, selectedIntensity === lvl && styles.chipActive]}
                onPress={() => setSelectedIntensity(lvl as any)}
              >
                <Text style={[styles.chipText, selectedIntensity === lvl && styles.chipTextActive]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SPIN ROULETTE WHEEL BOX */}
        <View style={styles.rouletteBox}>
          <View style={[styles.wheelVisual, isSpinning && styles.wheelSpinning]}>
            <Text style={styles.wheelEmoji}>{isSpinning ? '🌀' : currentChallenge.emoji}</Text>
          </View>

          <TouchableOpacity style={styles.spinBtn} disabled={isSpinning} onPress={handleSpinRoulette}>
            <Text style={styles.spinBtnText}>{isSpinning ? 'GIRANDO ORÁCULO...' : '🔮 GIRAR RULETA KINK'}</Text>
          </TouchableOpacity>
        </View>

        {/* CURRENT CHALLENGE DISPLAY CARD */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {currentChallenge && (
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.chEmoji}>{currentChallenge.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chCategory}>{currentChallenge.category.toUpperCase()}</Text>
                  <Text style={styles.chTitle}>{currentChallenge.title}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaBadge}>Intensidad: {currentChallenge.intensity}</Text>
                <Text style={styles.xpBadge}>+{currentChallenge.xpReward} XP</Text>
              </View>

              <Text style={styles.chDesc}>{currentChallenge.description}</Text>

              {/* Roles Breakdown */}
              <View style={styles.rolesGrid}>
                <View style={styles.domBox}>
                  <Text style={styles.roleTitle}>👑 Dominante:</Text>
                  <Text style={styles.roleDesc}>{currentChallenge.domRoleText}</Text>
                </View>

                <View style={styles.subBox}>
                  <Text style={styles.roleTitle}>🧎 Submisivo:</Text>
                  <Text style={styles.roleDesc}>{currentChallenge.subRoleText}</Text>
                </View>
              </View>

              {completedList.includes(currentChallenge.id) ? (
                <View style={styles.doneBanner}>
                  <Text style={styles.doneBannerText}>✓ Reto Cumplido (+{currentChallenge.xpReward} XP otorgados)</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.claimBtn} onPress={handleClaimReward}>
                  <Text style={styles.claimBtnText}>Cumplir Reto & Reclamar +{currentChallenge.xpReward} XP 🎯</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  intensityRow: { gap: spacing.xs, marginVertical: spacing.xs },
  intensityLabel: { color: colors.textDim, fontSize: 10, fontWeight: '800' },
  chipsRow: { flexDirection: 'row', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 10 },
  chipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  rouletteBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.md, marginVertical: spacing.xs },
  wheelVisual: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(192, 132, 252, 0.15)', borderWidth: 3, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  wheelSpinning: { transform: [{ rotate: '45deg' }] },
  wheelEmoji: { fontSize: 42 },
  spinBtn: { backgroundColor: '#fbbf24', borderRadius: radii.lg, paddingHorizontal: 24, paddingVertical: 12 },
  spinBtnText: { color: '#07050a', fontSize: fontSize.xs, fontWeight: '900' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  challengeCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chEmoji: { fontSize: 36 },
  chCategory: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  chTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },

  metaRow: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.textMuted, fontSize: 10 },
  xpBadge: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: '#fbbf24', fontSize: 10, fontWeight: '900' },
  chDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  rolesGrid: { gap: spacing.xs, marginVertical: 4 },
  domBox: { backgroundColor: 'rgba(192, 132, 252, 0.12)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  subBox: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: '#38bdf8' },
  roleTitle: { fontSize: 10, fontWeight: '900', color: colors.textDim },
  roleDesc: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },

  claimBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 4 },
  claimBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },

  doneBanner: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderRadius: radii.md, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.success, marginTop: 4 },
  doneBannerText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '800' },
});
