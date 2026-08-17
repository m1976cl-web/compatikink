import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { DEFAULT_ICEBREAKERS } from '@/lib/virtualDateManager';

interface Props {
  visible: boolean;
  targetNickname: string;
  onClose: () => void;
}

export function VirtualDateModal({ visible, targetNickname, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [safewordStatus, setSafewordStatus] = useState<'green' | 'yellow' | 'red'>('green');

  const currentPrompt = DEFAULT_ICEBREAKERS[stepIndex] || DEFAULT_ICEBREAKERS[0];
  const isCompleted = stepIndex >= DEFAULT_ICEBREAKERS.length;

  const handleNextStep = () => {
    if (stepIndex < DEFAULT_ICEBREAKERS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setStepIndex(DEFAULT_ICEBREAKERS.length);
    }
  };

  const handleRestart = () => {
    setStepIndex(0);
    setSafewordStatus('green');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>⚡ Cita Virtual Guiada (10 min)</Text>
              <Text style={styles.subTitle}>Conexión íntima con {targetNickname}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Live Safewords Control Bar */}
          <View style={styles.safewordsBar}>
            <Text style={styles.safewordLabel}>Estado de Palabra de Seguridad (Safeword):</Text>
            <View style={styles.safewordsGrid}>
              <TouchableOpacity
                style={[
                  styles.safewordBtn,
                  safewordStatus === 'green' && { backgroundColor: 'rgba(16, 185, 129, 0.3)', borderColor: '#10b981' },
                ]}
                onPress={() => setSafewordStatus('green')}
              >
                <Text style={styles.safewordText}>🟢 Luz Verde</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.safewordBtn,
                  safewordStatus === 'yellow' && { backgroundColor: 'rgba(234, 179, 8, 0.3)', borderColor: '#eab308' },
                ]}
                onPress={() => setSafewordStatus('yellow')}
              >
                <Text style={styles.safewordText}>🟡 Precaución</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.safewordBtn,
                  safewordStatus === 'red' && { backgroundColor: 'rgba(244, 63, 94, 0.3)', borderColor: '#f43f5e' },
                ]}
                onPress={() => setSafewordStatus('red')}
              >
                <Text style={styles.safewordText}>🔴 Detener</Text>
              </TouchableOpacity>
            </View>
          </View>

          {safewordStatus === 'red' ? (
            <View style={styles.pausedBox}>
              <Text style={styles.pausedIcon}>🔴</Text>
              <Text style={styles.pausedTitle}>Cita Virtual Pausada por Safeword Rojo</Text>
              <Text style={styles.pausedSub}>
                Tómense un momento para respirar, verificar su estado emocional y ofrecer aftercare.
              </Text>
            </View>
          ) : isCompleted ? (
            <View style={styles.completedBox}>
              <Text style={styles.completedIcon}>✨🪷✨</Text>
              <Text style={styles.completedTitle}>¡Cita Virtual Completada!</Text>
              <Text style={styles.completedSub}>
                Han recorrido los 5 rompehielos guiados. Recuerden finalizar con un momento de Aftercare.
              </Text>
              <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
                <Text style={styles.restartBtnText}>Reiniciar Cita</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.contentScroll}>
              {/* Progress dots */}
              <View style={styles.progressRow}>
                {DEFAULT_ICEBREAKERS.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === stepIndex && styles.activeDot,
                      idx < stepIndex && styles.completedDot,
                    ]}
                  />
                ))}
              </View>

              {/* Card Question */}
              <View style={styles.questionCard}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    Categoría: {currentPrompt.category.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.questionText}>"{currentPrompt.question}"</Text>

                {currentPrompt.followUpPrompt ? (
                  <View style={styles.followUpBox}>
                    <Text style={styles.followUpTitle}>💡 Dinámica de Conexión:</Text>
                    <Text style={styles.followUpText}>{currentPrompt.followUpPrompt}</Text>
                  </View>
                ) : null}
              </View>

              {/* Action Button */}
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
                <Text style={styles.nextBtnText}>
                  {stepIndex === DEFAULT_ICEBREAKERS.length - 1
                    ? 'Finalizar Cita & ir a Aftercare'
                    : 'Siguiente Pregunta Rompehielos ➔'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: 'rgba(21, 13, 36, 0.96)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    gap: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 16px 48px rgba(7, 4, 13, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.lg, color: colors.text },
  subTitle: { fontSize: fontSize.xs, color: colors.textMuted },
  closeBtn: { padding: 4 },
  closeBtnText: { color: colors.textMuted, fontSize: 18, fontWeight: 'bold' },
  safewordsBar: {
    backgroundColor: 'rgba(35, 23, 62, 0.6)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  safewordLabel: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.body },
  safewordsGrid: { flexDirection: 'row', gap: spacing.xs },
  safewordBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  safewordText: { fontSize: 11, fontWeight: 'bold', color: colors.text },
  contentScroll: { gap: spacing.md },
  progressRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  activeDot: { backgroundColor: colors.neonPurple, width: 24 },
  completedDot: { backgroundColor: '#10b981' },
  questionCard: {
    backgroundColor: 'rgba(35, 23, 62, 0.4)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    gap: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  categoryBadgeText: { color: colors.neonPurple, fontSize: 10, fontWeight: 'bold' },
  questionText: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  followUpBox: {
    backgroundColor: 'rgba(10, 7, 18, 0.5)',
    padding: spacing.md,
    borderRadius: radii.md,
    gap: 4,
  },
  followUpTitle: { fontSize: 11, color: '#D4AF37', fontWeight: 'bold' },
  followUpText: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: 'bold' },
  pausedBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  pausedIcon: { fontSize: 44 },
  pausedTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.md, color: colors.neonRose },
  pausedSub: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  completedBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  completedIcon: { fontSize: 48 },
  completedTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.lg, color: colors.success },
  completedSub: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  restartBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.neonPurple,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  restartBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: 'bold' },
});
