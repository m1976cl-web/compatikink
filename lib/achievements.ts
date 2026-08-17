import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentProfile, listMyLocalSessions, getWishlist, getGearItems } from './storage';
import { getPartnerLinks, getJournalEntries } from './partnerJournal';
import { triggerSuccessHaptic } from './haptics';

export type AchievementCategory =
  | 'domination'
  | 'submission'
  | 'latex_sensations'
  | 'safety_care'
  | 'community_legend';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  flavorText: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  glowColor: string;
  unlocked: boolean;
}

export const CATEGORY_LABELS: Record<AchievementCategory, { label: string; emoji: string; color: string }> = {
  domination: { label: 'Dominación & Control', emoji: '⚡', color: '#c084fc' },
  submission: { label: 'Sumisión & Trance', emoji: '🪢', color: '#f472b6' },
  latex_sensations: { label: 'Látex, Cera & Sensaciones', emoji: '🖤', color: '#38bdf8' },
  safety_care: { label: 'Consentimiento & Aftercare', emoji: '🛡️', color: '#10b981' },
  community_legend: { label: 'Leyenda Fetish', emoji: '🎭', color: '#fbbf24' },
};

export const RARITY_LABELS: Record<AchievementRarity, { label: string; color: string }> = {
  common: { label: 'Común ⚪', color: '#9ca3af' },
  rare: { label: 'Raro 🔹', color: '#60a5fa' },
  epic: { label: 'Épico 💜', color: '#c084fc' },
  legendary: { label: 'Leyenda Fetish 👑', color: '#fbbf24' },
};

