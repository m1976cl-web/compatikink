import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { OctopusHost } from '@/components/OctopusHost';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { UserProfile } from '@/types';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

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

  return (
    <Animated.View
      style={[
        styles.hero,
        { opacity: heroFade, transform: [{ translateY: heroSlide }] },
      ]}
    >
      <Text style={styles.brand} accessibilityRole="header">
        Compatikink
      </Text>
      <Text style={styles.mark}>Plataforma de Exploración & Afinidad Cifrada</Text>
      <OctopusHost />
      <Text style={styles.headline}>
        {loggedIn
          ? `Hola, ${profile?.nickname}`
          : 'Preferencias privadas. Compatibilidad consensuada.'}
      </Text>
      <Text style={styles.heroSupport}>
        {loggedIn
          ? profile?.experienceLevel
            ? `Nivel: ${profile.experienceLevel}`
            : 'Tu espacio cifrado en este dispositivo.'
          : 'Define límites, invita a alguien y recibe un reporte sin revelar respuestas individuales.'}
      </Text>
      <View style={styles.ctaGroup}>
        {loggedIn ? (
          <>
            <Button
              title="Crear invitación"
              onPress={onOpenQuickInvite}
              style={styles.ctaPrimary}
            />
            <Button
              title="Editar respuestas"
              variant="secondary"
              onPress={() => router.push('/questionnaire')}
              style={styles.ctaSecondary}
            />
            <Button
              title={vaultOpen ? 'Bloquear bóveda' : 'Abrir bóveda'}
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
              title="Empezar"
              onPress={() => router.push('/questionnaire')}
              style={styles.ctaPrimary}
            />
            <Button
              title="Me invitaron"
              variant="secondary"
              onPress={onScrollToGuest}
              style={styles.ctaSecondary}
            />
            <Button
              title="Entrar a bóveda"
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
