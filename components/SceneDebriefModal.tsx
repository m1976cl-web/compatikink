import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Switch,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { saveSceneDebrief, SceneDebrief } from '@/lib/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  activityId: string;
  activityName: string;
  onSaved?: () => void;
}

export function SceneDebriefModal({
  visible,
  onClose,
  sessionId,
  activityId,
  activityName,
  onSaved,
}: Props) {
  const [ratingStars, setRatingStars] = useState(5);
  const [safewordsRespected, setSafewordsRespected] = useState(true);
  const [aftercareRating, setAftercareRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const debrief: SceneDebrief = {
        id: `${Date.now()}`,
        sessionId,
        activityId,
        activityName,
        ratingStars,
        safewordsRespected,
        aftercareRating,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await saveSceneDebrief(debrief);
      Alert.alert('¡Diario Guardado! 📝', 'Se ha registrado la experiencia post-escena.');
      onSaved?.();
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la reseña de escena.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerEmoji}>📝</Text>
          <Text style={styles.title}>Diario Post-Escena (Debrief)</Text>
          <Text style={styles.subtitle}>
            Actividad: <Text style={{ color: colors.neonPurple, fontWeight: '700' }}>{activityName}</Text>
          </Text>

          {/* Rating Stars */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>¿Cómo se sintió la experiencia?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingStars(star)}>
                  <Text style={[styles.starEmoji, ratingStars >= star && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Safewords Respected Switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>¿Se respetaron las palabras clave?</Text>
            <Switch
              value={safewordsRespected}
              onValueChange={setSafewordsRespected}
              trackColor={{ false: colors.danger, true: colors.success }}
              thumbColor="#fff"
            />
          </View>

          {/* Aftercare Rating */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Calidad del Aftercare / Reconexión</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setAftercareRating(star)}>
                  <Text style={[styles.starEmoji, aftercareRating >= star && styles.starActive]}>💛</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Private Notes */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Notas privadas / Aprendizajes para la próxima</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: La cera estaba perfecta. Aumentar tiempo de cuerdas..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar Diario 📝'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  headerEmoji: { fontSize: 44 },
  title: {
    color: colors.neonPurple,
    fontSize: fontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  fieldBlock: {
    width: '100%',
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginVertical: 4,
  },
  starEmoji: {
    fontSize: 28,
    color: colors.border,
  },
  starActive: {
    color: colors.warning,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.sm,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  btnDisabled: { opacity: 0.5 },
  closeBtn: { paddingVertical: spacing.xs },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
