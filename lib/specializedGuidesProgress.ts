import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { unlockBadge, addXP } from '@/lib/badgesXP';

const STORAGE_KEY = 'compatikink_specialized_guides_progress';

export interface GuidesProgress {
  completedChecklists: string[];
  completedGuides: string[];
}

export async function getGuidesProgress(): Promise<GuidesProgress> {
  const data = await readJsonStorage<GuidesProgress>(STORAGE_KEY, {
    completedChecklists: [],
    completedGuides: [],
  });
  return data || { completedChecklists: [], completedGuides: [] };
}

export async function toggleChecklistItem(id: string): Promise<GuidesProgress> {
  const data = await getGuidesProgress();
  if (data.completedChecklists.includes(id)) {
    data.completedChecklists = data.completedChecklists.filter(i => i !== id);
  } else {
    data.completedChecklists.push(id);
  }
  await writeJsonStorage(STORAGE_KEY, data);
  return data;
}

export async function markGuideCompleted(guideId: string, badgeId: string): Promise<GuidesProgress> {
  const data = await getGuidesProgress();
  if (!data.completedGuides.includes(guideId)) {
    data.completedGuides.push(guideId);
    await writeJsonStorage(STORAGE_KEY, data);
    await addXP(40, `Guía completada: ${guideId}`);
    if (badgeId) {
      await unlockBadge(badgeId);
    }
  }
  return data;
}
