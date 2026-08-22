/**
 * OnboardingFlow Component
 * Three-step guided flow: Responde → Invita → Lee Reporte
 *
 * Features:
 * - Visual stepper with progress tracking
 * - Contextual CTAs for each step
 * - Estimated time display
 * - Celebration on completion
 */

import React, { useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Box,
  Pressable,
  useTheme,
} from 'native-base';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../stores/homeStore';

export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingFlowProps {
  /**
   * Current step (1-3)
   */
  currentStep?: OnboardingStep;
  /**
   * Completion percentages per step (for progress bar)
   */
  stepProgress?: Record<OnboardingStep, number>;
  /**
   * Optional callback when user completes flow
   */
  onFlowComplete?: () => void;
  /**
   * Optional callback to move to next step
   */
  onNextStep?: (step: OnboardingStep) => void;
}

interface StepConfig {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  estimatedTime: string;
  cta: string;
  route: string;
  completed: boolean;
}

/**
 * Main OnboardingFlow component
 */
export function OnboardingFlow({
  currentStep = 1,
  stepProgress = { 1: 0, 2: 0, 3: 0 },
  onFlowComplete,
  onNextStep,
}: OnboardingFlowProps) {
  const router = useRouter();
  const theme = useTheme();

  // Get state from store
  const userVault = useAppStore((s) => s.userVault);
  const currentSession = useAppStore((s) => s.currentSession);
  const hasQuestionnaireResponse = useAppStore((s) =>
    s.responses?.some((r) => r.session_id === currentSession?.id)
  );

  const steps: StepConfig[] = useMemo(
    () => [
      {
        step: 1,
        title: 'Responde',
        subtitle: 'Cuestionario de compatibilidad',
        icon: '📋',
        description:
          'Completa el cuestionario sobre tus preferencias y límites.',
        estimatedTime: '15–20 min',
        cta: 'Comenzar cuestionario',
        route: '/questionnaire',
        completed: !!hasQuestionnaireResponse,
      },
      {
        step: 2,
        title: 'Invita',
        subtitle: 'Genera código para tu pareja',
        icon: '🔗',
        description:
          'Crea un código secreto para que tu pareja responda de forma ciega.',
        estimatedTime: '< 1 min',
        cta: 'Generar código',
        route: '/invite',
        completed: !!currentSession?.guest_id,
      },
      {
        step: 3,
        title: 'Reporte',
        subtitle: 'Ver coincidencias',
        icon: '📊',
        description:
          'Descubre las coincidencias mutuas y lee la guía de conversación.',
        estimatedTime: '10 min',
        cta: 'Ver reporte',
        route: '/report',
        completed:
          !!currentSession?.report_generated &&
          currentSession?.phase === 'completed',
      },
    ],
    [hasQuestionnaireResponse, currentSession]
  );

  const activeStep = steps.find((s) => s.step === currentStep) || steps[0];
  const completedCount = steps.filter((s) => s.completed).length;
  const overallProgress = completedCount / steps.length;

  const handleCTA = () => {
    if (onNextStep) {
      onNextStep(currentStep);
    }
    router.push(activeStep.route as any);
  };

  const handleStepPress = (step: OnboardingStep) => {
    if (onNextStep) {
      onNextStep(step);
    }
    const targetRoute = steps.find((s) => s.step === step)?.route;
    if (targetRoute) {
      router.push(targetRoute as any);
    }
  };

  return (
    <VStack space="lg" width="100%">
      {/* Header: Overall Progress */}
      <VStack space="sm">
        <HStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={theme.colors.text}
          >
            Tu flujo de compatibilidad
          </Text>
          <Text fontSize="sm" color={theme.colors.muted}>
            {completedCount} de {steps.length} completos
          </Text>
        </HStack>
        <Progress
          value={overallProgress * 100}
          height="8"
          borderRadius="full"
          _filledTrack={{
            bg: `${theme.colors.emerald[500]}`,
          }}
          _bar={{
            bg: theme.colors.emerald[600],
          }}
        />
      </VStack>

      {/* Stepper Cards */}
      <VStack space="md">
        {steps.map((step, index) => {
          const isActive = step.step === currentStep;
          const isCompleted = step.completed;

          return (
            <Pressable
              key={step.step}
              onPress={() => handleStepPress(step.step)}
              opacity={isActive ? 1 : 0.7}
            >
              <Box
                borderWidth={isActive ? 2 : 1}
                borderColor={
                  isActive
                    ? theme.colors.primary[500]
                    : isCompleted
                      ? theme.colors.success[500]
                      : theme.colors.gray[300]
                }
                borderRadius="lg"
                p="md"
                bg={
                  isActive
                    ? theme.colors.primary[50]
                    : isCompleted
                      ? theme.colors.success[50]
                      : theme.colors.gray[50]
                }
              >
                <HStack space="md" alignItems="flex-start">
                  {/* Step Icon + Number */}
                  <VStack
                    width="10"
                    height="10"
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                    bg={
                      isActive
                        ? theme.colors.primary[500]
                        : isCompleted
                          ? theme.colors.success[500]
                          : theme.colors.gray[400]
                    }
                  >
                    {isCompleted ? (
                      <Text fontSize="lg" color="white">
                        ✓
                      </Text>
                    ) : (
                      <Text
                        fontSize="lg"
                        color="white"
                        fontWeight="bold"
                      >
                        {step.step}
                      </Text>
                    )}
                  </VStack>

                  {/* Content */}
                  <VStack flex={1} space="xs">
                    <HStack justifyContent="space-between">
                      <VStack flex={1}>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color={theme.colors.text}
                        >
                          {step.icon} {step.title}
                        </Text>
                        <Text fontSize="sm" color={theme.colors.muted}>
                          {step.subtitle}
                        </Text>
                      </VStack>
                    </HStack>

                    <Text fontSize="sm" color={theme.colors.muted}>
                      {step.description}
                    </Text>

                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      mt="2"
                    >
                      <Text fontSize="xs" color={theme.colors.muted}>
                        ⏱️ {step.estimatedTime}
                      </Text>
                      {isActive && (
                        <Progress
                          value={stepProgress[step.step] * 100}
                          size="xs"
                          width="20"
                          height="2"
                          borderRadius="full"
                          _filledTrack={{
                            bg: theme.colors.primary[400],
                          }}
                        />
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            </Pressable>
          );
        })}
      </VStack>

      {/* Active Step CTA */}
      {!activeStep.completed ? (
        <Button
          size="lg"
          colorScheme="primary"
          onPress={handleCTA}
          width="100%"
          mt="md"
        >
          {activeStep.cta}
        </Button>
      ) : currentStep < 3 ? (
        <Button
          size="lg"
          variant="outline"
          colorScheme="primary"
          onPress={() => handleStepPress((currentStep + 1) as OnboardingStep)}
          width="100%"
          mt="md"
        >
          Siguiente: {steps[currentStep]?.title}
        </Button>
      ) : (
        <Box
          borderWidth={2}
          borderColor={theme.colors.success[500]}
          borderRadius="lg"
          p="md"
          bg={theme.colors.success[50]}
          alignItems="center"
        >
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={theme.colors.success[600]}
          >
            🎉 ¡Flujo completo!
          </Text>
          <Text fontSize="sm" color={theme.colors.muted} mt="2">
            Ya tienen un reporte. Ahora a disfrutar juntos 😊
          </Text>
        </Box>
      )}

      {/* Help Footer */}
      <Text fontSize="xs" color={theme.colors.muted} textAlign="center">
        Toca en cualquier paso para navegar
      </Text>
    </VStack>
  );
}

/**
 * Minimal horizontal stepper (for headers/status bars)
 */
export function OnboardingStepperMini({
  currentStep = 1,
  onStepPress,
}: {
  currentStep?: OnboardingStep;
  onStepPress?: (step: OnboardingStep) => void;
}) {
  const theme = useTheme();

  return (
    <HStack space="2" justifyContent="center">
      {[1, 2, 3].map((step) => (
        <Pressable
          key={step}
          onPress={() => onStepPress?.(step as OnboardingStep)}
        >
          <Box
            width="8"
            height="8"
            borderRadius="full"
            bg={
              step <= currentStep
                ? theme.colors.primary[500]
                : theme.colors.gray[300]
            }
            opacity={step === currentStep ? 1 : 0.5}
          />
        </Pressable>
      ))}
    </HStack>
  );
}
