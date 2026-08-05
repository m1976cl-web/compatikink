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
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  ACTION_PLAN_STEPS,
  SAMPLE_SCENES,
  DAILY_PROTOCOLS,
  BONDAGE_7_DAYS,
  RESOURCE_GUIDE_ITEMS,
  SampleScene,
} from '@/data/quickStartData';

export default function QuickStartBundleScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'action_plan' | 'sample_scenes' | 'daily_schedule' | 'bondage_7days' | 'resources'>('action_plan');
  const [selectedScene, setSelectedScene] = useState<SampleScene | null>(null);
  const [checkedProtocols, setCheckedProtocols] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  const toggleProtocolCheck = (id: string) => {
    setCheckedProtocols((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDayComplete = (day: number) => {
    setCompletedDays((prev) => {
      const updated = { ...prev, [day]: !prev[day] };
      if (updated[day]) {
        Alert.alert('¡Día Completado! 🎉', `Felicidades por avanzar al Día ${day} del Reto Shibari.`);
      }
      return updated;
    });
  };

  return (
    <ScreenContainer title="Kit de Inicio BDSM" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Kit de Inicio BDSM & Guiones 🚀🪢</Text>
          <Text style={styles.subtitle}>
            Inspirado en Dom Sub Living: Guiones paso a paso, plan de acción, rutinas diarias D/s y reto de 7 días
          </Text>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Todo lo que necesitas para comenzar tu viaje Kink</Text>
          <Text style={styles.heroSub}>
            Sin errores de principiante: guiones de muestra probados en la vida real, protocolos de seguridad y hábitos de pareja.
          </Text>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {[
            { key: 'action_plan', label: '🚀 Plan de Acción' },
            { key: 'sample_scenes', label: '🎬 Guiones de Escenas' },
            { key: 'daily_schedule', label: '📅 Rutina Diaria D/s' },
            { key: 'bondage_7days', label: '🪢 Reto 7 Días' },
            { key: 'resources', label: '🧰 Guía de Recursos' },
          ].map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key as any)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* TAB 1: PLAN DE ACCIÓN PASO A PASO */}
          {activeTab === 'action_plan' && (
            <View style={styles.sectionGap}>
              <Text style={styles.sectionTitle}>Plan de Acción de Inicio Rápido (4 Pasos):</Text>

              {ACTION_PLAN_STEPS.map((step) => (
                <View key={step.id} style={styles.cardBox}>
                  <View style={styles.stepHeaderRow}>
                    <View style={styles.stepNumBadge}>
                      <Text style={styles.stepNumText}>PASO {step.stepNumber}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>

                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>

                  <View style={styles.takeawaysBox}>
                    <Text style={styles.takeawaysTitle}>Puntos Clave:</Text>
                    {step.keyTakeaways.map((point, idx) => (
                      <Text key={idx} style={styles.takeawayPoint}>✓ {point}</Text>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setActiveTab('sample_scenes')}
              >
                <Text style={styles.primaryBtnText}>Ver Guiones de Escenas de Muestra 🎬 ➔</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: GUIONES DE ESCENAS DE MUESTRA (SAMPLE SCENES) */}
          {activeTab === 'sample_scenes' && (
            <View style={styles.sectionGap}>
              <Text style={styles.sectionTitle}>Guiones de Escenas Guiadas de Muestra:</Text>

              {selectedScene ? (
                /* Detailed Scene View */
                <View style={styles.cardBox}>
                  <TouchableOpacity onPress={() => setSelectedScene(null)} style={styles.backLink}>
                    <Text style={styles.backLinkText}>← Volver a lista de guiones</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 32 }}>{selectedScene.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sceneTitle}>{selectedScene.title}</Text>
                      <Text style={styles.sceneDyn}>{selectedScene.dynamicType}</Text>
                    </View>
                  </View>

                  <View style={styles.sceneMetaRow}>
                    <Text style={styles.metaBadge}>Dificultad: {selectedScene.difficulty}</Text>
                    <Text style={styles.metaBadge}>Duración: {selectedScene.estimatedDuration}</Text>
                  </View>

                  <Text style={styles.fieldHeader}>🧰 Equipamiento Requerido:</Text>
                  <View style={styles.tagGrid}>
                    {selectedScene.requiredGear.map((g, idx) => (
                      <View key={idx} style={styles.gearChip}>
                        <Text style={styles.gearChipText}>{g}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.fieldHeader}>⚙️ Notas de Preparación:</Text>
                  <Text style={styles.setupNotesText}>{selectedScene.setupNotes}</Text>

                  <Text style={styles.fieldHeader}>🎬 Pasos del Guión de la Escena:</Text>

                  {selectedScene.steps.map((st, idx) => (
                    <View key={idx} style={styles.sceneStepBox}>
                      <Text style={styles.stepPhaseTitle}>{st.phase}</Text>
                      
                      <View style={styles.scriptQuoteDom}>
                        <Text style={styles.quoteRole}>👑 DOM / LÍDER:</Text>
                        <Text style={styles.quoteText}>{st.domScript}</Text>
                      </View>

                      <View style={styles.scriptQuoteSub}>
                        <Text style={styles.quoteRole}>🧎 SUB / SUMISO:</Text>
                        <Text style={styles.quoteText}>{st.subScript}</Text>
                      </View>

                      <Text style={styles.actionDescText}><b>Acción física:</b> {st.actionDescription}</Text>
                    </View>
                  ))}

                  <Text style={styles.fieldHeader}>🪷 Guía de Aftercare Post-Escena:</Text>
                  <Text style={styles.aftercareText}>{selectedScene.aftercareGuide}</Text>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      Alert.alert('¡Escena Iniciada! 🎬', 'Recuerda mantener tijeras cerca y verificar el semáforo verde.');
                      router.push('/calendar');
                    }}
                  >
                    <Text style={styles.primaryBtnText}>Registrar esta Escena en Calendario 📅</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Scene Cards List */
                <View style={{ gap: spacing.md }}>
                  {SAMPLE_SCENES.map((scene) => (
                    <TouchableOpacity
                      key={scene.id}
                      style={styles.sceneCard}
                      onPress={() => setSelectedScene(scene)}
                    >
                      <View style={styles.sceneCardHeader}>
                        <Text style={styles.sceneEmoji}>{scene.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sceneCardTitle}>{scene.title}</Text>
                          <Text style={styles.sceneCardDyn}>{scene.dynamicType}</Text>
                        </View>
                      </View>

                      <View style={styles.sceneMetaRow}>
                        <Text style={styles.metaBadge}>Dificultad: {scene.difficulty}</Text>
                        <Text style={styles.metaBadge}>Duración: {scene.estimatedDuration}</Text>
                      </View>

                      <View style={styles.readScriptBtn}>
                        <Text style={styles.readScriptBtnText}>Leer Guión Completo Paso a Paso ➔</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: RUTINA DIARIA DE PAREJA D/S */}
          {activeTab === 'daily_schedule' && (
            <View style={styles.sectionGap}>
              <Text style={styles.sectionTitle}>Rutina Diaria de Pareja D/s (Schedule & Protocols):</Text>
              <Text style={styles.sectionSub}>
                Inspirado en la agenda personal de parejas Dom/sub para mantener conexión, respeto y hábitos diarios.
              </Text>

              {DAILY_PROTOCOLS.map((proto) => {
                const isChecked = !!checkedProtocols[proto.id];
                return (
                  <TouchableOpacity
                    key={proto.id}
                    style={[styles.protoCard, isChecked && styles.protoCardChecked]}
                    onPress={() => toggleProtocolCheck(proto.id)}
                  >
                    <View style={styles.protoHeader}>
                      <Text style={styles.protoEmoji}>{proto.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.protoTime}>{proto.timeOfDay.toUpperCase()}</Text>
                          <Text style={styles.protoRole}>Responsable: {proto.roleResponsible}</Text>
                        </View>
                        <Text style={styles.protoTitle}>{proto.title}</Text>
                      </View>
                    </View>

                    <Text style={styles.protoDesc}>{proto.description}</Text>

                    <View style={styles.checkStatusRow}>
                      <Text style={[styles.checkStatusText, isChecked && { color: colors.success }]}>
                        {isChecked ? '✓ Protocolo Cumplido Hoy' : '⚪ Tocar para marcar como cumplido'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* TAB 4: RETO DE 7 DÍAS DE SHIBARI */}
          {activeTab === 'bondage_7days' && (
            <View style={styles.sectionGap}>
              <Text style={styles.sectionTitle}>Reto de 7 Días de Shibari & Ataduras Seguras:</Text>
              <Text style={styles.sectionSub}>
                Aprende un nudo y concepto de seguridad cada día de la semana.
              </Text>

              {BONDAGE_7_DAYS.map((day) => {
                const isDone = !!completedDays[day.day];
                return (
                  <View key={day.day} style={[styles.dayCard, isDone && styles.dayCardDone]}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayEmoji}>{day.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dayTitle}>{day.title}</Text>
                        <Text style={styles.knotName}>Nudo clave: {day.knotName}</Text>
                      </View>
                    </View>

                    <Text style={styles.dayObjective}>🎯 Objetivo: {day.objective}</Text>

                    <View style={styles.safetyTipBox}>
                      <Text style={styles.safetyTipText}>🛡️ Tip de Seguridad: {day.safetyTip}</Text>
                    </View>

                    <Text style={styles.fieldHeader}>Instrucciones:</Text>
                    {day.instructions.map((inst, idx) => (
                      <Text key={idx} style={styles.dayInstPoint}>• {inst}</Text>
                    ))}

                    <TouchableOpacity
                      style={[styles.dayCompleteBtn, isDone && styles.dayCompleteBtnDone]}
                      onPress={() => toggleDayComplete(day.day)}
                    >
                      <Text style={[styles.dayCompleteBtnText, isDone && { color: colors.success }]}>
                        {isDone ? '✓ Día Completado' : `Marcar Día ${day.day} como Cumplido ✓`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 5: GUÍA DE RECURSOS BDSM */}
          {activeTab === 'resources' && (
            <View style={styles.sectionGap}>
              <Text style={styles.sectionTitle}>Guía de Recursos & Herramientas Indispensables:</Text>

              {RESOURCE_GUIDE_ITEMS.map((res, idx) => (
                <View key={idx} style={styles.resourceCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 24 }}>{res.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resCategory}>{res.category}</Text>
                      <Text style={styles.resTitle}>{res.title}</Text>
                    </View>
                  </View>

                  <Text style={styles.resDesc}>{res.description}</Text>

                  <View style={styles.resRecBox}>
                    <Text style={styles.resRecText}>💡 Recomendación: {res.recommendation}</Text>
                  </View>
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

  heroBanner: {
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: spacing.xs,
    gap: 4,
  },
  heroTitle: { color: colors.text, fontSize: fontSize.md, fontFamily: fonts.bodySemi, fontWeight: '800' },
  heroSub: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs, paddingBottom: 4 },
  tab: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.accentSoft, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  tabTextActive: { color: colors.primary, fontWeight: '800' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  sectionGap: { gap: spacing.md },
  sectionTitle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  sectionSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: -8 },

  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.xs,
  },

  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepNumBadge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  stepNumText: { color: colors.onPrimary, fontSize: 10, fontWeight: '900' },
  stepTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800', flex: 1 },
  stepSubtitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  stepDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  takeawaysBox: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: radii.md, padding: spacing.sm, marginTop: 4, gap: 2 },
  takeawaysTitle: { color: colors.text, fontSize: 11, fontWeight: '800' },
  takeawayPoint: { color: colors.textMuted, fontSize: 11 },

  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.sm, fontWeight: '800' },

  sceneCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.xs },
  sceneCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sceneEmoji: { fontSize: 32 },
  sceneCardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  sceneCardDyn: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  sceneMetaRow: { flexDirection: 'row', gap: 6, marginVertical: 2 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, color: colors.textMuted, fontSize: 10 },
  readScriptBtn: { backgroundColor: 'rgba(192, 132, 252, 0.15)', borderRadius: radii.md, paddingVertical: 6, alignItems: 'center', marginTop: 4 },
  readScriptBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  backLink: { alignSelf: 'flex-start', marginBottom: 4 },
  backLinkText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  sceneTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  sceneDyn: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  fieldHeader: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800', marginTop: 8 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gearChip: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: '#fbbf24', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  gearChipText: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },
  setupNotesText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
  sceneStepBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.md, padding: spacing.md, marginVertical: 4, gap: 6 },
  stepPhaseTitle: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },
  scriptQuoteDom: { backgroundColor: 'rgba(192, 132, 252, 0.12)', borderRadius: 6, padding: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  scriptQuoteSub: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderRadius: 6, padding: spacing.sm, borderWidth: 1, borderColor: '#38bdf8' },
  quoteRole: { fontSize: 10, fontWeight: '900', color: colors.textDim },
  quoteText: { fontSize: fontSize.xs, color: colors.text, fontStyle: 'italic', marginTop: 2 },
  actionDescText: { fontSize: fontSize.xs, color: colors.textMuted },
  aftercareText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: spacing.md, borderRadius: radii.md },

  protoCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  protoCardChecked: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' },
  protoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protoEmoji: { fontSize: 24 },
  protoTime: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  protoRole: { color: colors.textDim, fontSize: 10 },
  protoTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  protoDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16 },
  checkStatusRow: { marginTop: 4 },
  checkStatusText: { fontSize: 10, color: colors.textDim, fontWeight: '700' },

  dayCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  dayCardDone: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayEmoji: { fontSize: 28 },
  dayTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  knotName: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '700' },
  dayObjective: { color: colors.textMuted, fontSize: fontSize.xs },
  safetyTipBox: { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderRadius: 6, padding: spacing.sm, borderWidth: 1, borderColor: '#fbbf24', marginVertical: 2 },
  safetyTipText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' },
  dayInstPoint: { color: colors.text, fontSize: fontSize.xs, lineHeight: 16 },
  dayCompleteBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingVertical: 6, alignItems: 'center', marginTop: 4 },
  dayCompleteBtnDone: { backgroundColor: 'rgba(74, 222, 128, 0.15)' },
  dayCompleteBtnText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },

  resourceCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, gap: 4 },
  resCategory: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  resTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  resDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  resRecBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: spacing.sm, marginTop: 2 },
  resRecText: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },
});
