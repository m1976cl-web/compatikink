import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, spacing, radii, fontSize, typography } from '@/constants/theme';
import {
  EphemeralWish,
  loadEphemeralWishes,
  createEphemeralWish,
  acceptEphemeralWish,
} from '@/lib/ephemeralWishes';

import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function EphemeralWishesScreenContent() {
  const router = useRouter();
  const [wishes, setWishes] = useState<EphemeralWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishText, setWishText] = useState('');
  const [category, setCategory] = useState<EphemeralWish['category']>('Shibari');
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'accepted'>('all');

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    setLoading(true);
    const data = await loadEphemeralWishes();
    setWishes(data);
    setLoading(false);
  };

  const handleCreateWish = async () => {
    if (!wishText.trim()) return;
    const updated = await createEphemeralWish('Usuario_ZK', category, wishText, intensity);
    setWishes(updated);
    setWishText('');
  };

  const handleAcceptWish = async (id: string) => {
    const updated = await acceptEphemeralWish(id, 'Pareja_Respondedora');
    setWishes(updated);
  };

  const filteredWishes = wishes.filter((w) => {
    if (activeFilter === 'active') return w.status === 'active';
    if (activeFilter === 'accepted') return w.status === 'accepted';
    return true;
  });

  return (
    <ScreenContainer title="Deseos Efímeros" hideHeader>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Volver al Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🔥 Deseos Efímeros (24h ZK)</Text>
        <Text style={styles.subtitle}>
          Inspirado en Pure. Tablón de intenciones y fantasías efímeras que se autodestruyen en 24 horas sin dejar rastro local ni en servidor.
        </Text>

        {/* CREATE WISH BOX */}
        <View style={styles.createCard}>
          <Text style={styles.cardHeader}>✨ Publicar Deseo Efímero (Expira en 24:00:00)</Text>

          <TextInput
            style={styles.textInput}
            placeholder="Escribe tu deseo, fantasía o propuesta consensuada..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={wishText}
            onChangeText={setWishText}
          />

          <View style={styles.categoryRow}>
            {(['Shibari', 'Sensual', 'Impacto', 'Juego de Rol', 'Aftercare'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateWish}>
            <Text style={styles.submitBtnText}>⚡ Lanzar Deseo Efímero ZK</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER TABS */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>🔥 Todos ({wishes.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'active' && styles.filterTabActive]}
            onPress={() => setActiveFilter('active')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'active' && styles.filterTabTextActive]}>
              ⏳ Activos ({wishes.filter((w) => w.status === 'active').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'accepted' && styles.filterTabActive]}
            onPress={() => setActiveFilter('accepted')}
          >
            <Text style={[styles.filterTabText, activeFilter === 'accepted' && styles.filterTabTextActive]}>
              ✅ Aceptados ({wishes.filter((w) => w.status === 'accepted').length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {filteredWishes.map((item) => (
              <View key={item.id} style={[styles.wishCard, item.status === 'accepted' && styles.wishCardAccepted]}>
                <View style={styles.cardTop}>
                  <Text style={styles.author}>{item.authorNickname}</Text>
                  <Text style={styles.badgeCategory}>{item.category}</Text>
                </View>

                <Text style={styles.wishContent}>"{item.wishText}"</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.expiryText}>
                    {item.status === 'expired'
                      ? '🔴 Expirado (Autodestruido)'
                      : item.status === 'accepted'
                      ? `✅ Aceptado por ${item.acceptedByNickname}`
                      : '⏱️ Autodestrucción en < 24h'}
                  </Text>

                  {item.status === 'active' && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptWish(item.id)}>
                      <Text style={styles.acceptBtnText}>🤝 Aceptar Deseo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  backBtn: { marginBottom: spacing.xs, alignSelf: 'flex-start' },
  backBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, fontSize: fontSize.xxl, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm, marginBottom: spacing.md },

  createCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.sm,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  catChip: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  catChipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },

  filterRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.sm },
  filterTab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  filterTabTextActive: { color: colors.onPrimary, fontWeight: '900' },

  scroll: { gap: spacing.sm, paddingBottom: 40 },
  wishCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wishCardAccepted: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  badgeCategory: {
    backgroundColor: colors.surfaceLight,
    color: colors.textMuted,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wishContent: { color: colors.text, fontSize: fontSize.sm, fontFamily: fonts.body, fontStyle: 'italic', marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  expiryText: { color: colors.textMuted, fontSize: 10 },
  acceptBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  acceptBtnText: { color: '#10b981', fontSize: 11, fontWeight: '800' },
});

export default function EphemeralWishesScreen() {
  return (
    <RouteFeatureGuard route="/ephemeral-wishes" title="Deseos Efímeros 24h">
      <EphemeralWishesScreenContent />
    </RouteFeatureGuard>
  );
}
