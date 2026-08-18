import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import {
  CHASTITY_ITEMS_BY_FLOW,
  type ChastityFlowId,
} from '@/lib/chastityLabs';

const FLOWS: { id: ChastityFlowId; route: string; emoji: string; accent: string }[] = [
  { id: 'wearer', route: '/chastity-wearer', emoji: '🔐', accent: '#c084fc' },
  { id: 'keyholder', route: '/chastity-keyholder', emoji: '🗝️', accent: '#f472b6' },
  { id: 'protocol', route: '/chastity-protocol', emoji: '⏱️', accent: '#38bdf8' },
];

const SIZE_FLOWS: { id: 'cage' | 'belt' | 'fit'; route: string; emoji: string; accent: string }[] = [
  { id: 'cage', route: '/chastity-cage', emoji: '📏', accent: '#a78bfa' },
  { id: 'belt', route: '/chastity-belt', emoji: '📐', accent: '#fb7185' },
  { id: 'fit', route: '/chastity-fit', emoji: '🧭', accent: '#34d399' },
];

function CastidadHubContent() {
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
          <Text style={styles.title}>{t('labs.chastity.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.chastity.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.chastity.legal')} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>{t('labs.chastity.size.kicker')}</Text>

          {SIZE_FLOWS.map((flow) => (
            <TouchableOpacity
              key={flow.id}
              style={[styles.card, { borderColor: flow.accent }]}
              onPress={() => router.push(flow.route as never)}
            >
              <View style={styles.cardHead}>
                <Text style={styles.emoji}>{flow.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{t(`labs.chastity.${flow.id}.title`)}</Text>
              <Text style={styles.cardDesc}>{t(`labs.chastity.${flow.id}.desc`)}</Text>
              <Text style={[styles.action, { color: flow.accent }]}>{t('labs.open')} ➔</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.kicker}>{t('labs.chastity.flows')}</Text>

          {FLOWS.map((flow) => (
            <TouchableOpacity
              key={flow.id}
              style={[styles.card, { borderColor: flow.accent }]}
              onPress={() => router.push(flow.route as never)}
            >
              <View style={styles.cardHead}>
                <Text style={styles.emoji}>{flow.emoji}</Text>
                <View style={[styles.pill, { backgroundColor: `${flow.accent}33` }]}>
                  <Text style={[styles.pillText, { color: flow.accent }]}>
                    {CHASTITY_ITEMS_BY_FLOW[flow.id].length} {t('labs.chastity.q_count')}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{t(`labs.chastity.${flow.id}.title`)}</Text>
              <Text style={styles.cardDesc}>{t(`labs.chastity.${flow.id}.desc`)}</Text>
              <Text style={[styles.action, { color: flow.accent }]}>{t('labs.open')} ➔</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.ghostCard} onPress={() => router.push('/chastity-tools')}>
            <Text style={styles.cardTitle}>{t('labs.chastity.tools.title')}</Text>
            <Text style={styles.cardDesc}>{t('labs.chastity.tools.desc')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteBtn} onPress={() => router.push('/invite')}>
            <Text style={styles.inviteBtnText}>{t('labs.chastity.invite')}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

export default function CastidadHubScreen() {
  return (
    <RouteFeatureGuard route="/chastity" title="Castidad">
      <CastidadHubContent />
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
  scroll: { gap: spacing.md, paddingTop: spacing.md },
  kicker: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs, letterSpacing: 0.8 },
  card: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emoji: { fontSize: 28 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  pillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontFamily: fonts.bodyBold },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  action: { fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },
  ghostCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  inviteBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  inviteBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
});
