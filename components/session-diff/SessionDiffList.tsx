import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { SessionDiffItem } from '@/lib/sessionDiff';

export interface SessionDiffListProps {
  newMatches: SessionDiffItem[];
  newOpenings: SessionDiffItem[];
  newLimits: SessionDiffItem[];
}

export function SessionDiffList({
  newMatches,
  newOpenings,
  newLimits,
}: SessionDiffListProps) {
  return (
    <View style={styles.container}>
      {/* New Matches */}
      <View style={styles.sectionBox}>
        <Text style={[styles.sectionTitle, { color: colors.success }]}>
          🎉 Nuevos Matches Mutuos ({newMatches.length})
        </Text>
        <Text style={styles.sectionDesc}>
          Prácticas que antes no coincidían y ahora cuentan con interés mutuo.
        </Text>
        {newMatches.length === 0 ? (
          <Text style={styles.emptyText}>Sin nuevos matches mutuos en esta comparación.</Text>
        ) : (
          newMatches.map((item) => (
            <View key={item.activityId} style={styles.itemRow}>
              <Text style={styles.itemName}>✨ {item.activityName}</Text>
              <Text style={styles.itemBadgeSuccess}>¡Nuevo Match!</Text>
            </View>
          ))
        )}
      </View>

      {/* New Openings */}
      <View style={styles.sectionBox}>
        <Text style={[styles.sectionTitle, { color: colors.info }]}>
          🔓 Nuevas Aperturas & Curiosidad ({newOpenings.length})
        </Text>
        <Text style={styles.sectionDesc}>
          Actividades donde surgió una nueva curiosidad o apertura para explorar.
        </Text>
        {newOpenings.length === 0 ? (
          <Text style={styles.emptyText}>Sin nuevas aperturas de curiosidad registradas.</Text>
        ) : (
          newOpenings.map((item) => (
            <View key={item.activityId} style={styles.itemRow}>
              <Text style={styles.itemName}>💜 {item.activityName}</Text>
              <Text style={styles.itemBadgeInfo}>Apertura</Text>
            </View>
          ))
        )}
      </View>

      {/* New Hard Limits */}
      <View style={styles.sectionBox}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>
          🛑 Nuevos Límites Duros de Seguridad ({newLimits.length})
        </Text>
        <Text style={styles.sectionDesc}>
          Límites recientemente marcados para mayor protección y consentimiento.
        </Text>
        {newLimits.length === 0 ? (
          <Text style={styles.emptyText}>Sin nuevos límites duros añadidos en este periodo.</Text>
        ) : (
          newLimits.map((item) => (
            <View key={item.activityId} style={styles.itemRowVeto}>
              <Text style={styles.itemNameVeto}>🛑 {item.activityName}</Text>
              <Text style={styles.itemBadgeDanger}>Nuevo Límite</Text>
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
