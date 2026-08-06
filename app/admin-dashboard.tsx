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
} from '@/lib/vaultUnified';

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
                <Text style={styles.logoutBtnText}>🔒 Cerrar Sesión</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle}>
            Control de usuarios, métricas Zero-Knowledge y auditoría de seguridad
          </Text>
        </View>

        {/* AUTH GATE: If admin not logged in */}
        {!isAuthenticated ? (
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>
              {hasPasscode ? '🔐 Acceso Reservado a Administración' : '👑 Configurar Clave de Administración'}
            </Text>
            <Text style={styles.authDesc}>
              {hasPasscode
                ? 'Ingresa tu clave maestra de administración para gestionar la plataforma.'
                : 'Crea una clave maestra para proteger el acceso a las herramientas administrativas.'}
            </Text>

            <TextInput
              style={styles.authInput}
              placeholder="Ingresa clave maestra..."
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={passcodeInput}
              onChangeText={setPasscodeInput}
            />

            <TouchableOpacity style={styles.authSubmitBtn} onPress={handleLoginOrCreatePasscode}>
              <Text style={styles.authSubmitBtnText}>
                {hasPasscode ? 'Desbloquear Panel Admin 🔓' : 'Guardar Clave Maestra 👑'}
              </Text>
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
                  👥 Directorio de Perfiles ({filteredProfiles.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminTab, activeTab === 'audit' && styles.adminTabActive]}
                onPress={() => setActiveTab('audit')}
              >
                <Text style={[styles.adminTabText, activeTab === 'audit' && styles.adminTabTextActive]}>
                  📊 Auditoría & Exportación
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

  adminTabsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  adminTab: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  adminTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  adminTabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  adminTabTextActive: { color: colors.onPrimary, fontWeight: '900' },

  scroll: { gap: spacing.md },

  auditCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  auditTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  auditDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  auditBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  auditBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },
});
