import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography, glowShadowPrimary } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  GlossaryTerm,
  GlossaryCategory,
  getTermOfTheDay,
  getRelatedGlossaryTerms,
} from '@/data/glossaryData';
import { loadGlossaryBookmarks, toggleGlossaryBookmark } from '@/lib/storage/customStorage';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

const CATEGORY_COLORS: Record<GlossaryCategory, { color: string; bg: string; emoji: string }> = {
  'Consentimiento & Ética': { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', emoji: '🤝' },
  'Seguridad & Anatomía': { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', emoji: '🫀' },
  'Prácticas & BDSM': { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', emoji: '🔥' },
  'Roles & Dinámicas': { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', emoji: '👑' },
  'No Monogamia & Vínculos': { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', emoji: '🌿' },
};

export default function GlossaryScreen() {
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
              activeOpacity={0.8}
            >
              <Text style={styles.quizBtnText}>🧠 Mini-Quiz</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Glosario Kink Interactivo</Text>
          <Text style={styles.subtitle}>
            {GLOSSARY.length} términos con categorías, anatomía, seguridad y relaciones
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero: Term of the Day Card */}
          <View style={styles.dailyCard}>
            <View style={styles.dailyHeader}>
              <View style={styles.dailyBadge}>
                <Text style={styles.dailyBadgeText}>✨ TÉRMINO DEL DÍA</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleToggleBookmark(dailyTerm.term)}
                style={styles.bookmarkBtn}
              >
                <Text style={styles.bookmarkIcon}>{isDailyBookmarked ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dailyTermName}>{dailyTerm.term}</Text>
            <Text style={styles.dailyTermDef}>{dailyTerm.definition}</Text>

            {dailyTerm.safetyTip ? (
              <View style={styles.dailySafetyBox}>
                <Text style={styles.dailySafetyText}>💡 {dailyTerm.safetyTip}</Text>
              </View>
            ) : null}
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar término, práctica o seguridad..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                setSelectedLetter(null);
              }}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
                Todos ({GLOSSARY.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'favorites' && styles.catChipActive]}
              onPress={() => setSelectedCategory('favorites')}
              activeOpacity={0.8}
            >
              <Text style={[styles.catChipText, selectedCategory === 'favorites' && styles.catChipTextActive]}>
                ⭐ Favoritos ({bookmarks.length})
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
                    isSel && { backgroundColor: catStyle.color, borderColor: catStyle.color },
                  ]}
                  onPress={() => {
                    setSelectedCategory(isSel ? 'all' : cat);
                    setSelectedLetter(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catChipText, isSel && styles.catChipTextActive]}>
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
              onPress={() => setSelectedLetter(null)}
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
            {filtered.map((item) => {
              const isExpanded = expandedTerm === item.term;
              const isBookmarked = bookmarks.includes(item.term);
              const catTheme = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Prácticas & BDSM'];
              const relatedList = getRelatedGlossaryTerms(item);

              return (
                <TouchableOpacity
                  key={item.term}
                  style={[
                    styles.termCard,
                    isExpanded && { borderColor: catTheme.color, borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    triggerLightHaptic();
                    setExpandedTerm(isExpanded ? null : item.term);
                  }}
                  activeOpacity={0.85}
                >
                  {/* Top line of card */}
                  <View style={styles.termTopRow}>
                    <View style={styles.termTitleGroup}>
                      <Text style={[styles.termName, isExpanded && { color: catTheme.color }]}>
                        {item.term}
                      </Text>
                      <View style={[styles.inlineCatBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.color }]}>
                        <Text style={[styles.inlineCatBadgeText, { color: catTheme.color }]}>
                          {catTheme.emoji} {item.category}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(item.term);
                      }}
                      style={styles.cardBookmarkBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.bookmarkIcon}>{isBookmarked ? '⭐' : '☆'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Definition */}
                  <Text style={styles.termDef}>{item.definition}</Text>

                  {/* Expanded Extra Details */}
                  {isExpanded ? (
                    <View style={styles.expandedSection}>
                      {item.safetyTip ? (
                        <View style={styles.safetyTipCard}>
                          <Text style={styles.safetyTipTitle}>⚠️ Consejo de Seguridad & Salud:</Text>
                          <Text style={styles.safetyTipBody}>{item.safetyTip}</Text>
                        </View>
                      ) : null}

                      {item.relatedTerms && item.relatedTerms.length > 0 ? (
                        <View style={styles.relatedGroup}>
                          <Text style={styles.relatedLabel}>Términos relacionados:</Text>
                          <View style={styles.relatedChipsWrap}>
                            {item.relatedTerms.map((relTerm) => (
                              <TouchableOpacity
                                key={relTerm}
                                style={styles.relatedChip}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setSearch(relTerm);
                                  setExpandedTerm(relTerm);
                                }}
                              >
                                <Text style={styles.relatedChipText}>🔗 {relTerm}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.cardFooter}>
                      <Text style={styles.tapToExpandText}>Toca para ver detalles y relaciones ↓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

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

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Glossary Mini-Quiz Component
// ─────────────────────────────────────────────────────────────────────────────

function GlossaryQuizModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate 3 random questions from GLOSSARY
  const quizQuestions = useMemo(() => {
    const shuffled = [...GLOSSARY].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((correct) => {
      const wrongPool = GLOSSARY.filter((t) => t.term !== correct.term)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      const options = [correct.definition, ...wrongPool.map((w) => w.definition)].sort(
        () => 0.5 - Math.random()
      );
      return {
        term: correct.term,
        correctDefinition: correct.definition,
        options,
      };
    });
  }, [visible]);

  const currentQ = quizQuestions[questionIndex] || quizQuestions[0];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctDefinition) {
      triggerSuccessHaptic();
      setScore((s) => s + 1);
    } else {
      triggerLightHaptic();
    }
  };

  const handleNext = () => {
    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.quizCard}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>🧠 Mini-Quiz de Glosario</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.quizCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isFinished ? (
            <View style={styles.quizResultWrap}>
              <Text style={styles.quizScoreEmoji}>{score === 3 ? '🏆' : '✨'}</Text>
              <Text style={styles.quizScoreTitle}>
                ¡Completaste el Quiz! Puntaje: {score} de {quizQuestions.length}
              </Text>
              <Text style={styles.quizScoreSub}>
                {score === 3
                  ? '¡Excelente dominio del vocabulario y conceptos!'
                  : 'Sigue explorando los términos para afianzar tus conocimientos.'}
              </Text>
              <TouchableOpacity style={styles.quizActionBtn} onPress={handleReset}>
                <Text style={styles.quizActionBtnText}>Jugar de nuevo 🔄</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.quizBody}>
              <Text style={styles.quizProgressText}>
                Pregunta {questionIndex + 1} de {quizQuestions.length}
              </Text>
              <Text style={styles.quizPrompt}>
                ¿Cuál es la definición correcta de <Text style={styles.quizTermHighlight}>{currentQ.term}</Text>?
              </Text>

              <View style={styles.quizOptionsList}>
                {currentQ.options.map((opt, idx) => {
                  const isCorrect = opt === currentQ.correctDefinition;
                  const isSelected = selectedAnswer === opt;

                  let borderStyle = colors.border;
                  let bgStyle = colors.surfaceLight;

                  if (isAnswered) {
                    if (isCorrect) {
                      borderStyle = '#4ade80';
                      bgStyle = 'rgba(74, 222, 128, 0.15)';
                    } else if (isSelected && !isCorrect) {
                      borderStyle = colors.danger;
                      bgStyle = 'rgba(248, 113, 113, 0.15)';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.quizOptionBtn, { borderColor: borderStyle, backgroundColor: bgStyle }]}
                      onPress={() => handleSelectOption(opt)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.quizOptionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isAnswered ? (
                <TouchableOpacity style={styles.quizActionBtn} onPress={handleNext}>
                  <Text style={styles.quizActionBtnText}>
                    {questionIndex === quizQuestions.length - 1 ? 'Ver Resultado 🏁' : 'Siguiente Pregunta →'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

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
    paddingBottom: spacing.sm,
    gap: spacing.xs,
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
    fontSize: fontSize.xxl,
  },
  subtitle: {
    ...typography.bodyMuted,
    fontSize: fontSize.xs,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Daily Term Card
  dailyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: spacing.sm,
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dailyBadgeText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    padding: 2,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  dailyTermName: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  dailyTermDef: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  dailySafetyBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.xs + 2,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: 4,
  },
  dailySafetyText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  // Categories Scroll
  categoryScroll: {
    marginVertical: spacing.xs,
    maxHeight: 36,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  catChipTextActive: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },

  // Alphabet Bar
  alphabetBar: {
    marginVertical: spacing.xs,
    maxHeight: 34,
  },
  letterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    marginRight: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  letterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fonts.bodyBold,
  },
  letterTextActive: {
    color: colors.text,
  },

  // Results
  resultRow: {
    marginVertical: spacing.xs,
  },
  resultCount: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },

  // Term Cards
  list: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  termTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  termTitleGroup: {
    flex: 1,
    gap: 4,
  },
  termName: {
    color: colors.primary,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  inlineCatBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inlineCatBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  cardBookmarkBtn: {
    padding: 2,
    marginLeft: spacing.xs,
  },
  termDef: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: 6,
    marginTop: 2,
  },
  tapToExpandText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },

  // Expanded
  expandedSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    gap: spacing.sm,
  },
  safetyTipCard: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 2,
  },
  safetyTipTitle: {
    color: '#f87171',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  safetyTipBody: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  relatedGroup: {
    gap: 4,
  },
  relatedLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  relatedChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  relatedChip: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  relatedChipText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
  },
  resetFiltersBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
  },
  resetFiltersBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },

  // Quiz Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  quizCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 520,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  quizCloseText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  quizBody: {
    gap: spacing.sm,
  },
  quizProgressText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  quizPrompt: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  quizTermHighlight: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  quizOptionsList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quizOptionBtn: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  quizOptionText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  quizActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  quizActionBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  quizResultWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  quizScoreEmoji: {
    fontSize: 48,
  },
  quizScoreTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  quizScoreSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
