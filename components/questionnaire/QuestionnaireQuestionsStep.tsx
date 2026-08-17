import React, { useState, useMemo, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { RatingPicker } from '@/components/RatingPicker';
import { RolePicker } from '@/components/RolePicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { ProgressBar, ProgressLabel } from '@/components/ProgressBar';
import { SwipeDeckView } from '@/components/SwipeDeckView';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ActivityCategory, DifficultyLevel, Rating, Activity } from '@/types';
import { getCategoryLabel, getActivityName, getActivityDescription } from '@/data/activities';
import { writeJsonStorage } from '@/lib/cryptoVault';

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

  if (viewMode === 'swipe') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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

          <ProgressBar progress={q.progress} />
          <ProgressLabel current={q.currentIndex + 1} total={q.total} />

          <Text style={styles.category}>{getCategoryLabel(q.currentActivity.category)}</Text>
          <Text style={styles.activityName}>{getActivityName(q.currentActivity)}</Text>
          <Text style={styles.description}>{getActivityDescription(q.currentActivity)}</Text>

          <Text style={styles.sectionLabel}>¿Qué te parece?</Text>
          <RatingPicker value={q.currentResponse.rating} onChange={handleRatingSelect} />

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
