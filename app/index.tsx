/**
 * index.tsx — Dashboard principal de Compatikink.
 *
 * Refactorizado (Fase 2): Descompuesto en sub-componentes modulares en components/home/:
 *   - HeroSection          → Encabezado animado y CTAs principales
 *   - FetishSuiteSection   → Tarjetas de la Suite de Dating & Social Fetichista
 *   - GuestJoinSection     → Sección para unirse con código de invitado
 *   - QuickInviteForm      → Formulario de invitación rápida
 *   - ModuleGrid           → Buscador, pestañas por categoría y cuadrícula de módulos
 *   - HomeActions          → Acceso a parejas poly, tendencias, logout y borrado de pánico
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { RegisterProfileModal } from '@/components/RegisterProfileModal';
import { PolyComparatorModal } from '@/components/PolyComparatorModal';
import { CommunityTrendsModal } from '@/components/CommunityTrendsModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { PWAInstallPromptModal } from '@/components/PWAInstallPromptModal';
import { AccessibilityModal } from '@/components/AccessibilityModal';
import { SessionsPanel } from '@/components/SessionsPanel';

import { HeroSection } from '@/components/home/HeroSection';
import { ProfileBar } from '@/components/home/ProfileBar';
import { FetishSuiteSection } from '@/components/home/FetishSuiteSection';
import { GuestJoinSection } from '@/components/home/GuestJoinSection';
import { QuickInviteForm } from '@/components/home/QuickInviteForm';
import { SessionList } from '@/components/home/SessionList';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { HomeActions } from '@/components/home/HomeActions';

import { colors, gradients, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useHomeData } from '@/hooks/useHomeData';
import { useHomeStore } from '@/lib/stores/useHomeStore';
import { useQuickInvite } from '@/hooks/useQuickInvite';
import { isSupabaseConfigured } from '@/lib/supabase';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  // ── Data & Auth (via Zustand) ────────────────────────────────────────────────
  const { profile, sessions, sceneAgreements, loadHomeData, handleLogout, handlePanicWipe } = useHomeData();
  const activeTab = useHomeStore((s) => s.activeTab);
  const setActiveTab = useHomeStore((s) => s.setActiveTab);
  const searchQuery = useHomeStore((s) => s.searchQuery);
  const setSearchQuery = useHomeStore((s) => s.setSearchQuery);
  const vaultOpen = useHomeStore((s) => s.vaultOpen);

  // ── Local UI State ───────────────────────────────────────────────────────────
  const [guestCode, setGuestCode] = useState('');
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPolyComparator, setShowPolyComparator] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);
  const [debriefTarget, setDebriefTarget] = useState<{ sessionId: string; activityId: string; activityName: string } | null>(null);

  // ── Quick Invite Hook ────────────────────────────────────────────────────────
  const invite = useQuickInvite(profile, loadHomeData);

  // ── Animations & Refs ────────────────────────────────────────────────────────
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(18)).current;
  const scrollRef = useRef<ScrollView>(null);
  const guestSectionY = useRef(0);

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
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [onboardingChecked]);

  const webBg = Platform.OS === 'web' ? ({ backgroundImage: gradients.inkRadialHint } as object) : undefined;

  if (!onboardingChecked) return null;

  return (
    <SafeAreaView style={[styles.safe, webBg as any]} edges={['bottom']}>
      <OnboardingOverlay onDone={() => {}} />
      <RegisterProfileModal visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSuccess={() => loadHomeData()} />
      <AgeVerificationModal />
      <PWAInstallPromptModal visible={showPWAInstallModal} onClose={() => setShowPWAInstallModal(false)} />
      <AccessibilityModal visible={showA11yModal} onClose={() => setShowA11yModal(false)} />
      {debriefTarget ? (
        <SceneDebriefModal
          visible={Boolean(debriefTarget)}
          onClose={() => setDebriefTarget(null)}
          sessionId={debriefTarget.sessionId}
          activityId={debriefTarget.activityId}
          activityName={debriefTarget.activityName}
          onSaved={() => { setDebriefTarget(null); loadHomeData(); }}
        />
      ) : null}

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <HeroSection
          loggedIn={Boolean(profile)}
          profile={profile}
          vaultOpen={vaultOpen}
          heroFade={heroFade}
          heroSlide={heroSlide}
          onOpenQuickInvite={() => invite.setShowQuickInvite(true)}
          onScrollToGuest={() => scrollRef.current?.scrollTo({ y: Math.max(0, guestSectionY.current - 24), animated: true })}
        />

        <ProfileBar />

        <FetishSuiteSection />

        {!profile ? (
          <GuestJoinSection
            guestCode={guestCode}
            onChangeCode={setGuestCode}
            onLayout={(e) => { guestSectionY.current = e.nativeEvent.layout.y; }}
          />
        ) : null}

        <QuickInviteForm invite={invite} />

        {isDesktop ? (
          <View style={styles.desktopGrid}>
            <View style={styles.desktopCol}>
              <SessionList
                vaultOpen={vaultOpen}
                sessions={sessions}
                sceneAgreements={sceneAgreements}
                profile={profile}
                onRequestInvite={() => invite.setShowQuickInvite(true)}
                onDebrief={setDebriefTarget}
              />
              <HomeActions
                sessions={sessions}
                onOpenPolyComparator={() => setShowPolyComparator(true)}
                onOpenTrendsModal={() => setShowTrendsModal(true)}
                onLogout={handleLogout}
                onPanicWipe={handlePanicWipe}
              />
            </View>
            <View style={styles.desktopCol}>
              <ModuleGrid
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                searchQuery={searchQuery}
                onChangeSearch={setSearchQuery}
                onShowPWAInstallModal={() => setShowPWAInstallModal(true)}
                onShowA11yModal={() => setShowA11yModal(true)}
                loadHomeData={loadHomeData}
              />
            </View>
          </View>
        ) : (
          <>
            <SessionList
              vaultOpen={vaultOpen}
              sessions={sessions}
              sceneAgreements={sceneAgreements}
              profile={profile}
              onRequestInvite={() => invite.setShowQuickInvite(true)}
              onDebrief={setDebriefTarget}
            />
            <HomeActions
              sessions={sessions}
              onOpenPolyComparator={() => setShowPolyComparator(true)}
              onOpenTrendsModal={() => setShowTrendsModal(true)}
              onLogout={handleLogout}
              onPanicWipe={handlePanicWipe}
            />
            <ModuleGrid
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              onShowPWAInstallModal={() => setShowPWAInstallModal(true)}
              onShowA11yModal={() => setShowA11yModal(true)}
              loadHomeData={loadHomeData}
            />
          </>
        )}

        {!isSupabaseConfigured ? (
          <Text style={styles.footnote}>Modo local: perfiles y reportes viven cifrados en este dispositivo.</Text>
        ) : null}
      </ScrollView>

      {profile ? (
        <PolyComparatorModal visible={showPolyComparator} onClose={() => setShowPolyComparator(false)} sessions={sessions} currentProfile={profile} />
      ) : null}
      <CommunityTrendsModal visible={showTrendsModal} onClose={() => setShowTrendsModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  desktopGrid: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  desktopCol: { flex: 1, minWidth: 0 },
  footnote: {
    fontFamily: fonts.body,
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
