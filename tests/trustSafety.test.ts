import assert from 'node:assert/strict';
import {
  getBlockedUsers,
  blockUser,
  unblockUser,
  isUserBlocked,
  filterBlockedItems,
  createModerationReport,
  getModerationReports,
  updateReportStatus,
  REPORT_REASON_LABELS,
} from '../lib/trustSafety';

async function runTrustSafetyTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — Trust & Safety Test Suite (P5)');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Test Blocking Users
  console.log('1. Testing User Blocking & Storage...');
  await blockUser({
    id: 'user-bad-123',
    nickname: 'Acosador_Anon',
    reason: 'Mensajes no deseados',
  });

  const blocked = await getBlockedUsers();
  assert(blocked.length >= 1, 'Should have at least 1 blocked user');
  assert(blocked.some((b) => b.userId === 'user-bad-123'), 'Blocked user ID matches');
  console.log('  ✅ Blocked user stored and retrieved successfully');

  // 2. Test isUserBlocked helper
  console.log('\n2. Testing isUserBlocked helper...');
  const isBlockedById = await isUserBlocked('user-bad-123');
  const isBlockedByNick = await isUserBlocked('Acosador_Anon');
  const isRandomBlocked = await isUserBlocked('Usuario_Amable_99');

  assert.equal(isBlockedById, true, 'User is blocked by ID');
  assert.equal(isBlockedByNick, true, 'User is blocked by Nickname');
  assert.equal(isRandomBlocked, false, 'Non-blocked user is not blocked');
  console.log('  ✅ isUserBlocked correctly verifies ID and nickname');

  // 3. Test filterBlockedItems helper
  console.log('\n3. Testing filterBlockedItems (Bidirectional Filter)...');
  const samplePosts = [
    { id: 'p1', author: 'Usuario_Amable_99', content: '¡Hola a todos!' },
    { id: 'p2', author: 'Acosador_Anon', content: 'Mensaje ofensivo' },
    { id: 'p3', author: 'Rigger_Pro', content: 'Consejo de Shibari' },
  ];

  const filtered = filterBlockedItems(samplePosts, blocked);
  assert.equal(filtered.length, 2, 'Blocked post was filtered out');
  assert.equal(filtered.some((p) => p.author === 'Acosador_Anon'), false, 'Blocked author removed');
  console.log('  ✅ Filtered out blocked user posts completely');

  // 4. Test Unblocking User
  console.log('\n4. Testing Unblocking...');
  const afterUnblock = await unblockUser('user-bad-123');
  const checkNow = await isUserBlocked('user-bad-123');
  assert.equal(checkNow, false, 'User successfully unblocked');
  console.log('  ✅ User unblocked successfully');

  // 5. Test Moderation Reports
  console.log('\n5. Testing Moderation Reports Creation & Status...');
  const report = await createModerationReport({
    targetType: 'post',
    targetId: 'fp-999',
    targetAuthorName: 'Spammer_123',
    targetPreviewText: 'Compra bitcoins aquí',
    reasonCategory: 'spam_fraud',
    description: 'Publicidad no autorizada en feed',
  });

  assert(report.id.startsWith('rep_'), 'Report has valid ID');
  assert.equal(report.status, 'pending', 'New report has pending status');
  assert(REPORT_REASON_LABELS[report.reasonCategory] !== undefined, 'Reason category exists in catalog');

  const allReports = await getModerationReports();
  assert(allReports.some((r) => r.id === report.id), 'Report persisted in list');

  const updatedReports = await updateReportStatus(report.id, 'actioned');
  const updatedReport = updatedReports.find((r) => r.id === report.id);
  assert.equal(updatedReport?.status, 'actioned', 'Report status updated to actioned');
  console.log('  ✅ Moderation reports creation and lifecycle verified');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All P5 Trust & Safety Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runTrustSafetyTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
