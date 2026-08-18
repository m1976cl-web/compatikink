import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';

interface Props {
  extra?: string;
}

export function AdultConsentBanner({ extra }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.box} accessibilityRole="text">
      <Text style={styles.kicker}>{t('labs.adults_only')}</Text>
      <Text style={styles.body}>{t('labs.consent')}</Text>
      {extra ? <Text style={styles.extra}>{extra}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    gap: 6,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    color: colors.danger,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  extra: {
    fontFamily: fonts.body,
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});
