/**
 * VaultLockGate.tsx — Mejora #14
 *
 * Animaciones añadidas:
 * - Entrada del formulario PIN con spring (scale + opacity + translateY)
 * - Pulsación del ícono de candado al estar bloqueado
 * - Shake animation en error de PIN
 * - Transición fadeOut al desbloquear exitosamente
 * - Partículas de brillo al desbloquear (efecto burst neon)
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { triggerHaptic } from '@/lib/haptics';

export interface VaultLockGateProps {
  unlocked?: boolean;
  onUnlock?: (pin: string) => void | Promise<void>;
  onLock?: () => void | Promise<void>;
  unlockWithPin?: (pin: string) => Promise<boolean>;
  nickname?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  showLockButton?: boolean;
}

/** Shake horizontal — feedback de error en PIN incorrecto */
function useShake() {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const trigger = () => {
    triggerHaptic.error();
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  return { shakeAnim, trigger };
}

/** Partícula de brillo individual para el burst al desbloquear */
function GlowParticle({ index, trigger }: { index: number; trigger: boolean }) {
  const anim  = useRef(new Animated.Value(0)).current;
  const angle = (index / 8) * Math.PI * 2;
  const dist  = 55 + index * 5;

  useEffect(() => {
    if (!trigger) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 30,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [trigger]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0] });
  const scale      = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1.2, 0.3] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
          backgroundColor: index % 2 === 0 ? colors.primary : colors.neonPink,
        },
      ]}
    />
  );
}

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
  const [pin,   setPin]   = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy,  setBusy]  = useState(false);
  const [unlockBurst, setUnlockBurst] = useState(false);
  const [snap,  setSnap]  = useState<VaultSessionSnapshot>(() => VaultLockGateAPI.getSnapshot());

  // ── Animaciones ───────────────────────────────────────────────────────────
  // Entrada del formulario PIN (spring)
  const formScale   = useRef(new Animated.Value(0.85)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY       = useRef(new Animated.Value(20)).current;

  // Pulso del candado
  const lockPulse   = useRef(new Animated.Value(1)).current;

  // Fade del contenedor al desbloquear
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const { shakeAnim, trigger: triggerShake } = useShake();

  useEffect(() => {
    const unsub = VaultLockGateAPI.subscribe(setSnap);
    return unsub;
  }, []);

  // Animación de entrada cuando se muestra el gate (bloqueado)
  const isOpen = typeof unlockedProp === 'boolean' ? unlockedProp : snap.unlocked;

  useEffect(() => {
    if (!isOpen) {
      // Resetear y animar entrada
      formScale.setValue(0.85);
      formOpacity.setValue(0);
      formY.setValue(20);
      containerOpacity.setValue(1);

      Animated.parallel([
        Animated.spring(formScale, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(formY, { toValue: 0, tension: 65, friction: 8, useNativeDriver: true }),
      ]).start();

      // Pulso del candado (loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(lockPulse, { toValue: 1.12, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(lockPulse, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    } else {
      lockPulse.stopAnimation();
    }
  }, [isOpen]);

  const handleUnlock = async () => {
    const trimmed = pin.trim();
    if (trimmed.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos.');
      triggerShake();
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
        if (!nick) { setError('No hay perfil activo.'); return; }
        const profile = (await getProfile(nick)) || current;
        if (!profile) { setError('Perfil no encontrado.'); return; }
        await unlockVaultForProfile(nick, trimmed, profile);
        ok = true;
      }
      if (!ok) {
        setError('PIN incorrecto.');
        setPin('');
        triggerShake();
        return;
      }
      // ── Burst al desbloquear ──────────────────────────────────────────────
      triggerHaptic.success();
      setUnlockBurst(true);
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        delay: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
      setTimeout(() => setUnlockBurst(false), 800);

      setPin('');
      await onUnlock?.(trimmed);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo desbloquear.';
      setError(message);
      setPin('');
      triggerShake();
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
    <Animated.View
      style={[styles.gate, style, { opacity: containerOpacity }]}
      accessibilityRole="none"
    >
      {/* Partículas de desbloqueado */}
      <View style={styles.particleContainer} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <GlowParticle key={i} index={i} trigger={unlockBurst} />
        ))}
      </View>

      <Animated.View
        style={[
          styles.formWrap,
          {
            opacity: formOpacity,
            transform: [
              { scale: formScale },
              { translateY: formY },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        {/* Ícono candado pulsante */}
        <Animated.Text
          style={[styles.lockIcon, { transform: [{ scale: lockPulse }] }]}
        >
          🔐
        </Animated.Text>

        <Text style={styles.brandMark}>Compatikink</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={(t) => { setPin(t.replace(/[^\d]/g, '')); setError(null); }}
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
      </Animated.View>
    </Animated.View>
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
    overflow: 'hidden',
    ...elevationSoft(),
  },
  particleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  formWrap: {
    width: '100%',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 42,
    marginBottom: spacing.sm,
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
    width: '100%',
  },
  lockBarLabel: {
    ...typography.label,
    color: colors.success,
  },
});
