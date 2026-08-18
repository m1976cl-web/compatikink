import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { generate10MinConversationGuide } from '@/lib/compatibility';
import { CompatibilityReport } from '@/types';

export interface ConversationGuideModalProps {
  visible: boolean;
  onClose: () => void;
  report: CompatibilityReport | null;
}

export function ConversationGuideModal({
  visible,
  onClose,
  report,
}: ConversationGuideModalProps) {
  if (!report) return null;

  const guide = generate10MinConversationGuide(report);

  const copyMarkdown = async () => {
    await Clipboard.setStringAsync(guide.formattedMarkdown);
    Alert.alert('¡Copiado!', 'El guión de conversación de 10 minutos se copió al portapapeles.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🗣️ Guión de Conversación (10 Min)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.introText}>
              Guión guiado para conversar en pareja sobre coincidencias, curiosidades y límites acordados.
            </Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreLabel}>Compatibilidad</Text>
                <Text style={styles.scoreValue}>{report.compatibilityScore}%</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreLabel}>Coincidencias</Text>
                <Text style={styles.scoreValue}>{report.mutualMatchCount}</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreLabel}>Duración</Text>
                <Text style={styles.scoreValue}>10 Min</Text>
              </View>
            </View>

            {guide.phases.map((p) => (
              <View key={p.phase} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.phaseTitle}>{p.title}</Text>
                    <Text style={styles.phaseDuration}>Tiempo sugerido: {p.durationMinutes} min</Text>
                  </View>
                </View>

                <Text style={styles.phaseObjective}>🎯 {p.objective}</Text>

                <View style={styles.questionsContainer}>
                  <Text style={styles.subHeading}>Preguntas sugeridas:</Text>
                  {p.suggestedQuestions.map((q, idx) => (
                    <Text key={idx} style={styles.questionText}>• {q}</Text>
                  ))}
                </View>

                {p.activities.length > 0 ? (
                  <View style={styles.activitiesContainer}>
                    <Text style={styles.subHeading}>Actividades relevantes ({p.activities.length}):</Text>
                    {p.activities.map((act) => (
                      <View key={act.activityId} style={styles.activityChip}>
                        <Text style={styles.activityName}>{act.activityName}</Text>
                        {act.prompt ? <Text style={styles.activityPrompt}>"{act.prompt}"</Text> : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button title="📋 Copiar Guión Markdown" onPress={copyMarkdown} style={{ flex: 1 }} />
            <Button title="Cerrar" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  introText: {
    ...typography.bodyMuted,
    lineHeight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreBadge: {
    flex: 1,
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  scoreValue: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.primary,
    marginTop: 2,
  },
  phaseCard: {
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  phaseIcon: {
    fontSize: 28,
  },
  phaseTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  phaseDuration: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  phaseObjective: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    padding: spacing.md,
    borderRadius: radii.md,
  },
  questionsContainer: {
    gap: spacing.xs,
  },
  subHeading: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  questionText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  activitiesContainer: {
    gap: spacing.xs,
  },
  activityChip: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  activityName: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  activityPrompt: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
