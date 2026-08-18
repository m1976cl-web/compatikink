import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { RatingPicker } from '@/components/RatingPicker';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import type { ActivityResponse, Rating } from '@/types';
import {
  FOOT_ACTIVITIES,
  compareFetishResponses,
  defaultFootResponse,
  loadFootResponses,
  saveFootResponses,
} from '@/lib/fetishLabs';

type Side = 'initiator' | 'guest';

function FootFetishContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [side, setSide] = useState<Side>('initiator');
  const [mine, setMine] = useState<ActivityResponse[]>(FOOT_ACTIVITIES.map((a) => defaultFootResponse(a.id)));
  const [theirs, setTheirs] = useState<ActivityResponse[]>(FOOT_ACTIVITIES.map((a) => defaultFootResponse(a.id)));
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    (async () => {
      setMine(await loadFootResponses('initiator'));
      setTheirs(await loadFootResponses('guest'));
    })();
  }, []);

  const current = side === 'initiator' ? mine : theirs;
  const setCurrent = side === 'initiator' ? setMine : setTheirs;

  const patch = async (activityId: string, rating: Rating) => {
    const next = current.map((r) => (r.activityId === activityId ? { ...r, rating } : r));
    setCurrent(next);
    await saveFootResponses(side, next);
  };

  const report = useMemo(
    () => compareFetishResponses(FOOT_ACTIVITIES, mine, theirs),
    [mine, theirs]
  );

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="questionnaire" variant="compact" />
          <Text style={styles.title}>{t('labs.foot.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.foot.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.foot.legal')} />

        <VaultLockGate
          title={t('labs.foot.vault')}
          subtitle={t('labs.zk_hint')}
          showLockButton
        >
          <View style={styles.sideRow}>
            {(['initiator', 'guest'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sideChip, side === s && styles.sideChipOn]}
                onPress={() => {
                  setSide(s);
                  setShowCompare(false);
                }}
              >
                <Text style={[styles.sideChipText, side === s && styles.sideChipTextOn]}>
                  {s === 'initiator' ? t('labs.foot.you') : t('labs.foot.guest')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.blindHint}>{t('labs.foot.blind')}</Text>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {!showCompare
              ? FOOT_ACTIVITIES.map((act) => {
                  const resp = current.find((r) => r.activityId === act.id) ?? defaultFootResponse(act.id);
                  return (
                    <View key={act.id} style={styles.card}>
                      <Text style={styles.itemName}>{act.name}</Text>
                      <Text style={styles.itemBlurb}>{act.description}</Text>
                      <Text style={styles.safety}>🛡️ {act.safetyTip}</Text>
                      <RatingPicker value={resp.rating} onChange={(rating) => patch(act.id, rating)} />
                    </View>
                  );
                })
              : report.length === 0
                ? <Text style={styles.empty}>{t('labs.foot.empty_compare')}</Text>
                : report.map((item) => (
                    <View key={item.activityId} style={styles.card}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.section}>{t(`section.${item.section}`)}</Text>
                    </View>
                  ))}

            <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowCompare((v) => !v)}>
              <Text style={styles.inviteBtnText}>
                {showCompare ? t('labs.foot.back_rate') : t('labs.foot.compare')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/invite')}>
              <Text style={styles.ghostBtnText}>{t('labs.foot.invite')}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
  );
}

export default function FootFetishScreen() {
  return (
    <RouteFeatureGuard route="/foot-fetish" title="Foot fetish">
      <FootFetishContent />
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
  sideRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  sideChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sideChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sideChipText: { color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  sideChipTextOn: { color: colors.onPrimary },
  blindHint: { color: colors.textDim, fontSize: 11, marginVertical: spacing.sm, lineHeight: 16 },
  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  itemName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.md },
  itemBlurb: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  safety: { color: '#fbbf24', fontSize: fontSize.xs, lineHeight: 18 },
  section: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  empty: { color: colors.textMuted, fontSize: fontSize.sm },
  inviteBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  inviteBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  ghostBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
});
