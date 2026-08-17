import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { CrushRecord } from '@/types/profileEnhancements';

const BLIND_CRUSH_STORAGE_KEY = 'blind_crushes_sealed_v1';

export async function loadAllCrushes(): Promise<CrushRecord[]> {
  return readJsonStorage<CrushRecord[]>(BLIND_CRUSH_STORAGE_KEY, []);
}

export async function toggleBlindCrush(
  userNickname: string,
  targetNickname: string
): Promise<{ isCrushActiveNow: boolean; isMutualMatch: boolean }> {
  const crushes = await loadAllCrushes();
  const userLower = userNickname.toLowerCase();
  const targetLower = targetNickname.toLowerCase();

  const existingIdx = crushes.findIndex(
    (c) =>
      c.userNickname.toLowerCase() === userLower &&
      c.targetNickname.toLowerCase() === targetLower
  );

  let isCrushActiveNow = false;
  if (existingIdx >= 0) {
    crushes.splice(existingIdx, 1);
    isCrushActiveNow = false;
  } else {
    crushes.push({
      id: `crush_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userNickname,
      targetNickname,
      createdAt: new Date().toISOString(),
    });
    isCrushActiveNow = true;
  }

  // Check if target also has active crush on user
  const reciprocalCrush = crushes.find(
    (c) =>
      c.userNickname.toLowerCase() === targetLower &&
      c.targetNickname.toLowerCase() === userLower
  );

  const isMutualMatch = isCrushActiveNow && !!reciprocalCrush;

  if (isMutualMatch) {
    // Update both records to mark mutual status
    crushes.forEach((c) => {
      if (
        (c.userNickname.toLowerCase() === userLower && c.targetNickname.toLowerCase() === targetLower) ||
        (c.userNickname.toLowerCase() === targetLower && c.targetNickname.toLowerCase() === userLower)
      ) {
        c.isMutualMatch = true;
      }
    });
  }

  await writeJsonStorage(BLIND_CRUSH_STORAGE_KEY, crushes);
  return { isCrushActiveNow, isMutualMatch };
}

export async function getCrushStatus(
  userNickname: string,
  targetNickname: string
): Promise<{ hasCrushOnTarget: boolean; isMutualMatch: boolean }> {
  const crushes = await loadAllCrushes();
  const userLower = userNickname.toLowerCase();
  const targetLower = targetNickname.toLowerCase();

  const userCrush = crushes.find(
    (c) =>
      c.userNickname.toLowerCase() === userLower &&
      c.targetNickname.toLowerCase() === targetLower
  );

  const targetCrush = crushes.find(
    (c) =>
      c.userNickname.toLowerCase() === targetLower &&
      c.targetNickname.toLowerCase() === userLower
  );

  const hasCrushOnTarget = !!userCrush;
  const isMutualMatch = hasCrushOnTarget && !!targetCrush;

  return { hasCrushOnTarget, isMutualMatch };
}

export async function getAllMutualMatchesForUser(
  userNickname: string
): Promise<string[]> {
  const crushes = await loadAllCrushes();
  const userLower = userNickname.toLowerCase();

  const matchesSet = new Set<string>();

  crushes.forEach((c) => {
    if (c.userNickname.toLowerCase() === userLower) {
      const reciprocal = crushes.find(
        (rc) =>
          rc.userNickname.toLowerCase() === c.targetNickname.toLowerCase() &&
          rc.targetNickname.toLowerCase() === userLower
      );
      if (reciprocal) {
        matchesSet.add(c.targetNickname);
      }
    }
  });

  return Array.from(matchesSet);
}
