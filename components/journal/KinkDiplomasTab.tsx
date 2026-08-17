import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { KinkDiploma } from '@/lib/partnerJournal';

export interface KinkDiplomasTabProps {
  diplomas: KinkDiploma[];
  onSelectDiploma: (diploma: KinkDiploma) => void;
}

export function KinkDiplomasTab({ diplomas, onSelectDiploma }: KinkDiplomasTabProps) {
  return (
    <View style={styles.sectionGap}>
      <Text style={styles.sectionHeader}>Diplomas y Certificados Cifrados ({diplomas.length}):</Text>
      <View style={styles.diplomaGrid}>
        {diplomas.map((dip) => (
          <TouchableOpacity
            key={dip.id}
            style={styles.diplomaCard}
            onPress={() => onSelectDiploma(dip)}
            activeOpacity={0.8}
          >
            <Text style={styles.diplomaEmoji}>{dip.sealEmoji || '📜'}</Text>
            <Text style={styles.diplomaTitle}>{dip.title}</Text>
            <Text style={styles.diplomaCategory}>{dip.practiceCategory}</Text>
            <Text style={styles.diplomaRecipient}>Otorgado a: {dip.recipientName}</Text>

            <View style={styles.viewCertBtn}>
              <Text style={styles.viewCertBtnText}>Ver Diploma Cifrado 📜</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: spacing.md },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  diplomaGrid: {
    gap: spacing.md,
  },
  diplomaCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  diplomaEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  diplomaTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  diplomaCategory: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },
  diplomaRecipient: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  viewCertBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  viewCertBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
