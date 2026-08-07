import assert from 'node:assert/strict';
import {
  scheduleLocalNotification,
  getScheduledNotifications,
  clearAllLocalNotifications,
  schedule3PhaseAftercareProtocol,
  cancelScheduledAftercareNotifications,
  AFTERCARE_PHASES,
} from '../lib/localNotifications';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — Local Notifications Test Suite (Opción C)');
console.log('════════════════════════════════════════════════════\n');

async function testNotificationsEngine() {
  console.log('1. Clearing existing notifications...');
  await clearAllLocalNotifications();
  const initial = await getScheduledNotifications();
  assert.equal(initial.length, 0);
  console.log('  ✅ Notification store cleared');

  console.log('\n2. Scheduling single Local Notification...');
  const notifId = await scheduleLocalNotification(
    '🪷 Recordatorio de Aftercare',
    'Han transcurrido 15 minutos. Revisa la hidratación de tu pareja.',
    900,
    'aftercare'
  );
  assert.ok(notifId.startsWith('notif_'));
  console.log(`  ✅ Scheduled notification with ID: ${notifId}`);

  console.log('\n3. Retrieving scheduled notifications...');
  const list = await getScheduledNotifications();
  assert.equal(list.length, 1);
  assert.equal(list[0].title, '🪷 Recordatorio de Aftercare');
  assert.equal(list[0].type, 'aftercare');
  console.log('  ✅ Scheduled notification persisted and retrieved successfully');

  console.log('\n4. Testing 3-Phase Aftercare Protocol Scheduling...');
  await clearAllLocalNotifications();
  const ids = await schedule3PhaseAftercareProtocol();
  assert.equal(ids.length, 3);
  assert.ok(ids[0].startsWith('notif_'));
  assert.ok(ids[1].startsWith('notif_'));
  assert.ok(ids[2].startsWith('notif_'));

  const pendingAftercare = await getScheduledNotifications();
  assert.equal(pendingAftercare.length, 3);

  // Phase 1 verification (15 min / 900s)
  assert.equal(pendingAftercare[0].phase, 1);
  assert.equal(pendingAftercare[0].triggerSeconds, 900);
  assert.equal(pendingAftercare[0].type, 'aftercare');
  assert.equal(pendingAftercare[0].title, AFTERCARE_PHASES[0].title);
  assert.equal(pendingAftercare[0].body, AFTERCARE_PHASES[0].body);

  // Phase 2 verification (30 min / 1800s)
  assert.equal(pendingAftercare[1].phase, 2);
  assert.equal(pendingAftercare[1].triggerSeconds, 1800);
  assert.equal(pendingAftercare[1].type, 'aftercare');
  assert.equal(pendingAftercare[1].title, AFTERCARE_PHASES[1].title);
  assert.equal(pendingAftercare[1].body, AFTERCARE_PHASES[1].body);

  // Phase 3 verification (24h / 86400s)
  assert.equal(pendingAftercare[2].phase, 3);
  assert.equal(pendingAftercare[2].triggerSeconds, 86400);
  assert.equal(pendingAftercare[2].type, 'aftercare');
  assert.equal(pendingAftercare[2].title, AFTERCARE_PHASES[2].title);
  assert.equal(pendingAftercare[2].body, AFTERCARE_PHASES[2].body);
  console.log('  ✅ 3-Phase Aftercare Protocol successfully scheduled with correct delays and phases');

  console.log('\n5. Verifying Zero-Knowledge Privacy & Payload Safety...');
  for (const task of pendingAftercare) {
    const titleLower = task.title.toLowerCase();
    const bodyLower = task.body.toLowerCase();
    assert.equal(titleLower.includes('dek'), false, 'Title must not contain DEK');
    assert.equal(bodyLower.includes('dek'), false, 'Body must not contain DEK');
    assert.equal(titleLower.includes('secret'), false, 'Title must not contain secrets');
    assert.equal(bodyLower.includes('secret'), false, 'Body must not contain secrets');
    assert.equal(titleLower.includes('aes-256'), false, 'Title must not contain cipher details');
    assert.equal(bodyLower.includes('aes-256'), false, 'Body must not contain cipher details');
    assert.equal(titleLower.includes('password'), false, 'Title must not contain passwords');
    assert.equal(bodyLower.includes('password'), false, 'Body must not contain passwords');
  }
  console.log('  ✅ Zero-Knowledge AES-256 Privacy constraints verified: titles/bodies are discreet');

  console.log('\n6. Testing Aftercare Notification Cancellation...');
  // Add a non-aftercare notification to ensure selective cancellation
  const otherId = await scheduleLocalNotification(
    '🔒 Bóveda de Seguridad',
    'Recordatorio de respaldo de clave de emergencia.',
    3600,
    'vault_reminder'
  );
  assert.ok(otherId);

  const beforeCancel = await getScheduledNotifications();
  assert.equal(beforeCancel.length, 4); // 3 aftercare + 1 vault_reminder

  await cancelScheduledAftercareNotifications();

  const afterCancel = await getScheduledNotifications();
  assert.equal(afterCancel.length, 1);
  assert.equal(afterCancel[0].type, 'vault_reminder');
  assert.equal(afterCancel[0].id, otherId);
  console.log('  ✅ Aftercare notifications successfully cancelled while retaining other notification types');
}

testNotificationsEngine()
  .then(() => {
    console.log('\n────────────────────────────────────────────────────');
    console.log('  Results: All Option C Notification Tests Passed! ✅');
    console.log('────────────────────────────────────────────────────\n');
  })
  .catch((e) => {
    console.error('\n❌ Test Failure:', e?.message || e);
    process.exit(1);
  });
