import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing } from '@/constants/theme';
import { CompatibilityReport } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  report: CompatibilityReport;
  initiatorName: string;
  guestName: string;
}

export function SocialShareModal({ visible, onClose, report, initiatorName, guestName }: Props) {
  const {
    compatibilityScore,
    mutualMatchCount,
    exploreCount,
    initiatorArchetype,
    guestArchetype,
    initiatorCompass,
    guestCompass,
    initiatorProfile,
    guestProfile,
  } = report;

  const initNick = initiatorProfile?.nickname || initiatorName || 'Tú';
  const guestNick = guestProfile?.nickname || guestName || 'Invitado';

  const copySummaryText = async () => {
    const text =
      `🔥 Compatikink — Infografía de Compatibilidad 🔥\n` +
      `${initNick} ❤️ ${guestNick}\n\n` +
      `✨ Compatibilidad General: ${compatibilityScore}%\n` +
      `💜 Matches Mutuos: ${mutualMatchCount} actividades\n` +
      `💡 Explorar Juntos: ${exploreCount} actividades\n\n` +
      `👑 Arquetipos:\n` +
      `• ${initNick}: ${initiatorArchetype}\n` +
      `• ${guestNick}: ${guestArchetype}\n\n` +
      `💬 Generado de forma privada en Compatikink`;

    await Clipboard.setStringAsync(text);
    Alert.alert('¡Copiado!', 'El resumen de la infografía se ha copiado al portapapeles.');
  };

  const handleDownloadImage = () => {
    if (Platform.OS === 'web') {
      try {
        window.print();
      } catch {
        Alert.alert('Captura lista', 'Toma una captura de pantalla a la tarjeta para compartirla en tu historia.');
      }
    } else {
      Alert.alert('Captura lista', 'Toma una captura de pantalla a la tarjeta visual para compartirla en tus historias.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tarjeta de Infografía 📸</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* The Stylized Social Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.brandEmoji}>🔥</Text>
                <Text style={styles.brandTitle}>COMPATIKINK</Text>
                <Text style={styles.brandTagline}>KINK ALIGNMENT & COMPATIBILITY</Text>
              </View>

              {/* Score Display */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreNumber}>{compatibilityScore}%</Text>
                <Text style={styles.scoreText}>COMPATIBILIDAD MUTUA</Text>
              </View>

              {/* Mini Compass Grid */}
              <View style={styles.miniCompassContainer}>
                <Text style={[styles.compassAxis, styles.axisTop]}>Dom</Text>
                <Text style={[styles.compassAxis, styles.axisBottom]}>Sub</Text>
                <Text style={[styles.compassAxis, styles.axisLeft]}>Vanilla</Text>
                <Text style={[styles.compassAxis, styles.axisRight]}>Exp</Text>

                <View style={styles.gridLineX} />
                <View style={styles.gridLineY} />

                {/* Dots */}
                <View
                  style={[
                    styles.dot,
                    styles.initDot,
                    { left: `${initiatorCompass.x}%`, bottom: `${initiatorCompass.y}%` },
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    styles.guestDot,
                    { left: `${guestCompass.x}%`, bottom: `${guestCompass.y}%` },
                  ]}
                />
              </View>

              {/* Archetypes Comparison Box */}
              <View style={styles.archetypeBox}>
                <View style={styles.archetypeUserCol}>
                  <Text style={styles.userDotName}>🟣 {initNick}</Text>
                  <Text style={styles.archetypeName}>{initiatorArchetype}</Text>
                </View>

                <View style={styles.archetypeDivider} />

                <View style={styles.archetypeUserCol}>
                  <Text style={styles.userDotName}>🌸 {guestNick}</Text>
                  <Text style={styles.archetypeName}>{guestArchetype}</Text>
                </View>
              </View>

              {/* Key Stats Bar */}
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{mutualMatchCount}</Text>
                  <Text style={styles.statLabel}>Matches</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{exploreCount}</Text>
                  <Text style={styles.statLabel}>Explorar</Text>
                </View>
              </View>

              {/* Footer watermark */}
              <Text style={styles.cardWatermark}>compatikink.app · privado & consensuado</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={copySummaryText}>
                <Text style={styles.actionBtnTextPrimary}>📋 Copiar Resumen</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleDownloadImage}>
                <Text style={styles.actionBtnTextSecondary}>🖼️ Imprimir / Capturar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#130d1a',
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(147, 51, 234, 0.4)',
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  brandTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandTagline: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    marginBottom: spacing.md,
    width: '100%',
  },
  scoreNumber: {
    color: colors.primaryLight,
    fontSize: 44,
    fontWeight: '800',
  },
  scoreText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  miniCompassContainer: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  compassAxis: {
    position: 'absolute',
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  axisTop: { top: 4, alignSelf: 'center' },
  axisBottom: { bottom: 4, alignSelf: 'center' },
  axisLeft: { left: 6, top: '45%' },
  axisRight: { right: 6, top: '45%' },
  gridLineX: {
    position: 'absolute',
    left: 0, right: 0, top: '50%',
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  gridLineY: {
    position: 'absolute',
    top: 0, bottom: 0, left: '50%',
    width: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    transform: [{ translateX: -5 }, { translateY: 5 }],
  },
  initDot: {
    backgroundColor: colors.primary,
  },
  guestDot: {
    backgroundColor: colors.accent,
  },
  archetypeBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: spacing.md,
  },
  archetypeUserCol: {
    flex: 1,
    alignItems: 'center',
  },
  userDotName: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  archetypeName: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  archetypeDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  cardWatermark: {
    color: colors.textMuted,
    fontSize: 9,
    fontStyle: 'italic',
  },
  actionsRow: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnTextPrimary: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionBtnTextSecondary: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
