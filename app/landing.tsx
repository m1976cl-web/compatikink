import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/lib/i18n';
import { NoxHost } from '@/components/nox';

export default function PublicLandingScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();

  return (
    <ScreenContainer title="CompatKink" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.navbar}>
          <Text style={styles.brandTitle}>CompatKink</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <LanguageSelector />
            <TouchableOpacity style={styles.appBtn} onPress={() => router.push('/')}>
              <Text style={styles.appBtnText}>{t('common.open_app')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.heroBadge}>{t('landing.badge')}</Text>
            <NoxHost scene="landing" variant="hero" />
            <Text style={styles.heroTitle}>{t('landing.title')}</Text>
            <Text style={styles.heroSubtitle}>{t('landing.subtitle')}</Text>

            <View style={styles.heroCtaRow}>
              <TouchableOpacity style={styles.primaryCtaBtn} onPress={() => router.push('/onboarding')}>
                <Text style={styles.primaryCtaBtnText}>{t('landing.cta_start')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryCtaBtn} onPress={() => router.push('/manual')}>
                <Text style={styles.secondaryCtaBtnText}>{t('landing.cta_manual')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {[
              { emoji: '🙈', title: 'landing.feat1_title', desc: 'landing.feat1_desc' },
              { emoji: '🔒', title: 'landing.feat2_title', desc: 'landing.feat2_desc' },
              { emoji: '📋', title: 'landing.feat3_title', desc: 'landing.feat3_desc' },
              { emoji: '➡️', title: 'landing.feat4_title', desc: 'landing.feat4_desc' },
            ].map((feat) => (
              <View key={feat.title} style={styles.featureCard}>
                <Text style={styles.featureEmoji}>{feat.emoji}</Text>
                <Text style={styles.featureTitle}>{t(feat.title)}</Text>
                <Text style={styles.featureDesc}>{t(feat.desc)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legalBanner}>
            <Text style={styles.legalBannerTitle}>{t('landing.legal_title')}</Text>
            <Text style={styles.legalBannerDesc}>{t('landing.legal_desc')}</Text>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={styles.legalLink}>{t('landing.legal_link')} ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 840, alignSelf: 'center', width: '100%' },

  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border },
  brandTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900', letterSpacing: 0.5 },
  appBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 6 },
  appBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },

  scroll: { gap: spacing.xl, paddingTop: spacing.md },

  heroSection: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  heroBadge: { color: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.1)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, fontSize: 11, fontWeight: '800' },
  heroTitle: { color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 38 },
  heroSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 600, lineHeight: 22 },
  heroCtaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, marginTop: spacing.xs },
  primaryCtaBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 20, paddingVertical: 12 },
  primaryCtaBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },
  secondaryCtaBtn: { backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  secondaryCtaBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  featureCard: { flex: 1, minWidth: 240, backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: 6, borderWidth: 1, borderColor: colors.border },
  featureEmoji: { fontSize: 32 },
  featureTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  featureDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  legalBanner: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.xl, padding: spacing.lg, gap: spacing.xs, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  legalBannerTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  legalBannerDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  legalLink: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', textDecorationLine: 'underline', marginTop: 4 },
});
