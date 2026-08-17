/**
 * D/s Tasks & Habits ZK Cryptographic Vault Test Suite
 *
 * Verifies local AES-GCM-256 encryption, serialization/deserialization,
 * points ledger math, habit streak logic, decoy mode protection, and panic wipe purge.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VaultSession,
  setupVaultForNewProfile,
  setupCanaryPin,
  unlockVaultForProfile,
  isSealedBlob,
  readStorageValue,
  writeStorageValue,
  getStaticDecoyValueForKey,
} from '../../lib/cryptoVault';
import {
  saveDsTask,
  getDsTasks,
  updateDsTaskStatus,
  deleteDsTask,
  saveDsHabit,
  getDsHabits,
  completeDsHabit,
  saveDsReward,
  getDsRewards,
  redeemDsReward,
  fulfillDsRedemption,
  getDsRedemptions,
  getDsPointsLedger,
  addLedgerEntry,
  DS_TASKS_KEY,
  DS_HABITS_KEY,
  DS_REWARDS_KEY,
  DS_REDEMPTIONS_KEY,
  DS_LEDGER_KEY,
} from '../../lib/storage/dsStorage';
import { panicWipeData } from '../../lib/storage/backupStorage';
import { DsTask, DsHabit, DsReward } from '../../types';

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

async function runDsTasksTests() {
  console.log('\n--- Running D/s Tasks & Habits ZK Vault Tests ---');

  // Clear memory
  await AsyncStorage.clear();
  VaultSession.lock();

  // 1. Vault Initialization & Encryption Test
  console.log('\n1. ZK AES-256 Storage & Sealing');
  const masterMeta = await setupVaultForNewProfile('ds_tester', '987654');
  assert(VaultSession.isUnlocked(), 'Vault is unlocked after setup');

  const newTask: DsTask = {
    id: 'dst_test_1',
    title: 'Reporte Nocturno de Sumisión',
    description: 'Enviar reporte diario a las 22:00',
    category: 'obedience',
    assignerRole: 'dom',
    assignedToRole: 'sub',
    pointsValue: 25,
    recurrence: 'daily',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveDsTask(newTask);

  const rawStorageValue = await AsyncStorage.getItem(DS_TASKS_KEY);
  assert(rawStorageValue !== null, 'Raw storage contains entry for ds_tasks_list_v1');
  assert(isSealedBlob(rawStorageValue || ''), 'ds_tasks_list_v1 is sealed with ck1: prefix');

  const loadedTasks = await getDsTasks();
  assert(loadedTasks.length === 1, 'Decrypted tasks list length is 1');
  assert(loadedTasks[0].title === newTask.title, 'Decrypted task title matches original');
  assert(loadedTasks[0].pointsValue === 25, 'Decrypted task pointsValue matches');

  // 2. Task Lifecycle & Points Ledger Math
  console.log('\n2. Task Lifecycle & Points Ledger');
  let ledger = await getDsPointsLedger();
  assert(ledger.currentBalance === 0, 'Initial points ledger balance is 0');

  // Submit proof
  await updateDsTaskStatus('dst_test_1', 'submitted', 'Cumplido a tiempo');
  let tasksAfterSubmit = await getDsTasks();
  assert(tasksAfterSubmit[0].status === 'submitted', 'Task status changed to submitted');
  assert(tasksAfterSubmit[0].proofNote === 'Cumplido a tiempo', 'Proof note stored correctly');

  // Verify task (Dominant action) -> earns points
  await updateDsTaskStatus('dst_test_1', 'verified');
  let tasksAfterVerify = await getDsTasks();
  assert(tasksAfterVerify[0].status === 'verified', 'Task status changed to verified');

  ledger = await getDsPointsLedger();
  assert(ledger.currentBalance === 25, 'Points ledger balance increased to 25');
  assert(ledger.totalEarned === 25, 'Points totalEarned is 25');
  assert(ledger.history.length === 1, 'Ledger history has 1 entry');

  // 3. Habit Tracker & Streak Logic
  console.log('\n3. Habit Tracker & Streak Multipliers');
  const newHabit: DsHabit = {
    id: 'dsh_test_1',
    title: 'Hidratación 2L',
    category: 'wellness',
    frequency: 'daily',
    targetStreak: 7,
    currentStreak: 0,
    longestStreak: 0,
    pointsPerCompletion: 10,
    streakMultiplierEnabled: true,
    historyDates: [],
    createdAt: new Date().toISOString(),
  };

  await saveDsHabit(newHabit);
  const rawHabitStorage = await AsyncStorage.getItem(DS_HABITS_KEY);
  assert(isSealedBlob(rawHabitStorage || ''), 'ds_habits_list_v1 is sealed with ck1:');

  const { pointsEarned, habit } = await completeDsHabit('dsh_test_1');
  assert(pointsEarned === 10, 'First habit completion earns 10 points');
  assert(habit !== null && habit.currentStreak === 1, 'Habit streak incremented to 1');

  ledger = await getDsPointsLedger();
  assert(ledger.currentBalance === 35, 'Ledger balance updated to 35 (25 + 10)');

  // Duplicate completion today
  const dupResult = await completeDsHabit('dsh_test_1');
  assert(dupResult.pointsEarned === 0, 'Duplicate completion today earns 0 additional points');

  // 4. Reward Shop & Redemption
  console.log('\n4. Reward Shop & Redemption');
  const newReward: DsReward = {
    id: 'dsr_test_1',
    title: 'Masaje de Espalda 20 min',
    description: 'Con aceites esenciales',
    costPoints: 30,
    redeemedCount: 0,
    createdAt: new Date().toISOString(),
  };

  await saveDsReward(newReward);
  const rawRewardStorage = await AsyncStorage.getItem(DS_REWARDS_KEY);
  assert(isSealedBlob(rawRewardStorage || ''), 'ds_rewards_list_v1 is sealed with ck1:');

  // Redeem with balance 35 (cost 30)
  const { redemption, ledger: ledgerAfterRedeem } = await redeemDsReward('dsr_test_1', 'ds_tester');
  assert(redemption.rewardTitle === 'Masaje de Espalda 20 min', 'Redemption item title matches');
  assert(redemption.status === 'pending', 'Redemption status is pending');
  assert(ledgerAfterRedeem.currentBalance === 5, 'Ledger balance decreased to 5 (35 - 30)');
  assert(ledgerAfterRedeem.totalSpent === 30, 'Total spent recorded as 30');

  // Insufficient points attempt
  let threwError = false;
  try {
    await redeemDsReward('dsr_test_1', 'ds_tester');
  } catch (err: any) {
    threwError = true;
    assert(err.message.includes('Puntos insuficientes'), 'Insufficient points error thrown');
  }
  assert(threwError, 'Attempting to redeem without enough points fails');

  // Fulfill redemption
  await fulfillDsRedemption(redemption.id);
  const redemptions = await getDsRedemptions();
  assert(redemptions[0].status === 'fulfilled', 'Redemption status updated to fulfilled');

  // 5. Decoy Mode Protection
  console.log('\n5. Decoy Mode Isolation');
  const canaryMeta = await setupCanaryPin('987654', '111111', 'decoy');
  const profileWithCanary = { nickname: 'ds_tester', vaultMeta: masterMeta, duressMeta: canaryMeta };

  VaultSession.lock();
  const unlockRes = await unlockVaultForProfile('ds_tester', '111111', profileWithCanary);
  assert(unlockRes.isDuress === true, 'Canary PIN unlocked duress mode');
  assert(VaultSession.isDecoyMode(), 'Vault is in Decoy Mode');

  const decoyTasks = await getDsTasks();
  assert(Array.isArray(decoyTasks) && decoyTasks.length === 0, 'Decoy mode returns empty array for tasks');

  const decoyLedger = await getDsPointsLedger();
  assert(decoyLedger.currentBalance === 0, 'Decoy mode returns 0 balance for ledger');

  // Attempt write in decoy mode -> dropped
  await saveDsTask({ ...newTask, id: 'decoy_fake_task' });

  VaultSession.lock();
  await unlockVaultForProfile('ds_tester', '987654', profileWithCanary); // Re-open real session with Master PIN
  const realTasksAfterDecoyWrite = await getDsTasks();
  assert(!realTasksAfterDecoyWrite.some((t) => t.id === 'decoy_fake_task'), 'Decoy write was dropped and real data untouched');

  // 6. Panic Wipe Purge
  console.log('\n6. Panic Wipe Purge');
  await panicWipeData();
  assert(!VaultSession.isUnlocked(), 'Vault is locked after panic wipe');

  const wipedTasksKey = await AsyncStorage.getItem(DS_TASKS_KEY);
  const wipedHabitsKey = await AsyncStorage.getItem(DS_HABITS_KEY);
  const wipedRewardsKey = await AsyncStorage.getItem(DS_REWARDS_KEY);
  const wipedRedemptionsKey = await AsyncStorage.getItem(DS_REDEMPTIONS_KEY);
  const wipedLedgerKey = await AsyncStorage.getItem(DS_LEDGER_KEY);

  assert(wipedTasksKey === null, 'ds_tasks_list_v1 purged after panic wipe');
  assert(wipedHabitsKey === null, 'ds_habits_list_v1 purged after panic wipe');
  assert(wipedRewardsKey === null, 'ds_rewards_list_v1 purged after panic wipe');
  assert(wipedRedemptionsKey === null, 'ds_redemptions_v1 purged after panic wipe');
  assert(wipedLedgerKey === null, 'ds_points_ledger_v1 purged after panic wipe');

  console.log(`\nD/s Tasks Test Results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runDsTasksTests().catch((err) => {
  console.error('Unhandled error in D/s tasks test suite:', err);
  process.exit(1);
});
