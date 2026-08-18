import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NoxAvatarItem {
  id: string;
  name: string;
  archetypeTitle: string;
  emoji: string;
  quote: string;
  affinityBadge: string;
  glowColor: string;
  imageSource: any;
}

export interface IntimateArchetype {
  id: string;
  name: string;
  description: string;
  emoji: string;
  recommendedAvatarId: string;
  affinityTags: string[];
}

const NOX_AVATARS: NoxAvatarItem[] = [
  {
    id: 'avatar_1',
    name: 'Nox Host',
    archetypeTitle: 'El Anfitrión',
    emoji: '🎭',
    quote: 'Bienvenidos al juego.',
    affinityBadge: 'Sensual',
    glowColor: '#c084fc',
    imageSource: require('../assets/images/nox_host.jpg'),
  },
  {
    id: 'avatar_2',
    name: 'Vault Keeper',
    archetypeTitle: 'El Guardián',
    emoji: '🗝️',
    quote: 'Tus secretos están a salvo.',
    affinityBadge: 'Protector',
    glowColor: '#34d399',
    imageSource: require('../assets/images/nox_vault_keeper.jpg'),
  },
  {
    id: 'avatar_3',
    name: 'Astrologer',
    archetypeTitle: 'El Astrólogo',
    emoji: '✨',
    quote: 'Las estrellas guían el deseo.',
    affinityBadge: 'Místico',
    glowColor: '#60a5fa',
    imageSource: require('../assets/images/nox_astrologer.jpg'),
  },
  {
    id: 'avatar_4',
    name: 'Cyber AI',
    archetypeTitle: 'La Mente Artificial',
    emoji: '🤖',
    quote: 'Calculando compatibilidad óptima.',
    affinityBadge: 'Analítico',
    glowColor: '#f472b6',
    imageSource: require('../assets/images/nox_cyber_ai.jpg'),
  },
  {
    id: 'avatar_5',
    name: 'Director',
    archetypeTitle: 'El Director',
    emoji: '🎬',
    quote: 'Acción y control total.',
    affinityBadge: 'Dominante',
    glowColor: '#ef4444',
    imageSource: require('../assets/images/nox_director.jpg'),
  },
  {
    id: 'avatar_6',
    name: 'Octopus',
    archetypeTitle: 'El Tentáculo',
    emoji: '🐙',
    quote: 'Múltiples formas de sentir.',
    affinityBadge: 'Creativo',
    glowColor: '#9333ea',
    imageSource: require('../assets/images/nox_octopus.jpg'),
  },
  {
    id: 'avatar_7',
    name: 'Auth Enforcer',
    archetypeTitle: 'El Centinela',
    emoji: '🛡️',
    quote: 'Solo los dignos pasan.',
    affinityBadge: 'Seguro',
    glowColor: '#fbbf24',
    imageSource: require('../assets/nox/nox-auth.webp'),
  },
  {
    id: 'avatar_8',
    name: 'Quiz Master',
    archetypeTitle: 'El Inquisidor',
    emoji: '📝',
    quote: 'Conozco tus respuestas más profundas.',
    affinityBadge: 'Curioso',
    glowColor: '#a78bfa',
    imageSource: require('../assets/nox/nox-questionnaire.webp'),
  },
  {
    id: 'avatar_9',
    name: 'Reporter',
    archetypeTitle: 'El Analista',
    emoji: '📊',
    quote: 'Los datos revelan tus verdades.',
    affinityBadge: 'Intelectual',
    glowColor: '#38bdf8',
    imageSource: require('../assets/nox/nox-report.webp'),
  },
  {
    id: 'avatar_10',
    name: 'Shibari Weaver',
    archetypeTitle: 'El Tejedor',
    emoji: '🪢',
    quote: 'Atados en perfecta armonía.',
    affinityBadge: 'Arte Corporal',
    glowColor: '#f87171',
    imageSource: require('../assets/nox/nox-home.webp'),
  },
];

const INTIMATE_ARCHETYPES: IntimateArchetype[] = [
  {
    id: 'arch_dom',
    name: 'Dominante',
    description: 'Tomas el control y guías la experiencia.',
    emoji: '👑',
    recommendedAvatarId: 'avatar_5',
    affinityTags: ['Control', 'Poder', 'Guía'],
  },
  {
    id: 'arch_sub',
    name: 'Sumiso/a',
    description: 'Te entregas y confías en la dirección de otro.',
    emoji: '🛐',
    recommendedAvatarId: 'avatar_10',
    affinityTags: ['Entrega', 'Confianza', 'Servicio'],
  },
  {
    id: 'arch_switch',
    name: 'Switch',
    description: 'Fluyes entre el control y la entrega según el momento.',
    emoji: '🔄',
    recommendedAvatarId: 'avatar_6',
    affinityTags: ['Adaptable', 'Versátil', 'Equilibrio'],
  },
  {
    id: 'arch_rigger',
    name: 'Rigger',
    description: 'El arte de atar es tu forma de expresión.',
    emoji: '🪢',
    recommendedAvatarId: 'avatar_10',
    affinityTags: ['Arte', 'Cuerdas', 'Precisión'],
  },
  {
    id: 'arch_bunny',
    name: 'Rope Bunny',
    description: 'Encuentras paz y placer al ser atado.',
    emoji: '🐰',
    recommendedAvatarId: 'avatar_2',
    affinityTags: ['Contención', 'Sensibilidad', 'Estética'],
  },
];

export function getNoxAvatars(): NoxAvatarItem[] {
  return NOX_AVATARS;
}

export function getNoxAvatarById(id: string): NoxAvatarItem {
  return NOX_AVATARS.find((a) => a.id === id) || NOX_AVATARS[0];
}

export function getIntimateArchetypes(): IntimateArchetype[] {
  return INTIMATE_ARCHETYPES;
}

const STORAGE_KEY = '@nox_avatar_selection';

export async function saveUserAvatarSelection(avatarId: string, archetypeTitle?: string): Promise<void> {
  try {
    const data = JSON.stringify({ avatarId, archetypeTitle: archetypeTitle || '' });
    await AsyncStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save avatar selection:', error);
  }
}

export async function getUserAvatarSelection(): Promise<{ avatarId: string; archetypeTitle: string }> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to get avatar selection:', error);
  }
  return { avatarId: NOX_AVATARS[0].id, archetypeTitle: INTIMATE_ARCHETYPES[0].name };
}
