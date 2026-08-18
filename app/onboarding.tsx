import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import type { NoxSceneId } from '@/components/nox';
import { colors, radii, spacing } from '@/constants/theme';
import { saveProfile } from '@/lib/storage';

import { OnboardingStepPrivacy } from '@/components/onboarding/OnboardingStepPrivacy';
import { OnboardingStepProfile } from '@/components/onboarding/OnboardingStepProfile';
import { OnboardingStepPaths } from '@/components/onboarding/OnboardingStepPaths';

const { width } = Dimensions.get('window');
const ONBOARDING_SCENES: NoxSceneId[] = ['onboarding', 'auth', 'home'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userProfileData, setUserProfileData] = useState<any>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (nextStep: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    });
  };

  const handlePrivacyNext = () => {
    animateTransition(1);
  };

  const handleProfileNext = (profile: any) => {
    setUserProfileData(profile);
    animateTransition(2);
  };

  const handleSelectPath = async (routePath: string, mode?: string) => {
    try {
      if (userProfileData) {
        await saveProfile({
          nickname: userProfileData.nickname,
          notes: 'Perfil creado en onboarding',
          baseResponses: [],
          experienceLevel: userProfileData.experience?.toLowerCase() || 'beginner',
          pronouns: userProfileData.pronoun || 'Otro',
          // You could map roles and tags here as needed
        });
      }

      await AsyncStorage.setItem('compatikink_onboarding_complete_v1', 'true');
      await AsyncStorage.setItem('compatikink_age_verified_v1', 'true');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (mode) {
        router.replace(`${routePath}?mode=${mode}` as any);
      } else {
        router.replace(routePath as any);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al guardar el perfil.');
    }
  };

  return (
    <ScreenContainer title="Bienvenido a CompatKink" hideHeader>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${((step + 1) / 3) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.noxContainer}>
              <NoxHost scene={ONBOARDING_SCENES[step] ?? 'onboarding'} variant="banner" />
            </View>
            {step === 0 && <OnboardingStepPrivacy onNext={handlePrivacyNext} />}
            {step === 1 && <OnboardingStepProfile onNext={handleProfileNext} />}
            {step === 2 && <OnboardingStepPaths onSelectPath={handleSelectPath} />}
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  contentContainer: {
    flex: 1,
  },
  noxContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
