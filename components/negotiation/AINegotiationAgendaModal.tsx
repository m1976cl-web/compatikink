import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { AINegotiationPoint } from '@/lib/aiNegotiationHelper';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  points: AINegotiationPoint[];
  onApplyToNotes?: (combinedText: string) => void;
}

export function AINegotiationAgendaModal({
  visible,
  onClose,
  points,
  onApplyToNotes,
}: Props) {
  const handleCopyAll = async () => {
    triggerLightHaptic();
    const text =
      `📋 Agenda de Negociación Guiada por IA — CompatKink\n\n` +
      points
        .map(
          (p, idx) =>
            `${idx + 1}. [${p.topic}] ${p.title}\n` +
            `• Pregunta: "${p.questionToDiscuss}"\n` +
            `• Salvaguarda: ${p.suggestedSafeguards}\n`
        )
        .join('\n') +
      `\n🔒 Negociación basada en principios SSC / RACK.`;

    await Clipboard.setStringAsync(text);
    triggerSuccessHaptic();
    Alert.alert('¡Copiado!', 'La agenda de negociación se copió al portapapeles.');
  };

  const handleApply = () => {
    if (!onApplyToNotes) return;
    triggerSuccessHaptic();
    const notes = points
      .map((p, idx) => `${idx + 1}. ${p.topic}: ${p.questionToDiscuss} (Salvaguarda: ${p.suggestedSafeguards})`)
      .join('\n\n');
    onApplyToNotes(notes);
    onClose();
    Alert.alert('¡Puntos Insertados!', 'Se han añadido los puntos a las notas de tu acuerdo.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>🤖 ASISTENTE IA (AI3)</Text>
              </View>
              <Text style={styles.title}>Agenda de Negociación Sugerida</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Puntos estratégicos para estructurar una conversación de consentimiento previa y alineación de expectativas.
          </Text>

          {/* Points List */}
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {points.map((pt, idx) => (
              <View key={pt.id} style={styles.pointCard}>
                <View style={styles.pointHeader}>
                  <View style={styles.numBadge}>
                    <Text style={styles.numText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.pointTopic}>{pt.topic}</Text>
                </View>

                <Text style={styles.pointTitle}>{pt.title}</Text>
                <Text style={styles.pointDesc}>{pt.description}</Text>

                <View style={styles.questionBox}>
                  <Text style={styles.questionLabel}>💬 Pregunta para conversar:</Text>
                  <Text style={styles.questionText}>"{pt.questionToDiscuss}"</Text>
                </View>

                <View style={styles.safeguardBox}>
                  <Text style={styles.safeguardText}>🛡️ <Text style={{ fontFamily: fonts.bodyBold }}>Salvaguarda:</Text> {pt.suggestedSafeguards}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            {onApplyToNotes && (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
                <Text style={styles.applyBtnText}>📥 Insertar en Acuerdo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyAll} activeOpacity={0.85}>
              <Text style={styles.copyBtnText}>📋 Copiar Agenda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    maxWidth: 620,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aiBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  aiBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 17,
  },
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pointCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numBadge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: '#000',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  pointTopic: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  pointTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  pointDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  questionBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: radii.md,
    padding: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 2,
  },
  questionLabel: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  questionText: {
    color: colors.text,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 1,
  },
  safeguardBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    padding: 6,
    borderRadius: 4,
    marginTop: 2,
  },
  safeguardText: {
    color: '#38bdf8',
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  copyBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  copyBtnText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
});
