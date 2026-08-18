import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ExperienceLevel } from '@/types';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';
import { AppHeader } from '@/components/AppHeader';
import { FlowBar } from '@/components/FlowBar';

const PRIMARY_ROLE_OPTIONS = ['Dom', 'Sub', 'Switch', 'Top', 'Bottom', 'Master', 'Slave', 'Rigger', 'Brat'];

export interface QuickProfileIntroStepProps {
  nickname: string;
  setNickname: (val: string) => void;
  pronouns: string;
  setPronouns: (val: string) => void;
  experienceLevel: ExperienceLevel | undefined;
  setExperienceLevel: (val: ExperienceLevel | undefined) => void;
  primaryRole: string;
  setPrimaryRole: (val: string) => void;
  selectedProtocols: ('SSC' | 'RACK' | 'PRICK')[];
  toggleProtocol: (proto: 'SSC' | 'RACK' | 'PRICK') => void;
  safewordGreen: string;
  setSafewordGreen: (val: string) => void;
  safewordYellow: string;
  setSafewordYellow: (val: string) => void;
  safewordRed: string;
  setSafewordRed: (val: string) => void;
  hardLimitsInput: string;
  setHardLimitsInput: (val: string) => void;
  softLimitsInput: string;
  setSoftLimitsInput: (val: string) => void;
  onNext: () => void;
}

export function QuickProfileIntroStep({
  nickname,
  setNickname,
  pronouns,
  setPronouns,
  experienceLevel,
  setExperienceLevel,
  primaryRole,
  setPrimaryRole,
  selectedProtocols,
  toggleProtocol,
  safewordGreen,
  setSafewordGreen,
  safewordYellow,
  setSafewordYellow,
  safewordRed,
  setSafewordRed,
  hardLimitsInput,
  setHardLimitsInput,
  softLimitsInput,
  setSoftLimitsInput,
  onNext,
}: QuickProfileIntroStepProps) {
  return (
    <>
      <FlowBar step={1} />
      <View style={styles.heroSection}>
        <AppHeader
          brand
          title="Perfil Rápido con Insignias"
          subtitle="Configura tu nick, rol principal (Dom/Sub/Switch), protocolos SSC/RACK y 10 preguntas clave."
        />
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>~2 minutos</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Bóveda Cifrada</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>Insignias Fetish</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Tu nick o nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Alex"
          placeholderTextColor={colors.textMuted}
          value={nickname}
          onChangeText={setNickname}
          autoFocus
        />

        <Text style={styles.fieldLabel}>Pronombres (opcional)</Text>
        <PronounsPicker value={pronouns} onChange={setPronouns} />

        <Text style={styles.fieldLabel}>Nivel de experiencia en kink</Text>
        <ExperiencePicker value={experienceLevel} onChange={setExperienceLevel} />

        {/* Primary Role Selector */}
        <Text style={styles.fieldLabel}>Rol Principal BDSM / Kink</Text>
        <View style={styles.rolePickerGrid}>
          {PRIMARY_ROLE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rolePickerChip, primaryRole === r && styles.rolePickerChipActive]}
              onPress={() => setPrimaryRole(r)}
              activeOpacity={0.8}
            >
              <Text style={[styles.rolePickerChipText, primaryRole === r && styles.rolePickerChipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Protocols Selector */}
        <Text style={styles.fieldLabel}>Protocolos de Seguridad (SSC / RACK / PRICK)</Text>
        <View style={styles.protoRow}>
          {(['SSC', 'RACK', 'PRICK'] as const).map((proto) => {
            const isSel = selectedProtocols.includes(proto);
            return (
              <TouchableOpacity
                key={proto}
                style={[styles.protoChip, isSel && styles.protoChipActive]}
                onPress={() => toggleProtocol(proto)}
                activeOpacity={0.8}
              >
                <Text style={[styles.protoChipText, isSel && styles.protoChipTextActive]}>
                  {proto}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Safewords Input */}
        <Text style={styles.fieldLabel}>Palabras de Seguridad (Semáforo)</Text>
        <View style={styles.safewordsInputGrid}>
          <View style={styles.swInputBox}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>🟢 Verde</Text>
            <TextInput
              style={styles.swInput}
              value={safewordGreen}
              onChangeText={setSafewordGreen}
              placeholder="Verde / Sigue"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.swInputBox}>
            <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}>🟡 Amarillo</Text>
            <TextInput
              style={styles.swInput}
              value={safewordYellow}
              onChangeText={setSafewordYellow}
              placeholder="Amarillo / Calma"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.swInputBox}>
            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '700' }}>🔴 Rojo</Text>
            <TextInput
              style={styles.swInput}
              value={safewordRed}
              onChangeText={setSafewordRed}
              placeholder="Rojo / Detener"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Hard & Soft Limits Input */}
        <Text style={styles.fieldLabel}>🛑 Límites Duros (Inviolables, sep. por coma)</Text>
        <TextInput
          style={styles.input}
          value={hardLimitsInput}
          onChangeText={setHardLimitsInput}
          placeholder="Ej: Scat, Sangre, Sin preservativo"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.fieldLabel}>⚠️ Límites Suaves (Condicionales, sep. por coma)</Text>
        <TextInput
          style={styles.input}
          value={softLimitsInput}
          onChangeText={setSoftLimitsInput}
          placeholder="Ej: Ataduras muy apretadas, Humillación verbal"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => {
          if (!nickname.trim()) {
            setNickname('Anónimo');
          }
          onNext();
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Comenzar Cuestionario Rápido (10 Preguntas) →</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pill: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 6,
    marginTop: spacing.xs,
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
  rolePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rolePickerChip: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  rolePickerChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  rolePickerChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  rolePickerChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  protoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  protoChip: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  protoChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.success,
  },
  protoChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  protoChipTextActive: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
  },
  safewordsInputGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  swInputBox: {
    flex: 1,
    gap: 4,
  },
  swInput: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
