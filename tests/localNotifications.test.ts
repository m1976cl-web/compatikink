import assert from 'node:assert/strict';
import {
  scheduleLocalNotification,
  getScheduledNotifications,
  clearAllLocalNotifications,
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

  console.log('\n2. Scheduling Aftercare Notification...');
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
