import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Image, Easing } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

const MYSTERIOUS_QUOTES = [
  '"He estado observando tus preferencias... ¿Te atreves a llevar la exploración un paso más allá?"',
  '"En las profundidades del consentimiento, los secretos más oscuros se convierten en placer consciente."',
  '"Tus límites duros están a salvo conmigo... pero tu curiosidad no tiene fronteras."',
  '"¿Ya preparaste tu ritual de aftercare hoy? La seguridad es el afrodisíaco supremo."',
  '"Mis tentáculos sostienen tu Bóveda encriptada. Nadie más podrá mirar jamás."',
  '"Bienvenido/a de vuelta... dime, ¿qué secreto o fantasía exploraremos juntos esta noche?"',
];

export function OctopusHost() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const breathAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing pulse on avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.06,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow ring pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNextQuote = () => {
    // Fade out, switch, fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setQuoteIdx((prev) => (prev + 1) % MYSTERIOUS_QUOTES.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.octopusAvatarBtn} onPress={handleNextQuote} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: breathAnim }],
              opacity: glowAnim.interpolate({
                inputRange: [0.4, 1],
                outputRange: [0.85, 1],
              }),
            },
          ]}
        >
          <Image
            source={require('@/assets/images/nox_octopus.jpg')}
            style={styles.octopusImg}
            resizeMode="cover"
          />
        </Animated.View>
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
    </View>
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
  octopusAvatarBtn: {
    alignItems: 'center',
    position: 'relative',
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
