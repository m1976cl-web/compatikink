import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { CompatibilityReport, CATEGORY_LABELS, ActivityCategory } from '@/types';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  report: CompatibilityReport;
  initiatorName?: string;
  guestName?: string;
}

type CardFormat = 'story' | 'square' | 'badge';

export function ShareableMatchCardModal({
  visible,
  onClose,
  report,
  initiatorName = 'Tú',
  guestName = 'Invitado',
}: Props) {
  const [format, setFormat] = useState<CardFormat>('story');

  const {
    compatibilityScore,
    mutualMatchCount,
    exploreCount,
    initiatorArchetype,
    guestArchetype,
    categoryCompatibilities = {},
  } = report;

  // Derive top matching category names from Record<string, number>
  const topCategories = Object.entries(categoryCompatibilities || {})
    .filter(([_, score]) => score >= 50)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => CATEGORY_LABELS[cat as ActivityCategory] || cat);

  const getTierInfo = (score: number) => {
    if (score >= 80) return { label: 'Conexión Íntima Excepcional', emoji: '🔥', color: '#c084fc' };
    if (score >= 60) return { label: 'Alta Compatibilidad y Deseo', emoji: '✨', color: '#f472b6' };
    if (score >= 40) return { label: 'Exploración Curiosa Mutua', emoji: '🌟', color: '#38bdf8' };
    return { label: 'Compatibilidad en Descubrimiento', emoji: '🌱', color: '#4ade80' };
  };

  const tier = getTierInfo(compatibilityScore);

  const getFormattedShareText = () => {
    return (
      `🔥 CompatKink — Tarjeta de Compatibilidad Íntima 🔥\n\n` +
      `✨ Compatibilidad General: ${compatibilityScore}% ${tier.emoji}\n` +
      `💜 Nivel: ${tier.label}\n` +
      `🎯 Intereses Mutuos: ${mutualMatchCount} prácticas coincidentes\n` +
      `💡 Áreas para Explorar: ${exploreCount} actividades\n` +
      (topCategories.length > 0 ? `✨ Categorías Top: ${topCategories.join(', ')}\n` : '') +
      `\n🔒 Generado con cifrado Zero-Knowledge en CompatKink (100% privado y anónimo).`
    );
  };

  const handleShare = async () => {
    triggerLightHaptic();
    const message = getFormattedShareText();
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'CompatKink — Tarjeta de Compatibilidad',
          text: message,
        });
        triggerSuccessHaptic();
      } else {
        await Share.share({
          message,
          title: 'CompatKink — Tarjeta de Compatibilidad',
        });
        triggerSuccessHaptic();
      }
    } catch {
      // User dismissed share dialog
    }
  };

  const handleCopyText = async () => {
    triggerLightHaptic();
    const text = getFormattedShareText();
    await Clipboard.setStringAsync(text);
    triggerSuccessHaptic();
    Alert.alert('¡Copiado!', 'El resumen anónimo se ha copiado al portapapeles.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>📤 Tarjeta de Compatibilidad Compartible</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Format Selector Pills */}
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatPill, format === 'story' && styles.formatPillActive]}
              onPress={() => setFormat('story')}
            >
              <Text style={[styles.formatPillText, format === 'story' && styles.formatPillTextActive]}>
                📱 Story (9:16)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatPill, format === 'square' && styles.formatPillActive]}
              onPress={() => setFormat('square')}
            >
              <Text style={[styles.formatPillText, format === 'square' && styles.formatPillTextActive]}>
                🔲 Post / Chat (1:1)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatPill, format === 'badge' && styles.formatPillActive]}
              onPress={() => setFormat('badge')}
            >
              <Text style={[styles.formatPillText, format === 'badge' && styles.formatPillTextActive]}>
                🏷️ Badge Mínimo
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Visual Card Canvas Preview */}
            <View
              style={[
                styles.cardCanvas,
                format === 'story' && styles.cardStory,
                format === 'square' && styles.cardSquare,
                format === 'badge' && styles.cardBadge,
              ]}
            >
              {/* Branding Top */}
              <View style={styles.cardBrandRow}>
                <Text style={styles.cardBrandName}>⚡ CompatKink</Text>
                <View style={styles.zkPill}>
                  <Text style={styles.zkPillText}>🔒 Zero-Knowledge</Text>
                </View>
              </View>

              {/* Big Score Meter */}
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{compatibilityScore}%</Text>
                <Text style={styles.scoreSubtext}>COMPATIBILIDAD</Text>
              </View>

              {/* Tier & Mood Tag */}
              <View style={[styles.tierBadge, { borderColor: tier.color }]}>
                <Text style={[styles.tierText, { color: tier.color }]}>
                  {tier.emoji} {tier.label}
                </Text>
              </View>

              {format !== 'badge' && (
                <>
                  {/* Archetype highlights if present */}
                  {initiatorArchetype && guestArchetype ? (
                    <View style={styles.archetypesRow}>
                      <View style={styles.archetypeBox}>
                        <Text style={styles.archetypeLabel}>Arquetipo A</Text>
                        <Text style={styles.archetypeName}>{initiatorArchetype}</Text>
                      </View>
                      <Text style={styles.archetypeDivider}>⚡</Text>
                      <View style={styles.archetypeBox}>
                        <Text style={styles.archetypeLabel}>Arquetipo B</Text>
                        <Text style={styles.archetypeName}>{guestArchetype}</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* Highlights Grid */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricNum}>{mutualMatchCount}</Text>
                      <Text style={styles.metricLabel}>Coincidencias</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricNum}>{exploreCount}</Text>
                      <Text style={styles.metricLabel}>Por Explorar</Text>
                    </View>
                  </View>

                  {/* Top Matching Categories */}
                  {topCategories.length > 0 && (
                    <View style={styles.topCatsWrap}>
                      <Text style={styles.topCatsTitle}>Puntos Fuertes:</Text>
                      <View style={styles.catChipsRow}>
                        {topCategories.map((c, i) => (
                          <View key={i} style={styles.catChip}>
                            <Text style={styles.catChipText}>✨ {c}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}

              {/* Watermark Bottom */}
              <View style={styles.watermarkRow}>
                <Text style={styles.watermarkText}>
                  Sin nombres ni límites expuestos • 100% Privado
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsBox}>
              <TouchableOpacity style={styles.primaryShareBtn} onPress={handleShare} activeOpacity={0.85}>
                <Text style={styles.primaryShareBtnText}>📱 Compartir Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryCopyBtn} onPress={handleCopyText} activeOpacity={0.85}>
                <Text style={styles.secondaryCopyBtnText}>📋 Copiar Resumen al Portapapeles</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy Guarantee Note */}
            <View style={styles.privacyNote}>
              <Text style={styles.privacyNoteIcon}>🛡️</Text>
              <Text style={styles.privacyNoteText}>
                Esta tarjeta fue diseñada siguiendo el principio Zero-Knowledge: nunca incluye nombres reales, respuestas específicas ni límites íntimos.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 2,
  },
  formatPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  formatPillActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  formatPillText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  formatPillTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  scrollBody: {
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  cardCanvas: {
    backgroundColor: '#0c0714',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    alignItems: 'center',
    gap: spacing.md,
    ...glowShadowPrimary,
  },
  cardStory: {
    paddingVertical: spacing.xl,
    minHeight: 380,
  },
  cardSquare: {
    minHeight: 320,
  },
  cardBadge: {
    paddingVertical: spacing.md,
  },
  cardBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardBrandName: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.sm,
    letterSpacing: 1,
  },
  zkPill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  zkPillText: {
    color: '#4ade80',
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scoreNumber: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: 34,
    lineHeight: 36,
  },
  scoreSubtext: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1,
  },
  tierBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tierText: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  archetypesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  archetypeBox: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  archetypeLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.bodySemi,
  },
  archetypeName: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  archetypeDivider: {
    color: colors.primary,
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNum: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  topCatsWrap: {
    width: '100%',
    gap: 4,
    alignItems: 'center',
  },
  topCatsTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  catChip: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  catChipText: {
    color: colors.text,
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
  watermarkRow: {
    marginTop: 4,
  },
  watermarkText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.body,
    opacity: 0.7,
  },
  actionsBox: {
    gap: spacing.xs,
  },
  primaryShareBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  primaryShareBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  secondaryCopyBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  secondaryCopyBtnText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    padding: spacing.sm,
    borderRadius: radii.md,
  },
  privacyNoteIcon: {
    fontSize: 18,
  },
  privacyNoteText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.body,
  },
});
