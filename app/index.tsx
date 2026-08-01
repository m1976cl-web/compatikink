import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { ModuleTile } from '@/components/ModuleTile';
import { Section } from '@/components/Section';
import { EmptyState } from '@/components/EmptyState';
import { VaultLockGate } from '@/components/VaultLockGate';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { RegisterProfileModal } from '@/components/RegisterProfileModal';
import { PolyComparatorModal } from '@/components/PolyComparatorModal';
import { CommunityTrendsModal } from '@/components/CommunityTrendsModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { PWAInstallPromptModal } from '@/components/PWAInstallPromptModal';
import { AccessibilityModal } from '@/components/AccessibilityModal';
import {
  colors,
  fonts,
  fontSize,
  gradients,
  radii,
  spacing,
  typography,
} from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { isSupabaseConfigured } from '@/lib/supabase';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import {
  getCurrentProfile,
  loginProfile,
  logoutProfile,
  listAllProfiles,
  listMyLocalSessions,
  createLocalSession,
  getAllSceneAgreements,
  panicWipeData,
  exportUserDataJSON,
  importUserDataJSON,
} from '@/lib/storage';
import { UserProfile, Session, EXPERIENCE_LABELS, SceneAgreement } from '@/types';
import { exportSceneAgreementPDF } from '@/lib/exportPDF';

