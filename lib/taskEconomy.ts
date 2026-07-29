import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'ds_task_economy_v1';
const COINS_KEY = 'ds_kink_coins_v1';
const STREAKS_KEY = 'ds_streaks_v1';

export interface DSTask {
  id: string;
  title: string;
  emoji: string;
  description: string;
  pointValue: number;
  frequency: 'diaria' | 'semanal' | 'única';
  requiresPhoto: boolean;
  completed: boolean;
  completedAt?: string;
  createdBy: 'dom' | 'sub';
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  cost: number;
  description: string;
  redeemed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalTasksCompleted: number;
}

const DEFAULT_TASKS: DSTask[] = [
  { id: 'dt-1', title: 'Saludo Matutino de Protocolo', emoji: '🌅', description: 'Enviar mensaje de "Buenos días, Sir/Madam" antes de las 9:00 AM.', pointValue: 10, frequency: 'diaria', requiresPhoto: false, completed: false, createdBy: 'dom' },
  { id: 'dt-2', title: 'Diario de Gratitud & Reflexión', emoji: '📝', description: 'Escribir 3 cosas por las que estás agradecido/a hoy en el contexto de la dinámica.', pointValue: 15, frequency: 'diaria', requiresPhoto: false, completed: false, createdBy: 'dom' },
  { id: 'dt-3', title: 'Preparación de Escena Semanal', emoji: '🪢', description: 'Preparar el equipamiento y espacio para la próxima sesión según el checklist del Dom.', pointValue: 30, frequency: 'semanal', requiresPhoto: true, completed: false, createdBy: 'dom' },
  { id: 'dt-4', title: 'Autocuidado & Ejercicio', emoji: '💪', description: 'Completar 30 minutos de ejercicio o meditación guiada.', pointValue: 20, frequency: 'diaria', requiresPhoto: false, completed: false, createdBy: 'dom' },
  { id: 'dt-5', title: 'Lectura Educativa Kink', emoji: '📖', description: 'Leer un artículo o capítulo sobre seguridad, técnica o aftercare y compartir un resumen.', pointValue: 25, frequency: 'semanal', requiresPhoto: false, completed: false, createdBy: 'dom' },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: 'rw-1', title: 'Elegir la Próxima Escena', emoji: '🎬', cost: 100, description: 'Tú decides la actividad, duración e intensidad de la próxima sesión.', redeemed: false },
  { id: 'rw-2', title: 'Día Libre de Protocolo', emoji: '🏖️', cost: 150, description: 'Un día completo sin reglas de protocolo activas.', redeemed: false },
  { id: 'rw-3', title: 'Masaje de 30 Minutos', emoji: '💆', cost: 80, description: 'Masaje relajante sin expectativa de escena.', redeemed: false },
  { id: 'rw-4', title: 'Playlist Personalizada', emoji: '🎶', cost: 50, description: 'Tu pareja crea una playlist especial para tu próxima sesión de aftercare.', redeemed: false },
];

export async function getTasks(): Promise<DSTask[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_TASKS;
}

export async function saveTasks(tasks: DSTask[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function getCoins(): Promise<number> {
  const raw = await AsyncStorage.getItem(COINS_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function addCoins(amount: number): Promise<number> {
  const current = await getCoins();
  const next = current + amount;
  await AsyncStorage.setItem(COINS_KEY, String(next));
  return next;
}

export async function spendCoins(amount: number): Promise<number> {
  const current = await getCoins();
  if (current < amount) return current;
  const next = current - amount;
  await AsyncStorage.setItem(COINS_KEY, String(next));
  return next;
}

export async function getStreakData(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(STREAKS_KEY);
  return raw ? JSON.parse(raw) : { currentStreak: 0, longestStreak: 0, lastActivityDate: '', totalTasksCompleted: 0 };
}

export async function recordTaskCompletion(): Promise<StreakData> {
  const streak = await getStreakData();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  streak.totalTasksCompleted += 1;

  if (streak.lastActivityDate === yesterday) {
    streak.currentStreak += 1;
  } else if (streak.lastActivityDate !== today) {
    streak.currentStreak = 1;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }
  streak.lastActivityDate = today;

  await AsyncStorage.setItem(STREAKS_KEY, JSON.stringify(streak));
  return streak;
}

export function getDefaultRewards(): Reward[] {
  return DEFAULT_REWARDS;
}
