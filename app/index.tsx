/**
 * index.tsx — Dashboard principal (beta usable).
 * MVP: un solo camino Responde → Invita → Reporte. Sin ruido social/AI.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RegisterProfileModal } from '@/components/RegisterProfileModal';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';

import { HeroDashboardBanner } from '@/components/home/HeroDashboardBanner';
import { HeroSection } from '@/components/home/HeroSection';
import { CorePathBanner } from '@/components/home/CorePathBanner';
import { ProfileBar } from '@/components/home/ProfileBar';
import { FetishSuiteSection } from '@/components/home/FetishSuiteSection';
import { FetishLabsSection } from '@/components/home/FetishLabsSection';
import { GuestJoinSection } from '@/components/home/GuestJoinSection';
import { QuickInviteForm } from '@/components/home/QuickInviteForm';
import { SessionList } from '@/components/home/SessionList';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { HomeActions } from '@/components/home/HomeActions';
import { NextStepBanner } from '@/components/NextStepBanner';

import { colors, fonts, gradients, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useHomeData } from '@/hooks/useHomeData';
import { useHomeStore } from '@/stores/homeStore';
import { useVaultSubscription } from '@/hooks/useVaultSubscription';
import { useQuickInvite } from '@/hooks/useQuickInvite';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isMvpMode } from '@/lib/featureFlags';
import { getCorePathState } from '@/lib/corePath';

export default function HomeScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { isDesktop } = useResponsive();

  const { profile, sessions, sceneAgreements, loadHomeData, handleLogout, handlePanicWipe } =
    useHomeData();
  useVaultSubscription();

  const activeTab = useHomeStore((s) => s.activeTab || 'explore');
  const setActiveTab = useHomeStore((s) => s.setActiveTab || (() => {}));
  const searchQuery = useHomeStore((s) => s.searchQuery || '');
  const setSearchQuery = useHomeStore((s) => s.setSearchQuery || (() => {}));
  const vaultOpen = useHomeStore((s) => s.vaultOpen);

  const [guestCode, setGuestCode] = useState('');
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [debriefTarget, setDebriefTarget] = useState<{
    sessionId: string;
    activityId: string;
    activityName: string;
  } | null>(null);

  const invite = useQuickInvite(profile, loadHomeData);

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('compatikink_onboarding_complete_v1');
        if (!completed) {
          router.replace('/onboarding' as any);
        } else {
          setOnboardingChecked(true);
        }
      } catch {
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, [router]);

  useEffect(() => {
    if (!onboardingChecked) return;
    loadHomeData();

    if (router && typeof (router as any).prefetch === 'function') {
      try {
        (router as any).prefetch('/questionnaire');
        (router as any).prefetch('/profile');
        (router as any).prefetch('/report');
        (router as any).prefetch('/dating');
        (router as any).prefetch('/manual');
      } catch {
        // Ignore
      }
    }

    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [onboardingChecked]);

  const webBg =
    Platform.OS === 'web' ? ({ backgroundImage: gradients.inkRadialHint } as object) : undefined;

  if (!onboardingChecked) return null;

  const path = getCorePathState(profile, vaultOpen, sessions);
  const showAfterAnswersBanner = from === 'answers' && path.hasResponses && path.currentStep === 2;

  const sessionsBlock =
    sessions.length > 0 ? (
      <SessionList
        vaultOpen={vaultOpen}
        sessions={sessions}
        sceneAgreements={sceneAgreements}
        profile={profile}
        onRequestInvite={() => invite.setShowQuickInvite(true)}
        onDebrief={setDebriefTarget}
      />
    ) : null;

  const accountBlock = (
    <HomeActions
      sessions={sessions}
      compact={isMvpMode}
      onOpenPolyComparator={() => {}}
      onOpenTrendsModal={() => {}}
      onLogout={handleLogout}
      onPanicWipe={handlePanicWipe}
    />
  );

  const startColumn = (
    <View style={styles.pathCol}>
      {showAfterAnswersBanner ? (
        <NextStepBanner variant="invite" onPress={() => invite.setShowQuickInvite(true)} />
      ) : null}
      {path.completeSession && !showAfterAnswersBanner ? (
        <NextStepBanner
          variant="report"
          onPress={() =>
            router.push({
              pathname: '/report',
              params: { token: path.completeSession!.initiatorToken },
            })
          }
        />
      ) : null}
      <CorePathBanner
        profile={profile}
        vaultOpen={vaultOpen}
        sessions={sessions}
        onInvite={() => invite.setShowQuickInvite(true)}
      />
      <QuickInviteForm invite={invite} />
      <ProfileBar />
    </View>
  );

  const guestColumn = (
    <View style={styles.pathCol}>
      <GuestJoinSection guestCode={guestCode} onChangeCode={setGuestCode} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, webBg as any]} edges={['bottom']}>
      <RegisterProfileModal
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => loadHomeData()}
      />
      <AgeVerificationModal />
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

      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroSection
          loggedIn={Boolean(profile)}
          profile={profile}
          vaultOpen={vaultOpen}
          heroFade={heroFade}
          heroSlide={heroSlide}
        />

        <View style={isDesktop ? styles.columns : styles.columnsStack}>
          {startColumn}
          {guestColumn}
        </View>

        {!isMvpMode ? (
          <>
            <HeroDashboardBanner />
            <FetishSuiteSection />
            <FetishLabsSection />
          </>
        ) : null}

        {isMvpMode ? (
          <>
            {sessionsBlock}
            {accountBlock}
          </>
        ) : isDesktop ? (
          <View style={styles.desktopGrid}>
            <View style={styles.desktopCol}>
              {sessionsBlock}
              {accountBlock}
            </View>
            <View style={styles.desktopCol}>
              <ModuleGrid
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                searchQuery={searchQuery}
                onChangeSearch={setSearchQuery}
                onShowPWAInstallModal={() => {}}
                onShowA11yModal={() => {}}
              />
            </View>
          </View>
        ) : (
          <>
            {sessionsBlock}
            {accountBlock}
            <ModuleGrid
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              onShowPWAInstallModal={() => {}}
              onShowA11yModal={() => {}}
            />
          </>
        )}

        {!isSupabaseConfigured ? (
          <Text style={styles.footnote}>
            Modo local: perfiles y reportes viven cifrados en este dispositivo.
          </Text>
        ) : (
          <Text style={styles.footnote}>
            Beta usable: solo Responde → Invita → Reporte. Ver docs/BETA_HAPPY_PATH.md
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  columns: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start', marginBottom: spacing.lg },
  columnsStack: { flexDirection: 'column', gap: spacing.md, marginBottom: spacing.lg },
  pathCol: { flex: 1, minWidth: 0 },
  desktopGrid: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  desktopCol: { flex: 1, gap: spacing.lg, minWidth: 0 },
  footnote: {
    marginTop: spacing.lg,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
  },
});
