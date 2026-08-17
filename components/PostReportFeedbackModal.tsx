import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Platform } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { recordPostReportFeedback, ImpactFeedbackValue } from '@/lib/impactAnalytics';

interface Props {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
}

export function PostReportFeedbackModal({ visible, sessionId, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const handleSelectFeedback = async (val: ImpactFeedbackValue) => {
    await recordPostReportFeedback(sessionId, val);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {submitted ? (
            <View style={styles.submittedBox}>
              <Text style={styles.submittedEmoji}>✨</Text>
              <Text style={styles.submittedTitle}>¡Gracias por tu retroalimentación!</Text>
              <Text style={styles.submittedSub}>Tu opinión ayuda a mejorar la experiencia de pareja.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.icon}>💬</Text>
              <Text style={styles.title}>¿Te sirvió esta conversación?</Text>
              <Text style={styles.subtitle}>
                Tu respuesta es 100% confidencial y nos ayuda a medir el impacto real en la conexión de pareja.
              </Text>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.optionBtn}
                  onPress={() => handleSelectFeedback('helpful')}
                >
                  <Text style={styles.optionEmoji}>👍</Text>
                  <Text style={styles.optionText}>Mucho</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionBtn}
                  onPress={() => handleSelectFeedback('neutral')}
                >
                  <Text style={styles.optionEmoji}>😐</Text>
                  <Text style={styles.optionText}>Neutral</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionBtn}
                  onPress={() => handleSelectFeedback('unhelpful')}
                >
                  <Text style={styles.optionEmoji}>👎</Text>
                  <Text style={styles.optionText}>Poco</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
                <Text style={styles.skipText}>Omitir</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: 'rgba(21, 13, 36, 0.95)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 40px rgba(7, 4, 13, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  icon: { fontSize: 40 },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: 'rgba(35, 23, 62, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  optionEmoji: { fontSize: 24 },
  optionText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontFamily: fonts.body,
  },
  submittedBox: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  submittedEmoji: { fontSize: 48 },
  submittedTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: colors.success,
    textAlign: 'center',
  },
  submittedSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
