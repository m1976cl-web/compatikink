import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { useTheme } from '@/lib/themeContext';
import {
  colors,
  fonts,
  fontSize,
  gradients,
  spacing,
  typography,
} from '@/constants/theme';

import { useAppBackgroundProtection } from '@/hooks/useAppBackgroundProtection';

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
 * Screen shell with dynamic theme background and OS-level privacy protection.
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
  const { palette } = useTheme();
  const { isProtectedBackground } = useAppBackgroundProtection();

  const webBg =
    Platform.OS === 'web'
      ? ({ backgroundImage: palette.gradientHint } as ViewStyle)
      : undefined;

  return (
    <View style={[styles.root, { backgroundColor: palette.background }, webBg, style]}>
      <View style={styles.textureHint} pointerEvents="none" />
      <View style={styles.container}>
        {hideHeader ? null : brand ? (
          <AppHeader brand title={title} subtitle={subtitle} mark={mark ?? 'Nox'} />
        ) : (
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
          </View>
        )}
        {children}
      </View>

      {/* OS & Multitask Preview Privacy Shield */}
      {isProtectedBackground ? (
        <View style={styles.privacyShieldOverlay} pointerEvents="none">
          <Text style={styles.privacyShieldIcon}>🛡️</Text>
          <Text style={styles.privacyShieldTitle}>Protección de Vista Previa Activa</Text>
          <Text style={styles.privacyShieldSub}>Bóveda Cifrada Zero-Knowledge Bloqueada</Text>
        </View>
      ) : null}
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
  privacyShieldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#07050a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  privacyShieldIcon: {
    fontSize: 48,
  },
  privacyShieldTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
  privacyShieldSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
