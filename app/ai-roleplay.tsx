import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography, glowShadowPrimary } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { askGeminiAssistant } from '@/lib/geminiAssistant';
import { listMyLocalSessions } from '@/lib/storage';
import { generateReport } from '@/lib/compatibility';
import { Session, CompatibilityReport } from '@/types';
import { triggerLightHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from '@/lib/haptics';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  initialMessage: string;
  color: string;
  emoji: string;
}

const AI_PERSONAS: AIPersona[] = [
  {
    id: 'ai-nox',
    name: 'Nox (Mentor Noir)',
    role: 'Asistente de Dinámicas & Concierge ZK',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60',
    bio: 'Mentor en dinámicas alternativas, negociación de consentimiento y equilibrio de poder.',
    initialMessage: 'Bienvenido/a al espacio confidencial de simulación. Puedo ayudarte a ensayar una negociación, explorar una fantasía o repasar un protocolo antes de tu escena real.',
    color: '#c084fc',
    emoji: '🖤',
  },
  {
    id: 'ai-1',
    name: 'Sir Nicholas',
    role: 'Dominante Exigente & Riguroso',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    bio: 'Especialista en protocolos D/s, control de disciplina y establecimiento de límites claros.',
    initialMessage: 'Bienvenido/a. Antes de comenzar, dime cuáles son tus límites duros (Hard Limits) para que nuestra negociación sea 100% segura.',
    color: '#fbbf24',
    emoji: '🗝️',
  },
  {
    id: 'ai-2',
    name: 'Aria (Shibari Sensei)',
    role: 'Rope Top & Maestra de Shibari',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    bio: 'Experta en geometría de ataduras, estética del dolor consensuado y seguridad en nervios periféricos.',
    initialMessage: 'Hola. El Shibari es una meditación de dos personas. ¿Tienes alguna lesión previa en hombros o muñecas que deba considerar?',
    color: '#f472b6',
    emoji: '🪢',
  },
  {
    id: 'ai-3',
    name: 'Mistress Katherine',
    role: 'Keyholder & Control de Castidad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60',
    bio: 'Enfocada en dinámicas de denegación de orgasmo, tareas de recompensa y disciplina constante.',
    initialMessage: 'Saludos. La llave está en mis manos. Cuéntame cuál es tu objetivo en la castidad y cuánto tiempo deseas negociar.',
    color: '#38bdf8',
    emoji: '👑',
  },
];

