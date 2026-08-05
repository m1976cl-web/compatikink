/**
 * index.tsx — Dashboard principal de Compatikink.
 *
 * Refactorizado (#16): la lógica pesada fue extraída a:
 *   - hooks/useHomeData.ts    → carga de datos, login, logout, panic wipe
 *   - hooks/useQuickInvite.ts → flujo de creación de invitaciones rápidas
 *   - data/homeModules.ts     → definición de los ~50 módulos del dashboard
 *   - components/SessionsPanel.tsx → historial de sesiones y acuerdos de escena
 *
 * Este archivo conserva únicamente la orquestación y la presentación.
 */

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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button }                 from '@/components/Button';
import { ModuleTile }             from '@/components/ModuleTile';
import { Section }                from '@/components/Section';
import { OnboardingOverlay }      from '@/components/OnboardingOverlay';
import { RegisterProfileModal }   from '@/components/RegisterProfileModal';
import { PolyComparatorModal }    from '@/components/PolyComparatorModal';
import { CommunityTrendsModal }   from '@/components/CommunityTrendsModal';
import { SceneDebriefModal }      from '@/components/SceneDebriefModal';
import { AgeVerificationModal }   from '@/components/AgeVerificationModal';
import { PWAInstallPromptModal }  from '@/components/PWAInstallPromptModal';
import { AccessibilityModal }     from '@/components/AccessibilityModal';
import { OctopusHost }            from '@/components/OctopusHost';
import { CategoryTabs }           from '@/components/CategoryTabs';
import { VaultLockGate }          from '@/components/VaultLockGate';
import { SessionsPanel }          from '@/components/SessionsPanel';

import { colors, fonts, fontSize, gradients, radii, spacing, typography } from '@/constants/theme';
import { useResponsive }          from '@/hooks/useResponsive';
import { useHomeData }            from '@/hooks/useHomeData';
import { useQuickInvite }         from '@/hooks/useQuickInvite';
import { STATIC_MODULES, ACCENT_COLORS, CATEGORY_TABS } from '@/data/homeModules';

import { isSupabaseConfigured }   from '@/lib/supabase';
import { VaultLockGateAPI }       from '@/lib/cryptoVault';
import { exportUserDataJSON, importUserDataJSON, panicWipeData } from '@/lib/storage';
import { SceneAgreement }         from '@/types';
import { exportSceneAgreementPDF } from '@/lib/exportPDF';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  category: string;
  route?: string;
  onPress?: () => void;
};

