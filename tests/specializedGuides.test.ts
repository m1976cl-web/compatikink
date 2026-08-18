// @ts-nocheck
import { SPECIALIZED_GUIDES } from '@/data/specializedGuides';
import { getGuidesProgress, toggleChecklistItem, markGuideCompleted } from '@/lib/specializedGuidesProgress';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { addXP, unlockBadge } from '@/lib/badgesXP';

jest.mock('@/lib/cryptoVault', () => ({
  readJsonStorage: jest.fn(),
  writeJsonStorage: jest.fn(),
}));

jest.mock('@/lib/badgesXP', () => ({
  addXP: jest.fn(),
  unlockBadge: jest.fn(),
}));

describe('Specialized Guides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('contains the correct 4 guides', () => {
    expect(SPECIALIZED_GUIDES.length).toBe(4);
    expect(SPECIALIZED_GUIDES[0].id).toBe('cuerdas-shibari');
    expect(SPECIALIZED_GUIDES[1].id).toBe('higiene-juguetes');
    expect(SPECIALIZED_GUIDES[2].id).toBe('botiquin-emergencia');
    expect(SPECIALIZED_GUIDES[3].id).toBe('protocolo-rack');
  });

  it('each guide has sections, checklist, and badgeId', () => {
    SPECIALIZED_GUIDES.forEach(guide => {
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.checklist.length).toBeGreaterThan(0);
      expect(guide.badgeId).toBeDefined();
    });
  });

  it('can load progress', async () => {
    (readJsonStorage as jest.Mock).mockResolvedValueOnce({
      completedChecklists: ['shibari-chk-1'],
      completedGuides: ['cuerdas-shibari']
    });

    const progress = await getGuidesProgress();
    expect(progress.completedChecklists).toContain('shibari-chk-1');
    expect(progress.completedGuides).toContain('cuerdas-shibari');
  });

  it('can toggle checklist item', async () => {
    (readJsonStorage as jest.Mock).mockResolvedValueOnce({
      completedChecklists: [],
      completedGuides: []
    });

    const progress = await toggleChecklistItem('shibari-chk-1');
    expect(progress.completedChecklists).toContain('shibari-chk-1');
    expect(writeJsonStorage).toHaveBeenCalledWith(
      'compatikink_specialized_guides_progress',
      expect.objectContaining({ completedChecklists: ['shibari-chk-1'] })
    );
  });

  it('can mark guide as completed and trigger XP/badge', async () => {
    (readJsonStorage as jest.Mock).mockResolvedValueOnce({
      completedChecklists: ['shibari-chk-1', 'shibari-chk-2', 'shibari-chk-3', 'shibari-chk-4'],
      completedGuides: []
    });

    const progress = await markGuideCompleted('cuerdas-shibari', 'estudiante_shibari');
    
    expect(progress.completedGuides).toContain('cuerdas-shibari');
    expect(writeJsonStorage).toHaveBeenCalled();
    expect(addXP).toHaveBeenCalledWith(40, expect.stringContaining('cuerdas-shibari'));
    expect(unlockBadge).toHaveBeenCalledWith('estudiante_shibari');
  });
});
