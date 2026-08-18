import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { RatingPicker } from '@/components/RatingPicker';
import { RolePicker } from '@/components/RolePicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { ProgressBar, ProgressLabel } from '@/components/ProgressBar';
import { QuestionnaireProgressBar } from '@/components/QuestionnaireProgressBar';
import { FlowBar } from '@/components/FlowBar';
import { SwipeDeckView } from '@/components/SwipeDeckView';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ActivityCategory, DifficultyLevel, Rating, Activity } from '@/types';
import { getCategoryLabel, getActivityName, getActivityDescription } from '@/data/activities';
import { writeJsonStorage } from '@/lib/cryptoVault';
import { generateDemoResponses } from '@/lib/demoMode';

export const EXPRESS_ACTIVITY_IDS = [
  'pe_d/s_dynamic',
  'pe_orgasm_control',
  'bo_rope',
  'bo_blindfold',
  'im_spanking',
  'se_wax',
  'se_ice',
  'rp_doctor',
  'pe_praise',
  'ls_checkin',
];

const STORAGE_KEY_EXPRESS_DRAFT = 'express_questionnaire_progress_v1';

export interface QuestionnaireQuestionsStepProps {
  nickname: string;
  enabledCategories: ActivityCategory[];
  customActivities: Activity[];
  difficultyFilter: DifficultyLevel | 'all';
  searchQuery: string;
  isExpressMode?: boolean;
  demoMode?: boolean;
  onFinish: (responses: any[]) => void;
  loading: boolean;
  onBack: () => void;
}

export function QuestionnaireQuestionsStep({
  nickname,
  enabledCategories,
  customActivities,
  difficultyFilter,
  searchQuery,
  isExpressMode,
  demoMode,
  onFinish,
  loading,
  onBack,
}: QuestionnaireQuestionsStepProps) {
  const q = useQuestionnaire(undefined, enabledCategories, customActivities, difficultyFilter, searchQuery);
  const [fastMode, setFastMode] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');

  // Express Mode Activity Filtering
  const activeActivities = useMemo(() => {
    if (!isExpressMode) return q.activities;
    return q.activities.filter((a) => EXPRESS_ACTIVITY_IDS.includes(a.id));
  }, [q.activities, isExpressMode]);

  // Demo Mode Auto-Fill
  useEffect(() => {
    if (demoMode && activeActivities.length > 0) {
      const demoResponses = generateDemoResponses(activeActivities);
      onFinish(demoResponses);
    }
  }, [demoMode, activeActivities]);

  // Auto-Save Draft Progress to ZK Storage
  useEffect(() => {
    if (q.responses && Object.keys(q.responses).length > 0) {
      writeJsonStorage(STORAGE_KEY_EXPRESS_DRAFT, {
        responses: q.responses,
        currentIndex: q.currentIndex,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }, [q.responses, q.currentIndex]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevIndex = useRef(q.currentIndex);

  useEffect(() => {
    if (q.currentIndex !== prevIndex.current) {
      const isNext = q.currentIndex > prevIndex.current;
      slideAnim.setValue(isNext ? 100 : -100);
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();

      prevIndex.current = q.currentIndex;
    } else {
      slideAnim.setValue(0);
    }
  }, [q.currentIndex, slideAnim]);

  if (viewMode === 'swipe') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.flowPad}>
          <FlowBar step={1} />
        </View>
        <SwipeDeckView
          activities={activeActivities}
          responses={q.responses}
          currentIndex={q.currentIndex}
          onIndexChange={(idx) => q.goTo(idx)}
          onResponseChange={(actId, resp) => {
            q.setResponseForActivity(actId, resp);
          }}
          onFinish={() => onFinish(q.finalResponses)}
          onSwitchToForm={() => setViewMode('list')}
        />
      </SafeAreaView>
    );
  }

  const handleRatingSelect = (rating: Rating) => {
    q.setRating(rating);

    bounceAnim.setValue(0.9);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    if (fastMode) {
      if (rating === 'hard_limit' || rating === 'not_interested' || !showDetails) {
        if (rating !== 'hard_limit' && rating !== 'not_interested') {
          q.setRole('flexible');
          q.setIntensity(3);
        }
        
        setTimeout(() => {
          if (!q.isLast) {
            q.goNext();
          }
        }, 120);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <FlowBar step={1} />
          {/* Top Control Bar */}
          <View style={styles.controlHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Salir</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setViewMode('swipe')} style={styles.modeSwitchBtn}>
              <Text style={styles.modeSwitchText}>🃏 Modo Tarjetas</Text>
            </TouchableOpacity>

            <View style={styles.fastModeContainer}>
              <Text style={styles.fastModeLabel}>Modo Rápido ⚡</Text>
              <Switch
                value={fastMode}
                onValueChange={setFastMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          <QuestionnaireProgressBar
            current={q.currentIndex + 1}
            total={q.total}
            category={q.currentActivity.category}
            showTimeEstimate
          />

          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            <Text style={styles.activityName}>{getActivityName(q.currentActivity)}</Text>
            <Text style={styles.description}>{getActivityDescription(q.currentActivity)}</Text>
          </Animated.View>

          <Text style={styles.sectionLabel}>¿Qué te parece?</Text>
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <RatingPicker value={q.currentResponse.rating} onChange={handleRatingSelect} />
          </Animated.View>

          {/* Details toggle for positive rating responses in fast mode */}
          {q.currentResponse.rating !== 'hard_limit' &&
          q.currentResponse.rating !== 'not_interested' ? (
            <View style={styles.detailsSection}>
              {!showDetails && fastMode ? (
                <TouchableOpacity 
                  style={styles.detailsToggle} 
                  onPress={() => setShowDetails(true)}
                >
                  <Text style={styles.detailsToggleText}>⚙️ Personalizar Rol e Intensidad</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={[styles.sectionLabel, styles.sectionGap]}>Rol preferido</Text>
                  <RolePicker value={q.currentResponse.role} onChange={q.setRole} />

                  <Text style={[styles.sectionLabel, styles.sectionGap]}>Intensidad</Text>
                  <IntensityPicker
                    value={q.currentResponse.intensity}
                    onChange={q.setIntensity}
                  />
                </>
              )}
            </View>
          ) : null}

          {/* Navigation Controls */}
          <View style={styles.navRow}>
            <Button
              title="Anterior"
              variant="ghost"
              onPress={q.goPrev}
              disabled={q.isFirst}
            />
            {q.isLast ? (
              <Button
                title={loading ? 'Guardando...' : 'Generar Sesión e Invitar'}
                onPress={() => onFinish(q.finalResponses)}
                disabled={loading}
              />
            ) : (
              <Button title="Siguiente" onPress={q.goNext} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flowPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backLink: {
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  modeSwitchBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  modeSwitchText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  fastModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fastModeLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  category: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  activityName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  sectionLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  sectionGap: {
    marginTop: spacing.md,
  },
  detailsSection: {
    marginTop: spacing.sm,
  },
  detailsToggle: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  detailsToggleText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
