import { ScrollView, StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing, glowShadowPrimary } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { isSupabaseConfigured } from '@/lib/supabase';
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
import { PolyComparatorModal } from '@/components/PolyComparatorModal';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { RegisterProfileModal } from '@/components/RegisterProfileModal';
import { CommunityTrendsModal } from '@/components/CommunityTrendsModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { PWAInstallPromptModal } from '@/components/PWAInstallPromptModal';
import { AccessibilityModal } from '@/components/AccessibilityModal';
import { exportSceneAgreementPDF } from '@/lib/exportPDF';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sceneAgreements, setSceneAgreements] = useState<{ sessionId: string; agreements: SceneAgreement[] }[]>([]);

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
  const [expiryOption, setExpiryOption] = useState<'24h' | '7d' | 'none'>('7d');

  // Modals
  const [showPolyComparator, setShowPolyComparator] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'purple' | 'red' | 'cyan' | 'emerald'>('purple');
  const [debriefTarget, setDebriefTarget] = useState<{ sessionId: string; activityId: string; activityName: string } | null>(null);

  const handlePanicWipe = () => {
    Alert.alert(
      '🛡️ Borrado de Emergencia (Pánico)',
      '¿Estás seguro/a? Se eliminarán inmediatamente todas las sesiones, perfiles y acuerdos guardados en este dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, borrar todo ahora',
          style: 'destructive',
          onPress: async () => {
            await panicWipeData();
            setProfile(null);
            setSessions([]);
            setProfilesList([]);
            setSceneAgreements([]);
            Alert.alert('Datos Eliminados', 'El historial y los perfiles han sido borrados por completo.');
            await loadHomeData();
          },
        },
      ]
    );
  };

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
    const agreements = await getAllSceneAgreements();
    setSceneAgreements(agreements);
  };

  const handleLogin = async () => {
    if (!loginNick.trim()) {
      Alert.alert('Datos incompletos', 'Por favor selecciona o ingresa tu nick.');
      return;
    }
    const selectedProfile = profilesList.find((p) => p.nickname.toLowerCase() === loginNick.trim().toLowerCase());
    if (selectedProfile && !selectedProfile.pin) {
      const { setCurrentProfile } = await import('@/lib/storage');
      await setCurrentProfile(selectedProfile.nickname);
      setLoginPin('');
      await loadHomeData();
      return;
    }
    if (!loginPin) {
      Alert.alert('PIN requerido', 'Por favor ingresa tu PIN de seguridad.');
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

      // Compute expiration date
      let expiresAt: string | undefined;
      if (expiryOption === '24h') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7d') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const session = await createLocalSession(profile.nickname, profile.baseResponses, profile, expiresAt);
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

  const renderUserManualCard = () => (
    <TouchableOpacity
      style={[
        styles.quickProfileCard,
        {
          borderColor: 'rgba(192, 132, 252, 0.5)',
          backgroundColor: 'rgba(192, 132, 252, 0.12)',
          ...glowShadowPrimary(0.25),
        },
      ]}
      onPress={() => router.push('/manual' as any)}
      activeOpacity={0.85}
    >
      <View style={styles.quickProfileInner}>
        <Text style={styles.quickProfileEmoji}>📖</Text>
        <View style={styles.quickProfileText}>
          <Text style={styles.quickProfileTitle}>Manual de Usuario Interactivo</Text>
          <Text style={[styles.quickProfileDesc, { color: colors.neonPurple, lineHeight: 18 }]}>
            Guía completa paso a paso para los 25+ módulos: Seguridad, Castidad, Negociación, Bóveda Zero-Knowledge y más.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.manualActionButton}
          onPress={() => router.push('/manual' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.manualActionButtonText}>Explorar Manual ↗</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderLanding = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.titleText}>Compatikink</Text>
        <Text style={styles.tagline}>
          Define tus preferencias, invita a alguien y recibe un reporte de compatibilidad privado y consensuado.
        </Text>
      </View>

      {renderUserManualCard()}

      {/* 🔐 Account & Zero-Knowledge Vault CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.5)', backgroundColor: 'rgba(74, 222, 128, 0.12)' }]}
        onPress={() => router.push('/auth')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🔐</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Cuenta de Usuario & Bóveda Cifrada</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Acceso con cifrado Zero-Knowledge End-to-End</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 👤 Register Personal Profile Button */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(59, 130, 246, 0.4)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}
        onPress={() => setShowRegisterModal(true)}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>👤</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Crear Perfil Personal</Text>
            <Text style={[styles.quickProfileDesc, { color: '#60a5fa' }]}>Registra tu nombre + PIN de 4 dígitos</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: '#60a5fa' }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ⚡ Quick Profile CTA — Secondary action */}
      <TouchableOpacity style={styles.quickProfileCard} onPress={() => router.push('/quick-profile')}>
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>⚡</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Perfil Rápido (10 Preguntas)</Text>
            <Text style={styles.quickProfileDesc}>Solo 10 preguntas · ~2 minutos · Privado</Text>
          </View>
          <Text style={styles.quickProfileArrow}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📚 Glossary CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/glossary')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📚</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Glosario Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: '#38bdf8' }]}>Términos esenciales · Educación y consentimiento</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: '#38bdf8' }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 💘 Dating & Match Discovery CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.5)', backgroundColor: 'rgba(244, 114, 182, 0.12)' }]}
        onPress={() => router.push('/dating')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>💘</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Conexiones & Dating Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Descubre personas compatibles con tus gustos real-time</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📋 Live Negotiation Room CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/negotiation')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📋</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Sala de Negociación en Vivo</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Revisión sincrónica de escenas y firma de acuerdos</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🛡️ Safety & Health Guide CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/safety-guide')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🛡️</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Guía de Seguridad & Salud Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Protocolos de riesgos, SSC/RACK y primeros auxilios</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🧑‍🤝‍🧑 Pass & Play CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => router.push('/pass-and-play')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🧑‍🤝‍🧑</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Modo Presencial (Mismo Teléfono)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Responder en el mismo dispositivo con cortina de privacidad</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🧰 Gear Closet CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/gear-closet')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🧰</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Inventario de Equipamiento (Gear Closet)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Administra accesorios, cuerdas y herramientas de seguridad</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎶 Playlists CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.4)', backgroundColor: 'rgba(244, 114, 182, 0.08)' }]}
        onPress={() => router.push('/playlists')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎶</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Ambientes Sonoros & Playlists</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Música y ritmos corporales diseñados para acompañar escenas</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/calendar')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📅</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Calendario de Escenas & Aftercare</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Agendar citas y alertas de seguimiento emocional a las 24h</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎴 Truth or Dare Game CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.4)', backgroundColor: 'rgba(244, 114, 182, 0.08)' }]}
        onPress={() => router.push('/truth-or-dare')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎴</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Juego de Cartas: Verdad o Reto Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Cartas interactivas para citas basadas en sus matches mutuos</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 👥 Poly Group Matrix CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.08)' }]}
        onPress={() => router.push('/poly-group')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>👥</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Matriz Grupal & Poliamor (3+ personas)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Cruzar respuestas entre 3 o más personas simultáneamente</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📈 Analytics Tracker CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/analytics')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📈</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Analítica Emocional & Subspace Tracker</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Gráfico histórico de emociones post-escena y aftercare</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 👑 Admin Dashboard CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(234, 179, 8, 0.4)', backgroundColor: 'rgba(234, 179, 8, 0.08)' }]}
        onPress={() => router.push('/admin')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>👑</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Panel de Administración & Analítica Global</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Inspección de inscritos, respuestas y métricas globales (PIN 9999)</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 💎 Compatikink PRO Premium CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.5)', backgroundColor: 'rgba(244, 114, 182, 0.12)' }]}
        onPress={() => router.push('/premium')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>💎</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Compatikink PRO (Suscripción & Beneficios)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Herramientas ilimitadas, recomendador IA y matriz poliamor</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🏅 Achievements & Badges CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/achievements')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🏅</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Logros & Insignias Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Recompensas por explorar actividades y cuidar la seguridad</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🔒 Chastity & Keyholding CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => router.push('/chastity')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🔒</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Módulo de Castidad & Keyholding</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Encuentro seguro entre Keyholders y Sumis en Castidad</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ⚡ Hardware & QIUI Direct Control CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/hardware')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>⚡</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Control Hardware & QIUI Direct</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Conexión Bluetooth (WebBLE) para QIUI Cellmate y Lovense</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🛍️ Kink Store & Sexshop Marketplace CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/store')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🛍️</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Mercado & Tienda Kink (Sexshop Partners)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Accesorios, cuerdas y juguetes recomendados por tus gustos</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🤖 AI BDSM Roleplay Companion CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => router.push('/ai-roleplay')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🤖</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Roleplay con Inteligencia Artificial</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Ensayo de dinámicas, negociación y exploración de fantasías</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📰 Community Feed & Polls CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.4)', backgroundColor: 'rgba(244, 114, 182, 0.08)' }]}
        onPress={() => router.push('/kink-feed')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📰</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Feed & Encuestas de la Comunidad</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Muro de debate anónimo y encuestas diarias estilo Mazmo</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🤖 Scene AI Generator CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => router.push('/scene-ai')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🤖</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Recomendador IA de Escenas</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Rutinas paso a paso personalizadas según tu historial y wishlist</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎓 Kink Academy & Courses CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/courses')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎓</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Kink Academy & Cursos Interactivos</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Lecciones guiadas, prevención de riesgos y quizzes de certificación</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🏘️ Communities & Private Groups CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/communities')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🏘️</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Comunidades & Grupos Privados</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Foros temáticos de Shibari, Aftercare, D/s y estilo de vida</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🗓️ Events & Munches Directory CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/events')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🗓️</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Directorio de Eventos & Munches</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Reuniones presenciales, talleres y reservas discretas de RSVP</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📊 Compatikink Wrapped CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.4)', backgroundColor: 'rgba(244, 114, 182, 0.08)' }]}
        onPress={() => router.push('/wrapped')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📊</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Compatikink Wrapped 2026</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Tu resumen anual animado de exploración y estadísticas</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎲 Weekly Kink Challenge CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/weekly-challenge')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎲</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Retos Semanales Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Desafíos personalizados guiados con recompensas de XP</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📲 PWA Direct Browser Installer CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.5)', backgroundColor: 'rgba(74, 222, 128, 0.12)' }]}
        onPress={() => setShowPWAInstallModal(true)}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📲</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Instalar App en el Teléfono (PWA 1-Tap)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Acceso directo sin tienda, notificaciones y funcionamiento offline</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ♿ Accessibility & High Contrast CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => setShowA11yModal(true)}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>♿</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Ajustes de Accesibilidad (A11y)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Modo Alto Contraste, tamaño de fuente y lectores de pantalla</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎮 Task Economy D/s CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => router.push('/task-economy')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎮</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Economía D/s & Tareas Gamificadas</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Completa tareas y protocolos para ganar Kink Coins y canjear recompensas</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🤝 Double-Blind Fantasy Match CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/fantasy-match')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🤝</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Match Secreto de Fantasías (Double-Blind)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Revela solo coincidencias mutuas sin riesgo de juicio o vergüenza</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📊 BDSM Archetypes Quiz CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/archetypes')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📊</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Quiz de Arquetipos BDSM</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Diagnóstico porcentual de roles (Dom, Sub, Rigger, Sadist, etc.)</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📋 Ritual Builder D/s CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}
        onPress={() => router.push('/rituals')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📋</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Ritual Builder & Protocolos D/s</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.info }]}>Diseñador de secuencias guiadas de saludos, prevención y aftercare</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.info }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 📜 Digital D/s Contracts CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(244, 114, 182, 0.4)', backgroundColor: 'rgba(244, 114, 182, 0.08)' }]}
        onPress={() => router.push('/contracts')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>📜</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Contratos D/s Digitales & Acuerdos</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPink }]}>Firma digital de acuerdos con límites duros, safewords y renovación</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPink }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🔐 Encrypted Private Photo Album CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(74, 222, 128, 0.4)', backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}
        onPress={() => router.push('/private-album')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🔐</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Bóveda de Fotos Privadas (AES-256)</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.success }]}>Álbum cifrado con links de acceso temporal y botón de revocación total</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.success }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ✍️ Personal Blog & Kink Writings CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(251, 191, 36, 0.4)', backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}
        onPress={() => router.push('/writings')}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>✍️</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Blog Personal & Escritos Kink</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.warning }]}>Espacio personal estilo FetLife Writings para diarios, reflexiones y poesía</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.warning }]}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🔐 Backup & Restore CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.3)', backgroundColor: 'rgba(192, 132, 252, 0.06)' }]}
        onPress={async () => {
          Alert.alert(
            '🔐 Copia de Seguridad Local (Backup)',
            '¿Qué acción deseas realizar con tus datos guardados?',
            [
              {
                text: '📥 Exportar JSON',
                onPress: async () => {
                  const json = await exportUserDataJSON();
                  await Clipboard.setStringAsync(json);
                  Alert.alert('Copia Exportada 📋', 'Se ha copiado el JSON de respaldo al portapapeles.');
                },
              },
              {
                text: '📤 Importar Backup',
                onPress: async () => {
                  const str = await Clipboard.getStringAsync();
                  try {
                    const count = await importUserDataJSON(str);
                    Alert.alert('Backup Restaurado ✅', `Se han restaurado ${count} registros locales.`);
                  } catch {
                    Alert.alert('Error', 'El portapapeles no contiene un JSON de backup válido.');
                  }
                },
              },
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
        }}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🔐</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Copia de Seguridad (Backup JSON)</Text>
            <Text style={styles.quickProfileDesc}>Exportar / Importar perfiles y respuestas encriptadas</Text>
          </View>
          <Text style={styles.quickProfileArrow}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 🎨 Theme Switcher CTA */}
      <TouchableOpacity
        style={[styles.quickProfileCard, { borderColor: 'rgba(192, 132, 252, 0.4)', backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}
        onPress={() => setShowThemeModal(true)}
      >
        <View style={styles.quickProfileInner}>
          <Text style={styles.quickProfileEmoji}>🎨</Text>
          <View style={styles.quickProfileText}>
            <Text style={styles.quickProfileTitle}>Personalizar Tema Visual</Text>
            <Text style={[styles.quickProfileDesc, { color: colors.neonPurple }]}>Morado Neón, Rojo Pasional, Azul Eléctrico o Verde Esmeralda</Text>
          </View>
          <Text style={[styles.quickProfileArrow, { color: colors.neonPurple }]}>›</Text>
        </View>
      </TouchableOpacity>

      {profilesList.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inicia Sesión con tu Perfil</Text>
          <View style={styles.profilesRow}>
            {profilesList.map((p) => (
              <TouchableOpacity
                key={p.nickname}
                style={[styles.profileButton, loginNick === p.nickname && styles.profileButtonActive]}
                onPress={() => setLoginNick(p.nickname)}
              >
                <Text style={styles.profileButtonText}>
                  {p.nickname} {p.pin ? '🔐' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {loginNick ? (() => {
            const selProfile = profilesList.find((p) => p.nickname.toLowerCase() === loginNick.toLowerCase());
            const hasPin = selProfile ? Boolean(selProfile.pin) : false;

            return (
              <View style={styles.loginForm}>
                {hasPin ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Text style={[styles.label, { color: colors.success }]}>✓ Perfil sin PIN (Acceso directo)</Text>
                    <Button title={`Entrar como ${loginNick} 🚀`} onPress={handleLogin} />
                  </>
                )}
              </View>
            );
          })() : null}
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

  const renderProfileSummaryCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>👤 Mi Perfil</Text>
      <Text style={styles.cardDesc}>
        Nick: <Text style={{ color: colors.text, fontWeight: '700' }}>{profile?.nickname}</Text>
        {profile?.pronouns ? ` (${profile.pronouns})` : ''}
      </Text>
      {profile?.experienceLevel ? (
        <Text style={styles.cardDesc}>
          Nivel: {EXPERIENCE_LABELS[profile.experienceLevel]}
        </Text>
      ) : null}
      {profile?.notes ? <Text style={[styles.cardDesc, { fontStyle: 'italic' }]}>"{profile.notes}"</Text> : null}
    </View>
  );

  const renderQuickInviteBox = () => (
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

          <Text style={styles.label}>⏳ Expiración del código</Text>
          <View style={styles.expiryRow}>
            {([
              { label: '24 horas', value: '24h' as const },
              { label: '7 días', value: '7d' as const },
              { label: 'Sin límite', value: 'none' as const },
            ] as const).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.expiryChip, expiryOption === opt.value && styles.expiryChipActive]}
                onPress={() => setExpiryOption(opt.value)}
              >
                <Text style={[styles.expiryChipText, expiryOption === opt.value && styles.expiryChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
  );

  const renderEditResponsesCard = () => (
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
  );

  const renderSceneAgreementsCard = () => (
    sceneAgreements.length > 0 ? (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Mis Acuerdos de Escena</Text>
        <Text style={styles.cardDesc}>Acuerdos de safewords y límites guardados por pareja.</Text>
        {sceneAgreements.map(({ sessionId, agreements }) => {
          const session = sessions.find((s) => s.id === sessionId);
          const partner = session
            ? (session.guestNickname || session.initiatorNickname || 'Invitado')
            : sessionId.slice(0, 8);
          return (
            <View key={sessionId} style={styles.sceneAgreementGroup}>
              <Text style={styles.sceneAgreementPartner}>Con {partner}</Text>
              {agreements.map((ag) => (
                <TouchableOpacity
                  key={ag.id}
                  style={styles.sceneAgreementRow}
                  onPress={() => router.push({ pathname: '/report', params: { token: session?.initiatorToken ?? '' } })}
                >
                  <View style={styles.sceneAgreementInfo}>
                    <Text style={styles.sceneAgreementActivity}>{ag.activityName}</Text>
                    <Text style={styles.sceneAgreementSafewords}>
                      🟢 {ag.safewordGreen} · 🟡 {ag.safewordYellow} · 🔴 {ag.safewordRed}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.sessionActionBtn, { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: 8 }]}
                      onPress={() => setDebriefTarget({ sessionId: ag.sessionId, activityId: ag.activityId, activityName: ag.activityName })}
                    >
                      <Text style={{ color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '700' }}>📝 Debrief</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sessionActionBtn, { backgroundColor: 'rgba(96, 165, 250, 0.15)', borderRadius: 8 }]}
                      onPress={() => exportSceneAgreementPDF(ag, partner)}
                    >
                      <Text style={{ color: colors.info, fontSize: fontSize.xs, fontWeight: '700' }}>📄 PDF</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    ) : null
  );

  const renderHistoryCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Historial de Compatividades</Text>
      {sessions.length === 0 ? (
        <Text style={styles.cardDesc}>Aún no has creado ni respondido ninguna invitación.</Text>
      ) : (
        <View style={styles.sessionsList}>
          {sessions.map((s) => {
            const isInitiator = s.initiatorNickname === profile?.nickname;
            const partner = isInitiator ? (s.guestNickname || 'Invitado') : (s.initiatorNickname || 'Iniciador');
            const isComplete = s.status === 'complete';
            const isWaiting = s.status === 'waiting';
            const isExpired = !isComplete && s.expiresAt ? new Date(s.expiresAt) < new Date() : false;

            const timeAgo = (iso?: string) => {
              if (!iso) return '';
              const diff = Date.now() - new Date(iso).getTime();
              const mins = Math.floor(diff / 60000);
              const hours = Math.floor(diff / 3600000);
              const days = Math.floor(diff / 86400000);
              if (mins < 2) return 'hace un momento';
              if (mins < 60) return `hace ${mins} min`;
              if (hours < 24) return `hace ${hours}h`;
              return `hace ${days}d`;
            };

            const timeUntil = (iso?: string) => {
              if (!iso) return null;
              const diff = new Date(iso).getTime() - Date.now();
              if (diff <= 0) return null;
              const hours = Math.floor(diff / 3600000);
              const days = Math.floor(diff / 86400000);
              if (hours < 24) return `Expira en ${hours}h`;
              return `Expira en ${days}d`;
            };

            const statusLabel = isExpired
              ? '🚫 Expirada'
              : isComplete
              ? `✅ Completado ${timeAgo(s.completedAt)}`
              : isWaiting
              ? `⏳ Esperando respuesta`
              : '📝 Borrador';
            const statusColor = isExpired
              ? colors.danger
              : isComplete
              ? colors.success
              : isWaiting
              ? colors.warning
              : colors.textMuted;

            const expiryLabel = !isComplete && !isExpired ? timeUntil(s.expiresAt) : null;

            return (
              <View key={s.id} style={styles.sessionCard}>
                <View style={styles.sessionCardHeader}>
                  <View style={[styles.sessionStatusBadge, { borderColor: statusColor }]}>
                    <Text style={[styles.sessionStatusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                  <Text style={styles.sessionTime}>{timeAgo(s.createdAt)}</Text>
                </View>

                <View style={styles.sessionCardBody}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionPartner}>
                      {isInitiator ? '↗ Tú → ' : '↙ '}
                      <Text style={{ color: isComplete ? colors.neonPurple : colors.text }}>{partner}</Text>
                    </Text>
                    <Text style={styles.sessionDetails}>
                      Código: <Text style={{ fontWeight: '700', letterSpacing: 1 }}>{s.inviteCode}</Text>
                      {!isComplete && isWaiting ? ' · Compartir para recibir respuestas' : ''}
                      {expiryLabel ? <Text style={{ color: colors.warning }}>{`\n${expiryLabel}`}</Text> : null}
                      {isExpired ? <Text style={{ color: colors.danger }}>{'\nCódigo ya no válido'}</Text> : null}
                    </Text>
                  </View>
                  <View style={styles.sessionActions}>
                    {isComplete ? (
                      <Button
                        title="📊 Reporte"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/report', params: { token: s.initiatorToken } })}
                      />
                    ) : (
                      <Button
                        title="📨 Invitar"
                        variant="secondary"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/invite', params: { token: s.initiatorToken } })}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderAccountActionsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>⚙️ Cuenta y Seguridad</Text>
      <Button title="Cerrar Sesión" variant="ghost" onPress={handleLogout} />
      <Button
        title="🛡️ Borrado de Emergencia / Pánico"
        variant="ghost"
        onPress={handlePanicWipe}
        style={{ marginTop: spacing.xs }}
      />
    </View>
  );

  const renderCommunityToolsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🛠️ Herramientas y Comunidad</Text>
      {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
        <Button
          title="👥 Comparar Parejas (Poli / Multi-Vínculo)"
          variant="secondary"
          onPress={() => setShowPolyComparator(true)}
        />
      ) : null}
      <Button
        title="📊 Radar de Tendencias de la Comunidad"
        variant="secondary"
        onPress={() => setShowTrendsModal(true)}
      />
    </View>
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

      {isDesktop ? (
        <View style={styles.desktopGrid}>
          {/* Left Column (~48% width) */}
          <View style={styles.desktopColLeft}>
            {renderProfileSummaryCard()}
            {renderUserManualCard()}
            {renderQuickInviteBox()}
            {renderEditResponsesCard()}
            {renderAccountActionsCard()}
          </View>

          {/* Right Column (~52% width) */}
          <View style={styles.desktopColRight}>
            {renderHistoryCard()}
            {renderSceneAgreementsCard()}
            {renderCommunityToolsCard()}
          </View>
        </View>
      ) : (
        <>
          {renderUserManualCard()}
          {renderQuickInviteBox()}
          {renderEditResponsesCard()}
          {renderSceneAgreementsCard()}
          {renderHistoryCard()}
          <Button title="Cerrar Sesión" variant="ghost" onPress={handleLogout} />
          {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
            <Button
              title="👥 Comparar Parejas (Poli / Multi-Vínculo)"
              variant="secondary"
              onPress={() => setShowPolyComparator(true)}
            />
          ) : null}
          <Button
            title="📊 Radar de Tendencias de la Comunidad"
            variant="secondary"
            onPress={() => setShowTrendsModal(true)}
          />
          <Button
            title="🛡️ Borrado de Emergencia / Pánico"
            variant="ghost"
            onPress={handlePanicWipe}
            style={{ marginTop: spacing.sm }}
          />
        </>
      )}

      <PolyComparatorModal
        visible={showPolyComparator}
        onClose={() => setShowPolyComparator(false)}
        sessions={sessions}
        currentProfile={profile!}
      />

      <CommunityTrendsModal
        visible={showTrendsModal}
        onClose={() => setShowTrendsModal(false)}
      />

      {/* 🎨 Theme Switcher Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowThemeModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>🎨 Apariencia & Temas Visuales</Text>
            <Text style={styles.modalSub}>Selecciona la atmósfera visual de la aplicación:</Text>

            <View style={{ gap: spacing.sm, width: '100%', marginVertical: spacing.md }}>
              {[
                { id: 'purple', name: '🟣 Morado Neón (Predeterminado Cyberpunk)', color: '#c084fc' },
                { id: 'red', name: '🔴 Rojo Pasión (Elegante & Pasional)', color: '#ef4444' },
                { id: 'cyan', name: '🔵 Azul Eléctrico (Sleek High-Tech)', color: '#38bdf8' },
                { id: 'emerald', name: '🟢 Verde Esmeralda (Velvet Dark)', color: '#34d399' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themeOptionRow,
                    selectedTheme === t.id && { borderColor: t.color, backgroundColor: `${t.color}15` },
                  ]}
                  onPress={() => {
                    setSelectedTheme(t.id as any);
                    Alert.alert('Tema Actualizado 🎨', `Se ha aplicado el tema ${t.name}.`);
                    setShowThemeModal(false);
                  }}
                >
                  <View style={[styles.themeColorDot, { backgroundColor: t.color }]} />
                  <Text style={[styles.themeOptionText, selectedTheme === t.id && { color: t.color, fontWeight: '800' }]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Cerrar" variant="ghost" onPress={() => setShowThemeModal(false)} />
          </View>
        </View>
      </Modal>

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

      {/* 🔞 Age Verification Modal */}
      <AgeVerificationModal />

      {/* 📲 PWA Direct Installer Modal */}
      <PWAInstallPromptModal
        visible={showPWAInstallModal}
        onClose={() => setShowPWAInstallModal(false)}
      />

      {/* ♿ Accessibility Settings Modal */}
      <AccessibilityModal
        visible={showA11yModal}
        onClose={() => setShowA11yModal(false)}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <OnboardingOverlay onDone={() => {}} />
      <RegisterProfileModal
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => loadHomeData()}
      />
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
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopColLeft: {
    flex: 48,
    gap: spacing.lg,
  },
  desktopColRight: {
    flex: 52,
    gap: spacing.lg,
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
    gap: spacing.sm,
  },
  sessionCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sessionCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sessionStatusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  sessionStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  sessionTime: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  sessionInfo: {
    flex: 2,
  },
  sessionPartner: {
    color: colors.text,
    fontSize: fontSize.sm,
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

  // Scene Agreement styles
  sceneAgreementGroup: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  sceneAgreementPartner: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sceneAgreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneAgreementInfo: {
    flex: 1,
  },
  sceneAgreementActivity: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sceneAgreementSafewords: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  sceneAgreementArrow: {
    color: colors.textMuted,
    fontSize: 22,
    paddingLeft: spacing.sm,
  },

  // Expiry picker chips
  expiryRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  expiryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  expiryChipActive: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  expiryChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  expiryChipTextActive: {
    color: colors.warning,
    fontWeight: '700',
  },

  quickProfileCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderRadius: 16,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    overflow: 'hidden',
  },
  quickProfileInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  quickProfileEmoji: {
    fontSize: 32,
  },
  quickProfileText: {
    flex: 1,
  },
  quickProfileTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginBottom: 2,
  },
  quickProfileDesc: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  quickProfileArrow: {
    color: colors.neonPurple,
    fontSize: 28,
    fontWeight: '300',
  },

  // Theme Switcher Styles
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  themeColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeOptionText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  manualActionButton: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    alignSelf: 'center',
  },
  manualActionButtonText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
    padding: spacing.xs,
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  modalSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
