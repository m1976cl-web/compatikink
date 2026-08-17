import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

export interface PassAndPlayCurtainProps {
  p1Name: string;
  p2Name: string;
  curtainPin?: string;
  onUnlockP2Turn: () => void;
}

export function PassAndPlayCurtain({
  p1Name,
  p2Name,
  curtainPin,
  onUnlockP2Turn,
}: PassAndPlayCurtainProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (curtainPin && curtainPin.trim().length >= 4) {
      if (enteredPin.trim() !== curtainPin.trim()) {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        return;
      }
    }
    onUnlockP2Turn();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>🙈📱</Text>
      <Text style={styles.cardTitle}>¡Turno de {p1Name} Finalizado!</Text>
      <Text style={styles.curtainDesc}>
        Entrega el dispositivo a <Text style={styles.highlight}>{p2Name}</Text> para que complete sus respuestas.
      </Text>

      {curtainPin && curtainPin.trim().length >= 4 ? (
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>Ingresa el PIN de Cortina para continuar:</Text>
          <TextInput
            style={styles.pinInput}
            value={enteredPin}
            onChangeText={(text) => {
              setEnteredPin(text);
              setError('');
            }}
            placeholder="****"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity style={styles.btnPrimary} onPress={handleUnlock} activeOpacity={0.85}>
        <Text style={styles.btnPrimaryText}>
          Soy {p2Name}, Comienzo Mi Turno 🚀
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 56,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  curtainDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlight: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  pinSection: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  pinLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  pinInput: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: 140,
    textAlign: 'center',
    letterSpacing: 4,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignItems: 'center',
    width: '100%',
  },
  btnPrimaryText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
