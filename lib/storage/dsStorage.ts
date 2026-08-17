import {
  DsTask,
  DsHabit,
  DsReward,
  DsRewardRedemption,
  DsPointsLedger,
  DsLedgerEntry,
  DsTaskStatus,
} from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export const DS_TASKS_KEY = 'ds_tasks_list_v1';
export const DS_HABITS_KEY = 'ds_habits_list_v1';
export const DS_REWARDS_KEY = 'ds_rewards_list_v1';
export const DS_REDEMPTIONS_KEY = 'ds_redemptions_v1';
export const DS_LEDGER_KEY = 'ds_points_ledger_v1';

const DEFAULT_LEDGER: DsPointsLedger = {
  currentBalance: 0,
  totalEarned: 0,
  totalSpent: 0,
  history: [],
};

// ─── TASKS ──────────────────────────────────────────────────────────────────

export async function getDsTasks(): Promise<DsTask[]> {
  return readJsonStorage<DsTask[]>(DS_TASKS_KEY, []);
}

export async function saveDsTask(task: DsTask): Promise<DsTask[]> {
  const tasks = await getDsTasks();
  const existingIdx = tasks.findIndex((t) => t.id === task.id);
  if (existingIdx >= 0) {
    tasks[existingIdx] = { ...task, updatedAt: new Date().toISOString() };
  } else {
    tasks.push({ ...task, createdAt: task.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await writeJsonStorage(DS_TASKS_KEY, tasks);
  return tasks;
}

export async function updateDsTaskStatus(
  taskId: string,
  status: DsTaskStatus,
  proofNote?: string,
  rejectedReason?: string
): Promise<{ tasks: DsTask[]; updatedTask: DsTask | null }> {
  const tasks = await getDsTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return { tasks, updatedTask: null };

  const now = new Date().toISOString();
  const task = tasks[idx];

  const previousStatus = task.status;
  task.status = status;
  task.updatedAt = now;
  if (proofNote !== undefined) task.proofNote = proofNote;
  if (status === 'submitted') task.submittedAt = now;
  if (status === 'verified') {
    task.verifiedAt = now;
    // Reward points when verified (only if transition from non-verified state)
    if (task.pointsValue > 0 && previousStatus !== 'verified') {
      await addLedgerEntry('earn', task.pointsValue, `Tarea completada: ${task.title}`, task.id);
    }
  }
  if (status === 'rejected' && rejectedReason) {
    task.rejectedReason = rejectedReason;
  }

  tasks[idx] = task;
  await writeJsonStorage(DS_TASKS_KEY, tasks);
  return { tasks, updatedTask: task };
}

export async function deleteDsTask(taskId: string): Promise<DsTask[]> {
  const tasks = await getDsTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  await writeJsonStorage(DS_TASKS_KEY, filtered);
  return filtered;
}

// ─── HABITS ─────────────────────────────────────────────────────────────────

export async function getDsHabits(): Promise<DsHabit[]> {
  return readJsonStorage<DsHabit[]>(DS_HABITS_KEY, []);
}

export async function saveDsHabit(habit: DsHabit): Promise<DsHabit[]> {
  const habits = await getDsHabits();
  const idx = habits.findIndex((h) => h.id === habit.id);
  if (idx >= 0) {
    habits[idx] = habit;
  } else {
    habits.push(habit);
  }
  await writeJsonStorage(DS_HABITS_KEY, habits);
  return habits;
}

export async function completeDsHabit(
  habitId: string
): Promise<{ habits: DsHabit[]; habit: DsHabit | null; pointsEarned: number }> {
  const habits = await getDsHabits();
  const idx = habits.findIndex((h) => h.id === habitId);
  if (idx < 0) return { habits, habit: null, pointsEarned: 0 };

  const habit = habits[idx];
  const today = new Date().toISOString().split('T')[0];

  // Already completed today?
  if (habit.lastCompletedAt === today) {
    return { habits, habit, pointsEarned: 0 };
  }

  // Calculate streak
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (habit.lastCompletedAt === yesterday) {
    habit.currentStreak += 1;
  } else {
    habit.currentStreak = 1;
  }

  if (habit.currentStreak > habit.longestStreak) {
    habit.longestStreak = habit.currentStreak;
  }

  habit.lastCompletedAt = today;
  if (!habit.historyDates.includes(today)) {
    habit.historyDates.push(today);
  }

  // Streak multiplier: e.g., streak >= 7 => 1.5x points, streak >= 14 => 2x
  let multiplier = 1;
  if (habit.streakMultiplierEnabled) {
    if (habit.currentStreak >= 14) multiplier = 2.0;
    else if (habit.currentStreak >= 7) multiplier = 1.5;
  }

  const pointsEarned = Math.round(habit.pointsPerCompletion * multiplier);
  if (pointsEarned > 0) {
    await addLedgerEntry('earn', pointsEarned, `Hábito completado: ${habit.title} (Racha: ${habit.currentStreak} días)`, habit.id);
  }

  habits[idx] = habit;
  await writeJsonStorage(DS_HABITS_KEY, habits);
  return { habits, habit, pointsEarned };
}

export async function deleteDsHabit(habitId: string): Promise<DsHabit[]> {
  const habits = await getDsHabits();
  const filtered = habits.filter((h) => h.id !== habitId);
  await writeJsonStorage(DS_HABITS_KEY, filtered);
  return filtered;
}

// ─── REWARDS & REWARD SHOP ──────────────────────────────────────────────────

export async function getDsRewards(): Promise<DsReward[]> {
  return readJsonStorage<DsReward[]>(DS_REWARDS_KEY, []);
}

export async function saveDsReward(reward: DsReward): Promise<DsReward[]> {
  const rewards = await getDsRewards();
  const idx = rewards.findIndex((r) => r.id === reward.id);
  if (idx >= 0) {
    rewards[idx] = reward;
  } else {
    rewards.push(reward);
  }
  await writeJsonStorage(DS_REWARDS_KEY, rewards);
  return rewards;
}

export async function deleteDsReward(rewardId: string): Promise<DsReward[]> {
  const rewards = await getDsRewards();
  const filtered = rewards.filter((r) => r.id !== rewardId);
  await writeJsonStorage(DS_REWARDS_KEY, filtered);
  return filtered;
}

export async function getDsRedemptions(): Promise<DsRewardRedemption[]> {
  return readJsonStorage<DsRewardRedemption[]>(DS_REDEMPTIONS_KEY, []);
}

export async function redeemDsReward(
  rewardId: string,
  nickname: string
): Promise<{ redemption: DsRewardRedemption; ledger: DsPointsLedger }> {
  const rewards = await getDsRewards();
  const reward = rewards.find((r) => r.id === rewardId);
  if (!reward) throw new Error('Recompensa no encontrada.');

  const ledger = await getDsPointsLedger();
  if (ledger.currentBalance < reward.costPoints) {
    throw new Error(`Puntos insuficientes (${ledger.currentBalance} de ${reward.costPoints} necesarios).`);
  }

  // Deduct points
  const updatedLedger = await addLedgerEntry('spend', reward.costPoints, `Recompensa canjeada: ${reward.title}`, reward.id);

  // Update reward redemptions count
  reward.redeemedCount += 1;
  await saveDsReward(reward);

  // Create redemption record
  const redemptions = await getDsRedemptions();
  const redemption: DsRewardRedemption = {
    id: `red_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    rewardId: reward.id,
    rewardTitle: reward.title,
    costPoints: reward.costPoints,
    redeemedBy: nickname,
    status: 'pending',
    redeemedAt: new Date().toISOString(),
  };
  redemptions.unshift(redemption);
  await writeJsonStorage(DS_REDEMPTIONS_KEY, redemptions);

  return { redemption, ledger: updatedLedger };
}

export async function fulfillDsRedemption(redemptionId: string): Promise<DsRewardRedemption[]> {
  const redemptions = await getDsRedemptions();
  const idx = redemptions.findIndex((r) => r.id === redemptionId);
  if (idx >= 0) {
    redemptions[idx].status = 'fulfilled';
    redemptions[idx].fulfilledAt = new Date().toISOString();
    await writeJsonStorage(DS_REDEMPTIONS_KEY, redemptions);
  }
  return redemptions;
}

// ─── POINTS LEDGER ──────────────────────────────────────────────────────────

export async function getDsPointsLedger(): Promise<DsPointsLedger> {
  return readJsonStorage<DsPointsLedger>(DS_LEDGER_KEY, DEFAULT_LEDGER);
}

export async function addLedgerEntry(
  type: 'earn' | 'spend' | 'bonus' | 'penalty',
  amount: number,
  reason: string,
  sourceId?: string
): Promise<DsPointsLedger> {
  const ledger = await getDsPointsLedger();
  const entry: DsLedgerEntry = {
    id: `led_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    amount,
    reason,
    sourceId,
    timestamp: new Date().toISOString(),
  };

  let newBalance = ledger.currentBalance;
  let newEarned = ledger.totalEarned;
  let newSpent = ledger.totalSpent;

  if (type === 'earn' || type === 'bonus') {
    newBalance += amount;
    newEarned += amount;
  } else if (type === 'spend') {
    newBalance -= amount;
    newSpent += amount;
  } else if (type === 'penalty') {
    newBalance = Math.max(0, newBalance - amount);
  }

  const updatedLedger: DsPointsLedger = {
    currentBalance: newBalance,
    totalEarned: newEarned,
    totalSpent: newSpent,
    history: [entry, ...ledger.history],
  };

  await writeJsonStorage(DS_LEDGER_KEY, updatedLedger);
  return updatedLedger;
}
