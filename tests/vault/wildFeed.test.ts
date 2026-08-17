/**
 * Wild Uncensored Feed & Legal Compliance Test Suite
 *
 * Empirical verification of:
 * 1. Legal Terms of Service & Illegal Content Warning text.
 * 2. Wild Post Creation with Public vs Anonymous Mode.
 * 3. Public vs Anonymous Commenting.
 * 4. Comparison Request Increment ("Comparemos nuestros Test").
 * 5. Content Reporting & Automatic Safety Moderation Blocking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import {
  loadAllWildPosts,
  createWildPost,
  addWildComment,
  incrementComparisonRequest,
  reportWildPost,
  hasAcceptedWildTerms,
  setAcceptedWildTerms,
  ILLEGAL_CONTENT_WARNING_TEXT,
} from '../../lib/wildFeedStorage';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string, detail?: string) {
  if (cond) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runWildFeedSuite() {
  console.log('\n====================================================');
  console.log('  WILD UNCENSORED FEED & LEGAL SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();
  await setupVaultForNewProfile('tester_wild', '123456');

  // 1. Legal Terms & Compliance Check
  console.log('--- 1. Terms of Service & Illegal Content Warning ---');
  assert(
    ILLEGAL_CONTENT_WARNING_TEXT.includes('ESTRICTAMENTE PROHIBIDO') &&
      ILLEGAL_CONTENT_WARNING_TEXT.includes('menores de edad') &&
      ILLEGAL_CONTENT_WARNING_TEXT.includes('Ley N° 21.523') &&
      ILLEGAL_CONTENT_WARNING_TEXT.includes('Ley N° 19.628'),
    'Legal Warning contains mandatory statutory prohibition text and Chile legal references'
  );

  assert(!(await hasAcceptedWildTerms()), 'Terms default to not accepted for new users');
  await setAcceptedWildTerms(true);
  assert(await hasAcceptedWildTerms(), 'Terms acceptance status persisted correctly');

  // 2. Post Creation (Public vs Anonymous)
  console.log('\n--- 2. Post Creation (Public vs Anonymous) ---');
  const postsInitial = await loadAllWildPosts();
  assert(postsInitial.length >= 2, 'Default sample posts loaded for testing');

  await createWildPost({
    authorNickname: 'Anónimo',
    isAnonymous: true,
    title: 'Test Post Anon',
    caption: 'Probing anon post',
    mediaUri: 'https://example.com/anon.jpg',
    mediaType: 'photo',
  });

  const postsAfterAnon = await loadAllWildPosts();
  const createdAnon = postsAfterAnon.find((p) => p.title === 'Test Post Anon');
  assert(createdAnon !== undefined && createdAnon.isAnonymous, 'Anonymous post created successfully');

  // 3. Comments (Public vs Anonymous)
  console.log('\n--- 3. Public & Anonymous Comments ---');
  if (createdAnon) {
    await addWildComment(createdAnon.id, 'tester_wild', 'Public comment here', false);
    await addWildComment(createdAnon.id, 'tester_wild', 'Anon comment here', true);

    const postsAfterComment = await loadAllWildPosts();
    const targetPost = postsAfterComment.find((p) => p.id === createdAnon.id);
    assert(targetPost?.comments.length === 2, 'Two comments added to post');
    assert(
      targetPost?.comments[0].authorNickname === 'tester_wild' && !targetPost?.comments[0].isAnonymous,
      'Public comment preserves nickname'
    );
    assert(
      targetPost?.comments[1].authorNickname === 'Anónimo' && targetPost?.comments[1].isAnonymous,
      'Anonymous comment hides author nickname'
    );
  }

  // 4. "Comparemos nuestros Test" Requests
  console.log('\n--- 4. "Comparemos nuestros Test" Requests ---');
  if (createdAnon) {
    const count1 = await incrementComparisonRequest(createdAnon.id);
    const count2 = await incrementComparisonRequest(createdAnon.id);
    assert(count2 === 2, 'Comparison requests counter incremented to 2');
  }

  // 5. Content Moderation & Reporting
  console.log('\n--- 5. Content Moderation & Reporting ---');
  if (createdAnon) {
    await reportWildPost(createdAnon.id, 'user_1');
    const postsAfterReport1 = await loadAllWildPosts();
    assert(postsAfterReport1.some((p) => p.id === createdAnon.id), 'Post remains visible after 1 report');

    await reportWildPost(createdAnon.id, 'user_2');
    const postsAfterReport2 = await loadAllWildPosts();
    assert(!postsAfterReport2.some((p) => p.id === createdAnon.id), 'Post automatically blocked after 2 reports');
  }

  console.log(`\n====================================================`);
  console.log(`Wild Feed & Legal Suite Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runWildFeedSuite().catch((err) => {
  console.error('Unhandled error in Wild Feed & Legal Suite:', err);
  process.exit(1);
});
