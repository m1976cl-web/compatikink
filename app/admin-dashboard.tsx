import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  AdminRegisteredProfile,
  AdminMetrics,
  hasAdminPasscodeConfigured,
  setAdminPasscode,
  verifyAdminPasscode,
  isAdminAuthenticated,
  logoutAdmin,
  getAllRegisteredProfiles,
  toggleProfileVerification,
  toggleProfileStatus,
  getAdminMetrics,
  exportSystemAuditReport,
} from '@/lib/vaultUnified';
import {
  ModerationReport,
  getModerationReports,
  updateReportStatus,
  blockUser,
  REPORT_REASON_LABELS,
} from '@/lib/trustSafety';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '@/lib/haptics';

import { MetricsGrid } from '@/components/admin/MetricsGrid';
import { ProfileDirectoryTable } from '@/components/admin/ProfileDirectoryTable';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [hasPasscode, setHasPasscode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState('');

  // Dashboard Data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [profiles, setProfiles] = useState<AdminRegisteredProfile[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');

  // Active Tab & Selected Profile Modal
  const [activeTab, setActiveTab] = useState<'profiles' | 'moderation' | 'audit'>('profiles');
  const [selectedProfile, setSelectedProfile] = useState<AdminRegisteredProfile | null>(null);

  const checkPasscodeState = async () => {
    const configured = await hasAdminPasscodeConfigured();
    setHasPasscode(configured);
  };

  const loadAdminData = useCallback(async () => {
    const m = await getAdminMetrics();
    const list = await getAllRegisteredProfiles();
    const repList = await getModerationReports();
    setMetrics(m);
    setProfiles(list);
    setReports(repList);
  }, []);

  useEffect(() => {
    checkPasscodeState();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);

  const handleLoginOrCreatePasscode = async () => {
    if (!passcodeInput.trim()) {
      Alert.alert('Clave vacía', 'Por favor ingresa una clave de administración.');
      return;
    }

    if (!hasPasscode) {
      // Set new passcode
      const success = await setAdminPasscode(passcodeInput.trim());
      if (success) {
        Alert.alert('¡Clave Maestra Configurada! 👑', 'Se han generado las credenciales de administración.');
        setIsAuthenticated(true);
        setHasPasscode(true);
      }
    } else {
      // Verify passcode
      const valid = await verifyAdminPasscode(passcodeInput.trim());
      if (valid) {
        setIsAuthenticated(true);
        setPasscodeInput('');
      } else {
        Alert.alert('Acceso Denegado ❌', 'La clave de administración ingresada es incorrecta.');
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPasscodeInput('');
  };

  const handleToggleVerification = async (profileId: string) => {
    const updated = await toggleProfileVerification(profileId);
    setProfiles(updated);
    if (selectedProfile && selectedProfile.id === profileId) {
      setSelectedProfile({ ...selectedProfile, isVerified: !selectedProfile.isVerified });
    }
    const m = await getAdminMetrics();
    setMetrics(m);
  };

  const handleToggleStatus = async (profileId: string) => {
    const updated = await toggleProfileStatus(profileId);
    setProfiles(updated);
    if (selectedProfile && selectedProfile.id === profileId) {
      setSelectedProfile({
        ...selectedProfile,
        status: selectedProfile.status === 'Activo' ? 'Suspendido' : 'Activo',
      });
    }
    const m = await getAdminMetrics();
    setMetrics(m);
  };

  const handleExportAudit = async () => {
    const auditReportStr = await exportSystemAuditReport();
    Alert.alert(
      'Auditoría Exportada ✓',
      `Informe de auditoría JSON generado (${profiles.length} perfiles registrados).`
    );
  };

  const handleUpdateReport = async (reportId: string, status: ModerationReport['status']) => {
    triggerLightHaptic();
    const updated = await updateReportStatus(reportId, status);
    setReports(updated);
  };

  const handleBlockReportedUser = async (report: ModerationReport) => {
    if (!report.targetAuthorName) return;
    triggerWarningHaptic();
    await blockUser({
      id: report.targetId,
      nickname: report.targetAuthorName,
      reason: `Sanción Admin por reporte: ${REPORT_REASON_LABELS[report.reasonCategory].label}`,
    });
    const updated = await updateReportStatus(report.id, 'actioned');
    setReports(updated);
    triggerSuccessHaptic();
    Alert.alert('Usuario Sancionado y Bloqueado', `@${report.targetAuthorName} ha sido bloqueado en el sistema.`);
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchSearch =
      p.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'Todos' || p.kinkRole === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Salir del Panel</Text>
            </TouchableOpacity>
            {isAuthenticated && (
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutBtnText}>🔒 Cerrar Sesión Admin</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.title}>Panel Maestro de Administración 👑</Text>
          <Text style={styles.subtitle}>
            Monitoreo en tiempo real, gestión de perfiles, moderación de denuncias y métricas Zero-Knowledge
          </Text>
        </View>

        {!isAuthenticated ? (
          /* AUTHENTICATION GATE */
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>
              {hasPasscode ? '🔐 Ingrese Clave de Administración' : '✨ Configure la Clave Maestra de Admin'}
            </Text>
            <Text style={styles.authDesc}>
              {hasPasscode
                ? 'Este panel contiene controles administrativos y auditoría del sistema.'
                : 'Cree una clave segura para restringir el acceso a este panel de administración.'}
            </Text>

            <TextInput
              style={styles.authInput}
              secureTextEntry
              placeholder="Clave de 4 a 8 dígitos"
              placeholderTextColor={colors.textMuted}
              value={passcodeInput}
              onChangeText={setPasscodeInput}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.authSubmitBtn} onPress={handleLoginOrCreatePasscode}>
              <Text style={styles.authSubmitBtnText}>
                {hasPasscode ? 'Ingresar al Dashboard 🚀' : 'Guardar y Desbloquear 🔐'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickDemoPasscodeBtn}
              onPress={() => {
                setPasscodeInput('1234');
              }}
            >
              <Text style={styles.quickDemoPasscodeBtnText}>⚡ Acceso Rápido Demo Admin (Clave 1234)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* AUTHENTICATED DASHBOARD CONTENT */
          <View style={{ flex: 1, gap: spacing.md }}>
            {/* Admin Metrics Grid */}
            <MetricsGrid metrics={metrics} />

            {/* Admin Navigation Tabs */}
            <View style={styles.adminTabsRow}>
              <TouchableOpacity
                style={[styles.adminTab, activeTab === 'profiles' && styles.adminTabActive]}
                onPress={() => setActiveTab('profiles')}
              >
                <Text style={[styles.adminTabText, activeTab === 'profiles' && styles.adminTabTextActive]}>
                  👥 Perfiles ({filteredProfiles.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminTab, activeTab === 'moderation' && styles.adminTabActive]}
                onPress={() => setActiveTab('moderation')}
              >
                <Text style={[styles.adminTabText, activeTab === 'moderation' && styles.adminTabTextActive]}>
                  🛡️ Denuncias {pendingReportsCount > 0 ? `(${pendingReportsCount})` : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminTab, activeTab === 'audit' && styles.adminTabActive]}
                onPress={() => setActiveTab('audit')}
              >
                <Text style={[styles.adminTabText, activeTab === 'audit' && styles.adminTabTextActive]}>
                  📊 Auditoría
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              {activeTab === 'profiles' && (
                <ProfileDirectoryTable
                  profiles={filteredProfiles}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  roleFilter={roleFilter}
                  onRoleFilterChange={setRoleFilter}
                  onSelectProfile={setSelectedProfile}
                  onToggleVerification={handleToggleVerification}
                  onToggleStatus={handleToggleStatus}
                />
              )}

              {activeTab === 'moderation' && (
                <View style={styles.moderationSection}>
                  <Text style={styles.sectionTitle}>
                    Cola de Moderación & Denuncias ({reports.length})
                  </Text>

                  {reports.map((rep) => {
                    const reasonInfo = REPORT_REASON_LABELS[rep.reasonCategory] || REPORT_REASON_LABELS.other;
                    const isPending = rep.status === 'pending';

                    return (
                      <View key={rep.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportTypeBadge}>
                            <Text style={styles.reportTypeBadgeText}>
                              {rep.targetType.toUpperCase()}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              rep.status === 'pending'
                                ? styles.statusPending
                                : rep.status === 'actioned'
                                ? styles.statusActioned
                                : styles.statusReviewed,
                            ]}
                          >
                            <Text style={styles.statusBadgeText}>
                              {rep.status === 'pending'
                                ? 'PENDIENTE'
                                : rep.status === 'actioned'
                                ? 'SANCIONADO'
                                : rep.status === 'reviewed'
                                ? 'REVISADO'
                                : 'DESESTIMADO'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.reportReasonTitle}>
                          {reasonInfo.emoji} {reasonInfo.label}
                        </Text>

                        {rep.targetAuthorName ? (
                          <Text style={styles.reportAuthor}>
                            Reportado: <Text style={{ color: '#f87171', fontFamily: fonts.bodyBold }}>@{rep.targetAuthorName}</Text>
                          </Text>
                        ) : null}

                        {rep.targetPreviewText ? (
                          <View style={styles.reportPreviewBox}>
                            <Text style={styles.reportPreviewText} numberOfLines={3}>
                              "{rep.targetPreviewText}"
                            </Text>
                          </View>
                        ) : null}

                        {rep.description ? (
                          <Text style={styles.reportDesc}>
                            Nota del denunciante: {rep.description}
                          </Text>
                        ) : null}

                        <Text style={styles.reportDate}>
                          Fecha: {new Date(rep.createdAt).toLocaleString()}
                        </Text>

                        {/* Action buttons */}
                        <View style={styles.reportActionsRow}>
                          {isPending ? (
                            <TouchableOpacity
                              style={styles.actionBtnReviewed}
                              onPress={() => handleUpdateReport(rep.id, 'reviewed')}
                            >
                              <Text style={styles.actionBtnReviewedText}>Marcar Revisado</Text>
                            </TouchableOpacity>
                          ) : null}

                          {rep.targetAuthorName && rep.status !== 'actioned' ? (
                            <TouchableOpacity
                              style={styles.actionBtnBlock}
                              onPress={() => handleBlockReportedUser(rep)}
                            >
                              <Text style={styles.actionBtnBlockText}>Bloquear Usuario 🚫</Text>
                            </TouchableOpacity>
                          ) : null}

                          {rep.status !== 'dismissed' ? (
                            <TouchableOpacity
                              style={styles.actionBtnDismiss}
                              onPress={() => handleUpdateReport(rep.id, 'dismissed')}
                            >
                              <Text style={styles.actionBtnDismissText}>Desestimar</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}

                  {reports.length === 0 ? (
                    <View style={styles.emptyReportsBox}>
                      <Text style={{ fontSize: 36 }}>🛡️</Text>
                      <Text style={styles.emptyReportsTitle}>Sin denuncias pendientes</Text>
                      <Text style={styles.emptyReportsSub}>
                        La comunidad se encuentra segura y sin reportes activos.
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {activeTab === 'audit' && (
                <View style={styles.auditCard}>
                  <Text style={styles.auditTitle}>🛡️ Auditoría del Sistema & Zero-Knowledge Score</Text>
                  <Text style={styles.auditDesc}>
                    Genera un reporte cifrado completo con el estado de las sesiones, integraciones y salud de la bóveda local.
                  </Text>

                  <TouchableOpacity style={styles.auditBtn} onPress={handleExportAudit}>
                    <Text style={styles.auditBtnText}>📥 Exportar Informe de Auditoría JSON</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  logoutBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  logoutBtnText: { color: colors.text, fontSize: 10, fontWeight: '700' },

  authCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border },
  authTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800', textAlign: 'center' },
  authDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },
  authInput: { backgroundColor: colors.background, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: fontSize.sm },
  authSubmitBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 14, alignItems: 'center' },
  authSubmitBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },
  quickDemoPasscodeBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickDemoPasscodeBtnText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },

  adminTabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  adminTab: { flex: 1, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  adminTabActive: { borderColor: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.15)' },
  adminTabText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  adminTabTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },

  scroll: { gap: spacing.md, paddingBottom: spacing.xxl },

  auditCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  auditTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  auditDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  auditBtn: { backgroundColor: colors.primaryDark, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.lg, paddingVertical: 12, alignItems: 'center', marginTop: spacing.xs },
  auditBtnText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },

  // Moderation Tab Styles
  moderationSection: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTypeBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportTypeBadgeText: { color: colors.textMuted, fontFamily: fonts.bodyBold, fontSize: 9 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusPending: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: '#fbbf24' },
  statusActioned: { backgroundColor: 'rgba(248, 113, 113, 0.15)', borderWidth: 1, borderColor: '#f87171' },
  statusReviewed: { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderWidth: 1, borderColor: '#38bdf8' },
  statusBadgeText: { fontSize: 9, fontFamily: fonts.bodyBold, color: colors.text },
  reportReasonTitle: { color: '#f87171', fontFamily: fonts.bodyBold, fontSize: fontSize.sm, marginTop: 2 },
  reportAuthor: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs },
  reportPreviewBox: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.xs + 2,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#f87171',
    marginVertical: 2,
  },
  reportPreviewText: { color: colors.text, fontFamily: fonts.body, fontSize: 11, fontStyle: 'italic' },
  reportDesc: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.xs },
  reportDate: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },
  reportActionsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  actionBtnReviewed: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  actionBtnReviewedText: { color: '#38bdf8', fontFamily: fonts.bodyBold, fontSize: 10 },
  actionBtnBlock: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: '#f87171',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  actionBtnBlockText: { color: '#f87171', fontFamily: fonts.bodyBold, fontSize: 10 },
  actionBtnDismiss: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  actionBtnDismissText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },
  emptyReportsBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyReportsTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  emptyReportsSub: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, textAlign: 'center' },
});