interface ChatMsg {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const STORAGE_KEY_ROLEPLAY_CHATS = 'ai_roleplay_chats_v1';

function AIRoleplayScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [chatsMap, setChatsMap] = useState<Record<string, ChatMsg[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [useReportContext, setUseReportContext] = useState(false);

  // Load saved Zero-Knowledge chats & local sessions
  useEffect(() => {
    readJsonStorage<Record<string, ChatMsg[]>>(STORAGE_KEY_ROLEPLAY_CHATS, {}).then((saved) => {
      if (saved) setChatsMap(saved);
    });
    listMyLocalSessions().then(setSessions).catch(() => {});
  }, []);

  const latestSession = sessions.find((s) => s.guestResponses);
  const activeReport = latestSession
    ? generateReport(
        latestSession.id,
        latestSession.initiatorResponses,
        latestSession.guestResponses!,
        latestSession.initiatorProfile,
        latestSession.guestProfile
      )
    : null;

  const currentMessages = chatsMap[selectedPersona.id] || [
    { sender: 'ai', text: selectedPersona.initialMessage, time: 'Ahora' },
  ];

  const handleSelectPersona = (p: AIPersona) => {
    triggerSelectionHaptic();
    setSelectedPersona(p);
  };

  const handleClearChat = async () => {
    triggerLightHaptic();
    Alert.alert('Limpiar Conversación', '¿Deseas reiniciar esta simulación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        style: 'destructive',
        onPress: async () => {
          const resetMap: Record<string, ChatMsg[]> = {
            ...chatsMap,
            [selectedPersona.id]: [
              { sender: 'ai' as const, text: selectedPersona.initialMessage, time: 'Ahora' },
            ],
          };
          setChatsMap(resetMap);
          await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, resetMap);
          triggerSuccessHaptic();
        },
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend || inputText;
    if (!raw.trim() || isTyping) return;

    triggerLightHaptic();
    const userMsgText = raw.trim();
    const newMsg: ChatMsg = { sender: 'user', text: userMsgText, time: 'Ahora' };

    const updatedList = [...currentMessages, newMsg];
    const newMap = { ...chatsMap, [selectedPersona.id]: updatedList };

    setChatsMap(newMap);
    setInputText('');
    setIsTyping(true);
    await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, newMap);

    // Context from compatibility report if toggled
    let reportContextSnippet = '';
    if (useReportContext && activeReport) {
      reportContextSnippet = ` Contexto de compatibilidad del usuario: afinidad general ${activeReport.compatibilityScore}%.`;
    }

    // Call Gemini AI for response with persona context
    try {
      const prompt = `Asume el rol de "${selectedPersona.name}" (${selectedPersona.role}). ${selectedPersona.bio}.${reportContextSnippet} El usuario dice: "${userMsgText}". Responde manteniendo el personaje en 2 o 3 oraciones reflexivas y seguras, enfatizando consentimiento SSC/RACK y buena comunicación.`;
      const aiReply = await askGeminiAssistant(prompt);

      const replyMsg: ChatMsg = { sender: 'ai', text: aiReply, time: 'Ahora' };
      const finalMap = { ...newMap, [selectedPersona.id]: [...updatedList, replyMsg] };
      setChatsMap(finalMap);
      await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, finalMap);
    } catch {
      const fallbackMsg: ChatMsg = {
        sender: 'ai',
        text: `Entendido. Como ${selectedPersona.role}, mantendremos la escena negociada dentro de los límites y protocolos de seguridad acordados.`,
        time: 'Ahora',
      };
      const finalMap = { ...newMap, [selectedPersona.id]: [...updatedList, fallbackMsg] };
      setChatsMap(finalMap);
      await writeJsonStorage(STORAGE_KEY_ROLEPLAY_CHATS, finalMap);
    } finally {
      setIsTyping(false);
    }
  };

  const scenarioStarters = [
    '¿Cómo negociamos safewords antes de empezar?',
    'Quiero ensayar un protocolo de servicio matutino.',
    'Siento un poco de ansiedad con las cuerdas, ¿qué me recomiendas?',
    'Simulemos una escena de Aftercare con té y mantas.',
  ];

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearChat} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Reiniciar 🔄</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Roleplay Confidencial con IA 🤖</Text>
          <Text style={styles.subtitle}>
            Ensaya dinámicas, negociaciones y protocolos en un chat Zero-Knowledge totalmente privado
          </Text>
        </View>

        {/* Persona Selector Carousel */}
        <View style={styles.personaSection}>
          <Text style={styles.sectionLabel}>SELECCIONA TU COMPAÑERO/A DE ENSAYO:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personaRow}>
            {AI_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personaChip, isSelected && { borderColor: p.color, backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}
                  onPress={() => handleSelectPersona(p)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                  <View>
                    <Text style={[styles.personaName, isSelected && { color: p.color }]}>{p.name}</Text>
                    <Text style={styles.personaRole} numberOfLines={1}>{p.role}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Report Context Toggle */}
        {activeReport && (
          <TouchableOpacity
            style={[styles.contextToggleBox, useReportContext && styles.contextToggleBoxActive]}
            onPress={() => {
              triggerLightHaptic();
              setUseReportContext(!useReportContext);
            }}
          >
            <Text style={styles.contextToggleEmoji}>{useReportContext ? '🔗' : '⚪'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.contextToggleTitle}>
                {useReportContext ? 'Contexto de Reporte Vinculado ✓' : 'Vincular Reporte de Compatibilidad (Opcional)'}
              </Text>
              <Text style={styles.contextToggleSub}>
                Permite a {selectedPersona.name} adaptar sus consejos según su afinidad de pareja ({activeReport.compatibilityScore}%)
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Chat Messages */}
        <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>
          {currentMessages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={idx}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAi,
                ]}
              >
                {!isUser && <Text style={{ fontSize: 18, marginTop: 2 }}>{selectedPersona.emoji}</Text>}
                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAi,
                  ]}
                >
                  <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.msgRow, styles.msgRowAi]}>
              <Text style={{ fontSize: 18 }}>{selectedPersona.emoji}</Text>
              <View style={[styles.msgBubble, styles.msgBubbleAi]}>
                <Text style={[styles.msgText, styles.msgTextAi, { fontStyle: 'italic' }]}>
                  {selectedPersona.name} está pensando...
                </Text>
              </View>
            </View>
          )}

          {/* Quick Scenario Starters */}
          {currentMessages.length <= 2 && (
            <View style={styles.startersWrap}>
              <Text style={styles.startersTitle}>💡 Ideas rápidas para iniciar:</Text>
              <View style={styles.startersRow}>
                {scenarioStarters.map((text, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.starterChip}
                    onPress={() => handleSendMessage(text)}
                  >
                    <Text style={styles.starterChipText}>💬 {text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`Escribe a ${selectedPersona.name}...`}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isTyping) && { opacity: 0.5 }]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

export default function AIRoleplayScreen() {
  return (
    <RouteFeatureGuard route="/ai-roleplay" title="Roleplay IA Confidencial">
      <AIRoleplayScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 2 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.sm, backgroundColor: colors.surfaceLight },
  clearBtnText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs, lineHeight: 17 },

  personaSection: { marginVertical: spacing.xs, gap: 4 },
  sectionLabel: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bodyBold, letterSpacing: 0.5 },
  personaRow: { gap: 6, paddingVertical: 2 },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personaName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  personaRole: { color: colors.textMuted, fontSize: 9, maxWidth: 140 },

  contextToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  contextToggleBoxActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderColor: colors.primary,
  },
  contextToggleEmoji: { fontSize: 14 },
  contextToggleTitle: { color: colors.text, fontSize: 10, fontFamily: fonts.bodyBold },
  contextToggleSub: { color: colors.textMuted, fontSize: 9 },

  chatScroll: { flex: 1 },
  chatScrollContent: { gap: spacing.sm, paddingVertical: spacing.xs },
  msgRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '82%', padding: spacing.sm, borderRadius: radii.lg },
  msgBubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 2 },
  msgBubbleAi: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 2 },
  msgText: { fontSize: fontSize.xs, lineHeight: 18 },
  msgTextUser: { color: '#000', fontFamily: fonts.bodySemi },
  msgTextAi: { color: colors.text, fontFamily: fonts.body },

  startersWrap: { marginTop: spacing.md, gap: 6 },
  startersTitle: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodyBold },
  startersRow: { gap: 4 },
  starterChip: {
    backgroundColor: colors.surfaceLight,
    padding: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  starterChipText: { color: colors.primary, fontSize: 10, fontFamily: fonts.bodySemi },

  inputBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
});
