import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { askGeminiAssistant, AssistantMessage } from '@/lib/geminiAssistant';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export function IntimateAssistantModal({ visible, onClose, initialPrompt = '' }: Props) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const responseText = await askGeminiAssistant(userMsg.content, messages);
      const aiMsg: AssistantMessage = {
        role: 'model',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Handled inside geminiAssistant fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Asistente Íntimo IA 🔮🤖</Text>
              <Text style={styles.sub}>Negociación de consentimiento & debriefing Zero-Knowledge</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  Haz cualquier consulta sobre negociación de escenas, consentimiento, normas RACK/SSC o cuidados de aftercare.
                </Text>
              </View>
            ) : (
              messages.map((m, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.msgBubble,
                    m.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={m.role === 'user' ? styles.userMsgText : styles.aiMsgText}>
                    {m.content}
                  </Text>
                  <Text style={styles.timestamp}>{m.timestamp}</Text>
                </View>
              ))
            )}
            {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />}
          </ScrollView>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Consulta sobre negociación o escena..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.sendBtnText}>Enviar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.md,
    height: '80%',
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 11 },
  closeBtn: { padding: spacing.xs },
  closeBtnText: { color: colors.textMuted, fontSize: 18, fontWeight: '900' },

  chatScroll: { flexGrow: 1, gap: spacing.xs, paddingVertical: spacing.xs },
  emptyBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  msgBubble: { borderRadius: radii.lg, padding: spacing.md, maxWidth: '85%', gap: 4 },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: colors.surfaceLight, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  userMsgText: { color: colors.onPrimary, fontSize: fontSize.xs },
  aiMsgText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  timestamp: { color: 'rgba(255,255,255,0.5)', fontSize: 9, alignSelf: 'flex-end' },

  inputRow: { flexDirection: 'row', gap: spacing.xs, paddingTop: spacing.xs },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.xs,
  },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },
});
