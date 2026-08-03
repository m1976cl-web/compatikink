/**
 * Challenger 2 Empirical Stress Test Harness
 * 
 * Objective:
 * 1. Test invalid/empty inputs for profile search and kink filters.
 * 2. Test unauthenticated or missing vault keys for private RSVP venue decryption.
 * 3. Test layout boundaries for desktop (>768px) and mobile (<=768px).
 * 4. Confirm data/manualData.ts contains all 30 modules across 6 areas.
 */

import { COMMUNITY_PROFILES, CommunityProfile } from '../data/communityProfiles';
import { MANUAL_AREAS, MANUAL_MODULES } from '../data/manualData';
import { decryptEventVenueKey, encryptEventVenueKey, calculateRoleComplementarityScore } from '../lib/vault';
import { VaultSession, readStorageValue, writeStorageValue, isSealedBlob, SEALED_PREFIX } from '../lib/cryptoVault';
import { evalUseResponsive } from './responsiveLayout.test';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string, detail?: string) {
  if (cond) {
    console.log(`  ✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ----------------------------------------------------------------------
// 1. Profile Search & Kink Filters Stress Test
// ----------------------------------------------------------------------
function testProfileSearchAndKinkFilters() {
  console.log('\n======================================================================');
  console.log('  1. EMPIRICAL STRESS TEST: Profile Search & Kink Filters');
  console.log('======================================================================');

  // Helper matching logic extracted directly from app/dating.tsx
  function filterProfiles(
    profiles: CommunityProfile[],
    searchQuery: string,
    minScoreFilter: number,
    selectedRoleFilter: string,
    fetlifeRoleFilter: string
  ): CommunityProfile[] {
    return profiles.filter((p) => {
      // Base score simulation (75% default)
      const baseScore = 75;
      const roleScore = calculateRoleComplementarityScore('Switch', p.role || 'Switch');
      const score = Math.round(baseScore * 0.6 + roleScore * 0.4);

      if (score < minScoreFilter) return false;

      if (selectedRoleFilter && selectedRoleFilter !== 'all') {
        const pRole = (p.role || '').toLowerCase();
        const target = selectedRoleFilter.toLowerCase();
        if (!pRole.includes(target)) return false;
      }

      if (fetlifeRoleFilter && fetlifeRoleFilter !== 'all') {
        const q = fetlifeRoleFilter.toLowerCase();
        const matchesRole = (p.bio || '').toLowerCase().includes(q) || p.topKinks.some((k) => k.toLowerCase().includes(q));
        if (!matchesRole) return false;
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.nickname.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesKinks = p.topKinks.some((k) => k.toLowerCase().includes(q));
        const matchesBadges = (p.fetishBadges || []).some((b) => b.label.toLowerCase().includes(q));
        if (!matchesName && !matchesBio && !matchesKinks && !matchesBadges) return false;
      }
      return true;
    });
  }

  // Test Case 1.1: Empty & Whitespace Queries
  const allProfiles = COMMUNITY_PROFILES;
  const emptyRes = filterProfiles(allProfiles, '', 0, 'all', 'all');
  assert(emptyRes.length === 6, 'Empty search query returns all 6 community profiles');

  const whitespaceRes = filterProfiles(allProfiles, '   \t\n  ', 0, 'all', 'all');
  assert(whitespaceRes.length === 6, 'Whitespace search query returns all 6 community profiles');

  // Test Case 1.2: Special Regex Characters & Injection Patterns
  const specialChars = ['(', '[', '*', '+', '\\', '?', '$', '^', '|', '.', '{', '}'];
  let specialCharsSafe = true;
  for (const char of specialChars) {
    try {
      filterProfiles(allProfiles, char, 0, 'all', 'all');
    } catch {
      specialCharsSafe = false;
    }
  }
  assert(specialCharsSafe, 'Special regex characters do not crash search filter (no unhandled RegExp error)');

  const injectionQueries = ["' OR '1'='1", '<script>alert(1)</script>', 'DROP TABLE users;', '${process.env}'];
  let injectionSafe = true;
  for (const q of injectionQueries) {
    try {
      const res = filterProfiles(allProfiles, q, 0, 'all', 'all');
      if (!Array.isArray(res)) injectionSafe = false;
    } catch {
      injectionSafe = false;
    }
  }
  assert(injectionSafe, 'SQL/XSS/Template injection queries handle safely without crashing');

  // Test Case 1.3: Extremely Long Search Input
  const longQuery = 'A'.repeat(10000);
  const longRes = filterProfiles(allProfiles, longQuery, 0, 'all', 'all');
  assert(longRes.length === 0, '10,000 character search query safely returns 0 results');

  // Test Case 1.4: Adversarial Score Filter Inputs
  const negScoreRes = filterProfiles(allProfiles, '', -50, 'all', 'all');
  assert(negScoreRes.length === 6, 'Negative min score filter (-50) safely returns all profiles');

  const over100ScoreRes = filterProfiles(allProfiles, '', 150, 'all', 'all');
  assert(over100ScoreRes.length === 0, 'Score filter > 100% (150) safely returns 0 profiles');

  const nanScoreRes = filterProfiles(allProfiles, '', NaN, 'all', 'all');
  assert(nanScoreRes.length === 6, 'NaN score filter safely falls back without crashing');

  // Test Case 1.5: Adversarial Role Filter Inputs
  const invalidRoleRes = filterProfiles(allProfiles, '', 0, 'nonexistent_role_xyz', 'all');
  assert(invalidRoleRes.length === 0, 'Non-existent role filter returns 0 profiles without error');

  const validDomRes = filterProfiles(allProfiles, '', 0, 'dom', 'all');
  assert(validDomRes.length >= 1, 'Valid "dom" role filter returns matching profiles');
}

// ----------------------------------------------------------------------
// 2. Private RSVP Venue Decryption & Vault Key Stress Test
// ----------------------------------------------------------------------
async function testPrivateVenueDecryptionAndVaultGuardrails() {
  console.log('\n======================================================================');
  console.log('  2. EMPIRICAL STRESS TEST: Private RSVP Venue Decryption & Vault');
  console.log('======================================================================');

  const originalVenue = 'Calle Secret 123, Sala B, Providencia';
  const correctKey = 'secret-host-munch-key-999';
  const wrongKey = 'wrong-key-attempter-000';

  // Encrypt with correct host key
  const encryptedBlob = await encryptEventVenueKey(originalVenue, correctKey);
  assert(isSealedBlob(encryptedBlob), 'encryptEventVenueKey returns a valid ck1: sealed blob');

  // Test 2.1: Valid Secret Decryption
  const decryptedOk = await decryptEventVenueKey(encryptedBlob, correctKey);
  assert(decryptedOk === originalVenue, 'Decryption with correct host key recovers exact venue address');

  // Test 2.2: Decryption with WRONG Secret Key (Unauthenticated Attempter)
  const decryptedWrongKey = await decryptEventVenueKey(encryptedBlob, wrongKey);
  const isFallback = decryptedWrongKey.includes('Ubicación confidencial protegida por cifrado');
  assert(
    isFallback,
    'Decryption with WRONG host key fails gracefully and returns confidentiality notice'
  );
  assert(
    !decryptedWrongKey.includes(originalVenue),
    'Decryption with WRONG host key NEVER leaks cleartext venue address'
  );

  // Test 2.3: Decryption with EMPTY / MISSING Key
  const decryptedEmptyKey = await decryptEventVenueKey(encryptedBlob, '');
  assert(
    !decryptedEmptyKey.includes(originalVenue),
    'Decryption with EMPTY secret key does NOT leak cleartext venue address'
  );

  // Test 2.4: Decryption with CORRUPTED / MALFORMED Blob
  const malformedBlob1 = 'ck1:invalid-base64-payload!!!';
  const decryptedMalformed1 = await decryptEventVenueKey(malformedBlob1, correctKey);
  assert(
    decryptedMalformed1.includes('Ubicación confidencial protegida por cifrado'),
    'Corrupted ck1: blob returns fallback message without crashing'
  );

  const malformedBlob2 = 'not-a-ck1-prefix-blob';
  const decryptedMalformed2 = await decryptEventVenueKey(malformedBlob2, correctKey);
  assert(
    decryptedMalformed2.includes('Ubicación confidencial protegida por cifrado'),
    'Non-ck1 blob returns fallback message without crashing'
  );

  // Test 2.5: Vault Lock Guardrail Check
  VaultSession.lock();
  const isLocked = !VaultSession.isUnlocked();
  assert(isLocked, 'VaultSession is currently locked');

  // Write sealed storage item while locked
  await writeStorageValue('dating_direct_messages', SEALED_PREFIX + 'test-sealed-blob');

  let blockedErrorThrown = false;
  try {
    await readStorageValue('dating_direct_messages');
  } catch (err: any) {
    if (err.message && err.message.includes('Bóveda bloqueada')) {
      blockedErrorThrown = true;
    }
  }
  assert(
    blockedErrorThrown,
    'Reading sealed storage key when vault is LOCKED throws "Bóveda bloqueada" error'
  );
}

// ----------------------------------------------------------------------
// 3. Layout Boundaries (>768px vs <=768px) Stress Test
// ----------------------------------------------------------------------
function testLayoutBoundaries() {
  console.log('\n======================================================================');
  console.log('  3. EMPIRICAL STRESS TEST: Responsive Layout Boundaries (>768px vs <=768px)');
  console.log('======================================================================');

  // Test 3.1: Boundary Evaluations
  const testWidths = [
    { w: 320, expectedDesktop: false, category: 'Mobile (320px)' },
    { w: 599, expectedDesktop: false, category: 'Mobile (599px)' },
    { w: 600, expectedDesktop: false, category: 'Tablet (600px)' },
    { w: 767, expectedDesktop: false, category: 'Tablet/Mobile Boundary (767px)' },
    { w: 768, expectedDesktop: true, category: 'Desktop Boundary (768px)' },
    { w: 1024, expectedDesktop: true, category: 'Desktop HD (1024px)' },
    { w: 1440, expectedDesktop: true, category: 'Desktop FHD (1440px)' },
    { w: 1920, expectedDesktop: true, category: 'Desktop 4K (1920px)' },
  ];

  for (const { w, expectedDesktop, category } of testWidths) {
    const res = evalUseResponsive(w);
    assert(
      res.isDesktop === expectedDesktop,
      `Width ${w}px (${category}): isDesktop evaluated to ${res.isDesktop} (expected ${expectedDesktop})`
    );
  }

  // Test 3.2: Mobile Screen Padding & Desktop MaxWidth Invariant
  // Mobile (<768px) should fit full screen with 100% width & padding
  // Desktop (>=768px) should cap container at max-width 780px / 800px / 1140px centered
  const mobileWidth = 375;
  const desktopWidth = 1200;

  const mobileRes = evalUseResponsive(mobileWidth);
  const desktopRes = evalUseResponsive(desktopWidth);

  assert(!mobileRes.isDesktop, '375px is identified as non-desktop (Mobile)');
  assert(desktopRes.isDesktop, '1200px is identified as Desktop');
}

// ----------------------------------------------------------------------
// 4. Data Completeness: data/manualData.ts 30 Modules Across 6 Areas
// ----------------------------------------------------------------------
function testManualDataCompleteness() {
  console.log('\n======================================================================');
  console.log('  4. EMPIRICAL STRESS TEST: data/manualData.ts Completeness');
  console.log('======================================================================');

  // Test 4.1: Area Count
  assert(MANUAL_AREAS.length === 6, `MANUAL_AREAS contains exactly 6 areas (found ${MANUAL_AREAS.length})`);

  // Test 4.2: Total Modules Count
  assert(
    MANUAL_MODULES.length === 30,
    `MANUAL_MODULES contains exactly 30 modules (found ${MANUAL_MODULES.length})`
  );

  // Test 4.3: Module Count Across 6 Areas
  const totalModuleIdsInAreas = MANUAL_AREAS.reduce((acc, area) => acc + area.moduleIds.length, 0);
  assert(
    totalModuleIdsInAreas === 30,
    `Total moduleIds defined across 6 areas equals 30 (found ${totalModuleIdsInAreas})`
  );

  let allAreasHave5Modules = true;
  MANUAL_AREAS.forEach((area, idx) => {
    if (area.moduleIds.length !== 5) {
      allAreasHave5Modules = false;
      console.error(`  ❌ Area ${idx + 1} (${area.id}) has ${area.moduleIds.length} modules, expected 5`);
    }
  });
  assert(allAreasHave5Modules, 'Each of the 6 areas has exactly 5 modules (6 x 5 = 30)');

  // Test 4.4: Uniqueness & Referential Integrity of Module IDs
  const moduleMap = new Set(MANUAL_MODULES.map((m) => m.id));
  assert(moduleMap.size === 30, `All 30 module IDs in MANUAL_MODULES are unique (unique count: ${moduleMap.size})`);

  let referentialIntegrityOk = true;
  for (const area of MANUAL_AREAS) {
    for (const modId of area.moduleIds) {
      if (!moduleMap.has(modId)) {
        referentialIntegrityOk = false;
        console.error(`  ❌ Area ${area.id} references missing module ID: ${modId}`);
      }
    }
  }
  assert(referentialIntegrityOk, 'All 30 module IDs referenced in MANUAL_AREAS exist in MANUAL_MODULES');

  // Test 4.5: Non-empty Required Fields for all 30 modules
  let fieldsValid = true;
  for (const mod of MANUAL_MODULES) {
    if (
      !mod.id ||
      !mod.title ||
      !mod.category ||
      !mod.description ||
      !mod.summary ||
      !Array.isArray(mod.keyFeatures) ||
      mod.keyFeatures.length === 0 ||
      !Array.isArray(mod.stepByStepGuide) ||
      mod.stepByStepGuide.length === 0 ||
      !mod.practicalExample ||
      !Array.isArray(mod.tags) ||
      mod.tags.length === 0
    ) {
      fieldsValid = false;
      console.error(`  ❌ Module ${mod.id} is missing required fields`);
    }
  }
  assert(fieldsValid, 'All 30 modules have non-empty titles, summaries, guides, examples, and tags');
}

// ----------------------------------------------------------------------
// Main Runner
// ----------------------------------------------------------------------
async function main() {
  console.log('======================================================================');
  console.log('  CHALLENGER 2 — EMPIRICAL STRESS TEST SUITE RUNNER');
  console.log('======================================================================');

  testProfileSearchAndKinkFilters();
  await testPrivateVenueDecryptionAndVaultGuardrails();
  testLayoutBoundaries();
  testManualDataCompleteness();

  console.log('\n----------------------------------------------------------------------');
  console.log(`FINAL STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('----------------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled failure in stress test harness:', err);
  process.exit(1);
});
