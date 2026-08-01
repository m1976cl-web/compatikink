import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { generateAISceneScript, ScriptScene } from '@/lib/aiScriptBuilder';

export default function AIScriptScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [selectedTone, setSelectedTone] = useState<'Estricto & Autoritario' | 'Sensual & Dulce' | 'Poético & Shibari' | 'Educativo & Guiado'>('Sensual & Dulce');
  const [script, setScript] = useState<ScriptScene | null>(null);

  const handleGenerateScript = () => {
    const generated = generateAISceneScript('Sensorial & Bondage', selectedTone);
    setScript(generated);
    Alert.alert('Guión Generado por IA 🤖✍️', `Guión de escena en tono "${selectedTone}" creado con éxito.`);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Scene Builder & Guiones</Text>
          <Text style={styles.subtitle}>
            Generador de guiones teatrales completos para escenas BDSM con diálogos sugeridos y tonos personalizables
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Tone Selector */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎭 Seleccionar Tono del Guión:</Text>
            <View style={styles.toneGrid}>
              {[
                'Sensual & Dulce' as const,
                'Estricto & Autoritario' as const,
                'Poético & Shibari' as const,
                'Educativo & Guiado' as const,
              ].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toneChip, selectedTone === t && styles.toneChipActive]}
                  onPress={() => setSelectedTone(t)}
                >
                  <Text style={[styles.toneChipText, selectedTone === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateScript}>
              <Text style={styles.generateBtnText}>Generar Guión Teatral con IA 🤖✍️</Text>
            </TouchableOpacity>
          </View>

          {/* Script Output Card */}
          {script ? (
            <View style={styles.card}>
              <Text style={styles.scriptTitle}>{script.title}</Text>
              <Text style={styles.scriptMeta}>⏱️ Duración: {script.durationMinutes} min · Tono: {script.tone}</Text>

              <View style={styles.notesBox}>
                <Text style={styles.notesText}>📌 Notas de Preparación: {script.preparationNotes}</Text>
              </View>

              <Text style={styles.sectionLabel}>💬 Guión de Diálogos Sugeridos:</Text>
              <View style={{ gap: spacing.xs }}>
                {script.dialogueScript.map((d, idx) => (
                  <View key={idx} style={styles.dialogueRow}>
                    <Text style={styles.dialogueRole}>{d.role}:</Text>
                    <Text style={styles.dialogueLine}>"{d.line}"</Text>
                  </View>
                ))}
              </View>

              <View style={styles.safetyBox}>
                <Text style={styles.safetyText}>🛡️ Chequeo de Seguridad: {script.safetyCheck}</Text>
              </View>
            </View>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1.5, borderColor: colors.borderSubtle, gap: spacing.md },
  cardTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '900' },

  toneGrid: { gap: 6 },
  toneChip: { padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  toneChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toneChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },

  generateBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  scriptTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  scriptMeta: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  notesBox: { backgroundColor: colors.accentSoft, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSubtle },
  notesText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 16 },

  sectionLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  dialogueRow: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, gap: 2 },
  dialogueRole: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  dialogueLine: { color: colors.text, fontSize: fontSize.xs, fontStyle: 'italic' },

  safetyBox: { backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.warning },
  safetyText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '700' },
});
