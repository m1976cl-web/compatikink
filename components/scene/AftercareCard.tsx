import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  aftercareTimerSeconds: number;
  formatSecs: (secs: number) => string;
  onResetSession: () => void;
}

export function AftercareCard({
  aftercareTimerSeconds,
  formatSecs,
  onResetSession,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.aftercareCard}>
        <Text style={styles.aftercareTitle}>🪷 Protocolo de Aftercare Nocturno (15 min)</Text>
        <Text style={styles.aftercareDesc}>
          Aterrizaje suave post-endorfinas. Mantén contacto cuerpo a cuerpo, hidratación y temperatura agradable.
        </Text>

        <View style={styles.aftercareTimerBox}>
          <Text style={styles.aftercareTimerText}>{formatSecs(aftercareTimerSeconds)}</Text>
          <Text style={styles.aftercareTimerLabel}>Tiempo de Recuperación Afectiva</Text>
        </View>

        <Text style={styles.checkHeader}>Lista de Cotejo para el Cuidado:</Text>
        <View style={styles.aftercareCheckList}>
          <Text style={styles.aftercareCheckItem}>✓ Envolver en manta cálida (prevenir bajada de temperatura)</Text>
          <Text style={styles.aftercareCheckItem}>✓ Ofrecer vaso de agua o infusión tibia con azúcar/chocolate</Text>
          <Text style={styles.aftercareCheckItem}>✓ Dar masajes suaves en articulaciones atadas</Text>
          <Text style={styles.aftercareCheckItem}>✓ Conversar: ¿Cómo te sientes? / ¿Qué te encantó de hoy?</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onResetSession}>
          <Text style={styles.primaryBtnText}>Finalizar Sesión & Guardar en Bóveda ✅</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md },
  aftercareCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  aftercareTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  aftercareDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  aftercareTimerBox: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  aftercareTimerText: { fontSize: 36, fontWeight: '900', color: colors.text },
  aftercareTimerLabel: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  checkHeader: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },
  aftercareCheckList: { gap: 4 },
  aftercareCheckItem: { color: colors.textMuted, fontSize: 11 },

  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },
});
