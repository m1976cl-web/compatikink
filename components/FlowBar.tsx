import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';

export type FlowBarStep = 1 | 2 | 3;

interface FlowBarProps {
  /** Initiator path step. Ignored when `guest` is true. */
  step?: FlowBarStep;
  guest?: boolean;
}

const STEP_LABEL_KEYS: Record<FlowBarStep, string> = {
  1: 'flow.step1_label',
  2: 'flow.step2_label',
  3: 'flow.step3_label',
};

/**
 * Slim context strip: “Paso 2 de 3 · Invitar” with a home link.
 * Guest path uses a single blind-response label instead of the initiator steps.
 */
export function FlowBar({ step = 1, guest = false }: FlowBarProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const context = guest
    ? t('flow.guest')
    : `${t('flow.step_of', { current: String(step), total: '3' })} · ${t(STEP_LABEL_KEYS[step])}`;

  return (
    <View style={styles.bar} accessibilityRole="header">
      <TouchableOpacity
        onPress={() => router.replace('/')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="link"
        accessibilityLabel={t('flow.home')}
      >
        <Text style={styles.home}>← {t('flow.home')}</Text>
      </TouchableOpacity>
      <Text style={styles.context} numberOfLines={1}>
        {context}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  home: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  context: {
    flexShrink: 1,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
});
