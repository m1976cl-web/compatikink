import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { FlowBar } from '@/components/FlowBar';
import { ActivityTooltipModal } from '@/components/ActivityTooltipModal';
import { CustomActivityModal } from '@/components/CustomActivityModal';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  DIFFICULTY_LABELS,
  ActivityCategory,
  DifficultyLevel,
  Activity,
  ActivityMood,
  MOOD_LABELS,
} from '@/types';
import { CATEGORY_ORDER, getAllActivities, getCategoryLabel } from '@/data/activities';

export interface QuestionnaireCategoryStepProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  difficultyFilter: DifficultyLevel | 'all';
  setDifficultyFilter: (val: DifficultyLevel | 'all') => void;
  enabledCategories: ActivityCategory[];
  toggleCategory: (cat: ActivityCategory) => void;
  toggleCategoriesByMood: (mood: ActivityMood) => void;
  customActivities: Activity[];
  setCustomActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  selectedQuestionsCount: number;
  onStartQuestions: () => void;
  onBack: () => void;
}

export function QuestionnaireCategoryStep({
  searchQuery,
  setSearchQuery,
  difficultyFilter,
  setDifficultyFilter,
  enabledCategories,
  toggleCategory,
  toggleCategoriesByMood,
  customActivities,
  setCustomActivities,
  selectedQuestionsCount,
  onStartQuestions,
  onBack,
}: QuestionnaireCategoryStepProps) {
  const [filterMode, setFilterMode] = useState<'categories' | 'moods'>('categories');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tooltipActivity, setTooltipActivity] = useState<Activity | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.intro}>
        <FlowBar step={1} />
        <Text style={styles.introTitle}>Filtro de Categorías y Ambientes</Text>
        <Text style={styles.introText}>
          Selecciona las categorías, ambientes o busca por palabra clave para personalizar las actividades que responderás.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por palabra clave (ej: cuerdas, masaje, cera)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Difficulty Level Filter */}
        <View style={styles.difficultyRow}>
          <Text style={styles.difficultyLabel}>🎯 Nivel de contenido:</Text>
          <View style={styles.difficultyChips}>
            <TouchableOpacity
              style={[styles.diffChip, difficultyFilter === 'all' && styles.diffChipActive]}
              onPress={() => setDifficultyFilter('all')}
            >
              <Text style={[styles.diffChipText, difficultyFilter === 'all' && styles.diffChipTextActive]}>
                Todos ({getAllActivities(customActivities).filter(a => enabledCategories.includes(a.category)).length})
              </Text>
            </TouchableOpacity>
            {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => {
              const info = DIFFICULTY_LABELS[lvl];
              const count = getAllActivities(customActivities).filter(
                (a) => enabledCategories.includes(a.category) && a.difficultyLevel === lvl
              ).length;
              const isActive = difficultyFilter === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.diffChip, isActive && { borderColor: info.color, backgroundColor: `${info.color}20` }]}
                  onPress={() => setDifficultyFilter(isActive ? 'all' : lvl)}
                >
                  <Text style={[styles.diffChipText, isActive && { color: info.color }]}>
                    {info.emoji} {info.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filter Mode Selector Tabs */}
        <View style={styles.filterTabContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filterMode === 'categories' && styles.filterTabActive]}
            onPress={() => setFilterMode('categories')}
          >
            <Text style={[styles.filterTabText, filterMode === 'categories' && styles.filterTabTextActive]}>
              📁 Categorías ({enabledCategories.length}/{CATEGORY_ORDER.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filterMode === 'moods' && styles.filterTabActive]}
            onPress={() => setFilterMode('moods')}
          >
            <Text style={[styles.filterTabText, filterMode === 'moods' && styles.filterTabTextActive]}>
              🎛️ Ambientes / Moods
            </Text>
          </TouchableOpacity>
        </View>

        {filterMode === 'categories' ? (
          <View style={styles.categoryGrid}>
            {CATEGORY_ORDER.map((cat) => {
              const active = enabledCategories.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[styles.categoryCardText, active && styles.categoryCardTextActive]}>
                    {CATEGORY_EMOJIS[cat]} {getCategoryLabel(cat)}
                  </Text>
                  <Text style={styles.categoryCardSub}>
                    {active ? '✓ Activa' : '✕ Omitida'} · {getAllActivities(customActivities).filter((a) => a.category === cat).length} actividades
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.moodsGrid}>
            {(Object.keys(MOOD_LABELS) as ActivityMood[]).map((mKey) => {
              const info = MOOD_LABELS[mKey];
              const matchingCats = Array.from(
                new Set(
                  getAllActivities(customActivities)
                    .filter((a) => a.moods?.includes(mKey))
                    .map((a) => a.category)
                )
              );
              const activeCount = matchingCats.filter((c) => enabledCategories.includes(c)).length;
              const isFullyActive = matchingCats.length > 0 && activeCount === matchingCats.length;

              return (
                <TouchableOpacity
                  key={mKey}
                  activeOpacity={0.85}
                  style={[styles.moodCard, isFullyActive && styles.moodCardActive]}
                  onPress={() => toggleCategoriesByMood(mKey)}
                >
                  <View style={styles.moodCardHeader}>
                    <Text style={styles.moodCardTitle}>
                      {info.emoji} {info.label}
                    </Text>
                    <Text style={[styles.moodCardBadge, isFullyActive && styles.moodCardBadgeActive]}>
                      {isFullyActive ? '✓ Activo' : `${activeCount}/${matchingCats.length} cats`}
                    </Text>
                  </View>
                  <Text style={styles.moodCardDesc}>{info.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.divider} />

        <Button
          title="➕ Añadir actividad propia"
          variant="secondary"
          onPress={() => setShowCustomModal(true)}
        />

        <Button
          title={`🃏 Comenzar en Modo Tarjetas Swipe (${selectedQuestionsCount} preguntas)`}
          onPress={onStartQuestions}
        />
        <Button
          title="Volver"
          variant="ghost"
          onPress={onBack}
        />

        <ActivityTooltipModal
          visible={!!tooltipActivity}
          activity={tooltipActivity}
          onClose={() => setTooltipActivity(null)}
        />

        <CustomActivityModal
          visible={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onActivityCreated={(newAct) => setCustomActivities((prev) => [...prev, newAct])}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  introText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  clearSearchBtn: {
    padding: spacing.xs,
  },
  clearSearchText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  difficultyRow: {
    marginBottom: spacing.md,
  },
  difficultyLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  difficultyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  diffChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  diffChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  diffChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  diffChipTextActive: {
    color: colors.primary,
  },
  filterTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  filterTabTextActive: {
    color: colors.text,
  },
  categoryGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  categoryCardActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
  },
  categoryCardText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  categoryCardTextActive: {
    color: colors.text,
  },
  categoryCardSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  moodsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  moodCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  moodCardActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
  },
  moodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodCardTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  moodCardBadge: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  moodCardBadgeActive: {
    color: colors.primary,
  },
  moodCardDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
});
