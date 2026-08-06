import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/types';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

interface ProfileBarProps {
  profile: UserProfile | null;
  vaultOpen: boolean;
  onLoginClick?: () => void;
}

export function ProfileBar({ profile, vaultOpen, onLoginClick }: ProfileBarProps) {
  const router = useRouter();

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={styles.anonymousBadge}>👤 MODO INVITADO</Text>
          <Text style={styles.subtitle}>Respuestas guardadas localmente</Text>
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={onLoginClick || (() => router.push('/auth'))}>
          <Text style={styles.loginBtnText}>Entrar / Registrar PIN 🔐</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.profileBadge}>
          <Text style={styles.avatarEmoji}>👑</Text>
          <View>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.level}>
              {profile.experienceLevel ? `Nivel: ${profile.experienceLevel}` : 'Perfil Cifrado Local'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.vaultStatusBtn, vaultOpen && styles.vaultStatusBtnUnlocked]}
        onPress={() => {
          if (vaultOpen) VaultLockGateAPI.lock();
          else router.push('/auth' as any);
        }}
      >
        <Text style={styles.vaultStatusText}>
          {vaultOpen ? '🔓 Bóveda Desbloqueada' : '🔒 Bóveda Bloqueada'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18,11,34,0.85)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.3)',
    marginBottom: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  anonymousBadge: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  loginBtn: { backgroundColor: colors.accentSoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary },
  loginBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  profileBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarEmoji: { fontSize: 24 },
  nickname: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: fontSize.md },
  level: { color: colors.textMuted, fontSize: fontSize.xs },
  vaultStatusBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  vaultStatusBtnUnlocked: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)' },
  vaultStatusText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
});
