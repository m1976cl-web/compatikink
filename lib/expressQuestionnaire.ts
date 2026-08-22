/**
 * Express Questionnaire Module
 * Lightweight 20-30 item version with auto-save and resumable drafts.
 *
 * Features:
 * - Top 3 categories filtered for speed
 * - Auto-save every 5 questions
 * - Resume from draft link
 * - Progress bar + estimated time
 * - Analytics tracking
 *
 * @module lib/expressQuestionnaire
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type QuestionnaireMode = 'full' | 'express';

export interface Question {
  id: string;
  category: string;
  categoryLabel: string;
  text: string;
  description?: string;
  type: 'scale' | 'yesno' | 'multiple';
  options?: Array<{ label: string; value: number }>;
  required: boolean;
  order: number;
}

export interface QuestionnaireResponse {
  session_id: string;
  user_id: string;
  draft_id: string;
  mode: QuestionnaireMode;
  responses: Record<string, number | boolean | string>;
  progress: number; // 0-1
  current_question_index: number;
  started_at: number;
  last_saved_at: number;
  estimated_completion_minutes: number;
}

export interface DraftMetadata {
  draft_id: string;
  session_id: string;
  user_id: string;
  mode: QuestionnaireMode;
  progress: number; // 0-1
  created_at: number;
  last_updated_at: number;
  total_questions: number;
  questions_answered: number;
  expires_at: number; // 7 days
}

/**
 * Express mode: Top 3 core categories
 * Covers the most important compatibility axes in ~20 questions
 */
const EXPRESS_CATEGORIES = ['bondage', 'dominance', 'intensity'];

/**
 * All questions (full questionnaire)
 * Filtered by EXPRESS_CATEGORIES for express mode
 */
export const ALL_QUESTIONS: Question[] = [
  // Bondage
  {
    id: 'q1',
    category: 'bondage',
    categoryLabel: 'Bondage & Restraint',
    text: '¿Te interesa atadura y restricción?',
    type: 'scale',
    options: [
      { label: 'Nada', value: 0 },
      { label: 'Poco', value: 1 },
      { label: 'Moderado', value: 2 },
      { label: 'Mucho', value: 3 },
      { label: 'Extremo', value: 4 },
    ],
    required: true,
    order: 1,
  },
  {
    id: 'q2',
    category: 'bondage',
    categoryLabel: 'Bondage & Restraint',
    text: '¿Cuál es tu rol preferido?',
    type: 'multiple',
    options: [
      { label: 'Amarrador/a', value: 1 },
      { label: 'Amarrado/a', value: 2 },
      { label: 'Ambos', value: 3 },
      { label: 'Espectador/a', value: 0 },
    ],
    required: true,
    order: 2,
  },
  {
    id: 'q3',
    category: 'bondage',
    categoryLabel: 'Bondage & Restraint',
    text: '¿Qué materiales te atrae?',
    type: 'multiple',
    options: [
      { label: 'Cuerda', value: 1 },
      { label: 'Esposas', value: 2 },
      { label: 'Cinta adhesiva', value: 3 },
      { label: 'Ninguno', value: 0 },
    ],
    required: false,
    order: 3,
  },
  // Dominance
  {
    id: 'q4',
    category: 'dominance',
    categoryLabel: 'Dominancia & Sumisión',
    text: '¿Te atrae la dinámica Dominante/Sumiso?',
    type: 'scale',
    options: [
      { label: 'Nada', value: 0 },
      { label: 'Poco', value: 1 },
      { label: 'Moderado', value: 2 },
      { label: 'Mucho', value: 3 },
      { label: 'Extremo', value: 4 },
    ],
    required: true,
    order: 4,
  },
  {
    id: 'q5',
    category: 'dominance',
    categoryLabel: 'Dominancia & Sumisión',
    text: '¿Cuál es tu rol natural?',
    type: 'multiple',
    options: [
      { label: 'Dominante', value: 1 },
      { label: 'Sumiso/a', value: 2 },
      { label: 'Switcher (intercambio)', value: 3 },
      { label: 'Ninguno', value: 0 },
    ],
    required: true,
    order: 5,
  },
  {
    id: 'q6',
    category: 'dominance',
    categoryLabel: 'Dominancia & Sumisión',
    text: '¿Cuáles son tus límites duros? (No cruzables)',
    type: 'yesno',
    description: 'Puedes detallarlo en el siguiente paso',
    required: true,
    order: 6,
  },
  // Intensity
  {
    id: 'q7',
    category: 'intensity',
    categoryLabel: 'Intensidad & Dolor',
    text: '¿Cuán intenso prefieres que sea?',
    type: 'scale',
    options: [
      { label: 'Suave', value: 0 },
      { label: 'Moderado', value: 1 },
      { label: 'Intenso', value: 2 },
      { label: 'Muy intenso', value: 3 },
      { label: 'Extremo', value: 4 },
    ],
    required: true,
    order: 7,
  },
  {
    id: 'q8',
    category: 'intensity',
    categoryLabel: 'Intensidad & Dolor',
    text: '¿Te atrae el dolor erótico?',
    type: 'scale',
    options: [
      { label: 'Nada', value: 0 },
      { label: 'Poco', value: 1 },
      { label: 'Moderado', value: 2 },
      { label: 'Mucho', value: 3 },
      { label: 'Extremo', value: 4 },
    ],
    required: true,
    order: 8,
  },
  {
    id: 'q9',
    category: 'intensity',
    categoryLabel: 'Intensidad & Dolor',
    text: '¿Cuál es tu umbral de dolor?',
    type: 'multiple',
    options: [
      { label: 'Bajo', value: 0 },
      { label: 'Medio', value: 1 },
      { label: 'Alto', value: 2 },
      { label: 'Muy alto', value: 3 },
    ],
    required: true,
    order: 9,
  },
];