const UNLOCKED_KEY = 'unlocked_achievements_list';

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked'>[] = [
  // ⚡ DOMINACIÓN & CONTROL
  {
    id: 'spankologist',
    title: 'Spankólogo/a Certificado/a 🍑',
    emoji: '👋',
    category: 'domination',
    rarity: 'rare',
    glowColor: '#c084fc',
    description: 'Demostrar precisión milimétrica en el arte de la disciplina corporal.',
    flavorText: 'Aprobado por el Consejo Superior de la Palmada Voladora.',
  },
  {
    id: 'master_knot',
    title: 'Señor/a de los 1000 Nudos 🪢',
    emoji: '🌀',
    category: 'domination',
    rarity: 'epic',
    glowColor: '#c084fc',
    description: 'Completar 5 o más sesiones de Shibari con tensión controlada.',
    flavorText: 'Tus nudos inspiran tanto respeto como ganas de no moverse.',
  },
  {
    id: 'trance_commander',
    title: 'Comandante del Trance 👁️',
    emoji: '🌀',
    category: 'domination',
    rarity: 'legendary',
    glowColor: '#c084fc',
    description: 'Llevar a un partner a Nivel 5 de Subspace de forma segura y guiada.',
    flavorText: 'Manejas el trance con la destreza de un hipnotista victoriano.',
  },
  {
    id: 'pegging_champion',
    title: 'Pionero/a del Pegging 🎯',
    emoji: '🍑',
    category: 'domination',
    rarity: 'rare',
    glowColor: '#c084fc',
    description: 'Completar la lectura de la Guía Psicopropulsada de Pegging.',
    flavorText: 'Rompiendo tabúes con arnés calibrado y diplomacia.',
  },

  // 🪢 SUMISIÓN & TRANCE
  {
    id: 'subspace_surfer',
    title: 'Subspace Surfer 🏄‍♂️',
    emoji: '✨',
    category: 'submission',
    rarity: 'epic',
    glowColor: '#f472b6',
    description: 'Alcanzar el estado de ingravidez mental durante una escena.',
    flavorText: 'Flotando en las nubes de endorfinas sin pagar pasaje aéreo.',
  },
  {
    id: 'reformed_brat',
    title: 'Brat Indomable (pero adorable) 😜',
    emoji: '😈',
    category: 'submission',
    rarity: 'common',
    glowColor: '#f472b6',
    description: 'Provocar con elegancia sin romper nunca la safeword roja.',
    flavorText: 'La rebeldía es tu superpoder, pero el consentimiento es tu ley.',
  },
  {
    id: 'rope_bunny_expert',
    title: 'Rope Bunny de Honor 🐰',
    emoji: '🪢',
    category: 'submission',
    rarity: 'rare',
    glowColor: '#f472b6',
    description: 'Someterte a una sesión completa de ataduras con comunicación fluida.',
    flavorText: 'Amarrado/a con amor, estilo y nudos de yute natural.',
  },
  {
    id: 'surrender_artist',
    title: 'Artista de la Entrega 🧘‍♀️',
    emoji: '🕯️',
    category: 'submission',
    rarity: 'legendary',
    glowColor: '#f472b6',
    description: 'Completar 10 debriefings post-escena otorgando 5 estrellas de Aftercare.',
    flavorText: 'La rendición consciente es el acto más valiente.',
  },

  // 🖤 LÁTEX, CERA & SENSACIONES
  {
    id: 'latex_alchemist',
    title: 'Alquimista de Látex Negro 🖤',
    emoji: '🧥',
    category: 'latex_sensations',
    rarity: 'legendary',
    glowColor: '#38bdf8',
    description: 'Abrazar la estética de látex brillante y el poder del guardián Nox.',
    flavorText: 'Brillas más que una pasarela fetichista en Berlín.',
  },
  {
    id: 'wax_sommelier',
    title: 'Sommelier de Cera Tibia 🕯️',
    emoji: '🔥',
    category: 'latex_sensations',
    rarity: 'rare',
    glowColor: '#38bdf8',
    description: 'Explorar la termofilia con velas de bajo punto de fusión.',
    flavorText: 'Gotas de placer caliente medidas a grados centígrados.',
  },
  {
    id: 'gear_hoarder',
    title: 'Coleccionista de Arnés & Gear 🧰',
    emoji: '⚙️',
    category: 'latex_sensations',
    rarity: 'epic',
    glowColor: '#38bdf8',
    description: 'Registrar 3 o más elementos en tu Armario de Equipamiento Kink.',
    flavorText: 'Tu closet impresiona más que una armería medieval sensual.',
  },
  {
    id: 'blindfold_whisperer',
    title: 'Encantador/a de la Venda 🙈',
    emoji: '🌙',
    category: 'latex_sensations',
    rarity: 'common',
    glowColor: '#38bdf8',
    description: 'Realizar una escena sensorial a ciegas potenciando tacto y oído.',
    flavorText: 'Apagar la vista para encender el resto del universo.',
  },

  // 🛡️ CONSENTIMIENTO & AFTERCARE
  {
    id: 'safeword_sentinel',
    title: 'Sentinela del Semáforo 🟢🟡🔴',
    emoji: '🛡️',
    category: 'safety_care',
    rarity: 'common',
    glowColor: '#10b981',
    description: 'Configurar tu semáforo de safewords personal en tu perfil.',
    flavorText: 'Verde para volar, amarillo para calibrar, rojo para frenar de golpe.',
  },
  {
    id: 'aftercare_doctor',
    title: 'Doctor/a Honoris Causa en Aftercare 🫂',
    emoji: '🪷',
    category: 'safety_care',
    rarity: 'epic',
    glowColor: '#10b981',
    description: 'Proporcionar mantas, agua y mimos de 5 estrellas tras una escena intensa.',
    flavorText: 'Especialista en aterrizajes suaves tras vuelos espaciales.',
  },
  {
    id: 'limit_architect',
    title: 'Arquitecto/a de Límites 🛑',
    emoji: '📐',
    category: 'safety_care',
    rarity: 'rare',
    glowColor: '#10b981',
    description: 'Definir claramente tus Límites Duros y Suaves en tu perfil.',
    flavorText: 'Los límites claros son los cimientos de la verdadera libertad.',
  },
  {
    id: 'ssc_diplomat',
    title: 'Embajador/a SSC & RACK 📜',
    emoji: '⚖️',
    category: 'safety_care',
    rarity: 'legendary',
    glowColor: '#10b981',
    description: 'Demostrar dominio total de los protocolos de consentimiento.',
    flavorText: 'Negocias acuerdos más sólidos que un tratado internacional.',
  },

  // 🎭 LEYENDA FETISH
  {
    id: 'munch_legend',
    title: 'Leyenda del Munch & Play Party 🍸',
    emoji: '🥂',
    category: 'community_legend',
    rarity: 'epic',
    glowColor: '#fbbf24',
    description: 'Confirmar asistencia discreta a un Munch o evento comunitario.',
    flavorText: 'Socializando en la escena con estilo, discreción y buena conversación.',
  },
  {
    id: 'poly_group_oracle',
    title: 'Órculo de la Sinastría Poli 💎',
    emoji: '🔮',
    category: 'community_legend',
    rarity: 'rare',
    glowColor: '#fbbf24',
    description: 'Calcular la matriz de afinidad kink para 3 o más personas.',
    flavorText: 'Armonizando redes afectivas con precisión astrológica y matemática.',
  },
  {
    id: 'vault_guardian',
    title: 'Guardián/a de la Bóveda Zero-Knowledge 🔐',
    emoji: '🔑',
    category: 'community_legend',
    rarity: 'common',
    glowColor: '#fbbf24',
    description: 'Activar tu PIN de pánico / coacción y cifrado AES-GCM-256.',
    flavorText: 'Tus secretos fetichistas están más protegidos que las reservas de oro.',
  },
  {
    id: 'grandmaster_fetishist',
    title: 'Gran Maestro/a Fetish 👑',
    emoji: '🏆',
    category: 'community_legend',
    rarity: 'legendary',
    glowColor: '#fbbf24',
    description: 'Desbloquear 10 o más insignias en tu trayectoria kink.',
    flavorText: 'Incoronación oficial por Nox el Pulpo de Látex. ¡Respeto total!',
  },
];