export default function HomeScreen() {
  const router      = useRouter();
  const { isDesktop } = useResponsive();

  // ── Data & Auth ──────────────────────────────────────────────────────────────
  const { profile, profilesList, sessions, sceneAgreements, loadHomeData, handleLogin, handleLogout, handlePanicWipe } = useHomeData();
  const [vaultOpen, setVaultOpen] = useState(() => VaultLockGateAPI.isUnlocked());

  // ── Login form state ──────────────────────────────────────────────────────────
  const [loginNick, setLoginNick] = useState('');
  const [loginPin,  setLoginPin]  = useState('');
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [activeTab,          setActiveTab]          = useState('explore');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [guestCode,          setGuestCode]          = useState('');
  const [showRegisterModal,  setShowRegisterModal]  = useState(false);
  const [showPolyComparator, setShowPolyComparator] = useState(false);
  const [showTrendsModal,    setShowTrendsModal]    = useState(false);
  const [showPWAInstallModal,setShowPWAInstallModal]= useState(false);
  const [showA11yModal,      setShowA11yModal]      = useState(false);
  const [debriefTarget,      setDebriefTarget]      = useState<{ sessionId: string; activityId: string; activityName: string } | null>(null);

  // ── Quick Invite ──────────────────────────────────────────────────────────────
  const invite = useQuickInvite(profile, loadHomeData);

  // ── Animations ────────────────────────────────────────────────────────────────
  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(18)).current;
  const scrollRef      = useRef<ScrollView>(null);
  const guestSectionY  = useRef(0);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('compatikink_onboarding_complete_v1');
        if (!completed) {
          router.replace('/onboarding' as any);
        } else {
          setOnboardingChecked(true);
        }
      } catch (e) {
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, [router]);

  useEffect(() => {
    if (!onboardingChecked) return;
    loadHomeData();
    const unsub = VaultLockGateAPI.subscribe((snap) => setVaultOpen(snap.unlocked));
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
    return unsub;
  }, [onboardingChecked]);

  // ── Backup ────────────────────────────────────────────────────────────────────
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
          if (!passphrase || passphrase.length < 4) { Alert.alert('Cancelado', 'Se requiere contraseña.'); return; }
          try {
            const json = await exportUserDataJSON(passphrase);
            await Clipboard.setStringAsync(json);
            Alert.alert('Backup listo', 'Ciphertext copiado. Guarda también tu contraseña.');
          } catch (e: any) { Alert.alert('Error', e?.message || 'No se pudo exportar.'); }
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
          } catch (e: any) { Alert.alert('Error', e?.message || 'Backup inválido o contraseña incorrecta.'); }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const go = (path: string) => () => router.push(path as any);

  // ── Module list (static + dynamic vault entries) ──────────────────────────────
  const allModules: ModuleDef[] = useMemo(() => [
    ...STATIC_MODULES,
    // Vault entries that require callbacks
    { title: 'Bóveda Privada',  description: 'Álbum de fotos cifrado AES-GCM',   mark: '🖼️', category: 'vault', route: '/private-album'  },
    { title: 'Cuenta & Bóveda', description: 'Acceso Zero-Knowledge',             mark: '🔑', category: 'vault', route: '/auth'           },
    { title: 'Backup Cifrado',  description: 'Exportar / importar en JSON',       mark: '📦', category: 'vault', onPress: handleBackup    },
    { title: 'Admin',           description: 'Requiere bóveda + rol local',       mark: '🛡️', category: 'vault', route: '/admin'          },
    { title: 'Instalar App',    description: 'PWA en el dispositivo',             mark: '📱', category: 'vault', onPress: () => setShowPWAInstallModal(true) },
    { title: 'Accesibilidad',   description: 'Contraste y tipografía',            mark: '♿', category: 'vault', onPress: () => setShowA11yModal(true)      },
  ], [handleBackup]);

  const filteredModules = useMemo(() => {
    return allModules.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = searchQuery.trim() ? true : m.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab, allModules]);

  // ── Guest join ────────────────────────────────────────────────────────────────
  const joinAsGuest = () => {
    const raw = guestCode.trim();
    const secretFromPaste = (() => {
      try {
        if (raw.includes('k=')) {
          const m = raw.match(/[?#&]k=([^&\s#]+)/);
          if (m) return decodeURIComponent(m[1]);
        }
      } catch { /* ignore */ }
      return undefined;
    })();
    const codeMatch = raw.match(/guest\/([A-Za-z0-9]+)/i);
    const code = (codeMatch ? codeMatch[1] : raw.replace(/[^A-Za-z0-9]/g, '')).toUpperCase();
    if (code.length < 4) { Alert.alert('Código inválido', 'Introduce el código o el enlace completo.'); return; }
    if (secretFromPaste) { router.push(`/guest/${code}?k=${encodeURIComponent(secretFromPaste)}`); }
    else                 { router.push(`/guest/${code}`); }
  };

  // ── Sub-renders ───────────────────────────────────────────────────────────────
  const renderModuleGrid = () => (
    <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
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
      {!searchQuery.trim() ? (
        <CategoryTabs tabs={CATEGORY_TABS} activeKey={activeTab} onTabChange={setActiveTab} />
      ) : (
        <Text style={styles.searchLabel}>Resultados de búsqueda ({filteredModules.length}):</Text>
      )}
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

  const renderHero = (loggedIn: boolean) => (
    <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
      <Text style={styles.brand} accessibilityRole="header">Compatikink</Text>
      <Text style={styles.mark}>Plataforma de Exploración & Afinidad Cifrada</Text>
      <OctopusHost />
      <Text style={styles.headline}>
        {loggedIn ? `Hola, ${profile?.nickname}` : 'Preferencias privadas. Compatibilidad consensuada.'}
      </Text>
      <Text style={styles.heroSupport}>
        {loggedIn
          ? profile?.experienceLevel ? `Nivel: ${profile.experienceLevel}` : 'Tu espacio cifrado en este dispositivo.'
          : 'Define límites, invita a alguien y recibe un reporte sin revelar respuestas individuales.'}
      </Text>
      <View style={styles.ctaGroup}>
        {loggedIn ? (
          <>
            <Button title="Crear invitación" onPress={() => invite.setShowQuickInvite(true)} style={styles.ctaPrimary} />
            <Button title="Editar respuestas" variant="secondary" onPress={go('/questionnaire')} style={styles.ctaSecondary} />
            <Button title={vaultOpen ? 'Bloquear bóveda' : 'Abrir bóveda'} variant="ghost"
              onPress={() => { if (vaultOpen) VaultLockGateAPI.lock(); else router.push('/auth' as any); }} />
          </>
        ) : (
          <>
            <Button title="Empezar" onPress={go('/questionnaire')} style={styles.ctaPrimary} />
            <Button title="Me invitaron" variant="secondary"
              onPress={() => scrollRef.current?.scrollTo({ y: Math.max(0, guestSectionY.current - 24), animated: true })}
              style={styles.ctaSecondary} />
            <Button title="Entrar a bóveda" variant="ghost" onPress={go('/auth')} />
          </>
        )}
      </View>
    </Animated.View>
  );

  const renderFetishSuiteCTACards = () => (
    <Section title="Fetish Social & Dating Suite" subtitle="Módulos destacados de conexiones, eventos cifrados y feed anónimo">
      <View style={styles.suiteCardsGrid}>
        <TouchableOpacity style={styles.suiteCardDating} onPress={go('/dating')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💘</Text>
            <View style={styles.suiteBadgePill}><Text style={styles.suiteBadgePillText}>LÁTEX NEGRO</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Fetish Dating & Perfiles</Text>
          <Text style={styles.suiteCardDesc}>Buscador por roles (Dom/Sub/Switch), insignias visuales cifradas, protocolos SSC/RACK y calculador de complementariedad.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionText}>Explorar Perfiles ➔</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suiteCardEvents} onPress={go('/events')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>🍸</Text>
            <View style={styles.suiteBadgePillRose}><Text style={styles.suiteBadgePillTextRose}>DOUBLE-BLIND</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Eventos & Munches</Text>
          <Text style={styles.suiteCardDesc}>Directorio de reuniones sociales, talleres presenciales de Shibari, libere de ubicación double-blind y etiqueta de Munch.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionTextRose}>Ver Calendario & RSVP ➔</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.suiteCardFeed} onPress={go('/kink-feed')}>
          <View style={styles.suiteCardHeader}>
            <Text style={styles.suiteCardEmoji}>💬</Text>
            <View style={styles.suiteBadgePillEmerald}><Text style={styles.suiteBadgePillTextEmerald}>ZERO-KNOWLEDGE</Text></View>
          </View>
          <Text style={styles.suiteCardTitle}>Feed & Confesionario Anónimo</Text>
          <Text style={styles.suiteCardDesc}>Muro de debate con firmas de autenticidad anónimas, encuestas diarias de equipamiento y confesiones cifradas por roles.</Text>
          <View style={styles.suiteCardFooter}><Text style={styles.suiteCardActionTextEmerald}>Unirse al Muro Anónimo ➔</Text></View>
        </TouchableOpacity>
      </View>
    </Section>
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
    <Section title="Entrar con perfil local" subtitle="Tu PIN deriva la clave de bóveda (PBKDF2). No sale de este dispositivo.">
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
            <TextInput style={styles.input} placeholder="Tu nick" placeholderTextColor={colors.textDim}
              value={loginNick} onChangeText={setLoginNick} autoCapitalize="none" />
          </>
        )}
        {loginNick ? (
          <>
            <Text style={styles.label}>PIN</Text>
            <TextInput style={styles.input} placeholder="••••" placeholderTextColor={colors.textDim}
              value={loginPin} onChangeText={setLoginPin} secureTextEntry keyboardType="numeric" maxLength={8} />
            <Button title="Entrar" onPress={() => handleLogin(loginNick, loginPin).then(() => setLoginPin(''))} />
          </>
        ) : null}
        <Button title="Crear perfil personal" variant="ghost" onPress={() => setShowRegisterModal(true)} />
      </View>
    </Section>
  );

  const renderQuickInviteForm = () =>
    invite.showQuickInvite ? (
      <Section title="Invitación rápida" subtitle="Usa tus respuestas base guardadas.">
        <View style={styles.interactivePanel}>
          <Text style={styles.label}>Apodo de la otra persona</Text>
          <TextInput style={styles.input} placeholder="Ej: Sam" placeholderTextColor={colors.textDim}
            value={invite.quickGuestNick} onChangeText={invite.setQuickGuestNick} />
          <Text style={styles.label}>Notas confidenciales (opcional)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Notas privadas…" placeholderTextColor={colors.textDim}
            value={invite.quickGuestNotes} onChangeText={invite.setQuickGuestNotes} multiline />
          <View style={styles.expiryRow}>
            {([{ label: '24 h', value: '24h' as const }, { label: '7 días', value: '7d' as const }, { label: 'Sin límite', value: 'none' as const }]).map((opt) => (
              <TouchableOpacity key={opt.value}
                style={[styles.expiryChip, invite.expiryOption === opt.value && styles.expiryChipActive]}
                onPress={() => invite.setExpiryOption(opt.value)}>
                <Text style={[styles.expiryChipText, invite.expiryOption === opt.value && styles.expiryChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formRow}>
            <Button title={invite.creatingInvite ? 'Creando…' : 'Crear código'} onPress={invite.handleQuickInvite} disabled={invite.creatingInvite} style={{ flex: 1 }} />
            <Button title="Cancelar" variant="secondary" onPress={invite.reset} style={{ flex: 1 }} />
          </View>
        </View>
      </Section>
    ) : null;

  const renderAccountSection = () => (
    <Section title="Cuenta">
      <View style={styles.interactivePanel}>
        {sessions.filter((s) => s.status === 'complete').length >= 2 ? (
          <Button title="Comparar parejas" variant="secondary" onPress={() => setShowPolyComparator(true)} />
        ) : null}
        <Button title="Tendencias de comunidad" variant="secondary" onPress={() => setShowTrendsModal(true)} />
        <Button title="Cerrar sesión" variant="ghost" onPress={handleLogout} />
        <Button title="Borrado de pánico" variant="danger" onPress={handlePanicWipe} />
      </View>
    </Section>
  );

  const webBg = Platform.OS === 'web' ? ({ backgroundImage: gradients.inkRadialHint } as object) : undefined;

  const renderLanding = () => (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
      {renderHero(false)}
      {renderFetishSuiteCTACards()}
      {renderGuestJoin()}
      {renderLoginPanel()}
      {renderModuleGrid()}
      {!isSupabaseConfigured ? <Text style={styles.footnote}>Modo local: perfiles y reportes viven cifrados en este dispositivo.</Text> : null}
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
            <SessionsPanel vaultOpen={vaultOpen} sessions={sessions} sceneAgreements={sceneAgreements}
              profile={profile} onRequestInvite={() => invite.setShowQuickInvite(true)} onDebrief={setDebriefTarget} />
            {renderAccountSection()}
          </View>
          <View style={styles.desktopCol}>{renderModuleGrid()}</View>
        </View>
      ) : (
        <>
          <SessionsPanel vaultOpen={vaultOpen} sessions={sessions} sceneAgreements={sceneAgreements}
            profile={profile} onRequestInvite={() => invite.setShowQuickInvite(true)} onDebrief={setDebriefTarget} />
          {renderAccountSection()}
          {renderModuleGrid()}
        </>
      )}
      {profile ? (
        <PolyComparatorModal visible={showPolyComparator} onClose={() => setShowPolyComparator(false)} sessions={sessions} currentProfile={profile} />
      ) : null}
      <CommunityTrendsModal visible={showTrendsModal} onClose={() => setShowTrendsModal(false)} />
    </ScrollView>
  );

  if (!onboardingChecked) return null;

  return (
    <SafeAreaView style={[styles.safe, webBg as any]} edges={['bottom']}>
      <OnboardingOverlay onDone={() => {}} />
      <RegisterProfileModal visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSuccess={() => loadHomeData()} />
      <AgeVerificationModal />
      <PWAInstallPromptModal visible={showPWAInstallModal} onClose={() => setShowPWAInstallModal(false)} />
      <AccessibilityModal visible={showA11yModal} onClose={() => setShowA11yModal(false)} />
      {debriefTarget ? (
        <SceneDebriefModal visible={Boolean(debriefTarget)} onClose={() => setDebriefTarget(null)}
          sessionId={debriefTarget.sessionId} activityId={debriefTarget.activityId} activityName={debriefTarget.activityName}
          onSaved={() => { setDebriefTarget(null); loadHomeData(); }} />
      ) : null}
      {profile ? renderDashboard() : renderLanding()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: colors.background },
  scroll:           { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, maxWidth: 1140, alignSelf: 'center', width: '100%' },
  hero:             { marginBottom: spacing.xxl, paddingTop: spacing.md },
  brand:            { fontFamily: fonts.display, fontSize: fontSize.brand, color: colors.text, letterSpacing: 1.4, lineHeight: 52 },
  mark:             { fontFamily: fonts.displayItalic, fontSize: fontSize.md, color: colors.primary, letterSpacing: 3, marginTop: -2, marginBottom: spacing.md },
  headline:         { fontFamily: fonts.displaySemi, fontSize: fontSize.xxl, color: colors.text, letterSpacing: 0.2, lineHeight: 36, maxWidth: 520 },
  heroSupport:      { ...typography.bodyMuted, marginTop: spacing.sm, maxWidth: 480 },
  ctaGroup:         { marginTop: spacing.lg, gap: spacing.sm, maxWidth: 360 },
  ctaPrimary:       { width: '100%' },
  ctaSecondary:     { width: '100%' },
  interactivePanel: { gap: spacing.md },
  input:            { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, color: colors.text, borderWidth: 1, borderColor: colors.border, fontFamily: fonts.body, fontSize: fontSize.md },
  inputInvite:      { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, color: colors.text, borderWidth: 1, borderColor: colors.borderSubtle, fontFamily: fonts.bodySemi, fontSize: fontSize.md, letterSpacing: 1.5, textAlign: 'center' },
  textArea:         { minHeight: 72, textAlignVertical: 'top' },
  label:            { ...typography.label, marginBottom: -4 },
  profilesRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  profileChip:      { backgroundColor: colors.surface, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  profileChipActive:{ borderColor: colors.primary, backgroundColor: colors.accentSoft },
  profileChipText:  { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.sm },
  expiryRow:        { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  expiryChip:       { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  expiryChipActive: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  expiryChipText:   { fontFamily: fonts.body, color: colors.textMuted, fontSize: fontSize.xs },
  expiryChipTextActive: { color: colors.primary, fontFamily: fonts.bodySemi },
  formRow:          { flexDirection: 'row', gap: spacing.md },
  desktopGrid:      { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  desktopCol:       { flex: 1, minWidth: 0 },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(21,13,36,0.9)', borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,132,252,0.35)', paddingHorizontal: spacing.md, height: 48, marginBottom: spacing.xs },
  searchIcon:       { fontSize: 16, marginRight: spacing.xs },
  searchInput:      { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: fontSize.md },
  clearBtn:         { padding: spacing.xs },
  clearBtnText:     { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  searchLabel:      { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, color: colors.primary, marginBottom: spacing.xs, letterSpacing: 0.5 },
  moduleGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginHorizontal: -spacing.xs },
  gridColDesktop:   { width: '49%' },
  gridColMobile:    { width: '100%' },
  footnote:         { fontFamily: fonts.body, color: colors.textDim, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  suiteCardsGrid:   { gap: spacing.md, marginVertical: spacing.xs },
  suiteCardDating:  { backgroundColor: '#120b22', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#c084fc', gap: spacing.xs },
  suiteCardEvents:  { backgroundColor: '#160818', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#f43f5e', gap: spacing.xs },
  suiteCardFeed:    { backgroundColor: '#061614', borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: '#10b981', gap: spacing.xs },
  suiteCardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suiteCardEmoji:   { fontSize: 28 },
  suiteBadgePill:         { backgroundColor: 'rgba(192,132,252,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillText:     { color: '#c084fc', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteBadgePillRose:     { backgroundColor: 'rgba(244,63,94,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillTextRose: { color: '#f43f5e', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteBadgePillEmerald:     { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  suiteBadgePillTextEmerald: { color: '#10b981', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  suiteCardTitle:           { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  suiteCardDesc:            { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  suiteCardFooter:          { marginTop: 4 },
  suiteCardActionText:      { color: '#c084fc', fontSize: fontSize.xs, fontWeight: '800' },
  suiteCardActionTextRose:  { color: '#f43f5e', fontSize: fontSize.xs, fontWeight: '800' },
  suiteCardActionTextEmerald:{ color: '#10b981', fontSize: fontSize.xs, fontWeight: '800' },
});
