import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

export interface ManualHeaderBarProps {
  onBack: () => void;
  copiedToast: boolean;
}

export function ManualHeaderBar({ onBack, copiedToast }: ManualHeaderBarProps) {
  return (
    <>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.mainTitle}>Manual de Usuario</Text>
          <Text style={styles.mainSubtitle}>
            Guía interactiva, tutoriales paso a paso y protocolos BDSM de seguridad
          </Text>
        </View>
      </View>

      {/* Global Toast Notification */}
      {copiedToast && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>
            📋 ¡Manual copiado en formato Markdown al portapapeles!
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 2,
  },
  mainTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  mainSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  toastBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  toastText: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
