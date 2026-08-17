import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import {
  Achievement,
  CATEGORY_LABELS,
  RARITY_LABELS,
} from '@/lib/achievements';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  achievement: Achievement | null;
}

export function TrophyInspectionModal({ visible, onClose, achievement }: Props) {
  if (!achievement) return null;

  const catInfo = CATEGORY_LABELS[achievement.category];
  const rarityInfo = RARITY_LABELS[achievement.rarity];

  const handleShareTrophy = async () => {
    triggerLightHaptic();
    const message =
      `🏆 ¡Logro Desbloqueado en CompatKink! 🏆\n\n` +
      `${achievement.emoji} ${achievement.title}\n` +
      `✨ Rareza: ${rarityInfo.label}\n` +
      `💬 "${achievement.flavorText}"\n\n` +
      `🔒 Exploración íntima con cifrado Zero-Knowledge.`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: achievement.title, text: message });
      } else {
        await Share.share({ title: achievement.title, message });
      }
      triggerSuccessHaptic();
    } catch {}
  };

  const handleCopyTrophy = async () => {
    triggerLightHaptic();
    const text = `🏆 Logro: ${achievement.title} (${rarityInfo.label})\n"${achievement.flavorText}"`;
    await Clipboard.setStringAsync(text);
    triggerSuccessHaptic();
    Alert.alert('¡Copiado!', 'El logro se ha copiado al portapapeles.');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalBox, { borderColor: achievement.unlocked ? achievement.glowColor : colors.border }]}>
          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Glowing Pedestal Display */}
          <View
            style={[
              styles.pedestal,
              achievement.unlocked
                ? { borderColor: achievement.glowColor, backgroundColor: `${achievement.glowColor}15` }
                : styles.pedestalLocked,
            ]}
          >
            <Text style={[styles.trophyEmoji, !achievement.unlocked && { opacity: 0.3 }]}>
              {achievement.unlocked ? achievement.emoji : '🔒'}
            </Text>
            {achievement.unlocked && (
              <View style={[styles.glowRing, { borderColor: achievement.glowColor }]} />
            )}
          </View>

          {/* Rarity & Category Pills */}
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: `${rarityInfo.color}20`, borderColor: rarityInfo.color }]}>
              <Text style={[styles.pillText, { color: rarityInfo.color }]}>{rarityInfo.label}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: `${catInfo.color}20`, borderColor: catInfo.color }]}>
              <Text style={[styles.pillText, { color: catInfo.color }]}>{catInfo.emoji} {catInfo.label}</Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.desc}>{achievement.description}</Text>

          {/* Flavor Text Quote */}
          {achievement.flavorText ? (
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{achievement.flavorText}"</Text>
            </View>
          ) : null}

          {/* Status Badge */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <Text style={[styles.statusVal, { color: achievement.unlocked ? '#4ade80' : colors.textMuted }]}>
              {achievement.unlocked ? '✨ Desbloqueado en tu Bóveda' : '🔒 Bloqueado (Completa los requisitos)'}
            </Text>
          </View>

          {/* Action Buttons */}
          {achievement.unlocked ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrophy} activeOpacity={0.85}>
                <Text style={styles.shareBtnText}>📤 Compartir Trofeo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyTrophy} activeOpacity={0.85}>
                <Text style={styles.copyBtnText}>📋</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
              <Text style={styles.closeActionBtnText}>Entendido</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    backgroundColor: '#0c0714',
    borderRadius: radii.xl,
    padding: spacing.lg,
    maxWidth: 420,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    gap: spacing.sm,
    ...glowShadowPrimary,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    zIndex: 10,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  pedestal: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  pedestalLocked: {
    borderColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  trophyEmoji: {
    fontSize: 48,
  },
  glowRing: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    opacity: 0.4,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: 2,
  },
  desc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  quoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginVertical: 4,
    width: '100%',
  },
  quoteText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  statusVal: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
    marginTop: spacing.xs,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  copyBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radii.lg,
  },
  copyBtnText: {
    fontSize: 16,
  },
  closeActionBtn: {
    backgroundColor: colors.surfaceLight,
    width: '100%',
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  closeActionBtnText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
});
