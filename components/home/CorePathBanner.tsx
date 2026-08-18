import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';
import { getCorePathState } from '@/lib/corePath';
import { Session, UserProfile } from '@/types';

interface CorePathBannerProps {
  profile: UserProfile | null;
  vaultOpen: boolean;
  sessions: Session[];
  onInvite: () => void;
}

type StepDef = {
  id: 1 | 2 | 3;
  titleKey: string;
  hintKey: string;
};

const STEPS: StepDef[] = [
  { id: 1, titleKey: 'path.step1_title', hintKey: 'path.step1_hint' },
  { id: 2, titleKey: 'path.step2_title', hintKey: 'path.step2_hint' },
  { id: 3, titleKey: 'path.step3_title', hintKey: 'path.step3_hint' },
];

/**
 * Single numbered stepper for the tester happy path.
 * Only the current step gets a primary CTA; later steps stay dimmed/locked.
 */
export function CorePathBanner({ profile, vaultOpen, sessions, onInvite }: CorePathBannerProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const path = getCorePathState(profile, vaultOpen, sessions);

  const statusOf = (id: 1 | 2 | 3) => (id === 1 ? path.step1 : id === 2 ? path.step2 : path.step3);
  const lockedOf = (id: 1 | 2 | 3) => (id === 2 ? path.step2Locked : id === 3 ? path.step3Locked : false);

  const primaryCta = (() => {
    if (path.currentStep === 1) {
      if (!path.hasProfile) {
        return {
          title: t('path.cta_answer'),
          onPress: () => router.push('/quick-profile'),
        };
      }
      if (!path.vaultOpen) {
        return {
          title: t('path.cta_unlock'),
          onPress: () => router.push('/auth' as any),
        };
      }
      return {
        title: t('path.cta_answer'),
        onPress: () => router.push('/questionnaire'),
      };
    }
    if (path.currentStep === 2) {
      if (path.waitingSession) {
        return {
          title: t('path.cta_share'),
          onPress: () =>
            router.push({
              pathname: '/invite',
              params: { token: path.waitingSession!.initiatorToken },
            }),
        };
      }
      return { title: t('path.cta_invite'), onPress: onInvite };
    }
    if (path.completeSession) {
      return {
        title: t('path.cta_report'),
        onPress: () =>
          router.push({
            pathname: '/report',
            params: { token: path.completeSession!.initiatorToken },
          }),
      };
    }
    return null;
  })();

  const gateText = !path.hasProfile
    ? t('path.need_profile')
    : !path.vaultOpen
      ? t('path.need_vault')
      : !path.hasResponses
        ? t('path.need_answers')
        : path.completeSession
          ? t('banner.report_ready_title')
          : path.waitingSession
            ? t('path.step2_wait')
            : t('path.ready');

  const gateOk = path.hasProfile && path.vaultOpen && path.hasResponses;

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.kicker}>{t('path.col_start')}</Text>
      <Text style={styles.title}>{t('path.title')}</Text>
      <Text style={styles.desc}>{t('path.desc')}</Text>
      <Text style={gateOk ? styles.ok : styles.warn}>{gateText}</Text>

      <View style={styles.steps}>
        {STEPS.map((step) => {
          const status = statusOf(step.id);
          const locked = lockedOf(step.id);
          const current = path.currentStep === step.id;
          const showCta = current && primaryCta && !locked;

          return (
            <View
              key={step.id}
              style={[styles.step, locked && styles.stepLocked, current && styles.stepCurrent]}
              accessibilityState={{ disabled: locked }}
            >
              <View style={styles.stepHead}>
                <View
                  style={[
                    styles.badge,
                    status === 'done' && styles.badgeDone,
                    current && !locked && styles.badgeCurrent,
                    locked && styles.badgeLocked,
                  ]}
                >
                  <Text style={[styles.badgeText, status === 'done' && styles.badgeTextDone]}>
                    {status === 'done' ? '✓' : String(step.id)}
                  </Text>
                </View>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, locked && styles.dimText]}>
                    {t(step.titleKey)}
                  </Text>
                  <Text style={[styles.stepStatus, current && styles.stepStatusNow]}>
                    {locked
                      ? t('path.locked_hint')
                      : status === 'done'
                        ? t('path.status_done')
                        : status === 'doing'
                          ? t('path.status_doing')
                          : t('path.status_todo')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.stepHint, locked && styles.dimText]}>{t(step.hintKey)}</Text>
              {showCta ? (
                <Button title={primaryCta.title} onPress={primaryCta.onPress} style={styles.cta} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  warn: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.warning,
  },
  ok: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  steps: { gap: spacing.sm, marginTop: spacing.xs },
  step: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  stepCurrent: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
  },
  stepLocked: { opacity: 0.45 },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  badgeCurrent: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  badgeDone: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.15)' },
  badgeLocked: { borderColor: colors.borderSubtle },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  badgeTextDone: { color: colors.success },
  stepCopy: { flex: 1, minWidth: 0 },
  stepTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.text,
  },
  stepStatus: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepStatusNow: { color: colors.primary },
  stepHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  dimText: { color: colors.textMuted },
  cta: { marginTop: spacing.xs },
});
