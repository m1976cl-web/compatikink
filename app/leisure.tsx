import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { LeisureGame } from '@/components/leisure/LeisureGame';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';

function LeisureContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="privacy" variant="compact" />
          <Text style={styles.title}>{t('labs.leisure.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.leisure.lead')}</Text>
        </View>
        <AdultConsentBanner extra={t('labs.leisure.legal')} />
        <LeisureGame />
      </View>
    </ScreenContainer>
  );
}

export default function LeisureScreen() {
  return (
    <RouteFeatureGuard route="/leisure" title="Leisure Suite">
      <LeisureContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },
  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm, lineHeight: 20 },
});
