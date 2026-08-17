import { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Share, Image, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
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
import { useTranslation } from '@/lib/i18n';

export default function InviteScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

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
    notify('Copiado', 'Código copiado al portapapeles.');
  };

  const copyLink = async () => {
    if (!session) return;
    const secret = session.inviteSecret;
    const primary = createInviteWebUrl(session.inviteCode, secret);
    const fallback = secret
      ? createInviteWebUrlQueryFallback(session.inviteCode, secret)
      : null;
    const payload = fallback
      ? `${primary}\n\nSi WhatsApp corta el enlace, usa este respaldo (el secreto va en ?k=):\n${fallback}`
      : primary;
    await Clipboard.setStringAsync(payload);
    notify(
      'Enlace copiado',
      secret
        ? 'Incluye #k= (preferido) y un respaldo ?k= por si el chat trunca el fragmento. No borres la parte tras # o ?.'
        : 'Enlace copiado al portapapeles.'
    );
  };

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

  const expiryText = (() => {
    if (!session.expiresAt) return null;
    const diff = new Date(session.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Código expirado';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `Expira en ${hours}h`;
    return `Expira en ${days} día${days > 1 ? 's' : ''}`;
  })();

  const qrData = createInviteWebUrl(session.inviteCode, session.inviteSecret);
  const qrSvgUri = generateQRCodeSVG(qrData, 240);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          brand
          title={t('invite.share_title')}
          subtitle={t('invite.share_sub')}
        />
        <NoxHost scene="invite" variant="banner" />

        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>{t('invite.code_label')}</Text>
          <Text style={styles.code}>{session.inviteCode}</Text>
          <Text style={styles.codeHint}>{t('invite.one_use')}</Text>
          {expiryText ? (
            <Text
              style={[
                styles.codeHint,
                {
                  color: expiryText.startsWith('Código expirado') ? colors.danger : colors.warning,
                  marginTop: 4,
                },
              ]}
            >
              {expiryText}
            </Text>
          ) : null}
        </View>

        <View style={styles.shareRow}>
          <Button title={t('invite.copy_code')} onPress={copyCode} style={{ flex: 1 }} />
          <Button title={t('invite.copy_link')} onPress={copyLink} variant="secondary" style={{ flex: 1 }} />
        </View>

        <Text style={styles.hint}>{t('invite.whatsapp_warn')}</Text>
        <Button title={t('invite.share_full')} onPress={shareInvite} variant="secondary" />

        <TouchableOpacity
          style={styles.selfReportBtn}
          onPress={() => router.push({ pathname: '/report', params: { token: session.initiatorToken, selfMode: 'true' } })}
        >
          <Text style={styles.selfReportBtnText}>📊 Ver Mis Propios Resultados & Mapa de Gustos</Text>
          <Text style={styles.selfReportBtnSub}>Explora tus límites duros, aficiones y preferencias sin esperar al invitado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileCtaCard}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.profileCtaBadge}>✨ PASO 2 RECOMENDADO</Text>
          <Text style={styles.profileCtaTitle}>Completa tu Perfil & Álbum Cifrado (FetLife Style)</Text>
          <Text style={styles.profileCtaSub}>Sube fotos/videos con permisos de visibilidad (Público, Solo Amigos Mutuos, Autorizados o Bóveda)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.qrCard} onPress={() => setShowQrModal(true)}>
          <Text style={styles.qrCardTitle}>Código QR (Local Offline)</Text>
          <Text style={styles.qrCardSub}>Mostrar para escanear cara a cara (100% cifrado local)</Text>
        </TouchableOpacity>

        <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={() => setShowQrModal(false)}>
          <View style={styles.qrOverlay}>
            <View style={styles.qrModalCard}>
              <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQrModal(false)}>
                <Text style={styles.qrCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.qrModalTitle}>Escanear para responder</Text>
              <Text style={styles.qrModalSub}>El enlace incluye el secreto de cifrado de la sesión (Local SVG Offline).</Text>
              <View style={styles.qrImageContainer}>
                <Image
                  source={{ uri: qrSvgUri }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrModalCodeText}>{session.inviteCode}</Text>
              <Button title="Cerrar" variant="ghost" onPress={() => setShowQrModal(false)} />
            </View>
          </View>
        </Modal>

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
            title="Ver reporte de compatibilidad"
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
  selfReportBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.xs,
  },
  selfReportBtnText: {
    color: colors.neonPurple,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  selfReportBtnSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  profileCtaCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.xs,
  },
  profileCtaBadge: {
    color: '#38bdf8',
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
  },
  profileCtaTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  profileCtaSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
