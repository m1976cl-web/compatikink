import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSize, spacing } from '@/constants/theme';

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
        <View style={styles.card}>
          <Text style={styles.emoji}>🔞</Text>
          <Text style={styles.title}>Contenido Exclusivo para Mayores de 18 Años</Text>
          <Text style={styles.desc}>
            Compatikink es una plataforma orientada a la educación, exploración consensuada y evaluación de compatibilidad BDSM/Kink entre adultos.
          </Text>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              🛡️ Todos los contenidos, dinámicas y acuerdos requieren consentimiento libre, informado y madurez legal.
            </Text>
          </View>

          {/* Confirmation Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAccepted((prev) => !prev)}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Confirmo que tengo **18 años o más** y acepto explorar la plataforma bajo principios SSC / RACK.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, !accepted && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!accepted}
          >
            <Text style={styles.confirmBtnText}>Ingresar a Compatikink ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 18, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    gap: spacing.md,
  },
  emoji: { fontSize: 44 },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  desc: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  noticeBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 14,
    padding: spacing.md,
    width: '100%',
  },
  noticeText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
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
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
