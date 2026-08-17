import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

const SAVED_ARTICLES_KEY = 'user_saved_articles_v1';
const READ_ARTICLES_KEY = 'user_read_articles_v1';

export async function getSavedArticleIds(): Promise<string[]> {
  return readJsonStorage<string[]>(SAVED_ARTICLES_KEY, []);
}

export async function toggleSaveArticle(articleId: string): Promise<{ isSaved: boolean; ids: string[] }> {
  const current = await getSavedArticleIds();
  const exists = current.includes(articleId);
  const updated = exists ? current.filter((id) => id !== articleId) : [...current, articleId];

  await writeJsonStorage(SAVED_ARTICLES_KEY, updated);
  if (!exists) {
    triggerSuccessHaptic();
  } else {
    triggerLightHaptic();
  }
  return { isSaved: !exists, ids: updated };
}

export async function getReadArticleIds(): Promise<string[]> {
  return readJsonStorage<string[]>(READ_ARTICLES_KEY, []);
}

export async function markArticleAsRead(articleId: string): Promise<string[]> {
  const current = await getReadArticleIds();
  if (!current.includes(articleId)) {
    const updated = [...current, articleId];
    await writeJsonStorage(READ_ARTICLES_KEY, updated);
    triggerSuccessHaptic();
    return updated;
  }
  return current;
}