type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  route?: string;
  onPress?: () => void;
};

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sceneAgreements, setSceneAgreements] = useState<
    { sessionId: string; agreements: SceneAgreement[] }[]
  >([]);
  const [vaultOpen, setVaultOpen] = useState(() => VaultLockGateAPI.isUnlocked());

  const [guestCode, setGuestCode] = useState('');
  const [loginNick, setLoginNick] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showQuickInvite, setShowQuickInvite] = useState(false);
  const [quickGuestNick, setQuickGuestNick] = useState('');
  const [quickGuestNotes, setQuickGuestNotes] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | 'none'>('7d');

  const [showPolyComparator, setShowPolyComparator] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [debriefTarget, setDebriefTarget] = useState<{
    sessionId: string;
    activityId: string;
    activityName: string;
  } | null>(null);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(18)).current;
  const scrollRef = useRef<ScrollView>(null);
  const guestSectionY = useRef(0);

  useEffect(() => {
    loadHomeData();
    const unsub = VaultLockGateAPI.subscribe((snap) => setVaultOpen(snap.unlocked));
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
    return unsub;
  }, []);

  const loadHomeData = async () => {
    const curProfile = await getCurrentProfile();
    setProfile(curProfile);
    const allProfs = await listAllProfiles();
    setProfilesList(allProfs);
    const mySessions = await listMyLocalSessions();
    setSessions(mySessions);
    const agreements = await getAllSceneAgreements();
    setSceneAgreements(agreements);
  };

  const handlePanicWipe = () => {
    Alert.alert(
      'Borrado de emergencia',
      '¿Eliminar sesiones, perfiles y acuerdos de este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            await panicWipeData();
            setProfile(null);
            setSessions([]);
            setProfilesList([]);
            setSceneAgreements([]);
            Alert.alert('Datos eliminados', 'El historial y los perfiles se borraron por completo.');
            await loadHomeData();
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!loginNick.trim()) {
      Alert.alert('Datos incompletos', 'Selecciona o ingresa tu nick.');
      return;
    }
    const selectedProfile = profilesList.find(
      (p) => p.nickname.toLowerCase() === loginNick.trim().toLowerCase()
    );
    const profileHasPin = selectedProfile
      ? Boolean(selectedProfile.pinSalt || selectedProfile.pinVerifier || selectedProfile.pin)
      : true;
    if (selectedProfile && !profileHasPin) {
      const { setCurrentProfile } = await import('@/lib/storage');
      await setCurrentProfile(selectedProfile.nickname);
      setLoginPin('');
      await loadHomeData();
      return;
    }
    if (!loginPin) {
      Alert.alert('PIN requerido', 'Ingresa tu PIN de seguridad.');
      return;
    }
    const res = await loginProfile(loginNick.trim(), loginPin);
    if (res) {
      setLoginPin('');
      await loadHomeData();
    } else {
      Alert.alert('Error de login', 'Nick o PIN incorrecto.');
    }
  };

  const handleLogout = async () => {
    await logoutProfile();
    setProfile(null);
    setSessions([]);
    await loadHomeData();
  };

  const joinAsGuest = () => {
    const raw = guestCode.trim();
    const secretFromPaste = (() => {
      try {
        if (raw.includes('k=')) {
          const m = raw.match(/[?#&]k=([^&\s#]+)/);
          if (m) return decodeURIComponent(m[1]);
        }
      } catch {
        /* ignore */
      }
      return undefined;
    })();
    const codeMatch = raw.match(/guest\/([A-Za-z0-9]+)/i);
    const code = (codeMatch ? codeMatch[1] : raw.replace(/[^A-Za-z0-9]/g, '')).toUpperCase();
    if (code.length < 4) {
      Alert.alert('Código inválido', 'Introduce el código o el enlace completo que te compartieron.');
      return;
    }
    if (secretFromPaste) {
      router.push(`/guest/${code}?k=${encodeURIComponent(secretFromPaste)}`);
    } else {
      router.push(`/guest/${code}`);
    }
  };

  const handleQuickInvite = async () => {
    if (!profile || !profile.baseResponses || profile.baseResponses.length === 0) {
      Alert.alert('Sin respuestas', 'Responde tu cuestionario base primero.');
      return;
    }
    if (!quickGuestNick.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre de la otra persona.');
      return;
    }
    setCreatingInvite(true);
    try {
      const guestNotesObj = { nickname: quickGuestNick.trim(), notes: quickGuestNotes.trim() };
      let expiresAt: string | undefined;
      if (expiryOption === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7d') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const session = await createLocalSession(
        profile.nickname,
        profile.baseResponses,
        profile,
        expiresAt
      );
      const { saveGuestProfile } = await import('@/lib/storage');
      await saveGuestProfile(session.id, guestNotesObj);

      Alert.alert('Invitación creada', 'Envía el código a tu pareja.');
      setShowQuickInvite(false);
      setQuickGuestNick('');
      setQuickGuestNotes('');
      await loadHomeData();
      router.push({ pathname: '/invite', params: { token: session.initiatorToken } });
    } catch {
      Alert.alert('Error', 'No se pudo crear la sesión de invitación.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleBackup = () => {
    const askPassphrase = (title: string): string | null => {
      if (typeof globalThis !== 'undefined' && 'prompt' in globalThis) {
        return (globalThis as unknown as { prompt: (m: string) => string | null }).prompt(title);
      }
      return null;
    };
    Alert.alert('Copia de seguridad cifrada', 'Backups con PBKDF2 + AES-GCM.', [
      {
        text: 'Exportar',
        onPress: async () => {
          const passphrase = askPassphrase('Contraseña para cifrar el backup (mín. 4):');
          if (!passphrase || passphrase.length < 4) {
            Alert.alert('Cancelado', 'Se requiere contraseña de exportación.');
            return;
          }
          try {
            const json = await exportUserDataJSON(passphrase);
            await Clipboard.setStringAsync(json);
            Alert.alert('Backup listo', 'Ciphertext copiado. Guarda también tu contraseña.');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo exportar.');
          }
        },
      },
      {
        text: 'Importar',
        onPress: async () => {
          const str = await Clipboard.getStringAsync();
          const passphrase = askPassphrase('Contraseña del backup (si está cifrado):') || undefined;
          try {
            const count = await importUserDataJSON(str, passphrase);
            Alert.alert('Restaurado', `Se restauraron ${count} registros locales.`);
            await loadHomeData();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Backup inválido o contraseña incorrecta.');
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const go = (path: string) => () => router.push(path as any);

  const flujoPrincipal: ModuleDef[] = [
    { title: 'Cuestionario base', description: 'Preferencias privadas y límites', mark: 'Q', route: '/questionnaire' },
    { title: 'Perfil rápido', description: '10 preguntas · ~2 minutos', mark: '10', route: '/quick-profile' },
    { title: 'Pass & Play', description: 'Mismo dispositivo, cortina de privacidad', mark: 'P', route: '/pass-and-play' },
    { title: 'Manual', description: 'Guía de módulos y seguridad', mark: 'M', route: '/manual' },
    { title: 'Glosario', description: 'Términos y consentimiento', mark: 'G', route: '/glossary' },
    { title: 'Guía de seguridad', description: 'SSC/RACK y protocolos', mark: 'S', route: '/safety-guide' },
  ];

  const escenas: ModuleDef[] = [
    { title: 'Pegging & Dating', description: 'Guía y dating de pegging', mark: '🍑', route: '/pegging' },
    { title: 'Astrología kink', description: 'Sinastría y horóscopo', mark: '🔮', route: '/astrology' },
    { title: 'Negociación en vivo', description: 'Acuerdos y firma de escenas', mark: 'N', route: '/negotiation' },
    { title: 'Compás kink', description: 'Mapa de afinidades', mark: 'C', route: '/compass' },
    { title: 'Arquetipos', description: 'Perfil de roles', mark: 'A', route: '/archetypes' },
    { title: 'Rituales D/s', description: 'Protocolos guiados', mark: 'R', route: '/rituals' },
    { title: 'Contratos', description: 'Acuerdos digitales', mark: '§', route: '/contracts' },
    { title: 'Fantasy Match', description: 'Coincidencias double-blind', mark: 'F', route: '/fantasy-match' },
    { title: 'Verdad o reto', description: 'Cartas para citas', mark: 'V', route: '/truth-or-dare' },
    { title: 'Calendario', description: 'Escenas y aftercare', mark: '·', route: '/calendar' },
    { title: 'Playlists', description: 'Ambientes sonoros', mark: '♪', route: '/playlists' },
    { title: 'Gear Closet', description: 'Inventario de equipo', mark: '⚙', route: '/gear-closet' },
  ];

  const comunidad: ModuleDef[] = [
    { title: 'Dating kink', description: 'Conexiones por afinidad', mark: 'D', route: '/dating' },
    { title: 'Feed', description: 'Debate y encuestas', mark: '◈', route: '/kink-feed' },
    { title: 'Comunidades', description: 'Grupos temáticos', mark: '◉', route: '/communities' },
    { title: 'Eventos', description: 'Munches y talleres', mark: 'E', route: '/events' },
    { title: 'Cursos', description: 'Kink Academy', mark: 'K', route: '/courses' },
    { title: 'Escritos', description: 'Diario y reflexiones', mark: 'W', route: '/writings' },
    { title: 'Wrapped', description: 'Resumen anual', mark: 'Y', route: '/wrapped' },
    { title: 'Reto semanal', description: 'Desafíos con XP', mark: '7', route: '/weekly-challenge' },
    { title: 'Matriz poli', description: '3+ personas', mark: '3', route: '/poly-group' },
    { title: 'Tienda', description: 'Partners y recomendaciones', mark: '$', route: '/store' },
  ];

  const escenasIa: ModuleDef[] = [
    { title: 'Roleplay IA', description: 'Ensayo de dinámicas', mark: 'I', route: '/ai-roleplay' },
    { title: 'Escenas IA', description: 'Rutinas personalizadas', mark: 'Σ', route: '/scene-ai' },
    { title: 'Guiones IA', description: 'Diálogos e instrucciones', mark: 'Γ', route: '/ai-script' },
    { title: 'Music Sync', description: 'Háptica + BPM', mark: '≈', route: '/music-sync' },
    { title: 'Castidad', description: 'Keyholding seguro', mark: '⌀', route: '/chastity' },
    { title: 'Hardware', description: 'QIUI / Lovense', mark: 'H', route: '/hardware' },
    { title: 'Economía D/s', description: 'Tareas y recompensas', mark: '◈', route: '/task-economy' },
    { title: 'Analítica', description: 'Subspace tracker', mark: 'Δ', route: '/analytics' },
    { title: 'Logros', description: 'Insignias de exploración', mark: '✦', route: '/achievements' },
    { title: 'Premium', description: 'Compatikink PRO', mark: 'P', route: '/premium' },
  ];

  const bovedaMods: ModuleDef[] = [
    { title: 'Cuenta & bóveda', description: 'Acceso Zero-Knowledge', mark: 'B', route: '/auth' },
    { title: 'Álbum privado', description: 'Fotos cifradas AES-GCM', mark: '◻', route: '/private-album' },
    { title: 'Backup cifrado', description: 'Exportar / importar', mark: '⇄', onPress: handleBackup },
    { title: 'Admin', description: 'Requiere bóveda + rol local', mark: '◆', route: '/admin' },
    { title: 'Instalar app', description: 'PWA en el dispositivo', mark: '↓', onPress: () => setShowPWAInstallModal(true) },
    { title: 'Accesibilidad', description: 'Contraste y tipografía', mark: 'A', onPress: () => setShowA11yModal(true) },
  ];

  const renderModuleList = (items: ModuleDef[]) =>
    items.map((m) => (
      <ModuleTile
        key={m.title}
        title={m.title}
        description={m.description}
        mark={m.mark}
        onPress={m.onPress || (m.route ? go(m.route) : () => {})}
      />
    ));

  const webBg =
    Platform.OS === 'web'
      ? ({ backgroundImage: gradients.inkRadialHint } as object)
      : undefined;

  const renderHero = (loggedIn: boolean) => (
    <Animated.View
      style={[
        styles.hero,
        { opacity: heroFade, transform: [{ translateY: heroSlide }] },
      ]}
    >
      <Text style={styles.brand} accessibilityRole="header">
        Compatikink
      </Text>
      <Text style={styles.mark}>Nox</Text>
      <Text style={styles.headline}>
        {loggedIn
          ? `Hola, ${profile?.nickname}`
          : 'Preferencias privadas. Compatibilidad consensuada.'}
      </Text>
      <Text style={styles.heroSupport}>
        {loggedIn
          ? profile?.experienceLevel
            ? `Nivel: ${EXPERIENCE_LABELS[profile.experienceLevel]}`
            : 'Tu espacio cifrado en este dispositivo.'
          : 'Define límites, invita a alguien y recibe un reporte sin revelar respuestas individuales.'}
      </Text>

      <View style={styles.ctaGroup}>
        {loggedIn ? (
          <>
            <Button
              title="Crear invitación"
              onPress={() => setShowQuickInvite(true)}
              style={styles.ctaPrimary}
            />
            <Button
              title="Editar respuestas"
              variant="secondary"
              onPress={go('/questionnaire')}
              style={styles.ctaSecondary}
            />
            <Button
              title={vaultOpen ? 'Bloquear bóveda' : 'Abrir bóveda'}
              variant="ghost"
              onPress={() => {
                if (vaultOpen) VaultLockGateAPI.lock();
                else router.push('/auth' as any);
              }}
            />
          </>
        ) : (
          <>
            <Button
              title="Empezar"
              onPress={go('/questionnaire')}
              style={styles.ctaPrimary}
            />
            <Button
              title="Me invitaron"
              variant="secondary"
              onPress={() =>
                scrollRef.current?.scrollTo({ y: Math.max(0, guestSectionY.current - 24), animated: true })
              }
              style={styles.ctaSecondary}
            />
            <Button title="Entrar a bóveda" variant="ghost" onPress={go('/auth')} />
          </>
        )}
      </View>
    </Animated.View>
  );

  const renderGuestJoin = () => (
    <View onLayout={(e) => { guestSectionY.current = e.nativeEvent.layout.y; }}>
    <Section title="Me invitaron" subtitle="Pega el código o el enlace completo (#k= / ?k=).">
      <View style={styles.interactivePanel}>
        <TextInput
          style={styles.inputInvite}
          placeholder="Código o enlace de invitación"
          placeholderTextColor={colors.textDim}
          value={guestCode}
          onChangeText={setGuestCode}
          autoCapitalize="characters"
        />
        <Button title="Unirme" onPress={joinAsGuest} variant="secondary" />
      </View>
    </Section>
    </View>
  );

  const renderLoginPanel = () => (
    <Section
      title="Entrar con perfil local"
      subtitle="Tu PIN deriva la clave de bóveda (PBKDF2). No sale de este dispositivo."
    >
      <View style={styles.interactivePanel}>
        {profilesList.length > 0 ? (
          <View style={styles.profilesRow}>
            {profilesList.map((p) => (
              <TouchableOpacity
                key={p.nickname}
                style={[styles.profileChip, loginNick === p.nickname && styles.profileChipActive]}
                onPress={() => setLoginNick(p.nickname)}
              >
                <Text style={styles.profileChipText}>{p.nickname}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nick"
              placeholderTextColor={colors.textDim}
              value={loginNick}
              onChangeText={setLoginNick}
              autoCapitalize="none"
            />
          </>
        )}
        {loginNick ? (
          <>
            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor={colors.textDim}
              value={loginPin}
              onChangeText={setLoginPin}
              secureTextEntry
              keyboardType="numeric"
              maxLength={8}
            />
            <Button title="Entrar" onPress={handleLogin} />
          </>
        ) : null}
        <Button
          title="Crear perfil personal"
          variant="ghost"
          onPress={() => setShowRegisterModal(true)}
        />
      </View>
    </Section>
  );

  const renderQuickInviteForm = () =>
    showQuickInvite ? (
      <Section title="Invitación rápida" subtitle="Usa tus respuestas base guardadas.">
        <View style={styles.interactivePanel}>
          <Text style={styles.label}>Apodo de la otra persona</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sam"
            placeholderTextColor={colors.textDim}
            value={quickGuestNick}
            onChangeText={setQuickGuestNick}
          />
          <Text style={styles.label}>Notas confidenciales (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notas privadas…"
            placeholderTextColor={colors.textDim}
            value={quickGuestNotes}
            onChangeText={setQuickGuestNotes}
            multiline
          />
          <View style={styles.expiryRow}>
            {(
              [
                { label: '24 h', value: '24h' as const },
                { label: '7 días', value: '7d' as const },
                { label: 'Sin límite', value: 'none' as const },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.expiryChip, expiryOption === opt.value && styles.expiryChipActive]}
                onPress={() => setExpiryOption(opt.value)}
              >
                <Text
                  style={[
                    styles.expiryChipText,
                    expiryOption === opt.value && styles.expiryChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formRow}>
            <Button
              title={creatingInvite ? 'Creando…' : 'Crear código'}
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
      </Section>
    ) : null;

  const renderSessions = () => (
    <Section title="Historial" subtitle="Invitaciones y reportes en este dispositivo.">
      {!vaultOpen ? (
        <VaultLockGate
          title="Historial cifrado"
          subtitle="Desbloquea la bóveda para ver sesiones y acuerdos sensibles."
          showLockButton={false}
        />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="Sin sesiones aún"
          description="Crea una invitación o completa un cuestionario para empezar."
          actionLabel="Crear invitación"
          onAction={() => setShowQuickInvite(true)}
        />
      ) : (
        <View style={styles.sessionsList}>
          {sessions.map((s) => {
            const isInitiator = s.initiatorNickname === profile?.nickname;
            const partner = isInitiator
              ? s.guestNickname || 'Invitado'
              : s.initiatorNickname || 'Iniciador';
            const isComplete = s.status === 'complete';
            const isWaiting = s.status === 'waiting';
            const isExpired =
              !isComplete && s.expiresAt ? new Date(s.expiresAt) < new Date() : false;
            const statusLabel = isExpired
              ? 'Expirada'
              : isComplete
                ? 'Completado'
                : isWaiting
                  ? 'Esperando'
                  : 'Borrador';
            const statusColor = isExpired
              ? colors.danger
              : isComplete
                ? colors.success
                : isWaiting
                  ? colors.warning
                  : colors.textMuted;

            return (
              <View key={s.id} style={styles.sessionCard}>
                <View style={styles.sessionCardHeader}>
                  <Text style={[styles.sessionStatus, { color: statusColor }]}>{statusLabel}</Text>
                  <Text style={styles.sessionCode}>{s.inviteCode}</Text>
                </View>
                <Text style={styles.sessionPartner}>{partner}</Text>
                <View style={styles.sessionActions}>
                  {isComplete ? (
                    <Button
                      title="Reporte"
                      style={styles.sessionActionBtn}
                      onPress={() =>
                        router.push({ pathname: '/report', params: { token: s.initiatorToken } })
                      }
                    />
                  ) : (
                    <Button
                      title="Invitar"
                      variant="secondary"
                      style={styles.sessionActionBtn}
                      onPress={() =>
                        router.push({ pathname: '/invite', params: { token: s.initiatorToken } })
                      }
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Section>
  );

  const renderAgreements = () => {
    if (!vaultOpen || sceneAgreements.length === 0) return null;
    return (
      <Section title="Acuerdos de escena" subtitle="Safewords y límites por pareja.">
        {sceneAgreements.map(({ sessionId, agreements }) => {
          const session = sessions.find((s) => s.id === sessionId);
          const partner = session
            ? session.guestNickname || session.initiatorNickname || 'Invitado'
            : sessionId.slice(0, 8);
          return (
            <View key={sessionId} style={styles.agreementGroup}>
              <Text style={styles.agreementPartner}>Con {partner}</Text>
              {agreements.map((ag) => (
                <View key={ag.id} style={styles.agreementRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agreementActivity}>{ag.activityName}</Text>
                    <Text style={styles.agreementSafewords}>
                      {ag.safewordGreen} · {ag.safewordYellow} · {ag.safewordRed}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setDebriefTarget({
                        sessionId: ag.sessionId,
                        activityId: ag.activityId,
                        activityName: ag.activityName,
                      })
                    }
                  >
                    <Text style={styles.linkAction}>Debrief</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => exportSceneAgreementPDF(ag, partner)}>
                    <Text style={styles.linkAction}>PDF</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </Section>
    );
  };

  const renderModules = () => (
    <>
      <Section
        eyebrow="Flujo"
        title="Principal"
        subtitle="Cuestionario, invitación y fundamentos."
      >
        {renderModuleList(flujoPrincipal)}
      </Section>
      <Section eyebrow="Práctica" title="Escenas" subtitle="Negociación, rituales y herramientas de sesión.">
        {renderModuleList(escenas)}
      </Section>
      <Section eyebrow="Social" title="Comunidad" subtitle="Conexiones, eventos y contenido.">
        {renderModuleList(comunidad)}
      </Section>
      <Section eyebrow="Extendido" title="IA & hardware" subtitle="Exploración asistida y dispositivos.">
        {renderModuleList(escenasIa)}
      </Section>
      <Section eyebrow="Privacidad" title="Bóveda" subtitle="Cifrado local, backup y cuenta.">
        {renderModuleList(bovedaMods)}
      </Section>
    </>
  );

  const renderLanding = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
      {renderHero(false)}
      {renderGuestJoin()}
      {renderLoginPanel()}
      {renderModules()}
      {!isSupabaseConfigured ? (
        <Text style={styles.footnote}>
          Modo local: perfiles y reportes viven cifrados en este dispositivo.
        </Text>
      ) : null}
    </ScrollView>
  );

  const renderDashboard = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
      {renderHero(true)}
      {renderQuickInviteForm()}

      {isDesktop ? (
        <View style={styles.desktopGrid}>
          <View style={styles.desktopCol}>
            {renderSessions()}
            {renderAgreements()}
            <Section title="Cuenta">
              <View style={styles.interactivePanel}>
                {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
                  <Button
                    title="Comparar parejas"
                    variant="secondary"
                    onPress={() => setShowPolyComparator(true)}
                  />
                ) : null}
                <Button
                  title="Tendencias de comunidad"
                  variant="secondary"
                  onPress={() => setShowTrendsModal(true)}
                />
                <Button title="Cerrar sesión" variant="ghost" onPress={handleLogout} />
                <Button title="Borrado de pánico" variant="danger" onPress={handlePanicWipe} />
              </View>
            </Section>
          </View>
          <View style={styles.desktopCol}>{renderModules()}</View>
        </View>
      ) : (
        <>
          {renderSessions()}
          {renderAgreements()}
          <Section title="Cuenta">
            <View style={styles.interactivePanel}>
              {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
                <Button
                  title="Comparar parejas"
                  variant="secondary"
                  onPress={() => setShowPolyComparator(true)}
                />
              ) : null}
              <Button
                title="Tendencias de comunidad"
                variant="secondary"
                onPress={() => setShowTrendsModal(true)}
              />
              <Button title="Cerrar sesión" variant="ghost" onPress={handleLogout} />
              <Button title="Borrado de pánico" variant="danger" onPress={handlePanicWipe} />
            </View>
          </Section>
          {renderModules()}
        </>
      )}

      {profile ? (
        <PolyComparatorModal
          visible={showPolyComparator}
          onClose={() => setShowPolyComparator(false)}
          sessions={sessions}
          currentProfile={profile}
        />
      ) : null}
      <CommunityTrendsModal visible={showTrendsModal} onClose={() => setShowTrendsModal(false)} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safe, webBg as any]} edges={['bottom']}>
      <OnboardingOverlay onDone={() => {}} />
      <RegisterProfileModal
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => loadHomeData()}
      />
      <AgeVerificationModal />
      <PWAInstallPromptModal
        visible={showPWAInstallModal}
        onClose={() => setShowPWAInstallModal(false)}
      />
      <AccessibilityModal visible={showA11yModal} onClose={() => setShowA11yModal(false)} />
      {debriefTarget ? (
        <SceneDebriefModal
          visible={Boolean(debriefTarget)}
          onClose={() => setDebriefTarget(null)}
          sessionId={debriefTarget.sessionId}
          activityId={debriefTarget.activityId}
          activityName={debriefTarget.activityName}
          onSaved={() => {
            setDebriefTarget(null);
            loadHomeData();
          }}
        />
      ) : null}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.brand,
    color: colors.text,
    letterSpacing: 1.4,
    lineHeight: 52,
  },
  mark: {
    fontFamily: fonts.displayItalic,
    fontSize: fontSize.md,
    color: colors.primary,
    letterSpacing: 3,
    marginTop: -2,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    letterSpacing: 0.2,
    lineHeight: 36,
    maxWidth: 520,
  },
  heroSupport: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
    maxWidth: 480,
  },
  ctaGroup: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    maxWidth: 360,
  },
  ctaPrimary: { width: '100%' },
  ctaSecondary: { width: '100%' },
  interactivePanel: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  inputInvite: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  label: {
    ...typography.label,
    marginBottom: -4,
  },
  profilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  profileChip: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
  },
  profileChipText: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  expiryRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  expiryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  expiryChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accentSoft,
  },
  expiryChipText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  expiryChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sessionsList: { gap: spacing.sm },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sessionStatus: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sessionCode: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  sessionPartner: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  sessionActions: { alignItems: 'flex-start' },
  sessionActionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  agreementGroup: { marginBottom: spacing.md, gap: spacing.xs },
  agreementPartner: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  agreementActivity: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  agreementSafewords: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  linkAction: {
    fontFamily: fonts.bodySemi,
    color: colors.primary,
    fontSize: fontSize.xs,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  desktopCol: {
    flex: 1,
    minWidth: 0,
  },
  footnote: {
    fontFamily: fonts.body,
    color: colors.textDim,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
