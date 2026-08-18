import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';

export type NextStepVariant = 'invite' | 'wait' | 'report';

interface NextStepBannerProps {
  variant: NextStepVariant;
  onPress?: () => void;
}

const COPY: Record<
  NextStepVariant,
  { kicker: string; title: string; body: string; cta?: string }
> = {
  invite: {
    kicker: 'banner.after_answers',
    title: 'banner.after_answers_title',
    body: 'banner.after_answers_body',
    cta: 'banner.after_answers_cta',
  },
  wait: {
    kicker: 'banner.invite_wait',
    title: 'banner.invite_wait_title',
    body: 'banner.invite_wait_body',
  },
  report: {
    kicker: 'banner.report_ready',
    title: 'banner.report_ready_title',
    body: 'banner.report_ready_body',
    cta: 'banner.report_ready_cta',
  },
};

/** In-flow “what’s next” card. One action max — never a fork. */
export function NextStepBanner({ variant, onPress }: NextStepBannerProps) {
  const { t } = useTranslation();
  const keys = COPY[variant];
  const isReady = variant === 'report';

  return (
    <View
      style={[styles.card, isReady ? styles.cardReady : styles.cardNext]}
      accessibilityRole="summary"
    >
      <Text style={[styles.kicker, isReady && styles.kickerReady]}>{t(keys.kicker)}</Text>
      <Text style={styles.title}>{t(keys.title)}</Text>
      <Text style={styles.body}>{t(keys.body)}</Text>
      {keys.cta && onPress ? (
        <Button title={t(keys.cta)} onPress={onPress} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  cardNext: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  cardReady: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: colors.success,
  },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  kickerReady: { color: colors.success },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  cta: { marginTop: spacing.sm },
});
