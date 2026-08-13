import {
  ActivityResponse,
  ActivityCategory,
  DifficultyLevel,
} from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export const QUESTIONNAIRE_DRAFT_KEY = 'questionnaire_draft_v1';

export interface QuestionnaireDraft {
  nickname?: string;
  pronouns?: string;
  experienceLevel?: string;
  userNotes?: string;
  guestNickname?: string;
  guestNotes?: string;
  enabledCategories?: ActivityCategory[];
  difficultyFilter?: DifficultyLevel | 'all';
  mode?: 'full' | 'express';
  currentIndex?: number;
  responses?: ActivityResponse[];
  updatedAt: string;
}

export async function loadQuestionnaireDraft(): Promise<QuestionnaireDraft | null> {
  try {
    const draft = await readJsonStorage<QuestionnaireDraft | null>(QUESTIONNAIRE_DRAFT_KEY, null);
    if (!draft || !draft.updatedAt) return null;
    return draft;
  } catch {
    return null;
  }
}

export async function saveQuestionnaireDraft(draft: Omit<QuestionnaireDraft, 'updatedAt'>): Promise<void> {
  await writeJsonStorage(QUESTIONNAIRE_DRAFT_KEY, {
    ...draft,
    updatedAt: new Date().toISOString(),
  } satisfies QuestionnaireDraft);
}

export async function clearQuestionnaireDraft(): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.removeItem(QUESTIONNAIRE_DRAFT_KEY);
}
