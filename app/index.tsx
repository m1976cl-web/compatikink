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
import { useEffect, useRef, useState, useMemo } from 'react';
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
import { OctopusHost } from '@/components/OctopusHost';
import { CategoryTabs, CategoryTab } from '@/components/CategoryTabs';
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
  category: string;
  route?: string;
  onPress?: () => void;
};

const ACCENT_COLORS: Record<string, string> = {
  explore: '#c084fc',
  scenes: '#f472b6',
  social: '#38bdf8',
  ai: '#4ade80',
  vault: '#fbbf24',
};

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'explore', label: 'Explorar', icon: '🔮', accent: ACCENT_COLORS.explore },
  { key: 'scenes', label: 'Escenas', icon: '🎭', accent: ACCENT_COLORS.scenes },
  { key: 'social', label: 'Social', icon: '🌐', accent: ACCENT_COLORS.social },
  { key: 'ai', label: 'IA', icon: '🤖', accent: ACCENT_COLORS.ai },
  { key: 'vault', label: 'Bóveda', icon: '🔒', accent: ACCENT_COLORS.vault },
];

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
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | 'none'>('24h');
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');

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

  const allModules: ModuleDef[] = [
    // Explorar (explore)
    { title: 'Cuestionario base', description: 'Preferencias privadas y límites', mark: 'Q', category: 'explore', route: '/questionnaire' },
    { title: 'Astrología kink', description: 'Sinastría cósmica y horóscopo', mark: '🔮', category: 'explore', route: '/astrology' },
    { title: 'Arquetipos BDSM', description: 'Descubre tu perfil de roles', mark: '🎭', category: 'explore', route: '/archetypes' },
    { title: 'Perfil rápido', description: '10 preguntas · ~2 minutos', mark: '10', category: 'explore', route: '/quick-profile' },
    { title: 'Compás kink', description: 'Mapa 2D de afinidades', mark: '🧭', category: 'explore', route: '/compass' },
    { title: 'Pass & Play', description: 'Mismo dispositivo, cortina de privacidad', mark: '🎮', category: 'explore', route: '/pass-and-play' },
    { title: 'Manual', description: 'Guía de módulos y seguridad', mark: '📖', category: 'explore', route: '/manual' },
    { title: 'Glosario', description: 'Términos y consentimiento', mark: '📚', category: 'explore', route: '/glossary' },
    { title: 'Guía de seguridad', description: 'SSC/RACK y protocolos', mark: '🛡️', category: 'explore', route: '/safety-guide' },
    { title: 'Panel Admin', description: 'Gestión maestro de perfiles', mark: '👑', category: 'explore', route: '/admin-dashboard' },
    { title: 'Auditoría PenTest', description: 'Diagnóstico de seguridad (Exclusivo Admin)', mark: '🛡️', category: 'explore', route: '/security-audit' },

    // Escenas (scenes)
    { title: 'Escena en Vivo', description: 'Monitor inmersivo con safeword por voz y Aftercare', mark: '⚡', category: 'scenes', route: '/live-scene' },
    { title: 'Ruleta Kink', description: 'Oráculo de fantasías y retos en pareja', mark: '🔮', category: 'scenes', route: '/kink-roulette' },
    { title: 'Guía de Shibari', description: 'Nudos paso a paso y mapa anatómico de nervios', mark: '🪢', category: 'scenes', route: '/shibari-guide' },
    { title: 'Acto Diario Kink', description: 'Tareas diarias de disciplina D/s y racha', mark: '🎲', category: 'scenes', route: '/daily-submissive-act' },
    { title: 'Kit de Inicio BDSM', description: 'Guiones de escena, rutinas D/s y 7 días', mark: '🚀', category: 'scenes', route: '/quick-start-bundle' },
    { title: 'Vínculos & Diario', description: 'Bitácora de parejas, retos, XP y diplomas', mark: '🔗', category: 'scenes', route: '/partner-journal' },
    { title: 'Chat E2EE Efímero', description: 'Mensajería cifrada de pareja y retos', mark: '💬', category: 'scenes', route: '/partner-chat' },
    { title: 'Pegging & Dating', description: 'Guía psicológica, técnica y dating', mark: '🍑', category: 'scenes', route: '/pegging' },
    { title: 'Rituales D/s', description: 'Protocolos y hábitos guiados', mark: '📜', category: 'scenes', route: '/rituals' },
    { title: 'Contratos Digitales', description: 'Acuerdos D/s formales y firmas', mark: '✒️', category: 'scenes', route: '/contracts' },
    { title: 'Fantasy Match', description: 'Coincidencias double-blind', mark: '✨', category: 'scenes', route: '/fantasy-match' },
    { title: 'Negociación en vivo', description: 'Acuerdos y firma de escenas', mark: '🤝', category: 'scenes', route: '/negotiation' },
    { title: 'Verdad o reto', description: 'Cartas dinámicas para citas', mark: '🔥', category: 'scenes', route: '/truth-or-dare' },
    { title: 'Calendario', description: 'Escenas y aftercare', mark: '📅', category: 'scenes', route: '/calendar' },
    { title: 'Playlists', description: 'Ambientes sonoros sensuales', mark: '🎵', category: 'scenes', route: '/playlists' },
    { title: 'Gear Closet', description: 'Inventario de equipo y juguetes', mark: '⚙️', category: 'scenes', route: '/gear-closet' },

    // Social (social)
    { title: 'Blog & Escritos', description: 'Diario privado y publicaciones', mark: '✍️', category: 'social', route: '/writings' },
    { title: 'Dating kink', description: 'Conexiones por afinidad', mark: '💘', category: 'social', route: '/dating' },
    { title: 'Feed de Comunidad', description: 'Debate y encuestas anónimas', mark: '💬', category: 'social', route: '/kink-feed' },
    { title: 'Comunidades', description: 'Grupos temáticos y tribus', mark: '👥', category: 'social', route: '/communities' },
    { title: 'Eventos & Munches', description: 'Reuniones y talleres', mark: '🍸', category: 'social', route: '/events' },
    { title: 'Cursos', description: 'Kink Academy & clases', mark: '🎓', category: 'social', route: '/courses' },
    { title: 'Wrapped', description: 'Resumen anual de exploración', mark: '🎁', category: 'social', route: '/wrapped' },
    { title: 'Reto semanal', description: 'Desafíos con XP y niveles', mark: '🏆', category: 'social', route: '/weekly-challenge' },
    { title: 'Matriz Poli', description: 'Sinastría de 3+ personas', mark: '💎', category: 'social', route: '/poly-group' },
    { title: 'Página Azul 💙', description: 'Promociona tu OnlyFans & Fansly', mark: '📸', category: 'social', route: '/blue-pages' },
    { title: 'Tienda', description: 'Recomendaciones y partners', mark: '🛍️', category: 'social', route: '/store' },

    // IA & Hardware (ai)
    { title: 'Guiones IA', description: 'Generador de scripts de escenas', mark: '🎬', category: 'ai', route: '/ai-script' },
    { title: 'Music Sync', description: 'Teledildonics & estimulación BPM', mark: '⚡', category: 'ai', route: '/music-sync' },
    { title: 'Roleplay IA', description: 'Ensayo confidencial de dinámicas', mark: '🤖', category: 'ai', route: '/ai-roleplay' },
    { title: 'Escenas IA', description: 'Rutinas personalizadas por IA', mark: '🧠', category: 'ai', route: '/scene-ai' },
    { title: 'Castidad', description: 'Keyholding y temporizadores', mark: '🔒', category: 'ai', route: '/chastity' },
    { title: 'Hardware Sync', description: 'QIUI / Lovense Bluetooth', mark: '📡', category: 'ai', route: '/hardware' },
    { title: 'Economía D/s', description: 'Moneda de tareas y premios', mark: '🪙', category: 'ai', route: '/task-economy' },
    { title: 'Analítica', description: 'Subspace tracker y gráficos', mark: '📊', category: 'ai', route: '/analytics' },
    { title: 'Logros', description: 'Insignias de exploración', mark: '🥇', category: 'ai', route: '/achievements' },
    { title: 'Premium', description: 'Compatikink PRO', mark: '👑', category: 'ai', route: '/premium' },

    // Bóveda (vault)
    { title: 'Bóveda Privada', description: 'Álbum de fotos cifrado AES-GCM', mark: '🖼️', category: 'vault', route: '/private-album' },
    { title: 'Cuenta & Bóveda', description: 'Acceso Zero-Knowledge', mark: '🔑', category: 'vault', route: '/auth' },
    { title: 'Backup Cifrado', description: 'Exportar / importar en JSON', mark: '📦', category: 'vault', onPress: handleBackup },
    { title: 'Admin', description: 'Requiere bóveda + rol local', mark: '🛡️', category: 'vault', route: '/admin' },
    { title: 'Instalar App', description: 'PWA en el dispositivo', mark: '📱', category: 'vault', onPress: () => setShowPWAInstallModal(true) },
    { title: 'Accesibilidad', description: 'Contraste y tipografía', mark: '♿', category: 'vault', onPress: () => setShowA11yModal(true) },
  ];

  const filteredModules = useMemo(() => {
    return allModules.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = searchQuery.trim() ? true : m.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab]);

  const renderCategoryModules = () => (
    <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar módulos, herramientas o guías..."
          placeholderTextColor={colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Tabs (only when not searching) */}
      {!searchQuery.trim() ? (
        <CategoryTabs
          tabs={CATEGORY_TABS}
          activeKey={activeTab}
          onTabChange={setActiveTab}
        />
      ) : (
        <Text style={styles.searchLabel}>
          Resultados de búsqueda ({filteredModules.length}):
        </Text>
      )}

      {/* Modules Grid */}
      <View style={styles.moduleGrid}>
        {filteredModules.map((m) => (
          <View key={m.title} style={isDesktop ? styles.gridColDesktop : styles.gridColMobile}>
            <ModuleTile
              title={m.title}
              description={m.description}
              mark={m.mark}
              accent={ACCENT_COLORS[m.category] || colors.primary}
              onPress={m.onPress || (m.route ? go(m.route) : () => {})}
            />
          </View>
        ))}
      </View>
    </View>
  );

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
      <Text style={styles.mark}>Plataforma de Exploración & Afinidad Cifrada</Text>
      
      {/* Nox Host Octopus Avatar */}
      <OctopusHost />

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

  const renderFetishSuiteCTACards = () => (
    <Section title="Fetish Social & Dating Suite" subtitle="Módulos destacados de conexiones, eventos cifrados y feed anónimo">
      <View style={styles.suiteCardsGrid}>
        {/* Dating Card */}
        <TouchableOpacity style={styles.suiteCardDating} onPress={go('/dating')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💘</Text>
            <View style={styles.suiteBadgePill}>
              <Text style={styles.suiteBadgePillText}>LÁTEX NEGRO</Text>
            </View>
          </View>
          <Text style={styles.suiteCardTitle}>Fetish Dating & Perfiles</Text>
          <Text style={styles.suiteCardDesc}>
            Buscador por roles (Dom/Sub/Switch), insignias visuales cifradas, protocolos SSC/RACK y calculador de complementariedad.
          </Text>
          <View style={styles.suiteCardFooter}>
            <Text style={styles.suiteCardActionText}>Explorar Perfiles ➔</Text>
          </View>
        </TouchableOpacity>

        {/* Events Card */}
        <TouchableOpacity style={styles.suiteCardEvents} onPress={go('/events')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>🍸</Text>
            <View style={styles.suiteBadgePillRose}>
              <Text style={styles.suiteBadgePillTextRose}>DOUBLE-BLIND</Text>
            </View>
          </View>
          <Text style={styles.suiteCardTitle}>Eventos & Munches</Text>
          <Text style={styles.suiteCardDesc}>
            Directorio de reuniones sociales, talleres presenciales de Shibari, libere de ubicación double-blind y etiqueta de Munch.
          </Text>
          <View style={styles.suiteCardFooter}>
            <Text style={styles.suiteCardActionTextRose}>Ver Calendario & RSVP ➔</Text>
          </View>
        </TouchableOpacity>

        {/* Feed Card */}
        <TouchableOpacity style={styles.suiteCardFeed} onPress={go('/kink-feed')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💬</Text>
            <View style={styles.suiteBadgePillEmerald}>
              <Text style={styles.suiteBadgePillTextEmerald}>ZERO-KNOWLEDGE</Text>
            </View>
          </View>
          <Text style={styles.suiteCardTitle}>Feed & Confesionario Anónimo</Text>
          <Text style={styles.suiteCardDesc}>
            Muro de debate con firmas de autenticidad anónimas, encuestas diarias de equipamiento y confesiones cifradas por roles.
          </Text>
          <View style={styles.suiteCardFooter}>
            <Text style={styles.suiteCardActionTextEmerald}>Unirse al Muro Anónimo ➔</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Section>
  );

  const renderLanding = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
      {renderHero(false)}
      {renderFetishSuiteCTACards()}
      {renderGuestJoin()}
      {renderLoginPanel()}
      {renderCategoryModules()}
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
      {renderFetishSuiteCTACards()}
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
          <View style={styles.desktopCol}>{renderCategoryModules()}</View>
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
          {renderCategoryModules()}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 13, 36, 0.9)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  searchLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  gridColDesktop: {
    width: '49%',
  },
  gridColMobile: {
    width: '100%',
  },
  footnote: {
    fontFamily: fonts.body,
    color: colors.textDim,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  suiteCardsGrid: {
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  suiteCardDating: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    gap: spacing.xs,
  },
  suiteCardEvents: {
    backgroundColor: '#160818',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#f43f5e',
    gap: spacing.xs,
  },
  suiteCardFeed: {
    backgroundColor: '#061614',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#10b981',
    gap: spacing.xs,
  },
  suiteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suiteCardEmoji: {
    fontSize: 28,
  },
  suiteBadgePill: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  suiteBadgePillText: {
    color: '#c084fc',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  suiteBadgePillRose: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  suiteBadgePillTextRose: {
    color: '#f43f5e',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  suiteBadgePillEmerald: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.md,
  },
  suiteBadgePillTextEmerald: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  suiteCardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  suiteCardDesc: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  suiteCardFooter: {
    marginTop: 4,
  },
  suiteCardActionText: {
    color: '#c084fc',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  suiteCardActionTextRose: {
    color: '#f43f5e',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  suiteCardActionTextEmerald: {
    color: '#10b981',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
});
