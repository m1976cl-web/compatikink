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
import { FeedPost } from '@/types';
import { generateAnonymousSignature } from '@/lib/vaultUnified';

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'fp-1',
    author: 'Anónimo_RopeMaster',
    isVerified: true,
    isAnonymous: true,
    roleTag: 'Top / Rigger',
    kinkCategoryTag: 'Shibari',
    anonymousSignature: 'zk-sig-99a8b7c6d5e4f3a2',
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
    author: 'Anónimo_SensualMind',
    isVerified: false,
    isAnonymous: true,
    roleTag: 'Switch',
    kinkCategoryTag: 'Aftercare',
    anonymousSignature: 'zk-sig-7711223344556677',
    timeAgo: 'hace 2 horas',
    category: 'Consejo',
    content: 'Recuerden que el Aftercare no es solo para el sumiso/bottom. El dominante (top) también puede experimentar "Topdrop" (sensación de fatiga o bajón emocional) tras administrar escenas de alta intensidad. Tomen agua y descansen juntos.',
    likes: 89,
  },
  {
    id: 'fp-3',
    author: 'Confesional_Kink_404',
    isVerified: true,
    isAnonymous: true,
    roleTag: 'Sub / Bottom',
    kinkCategoryTag: 'Confesionario',
    anonymousSignature: 'zk-sig-8833119955442200',
    timeAgo: 'hace 4 horas',
    category: 'Confesionario',
    content: 'Confesión anónima: Al principio me daba mucha vergüenza comunicar mi deseo por el orgasmo controlado. Usar el cuestionario de Compatikink me ayudó a mostrárselo a mi pareja sin sentir miedo a ser juzgada.',
    likes: 112,
  },
];

