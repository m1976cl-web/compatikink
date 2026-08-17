export interface WildComment {
  id: string;
  postId: string;
  authorNickname: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

export interface WildPost {
  id: string;
  authorNickname: string;
  isAnonymous: boolean;
  title: string;
  caption?: string;
  mediaUri: string;
  mediaType: 'photo' | 'video';
  createdAt: string;
  comments: WildComment[];
  comparisonRequestsCount?: number;
  reportedBy?: string[];
  isBlocked?: boolean;
}

export interface SafetyComplianceCheck {
  acceptedTerms: boolean;
  acceptedAt?: string;
  userIpOrSessionHash?: string;
}
