import { Activity } from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface WishlistItem {
  activityId: string;
  activityName: string;
  category: string;
  addedAt: string;
  note?: string;
}

export interface DatingMessage {
  id: string;
  targetProfileId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface GearItem {
  id: string;
  name: string;
  category?: string;
  addedAt: string;
}

const CUSTOM_ACTIVITIES_KEY = 'custom_activities_list';
const MANUAL_BOOKMARKS_KEY = 'manual_bookmarked_modules_v1';
const GLOSSARY_BOOKMARKS_KEY = 'glossary_bookmarked_terms_v1';
const WISHLIST_KEY = 'user_wishlist_items';
const DATING_MESSAGES_KEY = 'dating_direct_messages';
const GEAR_ITEMS_KEY = 'user_gear_inventory';

export async function getCustomActivities(): Promise<Activity[]> {
  return readJsonStorage<Activity[]>(CUSTOM_ACTIVITIES_KEY, []);
}

export async function saveCustomActivity(activity: Activity): Promise<Activity[]> {
  const existing = await getCustomActivities();
  if (!existing.some((a) => a.id === activity.id)) {
    existing.push(activity);
    await writeJsonStorage(CUSTOM_ACTIVITIES_KEY, existing);
  }
  const { registerCustomActivity } = await import('@/data/activities');
  registerCustomActivity(activity);
  return existing;
}

export async function deleteCustomActivity(activityId: string): Promise<void> {
  const customs = await getCustomActivities();
  const updated = customs.filter((a) => a.id !== activityId);
  await writeJsonStorage(CUSTOM_ACTIVITIES_KEY, updated);
}

export async function loadManualBookmarks(): Promise<string[]> {
  return readJsonStorage<string[]>(MANUAL_BOOKMARKS_KEY, []);
}

export async function toggleManualBookmark(moduleId: string): Promise<string[]> {
  const bookmarks = await loadManualBookmarks();
  const exists = bookmarks.includes(moduleId);
  const updated = exists ? bookmarks.filter((id) => id !== moduleId) : [...bookmarks, moduleId];
  await writeJsonStorage(MANUAL_BOOKMARKS_KEY, updated);
  return updated;
}

export async function isManualBookmarked(moduleId: string): Promise<boolean> {
  const bookmarks = await loadManualBookmarks();
  return bookmarks.includes(moduleId);
}

export async function loadGlossaryBookmarks(): Promise<string[]> {
  return readJsonStorage<string[]>(GLOSSARY_BOOKMARKS_KEY, []);
}

export async function toggleGlossaryBookmark(term: string): Promise<string[]> {
  const bookmarks = await loadGlossaryBookmarks();
  const exists = bookmarks.includes(term);
  const updated = exists ? bookmarks.filter((t) => t !== term) : [...bookmarks, term];
  await writeJsonStorage(GLOSSARY_BOOKMARKS_KEY, updated);
  return updated;
}

export async function isGlossaryBookmarked(term: string): Promise<boolean> {
  const bookmarks = await loadGlossaryBookmarks();
  return bookmarks.includes(term);
}

export async function getWishlist(): Promise<WishlistItem[]> {
  return readJsonStorage<WishlistItem[]>(WISHLIST_KEY, []);
}

export async function toggleWishlist(item: {
  activityId: string;
  activityName: string;
  category: string;
}): Promise<boolean> {
  const existing = await getWishlist();
  const index = existing.findIndex((w) => w.activityId === item.activityId);
  if (index >= 0) {
    existing.splice(index, 1);
    await writeJsonStorage(WISHLIST_KEY, existing);
    return false;
  }
  existing.push({
    ...item,
    addedAt: new Date().toISOString(),
  });
  await writeJsonStorage(WISHLIST_KEY, existing);
  return true;
}

export async function getDatingMessages(targetProfileId?: string): Promise<DatingMessage[]> {
  const list = await readJsonStorage<DatingMessage[]>(DATING_MESSAGES_KEY, []);
  if (!targetProfileId) return list;
  return list.filter((m) => m.targetProfileId === targetProfileId);
}

export async function sendDatingMessage(msg: {
  targetProfileId: string;
  senderName: string;
  text: string;
}): Promise<DatingMessage> {
  const list = await getDatingMessages();
  const newMsg: DatingMessage = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetProfileId: msg.targetProfileId,
    senderName: msg.senderName,
    text: msg.text.trim(),
    timestamp: new Date().toISOString(),
  };
  list.push(newMsg);
  await writeJsonStorage(DATING_MESSAGES_KEY, list);
  return newMsg;
}

export async function getGearItems(): Promise<GearItem[]> {
  return readJsonStorage<GearItem[]>(GEAR_ITEMS_KEY, []);
}

export async function saveGearItems(items: GearItem[]): Promise<void> {
  await writeJsonStorage(GEAR_ITEMS_KEY, items);
}
