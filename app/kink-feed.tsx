import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';

interface FeedPost {
  id: string;
  author: string;
  isVerified: boolean;
  timeAgo: string;
  content: string;
  likes: number;
  category: 'Encuesta' | 'Debate' | 'Consejo' | 'Aftercare';
  pollOptions?: { option: string; votes: number }[];
  userVotedIdx?: number;
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'fp-1',
    author: 'Anónimo_RopeMaster',
    isVerified: true,
    timeAgo: 'hace 35 min',
    category: 'Encuesta',
    content: '¿Cuál es tu tipo de cuerda favorita para ataduras de suspensión corporal y Shibari?',
    likes: 42,
    pollOptions: [
      { option: 'Yute tratada con aceite de jojoba', votes: 128 },
      { option: 'Cáñamo natural', votes: 64 },
      { option: 'Algodón suave', votes: 31 },
      { option: 'Seda / Fibras sintéticas', votes: 15 },
    ],
  },
  {
    id: 'fp-2',
    author: 'Sensual_Mind',
    isVerified: false,
    timeAgo: 'hace 2 horas',
    category: 'Consejo',
    content: 'Recuerden que el Aftercare no es solo para el sumiso/bottom. El dominante (top) también puede experimentar "Topdrop" (sensación de fatiga o bajón emocional) tras administrar escenas de alta intensidad. Tomen agua y descansen juntos.',
    likes: 89,
  },
];

export default function KinkFeedScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Encuesta' | 'Debate' | 'Consejo' | 'Aftercare'>('Debate');

  const handleVotePoll = (postId: string, optionIdx: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.pollOptions && p.userVotedIdx === undefined) {
          const updatedOptions = p.pollOptions.map((opt, idx) =>
            idx === optionIdx ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return { ...p, pollOptions: updatedOptions, userVotedIdx: optionIdx };
        }
        return p;
      })
    );
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;

    const post: FeedPost = {
      id: `fp-${Date.now()}`,
      author: 'Tú (Anónimo)',
      isVerified: false,
      timeAgo: 'hace un momento',
      category: selectedCategory,
      content: newPostText.trim(),
      likes: 1,
    };

    setPosts([post, ...posts]);
    setNewPostText('');
    Alert.alert('Publicado 📰', 'Tu publicación ha sido compartida anónimamente en el Feed de la Comunidad.');
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Feed & Encuestas de la Comunidad</Text>
          <Text style={styles.subtitle}>
            Muro de debate anónimo, encuestas diarias y consejos de seguridad inspirados en la comunidad Mazmo
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Create Post Box */}
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>✍️ Publicar en el Feed Anónimo</Text>

            <TextInput
              style={styles.createInput}
              placeholder="Comparte una reflexión, pregunta de seguridad o experiencia..."
              placeholderTextColor={colors.textMuted}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.publishBtn} onPress={handleCreatePost}>
              <Text style={styles.publishBtnText}>Publicar Anónimamente 🚀</Text>
            </TouchableOpacity>
          </View>

          {/* Feed Posts */}
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postAuthor}>
                    {post.author} {post.isVerified ? '✓' : ''}
                  </Text>
                  <Text style={styles.postMeta}>{post.category} · {post.timeAgo}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              {/* Poll Rendering if present */}
              {post.pollOptions && (
                <View style={styles.pollBox}>
                  {post.pollOptions.map((opt, idx) => {
                    const totalVotes = post.pollOptions!.reduce((a, b) => a + b.votes, 0);
                    const pct = Math.round((opt.votes / Math.max(1, totalVotes)) * 100);
                    const hasVoted = post.userVotedIdx !== undefined;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.pollOptionBtn,
                          post.userVotedIdx === idx && styles.pollOptionBtnVoted,
                        ]}
                        onPress={() => handleVotePoll(post.id, idx)}
                        disabled={hasVoted}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 }}>
                          <Text style={styles.pollOptionText}>{opt.option}</Text>
                          <Text style={styles.pollPctText}>{pct}% ({opt.votes})</Text>
                        </View>
                        <View style={[styles.pollFillBar, { width: `${pct}%` }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() =>
                    setPosts((prev) =>
                      prev.map((p) => (p.id === post.id ? { ...p, likes: p.likes + 1 } : p))
                    )
                  }
                >
                  <Text style={styles.likeBtnText}>❤️ {post.likes} Me Gusta</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  createCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  createTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  createInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  publishBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  publishBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postAuthor: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  postMeta: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  postContent: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  pollBox: { gap: spacing.xs, marginVertical: 4 },
  pollOptionBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pollOptionBtnVoted: { borderColor: colors.primary },
  pollOptionText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  pollPctText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  pollFillBar: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.accentSoft, borderRadius: radii.md },

  postFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xs },
  likeBtn: { alignSelf: 'flex-start' },
  likeBtnText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '800' },
});
