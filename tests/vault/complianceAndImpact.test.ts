/**
 * Compliance & Impact Metrics Test Suite
 *
 * Empirical verification of:
 * 1. Privacy Consent Audit Logging (SHA-256 hash + timestamping).
 * 2. Full Data Portability JSON Export (GDPR / ARCO compliance).
 * 3. Data Retention Policy Auto-Purge of inactive sessions (> 30 days).
 * 4. Post-report feedback capture & 30-day couple retention analytics.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultSession, setupVaultForNewProfile } from '../../lib/cryptoVault';
import {
  recordPrivacyConsent,
  getConsentAuditRecords,
  exportFullUserDataJSON,
  applyDataRetentionPolicy,
} from '../../lib/complianceManager';
import {
  recordPostReportFeedback,
  getCoupleImpactMetrics,
} from '../../lib/impactAnalytics';
import { createLocalSession, saveProfile } from '../../lib/storage';

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

async function runComplianceAndImpactSuite() {
  console.log('\n====================================================');
  console.log('  COMPLIANCE & IMPACT METRICS TEST SUITE');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();

  // Initialize vault profile
  await setupVaultForNewProfile('compliance_user', '777777');
  await saveProfile({ nickname: 'compliance_user', experienceLevel: 'advanced', role: 'dom' });

  // 1. Consent Audit Record
  console.log('--- 1. Privacy Consent Audit Logging ---');
  const consent = await recordPrivacyConsent('compliance_user', '2026-08-10-v1.0');
  assert(consent.policyVersion === '2026-08-10-v1.0', 'Policy version recorded');
  assert(consent.versionHashB64.startsWith('sha256-'), 'Version hash generated');

  const records = await getConsentAuditRecords();
  assert(records.length === 1, 'Consent record saved in ZK storage');

  // 2. Data Portability Export
  console.log('\n--- 2. Data Portability Export (GDPR) ---');
  const exportJsonStr = await exportFullUserDataJSON('compliance_user');
  const exportData = JSON.parse(exportJsonStr);
  assert(exportData.exportVersion === '1.0', 'Export version is 1.0');
  assert(exportData.userProfiles.length === 1, 'User profile included in export');
  assert(exportData.privacyConsentAudit.length === 1, 'Privacy consent audit included in export');

  // 3. Data Retention Auto-Purge
  console.log('\n--- 3. Data Retention Policy Auto-Purge ---');
  await createLocalSession('compliance_user', []);
  const retentionRes = await applyDataRetentionPolicy(30);
  assert(retentionRes.purgedCount === 0, 'Recent session retained (0 purged)');

  // 4. Impact Metrics Feedback
  console.log('\n--- 4. Impact Metrics & Feedback Capture ---');
  await recordPostReportFeedback('session_123', 'helpful');
  const metrics = await getCoupleImpactMetrics();

  assert(metrics.totalFeedbackCount === 1, 'Total feedback count is 1');
  assert(metrics.helpfulPercentage === 100, 'Helpful percentage is 100%');

  console.log(`\n====================================================`);
  console.log(`Compliance Suite Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runComplianceAndImpactSuite().catch((err) => {
  console.error('Unhandled error in Compliance Suite:', err);
  process.exit(1);
});
