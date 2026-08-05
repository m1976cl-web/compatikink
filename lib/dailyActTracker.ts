import { readJsonStorage, writeJsonStorage } from './cryptoVault';
import { DAILY_SUBMISSIVE_ACTS, DailySubmissiveAct, IntensityLevel } from '@/data/dailySubmissiveActs';

export interface CompletedActLog {
  actId: string;
  title: string;
  completedAt: string;
  note: string;
  xpReward: number;
}

export interface DailyActState {
  currentActId: string;
  generatedDate: string; // YYYY-MM-DD
  streakDays: number;
  lastCompletedDate?: string;
  history: CompletedActLog[];
}

const STORAGE_KEY = 'daily_submissive_act_tracker_v1';

const DEFAULT_STATE: DailyActState = {
  currentActId: 'act-1',
  generatedDate: new Date().toISOString().split('T')[0],
  streakDays: 1,
  history: [],
};

export async function getDailyActState(): Promise<DailyActState> {
  const state = await readJsonStorage<DailyActState>(STORAGE_KEY, DEFAULT_STATE);
  const today = new Date().toISOString().split('T')[0];

  // If today is a new day and no act generated today, pick a new random one
  if (state.generatedDate !== today) {
    const randomAct = DAILY_SUBMISSIVE_ACTS[Math.floor(Math.random() * DAILY_SUBMISSIVE_ACTS.length)];
    state.currentActId = randomAct.id;
    state.generatedDate = today;
    await writeJsonStorage(STORAGE_KEY, state);
  }

  return state;
}

export async function getRandomActByFilter(
  intensityFilter?: IntensityLevel,
  gearKeyword?: string
): Promise<DailySubmissiveAct> {
  let pool = DAILY_SUBMISSIVE_ACTS;

  if (intensityFilter) {
    pool = pool.filter((a) => a.intensity === intensityFilter);
  }

  if (gearKeyword && gearKeyword !== 'Todos') {
    pool = pool.filter((a) => a.requiredGear.toLowerCase().includes(gearKeyword.toLowerCase()));
  }

  if (pool.length === 0) {
    pool = DAILY_SUBMISSIVE_ACTS;
  }

  const selected = pool[Math.floor(Math.random() * pool.length)];

  // Update state with new selected act
  const state = await getDailyActState();
  state.currentActId = selected.id;
  await writeJsonStorage(STORAGE_KEY, state);

  return selected;
}

export async function completeTodayAct(actId: string, noteText: string): Promise<DailyActState> {
  const state = await getDailyActState();
  const act = DAILY_SUBMISSIVE_ACTS.find((a) => a.id === actId) || DAILY_SUBMISSIVE_ACTS[0];
  const today = new Date().toISOString().split('T')[0];

  // Check streak
  if (state.lastCompletedDate) {
    const lastDate = new Date(state.lastCompletedDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.streakDays += 1;
    } else if (diffDays > 1) {
      state.streakDays = 1;
    }
  } else {
    state.streakDays = 1;
  }

  state.lastCompletedDate = today;

  const newLog: CompletedActLog = {
    actId: act.id,
    title: act.title,
    completedAt: new Date().toISOString(),
    note: noteText.trim() || 'Acto de sumisión completado con disciplina y respeto.',
    xpReward: act.xpReward,
  };

  state.history = [newLog, ...state.history];
  await writeJsonStorage(STORAGE_KEY, state);
  return state;
}
