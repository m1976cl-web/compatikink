import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  onSelectPath: (path: string, mode?: string) => void;
}

export function OnboardingStepPaths({ onSelectPath }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Todo Listo! 🚀</Text>
      <Text style={styles.subtitle}>
        Elige tu primera acción para empezar a explorar.
      </Text>

      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.ctaCardPrimary}
          onPress={() => onSelectPath('/questionnaire', 'express')}
        >
          <Text style={styles.ctaCardTitle}>⚡ Hacer Test Express (2 min)</Text>
          <Text style={styles.ctaCardDesc}>
            Inicia con las 10 actividades esenciales. Rápido y directo al grano.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCardSecondary}
          onPress={() => onSelectPath('/questionnaire')}
        >
          <Text style={styles.ctaCardTitle}>📋 Test Completo (161+ actividades)</Text>
          <Text style={styles.ctaCardDesc}>
            Exploración exhaustiva paso a paso. Tómate tu tiempo.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCardSecondary}
          onPress={() => onSelectPath('/invite')}
        >
          <Text style={styles.ctaCardTitle}>📱 Invitar a Pareja / Amigo</Text>
          <Text style={styles.ctaCardDesc}>
            Genera código QR y enlace directo para comparar resultados.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCardGhost}
          onPress={() => onSelectPath('/')}
        >
          <Text style={styles.ctaCardGhostTitle}>🏠 Explorar el Hub Principal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsList: {
    width: '100%',
    gap: spacing.md,
  },
  ctaCardPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  ctaCardSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  ctaCardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: '#000000',
  },
  ctaCardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: '#1e1b4b',
  },
  ctaCardGhost: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaCardGhostTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
