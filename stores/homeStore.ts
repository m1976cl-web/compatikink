import { create } from 'zustand';
import { UserProfile, Session, SceneAgreement } from '@/types';
import {
  getCurrentProfile,
  listAllProfiles,
  listMyLocalSessions,
  getAllSceneAgreements,
  loginProfile,
  logoutProfile,
} from '@/lib/storage';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export interface HomeState {
  profile: UserProfile | null;
  profilesList: UserProfile[];
  sessions: Session[];
  sceneAgreements: { sessionId: string; agreements: SceneAgreement[] }[];
  vaultOpen: boolean;
  vaultUnlocked: boolean;
  isLoading: boolean;
  activeTab: string;
  searchQuery: string;

  loadHomeData: () => Promise<void>;
  setVaultOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  handleLogin: (nick: string, pin: string) => Promise<UserProfile | null>;
  handleLogout: () => Promise<void>;
  handlePanicWipe: () => Promise<void>;
  reset: () => void;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  profile: null,
  profilesList: [],
  sessions: [],
  sceneAgreements: [],
  vaultOpen: false,
  vaultUnlocked: false,
  isLoading: false,
  activeTab: 'explore',
  searchQuery: '',

  loadHomeData: async () => {
    set({ isLoading: true });
    try {
      const [curProfile, allProfs, mySessions, agreements] = await Promise.all([
        getCurrentProfile(),
        listAllProfiles(),
        listMyLocalSessions(),
        getAllSceneAgreements(),
      ]);
      set({
        profile: curProfile,
        profilesList: allProfs,
        sessions: mySessions,
        sceneAgreements: agreements,
        vaultUnlocked: VaultLockGateAPI.isUnlocked(),
        vaultOpen: VaultLockGateAPI.isUnlocked(),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setVaultOpen: (open: boolean) => set({ vaultOpen: open, vaultUnlocked: open }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  handleLogin: async (nick: string, pin: string) => {
    const res = await loginProfile(nick, pin);
    if (res) {
      await get().loadHomeData();
    }
    return res;
  },

  handleLogout: async () => {
    await logoutProfile();
    await get().loadHomeData();
  },

  handlePanicWipe: async () => {
    await logoutProfile();
    get().reset();
  },

  reset: () =>
    set({
      profile: null,
      profilesList: [],
      sessions: [],
      sceneAgreements: [],
      vaultOpen: false,
      vaultUnlocked: false,
      isLoading: false,
      activeTab: 'explore',
      searchQuery: '',
    }),
}));
