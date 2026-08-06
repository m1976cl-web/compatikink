import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Section } from '@/components/Section';
import { colors, fontSize, radii, spacing } from '@/constants/theme';

export function FetishSuiteSection() {
  const router = useRouter();

  return (
    <Section title="Fetish Social & Dating Suite" subtitle="Módulos destacados de conexiones, eventos cifrados y feed anónimo">
      <View style={styles.suiteCardsGrid}>
        <TouchableOpacity style={styles.suiteCardDating} onPress={() => router.push('/dating')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💘</Text>
            <View style={styles.suiteBadgePill}><Text style={styles.suiteBadgePillText}>LÁTEX NEGRO</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Fetish Dating & Perfiles</Text>
          <Text style={styles.suiteCardDesc}>Buscador por roles (Dom/Sub/Switch), insignias visuales cifradas, protocolos SSC/RACK y calculador de complementariedad.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionText}>Explorar Perfiles ➔</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suiteCardEvents} onPress={() => router.push('/events')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>🍸</Text>
            <View style={styles.suiteBadgePillRose}><Text style={styles.suiteBadgePillTextRose}>DOUBLE-BLIND</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Eventos & Munches</Text>
          <Text style={styles.suiteCardDesc}>Directorio de reuniones sociales, talleres presenciales de Shibari, libere de ubicación double-blind y etiqueta de Munch.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionTextRose}>Ver Calendario & RSVP ➔</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suiteCardFeed} onPress={() => router.push('/kink-feed')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💬</Text>
            <View style={styles.suiteBadgePillEmerald}><Text style={styles.suiteBadgePillTextEmerald}>ZERO-KNOWLEDGE</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Feed & Confesionario Anónimo</Text>
          <Text style={styles.suiteCardDesc}>Muro de debate con firmas de autenticidad anónimas, encuestas diarias de equipamiento y confesiones cifradas por roles.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionTextEmerald}>Unirse al Muro Anónimo ➔</Text></View>
        </TouchableOpacity>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  suiteCardsGrid: { gap: spacing.md, marginVertical: spacing.xs },
  suiteCardDating: { backgroundColor: '#120b22', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#c084fc', gap: spacing.xs },
  suiteCardEvents: { backgroundColor: '#160818', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#f43f5e', gap: spacing.xs },
  suiteCardFeed: { backgroundColor: '#061614', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#10b981', gap: spacing.xs },
  suiteCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suiteCardEmoji: { fontSize: 28 },
  suiteBadgePill: { backgroundColor: 'rgba(192,132,252,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillText: { color: '#c084fc', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteBadgePillRose: { backgroundColor: 'rgba(244,63,94,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillTextRose: { color: '#f43f5e', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteBadgePillEmerald: { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillTextEmerald: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteCardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  suiteCardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  suiteCardFooter: { marginTop: 4 },
  suiteCardActionText: { color: '#c084fc', fontSize: fontSize.xs, fontWeight: '800' },
  suiteCardActionTextRose: { color: '#f43f5e', fontSize: fontSize.xs, fontWeight: '800' },
  suiteCardActionTextEmerald: { color: '#10b981', fontSize: fontSize.xs, fontWeight: '800' },
});
