import { readJsonStorage, writeJsonStorage } from './cryptoVault';

export type BluePlatform =
  | 'OnlyFans'
  | 'Fansly'
  | 'Arsmate'
  | 'Patreon'
  | 'LoyalFans'
  | 'JustForFans'
  | 'Otro';

export const PLATFORM_INFO: Record<BluePlatform, { label: string; emoji: string; color: string }> = {
  OnlyFans: { label: 'OnlyFans', emoji: '💙', color: '#00aff0' },
  Fansly: { label: 'Fansly', emoji: '🩵', color: '#00a8ff' },
  Arsmate: { label: 'Arsmate', emoji: '🔥', color: '#ff4757' },
  Patreon: { label: 'Patreon', emoji: '🧡', color: '#ff424d' },
  LoyalFans: { label: 'LoyalFans', emoji: '💎', color: '#9b59b6' },
  JustForFans: { label: 'JustForFans', emoji: '⭐', color: '#f1c40f' },
  Otro: { label: 'Sitio Web / Canal', emoji: '🌐', color: '#c084fc' },
};

export interface CreatorPromo {
  id: string;
  creatorName: string;
  handle: string;
  avatarEmoji: string;
  platform: BluePlatform;
  profileUrl: string;
  bio: string;
  fetishTags: string[];
  promoDiscount?: string;
  likesCount: number;
  verified: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'blue_pages_promos_v1';

const DEFAULT_CREATORS: CreatorPromo[] = [
  {
    id: 'promo-1',
    creatorName: 'Mistress Roxana',
    handle: '@MistressRox',
    avatarEmoji: '👑',
    platform: 'OnlyFans',
    profileUrl: 'https://onlyfans.com',
    bio: 'Dominación refinada, estética de látex negro, Shibari artístico y contenido exclusivo semanal.',
    fetishTags: ['Dominación', 'Látex', 'Shibari', 'High Heels'],
    promoDiscount: '🔥 30% OFF en suscripción mensual',
    likesCount: 142,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'promo-2',
    creatorName: 'KinkBunny Velvet',
    handle: '@VelvetBunny',
    avatarEmoji: '🐰',
    platform: 'Fansly',
    profileUrl: 'https://fansly.com',
    bio: 'Sesiones de ataduras, cosplay erótico fetichista y fotos de arnés de cuero de alta calidad.',
    fetishTags: ['Rope Bunny', 'Cosplay Kink', 'Arnés', 'ASMR'],
    promoDiscount: '🎁 Regalo sorpresa al enviar un DM',
    likesCount: 98,
    verified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'promo-3',
    creatorName: 'Dominic & Alexis',
    handle: '@DnA_KinkPair',
    avatarEmoji: '🎭',
    platform: 'Arsmate',
    profileUrl: 'https://arsmate.com',
    bio: 'Pareja real compartiendo dinámicas D/s, rituales, Pegging guiado y juegos de rol.',
    fetishTags: ['D/s Real', 'Pegging', 'Pareja Kink', 'Educación'],
    promoDiscount: '⭐ 50% de descuento primeras 48 hrs',
    likesCount: 175,
    verified: true,
    createdAt: new Date().toISOString(),
  },
];

export async function getBluePagePromos(): Promise<CreatorPromo[]> {
  const data = await readJsonStorage<CreatorPromo[] | null>(STORAGE_KEY, null);
  return data ?? DEFAULT_CREATORS;
}

export async function addBluePagePromo(
  promo: Omit<CreatorPromo, 'id' | 'likesCount' | 'verified' | 'createdAt'>
): Promise<CreatorPromo> {
  const current = await getBluePagePromos();
  const newPromo: CreatorPromo = {
    ...promo,
    id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    likesCount: 1,
    verified: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [newPromo, ...current];
  await writeJsonStorage(STORAGE_KEY, updated);
  return newPromo;
}

export async function togglePromoLike(promoId: string): Promise<void> {
  const current = await getBluePagePromos();
  const target = current.find((p) => p.id === promoId);
  if (target) {
    target.likesCount += 1;
    await writeJsonStorage(STORAGE_KEY, current);
  }
}
