import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { AdminRegisteredProfile } from '@/lib/vaultUnified';

interface Props {
  profiles: AdminRegisteredProfile[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleFilterChange: (r: string) => void;
  onSelectProfile: (p: AdminRegisteredProfile) => void;
  onToggleVerification: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function ProfileDirectoryTable({
  profiles,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onSelectProfile,
  onToggleVerification,
  onToggleStatus,
}: Props) {
  return (
    <View style={styles.sectionGap}>
      {/* Search and Filters */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar por alias, ciudad o bio..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      <View style={styles.roleChipsRow}>
        {['Todos', 'Dom', 'Sub', 'Switch', 'Rigger', 'Brat'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleChip, roleFilter === r && styles.roleChipActive]}
            onPress={() => onRoleFilterChange(r)}
          >
            <Text style={[styles.roleChipText, roleFilter === r && styles.roleChipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profiles Directory List */}
      <View style={styles.profilesList}>
        {profiles.map((p) => (
          <View key={p.id} style={styles.profileRow}>
            <TouchableOpacity style={styles.profileMainInfo} onPress={() => onSelectProfile(p)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.profileAlias}>{p.alias}</Text>
                {p.isVerified ? <Text style={{ fontSize: 12 }}>🛡️</Text> : null}
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{p.kinkRole}</Text>
                </View>
              </View>
              <Text style={styles.profileSubText}>📍 {p.location} • Sesiones: {p.sessionCount}</Text>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, p.isVerified && styles.actionBtnActive]}
                onPress={() => onToggleVerification(p.id)}
              >
                <Text style={styles.actionBtnText}>{p.isVerified ? '✓ Verificado' : 'Verificar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, p.status === 'Suspendido' && styles.actionBtnDanger]}
                onPress={() => onToggleStatus(p.id)}
              >
                <Text style={styles.actionBtnText}>{p.status === 'Activo' ? 'Activo' : 'Suspendido'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.xs },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.xs,
  },
  roleChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleChip: { backgroundColor: colors.surface, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { color: colors.textMuted, fontSize: 11 },
  roleChipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  profilesList: { gap: spacing.xs },
  profileRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  profileMainInfo: { flex: 1, gap: 2 },
  profileAlias: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  profileSubText: { color: colors.textMuted, fontSize: 11 },
  roleBadge: { backgroundColor: colors.surfaceLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  roleBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  actionBtnActive: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.success },
  actionBtnDanger: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger },
  actionBtnText: { color: colors.text, fontSize: 10, fontWeight: '700' },
});
