import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { askGeminiAssistant } from '@/lib/geminiAssistant';

interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  initialMessage: string;
}

const AI_PERSONAS: AIPersona[] = [
  {
    id: 'ai-1',
    name: 'Sir Nicholas',
    role: 'Dominante Exigente & Riguroso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    bio: 'Especialista en protocolos D/s, control de disciplina y establecimiento de límites claros.',
    initialMessage: 'Bienvenido/a. Antes de comenzar, dime cuáles son tus límites duros (Hard Limits) para que nuestra negociación sea 100% segura.',
  },
  {
    id: 'ai-2',
    name: 'Aria (Shibari Sensei)',
    role: 'Rope Top & Maestra de Shibari',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    bio: 'Experta en geometría de ataduras, estética del dolor consensuado y seguridad en nervios periféricos.',
    initialMessage: 'Hola. El Shibari es una meditación de dos personas. ¿Tienes alguna lesión previa en hombros o muñecas que deba considerar?',
  },
  {
    id: 'ai-3',
    name: 'Mistress Katherine',
    role: 'Keyholder & Control de Castidad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60',
    bio: 'Enfocada en dinámicas de denegación de orgasmo, tareas de recompensa y disciplina constante.',
    initialMessage: 'Saludos. La llave está en mis manos. Cuéntame cuál es tu objetivo en la castidad y cuánto tiempo deseas negociar.',
  },
];

interface ChatMsg {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const STORAGE_KEY_ROLEPLAY_CHATS = 'ai_roleplay_chats_v1';

export default function AIRoleplayScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [chatsMap, setChatsMap] = useState<Record<string, ChatMsg[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load saved Zero-Knowledge chats on mount
  useEffect(() => {
    readJsonStorage<Record<string, ChatMsg[]>>(STORAGE_KEY_ROLEPLAY_CHATS, {}).then((saved) => {
      if (saved) setChatsMap(saved);
    });
  }, []);

  const currentMessages = chatsMap[selectedPersona.id] || [
    { sender: 'ai', text: selectedPersona.initialMessage, time: 'Ahora' },
  ];

  const handleSelectPersona = (p: AIPersona) => {
    setSelectedPersona(p);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newMsg: ChatMsg = { sender: 'user', text: userMsgText, time: 'Ahora' };

    const updatedList = [...currentMessages, newMsg];
    const newMap = { ...chatsMap, [selectedPersona.id]: updatedList };

    setChatsMap(newMap);
    setInputText('');
    setIsTyping(true);
    await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, newMap);

    // Call Gemini AI for response with persona context
    try {
      const prompt = `Asume el rol de "${selectedPersona.name}" (${selectedPersona.role}). ${selectedPersona.bio}. El usuario dice: "${userMsgText}". Responde manteniendo el rol en 2-3 frases, priorizando siempre el consentimiento y la seguridad BDSM (SSC/RACK).`;
      const aiReply = await askGeminiAssistant(prompt);
      
      const replyMsg: ChatMsg = { sender: 'ai', text: aiReply, time: 'Ahora' };
      const finalMap = { ...newMap, [selectedPersona.id]: [...updatedList, replyMsg] };
      setChatsMap(finalMap);
      await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, finalMap);
    } catch {
      const fallbackMsg: ChatMsg = {
        sender: 'ai',
        text: `Entendido. Como ${selectedPersona.role}, mantendremos la escena negociada dentro de los límites y protocolos de seguridad.`,
        time: 'Ahora',
      };
      const finalMap = { ...newMap, [selectedPersona.id]: [...updatedList, fallbackMsg] };
      setChatsMap(finalMap);
      await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, finalMap);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Roleplay confidencial por IA 🤖</Text>
          <Text style={styles.subtitle}>
            Ensaya dinámicas, negociaciones y protocolos D/s en un chat Zero-Knowledge totalmente privado
          </Text>
        </View>

        {/* Persona Selector Carousel */}
        <View style={styles.personaSection}>
          <Text style={styles.sectionLabel}>SELECCIONA TU COMPAÑERO/A DE ENSAYO:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personaRow}>
            {AI_PERSONAS.map((p) => {
              const active = selectedPersona.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personaChip, active && styles.personaChipActive]}
                  onPress={() => handleSelectPersona(p)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: p.avatar }} style={styles.avatarImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personaName, active && styles.personaNameActive]}>{p.name}</Text>
                    <Text style={styles.personaRole} numberOfLines={1}>{p.role}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chat Area */}
        <ScrollView style={styles.chatBox} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {currentMessages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <View key={idx} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
                <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAI]}>
                  <Text style={styles.msgText}>{m.text}</Text>
                </View>
              </View>
            );
          })}

          {isTyping ? (
            <View style={styles.msgRowAI}>
              <View style={styles.msgBubbleAI}>
                <Text style={styles.typingText}>{selectedPersona.name} está respondiendo...</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje o propuesta de escena..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage} activeOpacity={0.8}>
            <Text style={styles.sendBtnText}>Enviar ➔</Text>
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

  personaSection: { marginVertical: spacing.xs, gap: 4 },
  sectionLabel: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1 },
  personaRow: { gap: spacing.xs, paddingVertical: 4 },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xs,
    width: 220,
    gap: spacing.xs,
  },
  personaChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  avatarImg: { width: 36, height: 36, borderRadius: radii.pill },
  personaName: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  personaNameActive: { color: colors.primary },
  personaRole: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },

  chatBox: { flex: 1, marginVertical: spacing.xs },
  chatContent: { gap: spacing.sm, paddingVertical: spacing.xs },
  msgRow: { flexDirection: 'row', width: '100%' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },

  msgBubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  msgBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  msgBubbleAI: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  msgText: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 20 },
  typingText: { color: colors.primary, fontFamily: fonts.body, fontSize: fontSize.xs, fontStyle: 'italic' },

  inputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
