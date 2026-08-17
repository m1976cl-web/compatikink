import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Session } from '@/types';

export interface SessionDiffSelectorProps {
  sessions: Session[];
  oldSessionId: string | null;
  newSessionId: string | null;
  onSelectOldSession: (id: string) => void;
  onSelectNewSession: (id: string) => void;
}

export function SessionDiffSelector({
  sessions,
  oldSessionId,
  newSessionId,
  onSelectOldSession,
  onSelectNewSession,
}: SessionDiffSelectorProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📅 Seleccionar Sesiones para Comparar Evolución</Text>
      
      <Text style={styles.label}>1. Sesión Anterior (Base / Pasada):</Text>
      <View style={styles.chipsRow}>
        {sessions.map((s) => {
          const active = oldSessionId === s.id;
          const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
          const dateStr = new Date(s.completedAt || s.createdAt).toLocaleDateString();
          return (
            <TouchableOpacity
              key={`old-${s.id}`}
              style={[styles.chip, active && styles.chipActiveOld]}
              onPress={() => onSelectOldSession(s.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {name} ({dateStr})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, { marginTop: spacing.xs }]}>2. Sesión Reciente (Actual / Nueva):</Text>
      <View style={styles.chipsRow}>
        {sessions.map((s) => {
          const active = newSessionId === s.id;
          const name = s.guestNickname || s.guestProfile?.nickname || 'Pareja';
          const dateStr = new Date(s.completedAt || s.createdAt).toLocaleDateString();
          return (
            <TouchableOpacity
              key={`new-${s.id}`}
              style={[styles.chip, active && styles.chipActiveNew]}
              onPress={() => onSelectNewSession(s.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {name} ({dateStr})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActiveOld: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: colors.info,
  },
  chipActiveNew: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  chipTextActive: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
});
