import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { SceneStep, SceneTemplate } from '@/lib/sceneTemplateManager';

export interface SceneTemplateEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (template: SceneTemplate) => void;
}

export function SceneTemplateEditorModal({
  visible,
  onClose,
  onSave,
}: SceneTemplateEditorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [gearText, setGearText] = useState('');
  
  const [steps, setSteps] = useState<SceneStep[]>([
    { id: 's1', title: '1. Negociación y Check-In', durationMins: 5, description: 'Revisión de límites y palabras de seguridad.', safetyCheckin: true },
    { id: 's2', title: '2. Clímax de la Escena', durationMins: 15, description: 'Práctica principal.', safetyCheckin: false },
    { id: 's3', title: '3. Aftercare y Cuidado', durationMins: 10, description: 'Protocolo de hidratación y contención.', safetyCheckin: true },
  ]);

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        id: `s_${Date.now()}_${nextNum}`,
        title: `${nextNum}. Nuevo Paso`,
        durationMins: 10,
        description: 'Descripción del paso',
        safetyCheckin: false,
      },
    ]);
  };

  const handleUpdateStep = (id: string, field: keyof SceneStep, value: any) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length <= 1) {
      Alert.alert('Atención', 'La escena debe contener al menos 1 paso.');
      return;
    }
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de la plantilla.');
      return;
    }

    const totalDurationMins = steps.reduce((sum, s) => sum + (Number(s.durationMins) || 0), 0);
    const gearRequired = gearText
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const newTemplate: SceneTemplate = {
      id: `template_custom_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Plantilla personalizada de escena',
      intensity,
      totalDurationMins,
      gearRequired,
      createdAt: new Date().toISOString(),
      steps,
    };

    onSave(newTemplate);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎨 Diseñar Nueva Escena</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Nombre de la Escena</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Noche de Bondage Sensual"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Descripción Breve</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Objetivo y dinámica de la escena..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.fieldLabel}>Nivel de Intensidad (1-5)</Text>
            <View style={styles.intensityRow}>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.intensityChip, intensity === lvl && styles.intensityChipActive]}
                  onPress={() => setIntensity(lvl as any)}
                >
                  <Text style={[styles.intensityText, intensity === lvl && styles.intensityTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Equipo Recomendado (Separado por comas)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cuerdas de Yute, Antifaz, Manta"
              placeholderTextColor={colors.textMuted}
              value={gearText}
              onChangeText={setGearText}
            />

            {/* Steps Editor */}
            <View style={styles.stepsSection}>
              <View style={styles.stepsHeaderRow}>
                <Text style={styles.sectionTitle}>Secuencia de Pasos ({steps.length})</Text>
                <TouchableOpacity style={styles.addStepBtn} onPress={handleAddStep}>
                  <Text style={styles.addStepBtnText}>+ Agregar Paso</Text>
                </TouchableOpacity>
              </View>

              {steps.map((step, idx) => (
                <View key={step.id} style={styles.stepCard}>
                  <View style={styles.stepCardHeader}>
                    <TextInput
                      style={styles.stepTitleInput}
                      value={step.title}
                      onChangeText={(val) => handleUpdateStep(step.id, 'title', val)}
                    />
                    <TouchableOpacity onPress={() => handleRemoveStep(step.id)}>
                      <Text style={styles.removeStepText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.stepRow}>
                    <Text style={styles.stepLabel}>Duración (min):</Text>
                    <TextInput
                      style={styles.numInput}
                      keyboardType="numeric"
                      value={String(step.durationMins)}
                      onChangeText={(val) => handleUpdateStep(step.id, 'durationMins', Number(val) || 1)}
                    />

                    <TouchableOpacity
                      style={[styles.checkinChip, step.safetyCheckin && styles.checkinChipActive]}
                      onPress={() => handleUpdateStep(step.id, 'safetyCheckin', !step.safetyCheckin)}
                    >
                      <Text style={[styles.checkinText, step.safetyCheckin && styles.checkinTextActive]}>
                        🛡️ Check-In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>💾 Guardar Plantilla en la Bóveda</Text>
          </TouchableOpacity>
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
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '90%',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  scroll: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  intensityChip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  intensityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intensityText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
  },
  intensityTextActive: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
  stepsSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  stepsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  addStepBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addStepBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  stepCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitleInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 2,
    marginRight: spacing.xs,
  },
  removeStepText: {
    fontSize: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  numInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
    width: 44,
    textAlign: 'center',
  },
  checkinChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkinChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.success,
  },
  checkinText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
  },
  checkinTextActive: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
