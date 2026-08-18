import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { PartnerLink, RELATIONSHIP_LABELS } from '@/lib/partnerJournal';

interface Props {
  link: PartnerLink;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function PartnerLinkCard({ link, isSelected, onSelect }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.partnerCard, isSelected && styles.partnerCardActive]}
      onPress={() => onSelect(link.id)}
    >
      <View style={styles.partnerCardHeader}>
        <Text style={styles.partnerName}>{link.partnerName}</Text>
        <View style={styles.relBadge}>
          <Text style={styles.relBadgeText}>
            {RELATIONSHIP_LABELS[link.relationshipType]?.emoji} {RELATIONSHIP_LABELS[link.relationshipType]?.label}
          </Text>
        </View>
      </View>
      <View style={styles.xpRow}>
        <Text style={styles.xpText}>⭐ Nivel {link.level} ({link.totalXp} XP de Afinidad)</Text>
        <Text style={styles.dateText}>Desde {new Date(link.linkedSince).toLocaleDateString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.chatLinkBtn}
        onPress={() => router.push({ pathname: '/partner-chat', params: { linkId: link.id } })}
      >
        <Text style={styles.chatLinkBtnText}>Abrir Chat E2EE Efímero 💬🔒</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  partnerCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  partnerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerName: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  relBadge: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  relBadgeText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '700' },
  dateText: { color: colors.textMuted, fontSize: 10 },
  chatLinkBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: radii.md,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginTop: 4,
  },
  chatLinkBtnText: { color: '#38bdf8', fontSize: fontSize.xs, fontWeight: '800' },
});
