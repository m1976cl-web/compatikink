import React, { useState, useEffect, useCallback } from 'react';
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
import { BlockedUser, getBlockedUsers, filterBlockedItems } from '@/lib/trustSafety';
import { ReportContentModal } from '@/components/safety/ReportContentModal';
import { BlockUserModal } from '@/components/safety/BlockUserModal';
import { BlockedUsersManagerModal } from '@/components/safety/BlockedUsersManagerModal';
import { triggerLightHaptic } from '@/lib/haptics';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

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

function KinkFeedScreenContent() {
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

  // Trust & Safety State
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reportModalData, setReportModalData] = useState<{
    targetType: 'post' | 'user';
    targetId: string;
    targetAuthorName?: string;
    targetPreviewText?: string;
  } | null>(null);

  const [blockModalData, setBlockModalData] = useState<{
    targetUserId: string;
    targetUserNickname: string;
  } | null>(null);

  const [showBlockedManager, setShowBlockedManager] = useState(false);

  const loadBlockedList = useCallback(async () => {
    const list = await getBlockedUsers();
    setBlockedUsers(list);
  }, []);

  useEffect(() => {
    loadBlockedList();
  }, [loadBlockedList]);

  const handleVotePoll = (postId: string, optionIdx: number) => {
    triggerLightHaptic();
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

  // Filter blocked posts and apply category/role filters
  const unblockedPosts = filterBlockedItems(posts, blockedUsers);

  const filteredPosts = unblockedPosts.filter((p) => {
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
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.safetyBtn}
              onPress={() => {
                triggerLightHaptic();
                setShowBlockedManager(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.safetyBtnText}>
                🛡️ Bloqueados ({blockedUsers.length})
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Feed, Q&A & Confesionario Anónimo</Text>
          <Text style={styles.subtitle}>
            Muro de debate con firmas Zero-Knowledge, encuestas interactivas y moderación comunitaria segura
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
                <Text style={styles.inputLabel}>Fetiche / Tema:</Text>
                <TextInput
                  style={styles.tagInput}
                  value={userKinkTag}
                  onChangeText={setUserKinkTag}
                  placeholder="Ej: Shibari, Látex"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Post Content Input */}
            <TextInput
              style={styles.contentInput}
              multiline
              numberOfLines={4}
              placeholder="Escribe tu pregunta, debate o confesión anónima de forma segura..."
              placeholderTextColor={colors.textMuted}
              value={newPostText}
              onChangeText={setNewPostText}
            />

            {/* Anonymity Toggle & Submit */}
            <View style={styles.createFooter}>
              <TouchableOpacity
                style={[styles.anonToggle, isAnonymousPost && styles.anonToggleActive]}
                onPress={() => setIsAnonymousPost(!isAnonymousPost)}
              >
                <Text style={styles.anonToggleText}>
                  {isAnonymousPost ? '🔒 Anónimo Activado' : '👤 Mostrar Nick'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.postSubmitBtn} onPress={handleCreatePost}>
                <Text style={styles.postSubmitBtnText}>Publicar Cifrado 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feed Filter Chips */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrar por Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {['all', 'Debate', 'Encuesta', 'Consejo', 'Aftercare', 'Confesionario'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                    {cat === 'all' ? '✨ Todas' : cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Posts Stream */}
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.authorAvatarCircle}>
                  <Text style={{ fontSize: 18 }}>{post.isAnonymous ? '🎭' : '🖤'}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
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

                {/* Trust & Safety Actions on Post */}
                <View style={styles.postActionButtons}>
                  <TouchableOpacity
                    style={styles.postSafetyIconBtn}
                    onPress={() => {
                      triggerLightHaptic();
                      setReportModalData({
                        targetType: 'post',
                        targetId: post.id,
                        targetAuthorName: post.author,
                        targetPreviewText: post.content,
                      });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.reportIcon}>🚩</Text>
                  </TouchableOpacity>

                  {!post.isAnonymous ? (
                    <TouchableOpacity
                      style={styles.postSafetyIconBtn}
                      onPress={() => {
                        triggerLightHaptic();
                        setBlockModalData({
                          targetUserId: post.id,
                          targetUserNickname: post.author,
                        });
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.blockIcon}>🚫</Text>
                    </TouchableOpacity>
                  ) : null}
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

          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🛡️</Text>
              <Text style={styles.emptyText}>No hay publicaciones disponibles con los filtros actuales.</Text>
            </View>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Safety Modals */}
        {reportModalData ? (
          <ReportContentModal
            visible={!!reportModalData}
            onClose={() => setReportModalData(null)}
            targetType={reportModalData.targetType}
            targetId={reportModalData.targetId}
            targetAuthorName={reportModalData.targetAuthorName}
            targetPreviewText={reportModalData.targetPreviewText}
            onReportSubmitted={loadBlockedList}
          />
        ) : null}

        {blockModalData ? (
          <BlockUserModal
            visible={!!blockModalData}
            onClose={() => setBlockModalData(null)}
            targetUserId={blockModalData.targetUserId}
            targetUserNickname={blockModalData.targetUserNickname}
            onUserBlocked={loadBlockedList}
          />
        ) : null}

        <BlockedUsersManagerModal
          visible={showBlockedManager}
          onClose={() => setShowBlockedManager(false)}
          onListUpdated={loadBlockedList}
        />
      </View>
    </ScreenContainer>
  );
}

export default function KinkFeedScreen() {
  return (
    <RouteFeatureGuard route="/kink-feed" title="Feed Social y Confesionario">
      <KinkFeedScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 4 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  safetyBtn: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: '#f87171',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  safetyBtnText: {
    color: '#f87171',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  title: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs },
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  createCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  createTitle: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  inputLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  catChipTextActive: { color: '#000', fontFamily: fonts.bodyBold },
  tagInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 12,
  },
  contentInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.sm,
    color: colors.text,
    fontSize: fontSize.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  anonToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  anonToggleActive: { borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)' },
  anonToggleText: { color: colors.text, fontSize: 11, fontFamily: fonts.bodySemi },
  postSubmitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  postSubmitBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  filterSection: { gap: 4 },
  filterSectionTitle: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodyBold, textTransform: 'uppercase' },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.bodySemi },
  filterChipTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  postHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  authorAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  postAuthor: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  roleBadgeTag: { backgroundColor: 'rgba(192, 132, 252, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleBadgeTagText: { color: colors.primary, fontSize: 10, fontFamily: fonts.bodyBold },
  kinkBadgeTag: { backgroundColor: 'rgba(244, 114, 182, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  kinkBadgeTagText: { color: '#f472b6', fontSize: 10, fontFamily: fonts.bodyBold },
  postMeta: { color: colors.textMuted, fontSize: 10 },
  zkSigText: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.mono, opacity: 0.6 },
  postActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postSafetyIconBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },
  reportIcon: { fontSize: 12 },
  blockIcon: { fontSize: 12 },
  postContent: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
  pollBox: { gap: 6, marginVertical: 4 },
  pollOptionBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  pollOptionBtnVoted: { borderColor: colors.primary },
  pollOptionText: { color: colors.text, fontSize: 12, fontFamily: fonts.bodySemi },
  pollPctText: { color: colors.primary, fontSize: 11, fontFamily: fonts.bodyBold },
  pollFillBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(192, 132, 252, 0.25)',
  },
  postFooter: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: colors.surfaceLight, paddingTop: 6 },
  likeBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  likeBtnText: { color: colors.primary, fontSize: 11, fontFamily: fonts.bodySemi },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
