/**
 * useHomeData.ts
 * Extrae la lógica de carga de datos del HomeScreen en un hook reutilizable.
 * Antes estaba inlined directamente en app/index.tsx (líneas 131-202).
 */
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getCurrentProfile,
  listAllProfiles,
  listMyLocalSessions,
  getAllSceneAgreements,
  loginProfile,
  logoutProfile,
  panicWipeData,
} from '@/lib/storage';
import { UserProfile, Session, SceneAgreement } from '@/types';

export function useHomeData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sceneAgreements, setSceneAgreements] = useState<
    { sessionId: string; agreements: SceneAgreement[] }[]
  >([]);

  const loadHomeData = useCallback(async () => {
    const curProfile = await getCurrentProfile();
    setProfile(curProfile);
    const allProfs = await listAllProfiles();
    setProfilesList(allProfs);
    const mySessions = await listMyLocalSessions();
    setSessions(mySessions);
    const agreements = await getAllSceneAgreements();
    setSceneAgreements(agreements);
  }, []);

  const handleLogin = useCallback(
    async (loginNick: string, loginPin: string): Promise<boolean> => {
      if (!loginNick.trim()) {
        Alert.alert('Datos incompletos', 'Selecciona o ingresa tu nick.');
        return false;
      }
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
    [profilesList, loadHomeData]
  );

  const handleLogout = useCallback(async () => {
    await logoutProfile();
    setProfile(null);
    setSessions([]);
    await loadHomeData();
  }, [loadHomeData]);

  const handlePanicWipe = useCallback(() => {
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
            setProfile(null);
            setSessions([]);
            setProfilesList([]);
            setSceneAgreements([]);
            Alert.alert('Datos eliminados', 'El historial y los perfiles se borraron por completo.');
            await loadHomeData();
          },
        },
      ]
    );
  }, [loadHomeData]);

  return {
    profile,
    profilesList,
    sessions,
    sceneAgreements,
    loadHomeData,
    handleLogin,
    handleLogout,
    handlePanicWipe,
  };
}
