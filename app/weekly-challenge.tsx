import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Challenge {
  id: string;
  title: string;
  category: string;
  emoji: string;
  difficulty: 'Fácil' | 'Moderado' | 'Desafiante';
  xpReward: number;
  description: string;
  safetyTip: string;
  completed: boolean;
}

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Noche de Sensación Térmica & Vendas',
    category: 'Sensorial',
    emoji: '🕯️',
    difficulty: 'Fácil',
    xpReward: 150,
    description: 'Experimenta 15 minutos de privación sensorial (usando un antifaz de seda) y contraste térmico con hielo suave y cera tibia.',
    safetyTip: 'Comprueba el punto de fusión de las velas antes de tocarlas en la piel (máximo 48°C).',
    completed: false,
  },
  {
    id: 'ch-2',
    title: 'Negociación Eficaz en la Sala de Negociación',
    category: 'Intimidad & D/s',
    emoji: '✍️',
    difficulty: 'Moderado',
    xpReward: 200,
    description: 'Ingresa a la Sala de Negociación en vivo con tu pareja y firmen digitalmente un acuerdo con al menos 3 actividades seleccionadas.',
    safetyTip: 'Asegúrense de acordar una palabra clave de detención (Safeword) antes de firmar.',
    completed: true,
  },
  {
    id: 'ch-3',
    title: 'Ritual de Aftercare & Té de Reconexión',
    category: 'Aftercare',
    emoji: '🪷',
    difficulty: 'Fácil',
    xpReward: 100,
    description: 'Realiza un chequeo emocional de 20 minutos tras una escena con manta térmica, hidratación y palabras de afirmación.',
    safetyTip: 'No apresuren la salida del estado de relajación o Subspace.',
    completed: false,
  },
];

export default function WeeklyChallengeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [challenges, setChallenges] = useState<Challenge[]>(WEEKLY_CHALLENGES);

  const toggleComplete = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.completed;
          if (nextState) {
            Alert.alert(
              '¡Reto Completado! 🎉',
              `¡Felicitaciones! Has ganado +${c.xpReward} XP y desbloqueado avance en tus Logros e Insignias.`
            );
          }
          return { ...c, completed: nextState };
        }
        return c;
      })
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎲 Retos Semanales Kink</Text>
          <Text style={styles.subtitle}>
            Desafíos guiados personalizados para explorar nuevas dinámicas con tu pareja de forma segura
          </Text>
        </View>

        {/* Weekly Countdown Banner */}
        <View style={styles.timerBanner}>
          <Text style={styles.timerTitle}>⏳ Reto Semanal Actual termina en:</Text>
          <Text style={styles.timerNum}>4 días · 18 horas · 22 minutos</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md }}>
            {challenges.map((ch) => (
              <View key={ch.id} style={[styles.card, ch.completed && styles.cardCompleted]}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 36 }}>{ch.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.diffBadge}>{ch.difficulty.toUpperCase()}</Text>
                      <Text style={styles.catText}>· {ch.category}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{ch.title}</Text>
                  </View>
                  <Text style={styles.xpText}>+{ch.xpReward} XP</Text>
                </View>

                <Text style={styles.cardDesc}>{ch.description}</Text>

                <View style={styles.safetyBox}>
                  <Text style={styles.safetyText}>🛡️ Consejo de Seguridad: {ch.safetyTip}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.completeBtn, ch.completed && styles.completeBtnDone]}
                  onPress={() => toggleComplete(ch.id)}
                >
                  <Text style={[styles.completeBtnText, ch.completed && { color: colors.success }]}>
                    {ch.completed ? '✓ Reto Completado (+XP Ganado)' : 'Marcar Reto como Completado ✅'}
                  </Text>
                </TouchableOpacity>
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
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  timerBanner: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
    gap: 2,
    marginVertical: spacing.xs,
  },
  timerTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  timerNum: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '900' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  cardCompleted: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.05)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  diffBadge: { color: colors.warning, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  catText: { color: colors.textMuted, fontSize: fontSize.xs },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  xpText: { color: colors.neonPink, fontSize: fontSize.sm, fontWeight: '900' },

  cardDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  safetyBox: { backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.warning },
  safetyText: { color: colors.warning, fontSize: fontSize.xs, lineHeight: 16, fontWeight: '600' },

  completeBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  completeBtnDone: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success },
  completeBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
