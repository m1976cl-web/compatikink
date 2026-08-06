import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  selectedRoleFilter: string;
  onSelectRoleFilter: (role: string) => void;
  fetlifeRoleFilter: string;
  onSelectFetlifeFilter: (kink: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  minScoreFilter: number;
  onSelectMinScore: (score: number) => void;
}

export function MatchFilterBar({
  selectedRoleFilter,
  onSelectRoleFilter,
  fetlifeRoleFilter,
  onSelectFetlifeFilter,
  searchQuery,
  onChangeSearchQuery,
  minScoreFilter,
  onSelectMinScore,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Dom / Sub / Switch Role Filter Chips */}
      <View style={styles.roleFilterSection}>
        <Text style={styles.filterSectionTitle}>🏷️ Filtrar por Rol Principal:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
          {[
            { id: 'all', label: '🌐 Todos' },
            { id: 'dom', label: '⚡ Dom / Top / Master' },
            { id: 'sub', label: '🪢 Sub / Bottom / Slave' },
            { id: 'switch', label: '🔄 Switch / Versátil' },
            { id: 'brat', label: '😜 Brat' },
          ].map((rf) => (
            <TouchableOpacity
              key={rf.id}
              style={[styles.roleChip, selectedRoleFilter === rf.id && styles.roleChipActive]}
              onPress={() => onSelectRoleFilter(rf.id)}
            >
              <Text style={[styles.roleChipText, selectedRoleFilter === rf.id && styles.roleChipTextActive]}>
                {rf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* FetLife Advanced Category Filter Bar */}
      <View style={styles.roleFilterSection}>
        <Text style={styles.filterSectionTitle}>🔍 Fetiche o Interés Específico:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
          {[
            { id: 'all', label: 'Todos los Kinks' },
            { id: 'shibari', label: '🪢 Shibari / Rope' },
            { id: 'bondage', label: '🔒 Bondage' },
            { id: 'impacto', label: '⚡ Impact Play' },
            { id: 'keyholder', label: '🗝️ Castidad' },
            { id: 'sensorial', label: '🕯️ Cera & Hielo' },
            { id: 'afectivo', label: '🪷 Aftercare' },
          ].map((rf) => (
            <TouchableOpacity
              key={rf.id}
              style={[styles.roleChip, fetlifeRoleFilter === rf.id && styles.roleChipActive]}
              onPress={() => onSelectFetlifeFilter(rf.id)}
            >
              <Text style={[styles.roleChipText, fetlifeRoleFilter === rf.id && styles.roleChipTextActive]}>
                {rf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nick, ubicación, insignia o fetiche (ej: Shibari, D/s, Cera)..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
        />
      </View>

      {/* Match Percentage Filter Row */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Filtrar por Afinidad:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {[
            { label: 'Todos', min: 0 },
            { label: '🔥 >70% Match', min: 70 },
            { label: '⚡ >80% Match', min: 80 },
            { label: '💖 >90% Match', min: 90 },
          ].map((f) => {
            const active = minScoreFilter === f.min;
            return (
              <TouchableOpacity
                key={f.min}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => onSelectMinScore(f.min)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, marginVertical: spacing.xs },
  roleFilterSection: { gap: 6, marginVertical: spacing.xs },
  filterSectionTitle: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  roleScroll: { gap: 6 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
  roleChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  roleChipTextActive: { color: '#000' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 10, color: colors.text, fontSize: fontSize.sm },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  filterLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChips: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.neonRose,
    borderColor: colors.neonRose,
  },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },
});
