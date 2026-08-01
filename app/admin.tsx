import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { listAllProfiles, listMyLocalSessions, canAccessLocalAdmin, getCurrentProfile } from '@/lib/storage';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
import { calculateCompassPoint, determineArchetype } from '@/lib/compatibility';
import { getAllActivities } from '@/data/activities';
import { UserProfile, Session, CATEGORY_LABELS, CATEGORY_EMOJIS, ActivityCategory, RATING_LABELS } from '@/types';

export default function AdminScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const activities = getAllActivities();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profiles' | 'analytics' | 'sessions'>('analytics');

  const loadData = async () => {
    const profs = await listAllProfiles();
    setProfiles(profs);
    const sess = await listMyLocalSessions();
    setSessions(sess);
  };

  const verifyAdminAccess = async () => {
    const ok = await canAccessLocalAdmin();
    setIsAuthenticated(ok);
    if (ok) await loadData();
    return ok;
  };

  useEffect(() => {
    (async () => {
      await verifyAdminAccess();
      setAuthChecking(false);
    })();
  }, []);

  useEffect(() => {
    return VaultLockGateAPI.subscribe(async (snap) => {
      if (!snap.unlocked) {
        setIsAuthenticated(false);
        return;
      }
      await verifyAdminAccess();
    });
  }, []);

  const handleRetryAccess = async () => {
    const ok = await verifyAdminAccess();
    if (ok) return;
    const unlocked = VaultLockGateAPI.isUnlocked();
    const current = await getCurrentProfile();
    if (!unlocked) {
      Alert.alert(
        'Bóveda bloqueada',
        'Desbloquea la bóveda con tu PIN para abrir el panel de administración.'
      );
    } else if (!current?.isLocalAdmin) {
      Alert.alert(
        'Sin rol admin',
        'Tu perfil no tiene el flag local isLocalAdmin. No hay PIN maestro hardcodeado (el antiguo 9999 fue eliminado).'
      );
    } else {
      Alert.alert('Acceso denegado', 'No se pudo verificar el acceso de administración.');
    }
  };

  // Global Analytics Computation
  const analytics = useMemo(() => {
    const activityStats: Record<string, { loveCount: number; hardLimitCount: number; totalResponses: number }> = {};
    const categoryTotals: Record<string, { totalVal: number; count: number }> = {};
    const experienceCounts: Record<string, number> = {};

    let totalBaseResponses = 0;

    for (const p of profiles) {
      if (p.experienceLevel) {
        experienceCounts[p.experienceLevel] = (experienceCounts[p.experienceLevel] || 0) + 1;
      }

      if (p.baseResponses) {
        for (const resp of p.baseResponses) {
          totalBaseResponses++;
          if (!activityStats[resp.activityId]) {
            activityStats[resp.activityId] = { loveCount: 0, hardLimitCount: 0, totalResponses: 0 };
          }
          activityStats[resp.activityId].totalResponses += 1;

          if (resp.rating === 'love') activityStats[resp.activityId].loveCount += 1;
          if (resp.rating === 'hard_limit') activityStats[resp.activityId].hardLimitCount += 1;

          const act = activities.find((a) => a.id === resp.activityId);
          if (act) {
            const cat = act.category;
            if (!categoryTotals[cat]) categoryTotals[cat] = { totalVal: 0, count: 0 };
            let score = 0;
            if (resp.rating === 'love') score = 100;
            else if (resp.rating === 'like') score = 75;
            else if (resp.rating === 'curious') score = 50;
            else if (resp.rating === 'not_interested') score = 10;
            categoryTotals[cat].totalVal += score;
            categoryTotals[cat].count += 1;
          }
        }
      }
    }

    // Top Popular Activities
    const topPopular = Object.entries(activityStats)
      .map(([id, stat]) => {
        const act = activities.find((a) => a.id === id);
        return {
          name: act?.name || id,
          category: act?.category,
          loveCount: stat.loveCount,
        };
      })
      .sort((a, b) => b.loveCount - a.loveCount)
      .slice(0, 8);

    // Top Hard Limits
    const topHardLimits = Object.entries(activityStats)
      .map(([id, stat]) => {
        const act = activities.find((a) => a.id === id);
        return {
          name: act?.name || id,
          category: act?.category,
          hardLimitCount: stat.hardLimitCount,
        };
      })
      .sort((a, b) => b.hardLimitCount - a.hardLimitCount)
      .slice(0, 5);

    // Category Averages
    const categoryAverages = Object.entries(categoryTotals)
      .map(([cat, { totalVal, count }]) => ({
        category: cat as ActivityCategory,
        avgPct: Math.round(totalVal / Math.max(1, count)),
      }))
      .sort((a, b) => b.avgPct - a.avgPct);

    return {
      totalUsers: profiles.length,
      totalSessions: sessions.length,
      totalResponses: totalBaseResponses,
      topPopular,
      topHardLimits,
      categoryAverages,
      experienceCounts,
    };
  }, [profiles, sessions, activities]);

  if (authChecking) {
    return (
      <ScreenContainer title="" hideHeader>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.textMuted }}>Verificando acceso…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer title="Administración" hideHeader>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', gap: spacing.lg }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <VaultLockGate
            title="Panel de administración"
            subtitle="Desbloquea la bóveda. El acceso además requiere rol local isLocalAdmin — no hay PIN maestro."
            onUnlock={async () => {
              await handleRetryAccess();
            }}
          >
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Bóveda abierta</Text>
              <Text style={styles.loginSub}>
                Si tu perfil no tiene isLocalAdmin, el acceso seguirá denegado. No existe PIN maestro hardcodeado.
              </Text>
              <TouchableOpacity style={styles.loginBtn} onPress={handleRetryAccess}>
                <Text style={styles.loginBtnText}>Verificar rol admin</Text>
              </TouchableOpacity>
            </View>
          </VaultLockGate>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Administración" hideHeader>
      <VaultLockGate
        title="Panel de administración"
        subtitle="La bóveda debe permanecer abierta para inspeccionar datos sensibles."
        showLockButton
        onLock={() => setIsAuthenticated(false)}
      >
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Administración</Text>
          <Text style={styles.subtitle}>
            Inspección de usuarios inscritos, respuestas globales y tendencias de la comunidad
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>📊 Analítica Global</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'profiles' && styles.tabActive]}
            onPress={() => setActiveTab('profiles')}
          >
            <Text style={[styles.tabText, activeTab === 'profiles' && styles.tabTextActive]}>👥 Usuarios ({profiles.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sessions' && styles.tabActive]}
            onPress={() => setActiveTab('sessions')}
          >
            <Text style={[styles.tabText, activeTab === 'sessions' && styles.tabTextActive]}>📋 Sesiones ({sessions.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Scroll */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && (
            <>
              {/* Summary Cards */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analytics.totalUsers}</Text>
                  <Text style={styles.metricLabel}>Usuarios Registrados</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>{analytics.totalSessions}</Text>
                  <Text style={styles.metricLabel}>Sesiones de Pareja</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricValue, { color: colors.success }]}>{analytics.totalResponses}</Text>
                  <Text style={styles.metricLabel}>Respuestas Totales</Text>
                </View>
              </View>

              {/* Popular Activities */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🔥 Top Actividades Más Elegidas ("Me Encanta")</Text>
                <View style={{ gap: spacing.xs }}>
                  {analytics.topPopular.map((act, idx) => (
                    <View key={idx} style={styles.rankRow}>
                      <Text style={styles.rankNum}>#{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rankName}>{act.name}</Text>
                        <Text style={styles.rankCat}>
                          {CATEGORY_EMOJIS[act.category as ActivityCategory] ?? '✨'} {CATEGORY_LABELS[act.category as ActivityCategory] ?? act.category}
                        </Text>
                      </View>
                      <Text style={styles.rankBadge}>🔥 {act.loveCount} votos</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Top Hard Limits */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🛑 Límites Duros Más Comunes en la Comunidad</Text>
                <View style={{ gap: spacing.xs }}>
                  {analytics.topHardLimits.map((act, idx) => (
                    <View key={idx} style={[styles.rankRow, { borderColor: colors.danger }]}>
                      <Text style={[styles.rankNum, { color: colors.danger }]}>#{idx + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rankName}>{act.name}</Text>
                      </View>
                      <Text style={[styles.rankBadge, { color: colors.danger, borderColor: colors.danger }]}>
                        🛑 {act.hardLimitCount} límites
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Category Averages */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📊 Afinidad Promedio por Categorías</Text>
                <View style={{ gap: spacing.xs }}>
                  {analytics.categoryAverages.map(({ category, avgPct }) => (
                    <View key={category} style={{ gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.text, fontSize: fontSize.xs, fontWeight: '700' }}>
                          {CATEGORY_EMOJIS[category]} {CATEGORY_LABELS[category]}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' }}>{avgPct}%</Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${avgPct}%`, backgroundColor: colors.primary, borderRadius: 4 }} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* TAB 2: PROFILES */}
          {activeTab === 'profiles' && (
            <View style={{ gap: spacing.md }}>
              {profiles.map((p) => {
                const pt = p.baseResponses ? calculateCompassPoint(p.baseResponses) : { x: 50, y: 50 };
                const archetype = p.baseResponses ? determineArchetype(p.baseResponses, pt.y) : 'No calculado';
                const isSelected = selectedProfile?.nickname === p.nickname;

                return (
                  <View key={p.nickname} style={styles.card}>
                    <TouchableOpacity onPress={() => setSelectedProfile(isSelected ? null : p)}>
                      <View style={styles.profileRowHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileNick}>{p.nickname} {p.pinSalt || p.pinVerifier ? '🔐' : ''}</Text>
                          <Text style={styles.profileArchetype}>Arquetipo: {archetype}</Text>
                          <Text style={styles.profileMeta}>
                            {p.pronouns ? `${p.pronouns} · ` : ''}Respuestas: {p.baseResponses?.length ?? 0}
                          </Text>
                        </View>
                        <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: '800' }}>
                          {isSelected ? '▲ Ocultar' : '▼ Detalle'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Detailed Responses Inspection */}
                    {isSelected && p.baseResponses && (
                      <View style={styles.detailedResponsesBox}>
                        <Text style={styles.detailTitle}>📋 Desglose de Respuestas de {p.nickname}:</Text>
                        {p.baseResponses.slice(0, 15).map((resp) => {
                          const act = activities.find((a) => a.id === resp.activityId);
                          return (
                            <View key={resp.activityId} style={styles.respRow}>
                              <Text style={styles.respActName}>{act?.name || resp.activityId}</Text>
                              <Text style={styles.respRatingText}>{RATING_LABELS[resp.rating]}</Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === 'sessions' && (
            <View style={{ gap: spacing.sm }}>
              {sessions.map((s) => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.sessionTitle}>Sesión: {s.inviteCode}</Text>
                  <Text style={styles.sessionText}>
                    Iniciador: <Text style={{ color: colors.primary }}>{s.initiatorNickname || 'Anónimo'}</Text> · Invitado: <Text style={{ color: colors.accent }}>{s.guestNickname || 'Pendiente'}</Text>
                  </Text>
                  <Text style={styles.sessionStatus}>Estado: {s.status === 'complete' ? '✅ Completada' : '⏳ Esperando'}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
      </VaultLockGate>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 780, alignSelf: 'center', width: '100%' },

  loginCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.md,
  },
  loginTitle: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '900' },
  loginSub: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  pinInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSize.lg,
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  tabsRow: { flexDirection: 'row', gap: 4, marginVertical: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  metricsRow: { flexDirection: 'row', gap: spacing.xs },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rankNum: { color: colors.primary, fontSize: fontSize.md, fontWeight: '900', width: 28 },
  rankName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  rankCat: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  rankBadge: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },

  profileRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileNick: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  profileArchetype: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },
  profileMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },

  detailedResponsesBox: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  detailTitle: { color: colors.primaryLight, fontSize: fontSize.xs, fontWeight: '800' },
  respRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  respActName: { color: colors.text, fontSize: fontSize.xs },
  respRatingText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },

  sessionTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  sessionText: { color: colors.text, fontSize: fontSize.xs },
  sessionStatus: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
});
