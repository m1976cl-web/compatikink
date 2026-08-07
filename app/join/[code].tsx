import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { parseInviteSecretFromUrl } from '@/lib/sessions';
import { colors } from '@/constants/theme';

export default function JoinRedirectScreen() {
  const { code, k } = useLocalSearchParams<{ code?: string; k?: string | string[] }>();
  const router = useRouter();

  useEffect(() => {
    if (!code) return;
    const rawCode = Array.isArray(code) ? code[0] : code;
    const rawK = Array.isArray(k) ? k[0] : k;
    const secret = (typeof rawK === 'string' ? rawK : undefined) || parseInviteSecretFromUrl();

    if (secret) {
      const encSecret = encodeURIComponent(secret);
      router.replace(`/guest/${rawCode}?k=${encSecret}#k=${encSecret}`);
    } else {
      router.replace(`/guest/${rawCode}`);
    }
  }, [code, k, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
