import { ScrollView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getCurrentProfile,
  loginProfile,
  logoutProfile,
  listAllProfiles,
  listMyLocalSessions,
  createLocalSession,
} from '@/lib/storage';
import { UserProfile, Session, EXPERIENCE_LABELS } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Guest input code
  const [guestCode, setGuestCode] = useState('');

  // Login states
  const [loginNick, setLoginNick] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Quick Invite states
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [quickGuestNick, setQuickGuestNick] = useState('');
  const [quickGuestNotes, setQuickGuestNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    const curProfile = await getCurrentProfile();
    setProfile(curProfile);
    const allProfs = await listAllProfiles();
    setProfilesList(allProfs);
    const mySessions = await listMyLocalSessions();
    setSessions(mySessions);
  };

  const handleLogin = async () => {
    if (!loginNick.trim() || !loginPin) {
      Alert.alert('Datos incompletos', 'Por favor ingresa tu nick y PIN.');
      return;
    }
    const res = await loginProfile(loginNick.trim(), loginPin);
    if (res) {
      setLoginPin('');
      await loadHomeData();
    } else {
      Alert.alert('Error de login', 'El nick o el PIN de seguridad es incorrecto.');
    }
  };

  const handleLogout = async () => {
    await logoutProfile();
    setProfile(null);
    setSessions([]);
    await loadHomeData();
  };

  const joinAsGuest = () => {
    const code = guestCode.trim().toUpperCase();
    if (code.length < 4) {
      Alert.alert('Código inválido', 'Introduce el código que te compartieron.');
      return;
    }
    router.push(`/guest/${code}`);
  };

  const handleQuickInvite = async () => {
    if (!profile || !profile.baseResponses || profile.baseResponses.length === 0) {
      Alert.alert('Sin respuestas', 'Debes responder tu cuestionario base primero.');
      return;
    }
    if (!quickGuestNick.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre de la otra persona.');
      return;
    }
    setCreatingInvite(true);
    try {
      const guestNotesObj = { nickname: quickGuestNick.trim(), notes: quickGuestNotes.trim() };
      const session = await createLocalSession(profile.nickname, profile.baseResponses, profile);
      // Save private guest notes if any
      const { saveGuestProfile } = await import('@/lib/storage');
      await saveGuestProfile(session.id, guestNotesObj);

      Alert.alert('Invitación Creada', 'Se generó el código de invitación. Envíalo a tu pareja.');
      setShowQuickInvite(false);
      setQuickGuestNick('');
      setQuickGuestNotes('');
      await loadHomeData();
      router.push({ pathname: '/invite', params: { token: session.initiatorToken } });
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear la sesión de invitación.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const renderLanding = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.titleText}>Compatikink</Text>
        <Text style={styles.tagline}>
          Define tus preferencias, invita a alguien y recibe un reporte de compatibilidad privado y consensuado.
        </Text>
      </View>

      {/* Login Card */}
      {profilesList.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inicia Sesión con tu PIN</Text>
          <View style={styles.profilesRow}>
            {profilesList.map((p) => (
              <TouchableOpacity
                key={p.nickname}
                style={[styles.profileButton, loginNick === p.nickname && styles.profileButtonActive]}
                onPress={() => setLoginNick(p.nickname)}
              >
                <Text style={styles.profileButtonText}>{p.nickname}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {loginNick ? (
            <View style={styles.loginForm}>
              <Text style={styles.label}>PIN de seguridad para {loginNick}</Text>
              <TextInput
                style={styles.input}
                placeholder="Introduce tu PIN"
                placeholderTextColor={colors.textMuted}
                value={loginPin}
                onChangeText={setLoginPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={8}
              />
              <Button title="Entrar" onPress={handleLogin} />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Initial Registration/Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Empezar Cuestionario Base</Text>
        <Text style={styles.cardDesc}>
          Crea tu perfil y define tus preferencias de forma privada. Recibirás un PIN para proteger tu cuenta.
        </Text>
        <Button title="Crear Perfil y Empezar" onPress={() => router.push('/questionnaire')} />
      </View>

      {/* Manual Login (Fallback if profile not in quicklist) */}
      {!loginNick && profilesList.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión Manual</Text>
          <Text style={styles.label}>Tu Nickname</Text>
          <TextInput
            style={[styles.input, { textAlign: 'left' }]}
            placeholder="Introduce tu nick"
            placeholderTextColor={colors.textMuted}
            value={loginNick}
            onChangeText={setLoginNick}
            autoCapitalize="none"
          />
          <Text style={styles.label}>PIN de seguridad</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduce tu PIN"
            placeholderTextColor={colors.textMuted}
            value={loginPin}
            onChangeText={setLoginPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={8}
          />
          <Button title="Entrar" onPress={handleLogin} />
        </View>
      ) : null}

      {/* Guest joining */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Me invitaron (Tengo un Código)</Text>
        <Text style={styles.cardDesc}>
          Responde de forma privada. Quien te invitó verá la compatibilidad mutua.
        </Text>
        <TextInput
          style={styles.inputInvite}
          placeholder="Código de invitación"
          placeholderTextColor={colors.textMuted}
          value={guestCode}
          onChangeText={setGuestCode}
          autoCapitalize="characters"
          maxLength={8}
        />
        <Button title="Unirme con código" onPress={joinAsGuest} variant="secondary" />
      </View>

      {!isSupabaseConfigured ? (
        <Text style={styles.warning}>
          ⚠️ Modo local: Tus perfiles y reportes están guardados de forma segura en este dispositivo.
        </Text>
      ) : null}
    </ScrollView>
  );

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.welcomeText}>¡Hola, {profile?.nickname}! 👋</Text>
        {profile?.pronouns ? <Text style={styles.pronounsBadge}>{profile.pronouns}</Text> : null}
        {profile?.experienceLevel ? (
          <Text style={styles.expBadge}>
            Nivel: {EXPERIENCE_LABELS[profile.experienceLevel]}
          </Text>
        ) : null}
      </View>

      {/* Quick Invite Tool */}
      <View style={styles.card}>
        {!showQuickInvite ? (
          <Button
            title="⚡ Crear Invitación Rápida"
            onPress={() => setShowQuickInvite(true)}
          />
        ) : (
          <View style={styles.quickInviteForm}>
            <Text style={styles.cardTitle}>⚡ Invitación Rápida</Text>
            <Text style={styles.cardDesc}>
              Se generará un enlace usando tus respuestas base guardadas. No necesitas repetir las 70 preguntas.
            </Text>

            <Text style={styles.label}>Apodo de la otra persona *</Text>
            <TextInput
              style={[styles.input, { textAlign: 'left' }]}
              placeholder="Ej: Sam"
              placeholderTextColor={colors.textMuted}
              value={quickGuestNick}
              onChangeText={setQuickGuestNick}
            />

            <Text style={styles.label}>Notas confidenciales sobre ella (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Nos conocimos en FetLife. Spanking..."
              placeholderTextColor={colors.textMuted}
              value={quickGuestNotes}
              onChangeText={setQuickGuestNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formRow}>
              <Button
                title={creatingInvite ? 'Creando...' : 'Crear Código'}
                onPress={handleQuickInvite}
                disabled={creatingInvite}
                style={{ flex: 1 }}
              />
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowQuickInvite(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Edit Responses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tus Respuestas Base</Text>
        <Text style={styles.cardDesc}>
          ¿Quieres actualizar tus límites eróticos, roles o intensidades?
        </Text>
        <Button
          title="Editar mis respuestas"
          variant="secondary"
          onPress={() => router.push('/questionnaire')}
        />
      </View>

      {/* Historial de Sesiones */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de Compatibilidades</Text>
        {sessions.length === 0 ? (
          <Text style={styles.cardDesc}>Aún no has creado ni respondido ninguna invitación.</Text>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((s) => {
              const isInitiator = s.initiatorNickname === profile?.nickname;
              const partner = isInitiator ? (s.guestNickname || 'Invitado') : (s.initiatorNickname || 'Iniciador');
              const isComplete = s.status === 'complete';

              return (
                <View key={s.id} style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionPartner}>vs. {partner}</Text>
                    <Text style={styles.sessionDetails}>
                      Código: {s.inviteCode} · {isInitiator ? 'Iniciada por ti' : 'Recibida'}
                    </Text>
                  </View>
                  <View style={styles.sessionActions}>
                    {isComplete ? (
                      <Button
                        title="Ver Reporte"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/report', params: { token: s.initiatorToken } })}
                      />
                    ) : (
                      <Button
                        title="Invitar"
                        variant="secondary"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/invite', params: { token: s.initiatorToken } })}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Button title="Cerrar Sesión" variant="ghost" onPress={handleLogout} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {profile ? renderDashboard() : renderLanding()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: -4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
  },
  inputInvite: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
    letterSpacing: 2,
    textAlign: 'center',
  },
  warning: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  profilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  profileButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  profileButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  loginForm: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 4,
  },
  welcomeText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  pronounsBadge: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  expBadge: {
    fontSize: fontSize.xs,
    color: colors.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  quickInviteForm: {
    gap: spacing.md,
  },
  sessionsList: {
    gap: spacing.md,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionInfo: {
    flex: 2,
  },
  sessionPartner: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sessionDetails: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  sessionActions: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sessionActionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
