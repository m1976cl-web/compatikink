import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { blockUser } from '@/lib/trustSafety';
import { triggerWarningHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserNickname: string;
  onUserBlocked?: () => void;
}

export function BlockUserModal({
  visible,
  onClose,
  targetUserId,
  targetUserNickname,
  onUserBlocked,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBlock = async () => {
    setIsSubmitting(true);
    try {
      await blockUser({
        id: targetUserId,
        nickname: targetUserNickname,
      });

      triggerWarningHaptic();
      Alert.alert(
        'Usuario Bloqueado 🚫',
        `Has bloqueado a @${targetUserNickname}. Ya no podrán ver sus perfiles ni enviarse mensajes mutuamente.`
      );

      onUserBlocked?.();
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo completar el bloqueo. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>🚫 Bloqueo Mutuo</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.prompt}>
            ¿Estás seguro/a de que deseas bloquear a{' '}
            <Text style={styles.targetNickHighlight}>@{targetUserNickname}</Text>?
          </Text>

          <View style={styles.consequencesBox}>
            <Text style={styles.consequencesTitle}>Efectos del bloqueo mutuo:</Text>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletIcon}>🔒</Text>
              <Text style={styles.bulletText}>
                No podrán ver los perfiles ni fotos del otro.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletIcon}>💬</Text>
              <Text style={styles.bulletText}>
                No podrán enviarse mensajes directos (DM).
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletIcon}>👁️</Text>
              <Text style={styles.bulletText}>
                Sus publicaciones y encuestas en el feed se ocultarán mutuamente.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletIcon}>🤝</Text>
              <Text style={styles.bulletText}>
                No podrán invitarse a sesiones de compatibilidad ZK.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.blockBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleConfirmBlock}
              disabled={isSubmitting}
            >
              <Text style={styles.blockBtnText}>
                {isSubmitting ? 'Bloqueando...' : 'Bloquear Usuario 🚫'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 460,
    borderWidth: 1.5,
    borderColor: '#f87171',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#f87171',
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 20,
  },
  prompt: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  targetNickHighlight: {
    color: '#f87171',
    fontFamily: fonts.bodyBold,
  },
  consequencesBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  consequencesTitle: {
    color: '#f87171',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bulletIcon: {
    fontSize: 13,
  },
  bulletText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  blockBtn: {
    flex: 1.5,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    backgroundColor: '#f87171',
  },
  blockBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
