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
    const guestName = guestProfile?.nickname || 'alguien especial';
    const richMessage =
      `🔥 *Compatikink* — Test de Compatibilidad Erótica Privado\n\n` +
      `Hola${guestName !== 'alguien especial' ? `, ${guestName}` : ''}! Te invito a hacer un test de compatibilidad conmigo de forma completamente privada. 🔐\n\n` +
      `Tu código de acceso es:\n\n` +
      `  *${session.inviteCode}*\n\n` +
      `Pasos:\n` +
      `1. Entra a: https://m1976cl-web.github.io/compatikink/\n` +
      `2. Pulsa "Tengo un Código" e introduce: *${session.inviteCode}*\n` +
      `3. Responde en privado (nadie verá tus respuestas individuales)\n\n` +
      `Cuando termines, yo recibiré el análisis de compatibilidad. 💜`;

    try {
      await Share.share({ message: richMessage });
    } catch {
      await Clipboard.setStringAsync(richMessage);
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

  const isComplete = session.status === 'complete';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>¡Listo! Comparte el Código</Text>
        <Text style={styles.desc}>
          Envía este código a la persona que quieres invitar. Cuando complete el test, recibirás el reporte de compatibilidad automáticamente.
        </Text>

        {/* Neon Code Card */}
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>CÓDIGO DE INVITACIÓN</Text>
          <Text style={styles.code}>{session.inviteCode}</Text>
          <Text style={styles.codeHint}>Solo funciona una vez · Privado</Text>
        </View>

        {/* Quick Share Buttons */}
        <View style={styles.shareRow}>
          <Button title="📋 Copiar código" onPress={copyCode} style={{ flex: 1 }} />
          <Button title="📤 Compartir" onPress={shareInvite} variant="secondary" style={{ flex: 1 }} />
        </View>

        {guestProfile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}>📝 Ficha de {guestProfile.nickname}</Text>
            {guestProfile.notes ? (
              <Text style={styles.profileNotes} numberOfLines={3}>{guestProfile.notes}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Status indicator */}
        <View style={[styles.waiting, isComplete && styles.waitingComplete]}>
          <View style={styles.waitingHeader}>
            <Text style={styles.waitingDot}>{isComplete ? '✅' : '⏳'}</Text>
            <Text style={[styles.waitingTitle, isComplete && styles.waitingTitleComplete]}>
              {isComplete ? '¡Completado! El reporte está listo' : 'Esperando que respondan...'}
            </Text>
          </View>
          {!isComplete ? (
            <Text style={styles.hint}>
              La app verifica automáticamente cada 5 segundos.
            </Text>
          ) : null}
        </View>

        {isComplete ? (
          <Button
            title="Ver Reporte de Compatibilidad 📊"
            onPress={() => router.replace({ pathname: '/report', params: { token } })}
          />
        ) : (
          <Button
            title="Verificar ahora"
            onPress={() => router.push({ pathname: '/report', params: { token } })}
            variant="ghost"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 40, gap: spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  desc: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: fontSize.sm,
  },
  codeBox: {
    backgroundColor: 'rgba(10, 6, 18, 0.95)',
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  codeLabel: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  code: {
    color: colors.neonPurple,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: 'rgba(192, 132, 252, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  codeHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  shareRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  waiting: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  waitingComplete: {
    borderColor: colors.success,
    backgroundColor: 'rgba(74, 222, 128, 0.07)',
  },
  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waitingDot: {
    fontSize: 20,
  },
  waitingTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.sm,
    flex: 1,
  },
  waitingTitleComplete: {
    color: colors.success,
  },
  muted: { color: colors.textMuted, fontSize: fontSize.sm },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
    paddingLeft: 28,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileNotes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});

