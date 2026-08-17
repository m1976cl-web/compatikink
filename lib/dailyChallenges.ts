import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { DailyChallenge, getChallengeForDate } from '@/data/dailyChallenges';
import { recordDailyActivity } from '@/lib/streaks';
import { addXpToPartnerLink, getPartnerLinks } from '@/lib/partnerJournal';
import { triggerSuccessHaptic } from '@/lib/haptics';

const COMPLETED_CHALLENGES_KEY = 'user_daily_challenges_completed_v1';

export interface CompletedChallengeRecord {
  challengeId: string;
  completedAt: string; // ISO date-time
  dateKey: string;     // 'YYYY-MM-DD'
  xpEarned: number;
}

function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getCompletedDailyChallenges(): Promise<CompletedChallengeRecord[]> {
  return readJsonStorage<CompletedChallengeRecord[]>(COMPLETED_CHALLENGES_KEY, []);
}

export async function isTodayChallengeCompleted(now: Date = new Date()): Promise<boolean> {
  const dateKey = getLocalDateKey(now);
  const completed = await getCompletedDailyChallenges();
  return completed.some((c) => c.dateKey === dateKey);
}

export interface CompleteChallengeResult {
  challenge: DailyChallenge;
  xpEarned: number;
  totalCompletedCount: number;
  partnerName?: string;
}

/**
 * Marks today's daily challenge as completed, awards XP, triggers haptics,
 * and maintains the user's daily streak.
 */
export async function completeDailyChallenge(
  challenge: DailyChallenge,
  now: Date = new Date()
): Promise<CompleteChallengeResult> {
  const dateKey = getLocalDateKey(now);
  const currentRecords = await getCompletedDailyChallenges();

  const alreadyDone = currentRecords.find((c) => c.dateKey === dateKey);
  if (alreadyDone) {
    return {
      challenge,
      xpEarned: alreadyDone.xpEarned,
      totalCompletedCount: currentRecords.length,
    };
  }

  const newRecord: CompletedChallengeRecord = {
    challengeId: challenge.id,
    completedAt: now.toISOString(),
    dateKey,
    xpEarned: challenge.xpReward,
  };

  const updatedRecords = [newRecord, ...currentRecords];
  await writeJsonStorage(COMPLETED_CHALLENGES_KEY, updatedRecords);

  // 1. Maintain Streak
  await recordDailyActivity(now);

  // 2. Award XP to partner if partner link exists
  let partnerName: string | undefined;
  try {
    const links = await getPartnerLinks();
    if (links.length > 0) {
      partnerName = links[0].partnerName;
      await addXpToPartnerLink(links[0].id, challenge.xpReward);
    }
  } catch {}

  // 3. Trigger Success Haptic
  triggerSuccessHaptic();

  return {
    challenge,
    xpEarned: challenge.xpReward,
    totalCompletedCount: updatedRecords.length,
    partnerName,
  };
}

export { getChallengeForDate } from '@/data/dailyChallenges';
