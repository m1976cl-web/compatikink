import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export type RelationshipType =
  | 'pareja'
  | 'amigo_juego'
  | 'amo_dom'
  | 'sumiso_sub'
  | 'poliamor_vinculo';

export const RELATIONSHIP_LABELS: Record<RelationshipType, { label: string; emoji: string }> = {
  pareja: { label: 'Pareja', emoji: '💍' },
  amigo_juego: { label: 'Amigo/a de Juego', emoji: '🎭' },
  amo_dom: { label: 'Amo(a) / Dom', emoji: '👑' },
  sumiso_sub: { label: 'Sumiso(a) / Sub', emoji: '🧎' },
  poliamor_vinculo: { label: 'Vínculo Poliamoroso', emoji: '💎' },
};

export interface PartnerLink {
  id: string;
  partnerName: string;
  relationshipType: RelationshipType;
  linkedSince: string;
  totalXp: number;
  level: number;
  notes?: string;
}

export interface SessionJournalEntry {
  id: string;
  partnerLinkId: string;
  partnerName: string;
  date: string;
  title: string;
  activitiesDone: string[];
  gearUsed: string[];
  safewordUsed: 'ninguna' | 'verde' | 'amarillo' | 'rojo';
  subspaceLevel: 1 | 2 | 3 | 4 | 5;
  aftercareRating: 1 | 2 | 3 | 4 | 5;
  overallRating: 1 | 2 | 3 | 4 | 5;
  debriefNotes: string;
}

export interface PartnerChallenge {
  id: string;
  partnerLinkId: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
}

export interface PartnerReward {
  id: string;
  partnerLinkId: string;
  title: string;
  xpCost: number;
  redeemed: boolean;
  redeemedAt?: string;
}

export interface KinkDiploma {
  id: string;
  title: string;
  recipientName: string;
  issuerName: string;
  practiceCategory: string;
  issueDate: string;
  sealEmoji: string;
  description: string;
}

const PARTNER_LINKS_KEY = 'partner_links_v1';
const SESSION_JOURNAL_KEY = 'session_journal_v1';
const CHALLENGES_KEY = 'partner_challenges_v1';
const REWARDS_KEY = 'partner_rewards_v1';
const DIPLOMAS_KEY = 'kink_diplomas_v1';

// ─── PARTNER LINKS ─────────────────────────────────────────────────────────

export async function getPartnerLinks(): Promise<PartnerLink[]> {
  return readJsonStorage<PartnerLink[]>(PARTNER_LINKS_KEY, []);
}

export async function addPartnerLink(
  partnerName: string,
  relationshipType: RelationshipType,
  notes?: string
): Promise<PartnerLink> {
  const links = await getPartnerLinks();
  const newLink: PartnerLink = {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerName,
    relationshipType,
    linkedSince: new Date().toISOString(),
    totalXp: 100, // Starting bonus
    level: 1,
    notes,
  };
  const updated = [newLink, ...links];
  await writeJsonStorage(PARTNER_LINKS_KEY, updated);
  return newLink;
}

// ─── SESSION JOURNAL & DEBRIEFING ──────────────────────────────────────────

export async function getJournalEntries(partnerLinkId?: string): Promise<SessionJournalEntry[]> {
  const all = await readJsonStorage<SessionJournalEntry[]>(SESSION_JOURNAL_KEY, []);
  if (partnerLinkId) {
    return all.filter((e) => e.partnerLinkId === partnerLinkId);
  }
  return all;
}

export async function addJournalEntry(entry: Omit<SessionJournalEntry, 'id' | 'date'>): Promise<SessionJournalEntry> {
  const all = await getJournalEntries();
  const newEntry: SessionJournalEntry = {
    ...entry,
    id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
  };
  const updated = [newEntry, ...all];
  await writeJsonStorage(SESSION_JOURNAL_KEY, updated);

  // Award XP to partner link (+50 XP per logged session)
  await addXpToPartnerLink(entry.partnerLinkId, 50);

  return newEntry;
}

// ─── CHALLENGES & REWARDS (XP ECONOMY) ────────────────────────────────────

export async function getChallenges(partnerLinkId: string): Promise<PartnerChallenge[]> {
  const all = await readJsonStorage<PartnerChallenge[]>(CHALLENGES_KEY, []);
  return all.filter((c) => c.partnerLinkId === partnerLinkId);
}

