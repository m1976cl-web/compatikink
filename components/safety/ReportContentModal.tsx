import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  ReportReasonCategory,
  ReportTargetType,
  REPORT_REASON_LABELS,
  createModerationReport,
  blockUser,
} from '@/lib/trustSafety';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorName?: string;
  targetPreviewText?: string;
  onReportSubmitted?: () => void;
}

const REASONS: ReportReasonCategory[] = [
  'harassment',
  'non_consensual',
  'underage_risk',
  'spam_fraud',
  'impersonation',
  'other',
];

export function ReportContentModal({
  visible,
  onClose,
  targetType,
  targetId,
  targetAuthorName,
  targetPreviewText,
  onReportSubmitted,
}: Props) {
  const [selectedReason, setSelectedReason] = useState<ReportReasonCategory>('harassment');
  const [description, setDescription] = useState('');
  const [alsoBlockUser, setAlsoBlockUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createModerationReport({
        targetType,
        targetId,
        targetAuthorName,
        targetPreviewText,
        reasonCategory: selectedReason,
        description: description.trim() || undefined,
      });

      if (alsoBlockUser && targetAuthorName) {
        await blockUser({
          id: targetId,
          nickname: targetAuthorName,
          reason: `Reportado por: ${REPORT_REASON_LABELS[selectedReason].label}`,
        });
      }

      triggerSuccessHaptic();
      Alert.alert(
        'Denuncia Enviada 🛡️',
        'Tu reporte ha sido registrado de forma confidencial. Nuestro sistema y equipo de moderación actuarán para resguardar la seguridad de la comunidad.'
      );

      setDescription('');
      onReportSubmitted?.();
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo registrar la denuncia. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetTypeLabel =
    targetType === 'user'
      ? 'a este usuario'
      : targetType === 'post'
      ? 'esta publicación'
      : 'este mensaje';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title}>🚩 Denunciar Contenido</Text>
              <Text style={styles.subtitle}>
                Reportar {targetTypeLabel}{' '}
                {targetAuthorName ? `de @${targetAuthorName}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {targetPreviewText ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Contenido reportado:</Text>
                <Text style={styles.previewText} numberOfLines={2}>
                  "{targetPreviewText}"
                </Text>
              </View>
            ) : null}

            <Text style={styles.sectionHeading}>Selecciona el motivo principal:</Text>
            <View style={styles.reasonsList}>
              {REASONS.map((cat) => {
                const item = REPORT_REASON_LABELS[cat];
                const isSel = selectedReason === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.reasonOption, isSel && styles.reasonOptionSelected]}
                    onPress={() => {
                      triggerLightHaptic();
                      setSelectedReason(cat);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reasonEmoji}>{item.emoji}</Text>
                    <View style={styles.reasonTextGroup}>
                      <Text style={[styles.reasonTitle, isSel && styles.reasonTitleSelected]}>
                        {item.label}
                      </Text>
                      <Text style={styles.reasonDesc}>{item.description}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSel && styles.radioCircleSelected]}>
                      {isSel ? <View style={styles.radioInner} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Extra details */}
            <Text style={styles.sectionHeading}>Detalles adicionales (opcional):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Explica brevemente qué ocurrió para agilizar la revisión..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Also block toggle */}
            {targetAuthorName ? (
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  triggerLightHaptic();
                  setAlsoBlockUser(!alsoBlockUser);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxBox, alsoBlockUser && styles.checkboxBoxActive]}>
                  {alsoBlockUser ? <Text style={styles.checkboxCheck}>✓</Text> : null}
                </View>
                <View style={styles.checkboxTextGroup}>
                  <Text style={styles.checkboxTitle}>
                    Bloquear mutuamente a @{targetAuthorName}
                  </Text>
                  <Text style={styles.checkboxSubtitle}>
                    No podrá ver tu perfil ni enviarte mensajes.
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Enviando...' : 'Enviar Denuncia 🛡️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: '#f87171',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
    paddingBottom: spacing.sm,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#f87171',
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 20,
    paddingLeft: 8,
  },
  body: {
    flexGrow: 1,
  },
  previewBox: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: '#f87171',
    gap: 2,
  },
  previewLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  previewText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  sectionHeading: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonsList: {
    gap: 6,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  reasonOptionSelected: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  reasonEmoji: {
    fontSize: 20,
  },
  reasonTextGroup: {
    flex: 1,
  },
  reasonTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  reasonTitleSelected: {
    color: colors.text,
  },
  reasonDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#f87171',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f87171',
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    padding: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  checkboxBoxActive: {
    backgroundColor: '#f87171',
    borderColor: '#f87171',
  },
  checkboxCheck: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxTextGroup: {
    flex: 1,
  },
  checkboxTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  checkboxSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    backgroundColor: '#f87171',
  },
  submitBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
