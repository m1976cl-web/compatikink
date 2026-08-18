import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useHomeStore } from '@/stores/homeStore';
import { loginProfile, logoutProfile } from '@/lib/storage';
import { notify } from '@/lib/notify';
import { colors, fonts, spacing } from '@/constants/theme';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { StreakBadgeWidget } from '@/components/gamification/StreakBadgeWidget';
import { useTranslation } from '@/lib/i18n';
import { AvatarArchetypeSelectorModal } from '@/components/profile/AvatarArchetypeSelectorModal';
import { getUserAvatarSelection, getNoxAvatarById, NoxAvatarItem } from '@/lib/noxAvatars';

export function ProfileBar() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, loadHomeData } = useHomeStore();
  const [loginNick, setLoginNick] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [avatarItem, setAvatarItem] = useState<NoxAvatarItem | null>(null);

  const loadAvatar = useCallback(async () => {
    const { avatarId } = await getUserAvatarSelection();
    setAvatarItem(getNoxAvatarById(avatarId));
  }, []);

  useEffect(() => {
    if (profile) {
      loadAvatar();
    }
  }, [profile, loadAvatar]);

  const handleLogin = async () => {
    if (!loginNick.trim()) {
      notify('Datos incompletos', 'Selecciona o ingresa tu nick.');
      return;
    }
    const res = await loginProfile(loginNick.trim(), loginPin);
    if (res) {
      setLoginPin('');
      await loadHomeData();
    } else {
      notify('Error de login', 'Nick o PIN incorrecto.');
    }
  };

  const handleLogout = async () => {
    await logoutProfile();
    await loadHomeData();
  };

  if (profile) {
    return (
      <View style={styles.container}>
        <View style={styles.profileRow}>
          {avatarItem && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View style={[styles.avatarFrame, { borderColor: avatarItem.glowColor }]}>
                <Image source={avatarItem.imageSource} style={styles.avatarImage} />
              </View>
            </TouchableOpacity>
          )}
          <Text style={styles.greeting}>{t('home.hello', { name: profile.nickname })}</Text>
          <StreakBadgeWidget compact />
          {profile.isLocalAdmin ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 ADMINISTRADOR</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          {profile.isLocalAdmin ? (
            <TouchableOpacity onPress={() => router.push('/admin-dashboard')} style={styles.adminButton}>
              <Text style={styles.adminButtonText}>👑 Abrir Dashboard Admin</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleLogout} style={styles.button}>
            <Text style={styles.buttonText}>{t('home.logout')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <GoogleAuthButton />
        </View>

        <AvatarArchetypeSelectorModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          onSave={loadAvatar}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.googleContainer}>
        <GoogleAuthButton />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o entrar con Nick & PIN</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('home.login_nick')}
        placeholderTextColor={colors.textMuted || '#888'}
        value={loginNick}
        onChangeText={setLoginNick}
      />
      <TextInput
        style={styles.input}
        placeholder={t('home.login_pin')}
        placeholderTextColor={colors.textMuted || '#888'}
        value={loginPin}
        onChangeText={setLoginPin}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>{t('home.cta_vault')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  avatarFrame: { borderWidth: 2, borderRadius: 24, padding: 2, marginRight: spacing.xs },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  greeting: { fontFamily: fonts.bodySemi || fonts.body, color: colors.text, fontSize: 18 },
  adminBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs },
  adminButton: { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderWidth: 1, borderColor: '#fbbf24', padding: 8, borderRadius: 8 },
  adminButtonText: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  googleContainer: { marginBottom: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs, gap: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border || 'rgba(255,255,255,0.1)' },
  dividerText: { color: colors.textMuted || '#94a3b8', fontSize: 11 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { color: '#000', fontFamily: fonts.bodySemi, fontWeight: '700' },
});
