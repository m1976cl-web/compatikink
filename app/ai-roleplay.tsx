import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

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

export default function AIRoleplayScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: 'ai', text: AI_PERSONAS[0].initialMessage, time: 'Ahora' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPersona = (p: AIPersona) => {
    setSelectedPersona(p);
    setMessages([{ sender: 'ai', text: p.initialMessage, time: 'Ahora' }]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newMsg: ChatMsg = { sender: 'user', text: userMsgText, time: 'Ahora' };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI Roleplay response
    setTimeout(() => {
      let aiReplyText = `Entendido. En nuestra dinámica con rol de ${selectedPersona.role}, el consentimiento y la seguridad son prioridad. ¿Cómo deseas proceder?`;

      if (userMsgText.toLowerCase().includes('limite') || userMsgText.toLowerCase().includes('rojo')) {
        aiReplyText = 'Entendido. Registro perfectamente tu límite. Mantendremos la escena dentro de la zona de confort negociada.';
      } else if (userMsgText.toLowerCase().includes('hola') || userMsgText.toLowerCase().includes('buenas')) {
        aiReplyText = `Hola. Me alegra que estés aquí. Cuéntame qué fantasía o protocolo deseas ensayar hoy conmigo.`;
      } else if (userMsgText.toLowerCase().includes('cuerda') || userMsgText.toLowerCase().includes('atadura')) {
        aiReplyText = 'Excelente elección. Recuerda que nunca ataremos cerca de las articulaciones principales sin revisar la circulación cada 5 minutos.';
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiReplyText, time: 'Ahora' }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🤖 Roleplay con Inteligencia Artificial</Text>
          <Text style={styles.subtitle}>
            Ensayo de dinámicas BDSM, simulación de negociación y exploración de fantasías en un entorno seguro
          </Text>
        </View>

        {/* Persona Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personaScroll}>
          {AI_PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.personaChip, selectedPersona.id === p.id && styles.personaChipActive]}
              onPress={() => handleSelectPersona(p)}
            >
              <Image source={{ uri: p.avatar }} style={styles.personaAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.personaName, selectedPersona.id === p.id && { color: '#fff' }]}>{p.name}</Text>
                <Text style={styles.personaRole}>{p.role}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat Messages */}
        <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
          {messages.map((m, idx) => (
            <View
              key={idx}
              style={[
                styles.bubble,
                m.sender === 'user' ? styles.bubbleUser : styles.bubbleAI,
              ]}
            >
              <Text style={styles.senderLabel}>
                {m.sender === 'user' ? 'Tú' : selectedPersona.name}
              </Text>
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          ))}

          {isTyping && (
            <Text style={styles.typingText}>🤖 {selectedPersona.name} está escribiendo...</Text>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={`Habla con ${selectedPersona.name}...`}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
            <Text style={styles.sendBtnText}>Enviar 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  personaScroll: { gap: spacing.xs, marginVertical: spacing.xs },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: spacing.xs,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    width: 220,
  },
  personaChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  personaAvatar: { width: 36, height: 36, borderRadius: 18 },
  personaName: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  personaRole: { color: colors.textMuted, fontSize: 9 },

  chatScroll: { gap: spacing.sm, paddingVertical: spacing.xs },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: 16, gap: 2 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.primaryDark, borderBottomRightRadius: 4 },
  bubbleAI: { alignSelf: 'flex-start', backgroundColor: colors.surfaceLight, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  senderLabel: { color: colors.primaryLight, fontSize: 10, fontWeight: '800' },
  bubbleText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  typingText: { color: colors.textMuted, fontSize: 10, fontStyle: 'italic', alignSelf: 'flex-start' },

  inputRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 14, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
