import React, { useState, useEffect } from 'react';
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
} from '@/lib/adminVault';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [hasPasscode, setHasPasscode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [passcodeInput, setPasscodeInput] = useState('');

  // Dashboard Data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [profiles, setProfiles] = useState<AdminRegisteredProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');

  // Active Tab & Selected Profile Modal
  const [activeTab, setActiveTab] = useState<'profiles' | 'metrics' | 'audit'>('profiles');
  const [selectedProfile, setSelectedProfile] = useState<AdminRegisteredProfile | null>(null);

  useEffect(() => {
    checkPasscodeState();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const checkPasscodeState = async () => {
    const configured = await hasAdminPasscodeConfigured();
    setHasPasscode(configured);
  };

  const loadAdminData = async () => {
    const m = await getAdminMetrics();
    const list = await getAllRegisteredProfiles();
    setMetrics(m);
    setProfiles(list);
  };

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
  };

  const handleExportAudit = async () => {
    const jsonReport = await exportSystemAuditReport();
    Alert.alert(
      '📊 Reporte de Auditoría Generado',
      `Se ha compilado el informe cifrado de la plataforma (${jsonReport.length} caracteres).`
    );
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || p.kinkRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <ScreenContainer title="Panel de Administración" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>Panel de Administración 👑📊</Text>
            {isAuthenticated && (
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Cerrar Sesión Admin 🔒</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle}>
            Gestión centralizada de credenciales maestro, directorio de perfiles registrados y auditoría Zero-Knowledge
          </Text>
        </View>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <View style={styles.authBox}>
            <Text style={styles.authTitle}>
              {hasPasscode ? '🔐 Iniciar Sesión de Administrador' : '👑 Configurar Credenciales de Administrador'}
            </Text>
            <Text style={styles.authDesc}>
              {hasPasscode
                ? 'Ingresa tu Clave Maestra de Administrador para desbloquear el Dashboard de perfiles.'
                : 'Crea tu primera Clave Maestra para activar el rol de Administrador en esta instalación.'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Clave Maestra Admin..."
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={passcodeInput}
              onChangeText={setPasscodeInput}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLoginOrCreatePasscode}>
              <Text style={styles.primaryBtnText}>
                {hasPasscode ? 'Ingresar al Dashboard Admin ➔' : 'Guardar Clave Maestra & Activar Admin 👑'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* KPI METRICS ROW */}
            {metrics && (
              <View style={styles.metricsGrid}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiValue}>{metrics.totalProfiles}</Text>
                  <Text style={styles.kpiLabel}>👥 Perfiles Registrados</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: colors.primary }]}>{metrics.verifiedProfiles}</Text>
                  <Text style={styles.kpiLabel}>🛡️ Verificados Kink</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: '#fbbf24' }]}>{metrics.activePartnerships}</Text>
                  <Text style={styles.kpiLabel}>🔗 Parejas Vinculadas</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: '#38bdf8' }]}>{metrics.bluePageCreators}</Text>
                  <Text style={styles.kpiLabel}>💙 Creadores Azul</Text>
                </View>
              </View>
            )}

            {/* TAB NAVIGATION */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'profiles' && styles.tabActive]}
                onPress={() => setActiveTab('profiles')}
              >
                <Text style={[styles.tabText, activeTab === 'profiles' && styles.tabTextActive]}>
                  👥 Directorio de Perfiles ({filteredProfiles.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'metrics' && styles.tabActive]}
                onPress={() => setActiveTab('metrics')}
              >
                <Text style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}>
                  📊 Métricas & Tendencias
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'audit' && styles.tabActive]}
                onPress={() => setActiveTab('audit')}
              >
                <Text style={[styles.tabText, activeTab === 'audit' && styles.tabTextActive]}>
                  🔒 Auditoría del Sistema
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: DIRECTORIO DE PERFILES */}
            {activeTab === 'profiles' && (
              <View style={{ flex: 1 }}>
                {/* Search & Filter Bar */}
                <View style={styles.searchFilterRow}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="Buscar por alias, ubicación o bio..."
                    placeholderTextColor={colors.textDim}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleChips}>
                    {['Todos', 'Dominante', 'Sumiso/a', 'Switch', 'Top', 'Bottom'].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleChip, roleFilter === r && styles.roleChipActive]}
                        onPress={() => setRoleFilter(r)}
                      >
                        <Text style={[styles.roleChipText, roleFilter === r && styles.roleChipTextActive]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Profiles List */}
                <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
                  {filteredProfiles.map((p) => (
                    <View key={p.id} style={styles.profileCard}>
                      <View style={styles.profileHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.profileAlias}>{p.alias}</Text>
                            {p.isVerified && <Text style={styles.verifiedTag}>🛡️ VERIFICADO</Text>}
                            <Text
                              style={[
                                styles.statusTag,
                                p.status === 'Activo' ? { color: colors.success } : { color: colors.error },
                              ]}
                            >
                              • {p.status}
                            </Text>
                          </View>
                          <Text style={styles.profileMeta}>
                            Rol: {p.kinkRole} ({p.experienceLevel}) · {p.location}
                          </Text>
                        </View>

                        <TouchableOpacity style={styles.detailBtn} onPress={() => setSelectedProfile(p)}>
                          <Text style={styles.detailBtnText}>Ver Ficha Completa ➔</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Quick Limits summary */}
                      <View style={styles.limitsSummaryRow}>
                        <Text style={styles.limitsSummaryText}>
                          🛑 Límites Duros: {p.hardLimits.length} · ⚠️ Límites Suaves: {p.softLimits.length} · 🏆 Insignias: {p.badgesCount}
                        </Text>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.cardActionsRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, p.isVerified && styles.actionBtnActive]}
                          onPress={() => handleToggleVerification(p.id)}
                        >
                          <Text style={styles.actionBtnText}>
                            {p.isVerified ? 'Revocar Verificación 🛡️' : 'Otorgar Verificación Kink 🛡️'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtn, p.status === 'Suspendido' && { borderColor: colors.error }]}
                          onPress={() => handleToggleStatus(p.id)}
                        >
                          <Text style={[styles.actionBtnText, p.status === 'Suspendido' && { color: colors.error }]}>
                            {p.status === 'Activo' ? 'Suspender Perfil 🛑' : 'Reactivar Perfil ✅'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* TAB 2: MÉTRICAS & TENDENCIAS */}
            {activeTab === 'metrics' && (
              <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>📈 Distribución de Roles en la Comunidad</Text>
                  <Text style={styles.trendBarText}>• Dominantes / Tops: 38%</Text>
                  <Text style={styles.trendBarText}>• Sumisos / Bottoms: 42%</Text>
                  <Text style={styles.trendBarText}>• Switches Versátiles: 20%</Text>
                </View>

                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>🔥 Fetiches & Prácticas Más Solicitadas</Text>
                  <View style={styles.tagGrid}>
                    {['#Shibari (85%)', '#Látex (78%)', '#DominaciónFemenina (64%)', '#Pegging (52%)', '#Sensorial (90%)'].map((tag, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* TAB 3: AUDITORÍA Y SEGURIDAD */}
            {activeTab === 'audit' && (
              <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
                <View style={styles.cardBox}>
                  <Text style={styles.cardBoxTitle}>🔒 Estado de Seguridad & Auditoría Zero-Knowledge</Text>
                  <Text style={styles.auditDesc}>
                    La arquitectura de Compatikink utiliza cifrado local AES-GCM-256 en la bóveda del dispositivo. Ninguna clave sensible transita desencriptada por la red.
                  </Text>

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleExportAudit}>
                    <Text style={styles.primaryBtnText}>Exportar Informe Cifrado de Auditoría JSON 📊</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* PROFILE DETAIL MODAL DRAWER */}
        {selectedProfile && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ficha de Usuario: {selectedProfile.alias}</Text>
                <TouchableOpacity onPress={() => setSelectedProfile(null)}>
                  <Text style={styles.modalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                <Text style={styles.modalSubHeader}>Información General:</Text>
                <Text style={styles.detailText}>• ID de Registro: {selectedProfile.id}</Text>
                <Text style={styles.detailText}>• Rol Kink: {selectedProfile.kinkRole} ({selectedProfile.experienceLevel})</Text>
                <Text style={styles.detailText}>• Ubicación: {selectedProfile.location}</Text>
                <Text style={styles.detailText}>• Bio: "{selectedProfile.bio}"</Text>
                <Text style={styles.detailText}>• Protocolo de Seguridad: {selectedProfile.safetyProtocol}</Text>

                <Text style={styles.modalSubHeader}>🛑 Límites Duros (Inviolables):</Text>
                {selectedProfile.hardLimits.map((hl, idx) => (
                  <Text key={idx} style={styles.hardLimitItem}>🛑 {hl}</Text>
                ))}

                <Text style={styles.modalSubHeader}>⚠️ Límites Suaves (Precaución):</Text>
                {selectedProfile.softLimits.map((sl, idx) => (
                  <Text key={idx} style={styles.softLimitItem}>⚠️ {sl}</Text>
                ))}

                <Text style={styles.modalSubHeader}>🏷️ Fetiches Destacados:</Text>
                <View style={styles.tagGrid}>
                  {selectedProfile.fetishTags.map((tag, idx) => (
                    <View key={idx} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 840, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: colors.error, borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 4 },
  logoutBtnText: { color: colors.error, fontSize: 10, fontWeight: '800' },

  authBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  authTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  authDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginVertical: spacing.xs },
  kpiCard: { flex: 1, minWidth: 120, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.borderSubtle },
  kpiValue: { fontSize: 22, fontWeight: '900', color: colors.text },
  kpiLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.xs + 2, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accentSoft, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  tabTextActive: { color: colors.primary, fontWeight: '800' },

  searchFilterRow: { gap: spacing.xs, marginBottom: spacing.xs },
  roleChips: { flexDirection: 'row', gap: 4 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { color: colors.textMuted, fontSize: 10 },
  roleChipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  scrollList: { gap: spacing.sm, paddingBottom: spacing.xl },
  profileCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  profileHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  profileAlias: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  verifiedTag: { backgroundColor: 'rgba(192, 132, 252, 0.2)', color: colors.primary, fontSize: 9, fontWeight: '900', paddingHorizontal: 4, borderRadius: 4 },
  statusTag: { fontSize: 10, fontWeight: '700' },
  profileMeta: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  detailBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 4 },
  detailBtnText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  limitsSummaryRow: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: spacing.xs },
  limitsSummaryText: { color: colors.textDim, fontSize: 10 },
  cardActionsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  actionBtn: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: radii.sm, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(192, 132, 252, 0.1)' },
  actionBtnText: { color: colors.text, fontSize: 10, fontWeight: '700' },

  cardBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  cardBoxTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  trendBarText: { color: colors.textMuted, fontSize: fontSize.xs },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagChip: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  tagChipText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  auditDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: spacing.md },
  modalContent: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  modalTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  modalCloseBtn: { color: colors.textMuted, fontSize: 18, fontWeight: '800' },
  modalSubHeader: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', marginTop: 6 },
  detailText: { color: colors.text, fontSize: fontSize.xs },
  hardLimitItem: { color: colors.error, fontSize: 11, fontWeight: '700' },
  softLimitItem: { color: '#fbbf24', fontSize: 11 },
});
