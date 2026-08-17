import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { CompatibilityReport } from '@/types';

export interface ReportActionsBarProps {
  report: CompatibilityReport;
  guestName: string;
  onShowGuide: () => void;
  onShowRoulette: () => void;
  onShowShare: () => void;
  onShowTimer: () => void;
  isDesktop?: boolean;
}

export function ReportActionsBar({
  report,
  guestName,
  onShowGuide,
  onShowRoulette,
  onShowShare,
  onShowTimer,
  isDesktop = false,
}: ReportActionsBarProps) {
  const handleExportPDF = () => {
    import('@/lib/exportPDF').then(({ exportReportAsPDF }) => {
      exportReportAsPDF(report, 'Tú', guestName);
    });
  };

  return (
    <View
      style={[
        styles.actionsContainer,
        isDesktop ? styles.actionsDesktop : styles.actionsMobile,
      ]}
    >
      <TouchableOpacity
        style={[styles.shareCardTrigger, { borderColor: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.2)' }]}
        onPress={onShowGuide}
        activeOpacity={0.8}
      >
        <Text style={[styles.shareCardTriggerText, { color: colors.primary }]}>🗣️ Guión Conversación (10m)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareCardTrigger, { borderColor: colors.neonPurple, backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}
        onPress={onShowRoulette}
        activeOpacity={0.8}
      >
        <Text style={[styles.shareCardTriggerText, { color: colors.neonPurple }]}>🎲 Ruleta de Citas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.shareCardTrigger}
        onPress={onShowShare}
        activeOpacity={0.8}
      >
        <Text style={styles.shareCardTriggerText}>📸 Tarjeta Infografía</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareCardTrigger, { borderColor: colors.info, backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}
        onPress={handleExportPDF}
        activeOpacity={0.8}
      >
        <Text style={[styles.shareCardTriggerText, { color: '#60a5fa' }]}>📄 Exportar PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareCardTrigger, { borderColor: colors.warning, backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}
        onPress={onShowTimer}
        activeOpacity={0.8}
      >
        <Text style={[styles.shareCardTriggerText, { color: colors.warning }]}>⏱️ Temporizador</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionsDesktop: {
    justifyContent: 'flex-start',
  },
  actionsMobile: {
    marginTop: spacing.xs,
    justifyContent: 'center',
  },
  shareCardTrigger: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  shareCardTriggerText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
});
