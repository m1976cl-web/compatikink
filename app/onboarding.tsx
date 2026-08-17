import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { NoxHost } from '@/components/nox';
import type { NoxSceneId } from '@/components/nox';
import { colors, fonts, fontSize, radii, spacing, typography, glowShadowPrimary } from '@/constants/theme';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

const { width } = Dimensions.get('window');

const ONBOARDING_SCENES: NoxSceneId[] = ['onboarding', 'landing', 'auth', 'home'];

const ROLES = [
  { id: 'dom', label: 'Dom/Dominante', emoji: '👑' },
  { id: 'sub', label: 'Sub/Sumiso', emoji: '🧎' },
  { id: 'switch', label: 'Switch', emoji: '⚡' },
  { id: 'curious', label: 'Curioso/Explorando', emoji: '🔮' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 0: Age Gate Verification P0.5
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Step 1 State: Role Selection
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const validateAge = (): boolean => {
    if (!ageConfirmed) {
      Alert.alert('Confirmación requerida', 'Debes confirmar que eres mayor de 18 años para continuar.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!validateAge()) return;
    }
    if (step < 2) {
      animateTransition(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      animateTransition(step - 1);
    }
  };

  const handleComplete = async (route: string) => {
    await AsyncStorage.setItem('compatikink_onboarding_complete_v1', 'true');
    await AsyncStorage.setItem('compatikink_age_verified_v1', 'true');
    router.replace(route as any);
  };

  // Step 0: Advertencias Legales & Verificación de Edad 18+
  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verificación de Edad & Advertencias 🔞</Text>
      <Text style={styles.stepSubtitle}>
        CompatKink procesa datos de afinidad íntima y BDSM. Se requiere estricta mayoría de edad (18+ años) y consentimiento consensuado e informado (SSC / RACK).
      </Text>

      <View style={{ marginVertical: spacing.md, width: '100%' }}>
        <Text style={styles.label}>🔵 Iniciar Sesión Directo con Google:</Text>
        <GoogleAuthButton onSuccess={() => handleComplete('/')} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs, gap: spacing.xs }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle || 'rgba(255,255,255,0.1)' }} />
        <Text style={{ color: colors.textMuted || '#94a3b8', fontSize: 11 }}>o confirma tu fecha de nacimiento</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle || 'rgba(255,255,255,0.1)' }} />
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>📜 Términos & Principios Consensuados</Text>
        <Text style={styles.noticeBody}>
          • Estrictamente prohibido contenido de menores, sin consentimiento o ilegal.{'\n'}
          • Cifrado Zero-Knowledge: Tus respuestas se almacenan encriptadas localmente.{'\n'}
          • Solo tú decides qué compartir y con quién.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgeConfirmed(!ageConfirmed)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, ageConfirmed && styles.checkboxChecked]}>
          {ageConfirmed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxText}>
          Confirmo que tengo 18+ años y acepto los{' '}
          <Text
            style={{ color: colors.primary, textDecorationLine: 'underline' }}
            onPress={() => router.push('/terms' as any)}
          >
            Términos de Servicio
          </Text>{' '}
          y la{' '}
          <Text
            style={{ color: colors.primary, textDecorationLine: 'underline' }}
            onPress={() => router.push('/privacy-policy' as any)}
          >
            Política de Privacidad
          </Text>
          .
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 1: Inicio de Sesión (Google Auth o Modo Anónimo)
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Ingreso & Identidad 🔑</Text>
      <Text style={styles.stepSubtitle}>
        Puedes iniciar sesión con tu cuenta de Google o continuar 100% de forma anónima.
      </Text>

      <View style={{ marginVertical: spacing.md, width: '100%' }}>
        <Text style={styles.label}>Opción A: Iniciar Sesión Rápido</Text>
        <GoogleAuthButton onSuccess={() => handleComplete('/')} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm, gap: spacing.xs }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle || 'rgba(255,255,255,0.1)' }} />
        <Text style={{ color: colors.textMuted || '#94a3b8', fontSize: 11 }}>o continuar de forma anónima</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle || 'rgba(255,255,255,0.1)' }} />
      </View>

      <Text style={styles.label}>Opción B: Define tu Rol para Modo Anónimo</Text>
      <View style={styles.rolesGrid}>
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.roleCard, isSelected && styles.roleCardActive]}
              onPress={() => setSelectedRole(r.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleEmoji}>{r.emoji}</Text>
              <Text style={[styles.roleLabel, isSelected && styles.roleLabelActive]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¡Todo Listo! 🚀</Text>
      <Text style={styles.stepSubtitle}>
        Accede directamente a responder tu Test Cuestionario o compártelo de forma 100% anónima.
      </Text>

      <View style={styles.optionsList}>
        <TouchableOpacity
          style={styles.ctaCardPrimary}
          onPress={() => handleComplete('/questionnaire')}
        >
          <Text style={styles.ctaCardTitle}>📝 Responder Test Cuestionario</Text>
          <Text style={styles.ctaCardDesc}>Responde el test Express (10 preguntas) o Completo (59 ítems) con total privacidad.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCardSecondary}
          onPress={() => handleComplete('/invite')}
        >
          <Text style={styles.ctaCardTitle}>🔗 Compartir Test de Forma Anónima</Text>
          <Text style={styles.ctaCardDesc}>Genera un enlace cifrado o código de invitación sin revelar tus datos personales.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCardGhost}
          onPress={() => handleComplete('/')}
        >
          <Text style={styles.ctaCardGhostTitle}>🏠 Ir al Dashboard Principal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer title="Bienvenido a CompatKink" hideHeader>
      <View style={styles.container}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <NoxHost scene={ONBOARDING_SCENES[step] ?? 'onboarding'} variant="banner" />
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <Button title="Anterior" onPress={handlePrev} variant="secondary" style={styles.navBtn} />
          ) : <View style={{ flex: 1 }} />}

          {step < 2 ? (
            <Button title="Siguiente" onPress={handleNext} variant="primary" style={styles.navBtn} />
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  stepTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  dobRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  roleCard: {
    width: '45%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  roleEmoji: {
    fontSize: 36,
  },
  roleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: colors.primary,
  },
  lockContainer: {
    marginVertical: spacing.md,
  },
  lockIcon: {
    fontSize: 64,
  },
  explanationText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  formContainer: {
    width: '100%',
    gap: spacing.xs,
  },
  formGroup: {
    width: '100%',
    gap: spacing.xs,
  },
  strengthBadge: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textDim,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    width: '100%',
  },
  ctaGrid: {
    gap: spacing.md,
    width: '100%',
  },
  ctaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  ctaEmoji: {
    fontSize: 28,
  },
  ctaTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  ctaDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textDim,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  navBtn: {
    flex: 1,
  },
  noticeCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    width: '100%',
  },
  noticeTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  noticeBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted || '#94a3b8',
    lineHeight: 18,
  },
  optionsList: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
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
    fontFamily: fonts.bodyBold || fonts.bodySemi,
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
  },
  ctaCardGhostTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted || '#94a3b8',
  },
});
