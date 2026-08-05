import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  DAILY_SUBMISSIVE_ACTS,
  DailySubmissiveAct,
  IntensityLevel,
} from '@/data/dailySubmissiveActs';
import {
  DailyActState,
  getDailyActState,
  getRandomActByFilter,
  completeTodayAct,
} from '@/lib/dailyActTracker';

export default function DailySubmissiveActScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [state, setState] = useState<DailyActState | null>(null);
  const [currentAct, setCurrentAct] = useState<DailySubmissiveAct>(DAILY_SUBMISSIVE_ACTS[0]);

  // Filters
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel | 'Todas'>('Todas');
  const [selectedGear, setSelectedGear] = useState<string>('Todos');

  // Completion Form Drawer
  const [isCompleting, setIsCompleting] = useState(false);
  const [reflectionNote, setReflectionNote] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await getDailyActState();
    setState(s);
    const act = DAILY_SUBMISSIVE_ACTS.find((a) => a.id === s.currentActId) || DAILY_SUBMISSIVE_ACTS[0];
    setCurrentAct(act);
  };

  const handleGenerateRandom = async () => {
    const intensity = selectedIntensity === 'Todas' ? undefined : selectedIntensity;
    const act = await getRandomActByFilter(intensity, selectedGear);
    setCurrentAct(act);
    const s = await getDailyActState();
    setState(s);
  };

  const handleMarkCompleted = async () => {
    if (!currentAct) return;
    const updatedState = await completeTodayAct(currentAct.id, reflectionNote);
    setState(updatedState);
    setIsCompleting(false);
    setReflectionNote('');
    Alert.alert(
      '¡Acto Cumplido! 🎉',
      `Felicidades. Has ganado +${currentAct.xpReward} XP y tu racha es de ${updatedState.streakDays} días seguidos.`
    );
  };

  return (
    <ScreenContainer title="Un Acto de Sumisión Diario" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Un Acto de Sumisión Diario 🎲🖤</Text>
          <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={styles.historyInfoToggle}>
            <Text style={styles.subtitle}>
              Inspirado en onesubmissiveact.com: Una tarea diaria de disciplina, servicio y sintonía D/s <Text style={{ color: colors.primary }}>[👁️ {showInfo ? 'Ocultar historia' : 'Ver historia del sitio original'}]</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {showInfo && (
          <View style={styles.infoModalBox}>
            <Text style={styles.infoModalTitle}>🌐 Historia de onesubmissiveact.com</Text>
            <Text style={styles.infoModalText}>
              <Text style={{ fontWeight: 'bold' }}>OneSubmissiveAct.com</Text> fue un sitio web de culto en la comunidad BDSM y Kink internacional enfocado en interacciones online sex-positive a distancia.
            </Text>
            <Text style={styles.infoModalText}>
              • <Text style={{ fontWeight: 'bold' }}>Mecánica principal:</Text> Permitía a los Dominantes crear enlaces con tareas/actos de sumisión personalizados o aleatorios y enviárselos a su submisivo/a con temporizador y confirmación.
            </Text>
            <Text style={styles.infoModalText}>
              • <Text style={{ fontWeight: 'bold' }}>Estado actual:</Text> El dominio dejó de funcionar hace varios años. En <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Compatikink</Text> hemos revivido y evolucionado su concepto dentro de este módulo con cifrado local, filtrado de intensidad y registro de rachas.
            </Text>
          </View>
        )}

        {/* Streak Hero Banner */}
        {state && (
          <View style={styles.streakBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>🔥 Racha de Disciplina: {state.streakDays} Días Seguidos</Text>
              <Text style={styles.streakSub}>
                {state.history.length > 0
                  ? `Último acto cumplido: ${new Date(state.history[0].completedAt).toLocaleDateString()}`
                  : 'Completa tu primer acto de la jornada para iniciar tu racha.'}
              </Text>
            </View>
            <View style={styles.badgeBox}>
              <Text style={styles.badgeNumber}>+{currentAct.xpReward} XP</Text>
            </View>
          </View>
        )}

        {/* Interactive Filter Bar */}
        <View style={styles.filtersBox}>
          <Text style={styles.filterTitle}>⚙️ Generador por Intensidad & Equipamiento:</Text>

          {/* Intensity Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {(['Todas', 'Nivel 1 (Sutil)', 'Nivel 2 (Sensorial)', 'Nivel 3 (Avanzado)'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, selectedIntensity === lvl && styles.chipActive]}
                onPress={() => setSelectedIntensity(lvl as any)}
              >
                <Text style={[styles.chipText, selectedIntensity === lvl && styles.chipTextActive]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Gear Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {['Todos', 'Ninguno', 'Cuerda', 'Venda', 'Spanker', 'Collar'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, selectedGear === g && styles.chipActive]}
                onPress={() => setSelectedGear(g)}
              >
                <Text style={[styles.chipText, selectedGear === g && styles.chipTextActive]}>🧰 {g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateRandom}>
            <Text style={styles.generateBtnText}>🎲 Generar Nuevo Acto de Sumisión</Text>
          </TouchableOpacity>
        </View>

        {/* Main Act Card */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {currentAct && (
            <View style={styles.actCard}>
              <View style={styles.actCardHeader}>
                <Text style={styles.actEmoji}>{currentAct.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actCategory}>{currentAct.category.toUpperCase()}</Text>
                  <Text style={styles.actTitle}>{currentAct.title}</Text>
                </View>
              </View>

              <View style={styles.metaBadgesRow}>
                <Text style={styles.metaBadge}>{currentAct.intensity}</Text>
                <Text style={styles.metaBadge}>🧰 {currentAct.requiredGear}</Text>
              </View>

              <Text style={styles.actDesc}>{currentAct.description}</Text>

              {/* Instructions Box */}
              <View style={styles.instructionsGrid}>
                <View style={styles.domBox}>
                  <Text style={styles.roleHeader}>👑 Para el Dominante:</Text>
                  <Text style={styles.roleDesc}>{currentAct.domInstruction}</Text>
                </View>

                <View style={styles.subBox}>
                  <Text style={styles.roleHeader}>🧎 Para el Submisivo:</Text>
                  <Text style={styles.roleDesc}>{currentAct.subInstruction}</Text>
                </View>
              </View>

              {/* Complete Form Box */}
              {isCompleting ? (
                <View style={styles.completionFormBox}>
                  <Text style={styles.formTitle}>📝 Reflexión & Registro Post-Acto</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Escribe una breve reflexión sobre cómo te sentiste..."
                    placeholderTextColor={colors.textDim}
                    multiline
                    value={reflectionNote}
                    onChangeText={setReflectionNote}
                  />

                  <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 4 }}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCompleting(false)}>
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleMarkCompleted}>
                      <Text style={styles.submitBtnText}>Confirmar & Sumar +{currentAct.xpReward} XP ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.completeActionBtn} onPress={() => setIsCompleting(true)}>
                  <Text style={styles.completeActionBtnText}>Marcar Acto como Cumplido (+{currentAct.xpReward} XP) ✓</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* History Section */}
          {state && state.history.length > 0 && (
            <View style={styles.historyBox}>
              <Text style={styles.historyTitle}>📜 Historial de Actos Completados:</Text>
              {state.history.map((log, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.histLogTitle}>✓ {log.title}</Text>
                    <Text style={styles.histLogXp}>+{log.xpReward} XP</Text>
                  </View>
                  <Text style={styles.histLogNote}>"{log.note}"</Text>
                  <Text style={styles.histLogDate}>{new Date(log.completedAt).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: spacing.xs,
  },
  streakTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  streakSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  badgeBox: { backgroundColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 10, paddingVertical: 6 },
  badgeNumber: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },

  filtersBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  filterTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  chipsRow: { flexDirection: 'row', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 10 },
  chipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  generateBtn: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: radii.md, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#fbbf24', marginTop: 4 },
  generateBtnText: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  actCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  actCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actEmoji: { fontSize: 36 },
  actCategory: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  actTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },

  metaBadgesRow: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.textMuted, fontSize: 10 },
  actDesc: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },

  instructionsGrid: { gap: spacing.xs, marginVertical: 4 },
  domBox: { backgroundColor: 'rgba(192, 132, 252, 0.12)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  subBox: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: '#38bdf8' },
  roleHeader: { fontSize: 10, fontWeight: '900', color: colors.textDim },
  roleDesc: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },

  completeActionBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 6 },
  completeActionBtnText: { color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },

  completionFormBox: { backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.primary, gap: spacing.xs, marginTop: 6 },
  formTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  input: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border, minHeight: 50 },
  cancelBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: 11 },
  submitBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 8, alignItems: 'center' },
  submitBtnText: { color: colors.onPrimary, fontSize: 11, fontWeight: '800' },

  historyBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  historyTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  historyCard: { backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.sm, gap: 2 },
  histLogTitle: { color: colors.success, fontSize: fontSize.xs, fontWeight: '800' },
  histLogXp: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },
  histLogNote: { color: colors.textMuted, fontSize: 10, fontStyle: 'italic' },
  histLogDate: { color: colors.textDim, fontSize: 8 },

  historyInfoToggle: { marginTop: 2 },
  infoModalBox: {
    backgroundColor: 'rgba(19, 9, 36, 0.95)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: spacing.xs,
    gap: 6,
  },
  infoModalTitle: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },
  infoModalText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
});
