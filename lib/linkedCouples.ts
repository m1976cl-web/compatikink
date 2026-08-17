import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface LinkedCoupleProfile {
  coupleId: string;
  partner1Nickname: string;
  partner1Role: string;
  partner2Nickname: string;
  partner2Role: string;
  coupleName: string;
  relationshipType: 'Poliamoroso' | 'Pareja Swinger' | 'Trío Abierto' | 'D/s Dinámica' | 'Exploración Curiosa';
  sharedAgreements: string[];
  isVerified: boolean;
  linkedAt: string;
  jointHardLimits: string[];
}

const STORAGE_KEY_LINKED_COUPLE = 'linked_couple_profile_v1';

export const DEFAULT_LINKED_COUPLE: LinkedCoupleProfile = {
  coupleId: 'couple_demo_01',
  partner1Nickname: 'Valeria_Dominant',
  partner1Role: 'Dominante / Top 👑',
  partner2Nickname: 'Marco_Sub',
  partner2Role: 'Sumiso / Bottom 🧎',
  coupleName: 'Dúo Obsidian & Velvet',
  relationshipType: 'D/s Dinámica',
  sharedAgreements: [
    'Consentimiento explícito dual antes de añadir 3ros a la sesión',
    'Palabra de seguridad global "ROJO" detiene toda la escena de inmediato',
    'Aftercare obligatorio de 20 minutos al finalizar cualquier encuentro',
  ],
  isVerified: true,
  linkedAt: new Date().toISOString(),
  jointHardLimits: ['Sin marcas permanentes', 'No drogas / sustancias', 'Sin juegos sin notificación previa'],
};

export async function getLinkedCoupleProfile(): Promise<LinkedCoupleProfile | null> {
  return await readJsonStorage<LinkedCoupleProfile | null>(STORAGE_KEY_LINKED_COUPLE, DEFAULT_LINKED_COUPLE);
}

export async function saveLinkedCoupleProfile(profile: LinkedCoupleProfile): Promise<void> {
  await writeJsonStorage(STORAGE_KEY_LINKED_COUPLE, profile);
}

export async function updateSharedAgreements(agreements: string[]): Promise<LinkedCoupleProfile> {
  const current = (await getLinkedCoupleProfile()) || DEFAULT_LINKED_COUPLE;
  const updated = { ...current, sharedAgreements: agreements };
  await saveLinkedCoupleProfile(updated);
  return updated;
}
