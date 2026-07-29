import AsyncStorage from '@react-native-async-storage/async-storage';

const ALBUM_KEY = 'private_album_photos_v1';
const SHARED_LINKS_KEY = 'private_album_shared_links_v1';

export interface PrivatePhoto {
  id: string;
  caption: string;
  category: string;
  dataUrl: string; // Base64 or URI
  createdAt: string;
}

export interface SharedLink {
  id: string;
  photoId: string;
  expiresAt: string;
  isRevoked: boolean;
}

const DEFAULT_PHOTOS: PrivatePhoto[] = [
  { id: 'p-1', caption: 'Set de Cuerdas de Yute 6mm', category: 'Equipamiento', dataUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500', createdAt: new Date().toISOString() },
  { id: 'p-2', caption: 'Configuración de Iluminación para Escena', category: 'Ambiente', dataUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500', createdAt: new Date().toISOString() },
];

export async function getPhotos(): Promise<PrivatePhoto[]> {
  const raw = await AsyncStorage.getItem(ALBUM_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_PHOTOS;
}

export async function savePhotos(photos: PrivatePhoto[]): Promise<void> {
  await AsyncStorage.setItem(ALBUM_KEY, JSON.stringify(photos));
}

export async function createSharedLink(photoId: string): Promise<SharedLink> {
  const raw = await AsyncStorage.getItem(SHARED_LINKS_KEY);
  const links: SharedLink[] = raw ? JSON.parse(raw) : [];

  const newLink: SharedLink = {
    id: `link-${Date.now()}`,
    photoId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    isRevoked: false,
  };

  links.push(newLink);
  await AsyncStorage.setItem(SHARED_LINKS_KEY, JSON.stringify(links));
  return newLink;
}

export async function revokeAllLinks(): Promise<void> {
  await AsyncStorage.setItem(SHARED_LINKS_KEY, JSON.stringify([]));
}
