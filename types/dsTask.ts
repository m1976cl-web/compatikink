export type DsRoleType = 'dom' | 'sub' | 'self';
export type DsTaskCategory = 'service' | 'wellness' | 'obedience' | 'protocol' | 'intimacy' | 'custom';
export type DsTaskStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type DsRecurrence = 'once' | 'daily' | 'weekly';

export interface DsTask {
  id: string;
  title: string;
  description?: string;
  category: DsTaskCategory;
  assignerRole: DsRoleType;
  assignedToRole: DsRoleType;
  pointsValue: number;
  dueDate?: string; // ISO string
  recurrence: DsRecurrence;
  status: DsTaskStatus;
  proofNote?: string;
  proofMediaCipher?: string; // ck1: encrypted blob
  submittedAt?: string;
  verifiedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DsHabit {
  id: string;
  title: string;
  description?: string;
  category: DsTaskCategory;
  frequency: 'daily' | 'weekly';
  targetStreak: number;
  currentStreak: number;
  longestStreak: number;
  pointsPerCompletion: number;
  streakMultiplierEnabled: boolean;
  lastCompletedAt?: string; // ISO date YYYY-MM-DD
  historyDates: string[]; // List of completed ISO dates (YYYY-MM-DD)
  createdAt: string;
}

export interface DsReward {
  id: string;
  title: string;
  description?: string;
  costPoints: number;
  category?: string;
  availableCount?: number; // Undefined = unlimited
  redeemedCount: number;
  createdAt: string;
}

export interface DsRewardRedemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  costPoints: number;
  redeemedBy: string; // User nickname
  status: 'pending' | 'fulfilled' | 'cancelled';
  redeemedAt: string;
  fulfilledAt?: string;
}

export interface DsLedgerEntry {
  id: string;
  type: 'earn' | 'spend' | 'bonus' | 'penalty';
  amount: number;
  sourceId?: string; // taskId or rewardId
  reason: string;
  timestamp: string; // ISO
}

export interface DsPointsLedger {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  history: DsLedgerEntry[];
}
