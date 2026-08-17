import { create } from 'zustand';
import {
  DsTask,
  DsHabit,
  DsReward,
  DsRewardRedemption,
  DsPointsLedger,
  DsRoleType,
  DsTaskStatus,
  DsTaskCategory,
  DsRecurrence,
} from '@/types';
import {
  getDsTasks,
  saveDsTask,
  updateDsTaskStatus,
  deleteDsTask,
  getDsHabits,
  saveDsHabit,
  completeDsHabit,
  deleteDsHabit,
  getDsRewards,
  saveDsReward,
  deleteDsReward,
  getDsRedemptions,
  redeemDsReward,
  fulfillDsRedemption,
  getDsPointsLedger,
  addLedgerEntry,
} from '@/lib/storage/dsStorage';

export interface DsTaskState {
  tasks: DsTask[];
  habits: DsHabit[];
  rewards: DsReward[];
  redemptions: DsRewardRedemption[];
  ledger: DsPointsLedger;
  activeRole: DsRoleType;
  isLoading: boolean;
  error: string | null;

  loadAll: () => Promise<void>;
  setActiveRole: (role: DsRoleType) => void;
  addTask: (taskInput: {
    title: string;
    description?: string;
    category: DsTaskCategory;
    assignerRole: DsRoleType;
    assignedToRole: DsRoleType;
    pointsValue: number;
    dueDate?: string;
    recurrence: DsRecurrence;
  }) => Promise<DsTask>;
  updateTaskStatus: (
    taskId: string,
    status: DsTaskStatus,
    proofNote?: string,
    rejectedReason?: string
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addHabit: (habitInput: {
    title: string;
    description?: string;
    category: DsTaskCategory;
    frequency: 'daily' | 'weekly';
    targetStreak: number;
    pointsPerCompletion: number;
    streakMultiplierEnabled: boolean;
  }) => Promise<DsHabit>;
  completeHabit: (habitId: string) => Promise<number>;
  deleteHabit: (habitId: string) => Promise<void>;
  addReward: (rewardInput: {
    title: string;
    description?: string;
    costPoints: number;
    category?: string;
    availableCount?: number;
  }) => Promise<DsReward>;
  deleteReward: (rewardId: string) => Promise<void>;
  redeemReward: (rewardId: string, nickname: string) => Promise<void>;
  fulfillRedemption: (redemptionId: string) => Promise<void>;
  adjustPoints: (amount: number, reason: string, type?: 'bonus' | 'penalty') => Promise<void>;
  reset: () => void;
}

export const useDsTaskStore = create<DsTaskState>((set, get) => ({
  tasks: [],
  habits: [],
  rewards: [],
  redemptions: [],
  ledger: { currentBalance: 0, totalEarned: 0, totalSpent: 0, history: [] },
  activeRole: 'sub',
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [tasks, habits, rewards, redemptions, ledger] = await Promise.all([
        getDsTasks(),
        getDsHabits(),
        getDsRewards(),
        getDsRedemptions(),
        getDsPointsLedger(),
      ]);
      set({ tasks, habits, rewards, redemptions, ledger, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar módulo D/s';
      set({ isLoading: false, error: msg });
    }
  },

  setActiveRole: (role: DsRoleType) => set({ activeRole: role }),

  addTask: async (taskInput) => {
    const newTask: DsTask = {
      id: `dst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...taskInput,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTasks = await saveDsTask(newTask);
    set({ tasks: updatedTasks });
    return newTask;
  },

  updateTaskStatus: async (taskId, status, proofNote, rejectedReason) => {
    const { tasks: updatedTasks } = await updateDsTaskStatus(taskId, status, proofNote, rejectedReason);
    const ledger = await getDsPointsLedger();
    set({ tasks: updatedTasks, ledger });
  },

  deleteTask: async (taskId) => {
    const updatedTasks = await deleteDsTask(taskId);
    set({ tasks: updatedTasks });
  },

  addHabit: async (habitInput) => {
    const newHabit: DsHabit = {
      id: `dsh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...habitInput,
      currentStreak: 0,
      longestStreak: 0,
      historyDates: [],
      createdAt: new Date().toISOString(),
    };
    const updatedHabits = await saveDsHabit(newHabit);
    set({ habits: updatedHabits });
    return newHabit;
  },

  completeHabit: async (habitId) => {
    const { habits: updatedHabits, pointsEarned } = await completeDsHabit(habitId);
    const ledger = await getDsPointsLedger();
    set({ habits: updatedHabits, ledger });
    return pointsEarned;
  },

  deleteHabit: async (habitId) => {
    const updatedHabits = await deleteDsHabit(habitId);
    set({ habits: updatedHabits });
  },

  addReward: async (rewardInput) => {
    const newReward: DsReward = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...rewardInput,
      redeemedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updatedRewards = await saveDsReward(newReward);
    set({ rewards: updatedRewards });
    return newReward;
  },

  deleteReward: async (rewardId) => {
    const updatedRewards = await deleteDsReward(rewardId);
    set({ rewards: updatedRewards });
  },

  redeemReward: async (rewardId, nickname) => {
    try {
      const { ledger, redemption } = await redeemDsReward(rewardId, nickname);
      const rewards = await getDsRewards();
      const redemptions = await getDsRedemptions();
      set({ rewards, redemptions, ledger, error: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al canjear';
      set({ error: msg });
      throw err;
    }
  },

  fulfillRedemption: async (redemptionId) => {
    const redemptions = await fulfillDsRedemption(redemptionId);
    set({ redemptions });
  },

  adjustPoints: async (amount, reason, type = 'bonus') => {
    const ledger = await addLedgerEntry(type, amount, reason);
    set({ ledger });
  },

  reset: () =>
    set({
      tasks: [],
      habits: [],
      rewards: [],
      redemptions: [],
      ledger: { currentBalance: 0, totalEarned: 0, totalSpent: 0, history: [] },
      activeRole: 'sub',
      isLoading: false,
      error: null,
    }),
}));