export async function createChallenge(
  partnerLinkId: string,
  title: string,
  description: string,
  xpReward = 100
): Promise<PartnerChallenge> {
  const all = await readJsonStorage<PartnerChallenge[]>(CHALLENGES_KEY, []);
  const newChallenge: PartnerChallenge = {
    id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerLinkId,
    title,
    description,
    xpReward,
    completed: false,
  };
  const updated = [newChallenge, ...all];
  await writeJsonStorage(CHALLENGES_KEY, updated);
  return newChallenge;
}

export async function completeChallenge(challengeId: string): Promise<void> {
  const all = await readJsonStorage<PartnerChallenge[]>(CHALLENGES_KEY, []);
  const target = all.find((c) => c.id === challengeId);
  if (!target || target.completed) return;

  target.completed = true;
  target.completedAt = new Date().toISOString();
  await writeJsonStorage(CHALLENGES_KEY, all);

  // Award XP to partner link
  await addXpToPartnerLink(target.partnerLinkId, target.xpReward);
}

export async function addXpToPartnerLink(partnerLinkId: string, xpAmount: number): Promise<void> {
  const links = await getPartnerLinks();
  const link = links.find((l) => l.id === partnerLinkId);
  if (!link) return;

  link.totalXp += xpAmount;
  link.level = Math.floor(link.totalXp / 200) + 1;
  await writeJsonStorage(PARTNER_LINKS_KEY, links);
}

export async function getRewards(partnerLinkId: string): Promise<PartnerReward[]> {
  const all = await readJsonStorage<PartnerReward[]>(REWARDS_KEY, []);
  return all.filter((r) => r.partnerLinkId === partnerLinkId);
}

export async function createReward(
  partnerLinkId: string,
  title: string,
  xpCost: number
): Promise<PartnerReward> {
  const all = await readJsonStorage<PartnerReward[]>(REWARDS_KEY, []);
  const newReward: PartnerReward = {
    id: `rew-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    partnerLinkId,
    title,
    xpCost,
    redeemed: false,
  };
  const updated = [newReward, ...all];
  await writeJsonStorage(REWARDS_KEY, updated);
  return newReward;
}

export async function redeemReward(rewardId: string): Promise<boolean> {
  const all = await readJsonStorage<PartnerReward[]>(REWARDS_KEY, []);
  const reward = all.find((r) => r.id === rewardId);
  if (!reward || reward.redeemed) return false;

  const links = await getPartnerLinks();
  const link = links.find((l) => l.id === reward.partnerLinkId);
  if (!link || link.totalXp < reward.xpCost) return false;

  // Deduct XP and mark redeemed
  link.totalXp -= reward.xpCost;
  reward.redeemed = true;
  reward.redeemedAt = new Date().toISOString();

  await writeJsonStorage(PARTNER_LINKS_KEY, links);
  await writeJsonStorage(REWARDS_KEY, all);
  return true;
}

// ─── DIPLOMAS & CERTIFICATES ───────────────────────────────────────────────

const DEFAULT_DIPLOMAS: KinkDiploma[] = [
  {
    id: 'dip-1',
    title: 'Diploma de Comunicación & Consentimiento Consciente',
    recipientName: 'Alex',
    issuerName: 'Compatikink Academy',
    practiceCategory: 'Consentimiento & SSC',
    issueDate: new Date().toISOString(),
    sealEmoji: '📜',
    description: 'Otorgado por demostrar maestría en negociación de límites, uso de safewords y acuerdos claros previa escena.',
  },
  {
    id: 'dip-2',
    title: 'Certificado de Excelencia en Shibari & Ataduras Seguras',
    recipientName: 'Alex',
    issuerName: 'Compatikink Academy',
    practiceCategory: 'Bondage & Cuerdas',
    issueDate: new Date().toISOString(),
    sealEmoji: '🪢',
    description: 'Reconocimiento por completar 10 sesiones de cuerdas respetando la circulación, nervios y el bienestar del bunny.',
  },
];

export async function getDiplomas(): Promise<KinkDiploma[]> {
  const diplomas = await readJsonStorage<KinkDiploma[] | null>(DIPLOMAS_KEY, null);
  return diplomas ?? DEFAULT_DIPLOMAS;
}

export async function addDiploma(
  title: string,
  recipientName: string,
  practiceCategory: string,
  description: string,
  sealEmoji = '🏆'
): Promise<KinkDiploma> {
  const diplomas = await getDiplomas();
  const newDip: KinkDiploma = {
    id: `dip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    recipientName,
    issuerName: 'Compatikink Academy',
    practiceCategory,
    issueDate: new Date().toISOString(),
    sealEmoji,
    description,
  };
  const updated = [newDip, ...diplomas];
  await writeJsonStorage(DIPLOMAS_KEY, updated);
  return newDip;
}
