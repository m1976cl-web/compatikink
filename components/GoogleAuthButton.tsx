import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  signInWithGoogle,
  signOutSupabase,
  getSupabaseUser,
  subscribeToAuthChanges,
  UserAuthSession,
} from '@/lib/supabaseAuth';
import { triggerSuccessHaptic, triggerLightHaptic } from '@/lib/haptics';

interface Props {
  onSuccess?: (user: UserAuthSession['user']) => void;
  style?: object;
}

export function GoogleAuthButton({ onSuccess, style }: Props) {
  const [user, setUser] = useState<UserAuthSession['user'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getSupabaseUser().then((u) => {
      setUser(u);
      if (u && onSuccess) onSuccess(u);
    });

    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      if (u && onSuccess) onSuccess(u);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    triggerLightHaptic();
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);

    if (res.error) {
      Alert.alert('Error de Autenticación', res.error);
    } else if (res.url && Platform.OS === 'web') {
      window.location.href = res.url;
    }
  };

  const handleLogout = async () => {
    triggerLightHaptic();
    await signOutSupabase();
    setUser(null);
    triggerSuccessHaptic();
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const name = user.user_metadata?.full_name || user.email || 'Usuario de Google';

    return (
      <View style={[styles.userBadgeCard, style]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Salir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.googleBtn, style]}
      onPress={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continuar con cuenta de Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: radii.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  googleBtnText: {
    color: '#3c4043',
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  userBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  userEmail: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logoutBtnText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
});
