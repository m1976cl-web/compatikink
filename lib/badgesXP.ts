import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface KinkBadge {
  id: string;
  title: string;
  description: string;
  category: 'onboarding' | 'questionnaire' | 'sessions' | 'gear' | 'streaks' | 'education';
  emoji: string;
  xpReward: number;
  unlockedAt?: string; // ISO date if unlocked
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserGamificationData {
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  nextLevelXP: number;
  currentLevelXP: number;
  unlockedBadgeIds: string[];
  badges: KinkBadge[];
  history: { date: string; amount: number; reason: string }[];
}

const STORAGE_KEY = 'compatikink_gamification_v1';

export const EXPLORATION_LEVELS = [
  { level: 1, title: 'Iniciado Curioso', minXP: 0, maxXP: 200 },
  { level: 2, title: 'Explorador Sensorial', minXP: 200, maxXP: 500 },
  { level: 3, title: 'Practicante Consciente', minXP: 500, maxXP: 1000 },
  { level: 4, title: 'Navegante de la Bóveda', minXP: 1000, maxXP: 1800 },
  { level: 5, title: 'Alquimista del Deseo', minXP: 1800, maxXP: 3000 },
  { level: 6, title: 'Maestro de Escena', minXP: 3000, maxXP: 5000 },
  { level: 7, title: 'Guardián del Protocolo', minXP: 5000, maxXP: 8000 },
  { level: 8, title: 'Arquitecto de Dinámicas', minXP: 8000, maxXP: 12000 },
  { level: 9, title: 'Soberano/a de la Sombra', minXP: 12000, maxXP: 18000 },
  { level: 10, title: 'Gran Luminar Nox', minXP: 18000, maxXP: Infinity },
];

export const BADGE_CATALOG: KinkBadge[] = [
  { id: 'guardian_zk', title: 'Guardián ZK', description: 'Activaste el camuflaje Panic Mode', category: 'onboarding', emoji: '🛡️', xpReward: 50, rarity: 'rare' },
  { id: 'paso_rapido', title: 'Paso Rápido', description: 'Completaste el onboarding de inmediato', category: 'onboarding', emoji: '⚡', xpReward: 20, rarity: 'common' },
  { id: 'enciclopedia_intima', title: 'Enciclopedia Íntima', description: 'Leíste 10 términos del glosario', category: 'education', emoji: '📚', xpReward: 100, rarity: 'epic' },
  { id: 'mochilero_impecable', title: 'Mochilero Impecable', description: 'Armario equipado con más de 5 items', category: 'gear', emoji: '🎒', xpReward: 50, rarity: 'rare' },
  { id: 'debrief_maestro', title: 'Debrief Maestro', description: 'Realizaste un debrief post-sesión exitoso', category: 'sessions', emoji: '📝', xpReward: 80, rarity: 'rare' },
  { id: 'conexion_asimetrica', title: 'Conexión Asimétrica', description: 'Estableciste un rol D/s', category: 'sessions', emoji: '🔗', xpReward: 150, rarity: 'epic' },
  { id: 'arquetipo_descubierto', title: 'Arquetipo Descubierto', description: 'Completaste el test de arquetipos', category: 'questionnaire', emoji: '🎭', xpReward: 50, rarity: 'common' },
  { id: 'identidad_nox', title: 'Identidad Nox', description: 'Personalizaste tu avatar', category: 'onboarding', emoji: '👤', xpReward: 30, rarity: 'common' },
  { id: 'armario_equipado', title: 'Armario Equipado', description: 'Agregaste tu primer item de equipo', category: 'gear', emoji: '🧰', xpReward: 20, rarity: 'common' },
  { id: 'llama_inquebrantable', title: 'Llama Inquebrantable', description: 'Alcanzaste 7 días de racha', category: 'streaks', emoji: '🔥', xpReward: 200, rarity: 'legendary' },
  { id: 'maestro_racha', title: 'Maestro de Racha', description: 'Alcanzaste 30 días de racha', category: 'streaks', emoji: '🌟', xpReward: 500, rarity: 'legendary' },
  { id: 'curioso_primerizo', title: 'Curioso Primerizo', description: 'Primera sesión iniciada', category: 'sessions', emoji: '👀', xpReward: 10, rarity: 'common' },
  { id: 'explorador_cuestionario', title: 'Explorador Cuestionario', description: 'Cuestionario inicial completado', category: 'questionnaire', emoji: '🧭', xpReward: 50, rarity: 'common' },
  { id: 'estudiante_shibari', title: 'Estudiante Shibari', description: 'Viste la guía de Shibari', category: 'education', emoji: '🪢', xpReward: 30, rarity: 'common' },
];

export function getLevelInfo(totalXP: number) {
  let currentLevelInfo = EXPLORATION_LEVELS[0];
  for (const level of EXPLORATION_LEVELS) {
    if (totalXP >= level.minXP) {
      currentLevelInfo = level;
    } else {
      break;
    }
  }
  const nextLevelXP = currentLevelInfo.maxXP === Infinity ? totalXP : currentLevelInfo.maxXP;
  const currentLevelXP = totalXP - currentLevelInfo.minXP;
  return {
    level: currentLevelInfo.level,
    title: currentLevelInfo.title,
    nextLevelXP,
    currentLevelXP,
    minXP: currentLevelInfo.minXP,
    maxXP: currentLevelInfo.maxXP
  };
}

export async function getUserGamificationData(): Promise<UserGamificationData> {
  const data = await readJsonStorage<UserGamificationData | null>(STORAGE_KEY, null);
  if (data) {
    const badges = BADGE_CATALOG.map(b => {
      const unlocked = data.unlockedBadgeIds.includes(b.id);
      const existingBadge = data.badges.find(db => db.id === b.id);
      return { ...b, unlockedAt: unlocked ? (existingBadge?.unlockedAt || new Date().toISOString()) : undefined };
    });
    const levelInfo = getLevelInfo(data.totalXP);
    return { 
      ...data, 
      badges,
      currentLevel: levelInfo.level,
      levelTitle: levelInfo.title,
      nextLevelXP: levelInfo.nextLevelXP,
      currentLevelXP: levelInfo.currentLevelXP
    };
  }
  
  const defaultLevel = getLevelInfo(0);
  return {
    totalXP: 0,
    currentLevel: defaultLevel.level,
    levelTitle: defaultLevel.title,
    nextLevelXP: defaultLevel.nextLevelXP,
    currentLevelXP: defaultLevel.currentLevelXP,
    unlockedBadgeIds: [],
    badges: BADGE_CATALOG,
    history: []
  };
}

export async function addXP(amount: number, reason: string): Promise<UserGamificationData> {
  const data = await getUserGamificationData();
  data.totalXP += amount;
  data.history.push({ date: new Date().toISOString(), amount, reason });
  
  const levelInfo = getLevelInfo(data.totalXP);
  data.currentLevel = levelInfo.level;
  data.levelTitle = levelInfo.title;
  data.nextLevelXP = levelInfo.nextLevelXP;
  data.currentLevelXP = levelInfo.currentLevelXP;

  await writeJsonStorage(STORAGE_KEY, data);
  return data;
}

export async function unlockBadge(badgeId: string): Promise<UserGamificationData> {
  const data = await getUserGamificationData();
  if (!data.unlockedBadgeIds.includes(badgeId)) {
    data.unlockedBadgeIds.push(badgeId);
    const badge = data.badges.find(b => b.id === badgeId);
    if (badge) {
      badge.unlockedAt = new Date().toISOString();
      await writeJsonStorage(STORAGE_KEY, data);
      await addXP(badge.xpReward, `Insignia desbloqueada: ${badge.title}`);
      return await getUserGamificationData(); // Refresh after addXP
    }
  }
  return data;
}

export async function checkAutomaticBadges(): Promise<void> {
  // Implementation placeholder for auto-unlocks
}