/**
 * Get questions for a specific mode
 */
export function getQuestionsForMode(mode: QuestionnaireMode): Question[] {
  if (mode === 'express') {
    return ALL_QUESTIONS.filter((q) =>
      EXPRESS_CATEGORIES.includes(q.category)
    ).sort((a, b) => a.order - b.order);
  }
  return ALL_QUESTIONS.sort((a, b) => a.order - b.order);
}

/**
 * Create a new questionnaire draft
 */
export async function createQuestionnaireDraft(
  sessionId: string,
  userId: string,
  mode: QuestionnaireMode = 'express'
): Promise<QuestionnaireResponse> {
  const questions = getQuestionsForMode(mode);
  const draftId = uuidv4();

  const response: QuestionnaireResponse = {
    session_id: sessionId,
    user_id: userId,
    draft_id: draftId,
    mode,
    responses: {},
    progress: 0,
    current_question_index: 0,
    started_at: Date.now(),
    last_saved_at: Date.now(),
    estimated_completion_minutes: mode === 'express' ? 10 : 25,
  };

  // Save draft metadata
  const metadata: DraftMetadata = {
    draft_id: draftId,
    session_id: sessionId,
    user_id: userId,
    mode,
    progress: 0,
    created_at: Date.now(),
    last_updated_at: Date.now(),
    total_questions: questions.length,
    questions_answered: 0,
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  await AsyncStorage.setItem(
    `questionnaire_draft:${draftId}`,
    JSON.stringify(response)
  );
  await AsyncStorage.setItem(
    `questionnaire_metadata:${draftId}`,
    JSON.stringify(metadata)
  );

  return response;
}

/**
 * Load an existing draft
 */
export async function loadQuestionnaireDraft(
  draftId: string
): Promise<QuestionnaireResponse | null> {
  try {
    const stored = await AsyncStorage.getItem(`questionnaire_draft:${draftId}`);
    if (!stored) return null;

    const response: QuestionnaireResponse = JSON.parse(stored);

    // Check expiration
    const metadata = await getQuestionnaireMetadata(draftId);
    if (metadata && metadata.expires_at < Date.now()) {
      // Draft expired, clean up
      await AsyncStorage.removeItem(`questionnaire_draft:${draftId}`);
      await AsyncStorage.removeItem(`questionnaire_metadata:${draftId}`);
      return null;
    }

    return response;
  } catch (error) {
    console.error('[Questionnaire] Failed to load draft:', error);
    return null;
  }
}

/**
 * Get draft metadata (for checking expiration, progress, etc)
 */
export async function getQuestionnaireMetadata(
  draftId: string
): Promise<DraftMetadata | null> {
  try {
    const stored = await AsyncStorage.getItem(
      `questionnaire_metadata:${draftId}`
    );
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[Questionnaire] Failed to load metadata:', error);
    return null;
  }
}

/**
 * Auto-save draft (called every 5 questions or before navigation)
 */
export async function autoSaveQuestionnaireDraft(
  response: QuestionnaireResponse
): Promise<void> {
  try {
    const questions = getQuestionsForMode(response.mode);
    const answeredCount = Object.keys(response.responses).length;
    const progress = Math.min(
      1,
      (response.current_question_index + 1) / questions.length
    );

    response.progress = progress;
    response.last_saved_at = Date.now();

    await AsyncStorage.setItem(
      `questionnaire_draft:${response.draft_id}`,
      JSON.stringify(response)
    );

    // Update metadata
    const metadata = await getQuestionnaireMetadata(response.draft_id);
    if (metadata) {
      metadata.progress = progress;
      metadata.questions_answered = answeredCount;
      metadata.last_updated_at = Date.now();
      await AsyncStorage.setItem(
        `questionnaire_metadata:${response.draft_id}`,
        JSON.stringify(metadata)
      );
    }
  } catch (error) {
    console.error('[Questionnaire] Auto-save failed:', error);
  }
}

/**
 * Record an answer and auto-save if threshold reached
 */
export async function recordAnswer(
  response: QuestionnaireResponse,
  questionId: string,
  answer: number | boolean | string,
  currentIndex: number,
  autoSaveEveryN: number = 5
): Promise<QuestionnaireResponse> {
  response.responses[questionId] = answer;
  response.current_question_index = currentIndex;

  // Auto-save every N questions
  if ((currentIndex + 1) % autoSaveEveryN === 0) {
    await autoSaveQuestionnaireDraft(response);
  }

  return response;
}

/**
 * Complete and finalize questionnaire
 * Moves from draft storage to session responses
 */
export async function completeQuestionnaire(
  response: QuestionnaireResponse
): Promise<void> {
  try {
    // Final save
    response.progress = 1;
    response.last_saved_at = Date.now();
    await AsyncStorage.setItem(
      `questionnaire_draft:${response.draft_id}`,
      JSON.stringify(response)
    );

    // Mark as completed in metadata
    const metadata = await getQuestionnaireMetadata(response.draft_id);
    if (metadata) {
      metadata.progress = 1;
      metadata.last_updated_at = Date.now();
      await AsyncStorage.setItem(
        `questionnaire_metadata:${response.draft_id}`,
        JSON.stringify(metadata)
      );
    }

    // TODO: Send to Supabase for server-side processing
  } catch (error) {
    console.error('[Questionnaire] Failed to complete:', error);
    throw error;
  }
}

/**
 * Delete a draft (user confirms abandon)
 */
export async function deleteQuestionnaireDraft(draftId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`questionnaire_draft:${draftId}`);
    await AsyncStorage.removeItem(`questionnaire_metadata:${draftId}`);
  } catch (error) {
    console.error('[Questionnaire] Failed to delete draft:', error);
  }
}

