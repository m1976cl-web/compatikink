import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
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
      Alert.alert('PIN inválido', 'El PIN de seguridad debe tener al menos 4 dígitos.');
      return;
    }

    setCreating(true);
    try {
      await convertSessionToProfile(session, pin, {}, true);
      Alert.alert('Perfil Creado', 'Tu perfil ha sido creado con éxito. Ahora verás tu Dashboard.');
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
        <View style={styles.content}>
          <Text style={styles.emoji}>✓</Text>
          <Text style={styles.title}>¡Gracias!</Text>
          <Text style={styles.desc}>
            Tus respuestas se enviaron de forma privada. Quien te invitó recibirá el análisis de
            compatibilidad. Si quiere compartir contigo un resumen, te lo hará saber.
          </Text>

          {session ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔐 Crea tu Perfil Protegido</Text>
              <Text style={styles.cardDesc}>
                Guarda tus respuestas en un perfil protegido con PIN de 4 dígitos. Esto te permitirá invitar a otras personas y ver reportes sin volver a responder el test.
              </Text>
              <Text style={styles.label}>PIN de seguridad (4+ dígitos)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1234"
                placeholderTextColor={colors.textMuted}
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
              />
              <Button
                title={creating ? 'Creando Perfil...' : 'Crear Perfil con PIN'}
                onPress={handleCreateProfile}
                disabled={creating}
              />
            </View>
          ) : null}

          <Button title="Cerrar y volver al inicio" onPress={() => router.replace('/')} variant="ghost" style={styles.closeBtn} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    color: colors.success,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  desc: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: -4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
    textAlign: 'center',
    letterSpacing: 4,
  },
  closeBtn: {
    marginTop: spacing.md,
  },
});
