// @ts-nocheck
import {
  getNoxAvatars,
  getIntimateArchetypes,
  getNoxAvatarById,
  saveUserAvatarSelection,
  getUserAvatarSelection,
} from '../lib/noxAvatars';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

// @ts-nocheck
describe('noxAvatars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return catalog of 10 Nox Avatars', () => {
    const avatars = getNoxAvatars();
    expect(avatars).toHaveLength(10);
    expect(avatars[0].name).toBe('Nox Host');
  });

  it('should return Intimate Archetypes catalog', () => {
    const archetypes = getIntimateArchetypes();
    expect(archetypes.length).toBeGreaterThan(0);
    expect(archetypes[0].name).toBe('Dominante');
  });

  it('should get Nox avatar by ID', () => {
    const avatar = getNoxAvatarById('avatar_5');
    expect(avatar.name).toBe('Director');
  });

  it('should return default avatar if ID not found', () => {
    const avatar = getNoxAvatarById('invalid_id');
    expect(avatar.id).toBe('avatar_1');
  });

  it('should save user avatar selection', async () => {
    await saveUserAvatarSelection('avatar_2', 'El Guardián');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@nox_avatar_selection',
      JSON.stringify({ avatarId: 'avatar_2', archetypeTitle: 'El Guardián' })
    );
  });

  it('should get user avatar selection when saved data exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ avatarId: 'avatar_3', archetypeTitle: 'Místico' })
    );

    const selection = await getUserAvatarSelection();
    expect(selection).toEqual({ avatarId: 'avatar_3', archetypeTitle: 'Místico' });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@nox_avatar_selection');
  });

  it('should fallback to defaults when no saved data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const selection = await getUserAvatarSelection();
    expect(selection).toEqual({ avatarId: 'avatar_1', archetypeTitle: 'Dominante' });
  });
});

