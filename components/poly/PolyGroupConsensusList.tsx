import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PolyGroupItem } from '@/lib/polyCompatibility';

export interface PolyGroupConsensusListProps {
  unanimousMatches: PolyGroupItem[];
  groupHardLimits: PolyGroupItem[];
  exploreTogetherItems: PolyGroupItem[];
}

export function PolyGroupConsensusList({
  unanimousMatches,
  groupHardLimits,
  exploreTogetherItems,
}: PolyGroupConsensusListProps) {
  return (
    <View style={styles.container}>
      {/* Unanimous Matches */}
      <View style={styles.sectionBox}>
        <Text style={[styles.sectionTitle, { color: colors.success }]}>
          🌟 Coincidencias Unánimes del Grupo ({unanimousMatches.length})
        </Text>
        <Text style={styles.sectionDesc}>
          Actividades donde TODOS los miembros del grupo expresaron interés favorable.
        </Text>
        {unanimousMatches.length === 0 ? (
          <Text style={styles.emptyText}>No hay coincidencias al 100% en todas las actividades registradas.</Text>
        ) : (
          unanimousMatches.map((item) => (
            <View key={item.activityId} style={styles.itemRow}>
              <Text style={styles.itemName}>✨ {item.activityName}</Text>
              <Text style={styles.itemBadgeSuccess}>100% Consenso</Text>
            </View>
          ))
        )}
      </View>

      {/* Explore Together */}
      {exploreTogetherItems.length > 0 ? (
        <View style={styles.sectionBox}>
          <Text style={[styles.sectionTitle, { color: colors.info }]}>
            🔍 Explorar en Grupo ({exploreTogetherItems.length})
          </Text>
          <Text style={styles.sectionDesc}>
            Actividades que interesan a la mayoría del grupo y nadie ha vetado.
          </Text>
          {exploreTogetherItems.map((item) => (
            <View key={item.activityId} style={styles.itemRow}>
              <Text style={styles.itemName}>💜 {item.activityName}</Text>
              <Text style={styles.itemBadgeInfo}>Interés: {item.positiveBy.join(', ')}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Group Hard Limits (Vetos) */}
      <View style={styles.sectionBox}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>
          🛑 Vetos de Grupo / Límites Duros ({groupHardLimits.length})
        </Text>
        <Text style={styles.sectionDesc}>
          Actividades vetadas por al menos 1 participante. Se consideran incompatibles para el grupo.
        </Text>
        {groupHardLimits.length === 0 ? (
          <Text style={styles.emptyText}>No hay límites duros conflictivos identificados en el grupo.</Text>
        ) : (
          groupHardLimits.map((item) => (
            <View key={item.activityId} style={styles.itemRowVeto}>
              <Text style={styles.itemNameVeto}>🛑 {item.activityName}</Text>
              <Text style={styles.itemBadgeDanger}>Veto: {item.vetoedBy.join(', ')}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  sectionBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  sectionDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginBottom: 4,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  itemRow: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemRowVeto: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radii.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  itemName: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  itemNameVeto: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  itemBadgeSuccess: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  itemBadgeInfo: {
    color: colors.info,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  itemBadgeDanger: {
    color: colors.danger,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
});
