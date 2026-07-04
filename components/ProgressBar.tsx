import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface Props {
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
    </View>
  );
}

interface LabelProps {
  current: number;
  total: number;
}

export function ProgressLabel({ current, total }: LabelProps) {
  return (
    <Text style={styles.label}>
      {current} / {total}
    </Text>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
