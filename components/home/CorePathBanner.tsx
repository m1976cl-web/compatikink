import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';

interface CorePathBannerProps {
  hasProfile: boolean;
  hasResponses: boolean;
  vaultOpen: boolean;
  onInvite: () => void;
}

/**
 * Single-path CTA for beta: Responde → Invita → Reporte.
 * Hides product noise so testers cannot get lost.
 */
export function CorePathBanner({
  hasProfile,
  hasResponses,
  vaultOpen,
  onInvite,
}: CorePathBannerProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.kicker}>{t('path.kicker')}</Text>
      <Text style={styles.title}>{t('path.title')}</Text>
      <Text style={styles.desc}>{t('path.desc')}</Text>

      {!hasProfile ? (
        <Text style={styles.warn}>{t('path.need_profile')}</Text>
      ) : !vaultOpen ? (
        <Text style={styles.warn}>{t('path.need_vault')}</Text>
      ) : !hasResponses ? (
        <Text style={styles.warn}>{t('path.need_answers')}</Text>
      ) : (
        <Text style={styles.ok}>{t('path.ready')}</Text>
      )}

      <View style={styles.row}>
        <Button
          title={t('path.step1')}
          onPress={() => router.push('/quick-profile')}
          style={styles.btn}
        />
        <Button
          title={t('path.step2')}
          variant="secondary"
          onPress={onInvite}
          disabled={!hasProfile}
          style={styles.btn}
        />
        <Button
          title={t('path.step3')}
          variant="ghost"
          onPress={() => router.push('/manual')}
          style={styles.btn}
        />
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  btn: { flexGrow: 1, minWidth: 120 },
});
