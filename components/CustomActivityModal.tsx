import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Activity, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { CATEGORY_ORDER } from '@/data/activities';
import { saveCustomActivity } from '@/lib/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onActivityCreated: (activity: Activity) => void;
}

export function CustomActivityModal({ visible, onClose, onActivityCreated }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('power_exchange');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre de la actividad.');
      return;
    }

    setSaving(true);
    try {
      const customId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newActivity: Activity = {
        id: customId,
        category,
        name: name.trim(),
        description: description.trim() || 'Actividad personalizada acordada.',
      };

      await saveCustomActivity(newActivity);
      onActivityCreated(newActivity);
      setName('');
      setDescription('');
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la actividad personalizada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>➕ Añadir Actividad Propia</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.label}>Nombre de la actividad o fantasía *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juego de rol en hotel retro"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoriesRow}>
              {CATEGORY_ORDER.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, styles.fieldGap]}>Descripción / Contexto (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Fantasía con disfraces y ambientación acordada..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>
                {saving ? 'Guardando...' : '✨ Agregar a Cuestionario'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  fieldGap: {
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.sm,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  catChip: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(147, 51, 234, 0.25)',
  },
  catChipText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  catChipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
