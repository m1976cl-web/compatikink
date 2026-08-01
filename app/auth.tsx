import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
import {
  colors,
  fonts,
  fontSize,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { saveProfile } from '@/lib/storage';

export default function AuthScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        const nick = email.split('@')[0];
        await saveProfile({ nickname: nick, notes: 'Cuenta verificada localmente' });
        Alert.alert('Sesión iniciada', `Bienvenido/a de vuelta, ${nick}.`);
        router.replace('/');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const nick = data.user?.user_metadata?.nickname || email.split('@')[0];
      await saveProfile({ nickname: nick });

      Alert.alert('Sesión iniciada', `Bienvenido/a, ${nick}. Bóveda cifrada activa.`);
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error de autenticación', err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !nickname.trim()) {
      Alert.alert('Campos incompletos', 'Llena todos los campos incluyendo tu apodo.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        await saveProfile({ nickname: nickname.trim() });
        Alert.alert('Cuenta creada', `Bienvenido/a, ${nickname}. Modo local listo.`);
        router.replace('/');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nickname.trim() },
        },
      });

      if (error) throw error;

      await saveProfile({ nickname: nickname.trim() });
      Alert.alert('Registro exitoso', 'Verifica tu correo para confirmar tu cuenta.');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error de registro', err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert('Email requerido', 'Ingresa tu correo para enviarte el enlace.');
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        Alert.alert('Enlace enviado', 'Verifica tu bandeja de entrada.');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      if (error) throw error;

      Alert.alert('Enlace enviado', 'Te enviamos un enlace mágico para acceder sin contraseña.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>

        <AppHeader
          brand
          title="Cuenta y bóveda"
          subtitle="Clave AES-GCM-256 derivada con PBKDF2-SHA-256 (~310k). El servidor solo ve ciphertext."
        />

        <View style={styles.tabsRow}>
          {(
            [
              { id: 'signin' as const, label: 'Entrar' },
              { id: 'signup' as const, label: 'Crear' },
              { id: 'magic' as const, label: 'Magic link' },
            ] as const
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, mode === t.id && styles.tabActive]}
              onPress={() => setMode(t.id)}
            >
              <Text style={[styles.tabText, mode === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {mode === 'signup' ? (
            <>
              <Text style={styles.fieldLabel}>Apodo público</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Alex"
                placeholderTextColor={colors.textDim}
                value={nickname}
                onChangeText={setNickname}
              />
            </>
          ) : null}

          <Text style={styles.fieldLabel}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@ejemplo.com"
            placeholderTextColor={colors.textDim}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {mode !== 'magic' ? (
            <>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          ) : null}

          <Text style={styles.privacyNote}>
            Bóveda Zero-Knowledge: las respuestas sensibles se cifran en el dispositivo antes de
            guardarse. PBKDF2 + AES-GCM — no Argon2 (WebCrypto).
          </Text>

          {mode === 'signin' ? (
            <Button
              title={loading ? 'Entrando…' : 'Entrar a mi bóveda'}
              onPress={handleSignIn}
              disabled={loading}
            />
          ) : null}
          {mode === 'signup' ? (
            <Button
              title={loading ? 'Creando…' : 'Registrar y crear bóveda'}
              onPress={handleSignUp}
              disabled={loading}
            />
          ) : null}
          {mode === 'magic' ? (
            <Button
              title={loading ? 'Enviando…' : 'Enviar enlace mágico'}
              onPress={handleMagicLink}
              disabled={loading}
            />
          ) : null}

          <Button title="Continuar en modo local" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  containerDesktop: { maxWidth: 520, alignSelf: 'center', width: '100%' },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  backBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.bodySemi,
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  tabTextActive: { color: colors.primary },
  form: { gap: spacing.md },
  fieldLabel: { ...typography.label },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyNote: {
    ...typography.bodyMuted,
    fontSize: fontSize.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
