import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

export type ExperienceLevel = 'all' | 'intro' | 'couple' | 'advanced';

export interface ExperienceJourneyFilterProps {
  currentLevel: ExperienceLevel;
  onSelectLevel: (level: ExperienceLevel) => void;
}

export const EXPERIENCE_LEVELS: { key: ExperienceLevel; label: string; sub: string; icon: string }[] = [
  { key: 'all', label: 'Todos', sub: 'Catálogo completo', icon: '🌐' },
  { key: 'intro', label: 'Principiante', sub: 'Seguridad y base', icon: '🌱' },
  { key: 'couple', label: 'En Pareja', sub: 'Juegos e historial', icon: '💜' },
  { key: 'advanced', label: 'Avanzado & D/s', sub: 'Escenas y protocolos', icon: '🔥' },
];

export function ExperienceJourneyFilter({ currentLevel, onSelectLevel }: ExperienceJourneyFilterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>🎯 RUTA RECOMENDADA SEGÚN TU EXPERIENCIA:</Text>
      <View style={styles.chipsRow}>
        {EXPERIENCE_LEVELS.map((lvl) => {
          const isSelected = currentLevel === lvl.key;
          return (
            <TouchableOpacity
              key={lvl.key}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelectLevel(lvl.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipTitle, isSelected && styles.chipTitleSelected]}>
                {lvl.icon} {lvl.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    gap: 4,
  },
  headerLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  chipTitleSelected: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
});
