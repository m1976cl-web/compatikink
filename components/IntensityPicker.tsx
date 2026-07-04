import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

interface Props {
  value: number;
  onChange: (intensity: 1 | 2 | 3 | 4 | 5) => void;
}

const LEVELS = [1, 2, 3, 4, 5] as const;

export function IntensityPicker({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.hint}>Intensidad: suave → intenso</Text>
      <View style={styles.row}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.dot, value === level && styles.dotSelected]}
            onPress={() => onChange(level)}
          >
            <Text style={[styles.dotText, value === level && styles.dotTextSelected]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  dotText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  dotTextSelected: {
    color: colors.text,
  },
});
