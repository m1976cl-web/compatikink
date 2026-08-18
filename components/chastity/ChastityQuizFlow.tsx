import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import { RatingPicker } from '@/components/RatingPicker';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import type { Rating } from '@/types';
import {
  CHASTITY_ITEMS_BY_FLOW,
  chastityQuestionKey,
  compareChastityFlow,
  computeChastitySnapshot,
  defaultChastityResponse,
  labelChastityItems,
  loadChastityResponses,
  saveChastityResponses,
  type ChastityFlowId,
} from '@/lib/chastityLabs';

type Side = 'initiator' | 'guest';

interface Props {
  flow: ChastityFlowId;
}

export function ChastityQuizFlow({ flow }: Props) {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [side, setSide] = useState<Side>('initiator');
  const [mine, setMine] = useState(CHASTITY_ITEMS_BY_FLOW[flow].map((a) => defaultChastityResponse(a.id)));
  const [theirs, setTheirs] = useState(CHASTITY_ITEMS_BY_FLOW[flow].map((a) => defaultChastityResponse(a.id)));
  const [showCompare, setShowCompare] = useState(false);

  const items = useMemo(
    () => labelChastityItems(CHASTITY_ITEMS_BY_FLOW[flow], t),
    [flow, t]
  );

  useEffect(() => {
    (async () => {
      setMine(await loadChastityResponses(flow, 'initiator'));
      setTheirs(await loadChastityResponses(flow, 'guest'));
    })();
  }, [flow]);

  const current = side === 'initiator' ? mine : theirs;
  const setCurrent = side === 'initiator' ? setMine : setTheirs;
  const snapshot = computeChastitySnapshot(mine);

  const patch = async (activityId: string, rating: Rating) => {
    const next = current.map((r) => (r.activityId === activityId ? { ...r, rating } : r));
    setCurrent(next);
    await saveChastityResponses(flow, side, next);
  };

  const report = useMemo(
    () => compareChastityFlow(flow, mine, theirs, t),
    [flow, mine, theirs, t]
  );

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="questionnaire" variant="compact" />
          <Text style={styles.title}>{t(`labs.chastity.${flow}.title`)}</Text>
          <Text style={styles.subtitle}>{t(`labs.chastity.${flow}.lead`)}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.chastity.legal')} />

        <VaultLockGate
          title={t(`labs.chastity.${flow}.vault`)}
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
                  {s === 'initiator' ? t('labs.chastity.you') : t('labs.chastity.guest')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.blindHint}>{t('labs.chastity.blind')}</Text>

          <View style={styles.snapBox}>
            <Text style={styles.snapKicker}>{t('labs.chastity.snap_kicker')}</Text>
            <Text style={styles.snapTitle}>{t(`labs.chastity.snap.${snapshot}`)}</Text>
            <Text style={styles.snapBody}>{t(`labs.chastity.snap.${snapshot}.desc`)}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {!showCompare
              ? items.map((act) => {
                  const resp = current.find((r) => r.activityId === act.id) ?? defaultChastityResponse(act.id);
                  return (
                    <View key={act.id} style={styles.card}>
                      <Text style={styles.itemName}>{t(chastityQuestionKey(act.id, 'name'))}</Text>
                      <Text style={styles.itemBlurb}>{t(chastityQuestionKey(act.id, 'desc'))}</Text>
                      <Text style={styles.safety}>🛡️ {t(chastityQuestionKey(act.id, 'safety'))}</Text>
                      <RatingPicker value={resp.rating} onChange={(rating) => patch(act.id, rating)} />
                    </View>
                  );
                })
              : report.length === 0
                ? <Text style={styles.empty}>{t('labs.chastity.empty_compare')}</Text>
                : report.map((item) => (
                    <View key={item.activityId} style={styles.card}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.section}>{t(`section.${item.section}`)}</Text>
                    </View>
                  ))}

            <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowCompare((v) => !v)}>
              <Text style={styles.inviteBtnText}>
                {showCompare ? t('labs.chastity.back_rate') : t('labs.chastity.compare')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/invite')}>
              <Text style={styles.ghostBtnText}>{t('labs.chastity.invite')}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
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
  snapBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    gap: 4,
    marginBottom: spacing.sm,
  },
  snapKicker: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.8 },
  snapTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.md },
  snapBody: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
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
