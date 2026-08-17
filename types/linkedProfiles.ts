export type RelationshipType = 'monogamous' | 'poly_hinge' | 'poly_triad' | 'play_partners' | 'dom_sub' | 'explorers';

export interface PartnerPairingToken {
  pairingCode: string; // 8 chars uppercase alphanumeric (e.g. PAIR-9X4K)
  tokenSecret: string; // CSPRNG secret for DEK wrap
  initiatorNickname: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO (15 min window)
  status: 'pending' | 'paired' | 'expired';
}

export interface LinkedProfileLink {
  id: string;
  primaryNickname: string;
  partnerNickname: string;
  relationshipType: RelationshipType;
  pairedAt: string; // ISO
  isIncognito: boolean; // Solo mode toggle
  jointVaultKeyWrapped: string; // DEK wrapped with Vault Master Key
  sharedSessionIds: string[];
}

export interface JointWishlistItem {
  activityId: string;
  activityName: string;
  category: string;
  addedBy: string;
  addedAt: string;
  note?: string;
}

export interface JointSceneSummary {
  id: string;
  sessionId: string;
  title: string;
  date: string;
  status: 'draft' | 'agreed' | 'completed';
}

export interface JointVaultData {
  linkId: string;
  partnerANickname: string;
  partnerBNickname: string;
  jointWishlist: JointWishlistItem[];
  jointSceneAgreements: JointSceneSummary[];
  sharedNotes?: string;
  jointCompatibilityScore?: number;
  lastSyncedAt: string; // ISO
}
