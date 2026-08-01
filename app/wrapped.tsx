import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';

interface WrappedSlide {
  id: number;
  emoji: string;
  badge: string;
  title: string;
  statValue: string;
  statSubtitle: string;
  bgGradientColor: string;
}

const WRAPPED_SLIDES: WrappedSlide[] = [
  {
    id: 1,
    emoji: '🔥',
    badge: 'TU AÑO KINK 2026',
    title: '¡Menudo Año de Exploración!',
    statValue: '158 Actividades',
    statSubtitle: 'Evaluadas en tu cuestionario base de compatibilidad.',
    bgGradientColor: colors.accentSoft,
  },
  {
    id: 2,
    emoji: '🪢',
    badge: 'CATEGORÍA #1',
    title: 'Tu Categoría Favorita Fue...',
    statValue: 'Bondage & Shibari',
    statSubtitle: 'El 42% de tus respuestas pertenecen a ataduras y restricción física.',
    bgGradientColor: 'rgba(244, 114, 182, 0.15)',
  },
  {
    id: 3,
    emoji: '🪷',
    badge: 'BIENESTAR EMOCIONAL',
    title: 'Emoción Más Sentida en Debriefs:',
    statValue: 'Reconexión & Calma',
    statSubtitle: 'Registrada en el 85% de tus diarios post-escena (Aftercare).',
    bgGradientColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    id: 4,
    emoji: '💘',
    badge: 'AFINIDAD PAREJA',
    title: 'Tu Nivel Máximo de Compatibilidad:',
    statValue: '94% Coincidencia',
    statSubtitle: 'Alcanzado en tu sesión con tu pareja principal.',
    bgGradientColor: 'rgba(251, 191, 36, 0.15)',
  },
];

export default function WrappedScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const slide = WRAPPED_SLIDES[currentSlideIdx];

  const handleNextSlide = () => {
    if (currentSlideIdx < WRAPPED_SLIDES.length - 1) {
      setCurrentSlideIdx(currentSlideIdx + 1);
    } else {
      Alert.alert('¡Ese fue tu Wrapped! 🎉', 'Comparte tus logros con tu pareja o guárdalos en tu bóveda.');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(currentSlideIdx - 1);
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compatikink Wrapped 2026</Text>
          <Text style={styles.subtitle}>
            Tu resumen anual personalizado de exploración erótica, emociones y compatibilidad
          </Text>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {WRAPPED_SLIDES.map((s, idx) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                idx === currentSlideIdx && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Main Slide Card */}
          <View style={[styles.slideCard, { backgroundColor: slide.bgGradientColor }]}>
            <Text style={styles.badgeText}>{slide.badge}</Text>
            <Text style={styles.emojiText}>{slide.emoji}</Text>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.statValue}>{slide.statValue}</Text>
            <Text style={styles.statSubtitle}>{slide.statSubtitle}</Text>

            {/* Slide Navigation Buttons */}
            <View style={styles.navRow}>
              {currentSlideIdx > 0 && (
                <TouchableOpacity style={styles.navBtn} onPress={handlePrevSlide}>
                  <Text style={styles.navBtnText}>← Anterior</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={handleNextSlide}>
                <Text style={styles.navBtnPrimaryText}>
                  {currentSlideIdx === WRAPPED_SLIDES.length - 1 ? 'Finalizar 🎉' : 'Siguiente →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 640, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  dotsRow: { flexDirection: 'row', gap: 6, marginVertical: spacing.xs, justifyContent: 'center' },
  dot: { height: 6, flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 3 },
  dotActive: { backgroundColor: colors.primary },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  slideCard: {
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 380,
    justifyContent: 'center',
  },
  badgeText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  emojiText: { fontSize: 64 },
  slideTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center' },
  statValue: { color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  statSubtitle: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  navRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, width: '100%' },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  navBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  navBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  navBtnPrimaryText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },
});
