import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { askGeminiAssistant, AssistantMessage } from '@/lib/geminiAssistant';

export default function AiAssistantScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSendPrompt = async (promptToSend?: string) => {
    const query = promptToSend || inputText.trim();
    if (!query || loading) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputText('');
    setLoading(true);

    try {
      const responseText = await askGeminiAssistant(userMsg.content, messages, customKey);
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
    <ScreenContainer title="Asistente IA Íntimo" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>Asistente IA Íntimo 🔮🤖</Text>
            <TouchableOpacity onPress={() => setShowKeyInput(!showKeyInput)} style={styles.keyBtn}>
              <Text style={styles.keyBtnText}>🔑 Clave API</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Asesoría de negociación de consentimiento, protocolos RACK/SSC y debriefing con Zero-Knowledge
          </Text>
        </View>

        {showKeyInput && (
          <View style={styles.keyBox}>
            <Text style={styles.keyLabel}>Clave API Gemini Opcional (Guardada en RAM):</Text>
            <TextInput
              style={styles.keyInput}
              placeholder="AIzaSy..."
              placeholderTextColor={colors.textMuted}
              value={customKey}
              onChangeText={setCustomKey}
              secureTextEntry
            />
          </View>
        )}

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsRow}>
          {[
            '🪢 ¿Cómo negociar límites en Shibari?',
            '🪷 Guía de Aftercare post-escena',
            '📜 Redactar contrato D/s consensuado',
            '🚨 Protocolos de emergencia y safewords',
          ].map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chip}
              onPress={() => handleSendPrompt(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Feed */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>💬 Comienza una conversación privada</Text>
              <Text style={styles.emptyText}>
                Escribe tu consulta o selecciona uno de los temas sugeridos arriba. Las respuestas son procesadas sin guardar registro en servidor.
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
          {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Prompt Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Pregunta sobre límites, Shibari, D/s o Aftercare..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendPrompt()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSendPrompt()}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },
  keyBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 4 },
  keyBtnText: { color: colors.text, fontSize: 11, fontWeight: '700' },

  keyBox: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, gap: 4, marginVertical: 4 },
  keyLabel: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  keyInput: { backgroundColor: colors.background, borderRadius: radii.sm, padding: 8, color: colors.text, fontSize: 11 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.xs },
  chip: { backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.primary, fontSize: 11, fontWeight: '700' },

  scroll: { flexGrow: 1, gap: spacing.sm, paddingVertical: spacing.xs },
  emptyBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, marginTop: spacing.md },
  emptyTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  msgBubble: { borderRadius: radii.lg, padding: spacing.md, maxWidth: '85%', gap: 4 },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  userMsgText: { color: colors.onPrimary, fontSize: fontSize.xs },
  aiMsgText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 20 },
  timestamp: { color: 'rgba(255,255,255,0.4)', fontSize: 9, alignSelf: 'flex-end' },

  inputRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: spacing.md },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.xs,
  },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },
});
