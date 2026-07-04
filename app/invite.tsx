import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { getSessionByToken } from '@/lib/sessions';
import { buildInviteMessage, getGuestProfile } from '@/lib/storage';
import { Session, GuestProfile } from '@/types';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const s = await getSessionByToken(token);
    setSession(s);
    if (s) {
      const gp = await getGuestProfile(s.id);
      setGuestProfile(gp);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      if (!token) return;
      const s = await getSessionByToken(token);
      if (s?.status === 'complete') {
        clearInterval(interval);
        router.replace({ pathname: '/report', params: { token } });
      } else {
        setSession(s);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token, load, router]);

  const copyCode = async () => {
    if (!session) return;
    await Clipboard.setStringAsync(session.inviteCode);
    Alert.alert('Copiado', 'Código copiado al portapapeles.');
  };

  const shareInvite = async () => {
    if (!session) return;
    try {
      await Share.share({ message: buildInviteMessage(session.inviteCode) });
    } catch (e) {
      await Clipboard.setStringAsync(buildInviteMessage(session.inviteCode));
      Alert.alert('Copiado', 'La invitación se ha copiado al portapapeles.');
    }
  };

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>¡Listo! Comparte el código</Text>
        <Text style={styles.desc}>
          La otra persona usará este código en la app. Cuando termine, recibirás el reporte completo
          aquí. No verá tus respuestas.
        </Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{session.inviteCode}</Text>
        </View>

        {guestProfile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}>Ficha de {guestProfile.nickname}</Text>
            {guestProfile.notes ? (
              <Text style={styles.profileNotes} numberOfLines={3}>{guestProfile.notes}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button title="Copiar código" onPress={copyCode} />
          <Button title="Compartir invitación" onPress={shareInvite} variant="secondary" />
        </View>

        <View style={styles.waiting}>
          <Text style={styles.waitingTitle}>Esperando respuestas...</Text>
          <Text style={styles.muted}>
            Estado: {session.status === 'waiting' ? 'Pendiente' : 'Completado'}
          </Text>
          <Text style={styles.hint}>
            La app comprobará automáticamente cada 5 segundos.
          </Text>
        </View>

        <Button
          title="Ir al reporte (si ya completó)"
          onPress={() => router.push({ pathname: '/report', params: { token } })}
          variant="ghost"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  desc: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  code: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 6,
  },
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  waiting: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waitingTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  muted: { color: colors.textMuted, fontSize: fontSize.sm },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileNotes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});
