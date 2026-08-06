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
import { colors, fonts, fontSize, radii, spacing, typography, glowShadowPrimary } from '@/constants/theme';

const { width } = Dimensions.get('window');

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
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Step 1 State: Role Selection
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Step 2 State: PIN Creation
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const lockBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step === 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(lockBounceAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(lockBounceAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      lockBounceAnim.stopAnimation();
    }
  }, [step, lockBounceAnim]);

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
    const y = parseInt(birthYear);
    const m = parseInt(birthMonth);
    const d = parseInt(birthDay);

    if (!y || !m || !d || y < 1920 || m < 1 || m > 12 || d < 1 || d > 31) {
      Alert.alert('Fecha inválida', 'Ingresa una fecha de nacimiento válida (AAAA-MM-DD).');
      return false;
    }

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const mDiff = today.getMonth() - birthDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      Alert.alert(
        'Acceso Restringido 🔞',
        'CompatKink es una plataforma exclusiva para personas mayores de 18 años.'
      );
      return false;
    }

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
    if (step < 3) {
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

  // Step 0: Verification Gate P0.5
  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verificación de Edad 🔞</Text>
      <Text style={styles.stepSubtitle}>
        CompatKink procesa datos de contenido íntimo y requiere que confirmes tu mayoría de edad (18+ años).
      </Text>

      <View style={styles.dobRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Día (DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="01"
            placeholderTextColor={colors.textDim}
            keyboardType="numeric"
            maxLength={2}
            value={birthDay}
            onChangeText={setBirthDay}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Mes (MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="08"
            placeholderTextColor={colors.textDim}
            keyboardType="numeric"
            maxLength={2}
            value={birthMonth}
            onChangeText={setBirthMonth}
          />
        </View>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.label}>Año (AAAA)</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            placeholderTextColor={colors.textDim}
            keyboardType="numeric"
            maxLength={4}
            value={birthYear}
            onChangeText={setBirthYear}
          />
        </View>
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
          Confirmo bajo protesta de decir verdad que tengo 18 años o más y acepto la{' '}
          <Text
            style={{ color: colors.primary, textDecorationLine: 'underline' }}
            onPress={() => router.push('/privacy-policy')}
          >
            Política de Privacidad
          </Text>
          .
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Quién eres?</Text>
      <Text style={styles.stepSubtitle}>Selecciona el rol con el que más te identificas para personalizar tu experiencia.</Text>
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
      <Text style={styles.stepTitle}>Tu Bóveda Segura</Text>
      <Text style={styles.stepSubtitle}>Toda tu información se cifra localmente.</Text>
      
      <Animated.View style={[styles.lockContainer, { transform: [{ scale: lockBounceAnim }] }]}>
        <Text style={styles.lockIcon}>🔒</Text>
      </Animated.View>
      
      <Text style={styles.explanationText}>Ni nosotros podemos ver tus datos</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Crea un PIN (4-12 dígitos)</Text>
        <TextInput
          style={styles.input}
          placeholder="••••"
          placeholderTextColor={colors.textDim}
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={12}
        />

        <Text style={styles.label}>Confirma tu PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="••••"
          placeholderTextColor={colors.textDim}
          value={confirmPin}
          onChangeText={setConfirmPin}
          secureTextEntry
          keyboardType="numeric"
          maxLength={12}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tu Primer Paso</Text>
      <Text style={styles.stepSubtitle}>Elige cómo deseas comenzar en CompatKink.</Text>
      <View style={styles.ctaGrid}>
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => handleComplete('/questionnaire')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaEmoji}>📋</Text>
          <Text style={styles.ctaTitle}>Cuestionario Base</Text>
          <Text style={styles.ctaDesc}>Responde tus preferencias íntimas y límites.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => handleComplete('/quick-profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaEmoji}>⚡</Text>
          <Text style={styles.ctaTitle}>Perfil Rápido (2 min)</Text>
          <Text style={styles.ctaDesc}>Configura lo básico y genera una invitación inmediata.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => handleComplete('/manual')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaEmoji}>📖</Text>
          <Text style={styles.ctaTitle}>Explorar Manual</Text>
          <Text style={styles.ctaDesc}>Consulta la guía educacional BDSM y normas de seguridad.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer title="Bienvenido a CompatKink" hideHeader>
      <View style={styles.container}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <Button title="Anterior" onPress={handlePrev} variant="secondary" style={styles.navBtn} />
          ) : <View style={{ flex: 1 }} />}

          {step < 3 ? (
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
});
