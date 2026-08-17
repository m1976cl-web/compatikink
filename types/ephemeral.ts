export type EphemeralWishCategory = 'fantasy' | 'scene_partner' | 'advice' | 'gear' | 'event' | 'spontaneous';
export type EphemeralWishStatus = 'active' | 'expired' | 'fulfilled' | 'cancelled';

export interface EphemeralWish {
  id: string;
  creatorNickname: string;
  title: string;
  content: string;
  category: EphemeralWishCategory;
  tags: string[];
  ttlHours: number; // default 24
  createdAt: string; // ISO
  expiresAt: string; // ISO (createdAt + ttlHours)
  status: EphemeralWishStatus;
  replyCount: number;
  incognito: boolean;
}

export interface EphemeralChatMessage {
  id: string;
  threadId: string;
  senderNickname: string;
  recipientNickname: string;
  textCiphertext: string; // ck1: sealed string
  textPlaintext?: string; // RAM-only decrypted preview
  timestamp: string; // ISO
  expiresAt: string; // ISO
  readAt?: string; // ISO
  selfDestructAfterReadSec?: number;
}

export interface EphemeralChatThread {
  id: string;
  wishId?: string;
  wishTitle?: string;
  participants: string[]; // Array of nicknames
  createdAt: string; // ISO
  expiresAt: string; // ISO
  lastMessageAt: string; // ISO
  messageCount: number;
  unreadCount: number;
}
