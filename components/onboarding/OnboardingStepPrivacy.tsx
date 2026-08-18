import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

interface Props {
  onNext: () => void;
}

export function OnboardingStepPrivacy({ onNext }: Props) {
  const router = useRouter();
  const [is18Plus, setIs18Plus] = useState(false);
  const [consent, setConsent] = useState(false);

  const canContinue = is18Plus && consent;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filosofía & Privacidad 🛡️</Text>
      <Text style={styles.subtitle}>
        CompatKink se basa en el consentimiento, la comunicación y el Zero-Knowledge.
      </Text>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🛡️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>100% Cifrado Zero-Knowledge</Text>
            <Text style={styles.cardDesc}>Tus respuestas nunca se guardan en texto plano en la nube.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🎭</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cruce Asimétrico y Seguro</Text>
            <Text style={styles.cardDesc}>Solo se descubren las coincidencias mutuas; los límites y desacuerdos jamás se exponen.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🗝️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Privacidad Total</Text>
            <Text style={styles.cardDesc}>No se requiere email ni datos reales para explorar en modo anónimo.</Text>
          </View>
        </View>
      </View>

      <View style={styles.gateContainer}>
        <Text style={styles.gateTitle}>🔞 Consentimiento Informado & 18+ Gate</Text>
        <View style={styles.switchRow}>
          <Switch
            value={is18Plus}
            onValueChange={setIs18Plus}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={is18Plus ? colors.surface : colors.textMuted}
          />
          <Text style={styles.switchText}>Confirmo que tengo 18 años o más.</Text>
        </View>
        <View style={styles.switchRow}>
          <Switch
            value={consent}
            onValueChange={setConsent}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={consent ? colors.surface : colors.textMuted}
          />
          <Text style={styles.switchText}>
            Entiendo y acepto los{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/terms' as any)}
            >
              Términos
            </Text>{' '}
            y la{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('/privacy-policy' as any)}
            >
              Política de Privacidad
            </Text>.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
        disabled={!canContinue}
        onPress={onNext}
      >
        <Text style={styles.continueBtnText}>Continuar de forma anónima</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleAuthButton onSuccess={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    marginBottom: spacing.lg,
  },
  cardsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  gateContainer: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  gateTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  switchText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  continueBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: '#000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle || 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
