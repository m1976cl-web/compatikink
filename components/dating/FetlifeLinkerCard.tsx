import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  userFetlifeHandle: string;
  onChangeHandle: (val: string) => void;
  onLinkFetlife: () => void;
}

export function FetlifeLinkerCard({
  userFetlifeHandle,
  onChangeHandle,
  onLinkFetlife,
}: Props) {
  return (
    <View style={styles.fetlifeCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 20 }}>🗝️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.fetlifeCardTitle}>Integración & Verificación FetLife</Text>
          <Text style={styles.fetlifeCardDesc}>
            Vincular tu perfil de FetLife otorga la insignia verificada en tus conexiones y permite filtrar por roles avanzados.
          </Text>
        </View>
      </View>

      <View style={styles.fetlifeInputRow}>
        <TextInput
          style={styles.fetlifeInput}
          placeholder="Ej: fetlife.com/users/TuNombre o @TuNombre"
          placeholderTextColor={colors.textMuted}
          value={userFetlifeHandle}
          onChangeText={onChangeHandle}
        />
        <TouchableOpacity style={styles.fetlifeVerifyBtn} onPress={onLinkFetlife}>
          <Text style={styles.fetlifeVerifyBtnText}>Vincular FetLife</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fetlifeCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  fetlifeCardTitle: { color: colors.neonPurple, fontSize: fontSize.sm, fontWeight: '900' },
  fetlifeCardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16 },
  fetlifeInputRow: { flexDirection: 'row', gap: spacing.xs },
  fetlifeInput: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fetlifeVerifyBtn: {
    backgroundColor: colors.neonPurple,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  fetlifeVerifyBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },
});
