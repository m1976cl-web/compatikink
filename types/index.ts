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
  | 'aftercare';

export interface Activity {
  id: string;
  category: ActivityCategory;
  name: string;
  description: string;
}

export interface ActivityResponse {
  activityId: string;
  rating: Rating;
  role: RolePreference;
  intensity: 1 | 2 | 3 | 4 | 5;
  privateNote?: string;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  nickname: string;
  pin?: string;
  pronouns?: string;
  experienceLevel?: ExperienceLevel;
  notes?: string;
  baseResponses?: ActivityResponse[];
  createdSessionIds?: string[];
  receivedSessionIds?: string[];
}

export type SessionStatus = 'draft' | 'waiting' | 'complete';

export interface Session {
  id: string;
  inviteCode: string;
  initiatorToken: string;
  initiatorNickname?: string;
  guestNickname?: string;
  initiatorProfile?: UserProfile;
  guestProfile?: UserProfile;
  initiatorResponses: ActivityResponse[];
  guestResponses: ActivityResponse[] | null;
  status: SessionStatus;
  createdAt: string;
  completedAt?: string;
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
