import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';

const AGE_KEY = 'age_verified_18_v1';

export function AgeVerificationModal() {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    (async () => {
      const verified = await AsyncStorage.getItem(AGE_KEY);
      if (verified !== 'true') {
        setVisible(true);
      }
    })();
  }, []);

  const handleConfirm = async () => {
    if (!accepted) return;
    await AsyncStorage.setItem(AGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.brand}>Compatikink</Text>
          <Text style={styles.eyebrow}>Acceso restringido</Text>
          <Text style={styles.title}>Solo para mayores de 18 años</Text>
          <Text style={styles.desc}>
            Plataforma orientada a la educación, exploración consensuada y evaluación de
            compatibilidad BDSM/Kink entre adultos.
          </Text>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Todos los contenidos, dinámicas y acuerdos requieren consentimiento libre,
              informado y madurez legal.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAccepted((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxLabel}>
              Confirmo que tengo 18 años o más y acepto explorar la plataforma bajo principios
              SSC / RACK.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, !accepted && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!accepted}
            accessibilityRole="button"
          >
            <Text style={styles.confirmBtnText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.xl,
    color: colors.primary,
    letterSpacing: 2,
  },
  eyebrow: {
    ...typography.label,
    color: colors.danger,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  desc: {
    ...typography.bodyMuted,
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
  noticeBox: {
    backgroundColor: 'rgba(196, 92, 92, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 92, 0.35)',
    borderRadius: radii.md,
    padding: spacing.md,
    width: '100%',
  },
  noticeText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundMid,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  checkboxLabel: {
    fontFamily: fonts.body,
    color: colors.text,
    fontSize: fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    width: '100%',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  },
  confirmBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.onPrimary,
    fontSize: fontSize.sm,
    letterSpacing: 0.4,
  },
});
