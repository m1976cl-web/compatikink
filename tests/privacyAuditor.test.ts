import assert from 'node:assert/strict';
import { runPrivacyAudit } from '../lib/privacyAuditor';

async function runPrivacyAuditorTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — P1 Privacy Auditor Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  console.log('1. Running Privacy & Encryption Audit...');
  const auditReport = await runPrivacyAudit();

  assert(auditReport.overallScore >= 0 && auditReport.overallScore <= 100, 'Score is percentage 0-100');
  assert(auditReport.layers.length >= 5, 'Audit includes at least 5 cryptographic layers');
  assert(auditReport.totalChecks === auditReport.layers.length, 'Total checks count matches layers');
  assert(auditReport.shieldTier.length > 0, 'Shield tier is defined');
  assert(auditReport.shieldColor.length > 0, 'Shield color is defined');

  // Verify critical layers
  const pbkdf2Layer = auditReport.layers.find((l) => l.id === 'pbkdf2_pin');
  assert(pbkdf2Layer, 'PBKDF2 layer is present');

  const aesGcmLayer = auditReport.layers.find((l) => l.id === 'aes_gcm_vault');
  assert(aesGcmLayer, 'AES-GCM vault layer is present');
  assert.equal(aesGcmLayer.isSecured, true, 'AES-GCM is always secured in engine');

  const zkSessionLayer = auditReport.layers.find((l) => l.id === 'zk_sessions');
  assert(zkSessionLayer, 'ZK sessions layer is present');
  assert.equal(zkSessionLayer.isSecured, true, 'Remote sessions are zero-knowledge');

  console.log(`  ✅ Privacy score computed: ${auditReport.overallScore}% (${auditReport.shieldTier})`);
  console.log(`  ✅ ${auditReport.passedChecks}/${auditReport.totalChecks} cryptographic security layers verified`);

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All P1 Privacy Auditor Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runPrivacyAuditorTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
