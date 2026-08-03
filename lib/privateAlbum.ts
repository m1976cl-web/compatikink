import {
  readJsonStorage,
  writeJsonStorage,
  generateInviteSecret,
} from '@/lib/cryptoVault';
import { stripExifMetadata, applyDynamicWatermark } from '@/lib/mediaSecurity';

const ALBUM_KEY = 'private_album_photos_v1';
const SHARED_LINKS_KEY = 'private_album_shared_links_v1';

export interface PrivatePhoto {
  id: string;
  caption: string;
  category: string;
  dataUrl: string; // Base64 or URI — sealed at rest via vault when unlocked
  createdAt: string;
  isWatermarked?: boolean;
}

export interface SharedLink {
  id: string;
  photoId: string;
  hashSecret: string;
  fullUrl: string;
  expiresAt: string;
  isRevoked: boolean;
}

const DEFAULT_PHOTOS: PrivatePhoto[] = [
  {
    id: 'p-1',
    caption: 'Set de Cuerdas de Yute 6mm',
    category: 'Equipamiento',
    dataUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
    createdAt: new Date().toISOString(),
    isWatermarked: true,
  },
  {
    id: 'p-2',
    caption: 'Configuración de Iluminación para Escena',
    category: 'Ambiente',
    dataUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500',
    createdAt: new Date().toISOString(),
    isWatermarked: true,
  },
];

export async function getPhotos(): Promise<PrivatePhoto[]> {
  const photos = await readJsonStorage<PrivatePhoto[] | null>(ALBUM_KEY, null);
  return photos ?? DEFAULT_PHOTOS;
}

export async function savePhotos(photos: PrivatePhoto[]): Promise<void> {
  await writeJsonStorage(ALBUM_KEY, photos);
}

/**
 * Add a new private photo after scrubbing EXIF headers and applying an optional watermark.
 */
export async function addPhoto(
  caption: string,
  category: string,
  rawPayloadUrl: string,
  watermarkRecipient?: string
): Promise<PrivatePhoto> {
  // 1. Strip EXIF Metadata (GPS, Camera model, timestamps)
  let cleanUrl = await stripExifMetadata(rawPayloadUrl);

  // 2. Apply optional anti-leak watermark if text provided
  if (watermarkRecipient) {
    cleanUrl = await applyDynamicWatermark(cleanUrl, { text: `Confidencial · ${watermarkRecipient}` });
  }

  const existing = await getPhotos();
  const newPhoto: PrivatePhoto = {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    caption,
    category,
    dataUrl: cleanUrl,
    createdAt: new Date().toISOString(),
    isWatermarked: Boolean(watermarkRecipient),
  };

  const updated = [newPhoto, ...existing];
  await savePhotos(updated);
  return newPhoto;
}

/**
 * Create a Zero-Knowledge temporary share link.
 * The decryption key lives in the URL hash fragment (#key=...) which HTTP servers NEVER receive.
 */
export async function createSharedLink(photoId: string): Promise<SharedLink> {
  const links = await readJsonStorage<SharedLink[]>(SHARED_LINKS_KEY, []);
  const hashSecret = generateInviteSecret(24);
  const linkId = `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://m1976cl-web.github.io/compatikink/';
  const fullUrl = `${baseUrl}#/private-album?id=${linkId}#key=${encodeURIComponent(hashSecret)}`;

  const newLink: SharedLink = {
    id: linkId,
    photoId,
    hashSecret,
    fullUrl,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isRevoked: false,
  };

  links.push(newLink);
  await writeJsonStorage(SHARED_LINKS_KEY, links);
  return newLink;
}

export async function revokeAllLinks(): Promise<void> {
  await writeJsonStorage(SHARED_LINKS_KEY, []);
}
