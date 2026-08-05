import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  ANATOMY_SAFETY_ZONES,
  SHIBARI_KNOTS_CATALOG,
  AnatomyZone,
  ShibariKnot,
  RiskLevel,
} from '@/data/shibariData';

export default function ShibariGuideScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'map' | 'knots' | 'timer'>('map');

  // Anatomy Filter
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [selectedAnatomyZone, setSelectedAnatomyZone] = useState<AnatomyZone | null>(null);

  // Knot Library Stepper State
  const [selectedKnot, setSelectedKnot] = useState<ShibariKnot | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Tension Safety Timer State
  const [timerSeconds, setTimerSeconds] = useState(10 * 60); // Default 10 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      Alert.alert(
        '🚨 ¡TIEMPO DE ALERTA DE TENSIÓN!',
        'Han transcurrido 10 minutos de atadura. Revisa la temperatura de la piel, pulso en extremidades o procede a desatar.'
      );
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const filteredZones = ANATOMY_SAFETY_ZONES.filter((z) => {
    if (selectedRiskFilter === 'all') return true;
    return z.zoneType === selectedRiskFilter;
  });

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer title="Guía de Shibari & Seguridad" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Guía Interactiva & Mapa de Shibari 🪢🩸</Text>
          <Text style={styles.subtitle}>
            Instrucciones paso a paso, mapa anatómico de nervios/arterias y temporizador de prevención circulatoria
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'map' && styles.tabActive]}
            onPress={() => setActiveTab('map')}
          >
            <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>🗺️ Mapa Anatómico</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'knots' && styles.tabActive]}
            onPress={() => setActiveTab('knots')}
          >
            <Text style={[styles.tabText, activeTab === 'knots' && styles.tabTextActive]}>🪢 Nudos Paso a Paso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'timer' && styles.tabActive]}
            onPress={() => setActiveTab('timer')}
          >
            <Text style={[styles.tabText, activeTab === 'timer' && styles.tabTextActive]}>⏱️ Temporizador Seguro</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* TAB 1: MAPA ANATÓMICO DE SEGURIDAD & NERVIOS */}
          {activeTab === 'map' && (
            <View style={styles.sectionGap}>
              {/* Risk Filter Chips */}
              <View style={styles.filterChipsRow}>
                {[
                  { key: 'all', label: 'Todas las Zonas' },
                  { key: 'danger', label: '🔴 Peligro Alto (Nervios/Arterias)' },
                  { key: 'caution', label: '🟡 Precaución' },
                  { key: 'safe', label: '🟢 Zonas Seguras' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.chip, selectedRiskFilter === f.key && styles.chipActive]}
                    onPress={() => setSelectedRiskFilter(f.key as any)}
                  >
                    <Text style={[styles.chipText, selectedRiskFilter === f.key && styles.chipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Zones Cards */}
              {filteredZones.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  style={[
                    styles.zoneCard,
                    zone.zoneType === 'danger' && styles.zoneCardDanger,
                    zone.zoneType === 'caution' && styles.zoneCardCaution,
                    zone.zoneType === 'safe' && styles.zoneCardSafe,
                  ]}
                  onPress={() => setSelectedAnatomyZone(zone)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 24 }}>{zone.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.zonePartTitle}>{zone.bodyPart}</Text>
                      <Text style={styles.zoneNerveName}>{zone.nerveOrVessel}</Text>
                    </View>
                  </View>

                  <Text style={styles.zoneDesc}>{zone.description}</Text>

                  <View style={styles.precautionBox}>
                    <Text style={styles.precautionText}>🛡️ Medida de Seguridad: {zone.precaution}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB 2: BIBLIOTECA DE NUDOS PASO A PASO */}
          {activeTab === 'knots' && (
            <View style={styles.sectionGap}>
              {selectedKnot ? (
                /* Knot Interactive Stepper View */
                <View style={styles.cardBox}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedKnot(null);
                      setCurrentStepIndex(0);
                    }}
                    style={styles.backLink}
                  >
                    <Text style={styles.backLinkText}>← Volver al catálogo de nudos</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 36 }}>{selectedKnot.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.knotTitle}>{selectedKnot.name}</Text>
                      <Text style={styles.knotJap}>{selectedKnot.japaneseName}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaBadge}>Dificultad: {selectedKnot.difficulty}</Text>
                    <Text style={styles.metaBadge}>Cuerda: {selectedKnot.recommendedRope}</Text>
                  </View>

                  {/* Anatomical Warnings Box */}
                  <View style={styles.warningBox}>
                    <Text style={styles.warningTitle}>🔴 Advertencias Anatómicas:</Text>
                    {selectedKnot.anatomicalWarnings.map((w, idx) => (
                      <Text key={idx} style={styles.warningItem}>• {w}</Text>
                    ))}
                  </View>

                  {/* STEPPER CONTAINER */}
                  <View style={styles.stepperBox}>
                    <View style={styles.stepperHeader}>
                      <Text style={styles.stepNumTitle}>
                        PASO {currentStepIndex + 1} DE {selectedKnot.steps.length}
                      </Text>
                      <Text style={styles.stepTitleText}>
                        {selectedKnot.steps[currentStepIndex].title}
                      </Text>
                    </View>

                    <Text style={styles.stepInstructionText}>
                      {selectedKnot.steps[currentStepIndex].instruction}
                    </Text>

                    {selectedKnot.steps[currentStepIndex].tip && (
                      <View style={styles.tipBox}>
                        <Text style={styles.tipText}>💡 Consejo Rigger: {selectedKnot.steps[currentStepIndex].tip}</Text>
                      </View>
                    )}

                    {selectedKnot.steps[currentStepIndex].safetyCheck && (
                      <View style={styles.safetyBox}>
                        <Text style={styles.safetyCheckText}>
                          🛡️ Verificación de Seguridad: {selectedKnot.steps[currentStepIndex].safetyCheck}
                        </Text>
                      </View>
                    )}

                    {/* Stepper Navigation Buttons */}
                    <View style={styles.stepperControlsRow}>
                      <TouchableOpacity
                        style={[styles.stepNavBtn, currentStepIndex === 0 && styles.btnDisabled]}
                        disabled={currentStepIndex === 0}
                        onPress={() => setCurrentStepIndex((prev) => prev - 1)}
                      >
                        <Text style={styles.stepNavBtnText}>← Paso Anterior</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.stepNavBtn,
                          styles.stepNavBtnPrimary,
                          currentStepIndex === selectedKnot.steps.length - 1 && styles.btnDisabled,
                        ]}
                        disabled={currentStepIndex === selectedKnot.steps.length - 1}
                        onPress={() => setCurrentStepIndex((prev) => prev + 1)}
                      >
                        <Text style={styles.stepNavBtnTextPrimary}>Paso Siguiente ➔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                /* Knot Catalog Cards */
                <View style={{ gap: spacing.md }}>
                  {SHIBARI_KNOTS_CATALOG.map((knot) => (
                    <TouchableOpacity
                      key={knot.id}
                      style={styles.knotCard}
                      onPress={() => {
                        setSelectedKnot(knot);
                        setCurrentStepIndex(0);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 32 }}>{knot.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.knotCardTitle}>{knot.name}</Text>
                          <Text style={styles.knotCardJap}>{knot.japaneseName}</Text>
                        </View>
                      </View>

                      <Text style={styles.knotCardDesc}>{knot.description}</Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaBadge}>Dificultad: {knot.difficulty}</Text>
                        <Text style={styles.metaBadge}>Pasos: {knot.steps.length}</Text>
                      </View>

                      <View style={styles.startBtn}>
                        <Text style={styles.startBtnText}>Iniciar Guía Paso a Paso ➔</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: TEMPORIZADOR DE TENSIÓN SEGURA */}
          {activeTab === 'timer' && (
            <View style={styles.sectionGap}>
              <View style={styles.cardBox}>
                <Text style={styles.cardBoxTitle}>⏱️ Temporizador de Tensión Segura & Alerta de Circulación</Text>
                <Text style={styles.timerDesc}>
                  Configura una alerta durante la escena de ataduras para hacer check-in de temperatura en las manos/pies y verificar el estado del modelo.
                </Text>

                {/* Big Timer Display */}
                <View style={styles.timerDisplayBox}>
                  <Text style={styles.timerText}>{formatTimerTime(timerSeconds)}</Text>
                  <Text style={styles.timerStateLabel}>
                    {isTimerRunning ? '🟢 Temporizador de Escena Activo' : '⏸️ Temporizador Pausado'}
                  </Text>
                </View>

                {/* Preset Time Buttons */}
                <View style={styles.presetButtonsRow}>
                  {[
                    { label: '5 min', secs: 5 * 60 },
                    { label: '10 min', secs: 10 * 60 },
                    { label: '15 min', secs: 15 * 60 },
                  ].map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.presetBtn}
                      onPress={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(p.secs);
                      }}
                    >
                      <Text style={styles.presetBtnText}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Play / Stop Control */}
                <TouchableOpacity
                  style={[styles.primaryBtn, isTimerRunning && { backgroundColor: colors.error }]}
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                >
                  <Text style={styles.primaryBtnText}>
                    {isTimerRunning ? 'Pausar Temporizador ⏸️' : 'Iniciar Temporizador de Escena 🚀'}
                  </Text>
                </TouchableOpacity>
              </View>
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

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.xs + 2, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accentSoft, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  tabTextActive: { color: colors.primary, fontWeight: '800' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  sectionGap: { gap: spacing.md },

  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 10 },
  chipTextActive: { color: colors.onPrimary, fontWeight: '800' },

  zoneCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  zoneCardDanger: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  zoneCardCaution: { borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)' },
  zoneCardSafe: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' },
  zonePartTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  zoneNerveName: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  zoneDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  precautionBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: spacing.xs, marginTop: 2 },
  precautionText: { color: colors.textDim, fontSize: 10, fontWeight: '700' },

  cardBox: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  cardBoxTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  backLink: { alignSelf: 'flex-start', marginBottom: 4 },
  backLinkText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },

  knotTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  knotJap: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.textMuted, fontSize: 10 },

  warningBox: { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.error, marginVertical: 2 },
  warningTitle: { color: colors.error, fontSize: 10, fontWeight: '900' },
  warningItem: { color: colors.text, fontSize: 10 },

  stepperBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.primary, marginTop: 4, gap: spacing.xs },
  stepperHeader: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, paddingBottom: 6 },
  stepNumTitle: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  stepTitleText: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  stepInstructionText: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
  tipBox: { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderRadius: 6, padding: spacing.xs, borderWidth: 1, borderColor: '#fbbf24' },
  tipText: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },
  safetyBox: { backgroundColor: 'rgba(74, 222, 128, 0.12)', borderRadius: 6, padding: spacing.xs, borderWidth: 1, borderColor: colors.success },
  safetyCheckText: { color: colors.success, fontSize: 10, fontWeight: '800' },

  stepperControlsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  stepNavBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  stepNavBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnDisabled: { opacity: 0.4 },
  stepNavBtnText: { color: colors.textMuted, fontSize: 11 },
  stepNavBtnTextPrimary: { color: colors.onPrimary, fontSize: 11, fontWeight: '800' },

  knotCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  knotCardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  knotCardJap: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  knotCardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  startBtn: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: radii.md, paddingVertical: 6, alignItems: 'center', marginTop: 4 },
  startBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  timerDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  timerDisplayBox: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.primary, marginVertical: spacing.sm },
  timerText: { fontSize: 48, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  timerStateLabel: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },
  presetButtonsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  presetBtn: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingVertical: 8, alignItems: 'center' },
  presetBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },
});
