import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

const MYSTERIOUS_QUOTES = [
  '“He estado observando tus preferencias... ¿Te atreves a llevar la exploración un paso más allá?”',
  '“En las profundidades del consentimiento, los secretos más oscuros se convierten en placer consciente.”',
  '“Tus límites duros están a salvo conmigo... pero tu curiosidad no tiene fronteras.”',
  '“¿Ya preparaste tu ritual de aftercare hoy? La seguridad es el afrodisíaco supremo.”',
  '“Mis tentáculos sostienen tu Bóveda encriptada. Nadie más podrá mirar jamás.”',
  '“Bienvenido/a de vuelta... dime, ¿qué secreto o fantasía exploraremos juntos esta noche?”',
];

export function OctopusHost() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const handleNextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % MYSTERIOUS_QUOTES.length);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.octopusAvatarBtn} onPress={handleNextQuote} activeOpacity={0.8}>
        <View style={styles.glowRing}>
          <Image
            source={require('@/assets/images/nox_octopus.jpg')}
            style={styles.octopusImg}
            resizeMode="cover"
          />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EL ANFITRIÓN MISTERIOSO</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.speechBubble} onPress={handleNextQuote} activeOpacity={0.9}>
        <Text style={styles.hostName}>Nox, el Kraken de las Profundidades ✨</Text>
        <Text style={styles.quoteText}>{MYSTERIOUS_QUOTES[quoteIdx]}</Text>
        <Text style={styles.tapHint}>Toca el pulpo para escuchar más... 👁️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(19, 9, 36, 0.95)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neonPink,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    overflow: 'hidden',
  },
  octopusImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -8,
  },
  badgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 51, 0.8)',
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: 4,
  },
  hostName: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quoteText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  tapHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
});
