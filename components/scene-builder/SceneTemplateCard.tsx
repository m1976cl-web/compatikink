import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { SceneTemplate } from '@/lib/sceneTemplateManager';

export interface SceneTemplateCardProps {
  template: SceneTemplate;
  onLaunch: (template: SceneTemplate) => void;
  onDelete?: (id: string) => void;
}

export function SceneTemplateCard({ template, onLaunch, onDelete }: SceneTemplateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{template.title}</Text>
          <Text style={styles.subMeta}>
            ⏱️ {template.totalDurationMins} min · Intensidad {template.intensity}/5
          </Text>
        </View>
        {!template.isPreset && onDelete ? (
          <TouchableOpacity onPress={() => onDelete(template.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.desc}>{template.description}</Text>

      {/* Steps List */}
      <View style={styles.stepsBox}>
        <Text style={styles.stepsHeader}>PASOS DE LA ESCENA ({template.steps.length}):</Text>
        {template.steps.map((s, idx) => (
          <View key={s.id || idx} style={styles.stepItem}>
            <Text style={styles.stepTitle}>
              {s.title} ({s.durationMins}m)
            </Text>
            {s.safetyCheckin ? <Text style={styles.safetyBadge}>🛡️ Check</Text> : null}
          </View>
        ))}
      </View>

      {/* Gear Required */}
      {template.gearRequired && template.gearRequired.length > 0 ? (
        <View style={styles.gearRow}>
          <Text style={styles.gearLabel}>Equipo recomendado:</Text>
          <Text style={styles.gearText}>{template.gearRequired.join(' · ')}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.launchBtn} onPress={() => onLaunch(template)} activeOpacity={0.85}>
        <Text style={styles.launchBtnText}>🚀 Iniciar esta Escena en Vivo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  subMeta: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  desc: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  stepsBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepsHeader: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  stepItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  safetyBadge: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  gearRow: {
    gap: 2,
  },
  gearLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  gearText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  launchBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  launchBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
