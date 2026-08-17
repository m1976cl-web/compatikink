import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ILLEGAL_CONTENT_WARNING_TEXT } from '@/lib/wildFeedStorage';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          brand
          title="Términos de Servicio & Protocolo Legal (Chile 🇨🇱)"
          subtitle="Política de Contenido Adulto (18+), Ley 19.628, Ley 21.523 (Ley Antonia) y Cifrado ZK."
        />

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ REGLAS LEGALES INVIOLABLES DE LA PLATAFORMA ⚠️</Text>
          <Text style={styles.warningBody}>{ILLEGAL_CONTENT_WARNING_TEXT}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Requisito de Mayoría de Edad (18+ años)</Text>
          <Text style={styles.sectionText}>
            El acceso a las galerías, feeds y herramientas de compatibilidad está restringido exclusivamente a adultos mayores de 18 años cumplidos. Todo el contenido compartido debe ser estrictamente entre adultos con consentimiento libre, previo e informado.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Ley N° 21.523 (Ley Antonia) — Difusión No Consensuada</Text>
          <Text style={styles.sectionText}>
            En estricto cumplimiento del Art. 161-C del Código Penal chileno, queda prohibida la publicación, divulgación o compartición sin consentimiento explícito de fotos, videos o audios de contenido sexual o íntimo. La sextorsión y el acoso son sancionados con el bloqueo inmediato del perfil y aviso a autoridades.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Ley N° 19.628 — Protección de Datos Sensibles & Cifrado ZK</Text>
          <Text style={styles.sectionText}>
            Las preferencias íntimas, fetiches y hábitos se clasifican como datos personales sensibles bajo la Ley 19.628 de Chile. CompatKink los protege bajo cifrado local Zero-Knowledge (AES-GCM-256 / PBKDF2), garantizando que la plataforma jamás procese tus datos en texto plano.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Ley N° 20.609 (Ley Zamudio) & Principios SSC / RACK</Text>
          <Text style={styles.sectionText}>
            Se garantiza la no discriminación por orientación sexual o expresión fetiche. Todas las dinámicas de exploración BDSM o fetiche deben regirse bajo los principios de Seguridad, Sensatez, Consentimiento y Conciencia del Riesgo.
          </Text>
        </View>

        <Button title="Entendido — Volver al Inicio" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningTitle: { color: '#ef4444', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  warningBody: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm, fontWeight: '800' },
  sectionText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
});
