import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { EXPERIENCE_LABELS, FetishBadge } from '@/types';
import { CommunityProfile } from '@/data/communityProfiles';

interface Props {
  profile: CommunityProfile;
  score: number;
  roleScore: number;
  mutualMatches: string[];
  hasCrushOnTarget?: boolean;
  isMutualCrush?: boolean;
  privateMediaCount?: number;
  onStartSession: (p: CommunityProfile) => void;
  onOpenChat: (p: CommunityProfile) => void;
  onToggleCrush?: (p: CommunityProfile) => void;
  onOpenAuthorizedMedia?: (p: CommunityProfile) => void;
  onReport?: (p: CommunityProfile) => void;
  onBlock?: (p: CommunityProfile) => void;
}

export function DatingProfileCard({
  profile: item,
  score,
  roleScore,
  mutualMatches,
  hasCrushOnTarget = false,
  isMutualCrush = false,
  privateMediaCount = 0,
  onStartSession,
  onOpenChat,
  onToggleCrush,
  onOpenAuthorizedMedia,
  onReport,
  onBlock,
}: Props) {
  return (
    <View style={styles.profileCard}>
      {/* Top Row: Avatar, Info & Match Score */}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={styles.nickname}>{item.nickname}</Text>
            <Text style={styles.ageText}>{item.age}y</Text>

            {/* Verification Badges */}
            {item.verificationBadges?.map((v, idx) => (
              <View key={idx} style={styles.verifBadge}>
                <Text style={styles.verifBadgeText}>✓ {v}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.metaText}>
            {item.pronouns ? `${item.pronouns} · ` : ''}{item.location}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={styles.roleTagText}>🎭 Rol: {item.role || 'Switch'}</Text>
            <Text style={styles.expBadge}>
              {EXPERIENCE_LABELS[item.experienceLevel ?? 'intermediate']}
            </Text>
          </View>
        </View>

        {/* Score Pill */}
        <View
          style={[
            styles.scorePill,
            score >= 80 ? styles.scoreHigh : score >= 60 ? styles.scoreMed : styles.scoreLow,
          ]}
        >
          <Text style={styles.scoreNumber}>{score}%</Text>
          <Text style={styles.scoreText}>Match Global</Text>
          <Text style={styles.roleSubScore}>Roles: {roleScore}%</Text>
        </View>
      </View>

      {/* Bio */}
      <Text style={styles.bioText}>{item.bio}</Text>

      {/* Glowing Fetish & Role Badges Matrix */}
      {item.fetishBadges && item.fetishBadges.length > 0 && (
        <View style={styles.badgeMatrixSection}>
          <Text style={styles.badgeMatrixTitle}>✨ Insignias Visuales Cifradas:</Text>
          <View style={styles.badgeChipsGrid}>
            {item.fetishBadges.map((badge: FetishBadge) => (
              <View
                key={badge.id}
                style={[
                  styles.visualBadgeChip,
                  { borderColor: badge.color, backgroundColor: `${badge.color}15` },
                ]}
              >
                <Text style={styles.badgeIcon}>{badge.icon || '🏷️'}</Text>
                <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Limits Section */}
      {((item.hardLimits && item.hardLimits.length > 0) || (item.softLimits && item.softLimits.length > 0)) && (
        <View style={styles.limitsBox}>
          {item.hardLimits && item.hardLimits.length > 0 && (
            <View style={styles.limitsRow}>
              <Text style={styles.hardLimitsTitle}>🛑 Límites Duros:</Text>
              <View style={styles.limitsChipsGrid}>
                {item.hardLimits.map((hl, idx) => (
                  <View key={idx} style={styles.hardLimitBadge}>
                    <Text style={styles.hardLimitBadgeText}>{hl}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {item.softLimits && item.softLimits.length > 0 && (
            <View style={styles.limitsRow}>
              <Text style={styles.softLimitsTitle}>⚠️ Límites Suaves:</Text>
              <View style={styles.limitsChipsGrid}>
                {item.softLimits.map((sl, idx) => (
                  <View key={idx} style={styles.softLimitBadge}>
                    <Text style={styles.softLimitBadgeText}>{sl}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Safety Protocols & Safewords */}
      <View style={styles.safetyBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={styles.safetyBoxTitle}>🛡️ Protocolo Seguridad:</Text>
          {(item.safetyProtocols || ['SSC']).map((prot, idx) => (
            <View key={idx} style={styles.protocolChip}>
              <Text style={styles.protocolText}>{prot}</Text>
            </View>
          ))}
        </View>

        {item.safewords && (
          <View style={styles.safewordsRow}>
            <Text style={styles.safewordsLabel}>Semáforo:</Text>
            <Text style={[styles.swItem, { color: colors.success }]}>🟢 {item.safewords.green || 'Verde'}</Text>
            <Text style={[styles.swItem, { color: colors.warning }]}>🟡 {item.safewords.yellow || 'Amarillo'}</Text>
            <Text style={[styles.swItem, { color: colors.danger }]}>🔴 {item.safewords.red || 'Rojo'}</Text>
          </View>
        )}
      </View>

      {/* Mutual Kinks / Top Matches */}
      <View style={styles.kinksSection}>
        <Text style={styles.kinksLabel}>🔥 Intereses principales / Coincidencias:</Text>
        <View style={styles.kinkChipsRow}>
          {mutualMatches.slice(0, 4).map((kink, idx) => (
            <View key={idx} style={styles.kinkChip}>
              <Text style={styles.kinkChipText}>✨ {kink}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions Row with Request Features */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.connectBtn} onPress={() => onStartSession(item)}>
          <Text style={styles.connectBtnText}>⚡ Comparemos Nuestros Resultados 📊</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsGrid}>
          {onToggleCrush ? (
            <TouchableOpacity
              style={[
                styles.crushBtn,
                isMutualCrush ? styles.crushMutualBtn : hasCrushOnTarget ? styles.crushActiveBtn : null,
              ]}
              onPress={() => onToggleCrush(item)}
            >
              <Text style={styles.crushBtnText}>
                {isMutualCrush ? '💖⚡ ¡Match de Crush Mutuo!' : hasCrushOnTarget ? '💖 Crush Enviado (Ciego)' : '💖 Tengo un Crush'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {onOpenAuthorizedMedia ? (
            <TouchableOpacity
              style={styles.mediaVaultBtn}
              onPress={() => onOpenAuthorizedMedia(item)}
            >
              <Text style={styles.mediaVaultBtnText}>🔒 Álbum Privado Autorizado</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.chatAndSafetyRow}>
          <TouchableOpacity style={styles.chatBtn} onPress={() => onOpenChat(item)}>
            <Text style={styles.chatBtnText}>💬 Enviar mensaje directo cifrado</Text>
          </TouchableOpacity>

          {onReport ? (
            <TouchableOpacity
              style={styles.safetyIconBtn}
              onPress={() => onReport(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 13 }}>🚩</Text>
            </TouchableOpacity>
          ) : null}

          {onBlock ? (
            <TouchableOpacity
              style={styles.safetyIconBtn}
              onPress={() => onBlock(item)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 13 }}>🚫</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.sm,
    shadowColor: '#c084fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarEmoji: { fontSize: 44 },
  nickname: { color: colors.neonPurple, fontSize: fontSize.lg, fontWeight: '900' },
  ageText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  roleTagText: { color: colors.neonRose, fontSize: fontSize.xs, fontWeight: '700' },
  expBadge: { color: colors.neonEmerald, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  verifBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifBadgeText: { color: '#38bdf8', fontSize: 9, fontWeight: '800' },

  scorePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  scoreHigh: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.neonEmerald },
  scoreMed: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderColor: colors.neonPurple },
  scoreLow: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: colors.warning },
  scoreNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900' },
  scoreText: { color: colors.textMuted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  roleSubScore: { color: colors.neonRose, fontSize: 8, fontWeight: '700', marginTop: 2 },

  bioText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  badgeMatrixSection: { gap: 6, marginVertical: 2 },
  badgeMatrixTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  badgeChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  visualBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  badgeIcon: { fontSize: 12 },
  badgeLabel: { fontSize: fontSize.xs, fontWeight: '800' },

  limitsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radii.md,
    padding: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  limitsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  hardLimitsTitle: { color: colors.danger, fontSize: 11, fontFamily: fonts.bodySemi, fontWeight: '800' },
  softLimitsTitle: { color: colors.warning, fontSize: 11, fontFamily: fonts.bodySemi, fontWeight: '800' },
  limitsChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  hardLimitBadge: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hardLimitBadgeText: { color: colors.danger, fontSize: 10, fontFamily: fonts.bodySemi, fontWeight: '700' },
  softLimitBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  softLimitBadgeText: { color: colors.warning, fontSize: 10, fontFamily: fonts.bodySemi, fontWeight: '700' },
  safetyBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: 6,
  },
  safetyBoxTitle: { color: colors.neonEmerald, fontSize: fontSize.xs, fontWeight: '800' },
  protocolChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  protocolText: { color: colors.neonEmerald, fontSize: 10, fontWeight: '900' },
  safewordsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  safewordsLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  swItem: { fontSize: fontSize.xs, fontWeight: '700' },

  kinksSection: { gap: 4 },
  kinksLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  kinkChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kinkChip: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  kinkChipText: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '600' },

  actionsRow: { marginTop: 4, gap: spacing.xs },
  connectBtn: {
    backgroundColor: colors.neonPurple,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  connectBtnText: { color: '#000', fontSize: fontSize.sm, fontWeight: '900' },
  chatAndSafetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  safetyIconBtn: {
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionsGrid: { flexDirection: 'row', gap: spacing.xs },
  crushBtn: {
    flex: 1,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  crushActiveBtn: { backgroundColor: 'rgba(244, 63, 94, 0.3)' },
  crushMutualBtn: { backgroundColor: '#f43f5e', borderColor: '#ffffff' },
  crushBtnText: { color: '#f43f5e', fontSize: 11, fontWeight: '800' },
  mediaVaultBtn: {
    flex: 1,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 1,
    borderColor: colors.neonPurple,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  mediaVaultBtnText: { color: colors.neonPurple, fontSize: 11, fontWeight: '800' },
});
