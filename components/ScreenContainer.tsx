import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function ScreenContainer({ title, subtitle, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
