import { readJsonStorage, writeJsonStorage } from './cryptoVault';
import { addXpToPartnerLink } from './partnerJournal';

export type EphemeralTimer = 'none' | 'read_once' | '10s' | '1m' | '5m';

export const EPHEMERAL_TIMER_LABELS: Record<EphemeralTimer, { label: string; emoji: string }> = {
  none: { label: 'Permanente Cifrado', emoji: '♾️' },
  read_once: { label: '1 Sola Vista', emoji: '👁️' },
  '10s': { label: '10 segundos', emoji: '⚡' },
  '1m': { label: '1 minuto', emoji: '⏱️' },
  '5m': { label: '5 minutos', emoji: '⌛' },
};

export type MessageType = 'text' | 'challenge' | 'debrief_note';

export interface ChatMessage {
  id: string;
  partnerLinkId: string;
  senderName: string;
  isSelf: boolean;
  content: string;
  type: MessageType;
  ephemeralTimer: EphemeralTimer;
  timestamp: string;
  readAt?: string;
  expiresAt?: string;
  isRead?: boolean;
  isRevealed?: boolean;
  challengeData?: {
    title: string;
    xpReward: number;
    completed?: boolean;
  };
}

const CHAT_STORAGE_KEY = 'partner_chat_messages_v1';

const DEFAULT_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    partnerLinkId: 'default',
    senderName: 'Nox',
    isSelf: false,
    content: '¡Bienvenido/a al Chat Cifrado Efímero de Pareja! 🔒 Todo el canal está protegido con cifrado AES-GCM local.',
    type: 'text',
    ephemeralTimer: 'none',
    timestamp: new Date().toISOString(),
    isRead: true,
  },
  {
    id: 'msg-welcome-2',
    partnerLinkId: 'default',
    senderName: 'Nox',
    isSelf: false,
    content: 'Puedes activar el temporizador 👁️ "1 Sola Vista" o ⚡ "10s" para enviar mensajes efímeros que se autodestruyen al leerse.',
    type: 'text',
    ephemeralTimer: 'none',
    timestamp: new Date().toISOString(),
    isRead: true,
  },
];

export async function getPartnerMessages(partnerLinkId: string): Promise<ChatMessage[]> {
  let all = await readJsonStorage<ChatMessage[]>(CHAT_STORAGE_KEY, DEFAULT_WELCOME_MESSAGES);
  const now = Date.now();

  // Filter out expired messages
  const valid = all.filter((msg) => {
    if (msg.expiresAt && new Date(msg.expiresAt).getTime() <= now) {
      return false;
    }
    return true;
  });

  if (valid.length !== all.length) {
    await writeJsonStorage(CHAT_STORAGE_KEY, valid);
  }

  return valid.filter((m) => m.partnerLinkId === partnerLinkId || m.partnerLinkId === 'default');
}

export async function sendPartnerMessage(
  partnerLinkId: string,
  senderName: string,
  content: string,
  ephemeralTimer: EphemeralTimer = 'none',
  type: MessageType = 'text',
  challengeData?: ChatMessage['challengeData']
): Promise<ChatMessage> {
  const all = await readJsonStorage<ChatMessage[]>(CHAT_STORAGE_KEY, DEFAULT_WELCOME_MESSAGES);

  const newMsg: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerLinkId,
    senderName,
    isSelf: true,
    content: content.trim(),
    type,
    ephemeralTimer,
    timestamp: new Date().toISOString(),
    isRead: false,
    challengeData,
  };

  const updated = [...all, newMsg];
  await writeJsonStorage(CHAT_STORAGE_KEY, updated);
  return newMsg;
}

export async function revealOrReadMessage(messageId: string): Promise<ChatMessage | null> {
  const all = await readJsonStorage<ChatMessage[]>(CHAT_STORAGE_KEY, DEFAULT_WELCOME_MESSAGES);
  const target = all.find((m) => m.id === messageId);
  if (!target) return null;

  const now = new Date();
  target.isRead = true;
  target.isRevealed = true;
  target.readAt = now.toISOString();

  // Set expiration timestamp based on timer
  if (target.ephemeralTimer === '10s') {
    target.expiresAt = new Date(now.getTime() + 10 * 1000).toISOString();
  } else if (target.ephemeralTimer === '1m') {
    target.expiresAt = new Date(now.getTime() + 60 * 1000).toISOString();
  } else if (target.ephemeralTimer === '5m') {
    target.expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
  } else if (target.ephemeralTimer === 'read_once') {
    // Autodestruct immediately after 2 seconds
    target.expiresAt = new Date(now.getTime() + 2 * 1000).toISOString();
  }

  await writeJsonStorage(CHAT_STORAGE_KEY, all);
  return target;
}

export async function acceptChatChallenge(messageId: string): Promise<boolean> {
  const all = await readJsonStorage<ChatMessage[]>(CHAT_STORAGE_KEY, DEFAULT_WELCOME_MESSAGES);
  const msg = all.find((m) => m.id === messageId);
  if (!msg || !msg.challengeData || msg.challengeData.completed) return false;

  msg.challengeData.completed = true;
  await writeJsonStorage(CHAT_STORAGE_KEY, all);

  // Award XP to the partner link
  await addXpToPartnerLink(msg.partnerLinkId, msg.challengeData.xpReward);
  return true;
}
