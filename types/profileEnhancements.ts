export type MediaPrivacyLevel = 'public' | 'friends_only' | 'authorized_only' | 'private_vault';

export interface AuthorizedMediaItem {
  id: string;
  ownerNickname: string;
  title: string;
  mediaType: 'photo' | 'video';
  uri: string;
  thumbnailUri?: string;
  isPrivateVault: boolean;
  privacyLevel?: MediaPrivacyLevel;
  authorizedTargetNicknames: string[];
  createdAt: string;
}

export interface CrushRecord {
  id: string;
  userNickname: string;
  targetNickname: string;
  createdAt: string;
  isMutualMatch?: boolean;
}

export interface VirtualIcebreakerPrompt {
  id: string;
  category: 'vulnerability' | 'fantasies' | 'boundaries' | 'aftercare' | 'playful';
  question: string;
  followUpPrompt?: string;
}

export interface VirtualDateSession {
  id: string;
  initiatorNickname: string;
  partnerNickname: string;
  createdAt: string;
  status: 'active' | 'completed' | 'safeword_paused';
  currentSafeword: 'green' | 'yellow' | 'red';
  currentStepIndex: number;
}
