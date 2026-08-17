import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BlockedUser, getBlockedUsers, unblockUser } from '@/lib/trustSafety';
import { triggerLightHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onListUpdated?: () => void;
}

export function BlockedUsersManagerModal({ visible, onClose, onListUpdated }: Props) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const loadData = async () => {
    const list = await getBlockedUsers();
    setBlockedUsers(list);
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const handleUnblock = async (user: BlockedUser) => {
    Alert.alert(
      'Desbloquear Usuario',
      `¿Deseas desbloquear a @${user.userNickname}? Podrán volver a ver sus perfiles y contactarse.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            triggerLightHaptic();
            const updated = await unblockUser(user.userId);
            setBlockedUsers(updated);
            onListUpdated?.();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.title}>🚫 Usuarios Bloqueados</Text>
              <Text style={styles.subtitle}>
                {blockedUsers.length}{' '}
                {blockedUsers.length === 1 ? 'usuario bloqueado' : 'usuarios bloqueados'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {blockedUsers.map((item) => (
              <View key={item.userId} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userNick}>@{item.userNickname}</Text>
                  <Text style={styles.dateText}>
                    Bloqueado el {new Date(item.blockedAt).toLocaleDateString()}
                  </Text>
                  {item.reason ? (
                    <Text style={styles.reasonText} numberOfLines={1}>
                      Motivo: {item.reason}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() => handleUnblock(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.unblockBtnText}>Desbloquear</Text>
                </TouchableOpacity>
              </View>
            ))}

            {blockedUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🕊️</Text>
                <Text style={styles.emptyTitle}>No tienes usuarios bloqueados</Text>
                <Text style={styles.emptySub}>
                  Las personas que bloquees aparecerán aquí y podrás revertir el bloqueo en cualquier momento.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
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
    maxWidth: 480,
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
    paddingBottom: spacing.sm,
  },
  headerTitleGroup: {
    gap: 2,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 20,
  },
  body: {
    flexGrow: 1,
    marginVertical: spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNick: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  dateText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  reasonText: {
    color: '#f87171',
    fontFamily: fonts.body,
    fontSize: 10,
  },
  unblockBtn: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ade80',
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radii.md,
    marginLeft: spacing.sm,
  },
  unblockBtnText: {
    color: '#4ade80',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  emptySub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
  closeBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
