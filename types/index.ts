export type Rating = 'hard_limit' | 'not_interested' | 'curious' | 'like' | 'love';

export type RolePreference = 'give' | 'receive' | 'both' | 'flexible';

export type ActivityCategory =
  | 'power_exchange'
  | 'bondage'
  | 'impact'
  | 'sensation'
  | 'psychological'
  | 'service'
  | 'exhibition'
  | 'intimacy'
  | 'aftercare'
  | 'roleplay'
  | 'toys_gear'
  | 'lifestyle';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ActivityMood =
  | 'sensual_relajante'
  | 'poder_adrenalina'
  | 'fantasia_roles'
  | 'romantico_afectivo';

export const MOOD_LABELS: Record<
  ActivityMood,
  { label: string; emoji: string; description: string }
> = {
  sensual_relajante: {
    label: 'Sensual & Relajante',
    emoji: '🪷',
    description: 'Sensaciones suaves, tacto lento, confort y clima de relajación',
  },
  poder_adrenalina: {
    label: 'Poder & Adrenalina',
    emoji: '⚡',
    description: 'Dinámicas de control, impacto, moderación e intensidad física',
  },
  fantasia_roles: {
    label: 'Fantasía & Roles',
    emoji: '🎭',
    description: 'Juegos de rol, sumisión psicológica, trance y servicio',
  },
  romantico_afectivo: {
    label: 'Romántico & Afectivo',
    emoji: '💖',
    description: 'Conexión emocional, vulnerabilidad, mirada y cuidado posterior',
  },
};

export interface Activity {
  id: string;
  category: ActivityCategory;
  name: string;
  description: string;
  moods?: ActivityMood[];
  difficultyLevel?: DifficultyLevel;
  safetyTip?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  suggestedGear?: string[];
}

export interface ActivityResponse {
  activityId: string;
  rating: Rating;
  role: RolePreference;
  intensity: 1 | 2 | 3 | 4 | 5;
  privateNote?: string;
}

export type BadgeCategory = 'role' | 'fetish' | 'safety' | 'verification';

export interface FetishBadge {
  id: string;
  label: string;
  category: BadgeCategory;
  color: string;
  icon?: string;
  description?: string;
}

export type EventType = 'munch' | 'workshop' | 'play_party' | 'online';

export interface EventItem {
  id: string;
  title: string;
  type?: 'Munch Social' | 'Taller Shibari' | 'Charla Consentimiento' | 'Encuentro Online' | string;
  eventType: EventType;
  date: string;
  time: string;
  location: string;
  confidentialLocation: boolean;
  venueAddressEncrypted?: string;
  isDiscreetRSVP?: boolean;
  etiquetteAgreed?: boolean;
  description: string;
  attendeesCount: number;
  isRSVP: boolean;
  hostNickname?: string;
}

export interface FeedPost {
  id: string;
  author: string;
  isVerified: boolean;
  timeAgo: string;
  category: 'Encuesta' | 'Debate' | 'Consejo' | 'Aftercare' | string;
  content: string;
  likes: number;
  pollOptions?: { option: string; votes: number }[];
  userVotedIdx?: number;
  isAnonymous?: boolean;
  roleTag?: string;
  kinkCategoryTag?: string;
  anonymousSignature?: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  nickname: string;
  /** @deprecated Legacy plaintext PIN — migrated to pinSalt/pinVerifier on first unlock. Never write new plaintext PINs. */
  pin?: string;
  /** PBKDF2 salt (base64) — never store the PIN itself. */
  pinSalt?: string;
  /** AES-GCM sealed verifier blob (ck1:…) proving PIN knowledge. */
  pinVerifier?: string;
  /** Sealed ProfileSecrets (notes, baseResponses, session ids) when vault is active. */
  secretsCipher?: string;
  vaultVersion?: number;
  /** Duress PIN (PIN de coacción / pánico) metadata. */
  duressMeta?: {
    saltB64: string;
    verifierB64: string;
    action: 'decoy' | 'wipe';
  };
  /** Configured auto-lock timeout option ('1m' | '5m' | '15m' | 'never'). */
  autoLockTimeout?: '1m' | '5m' | '15m' | 'never';
  /** Hard limits / Límites duros inviolables */
  hardLimits?: string[];
  /** Soft limits / Límites suaves o condicionales */
  softLimits?: string[];
  /** Explicit local admin role; required together with an unlocked vault for /admin. */
  isLocalAdmin?: boolean;
  pronouns?: string;
  experienceLevel?: ExperienceLevel;
  notes?: string;
  baseResponses?: ActivityResponse[];
  createdSessionIds?: string[];
  receivedSessionIds?: string[];
  fetishBadges?: FetishBadge[];
  safetyProtocols?: ('SSC' | 'RACK' | 'PRICK')[];
  safewords?: { green?: string; yellow?: string; red?: string };
  verificationBadges?: string[];
  role?: 'Dom' | 'Sub' | 'Switch' | 'Top' | 'Bottom' | 'Master' | 'Slave' | 'Rigger' | string;
  fetlifeHandle?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  /** Supabase Auth user id (Google / email). Not a vault key — identity only. */
  supabaseUserId?: string;
}

export type SessionStatus = 'draft' | 'waiting' | 'complete';

