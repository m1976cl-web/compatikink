import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Button } from '@/components/Button';
import {
  colors,
  elevationSoft,
  fonts,
  fontSize,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import {
  VaultLockGateAPI,
  unlockVaultForProfile,
  type VaultSessionSnapshot,
} from '@/lib/cryptoVault';
import { getCurrentProfile, getProfile } from '@/lib/storage';

export interface VaultLockGateProps {
  /** Controlled unlock override. Defaults to VaultLockGateAPI.isUnlocked(). */
  unlocked?: boolean;
  /** Called after a successful unlock. */
  onUnlock?: (pin: string) => void | Promise<void>;
  /** Called when user locks again (if lock control is shown). */
  onLock?: () => void | Promise<void>;
  /**
   * Custom unlock — return true if PIN ok.
   * When omitted, unlocks the current profile vault via unlockVaultForProfile.
   */
  unlockWithPin?: (pin: string) => Promise<boolean>;
  /** Optional nickname override when unlocking without a logged-in profile. */
  nickname?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  showLockButton?: boolean;
}

/**
 * UI shell for the Zero-Knowledge vault gate.
 * Wired to VaultLockGateAPI (subscribe / lock / isUnlocked) + unlockVaultForProfile.
 */
export function VaultLockGate({
  unlocked: unlockedProp,
  onUnlock,
  onLock,
  unlockWithPin,
  nickname: nicknameProp,
  title = 'Bóveda',
  subtitle = 'Introduce tu PIN para descifrar datos sensibles en este dispositivo. La clave no sale de la memoria de la sesión.',
  children,
  style,
  showLockButton = false,
}: VaultLockGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [snap, setSnap] = useState<VaultSessionSnapshot>(() => VaultLockGateAPI.getSnapshot());

  useEffect(() => {
    return VaultLockGateAPI.subscribe(setSnap);
  }, []);

  const isOpen = typeof unlockedProp === 'boolean' ? unlockedProp : snap.unlocked;

  const handleUnlock = async () => {
    const trimmed = pin.trim();
    if (trimmed.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let ok = false;

      if (unlockWithPin) {
        ok = await unlockWithPin(trimmed);
      } else {
        const current = await getCurrentProfile();
        const nick = nicknameProp || current?.nickname || VaultLockGateAPI.getNickname();
        if (!nick) {
          setError('No hay perfil activo. Inicia sesión o crea un perfil con PIN.');
          return;
        }
        const profile = (await getProfile(nick)) || current;
        if (!profile) {
          setError('Perfil no encontrado.');
          return;
        }
        await unlockVaultForProfile(nick, trimmed, profile);
        ok = true;
      }

      if (!ok) {
        setError('PIN incorrecto.');
        setPin('');
        return;
      }

      setPin('');
      await onUnlock?.(trimmed);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo desbloquear la bóveda.';
      setError(message);
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  const handleLock = async () => {
    setBusy(true);
    try {
      VaultLockGateAPI.lock();
      setPin('');
      await onLock?.();
    } finally {
      setBusy(false);
    }
  };

  if (isOpen) {
    return (
      <View style={style}>
        {showLockButton ? (
          <View style={styles.lockBar}>
            <Text style={styles.lockBarLabel}>Bóveda abierta</Text>
            <Button title="Bloquear" onPress={handleLock} variant="ghost" disabled={busy} />
          </View>
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.gate, style]} accessibilityRole="none">
      <Text style={styles.brandMark}>Compatikink</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TextInput
        style={styles.pinInput}
        value={pin}
        onChangeText={(t) => {
          setPin(t.replace(/[^\d]/g, ''));
          setError(null);
        }}
        placeholder="••••"
        placeholderTextColor={colors.textDim}
        keyboardType="numeric"
        secureTextEntry
        maxLength={12}
        editable={!busy}
        accessibilityLabel="PIN de la bóveda"
        onSubmitEditing={handleUnlock}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {busy ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
      ) : (
        <Button title="Desbloquear" onPress={handleUnlock} style={styles.btn} />
      )}

      <Text style={styles.footnote}>
        Cifrado local AES-GCM con PBKDF2. El servidor solo ve ciphertext opaco.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    ...elevationSoft(),
  },
  brandMark: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: fontSize.sm,
  },
  pinInput: {
    width: '100%',
    backgroundColor: colors.backgroundMid,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    marginTop: spacing.xs,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },
  lockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  lockBarLabel: {
    ...typography.label,
    color: colors.success,
  },
});
