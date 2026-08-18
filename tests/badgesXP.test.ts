declare var jest: any;
declare var describe: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;

import { getLevelInfo, EXPLORATION_LEVELS, getUserGamificationData, addXP, unlockBadge } from '../lib/badgesXP';
import { readJsonStorage, writeJsonStorage } from '../lib/cryptoVault';

jest.mock('../lib/cryptoVault', () => ({
  readJsonStorage: jest.fn(),
  writeJsonStorage: jest.fn(),
}));

describe('badgesXP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLevelInfo', () => {
    it('returns level 1 for 0 XP', () => {
      const info = getLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.currentLevelXP).toBe(0);
      expect(info.nextLevelXP).toBe(200);
    });

    it('returns level 2 for 250 XP', () => {
      const info = getLevelInfo(250);
      expect(info.level).toBe(2);
      expect(info.currentLevelXP).toBe(50);
      expect(info.nextLevelXP).toBe(500);
    });

    it('returns level 10 for 20000 XP', () => {
      const info = getLevelInfo(20000);
      expect(info.level).toBe(10);
      expect(info.currentLevelXP).toBe(2000);
      expect(info.nextLevelXP).toBe(20000);
    });
  });

  describe('getUserGamificationData', () => {
    it('returns default data if storage is empty', async () => {
      (readJsonStorage as any).mockResolvedValue(null);
      const data = await getUserGamificationData();
      expect(data.totalXP).toBe(0);
      expect(data.currentLevel).toBe(1);
      expect(data.badges.length).toBeGreaterThan(0);
    });

    it('returns existing data', async () => {
      (readJsonStorage as any).mockResolvedValue({
        totalXP: 300,
        unlockedBadgeIds: ['guardian_zk'],
        badges: [{ id: 'guardian_zk', unlockedAt: '2026-08-18' }],
        history: []
      });
      const data = await getUserGamificationData();
      expect(data.totalXP).toBe(300);
      expect(data.currentLevel).toBe(2);
      expect(data.unlockedBadgeIds).toContain('guardian_zk');
      const badge = data.badges.find((b: any) => b.id === 'guardian_zk');
      expect(badge?.unlockedAt).toBe('2026-08-18');
    });
  });

  describe('addXP', () => {
    it('adds XP and levels up', async () => {
      (readJsonStorage as any).mockResolvedValue({
        totalXP: 100,
        unlockedBadgeIds: [],
        badges: [],
        history: []
      });
      const data = await addXP(150, 'Test reason');
      expect(data.totalXP).toBe(250);
      expect(data.currentLevel).toBe(2);
      expect(writeJsonStorage).toHaveBeenCalled();
    });
  });

  describe('unlockBadge', () => {
    it('unlocks badge and adds XP', async () => {
      (readJsonStorage as any).mockResolvedValue({
        totalXP: 100,
        unlockedBadgeIds: [],
        badges: [],
        history: []
      });
      const data = await unlockBadge('guardian_zk');
      expect(data.unlockedBadgeIds).toContain('guardian_zk');
      expect(data.totalXP).toBe(150); // guardian_zk gives 50 XP
    });

    it('does not double unlock', async () => {
      (readJsonStorage as any).mockResolvedValue({
        totalXP: 150,
        unlockedBadgeIds: ['guardian_zk'],
        badges: [{ id: 'guardian_zk', unlockedAt: '2026-08-18' }],
        history: []
      });
      const data = await unlockBadge('guardian_zk');
      expect(data.totalXP).toBe(150);
    });
  });
});
