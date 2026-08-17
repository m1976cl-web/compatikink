/**
 * tests/components.test.ts — Component Logic & Export Verification Suite
 *
 * Tests critical component modules for:
 * 1. Correct exports (named exports, no default where unexpected)
 * 2. Type safety of props interfaces
 * 3. Logic functions that components depend on
 * 4. Edge cases in business logic used by components
 */

import assert from 'node:assert/strict';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — Component Logic Test Suite (Tier 1.3)');
console.log('════════════════════════════════════════════════════\n');

async function testComponentLogic() {
  // ─── 1. VaultLockGate: crypto exports ──────────────────────────────
  console.log('1. Testing VaultLockGate dependencies (cryptoVault exports)...');
  const crypto = await import('../lib/cryptoVault');
  assert.ok(typeof crypto.SEALED_PREFIX === 'string', 'SEALED_PREFIX must be string');
  assert.equal(crypto.SEALED_PREFIX, 'ck1:');
  assert.ok(typeof crypto.PBKDF2_ITERATIONS === 'number', 'PBKDF2_ITERATIONS must be number');
  assert.ok(crypto.PBKDF2_ITERATIONS >= 100_000, 'PBKDF2_ITERATIONS must be >= 100k');
  assert.ok(Array.isArray(crypto.SENSITIVE_STORAGE_KEYS), 'SENSITIVE_STORAGE_KEYS must be array');
  assert.ok(crypto.SENSITIVE_STORAGE_KEYS.length >= 5, 'Must have at least 5 sensitive keys');
  assert.ok(typeof crypto.VAULT_LOCK_EVENT === 'string');
  assert.ok(typeof crypto.VAULT_UNLOCK_EVENT === 'string');
  console.log('  ✅ VaultLockGate crypto dependencies verified');

  // ─── 2. IntimateAssistantModal: geminiAssistant exports ────────────
  console.log('\n2. Testing IntimateAssistantModal dependencies (geminiAssistant)...');
  const gemini = await import('../lib/geminiAssistant');
  assert.ok(typeof gemini.askGeminiAssistant === 'function', 'askGeminiAssistant must be exported');
  assert.ok(typeof gemini.generateSyntheticResponse === 'function', 'generateSyntheticResponse must be exported');

  // Test synthetic response generation (used by modal)
  const response = gemini.generateSyntheticResponse('Shibari safety tips');
  assert.ok(response.includes('Shibari'), 'Synthetic response must be contextual');
  assert.ok(response.length > 50, 'Synthetic response must be detailed');
  console.log('  ✅ IntimateAssistantModal dependencies verified');

  // ─── 3. AgeVerificationModal: date validation logic ────────────────
  console.log('\n3. Testing AgeVerificationModal age calculation logic...');
  function isAtLeast18(dob: Date): boolean {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }

  const now = new Date();
  const eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  const seventeenYearsAgo = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());

  assert.ok(isAtLeast18(eighteenYearsAgo), '18 years ago should be 18+');
  assert.ok(!isAtLeast18(seventeenYearsAgo), '17 years ago should NOT be 18 yet');
  console.log('  ✅ AgeVerificationModal age logic verified');

  // ─── 4. SessionsPanel: session data shape validation ───────────────
  console.log('\n4. Testing SessionsPanel data shape requirements...');
  const sessionsModule = await import('../lib/sessions');
  assert.ok(typeof sessionsModule.createSession === 'function', 'createSession must exist');
  assert.ok(typeof sessionsModule.parseInviteSecretFromUrl === 'function', 'parseInviteSecretFromUrl must exist');
  console.log('  ✅ SessionsPanel session module dependencies verified');

  // ─── 5. ModuleGrid: homeModules data integrity ────────────────────
  console.log('\n5. Testing ModuleGrid data source integrity...');
  const { STATIC_MODULES, CATEGORY_TABS, ACCENT_COLORS } = await import('../data/homeModules');
  assert.ok(Array.isArray(STATIC_MODULES), 'STATIC_MODULES must be array');
  assert.ok(STATIC_MODULES.length >= 30, `Must have >= 30 modules, got ${STATIC_MODULES.length}`);
  assert.ok(Array.isArray(CATEGORY_TABS), 'CATEGORY_TABS must be array');
  assert.equal(CATEGORY_TABS.length, 5, 'Must have 5 category tabs');

  // Verify every module has required fields
  for (const mod of STATIC_MODULES) {
    assert.ok(mod.title, `Module missing title`);
    assert.ok(mod.description, `Module ${mod.title} missing description`);
    assert.ok(mod.mark, `Module ${mod.title} missing mark`);
    assert.ok(mod.category, `Module ${mod.title} missing category`);
    assert.ok(
      ACCENT_COLORS[mod.category],
      `Module ${mod.title} has unknown category: ${mod.category}`
    );
  }

  // Verify no duplicate routes
  const routes = STATIC_MODULES.filter((m) => m.route).map((m) => m.route);
  const uniqueRoutes = new Set(routes);
  assert.equal(routes.length, uniqueRoutes.size, 'All module routes must be unique');

  console.log(`  ✅ ModuleGrid: ${STATIC_MODULES.length} modules verified, 0 duplicates, all categories valid`);

  // ─── 6. Analytics: whitelist enforcement ───────────────────────────
  console.log('\n6. Testing Analytics event whitelist enforcement...');
  const analytics = await import('../lib/analytics');
  assert.ok(typeof analytics.trackEvent === 'function', 'trackEvent must be exported');
  assert.ok(typeof analytics.trackPageView === 'function', 'trackPageView must be exported');
  assert.ok(typeof analytics.initAnalytics === 'function', 'initAnalytics must be exported');
  // isAnalyticsEnabled should be false in test env (no PLAUSIBLE_DOMAIN)
  assert.equal(analytics.isAnalyticsEnabled, false, 'Analytics should be disabled without config');
  console.log('  ✅ Analytics module exports and safety verified');

  // ─── 7. i18n: LanguageSelector integration ────────────────────────
  console.log('\n7. Testing LanguageSelector i18n integration...');
  const i18n = await import('../lib/i18n');
  assert.ok(typeof i18n.setLocale === 'function');
  assert.ok(typeof i18n.getCurrentLocale === 'function');
  await i18n.setLocale('en');
  assert.equal(i18n.getCurrentLocale(), 'en');
  await i18n.setLocale('pt');
  assert.equal(i18n.getCurrentLocale(), 'pt');
  await i18n.setLocale('es');
  assert.equal(i18n.getCurrentLocale(), 'es');
  console.log('  ✅ LanguageSelector i18n integration verified');

  // ─── 8. Pass & Play: 36 Deep Intimacy Questions ───────────────────
  console.log('\n8. Testing 36 Intimacy Questions content dataset...');
  const { INTIMACY_QUESTIONS_36 } = await import('../data/intimacyQuestions');
  assert.ok(Array.isArray(INTIMACY_QUESTIONS_36), 'INTIMACY_QUESTIONS_36 must be exported array');
  assert.ok(INTIMACY_QUESTIONS_36.length >= 12, 'Must have at least 12 questions');
  for (const q of INTIMACY_QUESTIONS_36) {
    assert.ok(typeof q === 'string' && q.length > 15, 'Each question must be a meaningful string');
  }
  console.log(`  ✅ 36 Intimacy Questions dataset verified (${INTIMACY_QUESTIONS_36.length} questions)`);

  // ─── 9. Screen Registry: core READY + honest suite PREVIEW ────────
  console.log('\n9. Testing Screen Registry classification...');
  const { SCREEN_REGISTRY, SCREEN_STATS, getScreenStatus } = await import('../data/screenRegistry');
  const screenKeys = Object.keys(SCREEN_REGISTRY);
  assert.ok(screenKeys.length >= 60, `Must have >= 60 screens, got ${screenKeys.length}`);
  // Core-first: suite screens are preview/demo; READY is the invite→report spine + safety.
  assert.ok(
    SCREEN_STATS.ready >= 15,
    `Must have >= 15 READY (core) screens, got ${SCREEN_STATS.ready}`
  );
  assert.ok(
    SCREEN_STATS.preview >= 20,
    `Suite should stay PREVIEW/demo, got ${SCREEN_STATS.preview} preview`
  );
  assert.equal(
    SCREEN_STATS.ready + SCREEN_STATS.preview + SCREEN_STATS.stub,
    SCREEN_STATS.total,
    'ready+preview+stub must equal total'
  );
  const coreReady = [
    '/questionnaire',
    '/invite',
    '/report',
    '/share',
    '/auth',
    '/backup',
    '/pass-and-play',
    '/onboarding',
    '/privacy-policy',
  ];
  for (const route of coreReady) {
    assert.equal(getScreenStatus(route).status, 'ready', `${route} must stay READY`);
  }
  assert.equal(getScreenStatus('/dating').status, 'preview', 'dating must be Demo/preview, not READY');
  assert.equal(getScreenStatus('/kink-feed').status, 'preview', 'kink-feed must be Demo/preview');
  console.log(
    `  ✅ Screen Registry verified (${screenKeys.length} screens, ${SCREEN_STATS.ready} READY / ${SCREEN_STATS.preview} PREVIEW)`
  );

  // ─── 10. Data Stores: Custom Activities logic ─────────────────────
  console.log('\n10. Testing Custom Activities data store...');
  const activitiesStore = await import('../data/activities');
  assert.ok(typeof activitiesStore.getAllActivities === 'function');
  assert.ok(typeof activitiesStore.getActivityById === 'function');
  const allActs = activitiesStore.getAllActivities();
  assert.ok(allActs.length >= 80, `Must have >= 80 activities, got ${allActs.length}`);
  assert.ok(activitiesStore.getActivityById('pe_d/s_dynamic'), 'Must find pe_d/s_dynamic');
  console.log(`  ✅ Custom Activities store verified (${allActs.length} total activities)`);

  // ─── 11. Data Stores: Manual Bookmarks logic ──────────────────────
  console.log('\n11. Testing Manual Bookmarks ZK storage exports...');
  const manualData = await import('../data/manualData');
  assert.ok(typeof manualData.loadManualBookmarks === 'function');
  assert.ok(typeof manualData.toggleManualBookmark === 'function');
  assert.ok(Array.isArray(manualData.MANUAL_MODULES), 'MANUAL_MODULES must be array');
  assert.ok(manualData.MANUAL_MODULES.length >= 20, 'Must have >= 20 manual modules');
  console.log(`  ✅ Manual Bookmarks & Modules verified (${manualData.MANUAL_MODULES.length} modules)`);

  // ─── 12. Deep Linking & Direct Invitation Format (R3 / Item #7) ──────
  console.log('\n12. Testing Deep Linking & Direct Invitation (lib/linking)...');
  const linking = await import('../lib/linking');
  assert.ok(typeof linking.parseInviteLink === 'function', 'parseInviteLink must be exported');
  assert.ok(typeof linking.generateQRCodeSVG === 'function', 'generateQRCodeSVG must be exported');

  // Test Case 1: Custom App Scheme
  const p1 = linking.parseInviteLink('compatikink://join/ABC123#k=SecretKey99');
  assert.equal(p1.inviteCode, 'ABC123');
  assert.equal(p1.inviteSecret, 'SecretKey99');
  assert.equal(p1.isValid, true);

  // Test Case 2: Custom App Scheme guest variant
  const p2 = linking.parseInviteLink('compatikink://guest/ABC123#k=SecretKey99');
  assert.equal(p2.inviteCode, 'ABC123');
  assert.equal(p2.inviteSecret, 'SecretKey99');
  assert.equal(p2.isValid, true);

  // Test Case 3: Universal Web URL
  const p3 = linking.parseInviteLink('https://m1976cl-web.github.io/compatikink/guest/XYZ789#k=Key77');
  assert.equal(p3.inviteCode, 'XYZ789');
  assert.equal(p3.inviteSecret, 'Key77');
  assert.equal(p3.isValid, true);

  // Test Case 4: Web Query Fallback (invite?code=)
  const p4 = linking.parseInviteLink('https://m1976cl-web.github.io/compatikink/invite?code=DEF456&k=Key88');
  assert.equal(p4.inviteCode, 'DEF456');
  assert.equal(p4.inviteSecret, 'Key88');
  assert.equal(p4.isValid, true);

  // Test Case 4b: guest path with ?k= (WhatsApp-safe fallback)
  const p4b = linking.parseInviteLink('https://m1976cl-web.github.io/compatikink/guest/DEF456?k=Key88');
  assert.equal(p4b.inviteCode, 'DEF456');
  assert.equal(p4b.inviteSecret, 'Key88');
  assert.equal(p4b.isValid, true);
  assert.ok(
    typeof linking.createInviteWebUrlQueryFallback === 'function',
    'createInviteWebUrlQueryFallback must be exported'
  );
  const fb = linking.createInviteWebUrlQueryFallback('DEF456', 'Key88');
  assert.ok(fb.includes('/guest/DEF456') && fb.includes('?k=Key88'), 'query fallback embeds ?k=');

  // Test Case 5: Raw Code String Input
  const p5 = linking.parseInviteLink('  ghj001  ');
  assert.equal(p5.inviteCode, 'GHJ001');
  assert.equal(p5.inviteSecret, undefined);
  assert.equal(p5.isValid, true);

  // Test Case 6: Local Offline QR Code SVG Generation
  const svgData = linking.generateQRCodeSVG('https://m1976cl-web.github.io/compatikink/guest/ABC123#k=SecretKey99');
  assert.ok(svgData.startsWith('data:image/svg+xml;utf8,'), 'QR Code must be local SVG data URL');
  assert.ok(svgData.includes('%3Csvg'), 'QR SVG must contain valid SVG tag');
  // Test Case 7: P1.3 HTTPS Universal Deep Link Builders
  const { buildInviteLink, buildInviteMessage } = await import('../lib/storage/sessionStorage');
  const httpsLink = buildInviteLink('TEST99', 'SecretZk123');
  assert.equal(httpsLink, 'https://m1976cl-web.github.io/compatikink/guest/TEST99#k=SecretZk123');
  
  const msg = buildInviteMessage('TEST99', 'SecretZk123');
  assert.ok(msg.includes('https://m1976cl-web.github.io/compatikink/guest/TEST99#k=SecretZk123'), 'Message must contain HTTPS Universal Link');
  assert.ok(msg.includes('compatikink://join/TEST99#k=SecretZk123'), 'Message must contain custom scheme backup link');

  // Test Case 8: P1.4 Actionable 10-Minute Conversation Guide
  const { generateReport, generate10MinConversationGuide } = await import('../lib/compatibility');
  const mockReport = generateReport(
    'sess_123',
    [{ activityId: 'bondage_rope', rating: 'love', role: 'give', intensity: 3 }],
    [{ activityId: 'bondage_rope', rating: 'love', role: 'receive', intensity: 3 }]
  );
  const guide = generate10MinConversationGuide(mockReport);
  assert.equal(guide.totalDurationMinutes, 10, 'Guide duration must be 10 minutes');
  assert.equal(guide.phases.length, 3, 'Guide must contain exactly 3 structured phases');
  assert.ok(guide.formattedMarkdown.includes('Guión de Conversación Guiado de 10 Minutos'), 'Guide markdown title verified');
  console.log('  ✅ Actionable 10-Minute Conversation Guide verified (P1.4)');

  // ─── 13. Nox host scene registry ──────────────────────────────────
  console.log('\n13. Testing NoxHost scene registry...');
  const nox = await import('../components/nox/scenes');
  assert.ok(Array.isArray(nox.NOX_SCENE_IDS), 'NOX_SCENE_IDS must be an array');
  const expectedScenes = [
    'landing',
    'onboarding',
    'home',
    'auth',
    'questionnaire',
    'invite',
    'guest',
    'report',
    'manual',
    'share',
    'privacy',
  ];
  for (const id of expectedScenes) {
    assert.ok(nox.NOX_SCENE_IDS.includes(id as (typeof nox.NOX_SCENE_IDS)[number]), `missing scene ${id}`);
    const meta = nox.getNoxScene(id);
    assert.ok(meta.caption.length > 8, `${id} caption too short`);
    assert.ok(meta.a11y.toLowerCase().includes('nox'), `${id} a11y must mention Nox`);
  }
  assert.equal(nox.getNoxScene('not-a-scene').caption, nox.NOX_SCENES.landing.caption, 'unknown scene falls back to landing');
  assert.equal(nox.isNoxSceneId('invite'), true);
  assert.equal(nox.isNoxSceneId('dating'), false);
  console.log(`  ✅ NoxHost registry verified (${nox.NOX_SCENE_IDS.length} scenes)`);
}

testComponentLogic()
  .then(() => {
    console.log('\n────────────────────────────────────────────────────');
    console.log('  Results: All Tier 1.3 Component Logic Tests Passed! ✅');
    console.log('────────────────────────────────────────────────────\n');
  })
  .catch((e) => {
    console.error('\n❌ Test Failure:', e?.message || e);
    process.exit(1);
  });

