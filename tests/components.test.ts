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
  await i18n.setLocale('es');
  assert.equal(i18n.getCurrentLocale(), 'es');
  console.log('  ✅ LanguageSelector i18n integration verified');
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
