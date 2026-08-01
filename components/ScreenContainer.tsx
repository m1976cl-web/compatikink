import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import {
  colors,
  fonts,
  fontSize,
  gradients,
  spacing,
  typography,
} from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Show Compatikink brand as hero-level header signal */
  brand?: boolean;
  /** Optional mark under brand (default Nox when brand) */
  mark?: string;
  style?: ViewStyle;
  /** Skip built-in header (caller renders AppHeader / custom) */
  hideHeader?: boolean;
}

/**
 * Screen shell with ink depth background (gradient on web, layered solid on native).
 */
export function ScreenContainer({
  title,
  subtitle,
  children,
  brand = false,
  mark,
  style,
  hideHeader = false,
}: Props) {
  const webBg =
    Platform.OS === 'web'
      ? ({ backgroundImage: gradients.inkRadialHint } as ViewStyle)
      : undefined;

  return (
    <View style={[styles.root, webBg, style]}>
      <View style={styles.textureHint} pointerEvents="none" />
      <View style={styles.container}>
        {hideHeader ? null : brand ? (
          <AppHeader brand title={title} subtitle={subtitle} mark={mark ?? 'Nox'} />
        ) : (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  textureHint: {
    ...StyleSheet.absoluteFillObject,
    // Subtle warm vignette without flat single-color feel
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage:
            'radial-gradient(ellipse 90% 50% at 80% 100%, rgba(154,107,79,0.06) 0%, transparent 50%)',
        } as object)
      : {
          // Native: soft top wash via overlay strip
        }),
  },
  container: {
    flex: 1,
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
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: 0.3,
    lineHeight: 36,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
  },
});
