/**
 * Integration Example: Login with Rate Limiting & Error Handling
 *
 * This demonstrates how to use the new H1 modules together:
 * - Rate limiting (brute force protection)
 * - Error modal (unified UI)
 * - Express questionnaire (after successful auth)
 *
 * Copy this pattern to other auth flows (PIN unlock, invite code, etc).
 */

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  useTheme,
} from 'native-base';
import { useRouter } from 'expo-router';

import { checkRateLimit, RateLimitError } from '../../lib/rateLimiting';
import { resolveError } from '../../lib/errorHandler';
import { ErrorModal, useErrorModal } from '../../components/ErrorModal';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../stores/homeStore';

export function LoginScreenExample() {
  const router = useRouter();
  const theme = useTheme();
  const { error, showError, hideError } = useErrorModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Check rate limit (10 attempts per 15 minutes)
      // Identifier: IP (client-side we use device ID as proxy)
      const deviceId = await useAppStore((s) => s.deviceId);
      await checkRateLimit('login', deviceId);

      // Step 2: Attempt login via Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('No user returned from auth');
      }

      // Step 3: Success! Store session and navigate
      useAppStore.setState({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        isAuthenticated: true,
      });

      // Step 4: Route to questionnaire or home
      router.replace('/(tabs)/home');
    } catch (err) {
      // Step 5: Handle error with unified modal
      if (err instanceof RateLimitError) {
        showError(err);
      } else if (err instanceof Error) {
        if (err.message.includes('invalid login credentials')) {
          showError('Correo o contraseña incorrectos');
        } else if (err.message.includes('network')) {
          showError(
            new Error('NETWORK_TIMEOUT') // Will map to network error
          );
        } else {
          showError(err);
        }
      } else {
        showError(new Error('Login failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack space="lg" width="100%" px="4" py="8">
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color={theme.colors.text}
      >
        Inicia sesión
      </Text>

      <VStack space="md">
        <Input
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          size="lg"
          isDisabled={isLoading}
          _disabled={{ opacity: 0.5 }}
        />

        <Input
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          type="password"
          size="lg"
          isDisabled={isLoading}
          _disabled={{ opacity: 0.5 }}
        />
      </VStack>

      <Button
        size="lg"
        colorScheme="primary"
        onPress={handleLogin}
        isDisabled={isLoading}
        isLoading={isLoading}
        width="100%"
      >
        {isLoading ? <Spinner color="white" /> : 'Inicia sesión'}
      </Button>

      <HStack justifyContent="center" space="2">
        <Text color={theme.colors.muted}>¿Sin cuenta?</Text>
        <Button
          variant="ghost"
          colorScheme="primary"
          onPress={() => router.push('/auth/signup')}
          isDisabled={isLoading}
        >
          Regístrate
        </Button>
      </HStack>

      {/* Unified Error Modal */}
      <ErrorModal
        error={error}
        onDismiss={hideError}
        onRetry={handleLogin}
      />
    </VStack>
  );
}

/**
 * PIN Unlock Example
 * Demonstrates rate limiting on vault unlock with aggressive limits
 */
export function VaultUnlockExample() {
  const theme = useTheme();
  const { error, showError, hideError } = useErrorModal();

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleUnlock = async () => {
    setIsLoading(true);

    try {
      // Rate limit: 3 attempts per minute (aggressive for security)
      await checkRateLimit('decrypt_attempt', 'device_vault');

      // TODO: Decrypt vault with PIN
      // const vault = await decryptVault(pin);

      // Success
      setPin('');
      setAttemptCount(0);
      // Navigate or update UI
    } catch (err) {
      if (err instanceof RateLimitError) {
        showError(err);
        // UI will show countdown
      } else if (err instanceof Error) {
        if (err.message.includes('incorrect')) {
          setAttemptCount((c) => c + 1);
          showError(
            new Error(`PIN incorrecto. Te quedan ${3 - attemptCount} intentos.`)
          );
        } else {
          showError(err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack space="lg" width="100%" alignItems="center">
      <Text fontSize="lg" fontWeight="bold" color={theme.colors.text}>
        Desbloquea tu bóveda
      </Text>

      <Input
        placeholder="PIN (6+ dígitos)"
        value={pin}
        onChangeText={setPin}
        type="password"
        keyboardType="number-pad"
        size="lg"
        width="32"
        textAlign="center"
        fontSize="2xl"
        letterSpacing="4"
        isDisabled={isLoading}
      />

      <Button
        size="lg"
        colorScheme="primary"
        onPress={handleUnlock}
        isDisabled={isLoading}
        isLoading={isLoading}
        width="100%"
      >
        Desbloquear
      </Button>

      <ErrorModal
        error={error}
        onDismiss={hideError}
        onRetry={handleUnlock}
      />
    </VStack>
  );
}

/**
 * Invite Code Validation Example
 * Demonstrates rate limiting on invite code guessing
 */
export async function validateInviteCode(
  code: string,
  sessionId: string
): Promise<boolean> {
  try {
    // Rate limit: 5 attempts per hour per session
    await checkRateLimit('invite_guess', sessionId);

    // TODO: Validate code against Supabase
    // const { data, error } = await supabase
    //   .from('sessions')
    //   .select('*')
    //   .eq('invite_code', code)
    //   .single();

    return true; // if valid
  } catch (err) {
    if (err instanceof RateLimitError) {
      throw err; // Let caller handle rate limit display
    }
    throw err;
  }
}

/**
 * Post-Login Flow with Express Questionnaire
 * Shows how OnboardingFlow guides user through steps
 */
export function PostLoginFlowExample() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <VStack space="lg" width="100%">
      <Text fontSize="xl" fontWeight="bold" color={theme.colors.text}>
        Bienvenido a CompatKink 🔐
      </Text>

      <Text color={theme.colors.muted}>
        Sigue estos 3 pasos para conectar con tu pareja:
      </Text>

      <Box
        borderWidth={1}
        borderColor={theme.colors.primary[200]}
        borderRadius="lg"
        p="4"
        bg={theme.colors.primary[50]}
      >
        <Text fontSize="md" fontWeight="bold" mb="2">
          ✅ Importado: OnboardingFlow
        </Text>
        <Text fontSize="sm" color={theme.colors.muted}>
          El componente OnboardingFlow ya está integrado en home.
          Muestra los 3 pasos: Responde → Invita → Reporte
        </Text>
      </Box>

      <Button
        size="lg"
        colorScheme="primary"
        onPress={() => router.push('/(tabs)/home')}
        width="100%"
      >
        Ir a Home
      </Button>
    </VStack>
  );
}
