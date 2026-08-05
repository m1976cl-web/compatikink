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

  // Step 1 State
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Step 2 State
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const lockBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step === 1) {
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

  const handleNext = () => {
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
    router.replace(route as any);
  };

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
      <Text style={styles.stepSubtitle}>Estás listo para comenzar. ¿Qué deseas hacer primero?</Text>

      <View style={styles.ctaCardsContainer}>
        <TouchableOpacity style={styles.ctaCard} onPress={() => handleComplete('/questionnaire')}>
          <View style={styles.ctaHeader}>
            <Text style={styles.ctaEmoji}>📝</Text>
          </View>
          <Text style={styles.ctaTitle}>Cuestionario Base</Text>
          <Text style={styles.ctaDesc}>Define tus límites y preferencias detalladas.</Text>
          <View style={styles.ctaFooter}>
            <Text style={styles.ctaActionText}>Empezar ➔</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaCard} onPress={() => handleComplete('/quick-profile')}>
          <View style={styles.ctaHeader}>
            <Text style={styles.ctaEmoji}>⚡</Text>
          </View>
          <Text style={styles.ctaTitle}>Perfil Rápido (2 min)</Text>
          <Text style={styles.ctaDesc}>Crea un perfil básico para explorar rápidamente.</Text>
          <View style={styles.ctaFooter}>
            <Text style={styles.ctaActionText}>Crear ➔</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaCard} onPress={() => handleComplete('/manual')}>
          <View style={styles.ctaHeader}>
            <Text style={styles.ctaEmoji}>📖</Text>
          </View>
          <Text style={styles.ctaTitle}>Explorar Manual</Text>
          <Text style={styles.ctaDesc}>Lee la guía de uso de Compatikink.</Text>
          <View style={styles.ctaFooter}>
            <Text style={styles.ctaActionText}>Leer ➔</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer title="" hideHeader style={styles.container}>
      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.animatedSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navBtn, step === 0 && styles.navBtnHidden]}
            onPress={handlePrev}
            disabled={step === 0}
          >
            <Text style={styles.navBtnText}>Anterior</Text>
          </TouchableOpacity>

          {step < 2 ? (
            <TouchableOpacity style={styles.navBtnPrimary} onPress={handleNext}>
              <Text style={styles.navBtnPrimaryText}>Siguiente</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtnPlaceholder} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  animatedSection: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.hero,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: Platform.OS === 'web' && width > 600 ? '45%' : '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
    ...glowShadowPrimary(0.2),
  },
  roleEmoji: {
    fontSize: 48,
  },
  roleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  roleLabelActive: {
    color: colors.primary,
  },
  lockContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  lockIcon: {
    fontSize: 48,
  },
  explanationText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: -4,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    textAlign: 'center',
    letterSpacing: 2,
  },
  ctaCardsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    width: '100%',
  },
  ctaHeader: {
    marginBottom: spacing.xs,
  },
  ctaEmoji: {
    fontSize: 28,
  },
  ctaTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontFamily: fonts.bodyBold,
    marginBottom: spacing.xs,
  },
  ctaDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  ctaFooter: {
    alignItems: 'flex-start',
  },
  ctaActionText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontFamily: fonts.bodyBold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  navBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  navBtnHidden: {
    opacity: 0,
  },
  navBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  navBtnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
  },
  navBtnPrimaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: colors.onPrimary,
  },
  navBtnPlaceholder: {
    width: 100,
  },
});
