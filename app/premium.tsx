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
import { isPremiumUser, setPremiumStatus, PREMIUM_FEATURES } from '@/lib/premium';

export default function PremiumScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [isPro, setIsPro] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    (async () => {
      const pro = await isPremiumUser();
      setIsPro(pro);
    })();
  }, []);

  const handleActivatePlan = async () => {
    await setPremiumStatus(true);
    setIsPro(true);
    Alert.alert('¡Suscripción Activada! 💎', 'Felicidades, ahora tienes acceso ilimitado a todas las herramientas PRO.');
  };

  const handleCancelPlan = async () => {
    await setPremiumStatus(false);
    setIsPro(false);
    Alert.alert('Plan Cancelado', 'Has vuelto al plan gratuito.');
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Compatikink PRO</Text>
          <Text style={styles.subtitle}>
            Desbloquea el potencial ilimitado de exploración, matchmaking y análisis avanzado
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Badge */}
          {isPro ? (
            <View style={styles.proActiveCard}>
              <Text style={{ fontSize: 32 }}>👑</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.proActiveTitle}>Suscripción PRO Activada</Text>
                <Text style={styles.proActiveSub}>Tienes acceso a todas las herramientas avanzadas y bóveda cifrada.</Text>
              </View>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelPlan}>
                <Text style={styles.cancelBtnText}>Volver a Gratis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Plan Selector */}
              <View style={styles.plansRow}>
                <TouchableOpacity
                  style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
                  onPress={() => setSelectedPlan('monthly')}
                >
                  <Text style={styles.planBadge}>MENSUAL</Text>
                  <Text style={styles.planPrice}>$4.99 USD</Text>
                  <Text style={styles.planSub}>/mes · Cancela cuando quieras</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.planCard, selectedPlan === 'annual' && styles.planCardActive]}
                  onPress={() => setSelectedPlan('annual')}
                >
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Ahorra 40% 🔥</Text>
                  </View>
                  <Text style={styles.planBadge}>ANUAL</Text>
                  <Text style={styles.planPrice}>$2.99 USD</Text>
                  <Text style={styles.planSub}>/mes ($35.88 cobrado anualmente)</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.upgradeBtn} onPress={handleActivatePlan}>
                <Text style={styles.upgradeBtnText}>Obtener Compatikink PRO ✨</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Features List */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>✨ Beneficios Incluidos en Compatikink PRO:</Text>
            {PREMIUM_FEATURES.map((feat) => (
              <View key={feat.id} style={styles.featureItem}>
                <Text style={styles.featureCheck}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureName}>{feat.name}</Text>
                  <Text style={styles.featureDesc}>{feat.desc}</Text>
                </View>
              </View>
            ))}
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

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  proActiveCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  proActiveTitle: { color: colors.success, fontSize: fontSize.md, fontWeight: '900' },
  proActiveSub: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },
  cancelBtn: { backgroundColor: colors.surfaceLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  cancelBtnText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },

  plansRow: { flexDirection: 'row', gap: spacing.md },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bestValueText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  planBadge: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  planPrice: { color: colors.text, fontSize: fontSize.xl, fontWeight: '900', marginTop: 4 },
  planSub: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },

  upgradeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowRadius: 12,
    shadowOpacity: 0.4,
  },
  upgradeBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '900' },

  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  featuresTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  featureItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  featureCheck: { color: colors.success, fontSize: fontSize.md, fontWeight: '900' },
  featureName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  featureDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
});
