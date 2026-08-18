import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import {
  EMPTY_CHASTITY_SIZING,
  computeBeltFit,
  computeCageFit,
  computeStyleFit,
  formatChastitySizingMarkdown,
  loadChastitySizing,
  saveChastitySizing,
  type ChastitySizingProfile,
  type DeviceFamily,
  type DiscretionLevel,
  type EnclosureStyle,
  type MaterialFeel,
  type MeasureUnit,
} from '@/lib/chastitySizing';
import { copyPlainText, downloadPlainText } from '@/lib/measurementExport';

export type ChastitySizeMode = 'cage' | 'belt' | 'style';

interface Props {
  mode: ChastitySizeMode;
}

function parseNum(raw: string): number | null {
  const n = Number(String(raw).replace(',', '.'));
  return Number.isFinite(n) && String(raw).trim() !== '' ? n : null;
}

function numStr(value: number | null): string {
  return value == null ? '' : String(value);
}

export function ChastitySizeFlow({ mode }: Props) {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ChastitySizingProfile>(EMPTY_CHASTITY_SIZING);

  useEffect(() => {
    loadChastitySizing().then(setProfile);
  }, []);

  const persist = async (next: ChastitySizingProfile) => {
    const saved = await saveChastitySizing(next);
    setProfile(saved);
  };

  const cage = useMemo(() => computeCageFit(profile), [profile]);
  const belt = useMemo(() => computeBeltFit(profile), [profile]);
  const style = useMemo(() => computeStyleFit(profile), [profile]);

  const exportNow = async (download: boolean) => {
    const md = formatChastitySizingMarkdown(profile);
    if (download) {
      const ok = downloadPlainText('compatikink-chastity-fit.md', md, 'text/markdown;charset=utf-8');
      Alert.alert(
        t('labs.chastity.size.export_title'),
        ok ? t('labs.chastity.size.downloaded') : t('labs.chastity.size.copied')
      );
      return;
    }
    const copied = await copyPlainText(md);
    Alert.alert(
      t('labs.chastity.size.export_title'),
      copied ? t('labs.chastity.size.copied') : t('labs.chastity.size.copy_fail')
    );
  };

  const titleKey =
    mode === 'cage' ? 'labs.chastity.cage.title' : mode === 'belt' ? 'labs.chastity.belt.title' : 'labs.chastity.fit.title';
  const leadKey =
    mode === 'cage' ? 'labs.chastity.cage.lead' : mode === 'belt' ? 'labs.chastity.belt.lead' : 'labs.chastity.fit.lead';
  const vaultKey =
    mode === 'cage' ? 'labs.chastity.cage.vault' : mode === 'belt' ? 'labs.chastity.belt.vault' : 'labs.chastity.fit.vault';

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="manual" variant="compact" />
          <Text style={styles.title}>{t(titleKey)}</Text>
          <Text style={styles.subtitle}>{t(leadKey)}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.chastity.legal')} />

        <VaultLockGate title={t(vaultKey)} subtitle={t('labs.zk_hint')} showLockButton>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>{t('labs.chastity.size.unit')}</Text>
            <View style={styles.row}>
              {(['mm', 'inch'] as MeasureUnit[]).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.chip, profile.unit === unit && styles.chipOn]}
                  onPress={() => void persist({ ...profile, unit })}
                >
                  <Text style={[styles.chipText, profile.unit === unit && styles.chipTextOn]}>
                    {t(`labs.chastity.size.${unit}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.meta}>{t('labs.chastity.size.unit_hint')}</Text>

            {mode === 'cage' || mode === 'style' ? (
              <>
                <NumberField
                  label={t('labs.chastity.size.shaft')}
                  hint={t('labs.chastity.size.shaft_hint')}
                  value={numStr(profile.cage.shaftCircumference)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      cage: { ...profile.cage, shaftCircumference: parseNum(raw) },
                    })
                  }
                />
                <NumberField
                  label={t('labs.chastity.size.flaccid')}
                  hint={t('labs.chastity.size.flaccid_hint')}
                  value={numStr(profile.cage.flaccidLength)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      cage: { ...profile.cage, flaccidLength: parseNum(raw) },
                    })
                  }
                />
                <NumberField
                  label={t('labs.chastity.size.ring')}
                  hint={t('labs.chastity.size.ring_hint')}
                  value={numStr(profile.cage.ringCircumference)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      cage: { ...profile.cage, ringCircumference: parseNum(raw) },
                    })
                  }
                />
              </>
            ) : null}

            {mode === 'belt' || mode === 'style' ? (
              <>
                <NumberField
                  label={t('labs.chastity.size.waist')}
                  hint={t('labs.chastity.size.waist_hint')}
                  value={numStr(profile.belt.waistCircumference)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      belt: { ...profile.belt, waistCircumference: parseNum(raw) },
                    })
                  }
                />
                <NumberField
                  label={t('labs.chastity.size.hip')}
                  hint={t('labs.chastity.size.hip_hint')}
                  value={numStr(profile.belt.hipCircumference)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      belt: { ...profile.belt, hipCircumference: parseNum(raw) },
                    })
                  }
                />
                <NumberField
                  label={t('labs.chastity.size.drop')}
                  hint={t('labs.chastity.size.drop_hint')}
                  value={numStr(profile.belt.frontDrop)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      belt: { ...profile.belt, frontDrop: parseNum(raw) },
                    })
                  }
                />
                <NumberField
                  label={t('labs.chastity.size.thigh')}
                  hint={t('labs.chastity.size.thigh_hint')}
                  value={numStr(profile.belt.thighCircumference)}
                  onChange={(raw) =>
                    setProfile({
                      ...profile,
                      belt: { ...profile.belt, thighCircumference: parseNum(raw) },
                    })
                  }
                />
              </>
            ) : null}

            {mode === 'style' ? (
              <>
                <Text style={styles.kicker}>{t('labs.chastity.size.device')}</Text>
                <View style={styles.row}>
                  {(['cage', 'belt', 'agreement'] as DeviceFamily[]).map((id) => (
                    <Chip
                      key={id}
                      on={profile.style.device === id}
                      label={t(`labs.chastity.size.device.${id}`)}
                      onPress={() =>
                        setProfile({ ...profile, style: { ...profile.style, device: id } })
                      }
                    />
                  ))}
                </View>
                <Text style={styles.kicker}>{t('labs.chastity.size.enclosure')}</Text>
                <View style={styles.row}>
                  {(['open', 'closed', 'extra_short'] as EnclosureStyle[]).map((id) => (
                    <Chip
                      key={id}
                      on={profile.style.enclosure === id}
                      label={t(`labs.chastity.size.enclosure.${id}`)}
                      onPress={() =>
                        setProfile({ ...profile, style: { ...profile.style, enclosure: id } })
                      }
                    />
                  ))}
                </View>
                <Text style={styles.kicker}>{t('labs.chastity.size.material')}</Text>
                <View style={styles.row}>
                  {(['rigid', 'flexible'] as MaterialFeel[]).map((id) => (
                    <Chip
                      key={id}
                      on={profile.style.material === id}
                      label={t(`labs.chastity.size.material.${id}`)}
                      onPress={() =>
                        setProfile({ ...profile, style: { ...profile.style, material: id } })
                      }
                    />
                  ))}
                </View>
                <Text style={styles.kicker}>{t('labs.chastity.size.discretion')}</Text>
                <View style={styles.row}>
                  {(['high', 'medium'] as DiscretionLevel[]).map((id) => (
                    <Chip
                      key={id}
                      on={profile.style.discretion === id}
                      label={t(`labs.chastity.size.discretion.${id}`)}
                      onPress={() =>
                        setProfile({ ...profile, style: { ...profile.style, discretion: id } })
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}

            <View style={styles.result}>
              <Text style={styles.kicker}>{t('labs.chastity.size.result')}</Text>
              {mode !== 'belt' ? (
                cage.ok ? (
                  <>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.length')}: {cage.cageLengthMm} mm · {cage.lengthBand}
                    </Text>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.tube')}: {cage.tubeInnerMm} mm · {cage.tubeBand}
                    </Text>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.ring_dia')}: {cage.ringSnappedMm} mm · {cage.ringBand}
                    </Text>
                    <Text style={styles.band}>
                      {t('labs.chastity.size.band')}: {cage.overallBand}
                    </Text>
                    {cage.oversize ? (
                      <Text style={styles.warn}>{t('labs.chastity.size.oversize')}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.meta}>{t('labs.chastity.size.need_values')}</Text>
                )
              ) : null}
              {mode !== 'cage' ? (
                belt.ok ? (
                  <>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.waist')}: {belt.waistMm} mm · {belt.waistBand}
                    </Text>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.hip')}: {belt.hipMm} mm
                    </Text>
                    <Text style={styles.resultLine}>
                      {t('labs.chastity.size.drop')}: {belt.frontDropMm} mm
                    </Text>
                    <Text style={styles.band}>
                      {t('labs.chastity.size.band')}: {belt.waistBand}
                    </Text>
                  </>
                ) : mode === 'belt' ? (
                  <Text style={styles.meta}>{t('labs.chastity.size.need_values')}</Text>
                ) : null
              ) : null}
              {mode === 'style' ? (
                <Text style={styles.resultLine}>{style.summary}</Text>
              ) : null}
              <Text style={styles.meta}>{t('labs.chastity.size.not_shop')}</Text>
            </View>

            <TouchableOpacity style={styles.inviteBtn} onPress={() => void persist(profile)}>
              <Text style={styles.inviteBtnText}>{t('labs.chastity.size.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => void exportNow(false)}>
              <Text style={styles.ghostBtnText}>{t('labs.chastity.size.copy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => void exportNow(true)}>
              <Text style={styles.ghostBtnText}>{t('labs.chastity.size.download')}</Text>
            </TouchableOpacity>
            <Text style={styles.meta}>{t('labs.chastity.size.disclaimer')}</Text>
            <View style={{ height: 40 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
  );
}

function Chip({
  on,
  label,
  onPress,
}: {
  on: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.chip, on && styles.chipOn]} onPress={onPress}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (raw: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldHint}>{hint}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textDim}
        style={styles.input}
      />
    </View>
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
  field: { gap: 4 },
  fieldLabel: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  fieldHint: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  result: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  resultLine: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
  band: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm, marginTop: 4 },
  warn: { color: colors.danger, fontSize: fontSize.xs, lineHeight: 16 },
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
