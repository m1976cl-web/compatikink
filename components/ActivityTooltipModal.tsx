import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import {
  Activity,
  CATEGORY_EMOJIS,
  DIFFICULTY_LABELS,
  MOOD_LABELS,
  DifficultyLevel,
} from '@/types';
import {
  getActivityName,
  getActivityDescription,
  getActivitySafetyTip,
  getCategoryLabel,
} from '@/data/activities';

interface Props {
  visible: boolean;
  activity: Activity | null;
  onClose: () => void;
}

const RISK_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  low: { label: 'Riesgo bajo', color: '#4ade80', emoji: '🟢' },
  medium: { label: 'Riesgo medio', color: '#fbbf24', emoji: '🟡' },
  high: { label: 'Riesgo alto', color: '#f87171', emoji: '🔴' },
};

export function ActivityTooltipModal({ visible, activity, onClose }: Props) {
  if (!visible || !activity) return null;

  const diffLevel = activity.difficultyLevel as DifficultyLevel | undefined;
  const diffInfo = diffLevel ? DIFFICULTY_LABELS[diffLevel] : null;
  const riskInfo = activity.riskLevel ? RISK_CONFIG[activity.riskLevel] : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeX} onPress={onClose}>
            <Text style={styles.closeXText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.activityName}>{getActivityName(activity)}</Text>

          {/* Category + Difficulty badges row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { borderColor: colors.primary }]}>
              <Text style={styles.badgeText}>
                {CATEGORY_EMOJIS[activity.category]} {getCategoryLabel(activity.category)}
              </Text>
            </View>
            {diffInfo && (
              <View style={[styles.badge, { borderColor: diffInfo.color, backgroundColor: `${diffInfo.color}15` }]}>
                <Text style={[styles.badgeText, { color: diffInfo.color }]}>
                  {diffInfo.emoji} {diffInfo.label}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{getActivityDescription(activity)}</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Risk Level */}
            {riskInfo && (
              <View style={[styles.infoBox, { borderColor: riskInfo.color, backgroundColor: `${riskInfo.color}10` }]}>
                <Text style={[styles.infoBoxTitle, { color: riskInfo.color }]}>
                  {riskInfo.emoji} {riskInfo.label}
                </Text>
              </View>
            )}

            {/* Safety Tip */}
            {getActivitySafetyTip(activity) ? (
              <View style={styles.safetyBox}>
                <Text style={styles.safetyTitle}>⚠️ Consejo de seguridad</Text>
                <Text style={styles.safetyText}>{getActivitySafetyTip(activity)}</Text>
              </View>
            ) : null}

            {/* Suggested Gear */}
            {activity.suggestedGear && activity.suggestedGear.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧰 Equipamiento sugerido</Text>
                <View style={styles.chipRow}>
                  {activity.suggestedGear.map((gear, i) => (
                    <View key={i} style={styles.gearChip}>
                      <Text style={styles.gearChipText}>{gear}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Moods */}
            {activity.moods && activity.moods.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎨 Ambientes</Text>
                <View style={styles.chipRow}>
                  {activity.moods.map((mood) => {
                    const moodInfo = MOOD_LABELS[mood];
                    return (
                      <View key={mood} style={styles.moodChip}>
                        <Text style={styles.moodChipText}>
                          {moodInfo.emoji} {moodInfo.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Close button */}
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
    maxWidth: 440,
    maxHeight: '80%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  closeX: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeXText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  activityName: {
    color: colors.neonPurple,
    fontSize: fontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  description: {
    color: colors.text,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollArea: {
    width: '100%',
    maxHeight: 300,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  infoBoxTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  safetyBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  safetyTitle: {
    color: '#fbbf24',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  safetyText: {
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  section: {
    width: '100%',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  gearChip: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gearChipText: {
    color: colors.text,
    fontSize: fontSize.xs,
  },
  moodChip: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  moodChipText: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
