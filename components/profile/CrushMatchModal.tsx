import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Platform } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  targetNickname: string;
  onStartVirtualDate: () => void;
  onClose: () => void;
}

export function CrushMatchModal({ visible, targetNickname, onStartVirtualDate, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.matchIcon}>💖⚡💖</Text>
          <Text style={styles.matchTitle}>¡Es un Match de Crush Mutuo!</Text>
          <Text style={styles.matchSubtitle}>
            Tanto tú como <Text style={styles.highlightName}>{targetNickname}</Text> expresaron un crush secreto de forma 100% Zero-Knowledge.
          </Text>

          <View style={styles.badgeBox}>
            <Text style={styles.badgeText}>✨ Coincidencia Ciega Confirmada</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={onStartVirtualDate}>
            <Text style={styles.actionBtnText}>⚡ Iniciar Cita Virtual Guiada (10 min)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Continuar explorando perfiles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: 'rgba(25, 15, 42, 0.98)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#f43f5e',
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 20px 60px rgba(244, 63, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
        }
      : {}),
  },
  matchIcon: { fontSize: 48 },
  matchTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: '#f43f5e',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  matchSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightName: { color: colors.text, fontWeight: 'bold' },
  badgeBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  badgeText: { color: '#f43f5e', fontSize: fontSize.xs, fontWeight: 'bold' },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  actionBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: 'bold' },
  closeBtn: { paddingVertical: 6 },
  closeBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.body },
});
