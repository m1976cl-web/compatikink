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
import { listMyLocalSessions } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { Session, ReportItem } from '@/types';

interface GameCard {
  id: string;
  type: 'truth' | 'dare';
  level: 1 | 2 | 3;
  title: string;
  description: string;
  activityName?: string;
}

const DEFAULT_CARDS: GameCard[] = [
  { id: 'c1', type: 'truth', level: 1, title: '💬 Pregunta de Confianza', description: '¿Cuál fue la primera fantasía Kink que recuerdas haber tenido y qué sentiste al descubrirla?' },
  { id: 'c2', type: 'truth', level: 1, title: '💬 Pregunta de Safewords', description: 'Repitan ambos en voz alta sus palabras clave (Verde, Amarillo, Rojo) y recuerden qué significa cada una.' },
  { id: 'c3', type: 'dare', level: 1, title: '✨ Reto de Masaje Suave', description: 'Aplica un masaje de 2 minutos en los hombros o antebrazos de tu pareja usando movimiento lento y respiración sincronizada.' },
  { id: 'c4', type: 'truth', level: 2, title: '🔥 Pregunta de Intensidad', description: '¿Qué actividad de nivel intermedio que aún no hemos probado te causa más curiosidad y por qué?' },
  { id: 'c5', type: 'dare', level: 2, title: '👁️ Reto de Contacto Visual & Venda', description: 'Ponle una venda en los ojos a tu pareja y durante 3 minutos acaríciala utilizando solo las yemas de tus dedos o una pluma.' },
  { id: 'c6', type: 'dare', level: 3, title: '🪢 Reto Shibari / Restricción Suave', description: 'Realiza una atadura suave de muñecas a la espalda o frente utilizando cuerda o puños blandos con el consentimiento de tu pareja.' },
];

export default function TruthOrDareScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(DEFAULT_CARDS[0]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    (async () => {
      const all = await listMyLocalSessions();
      setSessions(all.filter((s) => s.status === 'complete'));
    })();
  }, []);

  const drawCard = () => {
    const levelCards = DEFAULT_CARDS.filter((c) => c.level === selectedLevel);
    const random = levelCards[Math.floor(Math.random() * levelCards.length)];
    setCurrentCard(random);
    setCompletedCount((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎴 Verdad o Reto Kink</Text>
          <Text style={styles.subtitle}>
            Juego de cartas interactivo para citas presenciales con 3 niveles de intensidad
          </Text>
        </View>

        {/* Level Selector */}
        <View style={styles.levelRow}>
          {[
            { level: 1 as const, label: '🌱 Nivel 1: Conexión & Charla' },
            { level: 2 as const, label: '🔥 Nivel 2: Sensaciones & Venda' },
            { level: 3 as const, label: '⚡ Nivel 3: Acción Kink Negociada' },
          ].map((item) => (
            <TouchableOpacity
              key={item.level}
              style={[styles.levelChip, selectedLevel === item.level && styles.levelChipActive]}
              onPress={() => {
                setSelectedLevel(item.level);
                const levelCards = DEFAULT_CARDS.filter((c) => c.level === item.level);
                setCurrentCard(levelCards[0]);
              }}
            >
              <Text style={[styles.levelChipText, selectedLevel === item.level && styles.levelChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Card Display */}
        {currentCard && (
          <View style={styles.cardContainer}>
            <View
              style={[
                styles.gameCard,
                currentCard.type === 'truth' ? styles.cardTruth : styles.cardDare,
              ]}
            >
              <Text style={styles.cardBadge}>
                {currentCard.type === 'truth' ? '💬 VERDAD' : '⚡ RETO KINK'} · NIVEL {currentCard.level}
              </Text>

              <Text style={styles.cardTitle}>{currentCard.title}</Text>
              <Text style={styles.cardDesc}>{currentCard.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.completedText}>Cartas jugadas en esta cita: {completedCount}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.drawBtn} onPress={drawCard}>
              <Text style={styles.drawBtnText}>🃏 Extraer Siguiente Carta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 640, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  levelRow: { gap: 6, marginVertical: spacing.sm },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  levelChipTextActive: { color: '#fff' },

  cardContainer: { alignItems: 'center', marginVertical: spacing.md, gap: spacing.md },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    minHeight: 260,
    justifyContent: 'space-between',
    borderWidth: 2,
    gap: spacing.md,
  },
  cardTruth: { borderColor: colors.info, backgroundColor: 'rgba(56, 189, 248, 0.08)' },
  cardDare: { borderColor: colors.accent, backgroundColor: 'rgba(244, 114, 182, 0.08)' },

  cardBadge: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  cardDesc: { color: colors.text, fontSize: fontSize.md, lineHeight: 24 },
  cardFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  completedText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },

  drawBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  drawBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '800' },
});
