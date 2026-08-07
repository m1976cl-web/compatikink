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

import { NerveSafetyCard } from '@/components/shibari/NerveSafetyCard';
import { KnotInstructionStepper } from '@/components/shibari/KnotInstructionStepper';

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

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
  const [favoriteKnots, setFavoriteKnots] = useState<string[]>([]);

  // Tension Safety Timer State
  const [timerSeconds, setTimerSeconds] = useState(10 * 60); // Default 10 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load persistent favorite knots from ZK Vault / AsyncStorage
  useEffect(() => {
    readJsonStorage<string[]>('shibari_favorite_knots_v1', []).then((saved: string[]) => {
      if (Array.isArray(saved)) setFavoriteKnots(saved);
    });
  }, []);

  const toggleFavoriteKnot = async (knotId: string) => {
    const next = favoriteKnots.includes(knotId)
      ? favoriteKnots.filter((id) => id !== knotId)
      : [...favoriteKnots, knotId];
    setFavoriteKnots(next);
    await writeJsonStorage('shibari_favorite_knots_v1', next);
  };

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
                  { key: 'danger', label: '🔴 Peligro Alto' },
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
                <NerveSafetyCard
                  key={zone.id}
                  zone={zone}
                  onSelectZone={setSelectedAnatomyZone}
                />
              ))}
            </View>
          )}

          {/* TAB 2: CATÁLOGO DE NUDOS PASO A PASO */}
          {activeTab === 'knots' && (
            <View style={styles.sectionGap}>
              {!selectedKnot ? (
                <View style={{ gap: spacing.sm }}>
                  {SHIBARI_KNOTS_CATALOG.map((knot) => (
                    <TouchableOpacity
                      key={knot.id}
                      style={styles.knotCard}
                      onPress={() => {
                        setSelectedKnot(knot);
                        setCurrentStepIndex(0);
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.knotName}>{knot.name} ({knot.japaneseName})</Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavoriteKnot(knot.id);
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ fontSize: 16 }}>{favoriteKnots.includes(knot.id) ? '⭐' : '☆'}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.knotDescPreview}>{knot.description}</Text>
                      <Text style={styles.knotStepsBadge}>📖 Ver {knot.steps.length} Pasos ➔</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <KnotInstructionStepper
                  knot={selectedKnot}
                  currentStepIndex={currentStepIndex}
                  onStepChange={setCurrentStepIndex}
                  onBackToCatalog={() => setSelectedKnot(null)}
                />
              )}
            </View>
          )}

          {/* TAB 3: TEMPORIZADOR DE PREVENCIÓN CIRCULATORIA */}
          {activeTab === 'timer' && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerTitle}>⏱️ Reloj de Control de Tensión en Cuerda</Text>
              <Text style={styles.timerSub}>
                Monitorea el tiempo máximo de suspensión o arnés para prevenir entumecimiento.
              </Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDisplay}>{formatTimerTime(timerSeconds)}</Text>
              </View>

              <View style={styles.timerBtnRow}>
                <TouchableOpacity
                  style={[styles.timerControlBtn, isTimerRunning && styles.timerControlBtnPause]}
                  onPress={() => setIsTimerRunning(!isTimerRunning)}
                >
                  <Text style={styles.timerControlBtnText}>
                    {isTimerRunning ? '⏸️ Pausar' : '▶️ Iniciar Timer (10 min)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timerResetBtn}
                  onPress={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(10 * 60);
                  }}
                >
                  <Text style={styles.timerResetBtnText}>🔄 Reiniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
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

  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.sm },
  tab: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabTextActive: { color: colors.onPrimary, fontWeight: '900' },

  scroll: { gap: spacing.md },
  sectionGap: { gap: spacing.sm },

  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { backgroundColor: colors.surface, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.surfaceLight, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 11 },
  chipTextActive: { color: colors.primary, fontWeight: '800' },

  knotCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.border },
  knotName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  knotDescPreview: { color: colors.textMuted, fontSize: fontSize.xs },
  knotStepsBadge: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },

  timerContainer: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.primary },
  timerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  timerSub: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  timerBox: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radii.xl, paddingHorizontal: 32, paddingVertical: 20, borderWidth: 2, borderColor: colors.primary },
  timerDisplay: { fontSize: 48, fontWeight: '900', color: colors.text },
  timerBtnRow: { flexDirection: 'row', gap: spacing.md },
  timerControlBtn: { backgroundColor: colors.primary, borderRadius: radii.lg, paddingHorizontal: 20, paddingVertical: 12 },
  timerControlBtnPause: { backgroundColor: '#fbbf24' },
  timerControlBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: '900' },
  timerResetBtn: { backgroundColor: colors.surfaceLight, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  timerResetBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
});
