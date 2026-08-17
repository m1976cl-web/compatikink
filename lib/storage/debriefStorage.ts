import { SceneAgreement } from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { loadLocalSessions } from '@/lib/storage/sessionStorage';

export interface SceneDebrief {
  id: string;
  sessionId: string;
  activityId: string;
  activityName: string;
  ratingStars: number;
  safewordsRespected: boolean;
  aftercareRating: number;
  notes?: string;
  emotions?: string[];
  wouldRepeat?: 'yes' | 'maybe' | 'no';
  createdAt: string;
}

const SCENE_DEBRIEFS_PREFIX = 'scene_debriefs_';
const SCENE_AGREEMENTS_PREFIX = 'scene_agreements_';

export async function saveSceneDebrief(debrief: SceneDebrief): Promise<void> {
  const existing = await getSceneDebriefs(debrief.sessionId);
  const updated = existing.filter((d) => d.id !== debrief.id);
  updated.push(debrief);
  await writeJsonStorage(`${SCENE_DEBRIEFS_PREFIX}${debrief.sessionId}`, updated);
}

export async function getSceneDebriefs(sessionId: string): Promise<SceneDebrief[]> {
  return readJsonStorage<SceneDebrief[]>(`${SCENE_DEBRIEFS_PREFIX}${sessionId}`, []);
}

export async function saveSceneAgreement(agreement: SceneAgreement): Promise<void> {
  const existing = await getSceneAgreements(agreement.sessionId);
  const updated = existing.filter((a) => a.activityId !== agreement.activityId);
  updated.push(agreement);
  await writeJsonStorage(`${SCENE_AGREEMENTS_PREFIX}${agreement.sessionId}`, updated);
}

export async function getSceneAgreements(sessionId: string): Promise<SceneAgreement[]> {
  return readJsonStorage<SceneAgreement[]>(`${SCENE_AGREEMENTS_PREFIX}${sessionId}`, []);
}

export async function getSceneAgreementByActivity(
  sessionId: string,
  activityId: string
): Promise<SceneAgreement | null> {
  const list = await getSceneAgreements(sessionId);
  return list.find((a) => a.activityId === activityId) ?? null;
}

export async function getAllSceneAgreements(): Promise<
  { sessionId: string; agreements: SceneAgreement[] }[]
> {
  const sessions = await loadLocalSessions();
  const result: { sessionId: string; agreements: SceneAgreement[] }[] = [];
  for (const session of Object.values(sessions)) {
    const agreements = await getSceneAgreements(session.id);
    if (agreements.length > 0) {
      result.push({ sessionId: session.id, agreements });
    }
  }
  return result;
}
