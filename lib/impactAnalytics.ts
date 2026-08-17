import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export type ImpactFeedbackValue = 'helpful' | 'neutral' | 'unhelpful';

export interface ImpactFeedbackEvent {
  id: string;
  sessionId: string;
  feedback: ImpactFeedbackValue;
  timestamp: string;
}

export interface CoupleRetentionMetrics {
  totalReportsGenerated: number;
  totalFeedbackCount: number;
  helpfulPercentage: number;
  retention30Days: boolean;
}

const IMPACT_FEEDBACK_STORAGE_KEY = 'impact_feedback_events_sealed_v1';

export async function recordPostReportFeedback(
  sessionId: string,
  feedback: ImpactFeedbackValue
): Promise<ImpactFeedbackEvent> {
  const events = await readJsonStorage<ImpactFeedbackEvent[]>(IMPACT_FEEDBACK_STORAGE_KEY, []);

  const event: ImpactFeedbackEvent = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sessionId,
    feedback,
    timestamp: new Date().toISOString(),
  };

  events.push(event);
  await writeJsonStorage(IMPACT_FEEDBACK_STORAGE_KEY, events);
  return event;
}

export async function getCoupleImpactMetrics(): Promise<CoupleRetentionMetrics> {
  const events = await readJsonStorage<ImpactFeedbackEvent[]>(IMPACT_FEEDBACK_STORAGE_KEY, []);

  const totalFeedbackCount = events.length;
  const helpfulCount = events.filter((e) => e.feedback === 'helpful').length;
  const helpfulPercentage = totalFeedbackCount > 0 ? Math.round((helpfulCount / totalFeedbackCount) * 100) : 100;

  // Check 30-day retention: events spanning > 30 days apart
  let retention30Days = false;
  if (events.length >= 2) {
    const oldest = new Date(events[0].timestamp).getTime();
    const newest = new Date(events[events.length - 1].timestamp).getTime();
    retention30Days = newest - oldest >= 30 * 86400000;
  }

  return {
    totalReportsGenerated: events.length,
    totalFeedbackCount,
    helpfulPercentage,
    retention30Days,
  };
}