export async function getUnlockedAchievements(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(UNLOCKED_KEY);
  return raw ? JSON.parse(raw) : ['safeword_sentinel', 'vault_guardian'];
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  let unlocked = await getUnlockedAchievements();
  const profile = await getCurrentProfile();
  const sessions = await listMyLocalSessions();
  const wishlist = await getWishlist();
  const gear = await getGearItems();
  const links = await getPartnerLinks();
  const journal = await getJournalEntries();

  const newUnlocked = [...unlocked];

  if (profile) {
    newUnlocked.push('safeword_sentinel');
    newUnlocked.push('vault_guardian');
    if (profile.hardLimits && profile.hardLimits.length > 0) newUnlocked.push('limit_architect');
    if (profile.baseResponses && profile.baseResponses.length >= 20) newUnlocked.push('ssc_diplomat');
  }

  if (sessions.length > 0 || journal.length > 0) newUnlocked.push('spankologist');
  if (journal.some((j) => j.gearUsed && j.gearUsed.length > 0)) newUnlocked.push('master_knot');
  if (journal.some((j) => j.subspaceLevel >= 4)) newUnlocked.push('subspace_surfer');
  if (journal.some((j) => j.subspaceLevel === 5)) newUnlocked.push('trance_commander');
  if (journal.some((j) => j.aftercareRating === 5)) newUnlocked.push('aftercare_doctor');
  if (journal.length >= 5) newUnlocked.push('surrender_artist');

  if (gear.length >= 1) newUnlocked.push('gear_hoarder');
  if (links.length >= 1) newUnlocked.push('rope_bunny_expert');
  if (wishlist.length >= 3) newUnlocked.push('blindfold_whisperer');

  // Master unlocked bonus
  if (newUnlocked.length >= 8) newUnlocked.push('grandmaster_fetishist');

  const unique = Array.from(new Set(newUnlocked));
  if (unique.length > unlocked.length) {
    triggerSuccessHaptic();
  }
  await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unique));

  return ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unique.includes(a.id),
  }));
}
