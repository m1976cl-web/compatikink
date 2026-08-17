import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, spacing, radii, fontSize, typography } from '@/constants/theme';
import {
  LinkedCoupleProfile,
  getLinkedCoupleProfile,
  updateSharedAgreements,
} from '@/lib/linkedCouples';

import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function LinkedCouplesScreenContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<LinkedCoupleProfile | null>(null);
  const [newAgreement, setNewAgreement] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getLinkedCoupleProfile();
    setProfile(data);
  };

  const handleAddAgreement = async () => {
    if (!newAgreement.trim() || !profile) return;
    const updatedAgreements = [...profile.sharedAgreements, newAgreement.trim()];
    const updated = await updateSharedAgreements(updatedAgreements);
    setProfile(updated);
    setNewAgreement('');
  };

  if (!profile) return null;

  return (
    <ScreenContainer title="Perfil de Pareja" hideHeader>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Volver al Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>💜 Perfil Vinculado de Pareja</Text>
        <Text style={styles.subtitle}>
          Inspirado en Feeld & 3Fun. Vincula las preferencias, acuerdos consensuados y límites infranqueables de ambos integrantes en un perfil unificado ZK.
        </Text>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* PAIR HEADER CARD */}
          <View style={styles.coupleCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.coupleBadge}> Verified Pair 👑</Text>
              <Text style={styles.relationshipType}>{profile.relationshipType}</Text>
            </View>

            <Text style={styles.coupleName}>{profile.coupleName}</Text>

            <View style={styles.partnersRow}>
              <View style={styles.partnerChip}>
                <Text style={styles.partnerName}>{profile.partner1Nickname}</Text>
                <Text style={styles.partnerRole}>{profile.partner1Role}</Text>
              </View>
              <Text style={styles.linkSymbol}>⚡</Text>
              <View style={styles.partnerChip}>
                <Text style={styles.partnerName}>{profile.partner2Nickname}</Text>
                <Text style={styles.partnerRole}>{profile.partner2Role}</Text>
              </View>
            </View>
          </View>

          {/* SHARED AGREEMENTS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📜 Acuerdos de Pareja Consensuados (SSC/RACK)</Text>
            {profile.sharedAgreements.map((item, idx) => (
              <View key={idx} style={styles.agreementItem}>
                <Text style={styles.agreementCheck}>✅</Text>
                <Text style={styles.agreementText}>{item}</Text>
              </View>
            ))}

            <View style={styles.addAgreementRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Añadir nuevo acuerdo de pareja..."
                placeholderTextColor={colors.textMuted}
                value={newAgreement}
                onChangeText={setNewAgreement}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddAgreement}>
                <Text style={styles.addBtnText}>+ Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* JOINT HARD LIMITS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🛑 Límites Infranqueables de Pareja (Hard Limits)</Text>
            <View style={styles.limitsGrid}>
              {profile.jointHardLimits.map((limit, idx) => (
                <View key={idx} style={styles.limitTag}>
                  <Text style={styles.limitTagText}>⛔ {limit}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  backBtn: { marginBottom: spacing.xs, alignSelf: 'flex-start' },
  backBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, fontSize: fontSize.xxl, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm, marginBottom: spacing.md },

  scroll: { gap: spacing.md, paddingBottom: 40 },
  coupleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#fbbf24',
    gap: spacing.xs,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  coupleBadge: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '900' },
  relationshipType: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    color: '#fbbf24',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '800',
  },
  coupleName: { color: colors.text, fontSize: fontSize.xl, fontFamily: fonts.displaySemi, marginVertical: 4 },
  partnersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  partnerChip: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  partnerName: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  partnerRole: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  linkSymbol: { color: '#fbbf24', fontSize: 18, marginHorizontal: 8 },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  sectionTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', marginBottom: 4 },
  agreementItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  agreementCheck: { fontSize: 14 },
  agreementText: { color: colors.text, fontSize: fontSize.xs, flex: 1 },

  addAgreementRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.xs,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  addBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '800' },

  limitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  limitTag: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#f43f5e',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  limitTagText: { color: '#f43f5e', fontSize: 11, fontWeight: '700' },
});

export default function LinkedCouplesScreen() {
  return (
    <RouteFeatureGuard route="/linked-couples" title="Perfil Vinculado de Pareja">
      <LinkedCouplesScreenContent />
    </RouteFeatureGuard>
  );
}
