import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography, glowShadowPrimary } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  CommunityGroup,
  CommunityTopic,
  CommunityCategory,
  COMMUNITY_CATEGORY_LABELS,
  TopicReply,
} from '@/data/communitiesData';
import {
  getAllCommunities,
  getJoinedCommunityIds,
  toggleJoinCommunity,
  createCommunityTopic,
  addTopicReply,
  getLikedTopicIds,
  toggleLikeTopic,
} from '@/lib/communityStorage';
import { BlockedUser, getBlockedUsers, filterBlockedItems } from '@/lib/trustSafety';
import { ReportContentModal } from '@/components/safety/ReportContentModal';
import { BlockUserModal } from '@/components/safety/BlockUserModal';
import { BlockedUsersManagerModal } from '@/components/safety/BlockedUsersManagerModal';
import { triggerLightHaptic, triggerSelectionHaptic } from '@/lib/haptics';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function CommunitiesScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [communities, setCommunities] = useState<CommunityGroup[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [likedTopicIds, setLikedTopicIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'all'>('all');

  // Navigation within forum
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [activeThreadTopic, setActiveThreadTopic] = useState<CommunityTopic | null>(null);

  // Form states
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [replyInput, setReplyInput] = useState('');

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

  const loadData = useCallback(async () => {
    const list = await getAllCommunities();
    const joined = await getJoinedCommunityIds();
    const liked = await getLikedTopicIds();
    const blocked = await getBlockedUsers();

    setCommunities(list);
    setJoinedIds(joined);
    setLikedTopicIds(liked);
    setBlockedUsers(blocked);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleJoin = async (groupId: string) => {
    triggerLightHaptic();
    const res = await toggleJoinCommunity(groupId);
    setJoinedIds(res.ids);
    Alert.alert(
      res.joined ? '¡Te has unido a la comunidad! 🎉' : 'Has dejado de seguir el grupo',
      res.joined
        ? 'Recibirás actualizaciones de nuevos debates en tu feed.'
        : 'Ya no verás este grupo como prioritario.'
    );
  };

  const handleToggleLike = async (topicId: string) => {
    const res = await toggleLikeTopic(topicId);
    setLikedTopicIds(res.likedIds);
  };

  const handleCreateTopicSubmit = async () => {
    if (!selectedGroup || !newTopicTitle.trim() || !newTopicContent.trim()) {
      Alert.alert('Campos incompletos', 'Por favor ingresa un título y contenido para el debate.');
      return;
    }

    const tagsArr = newTopicTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await createCommunityTopic(selectedGroup.id, {
      title: newTopicTitle,
      content: newTopicContent,
      tags: tagsArr.length > 0 ? tagsArr : undefined,
    });

    setNewTopicTitle('');
    setNewTopicContent('');
    setNewTopicTags('');
    setShowCreateTopic(false);
    await loadData();

    // Refresh selected group
    const updated = await getAllCommunities();
    const grp = updated.find((g) => g.id === selectedGroup.id);
    if (grp) setSelectedGroup(grp);

    Alert.alert('¡Debate Publicado! 🚀', 'Tu tema ha sido agregado a la comunidad con cifrado Zero-Knowledge.');
  };

  const handleSendReply = async () => {
    if (!activeThreadTopic || !replyInput.trim() || !selectedGroup) return;

    await addTopicReply(activeThreadTopic.id, {
      content: replyInput,
    });

    setReplyInput('');
    await loadData();

    // Refresh active thread
    const updated = await getAllCommunities();
    const grp = updated.find((g) => g.id === selectedGroup.id);
    if (grp) {
      setSelectedGroup(grp);
      const top = grp.topics.find((t) => t.id === activeThreadTopic.id);
      if (top) setActiveThreadTopic(top);
    }
  };

  // Filter groups
  const filteredCommunities = useMemo(() => {
    return communities.filter((g) => {
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = g.name.toLowerCase().includes(q);
        const matchDesc = g.description.toLowerCase().includes(q);
        const matchTags = g.tags.some((t) => t.toLowerCase().includes(q));
        const matchTopics = g.topics.some(
          (top) => top.title.toLowerCase().includes(q) || top.content.toLowerCase().includes(q)
        );
        return matchName || matchDesc || matchTags || matchTopics;
      }
      return true;
    });
  }, [communities, selectedCategory, searchQuery]);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => {
                if (activeThreadTopic) {
                  setActiveThreadTopic(null);
                } else if (selectedGroup) {
                  setSelectedGroup(null);
                } else {
                  router.back();
                }
              }}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>
                ← {activeThreadTopic ? 'Volver a Temas' : selectedGroup ? 'Volver a Comunidades' : 'Volver'}
              </Text>
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

          <Text style={styles.title}>
            {activeThreadTopic
              ? 'Hilo de Discusión'
              : selectedGroup
              ? `${selectedGroup.emoji} ${selectedGroup.name}`
              : 'Comunidades & Foros de Buenas Prácticas'}
          </Text>
          <Text style={styles.subtitle}>
            {activeThreadTopic
              ? 'Espacio de intercambio reflexivo, consentimiento y respeto mutuo'
              : selectedGroup
              ? selectedGroup.description
              : 'Espacios temáticos curados por nicho para compartir recursos, debates de seguridad y experiencias íntimas'}
          </Text>
        </View>

        {/* --- VIEW 1: COMMUNITIES DIRECTORY --- */}
        {!selectedGroup && !activeThreadTopic && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Search Input */}
            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Buscar comunidades, temas, técnicas o fetiches..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Filter Chips */}
            <View style={{ gap: 4 }}>
              <Text style={styles.sectionLabel}>Filtrar por Área Temática:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                <TouchableOpacity
                  style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setSelectedCategory('all');
                  }}
                >
                  <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
                    ✨ Todas ({communities.length})
                  </Text>
                </TouchableOpacity>

                {(Object.keys(COMMUNITY_CATEGORY_LABELS) as CommunityCategory[]).map((catKey) => {
                  const cat = COMMUNITY_CATEGORY_LABELS[catKey];
                  const isActive = selectedCategory === catKey;
                  return (
                    <TouchableOpacity
                      key={catKey}
                      style={[styles.catChip, isActive && { backgroundColor: `${cat.color}25`, borderColor: cat.color }]}
                      onPress={() => {
                        triggerSelectionHaptic();
                        setSelectedCategory(catKey);
                      }}
                    >
                      <Text style={[styles.catChipText, isActive && { color: cat.color, fontFamily: fonts.bodyBold }]}>
                        {cat.emoji} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Communities Grid / List */}
            <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
              {filteredCommunities.map((group) => {
                const isJoined = joinedIds.includes(group.id);
                const catInfo = COMMUNITY_CATEGORY_LABELS[group.category];

                return (
                  <View key={group.id} style={styles.groupCard}>
                    {/* Top Row: Emoji, Name, Member Count & Join Button */}
                    <View style={styles.groupHeaderRow}>
                      <Text style={styles.groupEmoji}>{group.emoji}</Text>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <View style={[styles.groupCatPill, { backgroundColor: `${catInfo.color}18`, borderColor: catInfo.color }]}>
                            <Text style={[styles.groupCatPillText, { color: catInfo.color }]}>
                              {catInfo.emoji} {catInfo.label}
                            </Text>
                          </View>
                          <Text style={styles.groupStatsText}>👥 {group.memberCount} miembros</Text>
                        </View>
                        <Text style={styles.groupName}>{group.name}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                        onPress={() => handleToggleJoin(group.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
                          {isJoined ? 'Siguiendo ✓' : 'Seguir +'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text style={styles.groupDesc}>{group.description}</Text>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                      {group.tags.map((tag, idx) => (
                        <View key={idx} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Enter Forum Action */}
                    <TouchableOpacity
                      style={styles.enterForumBtn}
                      onPress={() => {
                        triggerLightHaptic();
                        setSelectedGroup(group);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.enterForumBtnText}>
                        Explorar Foros y Debates ({group.topics.length} temas) 💬 →
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {filteredCommunities.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={{ fontSize: 32 }}>🔍</Text>
                  <Text style={styles.emptyTitle}>No se encontraron comunidades</Text>
                  <Text style={styles.emptyDesc}>Prueba buscando con otros términos o seleccionando otra categoría.</Text>
                </View>
              )}
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* --- VIEW 2: GROUP TOPICS LIST --- */}
        {selectedGroup && !activeThreadTopic && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Create Topic Button / Banner */}
            <View style={styles.topicActionHeader}>
              <View>
                <Text style={styles.topicsCountHeader}>
                  📚 {selectedGroup.topics.length} Temas de Debate Activos
                </Text>
                <Text style={styles.topicsSubHeader}>Participa con total anonimato y respeto</Text>
              </View>

              <TouchableOpacity
                style={styles.newTopicBtn}
                onPress={() => {
                  triggerLightHaptic();
                  setShowCreateTopic(!showCreateTopic);
                }}
              >
                <Text style={styles.newTopicBtnText}>
                  {showCreateTopic ? 'Cancelar ✕' : '✍️ Nuevo Debate'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Topic Form Drawer */}
            {showCreateTopic && (
              <View style={styles.createTopicForm}>
                <Text style={styles.createFormTitle}>✍️ Iniciar Nuevo Tema de Discusión</Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Título del debate o pregunta clara..."
                  placeholderTextColor={colors.textMuted}
                  value={newTopicTitle}
                  onChangeText={setNewTopicTitle}
                />

                <TextInput
                  style={[styles.formInput, { minHeight: 90, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Escribe el contexto, tu duda o experiencia para la comunidad..."
                  placeholderTextColor={colors.textMuted}
                  value={newTopicContent}
                  onChangeText={setNewTopicContent}
                />

                <TextInput
                  style={styles.formInput}
                  placeholder="Etiquetas separadas por comas (ej. Seguridad, Yute, Cuidados)..."
                  placeholderTextColor={colors.textMuted}
                  value={newTopicTags}
                  onChangeText={setNewTopicTags}
                />

                <TouchableOpacity style={styles.publishTopicBtn} onPress={handleCreateTopicSubmit}>
                  <Text style={styles.publishTopicBtnText}>Publicar Debate en el Foro 🚀</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Topics Feed */}
            {filterBlockedItems(selectedGroup.topics, blockedUsers).map((topic) => {
              const isLiked = likedTopicIds.includes(topic.id);

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicCard, topic.isPinned && styles.topicCardPinned]}
                  onPress={() => {
                    triggerLightHaptic();
                    setActiveThreadTopic(topic);
                  }}
                  activeOpacity={0.85}
                >
                  {/* Pinned Tag */}
                  {topic.isPinned && (
                    <View style={styles.pinnedPill}>
                      <Text style={styles.pinnedPillText}>📌 TEMA DESTACADO / GUÍA OFICIAL</Text>
                    </View>
                  )}

                  {/* Title & Author Row */}
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicCardTitle}>{topic.title}</Text>
                    <View style={styles.topicAuthorRow}>
                      <Text style={{ fontSize: 13 }}>{topic.authorEmoji || '👤'}</Text>
                      <Text style={styles.topicAuthorText}>{topic.author}</Text>
                      {topic.authorRole && (
                        <View style={styles.authorRoleBadge}>
                          <Text style={styles.authorRoleBadgeText}>{topic.authorRole}</Text>
                        </View>
                      )}
                      <Text style={styles.topicTimeText}>· {topic.timeAgo}</Text>
                    </View>
                  </View>

                  {/* Content Preview */}
                  <Text style={styles.topicContentPreview} numberOfLines={3}>
                    {topic.content}
                  </Text>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {topic.tags.map((t, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>#{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Footer: Replies & Likes */}
                  <View style={styles.topicCardFooter}>
                    <View style={styles.repliesPill}>
                      <Text style={styles.repliesPillText}>💬 {topic.repliesCount || 0} aportes</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.likePill, isLiked && styles.likePillActive]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleToggleLike(topic.id);
                      }}
                    >
                      <Text style={[styles.likePillText, isLiked && { color: '#f43f5e' }]}>
                        {isLiked ? '❤️' : '🤍'} {topic.likes + (isLiked ? 1 : 0)}
                      </Text>
                    </TouchableOpacity>

                    {/* Trust & Safety Actions */}
                    <TouchableOpacity
                      style={styles.topicSafetyBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setReportModalData({
                          targetType: 'post',
                          targetId: topic.id,
                          targetAuthorName: topic.author,
                          targetPreviewText: topic.content,
                        });
                      }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={{ fontSize: 12 }}>🚩</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* --- VIEW 3: THREAD DISCUSSION VIEW --- */}
        {activeThreadTopic && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Original Post Banner Card */}
            <View style={styles.threadOriginalPostCard}>
              {activeThreadTopic.isPinned && (
                <View style={styles.pinnedPill}>
                  <Text style={styles.pinnedPillText}>📌 GUÍA DE BUENAS PRÁCTICAS</Text>
                </View>
              )}

              <Text style={styles.threadTitle}>{activeThreadTopic.title}</Text>

              <View style={styles.topicAuthorRow}>
                <Text style={{ fontSize: 14 }}>{activeThreadTopic.authorEmoji || '👤'}</Text>
                <Text style={styles.topicAuthorText}>{activeThreadTopic.author}</Text>
                {activeThreadTopic.authorRole && (
                  <View style={styles.authorRoleBadge}>
                    <Text style={styles.authorRoleBadgeText}>{activeThreadTopic.authorRole}</Text>
                  </View>
                )}
                <Text style={styles.topicTimeText}>· {activeThreadTopic.timeAgo}</Text>
              </View>

              <Text style={styles.threadFullContent}>{activeThreadTopic.content}</Text>

              <View style={styles.tagsRow}>
                {activeThreadTopic.tags.map((t, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Replies List */}
            <View style={styles.repliesSection}>
              <Text style={styles.repliesSectionTitle}>
                💬 Respuestas de la Comunidad ({(activeThreadTopic.replies || []).length})
              </Text>

              {(activeThreadTopic.replies || []).map((rep) => (
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

              {(!activeThreadTopic.replies || activeThreadTopic.replies.length === 0) && (
                <View style={styles.emptyRepliesBox}>
                  <Text style={styles.emptyRepliesText}>Aún no hay respuestas en este debate. ¡Sé el primero en aportar!</Text>
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
              <TouchableOpacity style={styles.sendReplyBtn} onPress={handleSendReply}>
                <Text style={styles.sendReplyBtnText}>Enviar Respuesta Cifrada 💬</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* Safety Modals */}
        {reportModalData ? (
          <ReportContentModal
            visible={!!reportModalData}
            onClose={() => setReportModalData(null)}
            targetType={reportModalData.targetType}
            targetId={reportModalData.targetId}
            targetAuthorName={reportModalData.targetAuthorName}
            targetPreviewText={reportModalData.targetPreviewText}
            onReportSubmitted={loadData}
          />
        ) : null}

        {blockModalData ? (
          <BlockUserModal
            visible={!!blockModalData}
            onClose={() => setBlockModalData(null)}
            targetUserId={blockModalData.targetUserId}
            targetUserNickname={blockModalData.targetUserNickname}
            onUserBlocked={loadData}
          />
        ) : null}

        <BlockedUsersManagerModal
          visible={showBlockedManager}
          onClose={() => setShowBlockedManager(false)}
          onListUpdated={loadData}
        />
      </View>
    </ScreenContainer>
  );
}

export default function CommunitiesScreen() {
  return (
    <RouteFeatureGuard route="/communities" title="Comunidades y Foros Temáticos">
      <CommunitiesScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 2 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
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
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs, lineHeight: 17 },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  searchWrap: { marginVertical: 2 },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodyBold, textTransform: 'uppercase' },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: { backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  catChipTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },

  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...glowShadowPrimary,
  },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupEmoji: { fontSize: 32 },
  groupCatPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  groupCatPillText: { fontSize: 9, fontFamily: fonts.bodyBold },
  groupStatsText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.body },
  groupName: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  groupDesc: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },

  joinBtn: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.md },
  joinBtnActive: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  joinBtnText: { color: '#000', fontSize: 11, fontFamily: fonts.bodyBold },
  joinBtnTextActive: { color: colors.textMuted },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.mono },

  enterForumBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  enterForumBtnText: { color: colors.primary, fontSize: fontSize.xs, fontFamily: fonts.bodyBold },

  // Group Detail & Topics
  topicActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicsCountHeader: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  topicsSubHeader: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.body },
  newTopicBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.md },
  newTopicBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: 11 },

  createTopicForm: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  createFormTitle: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  formInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  publishTopicBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  publishTopicBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },

  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  topicCardPinned: {
    borderColor: 'rgba(192, 132, 252, 0.5)',
    backgroundColor: 'rgba(192, 132, 252, 0.05)',
  },
  pinnedPill: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pinnedPillText: { color: colors.primary, fontSize: 9, fontFamily: fonts.bodyBold },
  topicHeader: { gap: 4 },
  topicCardTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm },
  topicAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topicAuthorText: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  authorRoleBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  authorRoleBadgeText: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.bodySemi },
  topicTimeText: { color: colors.textMuted, fontSize: 10 },
  topicContentPreview: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  topicCardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  repliesPill: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  repliesPillText: { color: colors.text, fontSize: 10, fontFamily: fonts.bodyBold },
  likePill: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  likePillActive: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderWidth: 1, borderColor: '#f43f5e' },
  likePillText: { fontSize: 10, fontFamily: fonts.bodySemi, color: colors.textMuted },
  topicSafetyBtn: { padding: 4, marginLeft: 'auto' },

  // Thread View
  threadOriginalPostCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  threadTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.lg },
  threadFullContent: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 22 },

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

  emptyBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  emptyDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
