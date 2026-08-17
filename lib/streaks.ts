import AsyncStorage from '@react-native-async-storage/async-storage';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { triggerSuccessHaptic } from '@/lib/haptics';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date 'YYYY-MM-DD'
  totalDaysActive: number;
  streakHistory: string[]; // List of YYYY-MM-DD dates
  unlockedMilestones: number[]; // e.g. [3, 7, 14, 30, 60, 100]
}

const STREAK_STORAGE_KEY = 'compatikink_user_streak_v1';
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString(today: Date = new Date()): string {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

const INITIAL_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalDaysActive: 0,
  streakHistory: [],
  unlockedMilestones: [],
};

export async function getStreakData(): Promise<StreakData> {
  return readJsonStorage<StreakData>(STREAK_STORAGE_KEY, INITIAL_STREAK_DATA);
}

export interface RecordActivityResult {
  data: StreakData;
  isNewDay: boolean;
  newMilestoneReached?: number;
}

/**
 * Records daily app activity and updates streak count accordingly.
 */
export async function recordDailyActivity(now: Date = new Date()): Promise<RecordActivityResult> {
  const current = await getStreakData();
  const todayStr = getLocalDateString(now);
  const yesterdayStr = getYesterdayDateString(now);

  if (current.lastActiveDate === todayStr) {
    // Already recorded today
    return { data: current, isNewDay: false };
  }

  let newCurrentStreak = 1;
  if (current.lastActiveDate === yesterdayStr) {
    // Consecutive day streak continues!
    newCurrentStreak = current.currentStreak + 1;
  } else if (!current.lastActiveDate) {
    // First time
    newCurrentStreak = 1;
  } else {
    // Missed a day or more: streak resets to 1
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(current.longestStreak, newCurrentStreak);
  const newTotalDays = current.totalDaysActive + 1;

  // Keep last 60 active days in history
  const newHistory = [todayStr, ...current.streakHistory.filter((d) => d !== todayStr)].slice(0, 60);

  // Check newly reached milestones
  const unlocked = [...(current.unlockedMilestones || [])];
  let newMilestoneReached: number | undefined;

  for (const milestone of STREAK_MILESTONES) {
    if (newCurrentStreak >= milestone && !unlocked.includes(milestone)) {
      unlocked.push(milestone);
      newMilestoneReached = milestone;
    }
  }

  const updatedData: StreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActiveDate: todayStr,
    totalDaysActive: newTotalDays,
    streakHistory: newHistory,
    unlockedMilestones: unlocked,
  };

  await writeJsonStorage(STREAK_STORAGE_KEY, updatedData);

  if (newMilestoneReached) {
    triggerSuccessHaptic();
  }

  return {
    data: updatedData,
    isNewDay: true,
    newMilestoneReached,
  };
}

/**
 * Returns a descriptive flame emoji based on streak intensity.
 */
export function getStreakFlameEmoji(streak: number): string {
  if (streak <= 0) return '🌱';
  if (streak < 3) return '🔥';
  if (streak < 7) return '⚡🔥';
  if (streak < 14) return '🌟🔥';
  if (streak < 30) return '💜🔥';
  if (streak < 100) return '👑🔥';
  return '✨🔥👑';
}

/**
 * Returns next milestone and remaining days.
 */
export function getNextStreakMilestone(currentStreak: number): {
  nextMilestone: number;
  daysRemaining: number;
  progressRatio: number;
} {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak < milestone) {
      const prevMilestone = STREAK_MILESTONES[STREAK_MILESTONES.indexOf(milestone) - 1] || 0;
      const range = milestone - prevMilestone;
      const progressInRange = currentStreak - prevMilestone;
      return {
        nextMilestone: milestone,
        daysRemaining: milestone - currentStreak,
        progressRatio: Math.min(1, Math.max(0, progressInRange / range)),
      };
    }
  }
  // If surpassed 100
  return {
    nextMilestone: 100,
    daysRemaining: 0,
    progressRatio: 1,
  };
}

/**
 * Returns boolean status for the last 7 days (including today) to render mini-dots.
 */
export function getLast7DaysActivity(streakData: StreakData, now: Date = new Date()): { dayName: string; active: boolean; isToday: boolean }[] {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const active = streakData.streakHistory.includes(dateStr);
    const isToday = i === 0;
    result.push({
      dayName: dayNames[d.getDay()],
      active,
      isToday,
    });
  }

  return result;
}
