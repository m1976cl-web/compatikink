import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

const PRONOUN_OPTIONS = ['Él / Him', 'Ella / Her', 'Elle / They', 'Otro / Prefiero no decir'];

interface Props {
  value?: string;
  onChange: (pronouns: string) => void;
}

export function PronounsPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PRONOUN_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, value === option && styles.chipSelected]}
          onPress={() => onChange(option)}
          activeOpacity={0.8}
        >
          <Text style={[styles.text, value === option && styles.textSelected]}>
            {option}
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
