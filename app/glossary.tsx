import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  GlossaryCategory,
  getTermOfTheDay,
} from '@/data/glossaryData';
import { loadGlossaryBookmarks, toggleGlossaryBookmark } from '@/lib/storage/customStorage';
import { triggerLightHaptic, triggerSelectionHaptic } from '@/lib/haptics';
import { GlossaryTermCard, CATEGORY_COLORS } from '@/components/glossary/GlossaryTermCard';
import { GlossaryDailyBanner } from '@/components/glossary/GlossaryDailyBanner';
import { GlossaryQuizModal } from '@/components/glossary/GlossaryQuizModal';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function GlossaryScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all' | 'favorites'>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Daily Term
  const dailyTerm = useMemo(() => getTermOfTheDay(), []);

  // Load Bookmarks on Mount
  useEffect(() => {
    loadGlossaryBookmarks().then(setBookmarks).catch(() => {});
  }, []);

  const handleToggleBookmark = useCallback(async (term: string) => {
    triggerLightHaptic();
    const updated = await toggleGlossaryBookmark(term);
    setBookmarks(updated);
  }, []);

  // Unique alphabet letters present in dictionary
  const alphabet = useMemo(() => {
    const letters = new Set(GLOSSARY.map((t) => t.term[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  // Filtered terms list
  const filtered = useMemo(() => {
    let results = GLOSSARY;

    if (selectedCategory === 'favorites') {
      results = results.filter((t) => bookmarks.includes(t.term));
    } else if (selectedCategory !== 'all') {
      results = results.filter((t) => t.category === selectedCategory);
    }

    if (selectedLetter) {
      results = results.filter((t) => t.term[0].toUpperCase() === selectedLetter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          (t.safetyTip && t.safetyTip.toLowerCase().includes(q))
      );
    }

    return results;
  }, [search, selectedLetter, selectedCategory, bookmarks]);

  const isDailyBookmarked = bookmarks.includes(dailyTerm.term);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quizBtn}
              onPress={() => {
                triggerLightHaptic();
                setShowQuizModal(true);
              }}
            >
              <Text style={styles.quizBtnText}>🧠 Mini-Quiz</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Glosario & Conceptos 📖</Text>
          <Text style={styles.subtitle}>
            Diccionario de consentimiento, seguridad, dinámicas de poder y términos BDSM
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Term of the Day Banner */}
          {!search && selectedCategory === 'all' && !selectedLetter && (
            <GlossaryDailyBanner
              dailyTerm={dailyTerm}
              isBookmarked={isDailyBookmarked}
              onToggleBookmark={() => handleToggleBookmark(dailyTerm.term)}
              onOpenQuiz={() => setShowQuizModal(true)}
            />
          )}

          {/* Search Box */}
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar término, práctica o concepto..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={(txt) => {
                setSearch(txt);
                if (txt.trim()) {
                  setSelectedLetter(null);
                }
              }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('all');
                setSelectedLetter(null);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
                ✨ Todos ({GLOSSARY.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'favorites' && styles.catChipActiveFav]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory(selectedCategory === 'favorites' ? 'all' : 'favorites');
                setSelectedLetter(null);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'favorites' && styles.catChipTextActiveFav]}>
                ⭐ Guardados ({bookmarks.length})
              </Text>
            </TouchableOpacity>

            {GLOSSARY_CATEGORIES.map((cat) => {
              const isSel = selectedCategory === cat;
              const catStyle = CATEGORY_COLORS[cat];
              const count = GLOSSARY.filter((t) => t.category === cat).length;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    isSel && { backgroundColor: catStyle.bg, borderColor: catStyle.color },
                  ]}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setSelectedCategory(isSel ? 'all' : cat);
                    setSelectedLetter(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, isSel && { color: catStyle.color, fontFamily: fonts.bodyBold }]}>
                    {catStyle.emoji} {cat} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Alphabet Letters Horizontal Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alphabetBar}>
            <TouchableOpacity
              style={[styles.letterChip, !selectedLetter && styles.letterChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedLetter(null);
              }}
            >
              <Text style={[styles.letterText, !selectedLetter && styles.letterTextActive]}>
                A-Z
              </Text>
            </TouchableOpacity>
            {alphabet.map((letter) => {
              const isSel = selectedLetter === letter;
              return (
                <TouchableOpacity
                  key={letter}
                  style={[styles.letterChip, isSel && styles.letterChipActive]}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setSelectedLetter(isSel ? null : letter);
                    setSearch('');
                  }}
                >
                  <Text style={[styles.letterText, isSel && styles.letterTextActive]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Results Count */}
          <View style={styles.resultRow}>
            <Text style={styles.resultCount}>
              {filtered.length} {filtered.length === 1 ? 'término encontrado' : 'términos encontrados'}
            </Text>
          </View>

          {/* Term Cards List */}
          <View style={styles.list}>
            {filtered.map((item) => (
              <GlossaryTermCard
                key={item.term}
                item={item}
                isExpanded={expandedTerm === item.term}
                isBookmarked={bookmarks.includes(item.term)}
                onToggleExpand={() => {
                  triggerLightHaptic();
                  setExpandedTerm(expandedTerm === item.term ? null : item.term);
                }}
                onToggleBookmark={() => handleToggleBookmark(item.term)}
                onSelectRelatedTerm={(relTerm) => {
                  setSearch(relTerm);
                  setExpandedTerm(relTerm);
                }}
              />
            ))}

            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🤔</Text>
                <Text style={styles.emptyText}>No se encontraron términos</Text>
                <TouchableOpacity
                  style={styles.resetFiltersBtn}
                  onPress={() => {
                    setSearch('');
                    setSelectedLetter(null);
                    setSelectedCategory('all');
                  }}
                >
                  <Text style={styles.resetFiltersBtnText}>Restablecer filtros</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Mini-Quiz Modal */}
        <GlossaryQuizModal
          visible={showQuizModal}
          onClose={() => setShowQuizModal(false)}
        />
      </View>
    </ScreenContainer>
  );
}

export default function GlossaryScreen() {
  return (
    <RouteFeatureGuard route="/glossary" title="Glosario Interactivo">
      <GlossaryScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  containerDesktop: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
  },
  quizBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  quizBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
  },
  subtitle: {
    ...typography.bodyMuted,
    fontSize: fontSize.xs,
    lineHeight: 17,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },

  // Category Filter
  categoryRow: {
    marginVertical: 2,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  catChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  catChipActiveFav: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
  },
  catChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
  },
  catChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  catChipTextActiveFav: {
    color: '#fbbf24',
    fontFamily: fonts.bodyBold,
  },

  // Alphabet
  alphabetBar: {
    marginVertical: 4,
  },
  letterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
  },
  letterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  letterTextActive: {
    color: '#000',
    fontFamily: fonts.bodyBold,
  },

  // Results
  resultRow: {
    paddingVertical: 4,
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.body,
  },

  // List
  list: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  resetFiltersBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  resetFiltersBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
