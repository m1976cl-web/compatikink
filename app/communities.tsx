import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  CommunityGroup,
  CommunityTopic,
  CommunityCategory,
  COMMUNITY_CATEGORY_LABELS,
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
import { CommunityDirectoryCard } from '@/components/communities/CommunityDirectoryCard';
import { CommunityTopicCard } from '@/components/communities/CommunityTopicCard';
import { CommunityThreadView } from '@/components/communities/CommunityThreadView';
import { CreateTopicForm } from '@/components/communities/CreateTopicForm';

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
  const [showCreateTopic, setShowCreateTopic] = useState(false);

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

  const handleCreateTopicSubmit = async (title: string, content: string, tags?: string[]) => {
    if (!selectedGroup) return;

    await createCommunityTopic(selectedGroup.id, {
      title,
      content,
      tags,
    });

    setShowCreateTopic(false);
    await loadData();

    // Refresh selected group
    const updated = await getAllCommunities();
    const grp = updated.find((g) => g.id === selectedGroup.id);
    if (grp) setSelectedGroup(grp);

    Alert.alert('¡Debate Publicado! 🚀', 'Tu tema ha sido agregado a la comunidad con cifrado Zero-Knowledge.');
  };

  const handleSendReply = async (content: string) => {
    if (!activeThreadTopic || !selectedGroup) return;

    await addTopicReply(activeThreadTopic.id, { content });
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
              {filteredCommunities.map((group) => (
                <CommunityDirectoryCard
                  key={group.id}
                  group={group}
                  isJoined={joinedIds.includes(group.id)}
                  onToggleJoin={() => handleToggleJoin(group.id)}
                  onEnter={() => {
                    triggerLightHaptic();
                    setSelectedGroup(group);
                  }}
                />
              ))}

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
              <CreateTopicForm
                onSubmit={handleCreateTopicSubmit}
                onCancel={() => setShowCreateTopic(false)}
              />
            )}

            {/* Topics Feed */}
            {filterBlockedItems(selectedGroup.topics, blockedUsers).map((topic) => (
              <CommunityTopicCard
                key={topic.id}
                topic={topic}
                isLiked={likedTopicIds.includes(topic.id)}
                onSelect={() => {
                  triggerLightHaptic();
                  setActiveThreadTopic(topic);
                }}
                onToggleLike={() => handleToggleLike(topic.id)}
                onReport={() => {
                  setReportModalData({
                    targetType: 'post',
                    targetId: topic.id,
                    targetAuthorName: topic.author,
                    targetPreviewText: topic.content,
                  });
                }}
              />
            ))}

            <View style={{ height: 60 }} />
          </ScrollView>
        )}

        {/* --- VIEW 3: THREAD DISCUSSION VIEW --- */}
        {activeThreadTopic && (
          <CommunityThreadView
            topic={activeThreadTopic}
            onSendReply={handleSendReply}
          />
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

  emptyBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  emptyDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
});
