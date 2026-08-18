import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import {
  SISSY_PROTOCOL_TASKS,
  emptySissyState,
  loadSissyState,
  saveSissyState,
  type SissyProtocolState,
  type SissyTaskStatus,
} from '@/lib/fetishLabs';

function SissyTrainingContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [state, setState] = useState<SissyProtocolState>(emptySissyState());

  useEffect(() => {
    loadSissyState().then(setState).catch(() => setState(emptySissyState()));
  }, []);

  const persist = async (next: SissyProtocolState) => {
    setState(next);
    await saveSissyState(next);
  };

  const setTask = (id: string, status: SissyTaskStatus) => {
    void persist({
      ...state,
      taskStatus: { ...state.taskStatus, [id]: status },
    });
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="privacy" variant="compact" />
          <Text style={styles.title}>{t('labs.sissy.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.sissy.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.sissy.legal')} />

        <VaultLockGate title={t('labs.sissy.vault')} subtitle={t('labs.zk_hint')} showLockButton>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>{t('labs.sissy.protocol')}</Text>

            {SISSY_PROTOCOL_TASKS.map((task) => {
              const st = state.taskStatus[task.id] ?? 'pending';
              return (
                <View key={task.id} style={styles.card}>
                  <Text style={styles.itemName}>{task.title}</Text>
                  <Text style={styles.itemBlurb}>{task.detail}</Text>
                  <Text style={styles.meta}>
                    ~{task.durationMin} min · {task.aftercareHint}
                  </Text>
                  <View style={styles.row}>
                    {(['pending', 'done', 'skipped'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.stChip, st === s && styles.stChipOn]}
                        onPress={() => setTask(task.id, s)}
                      >
                        <Text style={[styles.stChipText, st === s && styles.stChipTextOn]}>
                          {t(`labs.sissy.st.${s}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}

            <TextInput
              style={styles.input}
              value={state.notes}
              onChangeText={(notes) => void persist({ ...state, notes })}
              placeholder={t('labs.sissy.notes')}
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <TouchableOpacity
              style={[styles.inviteBtn, state.aftercareDone && styles.inviteBtnOn]}
              onPress={() => void persist({ ...state, aftercareDone: !state.aftercareDone })}
            >
              <Text style={styles.inviteBtnText}>
                {state.aftercareDone ? t('labs.sissy.aftercare_on') : t('labs.sissy.aftercare')}
              </Text>
            </TouchableOpacity>

            <View style={styles.aftercareBox}>
              <NoxHost scene="manual" variant="inline" caption={false} showName={false} />
              <Text style={styles.aftercareTitle}>{t('labs.sissy.aftercare_list')}</Text>
              <Text style={styles.aftercareItem}>✓ {t('labs.sissy.ac1')}</Text>
              <Text style={styles.aftercareItem}>✓ {t('labs.sissy.ac2')}</Text>
              <Text style={styles.aftercareItem}>✓ {t('labs.sissy.ac3')}</Text>
              <Text style={styles.aftercareItem}>✓ {t('labs.sissy.ac4')}</Text>
            </View>

            <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/invite')}>
              <Text style={styles.ghostBtnText}>{t('labs.sissy.session')}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
  );
}

export default function SissyTrainingScreen() {
  return (
    <RouteFeatureGuard route="/sissy-training" title="Sissy training">
      <SissyTrainingContent />
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  itemName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.md },
  itemBlurb: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  meta: { color: colors.textDim, fontSize: 11 },
  row: { flexDirection: 'row', gap: 6, marginTop: 4 },
  stChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  stChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi },
  stChipTextOn: { color: colors.onPrimary },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    textAlignVertical: 'top',
  },
  inviteBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  inviteBtnOn: { backgroundColor: colors.primary },
  inviteBtnText: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  aftercareBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  aftercareTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  aftercareItem: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  ghostBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
});
