import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { colors, fonts, fontSize, radii, spacing, typography, glowShadowPrimary } from '@/constants/theme';
import { notify } from '@/lib/notify';
import {
  createInviteWebUrl,
  createInviteWebUrlQueryFallback,
  createInviteSchemeUrl,
  generateQRCodeSVG,
} from '@/lib/linking';

export interface QRCodeInviteCardProps {
  inviteCode: string;
  inviteSecret?: string;
  expiresAt?: string;
  guestNickname?: string;
  onShareFull?: () => void;
}

type TabKey = 'qr' | 'link' | 'code';

export function QRCodeInviteCard({
  inviteCode,
  inviteSecret,
  expiresAt,
  guestNickname,
  onShareFull,
}: QRCodeInviteCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('link');
  const [showQrModal, setShowQrModal] = useState(false);

  const expiryText = (() => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Código expirado';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `Expira en ${hours}h`;
    return `Expira en ${days} día${days > 1 ? 's' : ''}`;
  })();

  const handleTabChange = (tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const copyToClipboard = async (text: string, title: string, message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(text);
    notify(title, message);
  };

  const qrData = createInviteWebUrl(inviteCode, inviteSecret);
  const qrSvgUri = generateQRCodeSVG(qrData, 240);

  return (
    <View style={styles.card}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'qr' && styles.tabActive]}
          onPress={() => handleTabChange('qr')}
        >
          <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>📱 QR Presencial</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'link' && styles.tabActive]}
          onPress={() => handleTabChange('link')}
        >
          <Text style={[styles.tabText, activeTab === 'link' && styles.tabTextActive]}>💬 Enlace / Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'code' && styles.tabActive]}
          onPress={() => handleTabChange('code')}
        >
          <Text style={[styles.tabText, activeTab === 'code' && styles.tabTextActive]}>🔢 Código Pin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'qr' && (
          <View style={styles.tabContentCenter}>
            <TouchableOpacity style={styles.qrContainer} onPress={() => setShowQrModal(true)}>
              <Image source={{ uri: qrSvgUri }} style={styles.qrImage} resizeMode="contain" />
              <View style={styles.zoomBadge}>
                <Text style={styles.zoomText}>🔍 Ampliar</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.qrInstructions}>
              Muestra este código a {guestNickname || 'tu invitado'} para escanear en persona.
            </Text>
            <View style={styles.securityBadge}>
              <Text style={styles.securityText}>🔒 Enlace seguro (cifrado local #k=)</Text>
            </View>
          </View>
        )}

        {activeTab === 'link' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionLabel}>Enlace Universal (Recomendado)</Text>
            <View style={styles.copyRow}>
              <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                {createInviteWebUrl(inviteCode, inviteSecret)}
              </Text>
              <Button
                title="Copiar"
                variant="secondary"
                onPress={() =>
                  copyToClipboard(
                    createInviteWebUrl(inviteCode, inviteSecret),
                    'Enlace copiado',
                    'El enlace incluye el fragmento seguro #k=.'
                  )
                }
              />
            </View>

            <Text style={styles.sectionLabel}>Respaldo (si WhatsApp corta el enlace)</Text>
            <View style={styles.copyRow}>
              <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                {inviteSecret ? createInviteWebUrlQueryFallback(inviteCode, inviteSecret) : createInviteWebUrl(inviteCode)}
              </Text>
              <Button
                title="Copiar"
                variant="secondary"
                onPress={() =>
                  copyToClipboard(
                    inviteSecret ? createInviteWebUrlQueryFallback(inviteCode, inviteSecret) : createInviteWebUrl(inviteCode),
                    'Respaldo copiado',
                    'Usa esto solo si el enlace principal falla.'
                  )
                }
              />
            </View>

            <Text style={styles.sectionLabel}>Abrir en App Directamente</Text>
            <View style={styles.copyRow}>
              <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                {createInviteSchemeUrl(inviteCode, inviteSecret)}
              </Text>
              <Button
                title="Copiar"
                variant="secondary"
                onPress={() =>
                  copyToClipboard(
                    createInviteSchemeUrl(inviteCode, inviteSecret),
                    'Deep link copiado',
                    'Enlace para abrir directamente la app.'
                  )
                }
              />
            </View>

            {onShareFull && (
              <Button title="Compartir Invitación Completa" onPress={onShareFull} style={styles.shareFullBtn} />
            )}
          </View>
        )}

        {activeTab === 'code' && (
          <View style={styles.tabContentCenter}>
            <Text style={styles.codeLabel}>CÓDIGO DE ACCESO</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>
            <View style={styles.actionsRow}>
              <Button
                title="Copiar Código"
                variant="secondary"
                onPress={() => copyToClipboard(inviteCode, 'Código copiado', 'Código de un solo uso copiado.')}
              />
            </View>
            {expiryText && (
              <View style={styles.expiryBadge}>
                <Text style={[styles.expiryText, expiryText.startsWith('Código expirado') && styles.expiryTextDanger]}>
                  ⏱️ {expiryText}
                </Text>
              </View>
            )}
            <Text style={styles.qrInstructions}>
              Tu invitado puede ir a la web y escribir este código manualmente.
            </Text>
          </View>
        )}
      </View>

      <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={() => setShowQrModal(false)}>
        <View style={styles.qrOverlay}>
          <View style={styles.qrModalCard}>
            <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQrModal(false)}>
              <Text style={styles.qrCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.qrModalTitle}>Escaneo en Persona</Text>
            <Text style={styles.qrModalSub}>Cifrado local: ningún servidor verá la conexión.</Text>
            <View style={styles.qrImageContainerModal}>
              <Image source={{ uri: qrSvgUri }} style={styles.qrImageModal} resizeMode="contain" />
            </View>
            <Text style={styles.qrModalCodeText}>{inviteCode}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  tabContent: {
    gap: spacing.sm,
  },
  tabContentCenter: {
    alignItems: 'center',
    gap: spacing.md,
  },
  qrContainer: {
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    position: 'relative',
    ...glowShadowPrimary(0.2),
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  zoomText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
  qrInstructions: {
    ...typography.bodyMuted,
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  securityBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  securityText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  urlText: {
    flex: 1,
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: fontSize.xs,
  },
  shareFullBtn: {
    marginTop: spacing.md,
  },
  codeLabel: {
    ...typography.label,
    color: colors.primary,
  },
  codeBox: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...glowShadowPrimary(0.15),
  },
  codeText: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 48,
    letterSpacing: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  expiryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLight,
  },
  expiryText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodySemi,
  },
  expiryTextDanger: {
    color: colors.danger,
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrModalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  qrCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  qrCloseText: {
    fontFamily: fonts.bodyBold,
    color: colors.textMuted,
    fontSize: 18,
  },
  qrModalTitle: {
    fontFamily: fonts.displaySemi,
    color: colors.text,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  qrModalSub: {
    ...typography.bodyMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  qrImageContainerModal: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: radii.xl,
  },
  qrImageModal: {
    width: 280,
    height: 280,
  },
  qrModalCodeText: {
    fontFamily: fonts.mono,
    color: colors.primary,
    fontSize: fontSize.lg,
    letterSpacing: 4,
  },
});
