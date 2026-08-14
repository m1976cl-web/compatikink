import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

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

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.kicker}>Beta — un solo camino</Text>
      <Text style={styles.title}>Responde → Invita → Lee el reporte</Text>
      <Text style={styles.desc}>
        Ignora el resto de pantallas. Si algo falla, limpia datos del sitio y usa ventana privada.
        Guía: docs/BETA_HAPPY_PATH.md
      </Text>

      {!hasProfile ? (
        <Text style={styles.warn}>Primero crea o desbloquea tu perfil (PIN).</Text>
      ) : !vaultOpen ? (
        <Text style={styles.warn}>Bóveda bloqueada: desbloquéala con tu PIN para usar respuestas.</Text>
      ) : !hasResponses ? (
        <Text style={styles.warn}>Aún no hay respuestas base. Completa el paso 1.</Text>
      ) : (
        <Text style={styles.ok}>Listo para invitar.</Text>
      )}

      <View style={styles.row}>
        <Button
          title="1. Responder"
          onPress={() => router.push('/quick-profile')}
          style={styles.btn}
        />
        <Button
          title="2. Invitar"
          variant="secondary"
          onPress={onInvite}
          disabled={!hasProfile}
          style={styles.btn}
        />
        <Button
          title="3. Manual"
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
