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
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

interface DSContract {
  id: string;
  title: string;
  domName: string;
  subName: string;
  startDate: string;
  endDate: string;
  hardLimits: string[];
  safewords: { red: string; yellow: string; green: string };
  isSigned: boolean;
  signature?: string;
  signedAt?: string;
}

const DEFAULT_CONTRACT: DSContract = {
  id: 'ctr-1',
  title: 'Acuerdo Consensuado de Dinámica D/s & Respeto Mutuo',
  domName: 'Alex (Dominante)',
  subName: 'Sam (Sumiso/a)',
  startDate: '2026-08-01',
  endDate: '2026-11-01 (Renovación a 90 días)',
  hardLimits: ['Sin marcas visibles permanentes', 'Cero exposición pública no acordada', 'Respeto absoluto de actividades laborales'],
  safewords: { red: 'Rojo (Detención Inmediata)', yellow: 'Amarillo (Disminuir Intensidad)', green: 'Verde (Continuar / Buen estado)' },
  isSigned: false,
};

export default function ContractsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [contract, setContract] = useState<DSContract>(DEFAULT_CONTRACT);
  const [signature, setSignature] = useState('');

  // Load saved contract on mount
  useEffect(() => {
    readJsonStorage<DSContract | null>('ds_signed_contracts_v1', null).then((saved: DSContract | null) => {
      if (saved) setContract(saved);
    });
  }, []);

  const handleSignContract = async () => {
    if (!signature.trim()) {
      Alert.alert('Firma requerida ✍️', 'Ingresa tus iniciales o nombre para ratificar digitalmente el acuerdo.');
      return;
    }

    const updatedContract: DSContract = {
      ...contract,
      isSigned: true,
      signature: signature.trim(),
      signedAt: new Date().toISOString().split('T')[0],
    };

    setContract(updatedContract);
    await writeJsonStorage('ds_signed_contracts_v1', updatedContract);

    Alert.alert(
      '¡Contrato Firmado Digitalmente! 📜✍️',
      `El acuerdo "${contract.title}" ha sido ratificado con éxito. Copia cifrada guardada en tu Bóveda.`
    );
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Contratos D/s Digitales & Acuerdos</Text>
          <Text style={styles.subtitle}>
            Redacción y firma digital de acuerdos de dinámica con cláusulas de límites duros, palaras clave y renovación periódica
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.contractCard, contract.isSigned && styles.contractSigned]}>
            <View style={styles.badgeRow}>
              <Text style={styles.statusBadge}>{contract.isSigned ? '✓ FIRMADO & RATIFICADO' : '📝 EN REVISIÓN'}</Text>
            </View>

            <Text style={styles.contractTitle}>{contract.title}</Text>

            <View style={styles.partiesBox}>
              <Text style={styles.partyText}>👤 Dominante / Guiador: <Text style={{ color: colors.text }}>{contract.domName}</Text></Text>
              <Text style={styles.partyText}>🧎 Sumiso/a / Entregado/a: <Text style={{ color: colors.text }}>{contract.subName}</Text></Text>
              <Text style={styles.partyText}>📅 Vigencia del Acuerdo: <Text style={{ color: colors.text }}>{contract.startDate} al {contract.endDate}</Text></Text>
            </View>

            {/* Hard Limits Clause */}
            <View style={styles.clauseBox}>
              <Text style={styles.clauseTitle}>🚫 Cláusula 1: Límites Duros (Hard Limits Inviolables)</Text>
              {contract.hardLimits.map((hl, idx) => (
                <Text key={idx} style={styles.clauseItem}>• {hl}</Text>
              ))}
            </View>

            {/* Safewords Clause */}
            <View style={styles.clauseBox}>
              <Text style={styles.clauseTitle}>🚦 Cláusula 2: Protocolo de Palabras Clave (Safewords)</Text>
              <Text style={styles.clauseItem}>🛑 {contract.safewords.red}</Text>
              <Text style={styles.clauseItem}>⚠️ {contract.safewords.yellow}</Text>
              <Text style={styles.clauseItem}>🟢 {contract.safewords.green}</Text>
            </View>

            {/* Digital Signature */}
            {!contract.isSigned ? (
              <View style={styles.signatureBox}>
                <Text style={styles.signLabel}>✍️ Firma Digital de Aceptación Consensuada:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu nombre completo o iniciales para firmar..."
                  placeholderTextColor={colors.textMuted}
                  value={signature}
                  onChangeText={setSignature}
                />
                <TouchableOpacity style={styles.signBtn} onPress={handleSignContract}>
                  <Text style={styles.signBtnText}>Ratificar & Firmar Digitalmente 📜✍️</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.signatureConfirmed}>
                <Text style={styles.confirmedText}>
                  ✓ Acuerdos firmados digitalmente. Copia cifrada guardada en la Bóveda AES-256 del usuario.
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  contractCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  contractSigned: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.05)' },
  badgeRow: { flexDirection: 'row' },
  statusBadge: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  contractTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },

  partiesBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.lg, gap: 4 },
  partyText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  clauseBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.lg, gap: 4, borderWidth: 1, borderColor: colors.border },
  clauseTitle: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  clauseItem: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  signatureBox: { backgroundColor: colors.accentSoft, padding: spacing.md, borderRadius: radii.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle },
  signLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  input: { backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },

  signBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  signBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  signatureConfirmed: { backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.success },
  confirmedText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700', textAlign: 'center' },
});