export default function KinkFeedScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Debate');
  const [isAnonymousPost, setIsAnonymousPost] = useState(true);
  const [userRoleTag, setUserRoleTag] = useState('Switch');
  const [userKinkTag, setUserKinkTag] = useState('Shibari');

  // Active Feed Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;

    const signature = await generateAnonymousSignature(newPostText.trim(), 'user-local-salt-' + Date.now());

    const post: FeedPost = {
      id: `fp-${Date.now()}`,
      author: isAnonymousPost ? 'Confesional Anónimo 🔒' : 'Usuario Compatikink',
      isVerified: true,
      isAnonymous: isAnonymousPost,
      roleTag: userRoleTag,
      kinkCategoryTag: userKinkTag,
      anonymousSignature: signature,
      timeAgo: 'hace un momento',
      category: selectedCategory,
      content: newPostText.trim(),
      likes: 1,
    };

    setPosts([post, ...posts]);
    setNewPostText('');
    Alert.alert(
      'Publicado con Cifrado Zero-Knowledge 🚀',
      `Tu publicación ha sido firmada criptográficamente (${signature}) y compartida en el muro.`
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (roleFilter !== 'all') {
      const tag = (p.roleTag || '').toLowerCase();
      if (!tag.includes(roleFilter.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Feed, Q&A & Confesionario Anónimo</Text>
          <Text style={styles.subtitle}>
            Muro de debate con firmas Zero-Knowledge, encuestas interactivas y confesiones anónimas por roles
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Create Post Card */}
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>✍️ Nueva Publicación / Confesión Cifrada</Text>

            {/* Category Selector Chips */}
            <View style={{ gap: 4 }}>
              <Text style={styles.inputLabel}>Categoría de Publicación:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {['Debate', 'Encuesta', 'Consejo', 'Aftercare', 'Confesionario'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Role Tag & Kink Tag */}
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.inputLabel}>Tu Rol Tag:</Text>
                <TextInput
                  style={styles.tagInput}
                  value={userRoleTag}
                  onChangeText={setUserRoleTag}
                  placeholder="Ej: Dom, Sub, Switch"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.inputLabel}>Kink Tag:</Text>
                <TextInput
                  style={styles.tagInput}
                  value={userKinkTag}
                  onChangeText={setUserKinkTag}
                  placeholder="Ej: Shibari, D/s"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <TextInput
              style={styles.createInput}
              placeholder="Comparte una reflexión, confesión anónima o duda sobre seguridad y consentimiento..."
              placeholderTextColor={colors.textMuted}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={4}
            />

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.anonToggleRow}
              onPress={() => setIsAnonymousPost(!isAnonymousPost)}
            >
              <Text style={{ fontSize: 16 }}>{isAnonymousPost ? '🔒' : '👤'}</Text>
              <Text style={styles.anonToggleText}>
                {isAnonymousPost
                  ? 'Firma Cifrada Zero-Knowledge Activa (100% Anónimo)'
                  : 'Publicar con Nick visible'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.publishBtn} onPress={handleCreatePost}>
              <Text style={styles.publishBtnText}>Publicar con Firma Cifrada 🚀</Text>
            </TouchableOpacity>
          </View>

          {/* Feed Filter Chips */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { id: 'all', label: '🌐 Todos' },
                { id: 'Confesionario', label: '🔒 Confesionario' },
                { id: 'Encuesta', label: '📊 Encuestas' },
                { id: 'Debate', label: '💬 Debates' },
                { id: 'Aftercare', label: '🫂 Aftercare' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, categoryFilter === f.id && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(f.id)}
                >
                  <Text style={[styles.filterChipText, categoryFilter === f.id && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Feed Posts */}
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.postAuthor}>
                      {post.author} {post.isVerified ? '✓' : ''}
                    </Text>
                    {post.roleTag && (
                      <View style={styles.roleBadgeTag}>
                        <Text style={styles.roleBadgeTagText}>🎭 {post.roleTag}</Text>
                      </View>
                    )}
                    {post.kinkCategoryTag && (
                      <View style={styles.kinkBadgeTag}>
                        <Text style={styles.kinkBadgeTagText}>✨ {post.kinkCategoryTag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.postMeta}>{post.category} · {post.timeAgo}</Text>
                  {post.anonymousSignature && (
                    <Text style={styles.zkSigText}>Zero-Knowledge Header: {post.anonymousSignature}</Text>
                  )}
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
  container: { flex: 1, paddingHorizontal: spacing.md, backgroundColor: '#0a0612' },
  containerDesktop: { maxWidth: 780, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.neonPurple, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  createCard: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.md,
  },
  createTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '900' },
  inputLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  catChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.md, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.neonRose, borderColor: colors.neonRose },
  catChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  catChipTextActive: { color: '#fff' },

  tagInput: { backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 6, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },

  createInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  anonToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  anonToggleText: { color: colors.neonEmerald, fontSize: fontSize.xs, fontWeight: '700' },

  publishBtn: { backgroundColor: colors.neonPurple, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  publishBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },

  filterBar: { marginVertical: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#000' },

  postCard: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postAuthor: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '900' },
  roleBadgeTag: { backgroundColor: 'rgba(192, 132, 252, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleBadgeTagText: { color: colors.neonPurple, fontSize: 9, fontWeight: '800' },
  kinkBadgeTag: { backgroundColor: 'rgba(244, 63, 94, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  kinkBadgeTagText: { color: colors.neonRose, fontSize: 9, fontWeight: '800' },

  postMeta: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  zkSigText: { color: colors.neonEmerald, fontSize: 9, fontWeight: '700', marginTop: 2 },
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
  pollOptionBtnVoted: { borderColor: colors.neonPurple },
  pollOptionText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  pollPctText: { color: colors.neonRose, fontSize: fontSize.xs, fontWeight: '800' },
  pollFillBar: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: 'rgba(192, 132, 252, 0.2)', borderRadius: radii.md },

  postFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xs },
  likeBtn: { alignSelf: 'flex-start' },
  likeBtnText: { color: colors.neonRose, fontSize: fontSize.xs, fontWeight: '800' },
});
