import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { Activity, ActivityResponse, Rating, RolePreference, CATEGORY_LABELS } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  activities: Activity[];
  responses: Record<string, ActivityResponse>;
  onResponseChange: (activityId: string, response: ActivityResponse) => void;
  onFinish: () => void;
  onSwitchToForm?: () => void;
}

const RATING_ACTIONS: { rating: Rating; emoji: string; label: string; color: string }[] = [
  { rating: 'hard_limit', emoji: '🚫', label: 'Límite Duro', color: '#f87171' },
  { rating: 'not_interested', emoji: '😐', label: 'No me interesa', color: '#94a3b8' },
  { rating: 'curious', emoji: '🤔', label: 'Curiosidad', color: '#fbbf24' },
  { rating: 'like', emoji: '😊', label: 'Me gusta', color: '#60a5fa' },
  { rating: 'love', emoji: '🔥', label: 'Me encanta', color: '#c084fc' },
];

const ROLE_OPTIONS: { label: string; value: RolePreference }[] = [
  { label: 'Dar / Dom', value: 'give' },
  { label: 'Recibir / Sub', value: 'receive' },
  { label: 'Ambos', value: 'both' },
  { label: 'Flexible', value: 'flexible' },
];

export function SwipeDeckView({
  activities,
  responses,
  onResponseChange,
  onFinish,
  onSwitchToForm,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentActivity = activities[currentIndex];
  const isLast = currentIndex === activities.length - 1;
  const progress = (currentIndex + 1) / Math.max(1, activities.length);

  const currentResponse: ActivityResponse = responses[currentActivity?.id] ?? {
    activityId: currentActivity?.id ?? '',
    rating: 'not_interested',
    role: 'flexible',
    intensity: 3,
  };

  const handleRatingSelect = (rating: Rating) => {
    if (!currentActivity) return;

    // Animate card swipe
    const toX = rating === 'hard_limit' || rating === 'not_interested' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      onResponseChange(currentActivity.id, {
        ...currentResponse,
        rating,
      });

      position.setValue({ x: 0, y: 0 });

      if (isLast) {
        onFinish();
      } else {
        setCurrentIndex((i) => i + 1);
      }
    });
  };

  const handleRoleSelect = (role: RolePreference) => {
    if (!currentActivity) return;
    onResponseChange(currentActivity.id, {
      ...currentResponse,
      role,
    });
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      position.setValue({ x: 0, y: 0 });
    }
  };

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

  const isPositiveRating =
    currentResponse.rating === 'curious' ||
    currentResponse.rating === 'like' ||
    currentResponse.rating === 'love';

  return (
    <View style={styles.container}>
      {/* Top Bar / Mode Switcher */}
      <View style={styles.topBar}>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>
            Carta {currentIndex + 1} de {activities.length}
          </Text>
        </View>

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

      {/* Main Swipeable Card */}
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, position.getLayout()]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {CATEGORY_LABELS[currentActivity.category]}
            </Text>
          </View>

          <Text style={styles.activityName}>{currentActivity.name}</Text>
          <Text style={styles.activityDesc}>{currentActivity.description}</Text>

          {/* Quick Role Selection if rated positive */}
          {isPositiveRating ? (
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Tu rol preferido:</Text>
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
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </Animated.View>
      </View>

      {/* Action Buttons Row (Rating Options) */}
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
          <Text style={styles.undoBtnText}>↩️ Anterior</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity style={styles.finishNavBtn} onPress={onFinish}>
            <Text style={styles.finishNavBtnText}>Finalizar 🚀</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => setCurrentIndex((i) => i + 1)}
          >
            <Text style={styles.skipBtnText}>Saltar →</Text>
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
});
