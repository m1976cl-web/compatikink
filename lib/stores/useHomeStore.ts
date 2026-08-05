import { create } from 'zustand';
import { UserProfile, Session, SceneAgreement } from '@/types';
import {
  getCurrentProfile,
  listAllProfiles,
  listMyLocalSessions,
  getAllSceneAgreements,
  loginProfile,
  logoutProfile,
  panicWipeData,
} from '@/lib/storage';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { Alert } from 'react-native';

interface HomeState {
  profile: UserProfile | null;
  profilesList: UserProfile[];
  sessions: Session[];
  sceneAgreements: { sessionId: string; agreements: SceneAgreement[] }[];
  vaultUnlocked: boolean;
  activeTab: string;
  searchQuery: string;

  // Actions
  loadHomeData: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  setVaultUnlocked: (unlocked: boolean) => void;
  handleLogin: (loginNick: string, loginPin: string) => Promise<boolean>;
  handleLogout: () => Promise<void>;
  handlePanicWipe: () => void;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  profile: null,
  profilesList: [],
  sessions: [],
  sceneAgreements: [],
  vaultUnlocked: VaultLockGateAPI.isUnlocked(),
  activeTab: 'explore',
  searchQuery: '',

  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setVaultUnlocked: (vaultUnlocked) => set({ vaultUnlocked }),

  loadHomeData: async () => {
    const curProfile = await getCurrentProfile();
    const allProfs = await listAllProfiles();
    const mySessions = await listMyLocalSessions();
    const agreements = await getAllSceneAgreements();
    set({
      profile: curProfile,
      profilesList: allProfs,
      sessions: mySessions,
      sceneAgreements: agreements,
      vaultUnlocked: VaultLockGateAPI.isUnlocked(),
    });
  },

  handleLogin: async (loginNick: string, loginPin: string): Promise<boolean> => {
    if (!loginNick.trim()) {
      Alert.alert('Datos incompletos', 'Selecciona o ingresa tu nick.');
      return false;
    }
    const { profilesList, loadHomeData } = get();
    const selectedProfile = profilesList.find(
      (p) => p.nickname.toLowerCase() === loginNick.trim().toLowerCase()
    );
    const profileHasPin = selectedProfile
      ? Boolean(selectedProfile.pinSalt || selectedProfile.pinVerifier || selectedProfile.pin)
      : true;

    if (selectedProfile && !profileHasPin) {
      const { setCurrentProfile } = await import('@/lib/storage');
      await setCurrentProfile(selectedProfile.nickname);
      await loadHomeData();
      return true;
    }
    if (!loginPin) {
      Alert.alert('PIN requerido', 'Ingresa tu PIN de seguridad.');
      return false;
    }
    const res = await loginProfile(loginNick.trim(), loginPin);
    if (res) {
      await loadHomeData();
      return true;
    } else {
      Alert.alert('Error de login', 'Nick o PIN incorrecto.');
      return false;
    }
  },

  handleLogout: async () => {
    await logoutProfile();
    set({ profile: null, sessions: [] });
    await get().loadHomeData();
  },

  handlePanicWipe: () => {
    Alert.alert(
      'Borrado de emergencia',
      '¿Eliminar sesiones, perfiles y acuerdos de este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            await panicWipeData();
            set({
              profile: null,
              sessions: [],
              profilesList: [],
              sceneAgreements: [],
            });
            Alert.alert('Datos eliminados', 'El historial y los perfiles se borraron por completo.');
            await get().loadHomeData();
          },
        },
      ]
    );
  },
}));
