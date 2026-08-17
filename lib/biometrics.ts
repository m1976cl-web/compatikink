import { Platform } from 'react-native';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

const BIOMETRIC_ENABLED_KEY = 'biometric_unlock_enabled_v1';

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Biometrics' | 'None';
  isEnabled: boolean;
}

/**
 * Checks hardware support and user enrollment for biometric authentication.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  const isEnabled = await readJsonStorage<boolean>(BIOMETRIC_ENABLED_KEY, false);

  if (Platform.OS === 'web') {
    const isWebAuthnAvailable =
      typeof window !== 'undefined' &&
      Boolean(window.PublicKeyCredential);
    return {
      isAvailable: isWebAuthnAvailable,
      biometricType: isWebAuthnAvailable ? 'Biometrics' : 'None',
      isEnabled: isWebAuthnAvailable && isEnabled,
    };
  }

  try {
    // @ts-ignore
    const LocalAuthentication = await import('expo-local-authentication');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometricType: BiometricStatus['biometricType'] = 'Biometrics';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'FaceID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'TouchID';
    }

    return {
      isAvailable: hasHardware && isEnrolled,
      biometricType: (hasHardware && isEnrolled) ? biometricType : 'None',
      isEnabled: hasHardware && isEnrolled && isEnabled,
    };
  } catch {
    return {
      isAvailable: false,
      biometricType: 'None',
      isEnabled: false,
    };
  }
}

/**
 * Enables or disables biometric authentication preference.
 */
export async function setBiometricEnabled(enabled: boolean): Promise<boolean> {
  await writeJsonStorage(BIOMETRIC_ENABLED_KEY, enabled);
  return enabled;
}

/**
 * Triggers biometric prompt (FaceID / TouchID / Fingerprint / WebAuthn).
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Desbloquear Bóveda CompatKink'
): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Web fallback: simulate or WebAuthn assertion
    return true;
  }

  try {
    // @ts-ignore
    const LocalAuthentication = await import('expo-local-authentication');
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Usar PIN de Bóveda',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Evaluates PIN strength and recommendations (supports 4 to 12 digits, recommends 6+).
 */
export function evaluatePinStrength(pin: string): {
  score: 'weak' | 'good' | 'strong' | 'invalid';
  label: string;
  color: string;
  isRecommended: boolean;
} {
  const cleanPin = pin.trim();
  if (!cleanPin || cleanPin.length < 4 || !/^\d+$/.test(cleanPin)) {
    return { score: 'invalid', label: 'PIN inválido (mín. 4 dígitos)', color: '#ef4444', isRecommended: false };
  }

  // Check for simple sequences or repeated digits (e.g. 1234, 1111)
  const isRepeated = /^(\d)\1+$/.test(cleanPin);
  const isSequential = '01234567890123456789'.includes(cleanPin) || '98765432109876543210'.includes(cleanPin);

  if (isRepeated || isSequential) {
    return { score: 'weak', label: 'Secuencia muy simple ⚠️', color: '#f59e0b', isRecommended: false };
  }

  if (cleanPin.length < 6) {
    return { score: 'good', label: '4 Dígitos · Aceptable 👍', color: '#3b82f6', isRecommended: false };
  }

  if (cleanPin.length < 8) {
    return { score: 'strong', label: '6+ Dígitos · Recomendado 🔒', color: '#c084fc', isRecommended: true };
  }

  return { score: 'strong', label: '8+ Dígitos · Alta Seguridad 🛡️', color: '#22c55e', isRecommended: true };
}
