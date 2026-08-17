/**
 * D/s Tasks & Habits Edge Cases Stress Test Suite (Challenger Verification)
 *
 * Empirical verification of:
 * 1. Reward redemption with insufficient balance and invalid states
 * 2. Habit streak incrementing, reset logic on gap days, multiplier calculations, longestStreak tracking
 * 3. Task completion state transitions, idempotency on re-verification, points calculation
 * 4. Duress wipe & decoy mode isolation for all D/s keys
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VaultSession,
  setupVaultForNewProfile,
  setupCanaryPin,
  unlockVaultForProfile,
  isSealedBlob,
} from '../../lib/cryptoVault';
import {
  saveDsTask,
  getDsTasks,
  updateDsTaskStatus,
  deleteDsTask,
  saveDsHabit,
  getDsHabits,
  completeDsHabit,
  deleteDsHabit,
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
import { useDsTaskStore } from '../../stores/dsTaskStore';
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

async function runEdgeCasesTestSuite() {
  console.log('\n====================================================');
  console.log('  CHALLENGER M2-1 — D/s Tasks & Rewards Edge Cases');
  console.log('====================================================\n');

  await AsyncStorage.clear();
  VaultSession.lock();

  // Initialize active vault profile
  const setupMeta = await setupVaultForNewProfile('challenger_user', '654321');
  assert(VaultSession.isUnlocked(), 'Vault is unlocked with setupVaultForNewProfile');

  // --------------------------------------------------------------------------
  // EDGE CONDITION 1: REWARD REDEMPTION & INSUFFICIENT BALANCE
  // --------------------------------------------------------------------------
  console.log('--- Edge Condition 1: Reward Redemption & Insufficient Balance ---');

  const expensiveReward: DsReward = {
    id: 'reward_exp_1',
    title: 'Viaje Fin de Semana',
    description: 'Escapada privada',
    costPoints: 500,
    redeemedCount: 0,
    createdAt: new Date().toISOString(),
  };
  await saveDsReward(expensiveReward);

  const initialLedger = await getDsPointsLedger();
  assert(initialLedger.currentBalance === 0, 'Initial points balance is 0');

  // Attempt 1: Direct redemption with 0 balance
  let errorCaught = false;
  try {
    await redeemDsReward('reward_exp_1', 'challenger_user');
  } catch (err: any) {
    errorCaught = true;
    assert(err.message.includes('Puntos insuficientes'), 'Correct error message for 0 balance');
  }
  assert(errorCaught, 'redeemDsReward throws error on 0 balance');

  // Verify ledger state unchanged after failed redemption
  const ledgerAfterFailed1 = await getDsPointsLedger();
  assert(ledgerAfterFailed1.currentBalance === 0, 'Balance remains 0 after failed redemption');
  assert(ledgerAfterFailed1.history.length === 0, 'No history entry logged for failed redemption');

  // Add 100 points via ledger entry (still < 500)
  await addLedgerEntry('bonus', 100, 'Bono inicial challenger');
  const ledgerPartial = await getDsPointsLedger();
  assert(ledgerPartial.currentBalance === 100, 'Balance is now 100');

  // Attempt 2: Direct redemption with partial balance (100 < 500)
  errorCaught = false;
  try {
    await redeemDsReward('reward_exp_1', 'challenger_user');
  } catch (err: any) {
    errorCaught = true;
    assert(err.message.includes('100 de 500 necesarios'), 'Error message specifies exact balance gap');
  }
  assert(errorCaught, 'redeemDsReward throws error on partial balance');

  const ledgerAfterFailed2 = await getDsPointsLedger();
  assert(ledgerAfterFailed2.currentBalance === 100, 'Balance preserved at 100 after partial fail');

  // Attempt 3: Test Zustand store state integration on redemption failure
  useDsTaskStore.getState().reset();
  await useDsTaskStore.getState().loadAll();
  assert(useDsTaskStore.getState().ledger.currentBalance === 100, 'Store loaded ledger balance 100');

  let storeErrorCaught = false;
  try {
    await useDsTaskStore.getState().redeemReward('reward_exp_1', 'challenger_user');
  } catch (err) {
    storeErrorCaught = true;
  }
  assert(storeErrorCaught, 'Zustand store re-throws redemption error');
  assert(
    useDsTaskStore.getState().error !== null && useDsTaskStore.getState().error!.includes('Puntos insuficientes'),
    'Zustand store records error in state.error'
  );

  // Attempt 4: Redeem non-existent reward
  let nonExistentCaught = false;
  try {
    await redeemDsReward('non_existent_reward_id', 'challenger_user');
  } catch (err: any) {
    nonExistentCaught = true;
    assert(err.message.includes('Recompensa no encontrada'), 'Error message for non-existent reward');
  }
  assert(nonExistentCaught, 'redeemDsReward throws on non-existent reward ID');

  // Attempt 5: Successful redemption when balance is exact
  const cheapReward: DsReward = {
    id: 'reward_cheap_1',
    title: 'Elección de Película',
    costPoints: 100,
    redeemedCount: 0,
    createdAt: new Date().toISOString(),
  };
  await saveDsReward(cheapReward);

  const { redemption, ledger: exactLedger } = await redeemDsReward('reward_cheap_1', 'challenger_user');
  assert(redemption.status === 'pending', 'Redemption status is pending');
  assert(exactLedger.currentBalance === 0, 'Balance becomes 0 after exact redemption (100 - 100)');
  assert(exactLedger.totalSpent === 100, 'totalSpent is 100');

  // --------------------------------------------------------------------------
  // EDGE CONDITION 2: STREAK INCREMENT, RESET, MULTIPLIERS & LONGEST STREAK
  // --------------------------------------------------------------------------
  console.log('\n--- Edge Condition 2: Streak Increment, Reset & Multipliers ---');

  const testHabit: DsHabit = {
    id: 'habit_streak_test',
    title: 'Lectura Diaria 30m',
    category: 'service',
    frequency: 'daily',
    targetStreak: 14,
    currentStreak: 0,
    longestStreak: 0,
    pointsPerCompletion: 20,
    streakMultiplierEnabled: true,
    historyDates: [],
    createdAt: new Date().toISOString(),
  };
  await saveDsHabit(testHabit);

  // Simulate Day 1 completion
  const res1 = await completeDsHabit('habit_streak_test');
  assert(res1.pointsEarned === 20, 'Day 1 earns standard points (20 * 1.0)');
  assert(res1.habit!.currentStreak === 1, 'Day 1 currentStreak is 1');
  assert(res1.habit!.longestStreak === 1, 'Day 1 longestStreak is 1');

  // Duplicate completion on same day (today)
  const resDup = await completeDsHabit('habit_streak_test');
  assert(resDup.pointsEarned === 0, 'Same-day duplicate completion earns 0 points');
  assert(resDup.habit!.currentStreak === 1, 'Same-day duplicate completion does not increment streak');

  // Simulate Day 2 (consecutive completion: yesterday = lastCompletedAt)
  const todayDate = new Date();
  const yesterdayDate = new Date(Date.now() - 86400000);
  const dayBeforeYesterday = new Date(Date.now() - 86400000 * 2);

  // Manually set lastCompletedAt to yesterday to simulate completing today on Day 2
  const habits = await getDsHabits();
  habits[0].lastCompletedAt = yesterdayDate.toISOString().split('T')[0];
  await saveDsHabit(habits[0]);

  const res2 = await completeDsHabit('habit_streak_test');
  assert(res2.habit!.currentStreak === 2, 'Day 2 currentStreak is 2');
  assert(res2.habit!.longestStreak === 2, 'Day 2 longestStreak updated to 2');

  // Fast forward streak to 6 days to test 7-day multiplier (1.5x)
  habits[0] = (await getDsHabits())[0];
  habits[0].currentStreak = 6;
  habits[0].longestStreak = 6;
  habits[0].lastCompletedAt = yesterdayDate.toISOString().split('T')[0];
  await saveDsHabit(habits[0]);

  const res7 = await completeDsHabit('habit_streak_test');
  assert(res7.habit!.currentStreak === 7, 'Day 7 currentStreak is 7');
  assert(res7.pointsEarned === 30, 'Day 7 earns 1.5x multiplier points: Math.round(20 * 1.5) = 30');

  // Fast forward streak to 13 days to test 14-day multiplier (2.0x)
  habits[0] = (await getDsHabits())[0];
  habits[0].currentStreak = 13;
  habits[0].longestStreak = 13;
  habits[0].lastCompletedAt = yesterdayDate.toISOString().split('T')[0];
  await saveDsHabit(habits[0]);

  const res14 = await completeDsHabit('habit_streak_test');
  assert(res14.habit!.currentStreak === 14, 'Day 14 currentStreak is 14');
  assert(res14.pointsEarned === 40, 'Day 14 earns 2.0x multiplier points: Math.round(20 * 2.0) = 40');
  assert(res14.habit!.longestStreak === 14, 'Day 14 longestStreak is 14');

  // GAP DAY RESET: Set lastCompletedAt to 2 days ago (day before yesterday) -> miss 1 day
  habits[0] = (await getDsHabits())[0];
  habits[0].lastCompletedAt = dayBeforeYesterday.toISOString().split('T')[0];
  await saveDsHabit(habits[0]);

  const resReset = await completeDsHabit('habit_streak_test');
  assert(resReset.habit!.currentStreak === 1, 'Gap day missed -> currentStreak reset to 1');
  assert(resReset.habit!.longestStreak === 14, 'longestStreak preserved at 14 after streak reset');
  assert(resReset.pointsEarned === 20, 'After reset, earns base points (20 * 1.0)');

  // --------------------------------------------------------------------------
  // EDGE CONDITION 3: TASK COMPLETION TOGGLING & POINTS IDEMPOTENCY
  // --------------------------------------------------------------------------
  console.log('\n--- Edge Condition 3: Task Completion Toggling & Idempotency ---');

  const task1: DsTask = {
    id: 'task_toggle_1',
    title: 'Ejercicio Matutino',
    category: 'wellness',
    assignerRole: 'dom',
    assignedToRole: 'sub',
    pointsValue: 50,
    recurrence: 'once',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveDsTask(task1);

  // Transition: pending -> submitted
  const submitRes = await updateDsTaskStatus('task_toggle_1', 'submitted', '30 min de cardio completados');
  assert(submitRes.updatedTask!.status === 'submitted', 'Task status is submitted');
  assert(submitRes.updatedTask!.proofNote === '30 min de cardio completados', 'Proof note stored');

  const ledgerBeforeVerify = await getDsPointsLedger();
  const balanceBeforeVerify = ledgerBeforeVerify.currentBalance;

  // Transition: submitted -> verified (should award 50 points)
  const verifyRes = await updateDsTaskStatus('task_toggle_1', 'verified');
  assert(verifyRes.updatedTask!.status === 'verified', 'Task status is verified');

  const ledgerAfterVerify = await getDsPointsLedger();
  assert(
    ledgerAfterVerify.currentBalance === balanceBeforeVerify + 50,
    `Points increased by 50 (from ${balanceBeforeVerify} to ${ledgerAfterVerify.currentBalance})`
  );

  // Transition: verified -> verified again (re-verification attempt)
  const reVerifyRes = await updateDsTaskStatus('task_toggle_1', 'verified');
  const ledgerAfterReVerify = await getDsPointsLedger();
  assert(
    ledgerAfterReVerify.currentBalance === ledgerAfterVerify.currentBalance,
    'Re-verifying an already verified task does NOT award duplicate points'
  );

  // Transition: pending -> submitted -> rejected with reason
  const task2: DsTask = {
    id: 'task_toggle_2',
    title: 'Tarea Rechazada Test',
    category: 'service',
    assignerRole: 'dom',
    assignedToRole: 'sub',
    pointsValue: 30,
    recurrence: 'once',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveDsTask(task2);
  await updateDsTaskStatus('task_toggle_2', 'submitted', 'Prueba imprecisa');
  const rejectRes = await updateDsTaskStatus('task_toggle_2', 'rejected', undefined, 'Demasiado tarde');

  assert(rejectRes.updatedTask!.status === 'rejected', 'Task status is rejected');
  assert(rejectRes.updatedTask!.rejectedReason === 'Demasiado tarde', 'Rejected reason stored');

  // Deletion test
  const tasksBeforeDelete = await getDsTasks();
  await deleteDsTask('task_toggle_2');
  const tasksAfterDelete = await getDsTasks();
  assert(tasksAfterDelete.length === tasksBeforeDelete.length - 1, 'Task deleted successfully');

  // --------------------------------------------------------------------------
  // EDGE CONDITION 4: DURESS WIPE & DECOY MODE ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- Edge Condition 4: Duress Wipe & Decoy Isolation ---');

  // Verify all keys are encrypted sealed blobs
  const rawTasks = await AsyncStorage.getItem(DS_TASKS_KEY);
  const rawHabits = await AsyncStorage.getItem(DS_HABITS_KEY);
  const rawRewards = await AsyncStorage.getItem(DS_REWARDS_KEY);
  const rawRedemptions = await AsyncStorage.getItem(DS_REDEMPTIONS_KEY);
  const rawLedger = await AsyncStorage.getItem(DS_LEDGER_KEY);

  assert(isSealedBlob(rawTasks || ''), 'ds_tasks_list_v1 is ck1 encrypted blob');
  assert(isSealedBlob(rawHabits || ''), 'ds_habits_list_v1 is ck1 encrypted blob');
  assert(isSealedBlob(rawRewards || ''), 'ds_rewards_list_v1 is ck1 encrypted blob');
  assert(isSealedBlob(rawRedemptions || ''), 'ds_redemptions_v1 is ck1 encrypted blob');
  assert(isSealedBlob(rawLedger || ''), 'ds_points_ledger_v1 is ck1 encrypted blob');

  // Setup Decoy PIN
  const canaryMeta = await setupCanaryPin('654321', '000000', 'decoy');
  const profileWithCanary = {
    nickname: 'challenger_user',
    vaultMeta: setupMeta,
    duressMeta: canaryMeta,
  };

  // Lock and unlock in DECOY mode
  VaultSession.lock();
  const decoyUnlock = await unlockVaultForProfile('challenger_user', '000000', profileWithCanary);
  assert(decoyUnlock.isDuress === true, 'Canary PIN 000000 triggered duress mode');
  assert(VaultSession.isDecoyMode(), 'Vault is in Decoy mode');

  const decoyTasks = await getDsTasks();
  const decoyHabits = await getDsHabits();
  const decoyRewards = await getDsRewards();
  const decoyRedemptions = await getDsRedemptions();
  const decoyLedger = await getDsPointsLedger();

  assert(decoyTasks.length === 0, 'Decoy mode: tasks returns empty array');
  assert(decoyHabits.length === 0, 'Decoy mode: habits returns empty array');
  assert(decoyRewards.length === 0, 'Decoy mode: rewards returns empty array');
  assert(decoyRedemptions.length === 0, 'Decoy mode: redemptions returns empty array');
  assert(decoyLedger.currentBalance === 0, 'Decoy mode: ledger returns 0 balance');

  // Attempt decoy write -> dropped silently
  await saveDsTask({ ...task1, id: 'decoy_injected_task' });

  // Re-lock and unlock with MASTER PIN
  VaultSession.lock();
  await unlockVaultForProfile('challenger_user', '654321', profileWithCanary);
  assert(!VaultSession.isDecoyMode(), 'Master PIN unlocks normal non-decoy vault');

  const realTasks = await getDsTasks();
  assert(
    !realTasks.some((t) => t.id === 'decoy_injected_task'),
    'Decoy write was dropped; real vault data remains pristine'
  );

  // PANIC WIPE EXECUTION
  console.log('\nExecuting Panic Wipe...');
  await panicWipeData();

  assert(!VaultSession.isUnlocked(), 'VaultSession locked immediately upon Panic Wipe');

  const postWipeTasks = await AsyncStorage.getItem(DS_TASKS_KEY);
  const postWipeHabits = await AsyncStorage.getItem(DS_HABITS_KEY);
  const postWipeRewards = await AsyncStorage.getItem(DS_REWARDS_KEY);
  const postWipeRedemptions = await AsyncStorage.getItem(DS_REDEMPTIONS_KEY);
  const postWipeLedger = await AsyncStorage.getItem(DS_LEDGER_KEY);

  assert(postWipeTasks === null, 'ds_tasks_list_v1 completely purged after panic wipe');
  assert(postWipeHabits === null, 'ds_habits_list_v1 completely purged after panic wipe');
  assert(postWipeRewards === null, 'ds_rewards_list_v1 completely purged after panic wipe');
  assert(postWipeRedemptions === null, 'ds_redemptions_v1 completely purged after panic wipe');
  assert(postWipeLedger === null, 'ds_points_ledger_v1 completely purged after panic wipe');

  console.log(`\n====================================================`);
  console.log(`Edge Cases Suite Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runEdgeCasesTestSuite().catch((err) => {
  console.error('Unhandled error in Edge Cases Test Suite:', err);
  process.exit(1);
});
