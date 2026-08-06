import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { VaultLockGate } from '@/components/VaultLockGate';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import {
  PartnerLink,
  RELATIONSHIP_LABELS,
  getPartnerLinks,
} from '@/lib/partnerJournal';
import {
  ChatMessage,
  EphemeralTimer,
  EPHEMERAL_TIMER_LABELS,
  getPartnerMessages,
  sendPartnerMessage,
  revealOrReadMessage,
  acceptChatChallenge,
} from '@/lib/partnerChat';

export default function PartnerChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ linkId?: string }>();
  const { isDesktop } = useResponsive();

  const [vaultUnlocked, setVaultUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<PartnerLink | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Input & Timer State
  const [inputText, setInputText] = useState('');
  const [selectedTimer, setSelectedTimer] = useState<EphemeralTimer>('none');

  // Challenge Modal / Mode
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);
  const [chTitleInput, setChTitleInput] = useState('');
  const [chXpInput, setChXpInput] = useState('100');

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    return VaultLockGateAPI.subscribe((snap) => setVaultUnlocked(snap.unlocked));
  }, []);

  useEffect(() => {
    if (vaultUnlocked) {
      loadLinks();
    }
  }, [vaultUnlocked]);

  useEffect(() => {
    if (selectedLink) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedLink]);

  const loadLinks = async () => {
    const links = await getPartnerLinks();
    setPartnerLinks(links);
    if (links.length > 0) {
      const target = params.linkId ? links.find((l) => l.id === params.linkId) || links[0] : links[0];
      setSelectedLink(target);
    }
  };

  const loadMessages = async () => {
    if (!selectedLink) return;
    const list = await getPartnerMessages(selectedLink.id);
    setMessages(list);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedLink) return;
    const textToSend = inputText.trim();
    setInputText('');

    await sendPartnerMessage(
      selectedLink.id,
      'Tú',
      textToSend,
      selectedTimer,
      'text'
    );

    await loadMessages();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSendChallenge = async () => {
    if (!chTitleInput.trim() || !selectedLink) {
      Alert.alert('Título requerido', 'Ingresa un título para el reto de pareja.');
      return;
    }
    const xp = parseInt(chXpInput) || 100;
    const title = chTitleInput.trim();

    await sendPartnerMessage(
      selectedLink.id,
      'Tú',
      `🎯 RETO DE PAREJA: "${title}" (+${xp} XP)`,
      'none',
      'challenge',
      {
        title,
        xpReward: xp,
        completed: false,
      }
    );

    setIsSendingChallenge(false);
    setChTitleInput('');
    Alert.alert('Reto Enviado 🎯', `Reto enviado a ${selectedLink.partnerName}.`);
    await loadMessages();
  };

  const handleRevealMessage = async (msg: ChatMessage) => {
    await revealOrReadMessage(msg.id);
    await loadMessages();
  };

  const handleAcceptChallenge = async (msgId: string) => {
    const success = await acceptChatChallenge(msgId);
    if (success) {
      Alert.alert('¡Desafío Cumplido! 🎉', '¡Puntos XP añadidos con éxito al vínculo de pareja!');
      loadLinks();
      loadMessages();
    }
  };

  return (
    <ScreenContainer title="Chat E2EE Efímero" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>

          {/* Partner Selector Header */}
          {selectedLink ? (
            <View style={styles.partnerHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.partnerTitle}>{selectedLink.partnerName}</Text>
                  <Text style={styles.relTag}>
                    {RELATIONSHIP_LABELS[selectedLink.relationshipType].emoji}{' '}
                    {RELATIONSHIP_LABELS[selectedLink.relationshipType].label}
                  </Text>
                </View>
                <Text style={styles.partnerMeta}>
                  ⭐ Nivel {selectedLink.level} · {selectedLink.totalXp} XP de Afinidad · Canal Cifrado AES-GCM
                </Text>
              </View>

              {partnerLinks.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 140 }}>
                  {partnerLinks.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.miniPartnerChip, selectedLink.id === l.id && styles.miniPartnerChipActive]}
                      onPress={() => setSelectedLink(l)}
                    >
                      <Text style={styles.miniPartnerText}>{l.partnerName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <Text style={styles.title}>Chat Cifrado de Vínculos 💬🔐</Text>
          )}
        </View>

        <VaultLockGate
          title="Bóveda de Mensajería Efímera"
          subtitle="Ingresa tu PIN para desbloquear el canal cifrado con tu pareja."
          showLockButton
        >
          {!selectedLink ? (
            <View style={styles.noLinkCard}>
              <Text style={styles.noLinkTitle}>🔗 No tienes parejas o vínculos activos</Text>
              <Text style={styles.noLinkDesc}>
                Crea primero un vínculo con tu pareja o amigo de juego en la sección Vínculos & Diario para chatear.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/partner-journal')}
              >
                <Text style={styles.primaryBtnText}>Ir a Vínculos & Diario 🔗</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* Ephemeral Timer Selector Bar */}
              <View style={styles.timerSelectorRow}>
                <Text style={styles.timerBarLabel}>🔥 Autodestrucción:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timerChips}>
                  {(['none', 'read_once', '10s', '1m', '5m'] as const).map((tKey) => {
                    const info = EPHEMERAL_TIMER_LABELS[tKey];
                    const sel = selectedTimer === tKey;
                    return (
                      <TouchableOpacity
                        key={tKey}
                        style={[styles.timerChip, sel && styles.timerChipActive]}
                        onPress={() => setSelectedTimer(tKey)}
                      >
                        <Text style={[styles.timerChipText, sel && styles.timerChipTextActive]}>
                          {info.emoji} {info.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Chat Feed */}
              <ScrollView
                ref={scrollRef}
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => {
                  const isEphemeral = msg.ephemeralTimer !== 'none';
                  const isLockedView = isEphemeral && !msg.isRevealed;

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgBubble,
                        msg.isSelf ? styles.msgSelf : styles.msgPartner,
                        isEphemeral && styles.msgEphemeralBorder,
                      ]}
                    >
                      <View style={styles.msgMetaHeader}>
                        <Text style={styles.senderName}>{msg.senderName}</Text>
                        <Text style={styles.timerBadge}>
                          {EPHEMERAL_TIMER_LABELS[msg.ephemeralTimer].emoji}{' '}
                          {EPHEMERAL_TIMER_LABELS[msg.ephemeralTimer].label}
                        </Text>
                      </View>

                      {/* Ephemeral Lock Overlay */}
                      {isLockedView ? (
                        <TouchableOpacity
                          style={styles.lockedCover}
                          onPress={() => handleRevealMessage(msg)}
                        >
                          <Text style={styles.lockedIcon}>🔒</Text>
                          <Text style={styles.lockedText}>
                            Mensaje Cifrado Efímero ({EPHEMERAL_TIMER_LABELS[msg.ephemeralTimer].label})
                          </Text>
                          <Text style={styles.clickToRevealText}>Toca para revelar e iniciar temporizador 👁️</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.revealedBox}>
                          <Text style={styles.msgText}>{msg.content}</Text>

                          {/* Challenge acceptance box */}
                          {msg.type === 'challenge' && msg.challengeData && (
                            <View style={styles.challengeBox}>
                              <Text style={styles.chBoxTitle}> Reto: {msg.challengeData.title}</Text>
                              <Text style={styles.chBoxXp}>Recompensa: +{msg.challengeData.xpReward} XP</Text>
                              {msg.challengeData.completed ? (
                                <Text style={styles.chCompletedText}>✓ Reto Cumplido (+XP sumados)</Text>
                              ) : (
                                <TouchableOpacity
                                  style={styles.acceptChBtn}
                                  onPress={() => handleAcceptChallenge(msg.id)}
                                >
                                  <Text style={styles.acceptChBtnText}>Aceptar & Sumar XP ✓</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>
                      )}

                      <Text style={styles.timeText}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Challenge Form Modal / Drawer */}
              {isSendingChallenge ? (
                <View style={styles.challengeFormBox}>
                  <Text style={styles.chFormTitle}>🎯 Proponer Reto Directo en Chat</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Masaje de 10 min, Cumplir regla de etiqueta..."
                    placeholderTextColor={colors.textDim}
                    value={chTitleInput}
                    onChangeText={setChTitleInput}
                  />
                  <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsSendingChallenge(false)}>
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sendChBtn} onPress={handleSendChallenge}>
                      <Text style={styles.sendChBtnText}>Enviar Reto (+100 XP) 🎯</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Bottom Input Action Bar */}
              <View style={styles.inputBar}>
                <TouchableOpacity
                  style={styles.attachChallengeBtn}
                  onPress={() => setIsSendingChallenge(!isSendingChallenge)}
                >
                  <Text style={styles.attachChallengeBtnText}>🎯 Reto</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.chatInput}
                  placeholder={
                    selectedTimer === 'none'
                      ? 'Escribe un mensaje cifrado...'
                      : `Mensaje efímero (${EPHEMERAL_TIMER_LABELS[selectedTimer].label})...`
                  }
                  placeholderTextColor={colors.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                />

                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                  <Text style={styles.sendBtnText}>Enviar 🚀</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </VaultLockGate>
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

  partnerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(21, 13, 36, 0.95)',
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  partnerTitle: { fontFamily: fonts.displaySemi, color: '#ffffff', fontSize: fontSize.md, fontWeight: '800' },
  relTag: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  partnerMeta: { color: colors.textMuted, fontSize: 10 },
  miniPartnerChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.surface, marginRight: 4 },
  miniPartnerChipActive: { backgroundColor: colors.primary },
  miniPartnerText: { color: colors.text, fontSize: 10, fontWeight: '700' },

  noLinkCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  noLinkTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  noLinkDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.md },
  primaryBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },

  timerSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  timerBarLabel: { color: colors.textDim, fontSize: 10, fontFamily: fonts.bodySemi },
  timerChips: { flexDirection: 'row', gap: 4 },
  timerChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerChipActive: { backgroundColor: 'rgba(244, 114, 182, 0.2)', borderColor: '#f472b6' },
  timerChipText: { color: colors.textMuted, fontSize: 10 },
  timerChipTextActive: { color: '#f472b6', fontWeight: '800' },

  feed: { flex: 1, marginVertical: spacing.xs },
  feedContent: { gap: spacing.sm, paddingBottom: spacing.md },

  msgBubble: {
    maxWidth: '85%',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  msgSelf: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  msgPartner: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  msgEphemeralBorder: { borderStyle: 'dashed' },

  msgMetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  senderName: { fontSize: 10, fontFamily: fonts.bodySemi, color: colors.textDim, fontWeight: '800' },
  timerBadge: { fontSize: 9, color: colors.textDim },

  lockedCover: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#f472b6',
  },
  lockedIcon: { fontSize: 18 },
  lockedText: { color: '#f472b6', fontSize: 10, fontWeight: '800' },
  clickToRevealText: { color: colors.textMuted, fontSize: 9 },

  revealedBox: { gap: 4 },
  msgText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 18 },

  challengeBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: 4,
    gap: 2,
  },
  chBoxTitle: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },
  chBoxXp: { color: colors.textMuted, fontSize: 10 },
  acceptChBtn: { backgroundColor: '#fbbf24', borderRadius: radii.sm, paddingVertical: 4, alignItems: 'center', marginTop: 4 },
  acceptChBtnText: { color: '#07050a', fontSize: 10, fontWeight: '900' },
  chCompletedText: { color: colors.success, fontSize: 10, fontWeight: '800', marginTop: 2 },

  timeText: { fontSize: 8, color: colors.textDim, alignSelf: 'flex-end', marginTop: 2 },

  challengeFormBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fbbf24',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chFormTitle: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  attachChallengeBtn: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: '#fbbf24' },
  attachChallengeBtnText: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },

  chatInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10 },
  sendBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },

  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtn: { flex: 1, backgroundColor: colors.background, borderRadius: radii.md, paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: 11 },
  sendChBtn: { flex: 2, backgroundColor: '#fbbf24', borderRadius: radii.md, paddingVertical: 8, alignItems: 'center' },
  sendChBtnText: { color: '#07050a', fontSize: 11, fontWeight: '900' },
});
