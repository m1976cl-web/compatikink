/**
 * index.tsx — Dashboard principal (beta usable).
 * MVP: un solo camino Responde → Invita → Reporte. Sin ruido social/AI.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RegisterProfileModal } from '@/components/RegisterProfileModal';
import { AgeVerificationModal } from '@/components/AgeVerificationModal';
import { SceneDebriefModal } from '@/components/SceneDebriefModal';

import { HeroSection } from '@/components/home/HeroSection';
import { CorePathBanner } from '@/components/home/CorePathBanner';
import { ProfileBar } from '@/components/home/ProfileBar';
import { FetishSuiteSection } from '@/components/home/FetishSuiteSection';
import { GuestJoinSection } from '@/components/home/GuestJoinSection';
import { QuickInviteForm } from '@/components/home/QuickInviteForm';
import { SessionList } from '@/components/home/SessionList';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { HomeActions } from '@/components/home/HomeActions';

import { colors, fonts, gradients, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useHomeData } from '@/hooks/useHomeData';
import { useHomeStore } from '@/stores/homeStore';
import { useVaultSubscription } from '@/hooks/useVaultSubscription';
import { useQuickInvite } from '@/hooks/useQuickInvite';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isMvpMode } from '@/lib/featureFlags';

export default function HomeScreen() {
  const router = useRouter();
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
      } catch {
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

  const webBg =
    Platform.OS === 'web' ? ({ backgroundImage: gradients.inkRadialHint } as object) : undefined;

  if (!onboardingChecked) return null;

  const hasResponses = Boolean(profile?.baseResponses && profile.baseResponses.length > 0);

  const sessionsBlock = (
    <SessionList
      vaultOpen={vaultOpen}
      sessions={sessions}
      sceneAgreements={sceneAgreements}
      profile={profile}
      onRequestInvite={() => invite.setShowQuickInvite(true)}
      onDebrief={setDebriefTarget}
    />
  );

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

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <HeroSection
          loggedIn={Boolean(profile)}
          profile={profile}
          vaultOpen={vaultOpen}
          heroFade={heroFade}
          heroSlide={heroSlide}
          onOpenQuickInvite={() => invite.setShowQuickInvite(true)}
          onScrollToGuest={() =>
            scrollRef.current?.scrollTo({
              y: Math.max(0, guestSectionY.current - 24),
              animated: true,
            })
          }
        />

        <CorePathBanner
          hasProfile={Boolean(profile)}
          hasResponses={hasResponses}
          vaultOpen={vaultOpen}
          onInvite={() => invite.setShowQuickInvite(true)}
        />

        <ProfileBar />

        {!isMvpMode ? <FetishSuiteSection /> : null}

        <GuestJoinSection
          guestCode={guestCode}
          onChangeCode={setGuestCode}
          onLayout={(e) => {
            guestSectionY.current = e.nativeEvent.layout.y;
          }}
        />

        <QuickInviteForm invite={invite} />

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
