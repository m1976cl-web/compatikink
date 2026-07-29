import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { getAccessibilitySettings, saveAccessibilitySettings, AccessibilitySettings } from '@/lib/accessibility';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AccessibilityModal({ visible, onClose }: Props) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSizeScale: 'normal',
    screenReaderHints: true,
  });

  useEffect(() => {
    (async () => {
      const s = await getAccessibilitySettings();
      setSettings(s);
    })();
  }, [visible]);

  const handleToggleHighContrast = async () => {
    const updated = { ...settings, highContrast: !settings.highContrast };
    setSettings(updated);
    await saveAccessibilitySettings(updated);
    Alert.alert('Modo Alto Contraste ♿', updated.highContrast ? 'Activado paleta de alto contraste.' : 'Desactivado.');
  };

  const handleSetFontScale = async (scale: 'normal' | 'large' | 'extra_large') => {
    const updated = { ...settings, fontSizeScale: scale };
    setSettings(updated);
    await saveAccessibilitySettings(updated);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>♿</Text>
          <Text style={styles.title}>Ajustes de Accesibilidad (A11y)</Text>
          <Text style={styles.desc}>
            Personaliza la legibilidad, el contraste y la interacción con lectores de pantalla.
          </Text>

          {/* High Contrast Toggle */}
          <TouchableOpacity style={styles.toggleRow} onPress={handleToggleHighContrast}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>🎨 Modo Alto Contraste (High Contrast)</Text>
              <Text style={styles.toggleSub}>Fondo negro profundo y textos de máxima visibilidad</Text>
            </View>
            <View style={[styles.switchTrack, settings.highContrast && styles.switchTrackActive]}>
              <View style={[styles.switchThumb, settings.highContrast && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>

          {/* Font Scale Selector */}
          <Text style={styles.sectionLabel}>📏 Tamaño de Texto:</Text>
          <View style={styles.scaleRow}>
            {[
              { id: 'normal' as const, label: 'Normal (14px)' },
              { id: 'large' as const, label: 'Grande (16px)' },
              { id: 'extra_large' as const, label: 'Muy Grande (18px)' },
            ].map((sc) => (
              <TouchableOpacity
                key={sc.id}
                style={[styles.scaleChip, settings.fontSizeScale === sc.id && styles.scaleChipActive]}
                onPress={() => handleSetFontScale(sc.id)}
              >
                <Text style={[styles.scaleChipText, settings.fontSizeScale === sc.id && styles.scaleChipTextActive]}>
                  {sc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={onClose}>
            <Text style={styles.saveBtnText}>Guardar Ajustes ✅</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10, 6, 18, 0.88)', justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.xl, maxWidth: 440, width: '100%', borderWidth: 1.5, borderColor: colors.primary, gap: spacing.md, position: 'relative' },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.textMuted, fontSize: 14 },
  emoji: { fontSize: 40, textAlign: 'center' },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', textAlign: 'center' },
  desc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 16 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  toggleTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  toggleSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, padding: 2 },
  switchTrackActive: { backgroundColor: colors.primary },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  switchThumbActive: { alignSelf: 'flex-end' },

  sectionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  scaleRow: { gap: 6 },
  scaleChip: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  scaleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  scaleChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  scaleChipTextActive: { color: '#fff' },

  saveBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