/**
 * List all active drafts (for resume UI)
 */
export async function listActiveQuestionnaireDrafts(): Promise<
  Array<DraftMetadata & { draftId: string }>
> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const metadataKeys = keys.filter((k) =>
      k.startsWith('questionnaire_metadata:')
    );

    const drafts: Array<DraftMetadata & { draftId: string }> = [];

    for (const key of metadataKeys) {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) continue;

      const metadata: DraftMetadata = JSON.parse(stored);

      // Skip expired drafts
      if (metadata.expires_at < Date.now()) {
        const draftId = key.replace('questionnaire_metadata:', '');
        await deleteQuestionnaireDraft(draftId);
        continue;
      }

      drafts.push({ ...metadata, draftId: metadata.draft_id });
    }

    return drafts.sort((a, b) => b.last_updated_at - a.last_updated_at);
  } catch (error) {
    console.error('[Questionnaire] Failed to list drafts:', error);
    return [];
  }
}

/**
 * Calculate estimated completion time
 */
export function estimateCompletionMinutes(
  mode: QuestionnaireMode,
  currentIndex: number,
  totalQuestions: number
): number {
  const baseTime = mode === 'express' ? 10 : 25;
  const remainingQuestions = totalQuestions - currentIndex;
  const minutePerQuestion = baseTime / totalQuestions;
  return Math.ceil(remainingQuestions * minutePerQuestion);
}
