import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { checkAndUnlockAchievements, Achievement } from '@/lib/achievements';

export default function AchievementsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [list, setList] = useState<Achievement[]>([]);

  useEffect(() => {
    (async () => {
      const all = await checkAndUnlockAchievements();
      setList(all);
    })();
  }, []);

  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏅 Logros & Insignias Kink</Text>
          <Text style={styles.subtitle}>
            Recompensas por explorar actividades, cuidar la seguridad y conectar con parejas
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.progressTitle}>Progreso de Desbloqueo</Text>
            <Text style={styles.progressNum}>{unlockedCount} / {list.length} Logros</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((unlockedCount / Math.max(1, list.length)) * 100)}%` }]} />
          </View>
        </View>

        {/* Grid of Badges */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.badgeGrid}>
            {list.map((ach) => (
              <View
                key={ach.id}
                style={[
                  styles.badgeCard,
                  !ach.unlocked && styles.badgeCardLocked,
                ]}
              >
                <Text style={[styles.badgeEmoji, !ach.unlocked && { opacity: 0.3 }]}>{ach.emoji}</Text>
                <Text style={[styles.badgeTitle, !ach.unlocked && { color: colors.textMuted }]}>{ach.title}</Text>
                <Text style={styles.badgeDesc}>{ach.description}</Text>
                <View style={[styles.statusPill, ach.unlocked ? styles.statusUnlocked : styles.statusLocked]}>
                  <Text style={[styles.statusPillText, ach.unlocked ? { color: colors.success } : { color: colors.textMuted }]}>
                    {ach.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    marginVertical: spacing.xs,
  },
  progressTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  progressNum: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '900' },
  track: { height: 10, backgroundColor: colors.surfaceLight, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    width: '47%',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeCardLocked: { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  badgeEmoji: { fontSize: 40 },
  badgeTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800', textAlign: 'center' },
  badgeDesc: { color: colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  statusUnlocked: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success },
  statusLocked: { backgroundColor: colors.surfaceLight },
  statusPillText: { fontSize: 10, fontWeight: '800' },
});
