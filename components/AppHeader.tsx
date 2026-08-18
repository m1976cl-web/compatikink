import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, Platform } from 'react-native';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { OfficeModeAPI } from '@/lib/officeMode';
import { GlobalSearchAPI } from '@/lib/globalSearch';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

import { useRouter } from 'expo-router';

interface AppHeaderProps {
  /** When true, shows Compatikink as the dominant brand signal */
  brand?: boolean;
  title?: string;
  subtitle?: string;
  /** Optional mark / wordmark companion (e.g. Nox) */
  mark?: string;
  right?: ReactNode;
  style?: ViewStyle;
}

export function AppHeader({
  brand = false,
  title,
  subtitle,
  mark = 'Nox',
  right,
  style,
}: AppHeaderProps) {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          {brand ? (
            <>
              <Text style={styles.brand} accessibilityRole="header">
                Compatikink
              </Text>
              {mark ? <Text style={styles.mark}>{mark}</Text> : null}
            </>
          ) : null}
          {title ? (
            <Text style={[styles.title, brand && styles.titleUnderBrand]} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.rightHeaderRow}>
          {/* Global Search Button */}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => GlobalSearchAPI.open()}
            accessibilityLabel="Buscar globalmente (Cmd+K)"
          >
            <Text style={styles.searchBtnText}>🔍 (⌘K)</Text>
          </TouchableOpacity>

          {/* Network Status Badge */}
          <View style={[styles.netBadge, isOnline ? styles.netOnline : styles.netOffline]}>
            <View style={[styles.netDot, isOnline ? styles.netDotOnline : styles.netDotOffline]} />
            <Text style={[styles.netBadgeText, isOnline ? styles.netTextOnline : styles.netTextOffline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          {/* Office Mode Button */}
          <TouchableOpacity
            style={styles.officeBtn}
            onPress={() => OfficeModeAPI.toggle()}
            accessibilityLabel="Modo Oficina / Pánico (Alt+Shift+X)"
          >
            <Text style={styles.officeBtnText}>💼 Excel</Text>
          </TouchableOpacity>

          {/* Google Auth Button Header Shortcut */}
          <TouchableOpacity
            style={styles.googleHeaderBtn}
            onPress={() => router.push('/auth')}
            accessibilityLabel="Iniciar Sesión con Google"
          >
            <Text style={styles.googleHeaderBtnText}>🔵 Google</Text>
          </TouchableOpacity>

          {right ? <View style={styles.right}>{right}</View> : null}
        </View>
      </View>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.brand,
    color: colors.text,
    letterSpacing: 1.4,
    lineHeight: 52,
  },
  mark: {
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.md,
    color: colors.primary,
    letterSpacing: 2,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    lineHeight: 36,
  },
  titleUnderBrand: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  rightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  searchBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderWidth: 1.5,
    borderColor: '#c084fc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBtnText: {
    color: '#c084fc',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  netBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1.5,
    gap: 4,
  },
  netOnline: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderColor: '#4ade80',
  },
  netOffline: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    borderColor: '#f87171',
  },
  netDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  netDotOnline: {
    backgroundColor: '#4ade80',
  },
  netDotOffline: {
    backgroundColor: '#f87171',
  },
  netBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  netTextOnline: {
    color: '#4ade80',
  },
  netTextOffline: {
    color: '#f87171',
  },
  officeBtn: {
    backgroundColor: 'rgba(16, 124, 65, 0.15)',
    borderWidth: 1.5,
    borderColor: '#107c41',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  officeBtnText: {
    color: '#4ade80',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  googleHeaderBtn: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderWidth: 1.5,
    borderColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  googleHeaderBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  right: {
    paddingTop: spacing.xs,
  },
  rule: {
    marginTop: spacing.md,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
});
