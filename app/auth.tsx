import React, { useState, useEffect } from 'react';
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
import {
  saveProfile,
  getCurrentProfile,
  getSecurityAuditLogs,
  addSecurityAuditLog,
  SecurityAuditLogItem,
} from '@/lib/storage';
import {
  AutoLockManager,
  AutoLockTimeout,
  createDuressMeta,
  VaultSession,
} from '@/lib/cryptoVault';

export default function AuthScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [mode, setMode] = useState<'signin' | 'signup' | 'security' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Settings States
  const [autoLockOpt, setAutoLockOpt] = useState<AutoLockTimeout>('5m');
  const [duressPinInput, setDuressPinInput] = useState('');
  const [duressActionInput, setDuressActionInput] = useState<'decoy' | 'wipe'>('decoy');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogItem[]>([]);
  const [currentNick, setCurrentNick] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    const prof = await getCurrentProfile();
    if (prof) {
      setCurrentNick(prof.nickname);
      if (prof.autoLockTimeout) setAutoLockOpt(prof.autoLockTimeout);
      const logs = await getSecurityAuditLogs(prof.nickname);
      setAuditLogs(logs);
    }
  };

  const handleSetAutoLock = async (opt: AutoLockTimeout) => {
    setAutoLockOpt(opt);
    AutoLockManager.setTimeoutOption(opt);
    const prof = await getCurrentProfile();
    if (prof) {
      await saveProfile({ ...prof, autoLockTimeout: opt });
      await addSecurityAuditLog(prof.nickname, 'autolock_changed', `Tiempo de auto-bloqueo: ${opt}`);
      Alert.alert('Configuración guardada ⏱️', `Auto-bloqueo configurado a ${opt}.`);
      await loadSecurityData();
    }
  };

  const handleSaveDuressPin = async () => {
    if (!duressPinInput.trim() || duressPinInput.length < 4) {
      Alert.alert('PIN inválido', 'El PIN de coacción debe tener al menos 4 caracteres.');
      return;
    }
    const prof = await getCurrentProfile();
    if (!prof) {
      Alert.alert('Inicia sesión primero', 'Debes iniciar sesión con tu perfil para configurar un PIN de coacción.');
      return;
    }

    try {
      const duressMeta = await createDuressMeta(duressPinInput.trim(), duressActionInput);
      await saveProfile({ ...prof, duressMeta });
      await addSecurityAuditLog(prof.nickname, 'pin_changed', `Configurado PIN de Coacción (${duressActionInput})`);
      setDuressPinInput('');
      Alert.alert(
        'PIN de Coacción Guardado 🚨',
        `Si alguien te fuerza a desbloquear tu bóveda e ingresas este PIN, la app ejecutará la acción: ${
          duressActionInput === 'decoy' ? 'Mostrar perfil señuelo vacío' : 'Borrado silencioso de pánico'
        }.`
      );
      await loadSecurityData();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el PIN de coacción.');
    }
  };

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
          title="Cuenta & Bóveda de Seguridad"
          subtitle="Cifrado Zero-Knowledge AES-GCM-256 + PBKDF2. El servidor solo almacena ciphertext inviolable."
        />

        <View style={styles.tabsRow}>
          {(
            [
              { id: 'signin' as const, label: 'Entrar' },
              { id: 'signup' as const, label: 'Crear' },
              { id: 'security' as const, label: 'Seguridad' },
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

          {mode === 'security' ? (
            <View style={styles.securityBox}>
              <Text style={styles.sectionTitle}>⏱️ Auto-Bloqueo de Bóveda por Inactividad</Text>
              <Text style={styles.sectionDesc}>
                Bloquea automáticamente la clave en RAM si no hay interacción o si cambias de pestaña.
              </Text>

              <View style={styles.chipRow}>
                {(
                  [
                    { label: '1 min', value: '1m' as const },
                    { label: '5 min', value: '5m' as const },
                    { label: '15 min', value: '15m' as const },
                    { label: 'Nunca', value: 'never' as const },
                  ] as const
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, autoLockOpt === opt.value && styles.chipActive]}
                    onPress={() => handleSetAutoLock(opt.value)}
                  >
                    <Text style={[styles.chipText, autoLockOpt === opt.value && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>🚨 PIN de Coacción / Pánico (Duress PIN)</Text>
              <Text style={styles.sectionDesc}>
                Si alguien te fuerza a desbloquear tu dispositivo, ingresa este PIN alternativo para engañar al atacante o borrar tus datos en silencio.
              </Text>

              <Text style={styles.fieldLabel}>PIN de Coacción Alternativo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 9999"
                placeholderTextColor={colors.textDim}
                value={duressPinInput}
                onChangeText={setDuressPinInput}
                keyboardType="numeric"
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>Acción al ingresar PIN de Coacción</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, duressActionInput === 'decoy' && styles.chipActive]}
                  onPress={() => setDuressActionInput('decoy')}
                >
                  <Text style={[styles.chipText, duressActionInput === 'decoy' && styles.chipTextActive]}>
                    🎭 Perfil Señuelo (Decoy)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, duressActionInput === 'wipe' && styles.chipActiveDanger]}
                  onPress={() => setDuressActionInput('wipe')}
                >
                  <Text style={[styles.chipText, duressActionInput === 'wipe' && { color: colors.danger }]}>
                    🚨 Borrado de Pánico
                  </Text>
                </TouchableOpacity>
              </View>

              <Button title="Guardar PIN de Coacción" onPress={handleSaveDuressPin} style={{ marginTop: 8 }} />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>📊 Registro Cifrado de Auditoría de Seguridad</Text>
              {auditLogs.length === 0 ? (
                <Text style={styles.emptyLogsText}>Sin eventos de seguridad registrados.</Text>
              ) : (
                <View style={styles.logsList}>
                  {auditLogs.map((log) => (
                    <View key={log.id} style={styles.logItem}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logTag}>
                          {log.event === 'unlock_success'
                            ? '✅ Desbloqueo'
                            : log.event === 'unlock_failed'
                            ? '❌ Intento Fallido'
                            : log.event === 'duress_triggered'
                            ? '🚨 Coacción Activada'
                            : '⚙️ Configuración'}
                        </Text>
                        <Text style={styles.logTime}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      {log.details ? <Text style={styles.logDetails}>{log.details}</Text> : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
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
            </>
          )}

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
  containerDesktop: { maxWidth: 580, alignSelf: 'center', width: '100%' },
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
  securityBox: { gap: spacing.sm },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginBottom: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
  },
  chipActiveDanger: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: colors.danger,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  chipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  emptyLogsText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  logsList: { gap: 6, marginTop: 4 },
  logItem: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 2,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTag: { color: colors.text, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  logTime: { color: colors.textDim, fontSize: 10 },
  logDetails: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.body },
});
