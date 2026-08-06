import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  passphrase: string;
  onChangePassphrase: (p: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export function BackupPassphraseModal({
  visible,
  passphrase,
  onChangePassphrase,
  onConfirm,
  onCancel,
  title = 'Copia de seguridad cifrada',
  subtitle = 'Backups con PBKDF2 + AES-GCM. Mínimo 4 caracteres.',
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña de cifrado"
            placeholderTextColor={colors.textMuted || '#888'}
            secureTextEntry
            value={passphrase}
            onChangeText={onChangePassphrase}
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>Confirmar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface || '#120b22',
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle || 'rgba(192,132,252,0.3)',
  },
  title: {
    fontFamily: fonts.displaySemi || fonts.bodySemi,
    color: colors.text,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: fonts.body,
    backgroundColor: colors.background,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: { padding: spacing.sm, paddingHorizontal: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: fonts.body },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  confirmText: { color: '#ffffff', fontFamily: fonts.bodySemi, fontWeight: '700' },
});
