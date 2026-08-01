import React, { useState, useEffect } from 'react';
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
import {
  FANTASIES_DATA,
  getSavedRatings,
  saveRating,
  calculateDoubleBlindMatches,
  FantasyMatchResult,
} from '@/lib/fantasyMatch';

export default function FantasyMatchScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [ratings, setRatings] = useState<Record<string, 'yes' | 'maybe' | 'no'>>({});
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<FantasyMatchResult[]>([]);

  useEffect(() => {
    (async () => {
      const saved = await getSavedRatings();
      setRatings(saved);
    })();
  }, []);

  const handleRate = async (fantasyId: string, rating: 'yes' | 'maybe' | 'no') => {
    const updated = { ...ratings, [fantasyId]: rating };
    setRatings(updated);
    await saveRating(fantasyId, rating);
  };

  const handleRevealMatches = () => {
    // Simulated partner ratings for demonstration
    const simulatedPartnerRatings: Record<string, 'yes' | 'maybe' | 'no'> = {
      'f-1': 'yes',
      'f-2': 'maybe',
      'f-3': 'no', // Should NOT show up even if user said 'yes'
      'f-4': 'yes',
      'f-8': 'yes',
    };

    const calculated = calculateDoubleBlindMatches(ratings, simulatedPartnerRatings);
    setMatches(calculated);
    setShowResults(true);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Match Secreto de Fantasías</Text>
          <Text style={styles.subtitle}>
            Evaluación ciega tipo MojoUpgrade: Solo se revelan los gustos mutuos. Si respondes "No", tu pareja NUNCA lo sabrá.
          </Text>
        </View>

        {/* Protection Alert */}
        <View style={styles.privacyAlert}>
          <Text style={styles.privacyText}>
            🔒 Protección Double-Blind: Cero juicio o vergüenza. Tu respuesta "No" permanece encriptada y nunca se muestra.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!showResults ? (
            <View style={{ gap: spacing.md }}>
              {FANTASIES_DATA.map((fan) => {
                const currentRating = ratings[fan.id];
                return (
                  <View key={fan.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={{ fontSize: 32 }}>{fan.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.catBadge}>{fan.category.toUpperCase()}</Text>
                        <Text style={styles.cardTitle}>{fan.title}</Text>
                      </View>
                    </View>

                    <Text style={styles.cardDesc}>{fan.description}</Text>

                    {/* Rating Buttons */}
                    <View style={styles.ratingRow}>
                      <TouchableOpacity
                        style={[styles.rateBtn, currentRating === 'yes' && styles.rateBtnYes]}
                        onPress={() => handleRate(fan.id, 'yes')}
                      >
                        <Text style={[styles.rateBtnText, currentRating === 'yes' && { color: '#fff' }]}>
                          🔥 Sí, me interesa
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.rateBtn, currentRating === 'maybe' && styles.rateBtnMaybe]}
                        onPress={() => handleRate(fan.id, 'maybe')}
                      >
                        <Text style={[styles.rateBtnText, currentRating === 'maybe' && { color: '#fff' }]}>
                          🤔 Tal vez / Probar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.rateBtn, currentRating === 'no' && styles.rateBtnNo]}
                        onPress={() => handleRate(fan.id, 'no')}
                      >
                        <Text style={[styles.rateBtnText, currentRating === 'no' && { color: '#fff' }]}>
                          🚫 No me interesa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity style={styles.revealBtn} onPress={handleRevealMatches}>
                <Text style={styles.revealBtnText}>Ver Coincidencias Mutuas (Double-Blind) 🔓</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Results Screen */
            <View style={{ gap: spacing.md }}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setShowResults(false)}>
                <Text style={styles.backBtnText}>← Volver a Mis Respuestas</Text>
              </TouchableOpacity>

              <Text style={styles.resultsTitle}>🎉 ¡Coincidencias Compartidas Encontradas!</Text>
              <Text style={styles.resultsSub}>
                Estas son las fantasías donde AMBOS expresaron interés mutuo. ¡Planifiquen su próxima escena!
              </Text>

              {matches.map((m) => (
                <View key={m.fantasyId} style={styles.matchCard}>
                  <Text style={{ fontSize: 36 }}>{m.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchCat}>{m.category}</Text>
                    <Text style={styles.matchTitle}>{m.title}</Text>
                    <Text style={styles.matchStatus}>✅ Ambos dijeron Sí / Tal vez</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.revealBtn} onPress={() => router.push('/scene-ai')}>
                <Text style={styles.revealBtnText}>Generar Escena IA con estas Coincidencias 🤖</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  privacyAlert: { backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.success, marginVertical: spacing.xs },
  privacyText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700', lineHeight: 16 },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: colors.borderSubtle, gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  catBadge: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  ratingRow: { flexDirection: 'row', gap: 6 },
  rateBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surfaceLight, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  rateBtnYes: { backgroundColor: colors.success, borderColor: colors.success },
  rateBtnMaybe: { backgroundColor: colors.warning, borderColor: colors.warning },
  rateBtnNo: { backgroundColor: colors.danger, borderColor: colors.danger },
  rateBtnText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },

  revealBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  revealBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  resultsTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  resultsSub: { color: colors.textMuted, fontSize: fontSize.xs },

  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1.5, borderColor: colors.success, gap: spacing.md },
  matchCat: { color: colors.success, fontSize: 10, fontWeight: '900' },
  matchTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '900' },
  matchStatus: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});