export interface Session {
  id: string;
  inviteCode: string;
  initiatorToken: string;
  /**
   * High-entropy invite secret (URL fragment/query). Used to wrap/unwrap the session DEK.
   * Kept client-side / in the invite link — not sent as plaintext payload to the server when remote.
   */
  inviteSecret?: string;
  /** Raw DEK (base64) held in memory / local store for initiator decrypt — never upload raw. */
  sessionDekB64?: string;
  /** DEK wrapped with inviteSecret for guest encryption (server may store this opaque blob). */
  dekWrapInvite?: string;
  /** Opaque ciphertext of initiator profile+responses (remote ZK). */
  initiatorCiphertext?: string;
  /** Opaque ciphertext of guest profile+responses (remote ZK). */
  guestCiphertext?: string;
  initiatorNickname?: string;
  guestNickname?: string;
  initiatorProfile?: UserProfile;
  guestProfile?: UserProfile;
  initiatorResponses: ActivityResponse[];
  guestResponses: ActivityResponse[] | null;
  status: SessionStatus;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string; // ISO string — undefined means no expiration
}

export interface GuestProfile {
  nickname: string;
  notes: string;
}

export type ReportSectionType =
  | 'mutual_match'
  | 'explore_together'
  | 'initiator_only'
  | 'guest_only'
  | 'hard_limit_conflict'
  | 'role_mismatch';

export interface ReportItem {
  activityId: string;
  activityName: string;
  category: ActivityCategory;
  section: ReportSectionType;
  initiatorRating: Rating;
  guestRating: Rating;
  initiatorRole: RolePreference;
  guestRole: RolePreference;
  initiatorIntensity: number;
  guestIntensity: number;
  conversationPrompt?: string;
}

export interface CompatibilityReport {
  sessionId: string;
  generatedAt: string;
  compatibilityScore: number;
  mutualMatchCount: number;
  exploreCount: number;
  conflictCount: number;
  items: ReportItem[];
  conversationOrder: string[];
  initiatorCompass: { x: number; y: number };
  guestCompass: { x: number; y: number };
  initiatorArchetype: string;
  guestArchetype: string;
  categoryCompatibilities: Record<string, number>;
  overlapStats: {
    initiatorOnlyCount: number;
    guestOnlyCount: number;
    sharedCount: number;
  };
  initiatorProfile?: UserProfile;
  guestProfile?: UserProfile;
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Principiante / Curioso',
  intermediate: 'Intermedio / Experimentado',
  advanced: 'Avanzado / Experto',
};

export const RATING_LABELS: Record<Rating, string> = {
  hard_limit: 'Límite duro',
  not_interested: 'No me interesa',
  curious: 'Curiosidad',
  like: 'Me gusta',
  love: 'Me encanta',
};

export const RATING_VALUES: Record<Rating, number> = {
  hard_limit: -2,
  not_interested: -1,
  curious: 0,
  like: 1,
  love: 2,
};

export const ROLE_LABELS: Record<RolePreference, string> = {
  give: 'Dar / Dominar',
  receive: 'Recibir / Sumiso',
  both: 'Ambos',
  flexible: 'Flexible',
};

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  power_exchange: 'Intercambio de poder',
  bondage: 'Ataduras',
  impact: 'Impacto',
  sensation: 'Sensaciones',
  psychological: 'Psicológico',
  service: 'Servicio',
  exhibition: 'Exhibición',
  intimacy: 'Intimidad',
  aftercare: 'Aftercare',
  roleplay: 'Juegos de rol',
  toys_gear: 'Juguetes y equipo',
  lifestyle: 'Estilo de vida',
};

export const CATEGORY_EMOJIS: Record<ActivityCategory, string> = {
  power_exchange: '⚡',
  bondage: '🪢',
  impact: '🖐️',
  sensation: '🪷',
  psychological: '🧠',
  service: '🫡',
  exhibition: '👁️',
  intimacy: '💖',
  aftercare: '🫂',
  roleplay: '🎭',
  toys_gear: '🧸',
  lifestyle: '🌙',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, { label: string; emoji: string; color: string }> = {
  beginner: { label: 'Principiante', emoji: '🌱', color: '#4ade80' },
  intermediate: { label: 'Intermedio', emoji: '🔥', color: '#fbbf24' },
  advanced: { label: 'Avanzado', emoji: '⚡', color: '#f87171' },
};

export const SECTION_LABELS: Record<ReportSectionType, string> = {
  mutual_match: 'Match mutuo',
  explore_together: 'Explorar juntos',
  initiator_only: 'Solo tus intereses',
  guest_only: 'Intereses del invitado',
  hard_limit_conflict: 'Conflicto de límites',
  role_mismatch: 'Desalineación de roles',
};

export const SECTION_DESCRIPTIONS: Record<ReportSectionType, string> = {
  mutual_match: 'Ambos mostráis interés positivo. Buen punto de partida.',
  explore_together: 'Hay curiosidad compatible. Vale la pena conversarlo.',
  initiator_only: 'Te interesa pero no a ellos. Solo visible para ti.',
  guest_only: 'Les interesa y tú no marcaste interés. Revisa si te apetece explorar.',
  hard_limit_conflict: 'Hay un límite duro involucrado. Requiere respeto absoluto.',
  role_mismatch: 'Interés mutuo pero roles o intensidad distintos.',
};

export interface SceneAgreement {
  id: string;
  sessionId: string;
  activityId: string;
  activityName: string;
  safewordGreen: string;
  safewordYellow: string;
  safewordRed: string;
  nonVerbalSignal?: string;
  durationLimit?: string;
  agreedLimits?: string;
  equipmentChecklist?: string[];
  aftercarePlan?: string[];
  createdAt: string;
}
