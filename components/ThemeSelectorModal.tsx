/**
 * ThemeSelectorModal.tsx — Feature 3
 * Interactive modal allowing users to switch between the 3 glossy aesthetic themes:
 * - Latex Negro Brillante (Obsidian + Neon Purple)
 * - Vinilo Carmesí Oscuro (Crimson + Rose Red)
 * - Cyberpunk Piel Neón (Midnight + Cyan Blue)
 */

import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, THEME_PRESETS, ThemePreset } from '@/lib/themeContext';
import { fonts, fontSize, radii, spacing } from '@/constants/theme';

export interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ visible, onClose }: ThemeSelectorModalProps) {
  const { currentTheme, setTheme, palette } = useTheme();

  const handleSelectTheme = async (preset: ThemePreset) => {
    await setTheme(preset);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.modalBox, { backgroundColor: palette.surface, borderColor: palette.primary }]}>
          <Text style={[styles.title, { color: palette.primary }]}>🎨 Personalizar Tema Visual</Text>
          <Text style={[styles.subtitle, { color: palette.text }]}>
            Selecciona la paleta de diseño para tu sesión:
          </Text>

          <View style={styles.presetList}>
            {(Object.values(THEME_PRESETS) as Array<typeof THEME_PRESETS[ThemePreset]>).map((preset) => {
              const isSelected = currentTheme === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetCard,
                    { backgroundColor: preset.backgroundMid, borderColor: preset.border },
                    isSelected && { borderColor: preset.primary, borderWidth: 2 },
                  ]}
                  onPress={() => handleSelectTheme(preset.id)}
                >
                  <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.presetName, { color: preset.primary }]}>
                      {preset.name} {isSelected ? ' (Activo ✓)' : ''}
                    </Text>
                    <View style={styles.swatchRow}>
                      <View style={[styles.swatch, { backgroundColor: preset.background }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.surface }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.primary }]} />
                      <View style={[styles.swatch, { backgroundColor: preset.accent }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: palette.primary }]} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: palette.id === 'office_light' ? '#ffffff' : '#07050a' }]}>
              Guardar & Cerrar
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0c0814',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  title: { fontFamily: fonts.displaySemi, fontSize: fontSize.lg, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.xs, textAlign: 'center', marginBottom: 4 },
  presetList: { gap: spacing.xs },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  presetEmoji: { fontSize: 28 },
  presetName: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  swatchRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  swatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  closeBtn: {
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  closeBtnText: { color: '#07050a', fontFamily: fonts.bodyBold, fontSize: fontSize.xs, fontWeight: '800' },
});
