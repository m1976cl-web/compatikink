import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { RITUAL_TEMPLATES, RitualTemplate } from '@/data/ritualTemplates';

export default function RitualsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [selectedRitual, setSelectedRitual] = useState<RitualTemplate | null>(null);

  const handleStartRitual = (ritual: RitualTemplate) => {
    Alert.alert(
      `Iniciar "${ritual.title}" 🚀`,
      `¿Deseas comenzar esta secuencia guiada de ${ritual.steps.length} pasos de protocolo?`,
      [
        {
          text: 'Comenzar Ahora ▶️',
          onPress: () => {
            Alert.alert('Ritual en Progreso ⏱️', 'Sigue las instrucciones paso a paso. Recuerda mantener la comunicación abierta.');
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📋 Ritual Builder & Protocolos D/s</Text>
          <Text style={styles.subtitle}>
            Diseñador de secuencias guiadas para saludos matutinos, prevención de riesgos pre-escena y aftercare nocturno
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!selectedRitual ? (
            /* Rituals List */
            <View style={{ gap: spacing.md }}>
              {RITUAL_TEMPLATES.map((rit) => (
                <View key={rit.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 36 }}>{rit.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catBadge}>{rit.category.toUpperCase()}</Text>
                      <Text style={styles.cardTitle}>{rit.title}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDesc}>{rit.description}</Text>

                  <TouchableOpacity style={styles.startBtn} onPress={() => setSelectedRitual(rit)}>
                    <Text style={styles.startBtnText}>Ver Pasos del Ritual ({rit.steps.length} Pasos) 📖</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            /* Ritual Steps View */
            <View style={styles.card}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRitual(null)}>
                <Text style={styles.backBtnText}>← Volver a Plantillas</Text>
              </TouchableOpacity>

              <Text style={styles.cardTitle}>{selectedRitual.emoji} {selectedRitual.title}</Text>
              <Text style={styles.cardDesc}>{selectedRitual.description}</Text>

              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                <Text style={styles.sectionLabel}>📋 Pasos Guiados del Protocolo:</Text>
                {selectedRitual.steps.map((st) => (
                  <View key={st.stepNumber} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{st.stepNumber}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepTitle}>{st.title} ({st.durationMinutes} min)</Text>
                      <Text style={styles.stepDesc}>{st.instruction}</Text>
                      {st.safetyCheck ? (
                        <Text style={styles.safetyText}>🛡️ Verificación: {st.safetyCheck}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.startBtn} onPress={() => handleStartRitual(selectedRitual)}>
                <Text style={styles.startBtnText}>Iniciar Ritual Guiado en Vivo ▶️</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  catBadge: { color: colors.neonPink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  startBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  sectionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  stepRow: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  stepNum: { color: colors.primary, fontSize: fontSize.md, fontWeight: '900' },
  stepTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  stepDesc: { color: colors.textMuted, fontSize: 10, marginTop: 2, lineHeight: 14 },
  safetyText: { color: colors.warning, fontSize: 10, fontWeight: '800', marginTop: 4 },
});
