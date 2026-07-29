import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface ChastityProfile {
  id: string;
  name: string;
  role: 'keyholder' | 'wearer';
  experience: 'Principiante' | 'Intermedio' | 'Avanzado';
  deviceType: 'Silicona' | 'Acero Inoxidable' | 'Resina 3D' | 'Digital Chaster';
  lockType: 'Candado Físico Brass' | 'Llave Combinada' | 'API Digital Remota';
  bio: string;
  rules: string[];
}

const CHASTITY_COMMUNITY: ChastityProfile[] = [
  {
    id: 'c1',
    name: 'Domina_Valeria',
    role: 'keyholder',
    experience: 'Avanzado',
    deviceType: 'Acero Inoxidable',
    lockType: 'API Digital Remota',
    bio: 'Keyholder disciplinada enfocalizada en protocolos de largo plazo, tareas de recompensa e higiene impecable.',
    rules: ['Chequeo diario de piel', 'Liberación de emergencia garantizada', 'Protocolo de higiene cada 3 días'],
  },
  {
    id: 'c2',
    name: 'Sub_Leo',
    role: 'wearer',
    experience: 'Intermedio',
    deviceType: 'Silicona',
    lockType: 'Candado Físico Brass',
    bio: 'Sumiso en castidad buscando Keyholder constante para entregar el control de orgasmo y disciplina.',
    rules: ['Cumplimiento de tareas diarias', 'Diario emocional de fetiche'],
  },
  {
    id: 'c3',
    name: 'KeyMaster_K',
    role: 'keyholder',
    experience: 'Intermedio',
    deviceType: 'Resina 3D',
    lockType: 'API Digital Remota',
    bio: 'Especialista en dinámicas a distancia con integración de ruletas de tiempo y denegación sensual.',
    rules: ['Seguimiento vía App', 'Verificación con foto de higiene'],
  },
];

export default function ChastityScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [filterRole, setFilterRole] = useState<'all' | 'keyholder' | 'wearer'>('all');
  const [selectedProfile, setSelectedProfile] = useState<ChastityProfile | null>(null);

  const filtered = CHASTITY_COMMUNITY.filter(
    (p) => filterRole === 'all' || p.role === filterRole
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🔒 Módulo de Castidad & Keyholding</Text>
          <Text style={styles.subtitle}>
            Encuentro seguro entre Keyholders (Portadores de Llave) y Wearers/Sumis en Castidad
          </Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterRow}>
          {[
            { id: 'all' as const, label: '🌐 Todos' },
            { id: 'keyholder' as const, label: '🗝️ Keyholders' },
            { id: 'wearer' as const, label: '🔒 Wearers / Sumis' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filterRole === f.id && styles.filterChipActive]}
              onPress={() => setFilterRole(f.id)}
            >
              <Text style={[styles.filterChipText, filterRole === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Safety & Protocol Banner */}
          <View style={styles.protocolBanner}>
            <Text style={styles.protocolTitle}>🛡️ Reglas de Seguridad en Castidad & Keyholding:</Text>
            <Text style={styles.protocolText}>
              1. **Llave de Emergencia OBLIGATORIA**: Jamás utilices candados sin una llave de corte o emergencia accesible.{'\n'}
              2. **Higiene & Salud Cutánea**: Se deben realizar pausas y revisiones periódicas de la piel para prevenir ulceraciones.{'\n'}
              3. **Consentimiento Revocable**: Ambas partes pueden solicitar la liberación inmediata mediante palabra clave.
            </Text>
          </View>

          {/* Profiles Grid */}
          <View style={{ gap: spacing.md }}>
            {filtered.map((p) => (
              <View key={p.id} style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.profileRoleBadge}>
                        {p.role === 'keyholder' ? '🗝️ KEYHOLDER' : '🔒 WEARER'}
                      </Text>
                      <Text style={styles.profileExp}>· {p.experience}</Text>
                    </View>
                    <Text style={styles.profileName}>{p.name}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={() =>
                      Alert.alert(
                        `Conectar con ${p.name}`,
                        `¿Deseas iniciar una conversación de negociación de protocolo con ${p.name}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Enviar Mensaje 💬',
                            onPress: () => router.push('/dating'),
                          },
                        ]
                      )
                    }
                  >
                    <Text style={styles.connectBtnText}>Conectar 💬</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.profileBio}>{p.bio}</Text>

                <View style={styles.metaBox}>
                  <Text style={styles.metaItem}>Dispositivo: <Text style={{ color: colors.text }}>{p.deviceType}</Text></Text>
                  <Text style={styles.metaItem}>Candado: <Text style={{ color: colors.text }}>{p.lockType}</Text></Text>
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={styles.rulesLabel}>📋 Protocolos & Reglas:</Text>
                  {p.rules.map((r, idx) => (
                    <Text key={idx} style={styles.ruleItem}>• {r}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  filterRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  protocolBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 18,
    padding: spacing.md,
    gap: 4,
  },
  protocolTitle: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  protocolText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileRoleBadge: { color: colors.neonPurple, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  profileExp: { color: colors.textMuted, fontSize: fontSize.xs },
  profileName: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  profileBio: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  connectBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  connectBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  metaBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.md,
    gap: 4,
  },
  metaItem: { color: colors.textMuted, fontSize: fontSize.xs },

  rulesLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  ruleItem: { color: colors.text, fontSize: fontSize.xs },
});
