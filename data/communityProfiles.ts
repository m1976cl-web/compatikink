import { UserProfile, ActivityResponse } from '@/types';

export interface CommunityProfile extends UserProfile {
  id: string;
  avatarEmoji: string;
  age: number;
  location: string;
  bio: string;
  topKinks: string[];
  baseResponses: ActivityResponse[];
}

export const COMMUNITY_PROFILES: CommunityProfile[] = [
  {
    id: 'comm_1',
    nickname: 'Valeria_Shibari',
    avatarEmoji: '🪢',
    pronouns: 'Ella/Her',
    experienceLevel: 'advanced',
    age: 29,
    location: 'Santiago, Chile',
    bio: 'Apasionada del Shibari decorativo y la suspensión corporal. Busco conexión constante, respeto absoluto y aftercare cálido.',
    topKinks: ['Cuerdas (shibari)', 'Contacto visual sostenido', 'Sensaciones térmicas'],
    baseResponses: [
      { activityId: 'bo_rope', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'bo_shibari_decorative', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'bo_suspension', rating: 'like', role: 'give', intensity: 3 },
      { activityId: 'in_eye_contact', rating: 'love', role: 'both', intensity: 5 },
      { activityId: 'se_wax', rating: 'like', role: 'give', intensity: 3 },
      { activityId: 'ac_cuddling', rating: 'love', role: 'both', intensity: 5 },
      { activityId: 'pe_d/s_dynamic', rating: 'like', role: 'give', intensity: 3 },
    ],
  },
  {
    id: 'comm_2',
    nickname: 'Mateo_Dom',
    avatarEmoji: '⚡',
    pronouns: 'Él/Him',
    experienceLevel: 'intermediate',
    age: 34,
    location: 'Buenos Aires, Argentina',
    bio: 'Dominante enfocado en intercambio de poder seguro (D/s), protocolos elegantes y control de orgasmo con alto respeto.',
    topKinks: ['Dinámica D/s', 'Control de orgasmo', 'Protocolos y reglas'],
    baseResponses: [
      { activityId: 'pe_d/s_dynamic', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'pe_protocols', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'pe_orgasm_control', rating: 'love', role: 'give', intensity: 4 },
      { activityId: 'im_spanking', rating: 'like', role: 'give', intensity: 3 },
      { activityId: 'bo_cuffs', rating: 'like', role: 'give', intensity: 3 },
      { activityId: 'ac_talk', rating: 'love', role: 'both', intensity: 4 },
    ],
  },
  {
    id: 'comm_3',
    nickname: 'Luna_Brat',
    avatarEmoji: '🎭',
    pronouns: 'Ella/Ella',
    experienceLevel: 'intermediate',
    age: 26,
    location: 'Ciudad de México, México',
    bio: 'Submisiva juguetona (Brat) en busca de un dominante paciente que disfrute la provocación consensuada y el impact play.',
    topKinks: ['Bratting', 'Nalgadas con mano', 'Pet play'],
    baseResponses: [
      { activityId: 'pe_bratting', rating: 'love', role: 'receive', intensity: 4 },
      { activityId: 'im_spanking', rating: 'love', role: 'receive', intensity: 4 },
      { activityId: 'im_paddle', rating: 'like', role: 'receive', intensity: 3 },
      { activityId: 'pe_pet_play', rating: 'like', role: 'receive', intensity: 3 },
      { activityId: 'pe_praise', rating: 'love', role: 'receive', intensity: 5 },
      { activityId: 'ac_blanket_tea', rating: 'love', role: 'both', intensity: 5 },
    ],
  },
  {
    id: 'comm_4',
    nickname: 'Nico_Switch',
    avatarEmoji: '🦋',
    pronouns: 'Elle/They',
    experienceLevel: 'beginner',
    age: 27,
    location: 'Bogotá, Colombia',
    bio: 'Switch fluido/a explorando sensaciones táctiles, venda de ojos, masajes tántricos y estimulación con plumas.',
    topKinks: ['Venda en ojos', 'Masaje sensual', 'Cosquillas y plumas'],
    baseResponses: [
      { activityId: 'bo_blindfold', rating: 'love', role: 'both', intensity: 3 },
      { activityId: 'se_massage', rating: 'love', role: 'both', intensity: 4 },
      { activityId: 'se_feather', rating: 'love', role: 'both', intensity: 3 },
      { activityId: 'in_slow_touch', rating: 'love', role: 'both', intensity: 5 },
      { activityId: 'in_breath_sync', rating: 'love', role: 'both', intensity: 4 },
      { activityId: 'ac_bath', rating: 'like', role: 'both', intensity: 4 },
    ],
  },
  {
    id: 'comm_5',
    nickname: 'Camila_Sensorial',
    avatarEmoji: '🪷',
    pronouns: 'Ella/Her',
    experienceLevel: 'advanced',
    age: 31,
    location: 'Madrid, España',
    bio: 'Amante del juego de sensaciones extremas pero cuidadas: cera caliente, hielo, ventosas y privación sensorial total.',
    topKinks: ['Cera caliente', 'Privación sensorial', 'Ventosas / Cupping'],
    baseResponses: [
      { activityId: 'se_wax', rating: 'love', role: 'receive', intensity: 4 },
      { activityId: 'se_sensory_deprivation', rating: 'love', role: 'receive', intensity: 5 },
      { activityId: 'se_ice', rating: 'like', role: 'receive', intensity: 3 },
      { activityId: 'se_cupping', rating: 'like', role: 'receive', intensity: 3 },
      { activityId: 'bo_rope', rating: 'like', role: 'receive', intensity: 3 },
      { activityId: 'ac_cuddling', rating: 'love', role: 'both', intensity: 5 },
    ],
  },
  {
    id: 'comm_6',
    nickname: 'Daniel_Roleplay',
    avatarEmoji: '🕵️',
    pronouns: 'Él/Him',
    experienceLevel: 'intermediate',
    age: 32,
    location: 'Lima, Perú',
    bio: 'Entusiasta del Roleplay de alta inmersión (médico/paciente, desconocidos en bar, disfraces) con guiones negociados.',
    topKinks: ['Médico / paciente', 'Desconocidos en un bar', 'Cosplay erótico'],
    baseResponses: [
      { activityId: 'rp_doctor', rating: 'love', role: 'both', intensity: 4 },
      { activityId: 'rp_strangers', rating: 'love', role: 'both', intensity: 3 },
      { activityId: 'rp_cosplay', rating: 'love', role: 'both', intensity: 4 },
      { activityId: 'rp_photographer', rating: 'like', role: 'give', intensity: 3 },
      { activityId: 'ex_photo_video', rating: 'like', role: 'both', intensity: 3 },
      { activityId: 'ac_talk', rating: 'love', role: 'both', intensity: 5 },
    ],
  },
];
