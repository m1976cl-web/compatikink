import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import {
  CommunityGroup,
  CommunityTopic,
  TopicReply,
  INITIAL_COMMUNITIES,
} from '@/data/communitiesData';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

const JOINED_COMMUNITIES_KEY = 'user_joined_communities_v1';
const CUSTOM_TOPICS_KEY = 'user_custom_community_topics_v1';
const CUSTOM_REPLIES_KEY = 'user_custom_community_replies_v1';
const LIKED_TOPICS_KEY = 'user_liked_topics_v1';

export async function getJoinedCommunityIds(): Promise<string[]> {
  return readJsonStorage<string[]>(JOINED_COMMUNITIES_KEY, ['comm-beginners', 'comm-aftercare']);
}

export async function toggleJoinCommunity(groupId: string): Promise<{ joined: boolean; ids: string[] }> {
  const current = await getJoinedCommunityIds();
  const exists = current.includes(groupId);
  const updated = exists ? current.filter((id) => id !== groupId) : [...current, groupId];

  await writeJsonStorage(JOINED_COMMUNITIES_KEY, updated);
  triggerLightHaptic();
  return { joined: !exists, ids: updated };
}

export async function getAllCommunities(): Promise<CommunityGroup[]> {
  const customTopics = await readJsonStorage<Record<string, CommunityTopic[]>>(CUSTOM_TOPICS_KEY, {});
  const customReplies = await readJsonStorage<Record<string, TopicReply[]>>(CUSTOM_REPLIES_KEY, {});

  return INITIAL_COMMUNITIES.map((group) => {
    const extraTopics = customTopics[group.id] || [];
    const mergedTopics = [...extraTopics, ...group.topics].map((topic) => {
      const extraTopicReplies = customReplies[topic.id] || [];
      const mergedReplies = [...(topic.replies || []), ...extraTopicReplies];
      return {
        ...topic,
        repliesCount: (topic.repliesCount || 0) + extraTopicReplies.length,
        replies: mergedReplies,
      };
    });

    return {
      ...group,
      topicsCount: mergedTopics.length,
      topics: mergedTopics,
    };
  });
}

export async function createCommunityTopic(
  groupId: string,
  topicData: { title: string; content: string; authorName?: string; tags?: string[] }
): Promise<CommunityTopic> {
  const newTopic: CommunityTopic = {
    id: `top-custom-${Date.now()}`,
    title: topicData.title.trim(),
    content: topicData.content.trim(),
    author: topicData.authorName || 'Explorador/a Anónimo',
    authorRole: 'Miembro Comunidad',
    authorEmoji: '🖤',
    timeAgo: 'hace unos instantes',
    repliesCount: 0,
    likes: 1,
    tags: topicData.tags && topicData.tags.length > 0 ? topicData.tags : ['Comunidad', 'Debate'],
    replies: [],
  };

  const customTopics = await readJsonStorage<Record<string, CommunityTopic[]>>(CUSTOM_TOPICS_KEY, {});
  const existingForGroup = customTopics[groupId] || [];
  customTopics[groupId] = [newTopic, ...existingForGroup];

  await writeJsonStorage(CUSTOM_TOPICS_KEY, customTopics);
  triggerSuccessHaptic();
  return newTopic;
}

export async function addTopicReply(
  topicId: string,
  replyData: { content: string; authorName?: string; authorRole?: string }
): Promise<TopicReply> {
  const newReply: TopicReply = {
    id: `rep-custom-${Date.now()}`,
    author: replyData.authorName || 'Tú (Anónimo)',
    authorRole: replyData.authorRole || 'Miembro',
    authorEmoji: '✨',
    timeAgo: 'hace instantes',
    content: replyData.content.trim(),
    likes: 0,
  };

  const customReplies = await readJsonStorage<Record<string, TopicReply[]>>(CUSTOM_REPLIES_KEY, {});
  const existingForTopic = customReplies[topicId] || [];
  customReplies[topicId] = [...existingForTopic, newReply];

  await writeJsonStorage(CUSTOM_REPLIES_KEY, customReplies);
  triggerSuccessHaptic();
  return newReply;
}

export async function getLikedTopicIds(): Promise<string[]> {
  return readJsonStorage<string[]>(LIKED_TOPICS_KEY, []);
}

export async function toggleLikeTopic(topicId: string): Promise<{ isLiked: boolean; likedIds: string[] }> {
  const current = await getLikedTopicIds();
  const exists = current.includes(topicId);
  const updated = exists ? current.filter((id) => id !== topicId) : [...current, topicId];

  await writeJsonStorage(LIKED_TOPICS_KEY, updated);
  triggerLightHaptic();
  return { isLiked: !exists, likedIds: updated };
}
