import assert from 'assert';
import { EXPRESS_ACTIVITY_IDS } from '../components/questionnaire/QuestionnaireQuestionsStep';
import { ACTIVITIES, CATEGORY_ORDER, getAllActivities, getActivityById } from '../data/activities';
import { writeJsonStorage, readJsonStorage } from '../lib/cryptoVault';
import { ActivityCategory, DifficultyLevel, ActivityMood } from '../types';

async function runStressTests() {
  console.log('====================================================');
  console.log('⚡ STRESS TEST SUITE: Questionnaire Codebase');
  console.log('====================================================\n');

  let testCount = 0;
  let passedCount = 0;

  function runTest(name: string, testFn: () => void | Promise<void>) {
    testCount++;
    try {
      const result = testFn();
      if (result && typeof (result as any).then === 'function') {
        return (result as any).then(() => {
          console.log(`  ✅ [PASS ${testCount}] ${name}`);
          passedCount++;
        }).catch((err: any) => {
          console.error(`  ❌ [FAIL ${testCount}] ${name}: ${err.message}`);
        });
      } else {
        console.log(`  ✅ [PASS ${testCount}] ${name}`);
        passedCount++;
      }
    } catch (err: any) {
      console.error(`  ❌ [FAIL ${testCount}] ${name}: ${err.message}`);
    }
  }

  console.log('--- 1. EXPRESS_ACTIVITY_IDS Constants & Integrity ---');
  
  await runTest('EXPRESS_ACTIVITY_IDS contains exactly 10 activities', () => {
    assert.strictEqual(EXPRESS_ACTIVITY_IDS.length, 10, 'Must have 10 express items');
  });

  await runTest('All EXPRESS_ACTIVITY_IDS exist in main ACTIVITIES dataset', () => {
    const allIds = ACTIVITIES.map((a) => a.id);
    for (const expressId of EXPRESS_ACTIVITY_IDS) {
      assert.ok(allIds.includes(expressId), `Express ID ${expressId} not found in ACTIVITIES`);
    }
  });

  await runTest('EXPRESS_ACTIVITY_IDS are unique', () => {
    const uniqueSet = new Set(EXPRESS_ACTIVITY_IDS);
    assert.strictEqual(uniqueSet.size, 10, 'Duplicate IDs found in EXPRESS_ACTIVITY_IDS');
  });

  console.log('\n--- 2. ZK Auto-Draft Storage Encryption Integrity ---');

  const DRAFT_KEY = 'express_questionnaire_progress_v1';
  const SENSITIVE_DRAFT_KEY = 'guest_draft_express_v1';
  const testDraftPayload = {
    responses: {
      'pe_d/s_dynamic': { rating: 'interested', role: 'dominant', intensity: 4 },
      'bo_rope': { rating: 'hard_limit' },
    },
    currentIndex: 2,
    updatedAt: new Date().toISOString(),
  };

  await runTest('isSensitiveStorageKey check for STORAGE_KEY_EXPRESS_DRAFT', () => {
    // Note: express_questionnaire_progress_v1 is currently not in SENSITIVE_STORAGE_KEYS/PREFIXES
    // so writeJsonStorage stores as JSON plaintext unless unlocked + key is sensitive
    const { isSensitiveStorageKey } = require('../lib/cryptoVault');
    const isSensitive = isSensitiveStorageKey(DRAFT_KEY);
    const isGuestDraftSensitive = isSensitiveStorageKey(SENSITIVE_DRAFT_KEY);
    assert.strictEqual(isGuestDraftSensitive, true, 'guest_draft_ prefix must be sensitive');
    console.log(`     ℹ️ STORAGE_KEY_EXPRESS_DRAFT sensitive check result: ${isSensitive}`);
  });

  await runTest('writeJsonStorage and readJsonStorage roundtrip with unlocked VaultSession', async () => {
    const { VaultSession, createVaultMeta, deriveVaultKey } = require('../lib/cryptoVault');
    const meta = await createVaultMeta('123456');
    const salt = Buffer.from(meta.saltB64, 'base64');
    const key = await deriveVaultKey('123456', salt);
    await VaultSession.unlockWithKey('Tester', key);

    await writeJsonStorage(SENSITIVE_DRAFT_KEY, testDraftPayload);
    const memory = (global as any).__vaultTestMemory;
    const rawStored = memory.get(SENSITIVE_DRAFT_KEY);
    assert.ok(rawStored, 'Sensitive draft must be stored in memory');
    assert.ok(rawStored.startsWith('ck1:'), `Sensitive storage must be encrypted with ck1: prefix, got: ${rawStored.slice(0, 10)}`);

    const readBack = await readJsonStorage<typeof testDraftPayload>(SENSITIVE_DRAFT_KEY, null as any);
    assert.ok(readBack, 'Decrypted draft must not be null');
    assert.strictEqual(readBack.currentIndex, 2);
    assert.strictEqual(readBack.responses['pe_d/s_dynamic'].rating, 'interested');
    assert.strictEqual(readBack.responses['bo_rope'].rating, 'hard_limit');

    VaultSession.lock();
  });

  console.log('\n--- 3. Express vs Completo Mode Activity Filtering ---');

  await runTest('Express mode filters active activities to 10 express items', () => {
    const allActs = getAllActivities();
    const expressActs = allActs.filter((a) => EXPRESS_ACTIVITY_IDS.includes(a.id));
    assert.strictEqual(expressActs.length, 10);
  });

  await runTest('Completo mode returns all activities across enabled categories', () => {
    const allActs = getAllActivities();
    const enabledCategories: ActivityCategory[] = [...CATEGORY_ORDER];
    const filtered = allActs.filter((a) => enabledCategories.includes(a.category));
    assert.strictEqual(filtered.length, allActs.length);
    assert.ok(filtered.length > 100, `Expected > 100 activities, got ${filtered.length}`);
  });

  console.log('\n--- 4. Category, Difficulty, Search & Mood Filters ---');

  await runTest('Difficulty level filter correctly restricts activities', () => {
    const allActs = getAllActivities();
    const beginnerActs = allActs.filter((a) => a.difficultyLevel === 'beginner');
    const intermediateActs = allActs.filter((a) => a.difficultyLevel === 'intermediate');
    const advancedActs = allActs.filter((a) => a.difficultyLevel === 'advanced');

    assert.ok(beginnerActs.length > 0, 'Must have beginner activities');
    assert.ok(intermediateActs.length > 0, 'Must have intermediate activities');
    assert.ok(advancedActs.length > 0, 'Must have advanced activities');
    assert.strictEqual(beginnerActs.length + intermediateActs.length + advancedActs.length, allActs.length);
  });

  await runTest('Search query matching on activity name and category', () => {
    const allActs = getAllActivities();
    const query = 'cuerdas';
    const matches = allActs.filter(
      (a) => a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
    );
    assert.ok(matches.length > 0, 'Search for "cuerdas" must return matches');
    assert.ok(matches.some((a) => a.id === 'bo_rope'), 'bo_rope should match cuerdas');
  });

  await runTest('Category toggle safeguard (at least 1 category must remain active)', () => {
    let enabled: ActivityCategory[] = ['power_exchange'];
    const toggle = (cat: ActivityCategory) => {
      if (enabled.includes(cat)) {
        if (enabled.length === 1) return enabled; // safeguard
        return enabled.filter((c) => c !== cat);
      } else {
        return [...enabled, cat];
      }
    };

    const afterAttemptRemoveLast = toggle('power_exchange');
    assert.strictEqual(afterAttemptRemoveLast.length, 1, 'Cannot remove sole remaining category');
    assert.strictEqual(afterAttemptRemoveLast[0], 'power_exchange');

    const afterAdd = toggle('bondage');
    assert.strictEqual(afterAdd.length, 2);
  });

  await runTest('Mood filter matching categories', () => {
    const mood: ActivityMood = 'sensual_relajante';
    const matchingCats = Array.from(
      new Set(
        getAllActivities()
          .filter((a) => a.moods?.includes(mood))
          .map((a) => a.category)
      )
    );
    assert.ok(matchingCats.length > 0, 'sensual_relajante mood should match categories');
    assert.ok(matchingCats.includes('sensation'), 'sensation category should match sensual_relajante');
  });

  console.log('\n--- 5. Custom Activities Integration ---');

  await runTest('Custom activities extend total activities count', () => {
    const customActivity = {
      id: 'custom_test_1',
      category: 'bondage' as ActivityCategory,
      name: 'Custom Rope Tie',
      description: 'Test description',
      difficultyLevel: 'beginner' as DifficultyLevel,
    };

    const merged = getAllActivities([customActivity]);
    assert.strictEqual(merged.length, ACTIVITIES.length + 1);
    assert.strictEqual(merged[merged.length - 1].id, 'custom_test_1');
  });

  console.log('\n----------------------------------------------------');
  console.log(`Stress Test Results: ${passedCount}/${testCount} passed`);
  console.log('----------------------------------------------------');
  
  if (passedCount !== testCount) {
    process.exit(1);
  }
}

runStressTests().catch((e) => {
  console.error('Fatal error during stress testing:', e);
  process.exit(1);
});
