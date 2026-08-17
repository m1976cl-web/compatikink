import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PartnerLink, RelationshipType, RELATIONSHIP_LABELS } from '@/lib/partnerJournal';
import { PartnerLinkCard } from '@/components/journal/PartnerLinkCard';

export interface PartnerLinksTabProps {
  newPartnerName: string;
  setNewPartnerName: (name: string) => void;
  newPartnerType: RelationshipType;
  setNewPartnerType: (type: RelationshipType) => void;
  onAddPartner: () => void;
  partnerLinks: PartnerLink[];
  selectedPartnerId: string | null;
  onSelectPartner: (id: string) => void;
}

export function PartnerLinksTab({
  newPartnerName,
  setNewPartnerName,
  newPartnerType,
  setNewPartnerType,
  onAddPartner,
  partnerLinks,
  selectedPartnerId,
  onSelectPartner,
}: PartnerLinksTabProps) {
  return (
    <View style={styles.sectionGap}>
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>➕ Crear Nuevo Vínculo (Pareja / Playmate)</Text>

        <Text style={styles.fieldLabel}>Nombre / Apodo de tu Vínculo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Morgan, Sam, Mi Sumisa..."
          placeholderTextColor={colors.textDim}
          value={newPartnerName}
          onChangeText={setNewPartnerName}
        />

        <Text style={styles.fieldLabel}>Tipo de Relación / Dinámica</Text>
        <View style={styles.chipGrid}>
          {(Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]).map((type) => {
            const sel = newPartnerType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, sel && styles.chipActive]}
                onPress={() => setNewPartnerType(type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, sel && styles.chipTextActive]}>
                  {RELATIONSHIP_LABELS[type].emoji} {RELATIONSHIP_LABELS[type].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onAddPartner} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Vincular Pareja 🔗</Text>
        </TouchableOpacity>
      </View>

      {/* List of active partner links */}
      <Text style={styles.sectionHeader}>Mis Vínculos Activos ({partnerLinks.length}):</Text>
      {partnerLinks.map((link) => (
        <PartnerLinkCard
          key={link.id}
          link={link}
          isSelected={selectedPartnerId === link.id}
          onSelect={onSelectPartner}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    gap: spacing.md,
  },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardBoxTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  chipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
});
