import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { loginProfile, logoutProfile } from '@/lib/storage';
import { notify } from '@/lib/notify';
import { colors, fonts, spacing } from '@/constants/theme';

export function ProfileBar() {
  const { profile, loadHomeData } = useHomeStore();
  const [loginNick, setLoginNick] = useState('');
  const [loginPin, setLoginPin] = useState('');

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
        <Text style={styles.greeting}>Hola, {profile.nickname}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nick"
        placeholderTextColor={colors.textMuted || '#888'}
        value={loginNick}
        onChangeText={setLoginNick}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        placeholderTextColor={colors.textMuted || '#888'}
        value={loginPin}
        onChangeText={setLoginPin}
        secureTextEntry
        keyboardType="number-pad"
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  greeting: { fontFamily: fonts.bodySemi || fonts.body, color: colors.text, fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: colors.background, fontFamily: fonts.bodySemi },
});
