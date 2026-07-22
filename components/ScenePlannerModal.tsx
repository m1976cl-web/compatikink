import React, { useState, useEffect } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing } from '@/constants/theme';
import { SceneAgreement, ReportItem } from '@/types';
import { saveSceneAgreement, getSceneAgreementByActivity } from '@/lib/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  item: ReportItem | null;
  onSaved?: () => void;
}

const DEFAULT_AFTERCARE_OPTIONS = [
  '🥤 Agua / Electrólitos inmediatos',
  '🛋️ Manta y calor corporal (Cuddling)',
  '💬 Charla post-escena sin juicios',
  '📞 Check-in por mensaje a las 24 hrs',
  '🍫 Snack dulce / Chocolate',
];

const DEFAULT_EQUIPMENT_OPTIONS = [
  '✂️ Tijeras de seguridad / Rescate',
  '🧵 Cuerdas / Material revisado',
  '🧊 Hielo / Paño frío',
  '🧴 Aceite / Lubricante especializado',
];

export function ScenePlannerModal({ visible, onClose, sessionId, item, onSaved }: Props) {
  const [safewordGreen, setSafewordGreen] = useState('Verde (Continuar)');
  const [safewordYellow, setSafewordYellow] = useState('Amarillo (Pausa / Suave)');
  const [safewordRed, setSafewordRed] = useState('Rojo (Parar de inmediato)');
  const [nonVerbalSignal, setNonVerbalSignal] = useState('Soltar objeto pesado / 2 palmadas rápidas');
  const [agreedLimits, setAgreedLimits] = useState('');
  const [durationLimit, setDurationLimit] = useState('30 min');
  const [selectedAftercare, setSelectedAftercare] = useState<string[]>([
    '🥤 Agua / Electrólitos inmediatos',
    '🛋️ Manta y calor corporal (Cuddling)',
  ]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && item && sessionId) {
      getSceneAgreementByActivity(sessionId, item.activityId).then((existing) => {
        if (existing) {
          setSafewordGreen(existing.safewordGreen);
          setSafewordYellow(existing.safewordYellow);
          setSafewordRed(existing.safewordRed);
          setNonVerbalSignal(existing.nonVerbalSignal || '');
          setDurationLimit(existing.durationLimit || '');
          setAgreedLimits(existing.agreedLimits || '');
          setSelectedEquipment(existing.equipmentChecklist || []);
          setSelectedAftercare(existing.aftercarePlan || []);
        }
      });
    }
  }, [visible, item, sessionId]);

  if (!item) return null;

  const toggleAftercare = (opt: string) => {
    setSelectedAftercare((prev) =>
      prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]
    );
  };

  const toggleEquipment = (opt: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const agreement: SceneAgreement = {
        id: `${sessionId}_${item.activityId}`,
        sessionId,
        activityId: item.activityId,
        activityName: item.activityName,
        safewordGreen,
        safewordYellow,
        safewordRed,
        nonVerbalSignal,
        durationLimit,
        agreedLimits,
        equipmentChecklist: selectedEquipment,
        aftercarePlan: selectedAftercare,
        createdAt: new Date().toISOString(),
      };

      await saveSceneAgreement(agreement);

      const contractSummary =
        `🤝 ACUERDO DE ESCENA — ${item.activityName.toUpperCase()}\n` +
        `----------------------------------------\n` +
        `🛑 SAFEWORDS:\n` +
        `• 🟢 ${safewordGreen}\n` +
        `• 🟡 ${safewordYellow}\n` +
        `• 🔴 ${safewordRed}\n` +
        (nonVerbalSignal ? `• 🖐️ No Verbal: ${nonVerbalSignal}\n` : '') +
        `\n⏱️ DURACIÓN: ${durationLimit || 'Sin límite rígido'}\n` +
        (agreedLimits ? `⚠️ LÍMITES ESPECÍFICOS: ${agreedLimits}\n` : '') +
        `\n🧰 EQUIPAMIENTO: ${selectedEquipment.join(', ') || 'Ninguno'}\n` +
        `🛋️ AFTERCARE: ${selectedAftercare.join(', ') || 'Contacto suave'}\n` +
        `----------------------------------------\n` +
        `Consentimiento mutuo acordado en Compatikink.`;

      await Clipboard.setStringAsync(contractSummary);
      Alert.alert(
        'Acuerdo Guardado 📜',
        'El acuerdo de escena ha sido guardado y el resumen se copió al portapapeles.',
        [{ text: 'OK', onPress: () => { onClose(); onSaved?.(); } }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo guardar el acuerdo de escena.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalSub}>Acuerdo de Consentimiento</Text>
              <Text style={styles.modalTitle}>{item.activityName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Safewords Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>🛑 Palabras de Seguridad (Safewords)</Text>
              
              <Text style={styles.inputLabel}>🟢 Semáforo Verde (Continuar / Todo bien)</Text>
              <TextInput
                style={styles.input}
                value={safewordGreen}
                onChangeText={setSafewordGreen}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>🟡 Semáforo Amarillo (Pausa / Reducir)</Text>
              <TextInput
                style={styles.input}
                value={safewordYellow}
                onChangeText={setSafewordYellow}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>🔴 Semáforo Rojo (ALTO ABSOLUTO)</Text>
              <TextInput
                style={styles.input}
                value={safewordRed}
                onChangeText={setSafewordRed}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>🖐️ Señal No Verbal (Si no puede hablar)</Text>
              <TextInput
                style={styles.input}
                value={nonVerbalSignal}
                onChangeText={setNonVerbalSignal}
                placeholder="Ej: Soltar objeto ruidoso, golpear piso 2 veces"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Limits & Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>⏱️ Duración y Límites de la Escena</Text>

              <Text style={styles.inputLabel}>Duración Máxima / Estimada</Text>
              <TextInput
                style={styles.input}
                value={durationLimit}
                onChangeText={setDurationLimit}
                placeholder="Ej: 30 minutos"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Límites Específicos o Reglas Negociadas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={agreedLimits}
                onChangeText={setAgreedLimits}
                placeholder="Ej: No dejar marcas visibles en cuello o rostro. Detener si hay hormigueo..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Equipment Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>🧰 Equipamiento / Seguridad</Text>
              <View style={styles.chipsRow}>
                {DEFAULT_EQUIPMENT_OPTIONS.map((opt) => {
                  const active = selectedEquipment.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleEquipment(opt)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Aftercare Plan */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>🛋️ Plan de Aftercare (Cuidados Posteriores)</Text>
              <View style={styles.chipsRow}>
                {DEFAULT_AFTERCARE_OPTIONS.map((opt) => {
                  const active = selectedAftercare.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleAftercare(opt)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Guardando...' : '📜 Guardar y Copiar Acuerdo'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalSub: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  sectionHeader: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.sm,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  chipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
