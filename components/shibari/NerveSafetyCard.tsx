import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { AnatomyZone } from '@/data/shibariData';

interface Props {
  zone: AnatomyZone;
  onSelectZone: (zone: AnatomyZone) => void;
}

export function NerveSafetyCard({ zone, onSelectZone }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.zoneCard,
        zone.zoneType === 'danger' && styles.zoneCardDanger,
        zone.zoneType === 'caution' && styles.zoneCardCaution,
        zone.zoneType === 'safe' && styles.zoneCardSafe,
      ]}
      onPress={() => onSelectZone(zone)}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 24 }}>{zone.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.zonePartTitle}>{zone.bodyPart}</Text>
          <Text style={styles.zoneNerveName}>{zone.nerveOrVessel}</Text>
        </View>
      </View>

      <Text style={styles.zoneDesc}>{zone.description}</Text>

      <View style={styles.precautionBox}>
        <Text style={styles.precautionText}>🛡️ Medida de Seguridad: {zone.precaution}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  zoneCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneCardDanger: { borderColor: colors.danger, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  zoneCardCaution: { borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)' },
  zoneCardSafe: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' },

  zonePartTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  zoneNerveName: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  zoneDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  precautionBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.sm, padding: spacing.xs },
  precautionText: { color: colors.text, fontSize: 11, fontWeight: '600' },
});
