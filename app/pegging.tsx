import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { PEGGING_GUIDE, PEGGING_PROFILES_DATA, PeggingProfile } from '@/lib/pegging';

export default function PeggingScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'guide' | 'dating'>('guide');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const handleConnectProfile = (profile: PeggingProfile) => {
    Alert.alert(
      `Conectar con ${profile.nickname} 💬`,
      `¿Deseas enviar una invitación privada de chat a ${profile.nickname} (${profile.role})?`,
      [
        {
          text: 'Enviar Invitación 📨',
          onPress: () => {
            Alert.alert('Invitación Enviada ✉️', 'Se ha iniciado la conexión privada con cifrado E2EE.');
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const filteredProfiles = PEGGING_PROFILES_DATA.filter((p) => {
    if (roleFilter === 'giver') return p.role.includes('Giver');
    if (roleFilter === 'receiver') return p.role.includes('Receiver');
    if (roleFilter === 'switch') return p.role.includes('Switch');
    return true;
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver al Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🍑 Módulo Especializado de Pegging</Text>
          <Text style={styles.subtitle}>
            Guía completa (psicológica y práctica) + Directorio de Dating exclusivo para conexiones afines
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'guide' && styles.tabBtnActive]}
            onPress={() => setActiveTab('guide')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'guide' && styles.tabBtnTextActive]}>
              📖 Guía Psicológica & Práctica
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'dating' && styles.tabBtnActive]}
            onPress={() => setActiveTab('dating')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'dating' && styles.tabBtnTextActive]}>
              💘 Dating Específico Pegging ({filteredProfiles.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'guide' ? (
            /* Guide Tab */
            <View style={{ gap: spacing.md }}>
              {PEGGING_GUIDE.map((sec) => (
                <View key={sec.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 32 }}>{sec.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.typeBadge}>
                        {sec.type === 'psicologico' ? '🧠 ASPECTO PSICOLÓGICO' : '🛠️ ASPECTO PRÁCTICO & TÉCNICO'}
                      </Text>
                      <Text style={styles.cardTitle}>{sec.title}</Text>
                    </View>
                  </View>

                  <Text style={styles.summaryText}>{sec.summary}</Text>

                  <View style={styles.pointsBox}>
                    {sec.points.map((pt, idx) => (
                      <View key={idx} style={styles.pointRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.pointText}>{pt}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* Dating Tab */
            <View style={{ gap: spacing.md }}>
              {/* Filter Row */}
              <View style={styles.filterRow}>
                {[
                  { id: 'all', label: '🌐 Todos' },
                  { id: 'giver', label: '👸 Giver (Top)' },
                  { id: 'receiver', label: '🧎 Receiver (Bottom)' },
                  { id: 'switch', label: '🔄 Switch' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterChip, roleFilter === f.id && styles.filterChipActive]}
                    onPress={() => setRoleFilter(f.id)}
                  >
                    <Text style={[styles.filterChipText, roleFilter === f.id && { color: '#fff' }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {filteredProfiles.map((p) => (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 36 }}>🍑</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleBadge}>{p.role.toUpperCase()}</Text>
                      <Text style={styles.cardTitle}>{p.nickname}</Text>
                      <Text style={styles.locationText}>📍 {p.location} · {p.experience}</Text>
                    </View>
                  </View>

                  <Text style={styles.summaryText}>{p.bio}</Text>

                  <View style={styles.badgeRow}>
                    {p.badges.map((b, idx) => (
                      <Text key={idx} style={styles.tagBadge}>{b}</Text>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.connectBtn} onPress={() => handleConnectProfile(p)}>
                    <Text style={styles.connectBtnText}>Enviar Mensaje / Conectar 💬</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

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

  tabRow: { flexDirection: 'row', gap: 6, marginVertical: spacing.xs },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  tabBtnTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeBadge: { color: colors.neonPink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  roleBadge: { color: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  locationText: { color: colors.textMuted, fontSize: 10 },

  summaryText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  pointsBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, gap: 6, borderWidth: 1, borderColor: colors.border },
  pointRow: { flexDirection: 'row', gap: 6 },
  bullet: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '900' },
  pointText: { color: colors.textMuted, fontSize: fontSize.xs, flex: 1, lineHeight: 16 },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: colors.neonPurple, fontSize: 10, fontWeight: '700' },

  connectBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  connectBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },
});
