import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

export interface PassAndPlaySetupProps {
  p1Name: string;
  setP1Name: (val: string) => void;
  p2Name: string;
  setP2Name: (val: string) => void;
  questionMode: 'express' | 'full';
  setQuestionMode: (val: 'express' | 'full') => void;
  curtainPin: string;
  setCurtainPin: (val: string) => void;
  onStart: () => void;
}

export function PassAndPlaySetup({
  p1Name,
  setP1Name,
  p2Name,
  setP2Name,
  questionMode,
  setQuestionMode,
  curtainPin,
  setCurtainPin,
  onStart,
}: PassAndPlaySetupProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.stepBadge}>PASO 1 DE 2 — CONFIGURACIÓN PRESENCIAL</Text>

      <Text style={styles.fieldLabel}>Nombre / Apodo de Persona 1 (Iniciador)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Alex"
        placeholderTextColor={colors.textMuted}
        value={p1Name}
        onChangeText={setP1Name}
      />

      <Text style={styles.fieldLabel}>Nombre / Apodo de Persona 2 (Pareja)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Sam"
        placeholderTextColor={colors.textMuted}
        value={p2Name}
        onChangeText={setP2Name}
      />

      <Text style={styles.fieldLabel}>Modalidad de Cuestionario</Text>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, questionMode === 'express' && styles.modeChipActive]}
          onPress={() => setQuestionMode('express')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeChipTitle, questionMode === 'express' && styles.modeChipTitleActive]}>
            ⚡ Express (~2 min)
          </Text>
          <Text style={styles.modeChipSub}>10 actividades representativas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeChip, questionMode === 'full' && styles.modeChipActive]}
          onPress={() => setQuestionMode('full')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeChipTitle, questionMode === 'full' && styles.modeChipTitleActive]}>
            🔥 Completo (~12 min)
          </Text>
          <Text style={styles.modeChipSub}>Catálogo completo de prácticas</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>PIN Cortina de Privacidad (Opcional, 4 dígitos)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 1234 (Bloquea el traspaso de turno)"
        placeholderTextColor={colors.textMuted}
        value={curtainPin}
        onChangeText={setCurtainPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
      />

      <TouchableOpacity
        style={[styles.btnPrimary, (!p1Name.trim() || !p2Name.trim()) && styles.btnDisabled]}
        disabled={!p1Name.trim() || !p2Name.trim()}
        onPress={onStart}
        activeOpacity={0.85}
      >
        <Text style={styles.btnPrimaryText}>Iniciar Respuestas de {p1Name || 'Persona 1'} 🚀</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  stepBadge: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeChip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 2,
  },
  modeChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  modeChipTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  modeChipTitleActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  modeChipSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
