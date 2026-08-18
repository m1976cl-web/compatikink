import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { AftercareCheckin, generateNoxAftercareAdvice, saveAftercareCheckin, markReminderCompleted } from '@/lib/aftercare';
import { addXP } from '@/lib/badgesXP';

const AFTERDROP_SYMPTOMS = ['Tristeza repentina', 'Fatiga extrema', 'Ansiedad', 'Vulnerabilidad alta', 'Ninguno'];

export default function AftercareCheckinScreen() {
  const router = useRouter();
  const { sessionId, sessionTitle, scheduledForHours, reminderId } = useLocalSearchParams<{
    sessionId?: string, sessionTitle?: string, scheduledForHours?: string, reminderId?: string
  }>();

  const [checkin, setCheckin] = useState<Partial<AftercareCheckin>>({
    energyLevel: 3,
    moodLevel: 3,
    hydrationLevel: 3,
    physicalComfort: 3,
    partnerConnectionRating: 3,
    afterdropSymptoms: [],
    notes: ''
  });

  const noxAdvice = generateNoxAftercareAdvice(checkin);

  const toggleSymptom = (sym: string) => {
    let newSymptoms = [...(checkin.afterdropSymptoms || [])];
    if (sym === 'Ninguno') {
      newSymptoms = ['Ninguno'];
    } else {
      newSymptoms = newSymptoms.filter(s => s !== 'Ninguno');
      if (newSymptoms.includes(sym)) {
        newSymptoms = newSymptoms.filter(s => s !== sym);
      } else {
        newSymptoms.push(sym);
      }
    }
    setCheckin({ ...checkin, afterdropSymptoms: newSymptoms });
  };

  const handleSave = async () => {
    const finalCheckin: AftercareCheckin = {
      id: `checkin_${Date.now()}`,
      sessionId,
      sessionTitle,
      timestamp: new Date().toISOString(),
      scheduledForHours: parseInt(scheduledForHours || '0', 10),
      energyLevel: checkin.energyLevel || 3,
      moodLevel: checkin.moodLevel || 3,
      hydrationLevel: checkin.hydrationLevel || 3,
      physicalComfort: checkin.physicalComfort || 3,
      afterdropSymptoms: checkin.afterdropSymptoms || [],
      partnerConnectionRating: checkin.partnerConnectionRating || 3,
      notes: checkin.notes,
      noxAdvice
    };

    await saveAftercareCheckin(finalCheckin);
    
    if (reminderId) {
      await markReminderCompleted(reminderId);
    }
    
    await addXP(50, 'Check-in de Aftercare');
    Alert.alert('Check-in Guardado', '¡Excelente! Has ganado +50 XP por cuidarte.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const renderSlider = (label: string, icon: string, value: number, field: keyof AftercareCheckin) => {
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>{icon} {label}</Text>
        <View style={styles.circlesRow}>
          {[1, 2, 3, 4, 5].map(val => (
            <TouchableOpacity
              key={val}
              style={[styles.circle, value === val && styles.circleSelected]}
              onPress={() => setCheckin({ ...checkin, [field]: val })}
            >
              <Text style={[styles.circleText, value === val && styles.circleTextSelected]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer title="🌿 Check-in de Aftercare">
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {sessionTitle && (
          <Text style={styles.subtitle}>Sesión: {sessionTitle}</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bienestar Físico & Mental</Text>
          {renderSlider('Energía', '⚡', checkin.energyLevel || 3, 'energyLevel')}
          {renderSlider('Estado de Ánimo', '💭', checkin.moodLevel || 3, 'moodLevel')}
          {renderSlider('Hidratación', '💧', checkin.hydrationLevel || 3, 'hydrationLevel')}
          {renderSlider('Confort Físico', '🧘', checkin.physicalComfort || 3, 'physicalComfort')}
          {renderSlider('Conexión con Pareja', '💚', checkin.partnerConnectionRating || 3, 'partnerConnectionRating')}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Síntomas de Afterdrop</Text>
          <View style={styles.tagsContainer}>
            {AFTERDROP_SYMPTOMS.map(sym => {
              const selected = checkin.afterdropSymptoms?.includes(sym);
              return (
                <TouchableOpacity
                  key={sym}
                  style={[styles.tag, selected && styles.tagSelected]}
                  onPress={() => toggleSymptom(sym)}
                >
                  <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{sym}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.noxCard}>
          <Text style={styles.noxTitle}>Asistente Nox</Text>
          <Text style={styles.noxText}>{noxAdvice}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reflexión / Notas Libres</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="¿Cómo te sientes realmente?..."
            placeholderTextColor={colors.textMuted}
            value={checkin.notes}
            onChangeText={v => setCheckin({ ...checkin, notes: v })}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar Check-in (+50 XP)</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: 40 },
  subtitle: { color: colors.textMuted, fontSize: fontSize.md, marginBottom: spacing.md, textAlign: 'center' },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: 'bold', marginBottom: spacing.md },
  
  sliderContainer: { marginBottom: spacing.md },
  sliderLabel: { color: colors.text, fontSize: fontSize.sm, marginBottom: spacing.sm },
  circlesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  circleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  circleText: { color: colors.text, fontWeight: 'bold' },
  circleTextSelected: { color: colors.background },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border },
  tagSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { color: colors.text, fontSize: fontSize.sm },
  tagTextSelected: { color: colors.background, fontWeight: 'bold' },

  noxCard: { backgroundColor: 'rgba(157, 78, 221, 0.1)', padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.primary },
  noxTitle: { color: colors.primary, fontWeight: 'bold', marginBottom: spacing.xs },
  noxText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  input: { backgroundColor: colors.background, color: colors.text, padding: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, height: 100, textAlignVertical: 'top' },
  
  saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  saveBtnText: { color: colors.background, fontWeight: 'bold', fontSize: fontSize.md }
});
