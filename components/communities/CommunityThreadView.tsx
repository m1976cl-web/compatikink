import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';
import { CommunityTopic } from '@/data/communitiesData';

interface Props {
  topic: CommunityTopic;
  onSendReply: (content: string) => Promise<void>;
}

export function CommunityThreadView({ topic, onSendReply }: Props) {
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!replyInput.trim() || sending) return;
    setSending(true);
    try {
      await onSendReply(replyInput.trim());
      setReplyInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Original Post Banner Card */}
      <View style={styles.threadOriginalPostCard}>
        {topic.isPinned && (
          <View style={styles.pinnedPill}>
            <Text style={styles.pinnedPillText}>📌 GUÍA DE BUENAS PRÁCTICAS</Text>
          </View>
        )}

        <Text style={styles.threadTitle}>{topic.title}</Text>

        <View style={styles.topicAuthorRow}>
          <Text style={{ fontSize: 14 }}>{topic.authorEmoji || '👤'}</Text>
          <Text style={styles.topicAuthorText}>{topic.author}</Text>
          {topic.authorRole && (
            <View style={styles.authorRoleBadge}>
              <Text style={styles.authorRoleBadgeText}>{topic.authorRole}</Text>
            </View>
          )}
          <Text style={styles.topicTimeText}>· {topic.timeAgo}</Text>
        </View>

        <Text style={styles.threadFullContent}>{topic.content}</Text>

        <View style={styles.tagsRow}>
          {topic.tags.map((t, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagChipText}>#{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Replies List */}
      <View style={styles.repliesSection}>
        <Text style={styles.repliesSectionTitle}>
          💬 Respuestas de la Comunidad ({(topic.replies || []).length})
        </Text>

        {(topic.replies || []).map((rep) => (
          <View key={rep.id} style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <Text style={{ fontSize: 14 }}>{rep.authorEmoji || '👤'}</Text>
              <Text style={styles.replyAuthor}>{rep.author}</Text>
              {rep.authorRole && (
                <View style={styles.authorRoleBadge}>
                  <Text style={styles.authorRoleBadgeText}>{rep.authorRole}</Text>
                </View>
              )}
              {rep.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ Verificado</Text>
                </View>
              )}
              <Text style={styles.topicTimeText}>· {rep.timeAgo}</Text>
            </View>
            <Text style={styles.replyContent}>{rep.content}</Text>
          </View>
        ))}

        {(!topic.replies || topic.replies.length === 0) && (
          <View style={styles.emptyRepliesBox}>
            <Text style={styles.emptyRepliesText}>
              Aún no hay respuestas en este debate. ¡Sé el primero en aportar!
            </Text>
          </View>
        )}
      </View>

      {/* Reply Input Form */}
      <View style={styles.replyInputBox}>
        <Text style={styles.replyInputLabel}>✍️ Tu Aporte / Consejo para la Comunidad:</Text>
        <TextInput
          style={styles.replyInput}
          multiline
          placeholder="Escribe una respuesta constructiva y respetuosa..."
          placeholderTextColor={colors.textMuted}
          value={replyInput}
          onChangeText={setReplyInput}
        />
        <TouchableOpacity
          style={[styles.sendReplyBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendReplyBtnText}>
            {sending ? 'Enviando...' : 'Enviar Respuesta Cifrada 💬'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  threadOriginalPostCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  pinnedPill: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pinnedPillText: { color: colors.primary, fontSize: 9, fontFamily: fonts.bodyBold },
  threadTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.lg },
  topicAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicAuthorText: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  authorRoleBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  authorRoleBadgeText: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bodySemi },
  topicTimeText: { color: colors.textMuted, fontSize: 10 },
  threadFullContent: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: { backgroundColor: colors.surfaceLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  tagChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.mono },
  repliesSection: { gap: spacing.xs },
  repliesSectionTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.xs, marginBottom: 2 },
  replyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyAuthor: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  verifiedBadge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  verifiedBadgeText: { color: '#38bdf8', fontSize: 9, fontFamily: fonts.bodyBold },
  replyContent: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  emptyRepliesBox: { padding: spacing.lg, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md },
  emptyRepliesText: { color: colors.textMuted, fontSize: fontSize.xs },
  replyInputBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  replyInputLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodyBold },
  replyInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    fontSize: fontSize.xs,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendReplyBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: radii.md, alignItems: 'center' },
  sendReplyBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
});
