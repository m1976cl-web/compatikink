import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { AuthorizedMediaItem } from '@/types/profileEnhancements';

const MEDIA_STORAGE_KEY = 'private_authorized_media_v1';

export async function loadAllAuthorizedMedia(): Promise<AuthorizedMediaItem[]> {
  return readJsonStorage<AuthorizedMediaItem[]>(MEDIA_STORAGE_KEY, []);
}

export async function saveAuthorizedMediaItem(
  item: AuthorizedMediaItem
): Promise<AuthorizedMediaItem[]> {
  const allMedia = await loadAllAuthorizedMedia();
  const existingIdx = allMedia.findIndex((m) => m.id === item.id);
  if (existingIdx >= 0) {
    allMedia[existingIdx] = item;
  } else {
    allMedia.push(item);
  }
  await writeJsonStorage(MEDIA_STORAGE_KEY, allMedia);
  return allMedia;
}

export async function toggleTargetUserAuthorization(
  mediaId: string,
  targetNickname: string
): Promise<{ updatedMedia: AuthorizedMediaItem | null; isAuthorizedNow: boolean }> {
  const allMedia = await loadAllAuthorizedMedia();
  const item = allMedia.find((m) => m.id === mediaId);
  if (!item) return { updatedMedia: null, isAuthorizedNow: false };

  const targetLower = targetNickname.toLowerCase();
  const existsIdx = item.authorizedTargetNicknames.findIndex(
    (n) => n.toLowerCase() === targetLower
  );

  let isAuthorizedNow = false;
  if (existsIdx >= 0) {
    item.authorizedTargetNicknames.splice(existsIdx, 1);
    isAuthorizedNow = false;
  } else {
    item.authorizedTargetNicknames.push(targetNickname);
    isAuthorizedNow = true;
  }

  await writeJsonStorage(MEDIA_STORAGE_KEY, allMedia);
  return { updatedMedia: item, isAuthorizedNow };
}

export function canUserViewMedia(
  item: AuthorizedMediaItem,
  viewerNickname: string,
  isMutualFriend: boolean = false
): boolean {
  const viewerLower = viewerNickname.toLowerCase();
  const ownerLower = item.ownerNickname.toLowerCase();

  // Owner can always view their own media
  if (ownerLower === viewerLower) return true;

  const level = item.privacyLevel ?? (item.isPrivateVault ? 'authorized_only' : 'public');

  if (level === 'public') return true;
  if (level === 'friends_only') return isMutualFriend;
  if (level === 'authorized_only') {
    return item.authorizedTargetNicknames.some((n) => n.toLowerCase() === viewerLower);
  }
  if (level === 'private_vault') return false;

  return false;
}

export async function getMediaForProfileView(
  ownerNickname: string,
  viewerNickname: string,
  isMutualFriend: boolean = false
): Promise<{ visibleMedia: AuthorizedMediaItem[]; totalPrivateCount: number }> {
  const allMedia = await loadAllAuthorizedMedia();
  const ownerMedia = allMedia.filter(
    (m) => m.ownerNickname.toLowerCase() === ownerNickname.toLowerCase()
  );

  const totalPrivateCount = ownerMedia.filter(
    (m) => (m.privacyLevel ?? (m.isPrivateVault ? 'authorized_only' : 'public')) !== 'public'
  ).length;
  const visibleMedia = ownerMedia.filter((m) => canUserViewMedia(m, viewerNickname, isMutualFriend));

  return { visibleMedia, totalPrivateCount };
}
