import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/lib/i18n';

export default function PublicLandingScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();

  return (
    <ScreenContainer title="CompatKink — Private Intimate Compatibility" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <Text style={styles.brandTitle}>CompatKink 🖤</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <LanguageSelector />
            <TouchableOpacity style={styles.appBtn} onPress={() => router.push('/')}>
              <Text style={styles.appBtnText}>Abrir App 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <Text style={styles.heroBadge}>🔐 Cifrado Client-Side Zero-Knowledge</Text>
            <Text style={styles.heroTitle}>Compatibilidad Íntima Asimétrica & Privada</Text>
            <Text style={styles.heroSubtitle}>
              Explora preferencias BDSM, límites, roles y fetiches con tu pareja sin revelar respuestas no coincidentes a terceros ni a servidores.
            </Text>

            <View style={styles.heroCtaRow}>
              <TouchableOpacity style={styles.primaryCtaBtn} onPress={() => router.push('/onboarding')}>
                <Text style={styles.primaryCtaBtnText}>Comenzar Cuestionario Privado 📋</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryCtaBtn} onPress={() => router.push('/manual')}>
                <Text style={styles.secondaryCtaBtnText}>Explorar Manual 📖</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FEATURE GRID */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🙈</Text>
              <Text style={styles.featureTitle}>Privacidad Asimétrica</Text>
              <Text style={styles.featureDesc}>
                Solo se revelan las coincidencias mutuas. Los límites duros y desintereses individuales permanecen 100% ocultos.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🔒</Text>
              <Text style={styles.featureTitle}>Cifrado AES-GCM-256</Text>
              <Text style={styles.featureDesc}>
                Claves derivadas en tu propio dispositivo con PBKDF2 (100k iteraciones). Ni administradores pueden leer tus datos.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🕊️</Text>
              <Text style={styles.featureTitle}>PIN Canario Anti-Coerción</Text>
              <Text style={styles.featureDesc}>
                PIN secundario de descompresión que desbloquea un estado señuelo sintético ante situaciones de coacción física.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <Text style={styles.featureTitle}>Modo Escena en Vivo</Text>
              <Text style={styles.featureDesc}>
                Asistente inmersivo con semáforo gigante, detector de palabra de seguridad por voz y protocolo de Aftercare de 15 min.
              </Text>
            </View>
          </View>

          {/* LEGAL & COMPLIANCE BARNER */}
          <View style={styles.legalBanner}>
            <Text style={styles.legalBannerTitle}>⚖️ Cumplimiento Legal GDPR Art. 9 & Ley 21.719</Text>
            <Text style={styles.legalBannerDesc}>
              Tus preferencias íntimas son Datos de Categoría Especial. Garantizamos borrado irrecuperable en un clic ("Derecho al Olvido").
            </Text>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={styles.legalLink}>Leer Política de Privacidad ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 840, alignSelf: 'center', width: '100%' },

  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.border },
  brandTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900', letterSpacing: 0.5 },
  appBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 6 },
  appBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },

  scroll: { gap: spacing.xl, paddingTop: spacing.md },

  heroSection: { alignItems: 'center', textAlign: 'center', gap: spacing.sm, marginVertical: spacing.md },
  heroBadge: { color: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.1)', borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4, fontSize: 11, fontWeight: '800' },
  heroTitle: { color: colors.text, fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 38 },
  heroSubtitle: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 600, lineHeight: 22 },
  heroCtaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  primaryCtaBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 20, paddingVertical: 12 },
  primaryCtaBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },
  secondaryCtaBtn: { backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  secondaryCtaBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  featureCard: { flex: 1, minWidth: 240, backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: 6, borderWidth: 1, borderColor: colors.border },
  featureEmoji: { fontSize: 32 },
  featureTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  featureDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  legalBanner: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.xl, padding: spacing.lg, gap: spacing.xs, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
  legalBannerTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  legalBannerDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  legalLink: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', textDecorationLine: 'underline', marginTop: 4 },
});
