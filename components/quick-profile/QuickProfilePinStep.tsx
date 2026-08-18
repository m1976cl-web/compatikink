import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { FlowBar } from '@/components/FlowBar';

export interface QuickProfilePinStepProps {
  pin: string;
  setPin: (val: string) => void;
  saving: boolean;
  onSave: () => void;
}

export function QuickProfilePinStep({
  pin,
  setPin,
  saving,
  onSave,
}: QuickProfilePinStepProps) {
  return (
    <>
      <FlowBar step={1} />
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>🔐</Text>
        <Text style={styles.heroTitle}>Protege tu Perfil en Bóveda</Text>
        <Text style={styles.heroDesc}>
          Añade un PIN de 4 dígitos para derivar tu clave de bóveda AES-GCM-256 local.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>PIN de seguridad (4–8 dígitos)</Text>
        <TextInput
          style={[styles.input, styles.pinInput]}
          placeholder="1234"
          placeholderTextColor={colors.textMuted}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          autoFocus
        />
        <Text style={styles.pinHint}>Tu PIN se usa para derivar la clave criptográfica. No se almacena en plano.</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
        onPress={onSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>
          {saving ? 'Guardando...' : '¡Crear mi Perfil Cifrado! 🚀'}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroEmoji: { fontSize: 52, marginBottom: spacing.sm },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    marginBottom: spacing.sm,
  },
  heroDesc: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pinInput: {
    fontSize: fontSize.lg,
    letterSpacing: 4,
    textAlign: 'center',
  },
  pinHint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
