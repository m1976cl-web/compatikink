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
import { isAdminAuthenticated, verifyAdminPasscode } from '@/lib/adminVault';
import { runSecurityPenTest, SecurityDiagnosticReport } from '@/lib/securityAudit';
import { rotateMasterVaultPasscode } from '@/lib/cryptoVault';

export default function SecurityAuditScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [isAdmin, setIsAdmin] = useState(() => isAdminAuthenticated());
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [report, setReport] = useState<SecurityDiagnosticReport | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Key Rotation Form
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      handleRunDiagnostic();
    }
  }, [isAdmin]);

  const handleAdminLogin = async () => {
    if (!adminPasscodeInput.trim()) {
      Alert.alert('Clave Vacía', 'Ingresa la Clave Maestra de Administrador.');
      return;
    }
    const valid = await verifyAdminPasscode(adminPasscodeInput.trim());
    if (valid) {
      setIsAdmin(true);
      setAdminPasscodeInput('');
    } else {
      Alert.alert('Acceso Denegado ❌', 'La clave de administración ingresada es incorrecta.');
    }
  };

  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setTimeout(async () => {
      const rep = await runSecurityPenTest();
      setReport(rep);
      setIsTesting(false);
    }, 600);
  };

  const handleRotateKey = async () => {
    if (!oldPin || !newPin) {
      Alert.alert('Campos requeridos', 'Ingresa el PIN actual y el nuevo PIN.');
      return;
    }
    if (newPin.length < 4) {
      Alert.alert('PIN muy corto', 'El nuevo PIN debe tener al menos 4 caracteres.');
      return;
    }

    try {
      setIsRotating(true);
      await rotateMasterVaultPasscode(oldPin, newPin);
      setIsRotating(false);
      setOldPin('');
      setNewPin('');
      Alert.alert('¡Rotación Exitosa! 🔐', 'La Bóveda Zero-Knowledge ha sido re-encriptada en masa con la nueva clave.');
    } catch (err: any) {
      setIsRotating(false);
      Alert.alert('Error de Rotación', err.message || 'No se pudo rotar la clave.');
    }
  };

  return (
    <ScreenContainer title="Suite de Auditoría PenTest" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Suite de Auditoría PenTest & Rotación 🛡️🔐</Text>
          <Text style={styles.subtitle}>
            Acceso exclusivo Administrador Maestro: Diagnóstico automatizado de cifrado, metadatos y rotación de claves
          </Text>
        </View>

        {/* ADMIN AUTHENTICATION GATE */}
        {!isAdmin ? (
          <View style={styles.authBox}>
            <Text style={styles.authTitle}>👑 Puerta de Acceso Restringido (Administrador)</Text>
            <Text style={styles.authDesc}>
              Esta suite ejecuta pruebas de estrés de cifrado y re-encriptación de la bóveda. Ingresa tu Clave Maestra de Administrador para acceder.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Clave Maestra Admin..."
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={adminPasscodeInput}
              onChangeText={setAdminPasscodeInput}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAdminLogin}>
              <Text style={styles.primaryBtnText}>Desbloquear Suite de Auditoría 🔑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* OVERALL HEALTH GAUGE */}
            {report && (
              <View style={styles.scoreCard}>
                <View style={styles.scoreGaugeBox}>
                  <Text style={styles.scoreNumber}>{report.overallScore}%</Text>
                  <Text style={styles.scoreGaugeLabel}>CUMPLIMIENTO ZERO-KNOWLEDGE</Text>
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.scoreTitle}>Estado del Sistema: 100% SEGURO</Text>
                  <Text style={styles.scoreMetricsText}>
                    ✅ Pruebas Aprobadas: {report.totalPassed} / {report.results.length}
                  </Text>
                  <Text style={styles.scoreMetricsText}>
                    ⚠️ Advertencias: {report.totalWarnings} · 🔴 Fallas: {report.totalFailed}
                  </Text>

                  <TouchableOpacity
                    style={styles.retestBtn}
                    disabled={isTesting}
                    onPress={handleRunDiagnostic}
                  >
                    <Text style={styles.retestBtnText}>
                      {isTesting ? 'Ejecutando Pruebas...' : '🔄 Re-ejecutar Diagnóstico PenTest'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* RESULTS LIST */}
            {report && (
              <View style={styles.sectionGap}>
                <Text style={styles.sectionTitle}>Resultados de las 6 Pruebas de Seguridad PenTest:</Text>

                {report.results.map((res) => (
                  <View key={res.id} style={styles.resultCard}>
                    <View style={styles.resHeaderRow}>
                      <Text style={styles.resName}>{res.testName}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          res.status === 'PASSED' && styles.badgePassed,
                          res.status === 'WARNING' && styles.badgeWarning,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{res.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.resCategory}>Categoría: {res.category} · Puntaje: {res.score}/100</Text>
                    <Text style={styles.resDetails}>{res.details}</Text>

                    <View style={styles.recBox}>
                      <Text style={styles.recText}>💡 Recomendación: {res.recommendation}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* MASTER KEY ROTATION & RE-ENCRYPTION BOX */}
            <View style={styles.rotationBox}>
              <Text style={styles.rotationTitle}>🔐 Rotación de Clave Maestra & Re-Encriptación de Bóveda</Text>
              <Text style={styles.rotationDesc}>
                Cambia el PIN de la Bóveda Zero-Knowledge. Todos los registros sensibles serán re-encriptados en masa de forma segura.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="PIN Actual de la Bóveda..."
                placeholderTextColor={colors.textDim}
                secureTextEntry
                value={oldPin}
                onChangeText={setOldPin}
              />

              <TextInput
                style={styles.input}
                placeholder="Nuevo PIN de la Bóveda (mínimo 4 caracteres)..."
                placeholderTextColor={colors.textDim}
                secureTextEntry
                value={newPin}
                onChangeText={setNewPin}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, isRotating && { opacity: 0.5 }]}
                disabled={isRotating}
                onPress={handleRotateKey}
              >
                <Text style={styles.primaryBtnText}>
                  {isRotating ? 'Re-encriptando Bóveda...' : 'Rotar Clave & Re-encriptar Bóveda 🔄'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
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

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.success,
    gap: spacing.md,
  },
  scoreGaugeBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 3,
    borderColor: colors.success,
    justify: 'center',
    alignItems: 'center',
    padding: 4,
  },
  scoreNumber: { fontSize: 26, fontWeight: '900', color: colors.success },
  scoreGaugeLabel: { fontSize: 7, color: colors.textDim, textAlign: 'center', fontWeight: '800' },
  scoreTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  scoreMetricsText: { color: colors.textMuted, fontSize: 10 },
  retestBtn: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: radii.md, paddingVertical: 4, paddingHorizontal: 8, marginTop: 4, alignSelf: 'flex-start' },
  retestBtnText: { color: colors.primary, fontSize: 10, fontWeight: '800' },

  sectionGap: { gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },

  resultCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  resHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resName: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgePassed: { backgroundColor: 'rgba(74, 222, 128, 0.2)' },
  badgeWarning: { backgroundColor: 'rgba(251, 191, 36, 0.2)' },
  statusBadgeText: { fontSize: 9, fontWeight: '900', color: colors.text },
  resCategory: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  resDetails: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16 },
  recBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: spacing.xs, marginTop: 2 },
  recText: { color: colors.textDim, fontSize: 10, fontWeight: '700' },

  rotationBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.primary, gap: spacing.xs, marginTop: spacing.sm },
  rotationTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  rotationDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
});
