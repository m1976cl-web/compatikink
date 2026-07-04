import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { RolePreference, ROLE_LABELS } from '@/types';

const ROLES: RolePreference[] = ['give', 'receive', 'both', 'flexible'];

interface Props {
  value: RolePreference;
  onChange: (role: RolePreference) => void;
}

export function RolePicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {ROLES.map((role) => (
        <TouchableOpacity
          key={role}
          style={[styles.chip, value === role && styles.chipSelected]}
          onPress={() => onChange(role)}
        >
          <Text style={[styles.text, value === role && styles.textSelected]}>
            {ROLE_LABELS[role]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  text: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  textSelected: {
    color: colors.text,
    fontWeight: '600',
  },
});
