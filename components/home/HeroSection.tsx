import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { NoxHost } from '@/components/nox';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { UserProfile } from '@/types';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { useTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface HeroSectionProps {
  loggedIn: boolean;
  profile: UserProfile | null;
  vaultOpen: boolean;
  heroFade: Animated.Value;
  heroSlide: Animated.Value;
  onOpenQuickInvite: () => void;
  onScrollToGuest: () => void;
}

export function HeroSection({
  loggedIn,
  profile,
  vaultOpen,
  heroFade,
  heroSlide,
  onOpenQuickInvite,
  onScrollToGuest,
}: HeroSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Animated.View
      style={[
        styles.hero,
        { opacity: heroFade, transform: [{ translateY: heroSlide }] },
      ]}
    >
      <View style={styles.langRow}>
        <LanguageSelector />
      </View>
      <Text style={styles.brand} accessibilityRole="header">
        CompatKink
      </Text>
      <Text style={styles.mark}>{t('home.mark')}</Text>
      <NoxHost scene="home" variant="compact" />
      <Text style={styles.headline}>
        {loggedIn
          ? t('home.hello', { name: profile?.nickname || '' })
          : t('home.headline')}
      </Text>
      <Text style={styles.heroSupport}>
        {loggedIn
          ? vaultOpen
            ? t('home.support_open')
            : t('home.support_locked')
          : t('home.support_guest')}
      </Text>
      <View style={styles.ctaGroup}>
        {loggedIn ? (
          <>
            <Button
              title={t('home.cta_invite')}
              onPress={onOpenQuickInvite}
              style={styles.ctaPrimary}
            />
            <Button
              title={t('home.cta_respond')}
              variant="secondary"
              onPress={() => router.push('/quick-profile')}
              style={styles.ctaSecondary}
            />
            <Button
              title={vaultOpen ? t('home.cta_lock') : t('home.cta_unlock')}
              variant="ghost"
              onPress={() => {
                if (vaultOpen) VaultLockGateAPI.lock();
                else router.push('/auth' as any);
              }}
            />
          </>
        ) : (
          <>
            <Button
              title={t('home.cta_start')}
              onPress={() => router.push('/quick-profile')}
              style={styles.ctaPrimary}
            />
            <Button
              title={t('home.cta_invited')}
              variant="secondary"
              onPress={onScrollToGuest}
              style={styles.ctaSecondary}
            />
            <Button
              title={t('home.cta_vault')}
              variant="ghost"
              onPress={() => router.push('/auth')}
            />
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.xxl, paddingTop: spacing.md },
  langRow: { alignItems: 'flex-end', marginBottom: spacing.sm },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.brand,
    color: colors.text,
    letterSpacing: 1.4,
    lineHeight: 52,
  },
  mark: {
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.md,
    color: colors.primary,
    letterSpacing: 3,
    marginTop: -2,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: 0.2,
    lineHeight: 36,
    maxWidth: 520,
  },
  heroSupport: { ...typography.bodyMuted, marginTop: spacing.sm, maxWidth: 480 },
  ctaGroup: { marginTop: spacing.lg, gap: spacing.sm, maxWidth: 360 },
  ctaPrimary: { width: '100%' },
  ctaSecondary: { width: '100%' },
});
