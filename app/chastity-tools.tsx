import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

interface ChastityStarterProgress {
  day1Done: boolean;
  day2Done: boolean;
  day3Done: boolean;
  day4Done: boolean;
}

interface LocalCheckIn {
  intervalHours: number;
  skinStatus: 'excelente' | 'irritacion_leve' | 'requiere_descanso';
  lastAtIso?: string;
}

const STORAGE_KEY_STARTER = 'chastity_4day_starter_v1';
const STORAGE_KEY_CHECKIN = 'fetish_lab_chastity_checkin_v1';

const STARTER_DAYS: { key: keyof ChastityStarterProgress; icon: string; titleKey: string; descKey: string }[] = [
  { key: 'day1Done', icon: '🗝️', titleKey: 'labs.chastity.tools.d1', descKey: 'labs.chastity.tools.d1d' },
  { key: 'day2Done', icon: '⚡', titleKey: 'labs.chastity.tools.d2', descKey: 'labs.chastity.tools.d2d' },
  { key: 'day3Done', icon: '🧴', titleKey: 'labs.chastity.tools.d3', descKey: 'labs.chastity.tools.d3d' },
  { key: 'day4Done', icon: '🔓', titleKey: 'labs.chastity.tools.d4', descKey: 'labs.chastity.tools.d4d' },
];

function ChastityToolsContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'starter' | 'checkin'>('starter');
  const [starter, setStarter] = useState<ChastityStarterProgress>({
    day1Done: false,
    day2Done: false,
    day3Done: false,
    day4Done: false,
  });
  const [checkin, setCheckin] = useState<LocalCheckIn>({
    intervalHours: 24,
    skinStatus: 'excelente',
  });

  useEffect(() => {
    readJsonStorage<ChastityStarterProgress>(STORAGE_KEY_STARTER, starter).then(setStarter);
    readJsonStorage<LocalCheckIn>(STORAGE_KEY_CHECKIN, checkin).then(setCheckin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDay = async (dayKey: keyof ChastityStarterProgress) => {
    const updated = { ...starter, [dayKey]: !starter[dayKey] };
    setStarter(updated);
    await writeJsonStorage(STORAGE_KEY_STARTER, updated);
  };

  const persistCheckin = async (next: LocalCheckIn) => {
    setCheckin(next);
    await writeJsonStorage(STORAGE_KEY_CHECKIN, next);
  };

  const logCheckin = async () => {
    const next = { ...checkin, lastAtIso: new Date().toISOString() };
    await persistCheckin(next);
    Alert.alert(t('labs.chastity.tools.logged_title'), t('labs.chastity.tools.logged_body'));
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="manual" variant="compact" />
          <Text style={styles.title}>{t('labs.chastity.tools.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.chastity.tools.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.chastity.legal')} />

        <VaultLockGate title={t('labs.chastity.tools.vault')} subtitle={t('labs.zk_hint')} showLockButton>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, tab === 'starter' && styles.tabOn]}
              onPress={() => setTab('starter')}
            >
              <Text style={[styles.tabText, tab === 'starter' && styles.tabTextOn]}>
                {t('labs.chastity.tools.tab_starter')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'checkin' && styles.tabOn]}
              onPress={() => setTab('checkin')}
            >
              <Text style={[styles.tabText, tab === 'checkin' && styles.tabTextOn]}>
                {t('labs.chastity.tools.tab_checkin')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {tab === 'starter' ? (
              STARTER_DAYS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.card, starter[item.key] && styles.cardDone]}
                  onPress={() => toggleDay(item.key)}
                >
                  <Text style={styles.emoji}>{item.icon}</Text>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.cardTitle, starter[item.key] && styles.cardTitleDone]}>
                      {t(item.titleKey)}
                    </Text>
                    <Text style={styles.cardDesc}>{t(item.descKey)}</Text>
                  </View>
                  <Text style={styles.check}>{starter[item.key] ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                <Text style={styles.kicker}>{t('labs.chastity.tools.interval')}</Text>
                <View style={styles.row}>
                  {[12, 24, 72, 168].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[styles.chip, checkin.intervalHours === hours && styles.chipOn]}
                      onPress={() => void persistCheckin({ ...checkin, intervalHours: hours })}
                    >
                      <Text style={[styles.chipText, checkin.intervalHours === hours && styles.chipTextOn]}>
                        {hours === 168 ? t('labs.chastity.tools.weekly') : `${hours}h`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.kicker}>{t('labs.chastity.tools.skin')}</Text>
                <View style={styles.row}>
                  {(['excelente', 'irritacion_leve', 'requiere_descanso'] as const).map((id) => (
                    <TouchableOpacity
                      key={id}
                      style={[styles.chip, checkin.skinStatus === id && styles.chipOn]}
                      onPress={() => void persistCheckin({ ...checkin, skinStatus: id })}
                    >
                      <Text style={[styles.chipText, checkin.skinStatus === id && styles.chipTextOn]}>
                        {t(`labs.chastity.tools.skin.${id}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {checkin.lastAtIso ? (
                  <Text style={styles.meta}>
                    {t('labs.chastity.tools.last')}: {new Date(checkin.lastAtIso).toLocaleString()}
                  </Text>
                ) : null}

                <TouchableOpacity style={styles.inviteBtn} onPress={() => void logCheckin()}>
                  <Text style={styles.inviteBtnText}>{t('labs.chastity.tools.log')}</Text>
                </TouchableOpacity>
                <Text style={styles.meta}>{t('labs.chastity.tools.no_upload')}</Text>
              </>
            )}

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

export default function ChastityToolsScreen() {
  return (
    <RouteFeatureGuard route="/chastity-tools" title="Castidad · Herramientas">
      <ChastityToolsContent />
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
  tabsRow: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  tabTextOn: { color: colors.onPrimary },
  scroll: { gap: spacing.md, paddingTop: spacing.md },
  kicker: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs, letterSpacing: 0.8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardDone: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' },
  emoji: { fontSize: 24 },
  cardTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  cardTitleDone: { color: colors.success },
  cardDesc: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  check: { fontSize: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  chipTextOn: { color: colors.onPrimary },
  meta: { color: colors.textDim, fontSize: 11, lineHeight: 16 },
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
