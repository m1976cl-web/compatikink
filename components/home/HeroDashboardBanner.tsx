import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useHomeStore, HomeState } from '@/stores/homeStore';
import { VaultSession } from '@/lib/cryptoVault';
import { StreakBadgeWidget } from '@/components/gamification/StreakBadgeWidget';

export function HeroDashboardBanner() {
  const router = useRouter();
  const profileState = useHomeStore((s: HomeState) => s.profile);
  const activeNickname = typeof profileState === 'string' ? profileState : profileState?.nickname || 'Explorador Anon';
  const profilesList = useHomeStore((s: HomeState) => s.profilesList || []);

  const activeProfileObj = profilesList.find((p: any) => p.nickname === activeNickname);
  const isUnlocked = VaultSession.isUnlocked();
  const isDecoy = VaultSession.isDecoyMode();

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.glassCard}>
        {/* TOP STATUS BAR */}
        <View style={styles.topRow}>
          <View style={styles.zkStatusBadge}>
            <Text style={styles.zkStatusDot}>{isDecoy ? '🟡' : isUnlocked ? '🟢' : '🔒'}</Text>
            <Text style={styles.zkStatusText}>
              {isDecoy
                ? 'Modo Señuelo Activo (Decoy PIN)'
                : isUnlocked
                ? 'Bóveda Cifrada AES-256 (Clave en RAM)'
                : 'Bóveda Protegida (Cifrado ZK)'}
            </Text>
          </View>

          {activeProfileObj?.isLocalAdmin && (
            <TouchableOpacity style={styles.adminChip} onPress={() => router.push('/admin-dashboard')}>
              <Text style={styles.adminChipText}>👑 Panel Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* HERO TITLE & SUBTITLE */}
        <View style={styles.heroContent}>
          <Text style={styles.greetingText}>
            Bienvenidx, <Text style={styles.nicknameText}>{activeNickname}</Text>
          </Text>
          <Text style={styles.heroTagline}>
            Exploración de compatibilidad íntima asimétrica, consentida y con cifrado Zero-Knowledge.
          </Text>
        </View>

        {/* STREAK WIDGET */}
        <StreakBadgeWidget />

        {/* QUICK ACTIONS ROW */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => router.push('/invite')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnPrimaryText}>✨ Nueva Invitación Cifrada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => router.push('/live-scene')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnSecondaryText}>⚡ Modo Escena en Vivo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  glassCard: {
    backgroundColor: 'rgba(21, 13, 36, 0.85)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    gap: spacing.sm,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 32px rgba(7, 4, 13, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  zkStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 8, 20, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.2)',
    gap: 6,
  },
  zkStatusDot: { fontSize: 10 },
  zkStatusText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.bodySemi,
  },
  adminChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  adminChipText: {
    color: '#fbbf24',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
  },
  heroContent: {
    marginVertical: 4,
  },
  greetingText: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: 0.2,
  },
  nicknameText: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
  },
  heroTagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnPrimaryText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
    borderColor: colors.accent,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
