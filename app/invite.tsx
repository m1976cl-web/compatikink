import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Share, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
import { FlowBar } from '@/components/FlowBar';
import { NextStepBanner } from '@/components/NextStepBanner';
import { NoxHost } from '@/components/nox';
import {
  colors,
  fonts,
  fontSize,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import { getSessionByToken } from '@/lib/sessions';
import { getGuestProfile } from '@/lib/storage';
import { notify } from '@/lib/notify';
import { Session, GuestProfile } from '@/types';
import {
  createInviteWebUrl,
  createInviteWebUrlQueryFallback,
  createInviteSchemeUrl,
  generateQRCodeSVG,
} from '@/lib/linking';
import { QRCodeInviteCard } from '@/components/invite/QRCodeInviteCard';
import { useTranslation } from '@/lib/i18n';

export default function InviteScreen() {
  const { t } = useTranslation();
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

  const shareInvite = async () => {
    if (!session) return;
    const guestName = guestProfile?.nickname || 'alguien especial';
    const secret = session.inviteSecret;
    const webUrl = createInviteWebUrl(session.inviteCode, secret);
    const webFallback = secret
      ? createInviteWebUrlQueryFallback(session.inviteCode, secret)
      : null;
    const schemeUrl = createInviteSchemeUrl(session.inviteCode, secret);

    const richMessage =
      `*CompatKink* — Test de compatibilidad privado\n\n` +
      `Hola${guestName !== 'alguien especial' ? `, ${guestName}` : ''}! Te invito a un test de compatibilidad privado.\n\n` +
      `Tu código:\n` +
      `  *${session.inviteCode}*\n\n` +
      `Enlace web (preferido, secreto en #k= — no lo borres):\n${webUrl}\n` +
      (webFallback
        ? `\nRespaldo si WhatsApp corta el enlace (secreto en ?k=):\n${webFallback}\n`
        : '') +
      `\nAbrir en App:\n${schemeUrl}\n\n` +
      `Pasos:\n` +
      `1. Abre el enlace o entra a: https://m1976cl-web.github.io/compatikink/\n` +
      `2. Pulsa "Me invitaron" e introduce: *${session.inviteCode}*\n` +
      `3. Responde en privado (tus respuestas viajan cifradas)\n\n` +
      `Cuando termines, recibiré el análisis de compatibilidad.`;

    try {
      await Share.share({ message: richMessage });
    } catch {
      await Clipboard.setStringAsync(richMessage);
      notify('Copiado', 'La invitación se ha copiado al portapapeles.');
    }
  };

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Cargando…</Text>
      </View>
    );
  }

  const isComplete = session.status === 'complete';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FlowBar step={2} />
        {isComplete ? (
          <NextStepBanner
            variant="report"
            onPress={() => router.replace({ pathname: '/report', params: { token } })}
          />
        ) : (
          <NextStepBanner variant="wait" />
        )}
        <AppHeader
          brand
          title={t('invite.share_title')}
          subtitle={t('invite.share_sub')}
        />
        <NoxHost scene="invite" variant="banner" />

        <QRCodeInviteCard
          inviteCode={session.inviteCode}
          inviteSecret={session.inviteSecret}
          expiresAt={session.expiresAt}
          guestNickname={guestProfile?.nickname}
          onShareFull={shareInvite}
        />

        {guestProfile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileTitle}>Ficha de {guestProfile.nickname}</Text>
            {guestProfile.notes ? (
              <Text style={styles.profileNotes} numberOfLines={3}>
                {guestProfile.notes}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.waiting, isComplete && styles.waitingComplete]}>
          <Text style={[styles.waitingTitle, isComplete && styles.waitingTitleComplete]}>
            {isComplete ? 'Completado — el reporte está listo' : 'Esperando respuesta…'}
          </Text>
          {!isComplete ? (
            <Text style={styles.hint}>La app verifica automáticamente cada 5 segundos.</Text>
          ) : null}
        </View>

        {isComplete ? (
          <Button
            title={t('path.cta_report')}
            onPress={() => router.replace({ pathname: '/report', params: { token } })}
          />
        ) : (
          <Button
            title="Verificar ahora"
            onPress={() => router.push({ pathname: '/report', params: { token } })}
            variant="ghost"
          />
        )}

        <Button
          title="Ver solo mis resultados"
          variant="ghost"
          onPress={() =>
            router.push({
              pathname: '/report',
              params: { token: session.initiatorToken, selfMode: 'true' },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  codeLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  code: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 42,
    letterSpacing: 8,
  },
  codeHint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  shareRow: { flexDirection: 'row', gap: spacing.md },
  waiting: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
  },
  waitingComplete: {
    borderColor: colors.success,
    backgroundColor: 'rgba(107, 155, 122, 0.08)',
  },
  waitingTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  waitingTitleComplete: { color: colors.success },
  muted: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  profileTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  profileNotes: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  qrCardTitle: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  qrCardSub: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrModalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  qrCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCloseText: {
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    fontSize: 16,
  },
  qrModalTitle: {
    fontFamily: fonts.displaySemi,
    color: colors.text,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  qrModalSub: {
    ...typography.bodyMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  qrImageContainer: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  qrModalCodeText: {
    fontFamily: fonts.mono,
    color: colors.primary,
    fontSize: fontSize.md,
    letterSpacing: 2,
  },
});
