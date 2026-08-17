import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Session } from '@/types';

export interface PolyParticipantSelectorProps {
  sessions: Session[];
  selectedSessionIds: string[];
  onToggleSession: (id: string) => void;
  userNickname: string;
}

export function PolyParticipantSelector({
  sessions,
  selectedSessionIds,
  onToggleSession,
  userNickname,
}: PolyParticipantSelectorProps) {
  return (
    <View style={styles.pickerSection}>
      <Text style={styles.pickerTitle}>
        👥 Integrantes del Grupo (Seleccionados {selectedSessionIds.length + 1}):
      </Text>
      
      <View style={styles.chipsRow}>
        <View style={[styles.chip, styles.chipHost]}>
          <Text style={styles.chipHostText}>👑 {userNickname} (Tú)</Text>
        </View>

        {sessions.map((s) => {
          const active = selectedSessionIds.includes(s.id);
          const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggleSession(s.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {active ? '✓ ' : ''}{name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerSection: {
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  pickerTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipHost: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipHostText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  chipTextActive: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
});
