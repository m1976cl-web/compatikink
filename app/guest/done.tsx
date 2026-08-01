import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
import {
  colors,
  fonts,
  fontSize,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import { getLocalSessionByToken, convertSessionToProfile } from '@/lib/storage';
import { Session } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GuestDoneScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [pin, setPin] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('last_completed_guest_session_token');
      if (token) {
        const s = await getLocalSessionByToken(token);
        setSession(s);
      }
    })();
  }, []);

  const handleCreateProfile = async () => {
    if (!session) return;
    if (pin.length < 4) {
      Alert.alert('PIN inválido', 'El PIN debe tener al menos 4 dígitos.');
      return;
    }

    setCreating(true);
    try {
      await convertSessionToProfile(session, pin, {}, true);
      Alert.alert('Perfil creado', 'Tu perfil está listo. Verás tu espacio en el inicio.');
      await AsyncStorage.removeItem('last_completed_guest_session_token');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear el perfil.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          brand
          title="Gracias"
          subtitle="Tus respuestas se enviaron de forma privada. Quien te invitó recibirá el análisis de compatibilidad."
        />

        {session ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Crear perfil protegido</Text>
            <Text style={styles.panelDesc}>
              Guarda tus respuestas con un PIN. Podrás invitar a otras personas sin repetir el test.
            </Text>
            <Text style={styles.label}>PIN de seguridad (4+ dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={colors.textDim}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
            />
            <Button
              title={creating ? 'Creando…' : 'Crear perfil con PIN'}
              onPress={handleCreateProfile}
              disabled={creating}
            />
          </View>
        ) : null}

        <Button
          title="Volver al inicio"
          onPress={() => router.replace('/')}
          variant="ghost"
          style={styles.closeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  panel: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  panelTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  panelDesc: {
    ...typography.bodyMuted,
  },
  label: { ...typography.label },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xl,
    textAlign: 'center',
    letterSpacing: 8,
  },
  closeBtn: { marginTop: spacing.md },
});
