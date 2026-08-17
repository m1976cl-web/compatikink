import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PartnerLink, SessionJournalEntry } from '@/lib/partnerJournal';

export interface JournalEntriesTabProps {
  activePartner?: PartnerLink;
  sessionTitle: string;
  setSessionTitle: (val: string) => void;
  activitiesDone: string;
  setActivitiesDone: (val: string) => void;
  gearUsedInput: string;
  setGearUsedInput: (val: string) => void;
  safewordUsed: 'ninguna' | 'verde' | 'amarillo' | 'rojo';
  setSafewordUsed: (val: 'ninguna' | 'verde' | 'amarillo' | 'rojo') => void;
  subspaceLevel: 1 | 2 | 3 | 4 | 5;
  setSubspaceLevel: (val: 1 | 2 | 3 | 4 | 5) => void;
  aftercareRating: 1 | 2 | 3 | 4 | 5;
  setAftercareRating: (val: 1 | 2 | 3 | 4 | 5) => void;
  debriefNotes: string;
  setDebriefNotes: (val: string) => void;
  onSaveJournalEntry: () => void;
  journalEntries: SessionJournalEntry[];
}

export function JournalEntriesTab({
  activePartner,
  sessionTitle,
  setSessionTitle,
  activitiesDone,
  setActivitiesDone,
  gearUsedInput,
  setGearUsedInput,
  safewordUsed,
  setSafewordUsed,
  subspaceLevel,
  setSubspaceLevel,
  aftercareRating,
  setAftercareRating,
  debriefNotes,
  setDebriefNotes,
  onSaveJournalEntry,
  journalEntries,
}: JournalEntriesTabProps) {
  return (
    <View style={styles.sectionGap}>
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>📖 Registrar Nueva Sesión & Debriefing</Text>
        
        {activePartner ? (
          <Text style={styles.activePartnerBanner}>
            Vínculo Seleccionado: <Text style={{ color: colors.primary, fontWeight: '800' }}>{activePartner.partnerName}</Text>
          </Text>
        ) : (
          <Text style={styles.warningBanner}>⚠️ Crea o selecciona un vínculo arriba antes de registrar.</Text>
        )}

        <Text style={styles.fieldLabel}>Título de la Escena / Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Noche de Shibari & Sensaciones, Protocolo Dominante..."
          placeholderTextColor={colors.textDim}
          value={sessionTitle}
          onChangeText={setSessionTitle}
        />

        <Text style={styles.fieldLabel}>Prácticas Realizadas (sep. por coma)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Ataduras, Spanking, Cera tibia, Aftercare"
          placeholderTextColor={colors.textDim}
          value={activitiesDone}
          onChangeText={setActivitiesDone}
        />

        <Text style={styles.fieldLabel}>🧰 Juguetes y Equipamiento Utilizados (sep. por coma)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Cuerdas Yute 6mm, Pala de cuero, Antafaz de seda"
          placeholderTextColor={colors.textDim}
          value={gearUsedInput}
          onChangeText={setGearUsedInput}
        />

        <Text style={styles.fieldLabel}>Safeword Utilizada en la Escena</Text>
        <View style={styles.chipGrid}>
          {(['ninguna', 'verde', 'amarillo', 'rojo'] as const).map((sw) => (
            <TouchableOpacity
              key={sw}
              style={[styles.chip, safewordUsed === sw && styles.chipActive]}
              onPress={() => setSafewordUsed(sw)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, safewordUsed === sw && styles.chipTextActive]}>
                {sw === 'ninguna' ? '✓ Ninguna (Fluido)' : sw === 'verde' ? '🟢 Verde' : sw === 'amarillo' ? '🟡 Amarillo' : '🔴 Rojo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Profundidad de Subspace / Trance (1 a 5)</Text>
        <View style={styles.chipGrid}>
          {([1, 2, 3, 4, 5] as const).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.chip, subspaceLevel === lvl && styles.chipActive]}
              onPress={() => setSubspaceLevel(lvl)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, subspaceLevel === lvl && styles.chipTextActive]}>
                {'★'.repeat(lvl)} ({lvl})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Evaluación del Aftercare (1 a 5)</Text>
        <View style={styles.chipGrid}>
          {([1, 2, 3, 4, 5] as const).map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[styles.chip, aftercareRating === rating && styles.chipActive]}
              onPress={() => setAftercareRating(rating)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, aftercareRating === rating && styles.chipTextActive]}>
                {'🫂'.repeat(rating)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Notas Privadas de Debriefing</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="¿Cómo se sintieron después? Reflexiones, cosas a mejorar..."
          placeholderTextColor={colors.textDim}
          value={debriefNotes}
          onChangeText={setDebriefNotes}
          multiline
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onSaveJournalEntry} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Guardar en Diario Cifrado 📖</Text>
        </TouchableOpacity>
      </View>

      {/* History of logged journal entries */}
      <Text style={styles.sectionHeader}>Historial de Sesiones Cifradas ({journalEntries.length}):</Text>
      {journalEntries.map((j) => (
        <View key={j.id} style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <Text style={styles.journalTitle}>{j.title}</Text>
            <Text style={styles.journalDate}>{new Date(j.date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.journalPartner}>Vínculo: {j.partnerName}</Text>
          
          {j.activitiesDone.length > 0 && (
            <Text style={styles.journalSub}>Practicas: {j.activitiesDone.join(' · ')}</Text>
          )}
          {j.gearUsed.length > 0 && (
            <Text style={styles.journalGear}>🧰 Equipamiento: {j.gearUsed.join(' · ')}</Text>
          )}

          <View style={styles.journalMetaRow}>
            <Text style={styles.metaBadge}>Safeword: {j.safewordUsed.toUpperCase()}</Text>
            <Text style={styles.metaBadge}>Subspace: {'★'.repeat(j.subspaceLevel)}</Text>
            <Text style={styles.metaBadge}>Aftercare: {'🫂'.repeat(j.aftercareRating)}</Text>
          </View>

          {j.debriefNotes ? <Text style={styles.debriefNotesText}>"{j.debriefNotes}"</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: spacing.md },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardBoxTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  activePartnerBanner: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceLight,
    padding: spacing.xs + 2,
    borderRadius: radii.sm,
  },
  warningBanner: {
    color: colors.warning,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  chipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  journalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  journalDate: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  journalPartner: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  journalSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  journalGear: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  journalMetaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  metaBadge: {
    backgroundColor: colors.surfaceLight,
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debriefNotesText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
