import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CompatibilityReport, ReportItem, CATEGORY_LABELS } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  report: CompatibilityReport;
  onSelectForPlanning: (item: ReportItem) => void;
}

export function SceneRouletteModal({ visible, onClose, report, onSelectForPlanning }: Props) {
  const candidates = report.items.filter(
    (item) => item.section === 'mutual_match' || item.section === 'explore_together'
  );

  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);
  const [spinningIndex, setSpinningIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && candidates.length > 0) {
      spinRoulette();
    }
  }, [visible]);

  const spinRoulette = () => {
    if (candidates.length === 0 || isSpinning) return;
    setIsSpinning(true);
    setSelectedItem(null);

    let counter = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);
    let speed = 60;

    const runCycle = () => {
      counter++;
      const nextIdx = Math.floor(Math.random() * candidates.length);
      setSpinningIndex(nextIdx);

      if (counter < totalSpins) {
        speed += 12; // slow down gradually
        setTimeout(runCycle, speed);
      } else {
        const finalItem = candidates[nextIdx];
        setSelectedItem(finalItem);
        setIsSpinning(false);

        // Pulse animation on winner
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }
    };

    runCycle();
  };

  if (!visible) return null;

  const currentDisplayItem = selectedItem || candidates[spinningIndex] || candidates[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerEmoji}>🎲</Text>
          <Text style={styles.title}>Ruleta de Citas & Escenas</Text>
          <Text style={styles.subtitle}>
            Una idea aleatoria elegida solo entre vuestros puntos de encuentro consensuados.
          </Text>

          {candidates.length === 0 ? (
            <View style={styles.noMatchesBox}>
              <Text style={styles.noMatchesText}>
                No hay suficiente coincidencia mutua para girar la ruleta aún.
              </Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.resultCard,
                isSpinning && styles.resultCardSpinning,
                selectedItem && styles.resultCardWinner,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {CATEGORY_LABELS[currentDisplayItem?.category]}
                </Text>
              </View>

              <Text style={styles.activityTitle}>{currentDisplayItem?.activityName}</Text>

              <View
                style={[
                  styles.matchTag,
                  currentDisplayItem?.section === 'mutual_match'
                    ? styles.matchTagHot
                    : styles.matchTagExplore,
                ]}
              >
                <Text style={styles.matchTagText}>
                  {currentDisplayItem?.section === 'mutual_match' ? '🔥 Match Mutuo' : '💬 Explorar Juntos'}
                </Text>
              </View>

              {currentDisplayItem?.conversationPrompt ? (
                <Text style={styles.promptText}>
                  "{currentDisplayItem.conversationPrompt}"
                </Text>
              ) : null}
            </Animated.View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {selectedItem ? (
              <>
                <TouchableOpacity
                  style={styles.planBtn}
                  onPress={() => {
                    onClose();
                    onSelectForPlanning(selectedItem);
                  }}
                >
                  <Text style={styles.planBtnText}>📜 Planificar esta escena</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.spinAgainBtn}
                  onPress={spinRoulette}
                  disabled={isSpinning}
                >
                  <Text style={styles.spinAgainBtnText}>🔄 Girar otra vez</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.planBtn, isSpinning && styles.btnDisabled]}
                onPress={spinRoulette}
                disabled={isSpinning}
              >
                <Text style={styles.planBtnText}>
                  {isSpinning ? 'Girando...' : '🎲 Girar Ruleta'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.neonPurple,
    fontSize: fontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  noMatchesBox: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    marginBottom: spacing.lg,
  },
  noMatchesText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(13, 8, 25, 0.95)',
    borderRadius: 18,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  resultCardSpinning: {
    borderColor: colors.warning,
  },
  resultCardWinner: {
    borderColor: colors.neonPurple,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    shadowColor: colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  categoryBadgeText: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  matchTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  matchTagHot: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.neonPurple,
  },
  matchTagExplore: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: colors.info,
  },
  matchTagText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  promptText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  actionsRow: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  planBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  planBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fontSize.md,
  },
  spinAgainBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  spinAgainBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
