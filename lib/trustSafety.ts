import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { triggerSuccessHaptic, triggerWarningHaptic } from '@/lib/haptics';

export type ReportReasonCategory =
  | 'harassment'
  | 'non_consensual'
  | 'underage_risk'
  | 'spam_fraud'
  | 'impersonation'
  | 'other';

export type ReportTargetType = 'user' | 'post' | 'message';

export interface ModerationReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorName?: string;
  targetPreviewText?: string;
  reasonCategory: ReportReasonCategory;
  description?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
}

export interface BlockedUser {
  userId: string;
  userNickname: string;
  blockedAt: string;
  reason?: string;
}

export const REPORT_REASON_LABELS: Record<
  ReportReasonCategory,
  { label: string; emoji: string; description: string }
> = {
  harassment: {
    label: 'Acoso u Hostigamiento',
    emoji: '🚫',
    description: 'Comportamiento intimidante, insistente o agresivo sin consentimiento.',
  },
  non_consensual: {
    label: 'Violación de Límites / No-Consent',
    emoji: '🛑',
    description: 'Transgresión de hard limits acordados o difusión no consentida.',
  },
  underage_risk: {
    label: 'Menor de 18 Años (Tolerancia Cero)',
    emoji: '🔞',
    description: 'Presencia o sospecha de usuarios menores de edad.',
  },
  spam_fraud: {
    label: 'Spam, Estafa o Publicidad',
    emoji: '⚠️',
    description: 'Mensajes masivos, links sospechosos o venta comercial no autorizada.',
  },
  impersonation: {
    label: 'Suplantación de Identidad',
    emoji: '🎭',
    description: 'Perfiles falsos o uso de fotografías de terceros.',
  },
  other: {
    label: 'Otro Motivo de Seguridad',
    emoji: '🛡️',
    description: 'Cualquier otra vulneración a los principios éticos de la comunidad.',
  },
};

const BLOCKED_USERS_KEY = 'user_blocked_identities_v1';
const MODERATION_REPORTS_KEY = 'moderation_reports_v1';

/**
 * Retrieves all blocked users for the current device/profile.
 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  return readJsonStorage<BlockedUser[]>(BLOCKED_USERS_KEY, []);
}

/**
 * Checks if a specific user (by ID or Nickname) is currently blocked.
 */
export async function isUserBlocked(userIdOrNick: string): Promise<boolean> {
  if (!userIdOrNick) return false;
  const list = await getBlockedUsers();
  const query = userIdOrNick.toLowerCase().trim();
  return list.some(
    (b) =>
      b.userId.toLowerCase() === query ||
      b.userNickname.toLowerCase().trim() === query
  );
}

/**
 * Adds a user to the blocked list (Mutual Block).
 */
export async function blockUser(target: {
  id: string;
  nickname: string;
  reason?: string;
}): Promise<BlockedUser[]> {
  const current = await getBlockedUsers();
  const normalizedNick = target.nickname.trim();
  const exists = current.some(
    (b) =>
      b.userId === target.id ||
      b.userNickname.toLowerCase() === normalizedNick.toLowerCase()
  );

  if (exists) return current;

  const newEntry: BlockedUser = {
    userId: target.id,
    userNickname: normalizedNick,
    blockedAt: new Date().toISOString(),
    reason: target.reason,
  };

  const updated = [newEntry, ...current];
  await writeJsonStorage(BLOCKED_USERS_KEY, updated);
  triggerWarningHaptic();
  return updated;
}

/**
 * Removes a user from the blocked list.
 */
export async function unblockUser(userIdOrNick: string): Promise<BlockedUser[]> {
  const current = await getBlockedUsers();
  const query = userIdOrNick.toLowerCase().trim();
  const updated = current.filter(
    (b) =>
      b.userId.toLowerCase() !== query &&
      b.userNickname.toLowerCase().trim() !== query
  );
  await writeJsonStorage(BLOCKED_USERS_KEY, updated);
  triggerSuccessHaptic();
  return updated;
}

/**
 * Helper to filter out items authored or belonging to blocked users.
 */
export function filterBlockedItems<T extends { author?: string; nickname?: string; name?: string; userId?: string; id?: string }>(
  items: T[],
  blockedList: BlockedUser[]
): T[] {
  if (!blockedList || blockedList.length === 0) return items;
  const blockedIdentifiers = new Set(
    blockedList.flatMap((b) => [
      b.userId.toLowerCase(),
      b.userNickname.toLowerCase().trim(),
    ])
  );

  return items.filter((item) => {
    const author = item.author?.toLowerCase().trim();
    const nick = item.nickname?.toLowerCase().trim();
    const name = item.name?.toLowerCase().trim();
    const userId = item.userId?.toLowerCase().trim();
    const id = item.id?.toLowerCase().trim();

    if (author && blockedIdentifiers.has(author)) return false;
    if (nick && blockedIdentifiers.has(nick)) return false;
    if (name && blockedIdentifiers.has(name)) return false;
    if (userId && blockedIdentifiers.has(userId)) return false;
    if (id && blockedIdentifiers.has(id)) return false;

    return true;
  });
}

/**
 * Retrieves all moderation reports.
 */
export async function getModerationReports(): Promise<ModerationReport[]> {
  return readJsonStorage<ModerationReport[]>(MODERATION_REPORTS_KEY, []);
}

/**
 * Creates and stores a new moderation report.
 */
export async function createModerationReport(
  reportData: Omit<ModerationReport, 'id' | 'createdAt' | 'status'>
): Promise<ModerationReport> {
  const current = await getModerationReports();
  const newReport: ModerationReport = {
    ...reportData,
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const updated = [newReport, ...current];
  await writeJsonStorage(MODERATION_REPORTS_KEY, updated);
  triggerSuccessHaptic();
  return newReport;
}

/**
 * Updates status of a moderation report (for Admin Panel).
 */
export async function updateReportStatus(
  reportId: string,
  status: ModerationReport['status']
): Promise<ModerationReport[]> {
  const current = await getModerationReports();
  const updated = current.map((r) =>
    r.id === reportId ? { ...r, status } : r
  );
  await writeJsonStorage(MODERATION_REPORTS_KEY, updated);
  return updated;
}
