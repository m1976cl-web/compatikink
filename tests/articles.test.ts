import assert from 'node:assert/strict';
import {
  ARTICLES_DATA,
  ARTICLE_CATEGORY_LABELS,
  ArticleCategory,
} from '../data/articlesData';
import {
  getSavedArticleIds,
  toggleSaveArticle,
  getReadArticleIds,
  markArticleAsRead,
} from '../lib/articleStorage';

async function runArticlesTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — E1 Articles Library Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Dataset Integrity
  console.log('1. Testing Articles Dataset Integrity...');
  assert(ARTICLES_DATA.length >= 6, 'Should have at least 6 core educational articles');

  const categories = Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[];
  for (const cat of categories) {
    const found = ARTICLES_DATA.some((a) => a.category === cat);
    assert(found, `Category ${cat} must have at least one article`);
  }

  for (const art of ARTICLES_DATA) {
    assert(art.id.startsWith('art-'), `Article ID ${art.id} has valid prefix`);
    assert(art.title.length > 0, `Article ${art.id} has title`);
    assert(art.keyTakeaways.length >= 3, `Article ${art.id} has key takeaways`);
    assert(art.sections.length >= 2, `Article ${art.id} has detailed sections`);
  }
  console.log(`  ✅ ${ARTICLES_DATA.length}/${ARTICLES_DATA.length} articles verified with complete structure`);

  // 2. Testing Bookmarking & Reading Storage
  console.log('\n2. Testing Bookmarking and Read Progress...');
  const targetId = ARTICLES_DATA[0].id;

  const saveRes = await toggleSaveArticle(targetId);
  const savedList = await getSavedArticleIds();
  assert(savedList.includes(targetId) === saveRes.isSaved, 'Article saved in list');

  // Toggle again
  await toggleSaveArticle(targetId);
  const reloadedSaved = await getSavedArticleIds();
  assert(!reloadedSaved.includes(targetId), 'Article removed from saved');

  // Test read tracking
  await markArticleAsRead(targetId);
  const readList = await getReadArticleIds();
  assert(readList.includes(targetId), 'Article marked as read in storage');
  console.log('  ✅ Bookmarks and read progress persistence working properly');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All E1 Articles Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runArticlesTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
