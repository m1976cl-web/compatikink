/**
 * OctopusHost.tsx — Nox el Kraken de las Profundidades
 *
 * Mejora #11: Animación de bienvenida spring al montar el componente.
 * Nox aparece con un efecto de surgir desde las profundidades (translateY + scale + opacity),
 * seguido de un rebote spring que da sensación de peso y presencia.
 * Los tentáculos flotan de forma autónoma con desfases de fase.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Easing,
} from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

const MYSTERIOUS_QUOTES = [
  '"He estado observando tus preferencias... ¿Te atreves a llevar la exploración un paso más allá?"',
  '"En las profundidades del consentimiento, los secretos más oscuros se convierten en placer consciente."',
  '"Tus límites duros están a salvo conmigo... pero tu curiosidad no tiene fronteras."',
  '"¿Ya preparaste tu ritual de aftercare hoy? La seguridad es el afrodisíaco supremo."',
  '"Mis tentáculos sostienen tu Bóveda encriptada. Nadie más podrá mirar jamás."',
  '"Bienvenido/a de vuelta... dime, ¿qué secreto o fantasía exploraremos juntos esta noche?"',
  '"El consentimiento es la única magia que necesito para sumergirte en mis profundidades."',
  '"Cada fantasía que escribes aquí queda sellada con AES-GCM. Sólo tú tienes la llave."',
];

/** Tentáculo flotante — pequeña pastilla animada que orbita con su propia fase */
function Tentacle({ delay, angle, distance, color }: {
  delay: number;
  angle: number;
  distance: number;
  color: string;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in con retraso individual
    setTimeout(() => {
      Animated.timing(opacAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: 1, duration: 2000 + delay * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 2000 + delay * 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);

  const rad     = (angle * Math.PI) / 180;
  const baseX   = Math.cos(rad) * distance;
  const baseY   = Math.sin(rad) * distance;
  const floatY  = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        opacity: opacAnim,
        transform: [
          { translateX: baseX },
          { translateY: Animated.add(new Animated.Value(baseY), floatY) },
        ],
      }}
    >
      <View style={{ width: 14, height: 5, borderRadius: 4, backgroundColor: color, opacity: 0.7 }} />
    </Animated.View>
  );
}

export function OctopusHost() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  // ── Animación de entrada spring (#11) ─────────────────────────────────────
  const entryScale   = useRef(new Animated.Value(0.3)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryY       = useRef(new Animated.Value(30)).current;

  // ── Animaciones de idle ───────────────────────────────────────────────────
  const breathAnim = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.5)).current;
  const rotAnim    = useRef(new Animated.Value(0)).current; // leve meneo
  const fadeAnim   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrada spring: Nox surge desde las profundidades
    Animated.parallel([
      Animated.spring(entryScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(entryY, {
        toValue: 0,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Después de entrar, inicia animaciones de idle
    const idleDelay = setTimeout(() => {
      // Respiración del avatar
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, { toValue: 1.07, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();

      // Pulso del anillo de glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();

      // Meneo sutil de Nox (rotación ±2°)
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotAnim, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rotAnim, { toValue: -1, duration: 3500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 500);

    return () => clearTimeout(idleDelay);
  }, []);

  const handleNextQuote = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setQuoteIdx((prev) => (prev + 1) % MYSTERIOUS_QUOTES.length);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const rotDeg = rotAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-2deg', '2deg'] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entryOpacity,
          transform: [
            { scale: entryScale },
            { translateY: entryY },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.octopusAvatarBtn} onPress={handleNextQuote} activeOpacity={0.8}>
        {/* Tentáculos flotantes — 8 direcciones */}
        <View style={styles.tentacleLayer}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <Tentacle
              key={angle}
              angle={angle}
              distance={44}
              delay={i * 180}
              color={i % 2 === 0 ? colors.primary : colors.neonPink}
            />
          ))}
        </View>

        {/* Avatar con respiración y meneo */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [
                { scale: breathAnim },
                { rotate: rotDeg },
              ],
              opacity: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1] }),
            },
          ]}
        >
          <Image
            source={require('@/assets/images/nox_octopus.jpg')}
            style={styles.octopusImg}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Badge NOX con rebote suave */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NOX</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.speechBubble} onPress={handleNextQuote} activeOpacity={0.9}>
        <Text style={styles.hostName}>Nox, el Kraken de las Profundidades</Text>
        <Animated.Text style={[styles.quoteText, { opacity: fadeAnim }]}>
          {MYSTERIOUS_QUOTES[quoteIdx]}
        </Animated.Text>
        <Text style={styles.tapHint}>Toca para escuchar más... 👁️</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(19, 9, 36, 0.85)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tentacleLayer: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  octopusAvatarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 80,
    height: 88,
  },
  glowRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0a0612',
    borderWidth: 2.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.neonPink,
    shadowRadius: 14,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
  },
  octopusImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -10,
    alignSelf: 'center',
  },
  badgeText: {
    color: '#07050a',
    fontSize: 9,
    fontFamily: fonts.bodySemi,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 46, 0.7)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.2)',
    gap: 6,
  },
  hostName: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  quoteText: {
    color: colors.text,
    fontFamily: fonts.displayRegular,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tapHint: {
    color: colors.textDim,
    fontSize: 9,
    fontFamily: fonts.body,
    fontWeight: '600',
    marginTop: 2,
  },
});
