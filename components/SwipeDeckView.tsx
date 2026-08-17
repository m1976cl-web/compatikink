import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { Activity, ActivityResponse, Rating, RolePreference } from '@/types';
import { getActivityName, getActivityDescription, getCategoryLabel } from '@/data/activities';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '@/lib/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  activities: Activity[];
  responses: Record<string, ActivityResponse>;
  onResponseChange: (activityId: string, response: ActivityResponse) => void;
  onFinish: () => void;
  onSwitchToForm?: () => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

const RATING_ACTIONS: { rating: Rating; emoji: string; label: string; color: string; keyHint: string }[] = [
  { rating: 'hard_limit', emoji: '🚫', label: 'Límite Duro', color: '#f87171', keyHint: 'Shift+1' },
  { rating: 'not_interested', emoji: '😐', label: 'No me interesa', color: '#94a3b8', keyHint: '1' },
  { rating: 'curious', emoji: '🤔', label: 'Curiosidad', color: '#fbbf24', keyHint: '2' },
  { rating: 'like', emoji: '😊', label: 'Me gusta', color: '#60a5fa', keyHint: '3' },
  { rating: 'love', emoji: '🔥', label: 'Me encanta', color: '#c084fc', keyHint: '4' },
];

const ROLE_OPTIONS: { label: string; value: RolePreference; icon: string }[] = [
  { label: 'Dar / Dom', value: 'give', icon: '🤲' },
  { label: 'Recibir / Sub', value: 'receive', icon: '🫴' },
  { label: 'Ambos', value: 'both', icon: '🔄' },
  { label: 'Flexible', value: 'flexible', icon: '⚡' },
];

