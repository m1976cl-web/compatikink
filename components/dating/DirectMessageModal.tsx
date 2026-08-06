import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { VaultLockGate } from '@/components/VaultLockGate';
import { DatingMessage } from '@/lib/storage';
import { CommunityProfile } from '@/data/communityProfiles';

interface Props {
  messagingTarget: CommunityProfile | null;
  onClose: () => void;
  chatMessages: DatingMessage[];
  messageInput: string;
  onChangeMessageInput: (text: string) => void;
  onSendMessage: () => void;
  onUnlockVault: () => void;
  myNickname?: string;
}

export function DirectMessageModal({
  messagingTarget,
  onClose,
  chatMessages,
  messageInput,
  onChangeMessageInput,
  onSendMessage,
  onUnlockVault,
  myNickname = 'Tú',
}: Props) {
  if (!messagingTarget) return null;

  return (
    <Modal
      visible={!!messagingTarget}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.chatOverlay}>
        <View style={styles.chatModalCard}>
          <View style={styles.chatModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatModalTitle}>{messagingTarget.nickname}</Text>
              <Text style={styles.chatModalSub}>Mensajería directa cifrada en bóveda (AES-GCM-256)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeX}>
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
          </View>

          <VaultLockGate
            title="Mensajes Cifrados"
            subtitle="Desbloquea la bóveda para leer y enviar DMs almacenados en tu dispositivo."
            onUnlock={onUnlockVault}
          >
            <ScrollView contentContainerStyle={styles.chatList} showsVerticalScrollIndicator={false}>
              {chatMessages.length === 0 ? (
                <View style={styles.chatEmptyState}>
                  <Text style={styles.chatEmptyText}>
                    Inicia la conversación con {messagingTarget.nickname}. Propón una escena, acuerda safewords o comparte detalles confidenciales.
                  </Text>
                </View>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderName === myNickname;
                  return (
                    <View
                      key={msg.id}
                      style={[styles.chatBubble, isMe ? styles.chatBubbleMe : styles.chatBubbleOther]}
                    >
                      <Text style={styles.chatSender}>{msg.senderName}</Text>
                      <Text style={styles.chatText}>{msg.text}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Escribe tu propuesta de escena o mensaje..."
                placeholderTextColor={colors.textMuted}
                value={messageInput}
                onChangeText={onChangeMessageInput}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={onSendMessage}>
                <Text style={styles.sendBtnText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </VaultLockGate>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  chatModalCard: {
    backgroundColor: '#120b22',
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 520,
    height: '75%',
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.sm,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatModalTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '800' },
  chatModalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  closeX: { padding: 6 },
  closeXText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  chatList: { gap: spacing.sm, paddingVertical: spacing.xs },
  chatEmptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  chatEmptyText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  chatBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: 2,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.neonPurple,
    borderBottomRightRadius: 4,
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatSender: { color: '#000', fontSize: 10, fontWeight: '900' },
  chatText: { color: '#fff', fontSize: fontSize.sm, lineHeight: 18 },
  chatInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.neonRose,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  sendBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
