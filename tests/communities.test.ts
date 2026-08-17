import assert from 'node:assert/strict';
import {
  INITIAL_COMMUNITIES,
  COMMUNITY_CATEGORY_LABELS,
  CommunityCategory,
} from '../data/communitiesData';
import {
  getAllCommunities,
  getJoinedCommunityIds,
  toggleJoinCommunity,
  createCommunityTopic,
  addTopicReply,
  getLikedTopicIds,
  toggleLikeTopic,
} from '../lib/communityStorage';

async function runCommunitiesTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — S3 Themed Communities Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Verify Dataset
  console.log('1. Testing Communities Dataset Integrity...');
  assert(INITIAL_COMMUNITIES.length >= 8, 'Should have at least 8 themed community groups');

  const categories = Object.keys(COMMUNITY_CATEGORY_LABELS) as CommunityCategory[];
  for (const cat of categories) {
    const found = INITIAL_COMMUNITIES.some((g) => g.category === cat);
    assert(found, `Category ${cat} must have at least one community group`);
  }

  for (const group of INITIAL_COMMUNITIES) {
    assert(group.id.startsWith('comm-'), `Group ID ${group.id} has valid prefix`);
    assert(group.name.length > 0, `Group ${group.id} has name`);
    assert(group.description.length > 0, `Group ${group.id} has description`);
    assert(group.topics.length > 0, `Group ${group.id} has initial curated topics`);
  }
  console.log('  ✅ 8/8 themed community groups verified with valid properties');

  // 2. Testing Join/Unjoin Groups
  console.log('\n2. Testing Join/Unjoin Community Groups...');
  const initialJoined = await getJoinedCommunityIds();
  const targetGroup = INITIAL_COMMUNITIES[0].id;

  const joinRes = await toggleJoinCommunity(targetGroup);
  const checkJoined = await getJoinedCommunityIds();
  assert(checkJoined.includes(targetGroup) === joinRes.joined, 'Joined status matches storage');

  // Toggle again to revert
  await toggleJoinCommunity(targetGroup);
  console.log('  ✅ Group following/joining toggle working cleanly');

  // 3. Testing Topic Creation
  console.log('\n3. Testing Topic Creation...');
  const newTopic = await createCommunityTopic('comm-shibari', {
    title: '¿Qué grosor de cuerda recomiendan para arnés de pecho?',
    content: 'Estamos empezando con patrones de Takate Kote y queremos saber si 5mm o 6mm es más cómodo.',
    tags: ['Grosor', 'Takate Kote'],
  });

  assert(newTopic.id.startsWith('top-custom-'), 'New topic has valid ID');
  assert.equal(newTopic.title, '¿Qué grosor de cuerda recomiendan para arnés de pecho?');

  const allComms = await getAllCommunities();
  const shibariGroup = allComms.find((g) => g.id === 'comm-shibari');
  assert(shibariGroup?.topics.some((t) => t.id === newTopic.id), 'New topic merged into group topics');
  console.log('  ✅ Custom community topic created and persisted');

  // 4. Testing Topic Replies
  console.log('\n4. Testing Topic Replies...');
  const reply = await addTopicReply(newTopic.id, {
    content: 'Recomiendo 6mm de cáñamo o yute para que no muerda la piel en el torso.',
    authorName: 'Rigger_Sam',
  });

  assert(reply.id.startsWith('rep-custom-'), 'Reply has valid ID');

  const reloadedComms = await getAllCommunities();
  const reloadedShibari = reloadedComms.find((g) => g.id === 'comm-shibari');
  const reloadedTopic = reloadedShibari?.topics.find((t) => t.id === newTopic.id);
  assert(reloadedTopic?.replies?.some((r) => r.id === reply.id), 'Reply persisted in topic replies');
  assert.equal(reloadedTopic?.repliesCount, 1, 'Replies count incremented');
  console.log('  ✅ Community topic reply added and count updated');

  // 5. Testing Likes
  console.log('\n5. Testing Topic Likes...');
  const likeRes = await toggleLikeTopic(newTopic.id);
  const likedList = await getLikedTopicIds();
  assert(likedList.includes(newTopic.id) === likeRes.isLiked, 'Liked topic stored in list');
  console.log('  ✅ Liking topics working properly');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All S3 Communities Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runCommunitiesTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