export function SwipeDeckView({
  activities,
  responses,
  onResponseChange,
  onFinish,
  onSwitchToForm,
  currentIndex: externalIndex,
  onIndexChange,
}: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentIndex = externalIndex ?? internalIndex;
  const currentActivity = activities[currentIndex];
  const isLast = currentIndex === activities.length - 1;
  const progress = (currentIndex + 1) / Math.max(1, activities.length);

  const currentResponse: ActivityResponse = responses[currentActivity?.id] ?? {
    activityId: currentActivity?.id ?? '',
    rating: 'not_interested',
    role: 'flexible',
    intensity: 3,
  };

  // Live summary stats counted in real time
  const stats = React.useMemo(() => {
    let hardLimits = 0;
    let curious = 0;
    let likes = 0;
    let loves = 0;
    Object.values(responses).forEach((r) => {
      if (r.rating === 'hard_limit') hardLimits++;
      else if (r.rating === 'curious') curious++;
      else if (r.rating === 'like') likes++;
      else if (r.rating === 'love') loves++;
    });
    return { hardLimits, curious, likes, loves };
  }, [responses]);

  // Unique categories present in activity set
  const uniqueCategories = React.useMemo(() => {
    const list: string[] = [];
    activities.forEach((a) => {
      if (!list.includes(a.category)) list.push(a.category);
    });
    return list;
  }, [activities]);

  const jumpToCategory = (cat: string) => {
    const targetIdx = activities.findIndex((a) => a.category === cat);
    if (targetIdx !== -1) {
      triggerMediumHaptic();
      if (onIndexChange) {
        onIndexChange(targetIdx);
      } else {
        setInternalIndex(targetIdx);
      }
      position.setValue({ x: 0, y: 0 });
    }
  };

  const setNextIndex = () => {
    if (onIndexChange) {
      onIndexChange(currentIndex + 1);
    } else {
      setInternalIndex((i) => i + 1);
    }
  };

  const setPrevIndex = () => {
    if (onIndexChange) {
      onIndexChange(currentIndex - 1);
    } else {
      setInternalIndex((i) => i - 1);
    }
  };

  const handleRatingSelect = (rating: Rating) => {
    if (!currentActivity) return;
    triggerLightHaptic();

    // Fast 120ms spring card swipe
    const toX = rating === 'hard_limit' || rating === 'not_interested' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 120,
      useNativeDriver: false,
    }).start(() => {
      onResponseChange(currentActivity.id, {
        ...currentResponse,
        rating,
      });

      position.setValue({ x: 0, y: 0 });

      if (isLast) {
        triggerSuccessHaptic();
        onFinish();
      } else {
        setNextIndex();
      }
    });
  };

  const handleRoleSelect = (role: RolePreference) => {
    if (!currentActivity) return;
    triggerMediumHaptic();
    onResponseChange(currentActivity.id, {
      ...currentResponse,
      role,
    });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setPrevIndex();
      position.setValue({ x: 0, y: 0 });
    }
  };

  // Desktop Global Keyboard Shortcuts Effect
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const key = e.key;

      if (key === '1') {
        if (e.shiftKey) {
          handleRatingSelect('hard_limit');
        } else {
          handleRatingSelect('not_interested');
        }
      } else if (key === '2') {
        handleRatingSelect('curious');
      } else if (key === '3') {
        handleRatingSelect('like');
      } else if (key === '4') {
        handleRatingSelect('love');
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        handleUndo();
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (!isLast) setNextIndex();
      } else if (key === 'r' || key === 'R') {
        const order: RolePreference[] = ['give', 'receive', 'both', 'flexible'];
        const nextRole = order[(order.indexOf(currentResponse.role) + 1) % order.length];
        handleRoleSelect(nextRole);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentActivity, currentResponse, isLast]);

  if (!currentActivity) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>¡Has completado todas las cartas! 🎉</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
          <Text style={styles.finishBtnText}>Finalizar y Guardar 🚀</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar / Mode Switcher */}
      <View style={styles.topBar}>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>
            Carta {currentIndex + 1} de {activities.length}
          </Text>
        </View>

        {Platform.OS === 'web' ? (
          <View style={styles.desktopHelperBadge}>
            <Text style={styles.desktopHelperText}>⌨️ Teclado: [1..4] Calificar · [R] Rol · [←/→] Navegar</Text>
          </View>
        ) : null}

        {onSwitchToForm ? (
          <TouchableOpacity onPress={onSwitchToForm} style={styles.modeSwitchBtn}>
            <Text style={styles.modeSwitchText}>📋 Modo Lista</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Live Rating Stats Summary Bar */}
      <View style={styles.statsSummaryBar}>
        <View style={[styles.statPill, { borderColor: '#f87171' }]}>
          <Text style={[styles.statPillText, { color: '#f87171' }]}>🚫 {stats.hardLimits}</Text>
        </View>
        <View style={[styles.statPill, { borderColor: '#fbbf24' }]}>
          <Text style={[styles.statPillText, { color: '#fbbf24' }]}>🤔 {stats.curious}</Text>
        </View>
        <View style={[styles.statPill, { borderColor: '#60a5fa' }]}>
          <Text style={[styles.statPillText, { color: '#60a5fa' }]}>👍 {stats.likes}</Text>
        </View>
        <View style={[styles.statPill, { borderColor: '#c084fc' }]}>
          <Text style={[styles.statPillText, { color: '#c084fc' }]}>🔥 {stats.loves}</Text>
        </View>
      </View>

      {/* Quick Category Jump Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryJumpBar}
      >
        {uniqueCategories.map((cat) => {
          const isActive = currentActivity?.category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryJumpChip, isActive && styles.categoryJumpChipActive]}
              onPress={() => jumpToCategory(cat)}
            >
              <Text style={[styles.categoryJumpText, isActive && styles.categoryJumpTextActive]}>
                {getCategoryLabel(cat as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Swipeable Card */}
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, position.getLayout()]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategoryLabel(currentActivity.category)}
            </Text>
          </View>

          <Text style={styles.activityName}>{getActivityName(currentActivity)}</Text>
          <Text style={styles.activityDesc}>{getActivityDescription(currentActivity)}</Text>

          {/* FetLife Style Always-On Role Selector */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>🎭 Rol preferido para esta actividad (FetLife Style):</Text>
            <View style={styles.roleGrid}>
              {ROLE_OPTIONS.map((r) => {
                const active = currentResponse.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleChip, active && styles.roleChipActive]}
                    onPress={() => handleRoleSelect(r.value)}
                  >
                    <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                      {r.icon} {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons Row (Rating Options with Desktop Key Badges) */}
      <View style={styles.actionsGrid}>
        {RATING_ACTIONS.map((act) => {
          const selected = currentResponse.rating === act.rating;
          return (
            <TouchableOpacity
              key={act.rating}
              style={[
                styles.actionBtn,
                selected && { borderColor: act.color, backgroundColor: `${act.color}18` },
              ]}
              onPress={() => handleRatingSelect(act.rating)}
            >
              {Platform.OS === 'web' ? (
                <View style={styles.keyHintTag}>
                  <Text style={styles.keyHintTagText}>{act.keyHint}</Text>
                </View>
              ) : null}
              <Text style={styles.actionEmoji}>{act.emoji}</Text>
              <Text style={[styles.actionLabel, selected && { color: act.color, fontWeight: '700' }]}>
                {act.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Navigation */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.undoBtn, currentIndex === 0 && styles.undoBtnDisabled]}
          onPress={handleUndo}
          disabled={currentIndex === 0}
        >
          <Text style={styles.undoBtnText}>
            ↩️ Anterior {Platform.OS === 'web' ? '[←]' : ''}
          </Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity style={styles.finishNavBtn} onPress={onFinish}>
            <Text style={styles.finishNavBtnText}>Finalizar 🚀</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={setNextIndex}
          >
            <Text style={styles.skipBtnText}>
              Saltar → {Platform.OS === 'web' ? '[→]' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: 'space-between',
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  desktopHelperBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  desktopHelperText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: fonts.bodySemi,
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeCount: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  badgeCountText: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  modeSwitchBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeSwitchText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.neonPurple,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    gap: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  categoryBadgeText: {
    color: colors.neonPurple,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityName: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '900',
    lineHeight: 32,
  },
  activityDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  roleSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  roleChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  roleChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  roleChipTextActive: {
    color: colors.neonPurple,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    minWidth: '18%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  keyHintTag: {
    position: 'absolute',
    top: 3,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  keyHintTagText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  actionEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  actionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  undoBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  undoBtnDisabled: {
    opacity: 0.3,
  },
  undoBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  skipBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  finishNavBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
  },
  finishNavBtnText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  finishBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
  },
  finishBtnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  statsSummaryBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  statPill: {
    backgroundColor: 'rgba(10, 7, 18, 0.6)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statPillText: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  categoryJumpBar: {
    paddingHorizontal: spacing.xs,
    gap: 6,
    paddingVertical: 4,
  },
  categoryJumpChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryJumpChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.neonPurple,
  },
  categoryJumpText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodySemi,
  },
  categoryJumpTextActive: {
    color: colors.neonPurple,
    fontFamily: fonts.bodyBold,
  },
});
