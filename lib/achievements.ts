import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentProfile, listMyLocalSessions, getWishlist, getGearItems } from './storage';

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: 'exploration' | 'safety' | 'social' | 'mastery';
  unlocked: boolean;
}

const UNLOCKED_KEY = 'unlocked_achievements_list';

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_profile', title: 'Primer Paso Kink', emoji: '🌱', category: 'exploration', description: 'Crear tu primer perfil personal en la aplicación.' },
  { id: 'questionnaire_master', title: 'Explorador Completo', emoji: '📜', category: 'exploration', description: 'Completar las 158+ preguntas del cuestionario erótico.' },
  { id: 'safety_first', title: 'Guardián del Consentimiento', emoji: '🛡️', category: 'safety', description: 'Leer la Guía de Seguridad y Salud Kink.' },
  { id: 'first_scene', title: 'Primera Escena', emoji: '🎬', category: 'mastery', description: 'Realizar y concluir una escena con el temporizador de seguridad.' },
  { id: 'debrief_king', title: 'Maestro del Aftercare', emoji: '🪷', category: 'safety', description: 'Completar tu primer registro en el Diario Post-Escena.' },
  { id: 'wishlist_collector', title: 'Lista de Deseos', emoji: '💌', category: 'exploration', description: 'Agregar 5 o más actividades a tu Wishlist "Quiero Probar".' },
  { id: 'gear_closet', title: 'Armario Equipado', emoji: '🧰', category: 'mastery', description: 'Registrar tu primer accesorio en el Inventario de Equipamiento.' },
  { id: 'dating_connector', title: 'Conector Kink', emoji: '💬', category: 'social', description: 'Iniciar una conversación directa en el Radar de Dating.' },
];

export async function getUnlockedAchievements(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(UNLOCKED_KEY);
  return raw ? JSON.parse(raw) : ['first_profile'];
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  let unlocked = await getUnlockedAchievements();
  const profile = await getCurrentProfile();
  const sessions = await listMyLocalSessions();
  const wishlist = await getWishlist();
  const gear = await getGearItems();

  const newUnlocked = [...unlocked];

  if (profile) newUnlocked.push('first_profile');
  if (profile?.baseResponses && profile.baseResponses.length >= 50) newUnlocked.push('questionnaire_master');
  if (sessions.some((s) => s.status === 'complete')) newUnlocked.push('first_scene');
  if (wishlist.length >= 3) newUnlocked.push('wishlist_collector');
  if (gear.length >= 1) newUnlocked.push('gear_closet');

  const unique = Array.from(new Set(newUnlocked));
  await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unique));

  return ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unique.includes(a.id),
  }));
}
