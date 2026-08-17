import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface EphemeralWish {
  id: string;
  authorNickname: string;
  category: 'Sensual' | 'Impacto' | 'Shibari' | 'Fantasía' | 'Aftercare' | 'Juego de Rol';
  wishText: string;
  expiresAt: string; // ISO string 24h from creation
  createdAt: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'accepted' | 'expired';
  acceptedByNickname?: string;
  acceptedAt?: string;
}

const STORAGE_KEY_EPHEMERAL_WISHES = 'ephemeral_wishes_v1';

export const INITIAL_EPHEMERAL_WISHES: EphemeralWish[] = [
  {
    id: 'wish_demo_1',
    authorNickname: 'Valeria_Latex',
    category: 'Shibari',
    wishText: 'Deseo ensayar una suspensión baja en piso con cuerdas de yute y check-in cada 5 min.',
    intensity: 3,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'wish_demo_2',
    authorNickname: 'Sir_Nicholas',
    category: 'Juego de Rol',
    wishText: 'Propongo negociación de protocolo D/s de 15 min enfocada en disciplina de atención.',
    intensity: 4,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'wish_demo_3',
    authorNickname: 'Alex_Kink',
    category: 'Sensual',
    wishText: 'Busco sesión de masajes sensoriales con velas tibias y antifaz en ambiente tenue.',
    intensity: 2,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    status: 'active',
  },
];

export async function loadEphemeralWishes(): Promise<EphemeralWish[]> {
  const wishes = await readJsonStorage<EphemeralWish[]>(STORAGE_KEY_EPHEMERAL_WISHES, INITIAL_EPHEMERAL_WISHES);
  const now = new Date().toISOString();

  // Auto-expire items past 24h
  const activeWishes = (wishes || []).map((w) => {
    if (w.expiresAt < now && w.status === 'active') {
      return { ...w, status: 'expired' as const };
    }
    return w;
  });

  return activeWishes;
}

export async function createEphemeralWish(
  authorNickname: string,
  category: EphemeralWish['category'],
  wishText: string,
  intensity: 1 | 2 | 3 | 4 | 5
): Promise<EphemeralWish[]> {
  const current = await loadEphemeralWishes();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 3600 * 1000);

  const newWish: EphemeralWish = {
    id: `wish_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    authorNickname: authorNickname || 'Anónimo',
    category,
    wishText: wishText.trim(),
    intensity,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: 'active',
  };

  const updated = [newWish, ...current];
  await writeJsonStorage(STORAGE_KEY_EPHEMERAL_WISHES, updated);
  return updated;
}

export async function acceptEphemeralWish(wishId: string, acceptorNickname: string): Promise<EphemeralWish[]> {
  const current = await loadEphemeralWishes();
  const updated = current.map((w) => {
    if (w.id === wishId && w.status === 'active') {
      return {
        ...w,
        status: 'accepted' as const,
        acceptedByNickname: acceptorNickname,
        acceptedAt: new Date().toISOString(),
      };
    }
    return w;
  });
  await writeJsonStorage(STORAGE_KEY_EPHEMERAL_WISHES, updated);
  return updated;
}
