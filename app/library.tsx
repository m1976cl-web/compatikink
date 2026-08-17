import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography, glowShadowPrimary } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  ArticleItem,
  ArticleCategory,
  ARTICLES_DATA,
  ARTICLE_CATEGORY_LABELS,
} from '@/data/articlesData';
import {
  getSavedArticleIds,
  toggleSaveArticle,
  getReadArticleIds,
  markArticleAsRead,
} from '@/lib/articleStorage';
import { triggerLightHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from '@/lib/haptics';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function LibraryScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  const loadStorageData = useCallback(async () => {
    const saved = await getSavedArticleIds();
    const read = await getReadArticleIds();
    setSavedIds(saved);
    setReadIds(read);
  }, []);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

  const handleToggleBookmark = async (id: string, e?: any) => {
    e?.stopPropagation?.();
    const res = await toggleSaveArticle(id);
    setSavedIds(res.ids);
  };

  const handleOpenArticle = async (article: ArticleItem) => {
    triggerLightHaptic();
    setActiveArticle(article);
    const updatedRead = await markArticleAsRead(article.id);
    setReadIds(updatedRead);
  };

  const handleShareArticle = async (article: ArticleItem) => {
    triggerLightHaptic();
    const message =
      `📚 CompatKink — Biblioteca Educativa\n\n` +
      `"${article.title}"\n` +
      `${article.subtitle}\n\n` +
      `📌 Puntos clave:\n` +
      article.keyTakeaways.map((k) => `• ${k}`).join('\n') +
      `\n\n🔒 Guía educativa disponible en CompatKink.`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: article.title, text: message });
      } else {
        await Share.share({ title: article.title, message });
      }
      triggerSuccessHaptic();
    } catch {}
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES_DATA.filter((art) => {
      if (showSavedOnly && !savedIds.includes(art.id)) return false;
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchSub = art.subtitle.toLowerCase().includes(q);
        const matchAuthor = art.author.toLowerCase().includes(q);
        const matchTags = art.tags.some((t) => t.toLowerCase().includes(q));
        const matchBody = art.sections.some(
          (s) => s.heading.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
        );
        return matchTitle || matchSub || matchAuthor || matchTags || matchBody;
      }
      return true;
    });
  }, [selectedCategory, showSavedOnly, savedIds, searchQuery]);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Biblioteca de Artículos & Guías</Text>
          <Text style={styles.subtitle}>
            Artículos educativos, fundamentos de seguridad anatómica, aftercare y dinámicas de poder
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar por concepto, técnica, autor o tema..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Filter Horizontal Pills */}
          <View style={{ gap: 4 }}>
            <View style={styles.filterHeaderRow}>
              <Text style={styles.filterSectionTitle}>Áreas de Aprendizaje:</Text>
              <TouchableOpacity
                style={[styles.savedFilterBtn, showSavedOnly && styles.savedFilterBtnActive]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setShowSavedOnly(!showSavedOnly);
                }}
              >
                <Text style={[styles.savedFilterText, showSavedOnly && { color: '#fbbf24' }]}>
                  {showSavedOnly ? '★ Guardados (' + savedIds.length + ')' : '☆ Ver Guardados'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              <TouchableOpacity
                style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedCategory('all');
                }}
              >
                <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
                  ✨ Todos ({ARTICLES_DATA.length})
                </Text>
              </TouchableOpacity>

              {(Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[]).map((catKey) => {
                const cat = ARTICLE_CATEGORY_LABELS[catKey];
                const isActive = selectedCategory === catKey;
                return (
                  <TouchableOpacity
                    key={catKey}
                    style={[styles.catChip, isActive && { backgroundColor: `${cat.color}25`, borderColor: cat.color }]}
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSelectedCategory(catKey);
                    }}
                  >
                    <Text style={[styles.catChipText, isActive && { color: cat.color, fontFamily: fonts.bodyBold }]}>
                      {cat.emoji} {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Articles List */}
          <View style={{ gap: spacing.md }}>
            {filteredArticles.map((article) => {
              const isSaved = savedIds.includes(article.id);
              const isRead = readIds.includes(article.id);
              const catInfo = ARTICLE_CATEGORY_LABELS[article.category];

              return (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  onPress={() => handleOpenArticle(article)}
                  activeOpacity={0.85}
                >
                  {/* Top Meta Row */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.cardCatPill, { backgroundColor: `${catInfo.color}18`, borderColor: catInfo.color }]}>
                      <Text style={[styles.cardCatPillText, { color: catInfo.color }]}>
                        {catInfo.emoji} {catInfo.label}
                      </Text>
                    </View>

                    <Text style={styles.readTimeText}>⏱️ {article.readTimeMin} min de lectura</Text>

                    {isRead && (
                      <View style={styles.readBadge}>
                        <Text style={styles.readBadgeText}>✓ Leído</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.bookmarkBtn}
                      onPress={(e) => handleToggleBookmark(article.id, e)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.bookmarkIcon, isSaved && { color: '#fbbf24' }]}>
                        {isSaved ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Title & Subtitle */}
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleSubtitle} numberOfLines={2}>
                    {article.subtitle}
                  </Text>

                  {/* Author & Tags */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.authorBox}>
                      <Text style={{ fontSize: 13 }}>{article.emoji}</Text>
                      <Text style={styles.authorName}>{article.author}</Text>
                      <Text style={styles.authorRole}>({article.authorRole})</Text>
                    </View>

                    <Text style={styles.readActionText}>Leer Guía →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredArticles.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 32 }}>📚</Text>
                <Text style={styles.emptyTitle}>No se encontraron artículos</Text>
                <Text style={styles.emptyDesc}>Prueba ajustando los filtros de categoría o el término de búsqueda.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* --- FULL ARTICLE READER MODAL --- */}
        {activeArticle && (
          <Modal
            visible={!!activeArticle}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setActiveArticle(null)}
          >
            <View style={styles.readerContainer}>
              {/* Reader Top Bar */}
              <View style={styles.readerTopBar}>
                <TouchableOpacity
                  onPress={() => setActiveArticle(null)}
                  style={styles.readerBackBtn}
                >
                  <Text style={styles.readerBackBtnText}>← Cerrar Lectura</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  <TouchableOpacity
                    style={styles.readerActionBtn}
                    onPress={() => handleToggleBookmark(activeArticle.id)}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {savedIds.includes(activeArticle.id) ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.readerActionBtn}
                    onPress={() => handleShareArticle(activeArticle)}
                  >
                    <Text style={{ fontSize: 15 }}>📤</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView contentContainerStyle={styles.readerScroll} showsVerticalScrollIndicator={false}>
                {/* Article Header */}
                <View style={styles.readerHeader}>
                  <View style={[styles.cardCatPill, { alignSelf: 'flex-start' }]}>
                    <Text style={[styles.cardCatPillText, { color: colors.primary }]}>
                      {ARTICLE_CATEGORY_LABELS[activeArticle.category].emoji} {ARTICLE_CATEGORY_LABELS[activeArticle.category].label}
                    </Text>
                  </View>

                  <Text style={styles.readerTitle}>{activeArticle.title}</Text>
                  <Text style={styles.readerSubtitle}>{activeArticle.subtitle}</Text>

                  <View style={styles.readerAuthorRow}>
                    <Text style={{ fontSize: 18 }}>{activeArticle.emoji}</Text>
                    <View>
                      <Text style={styles.readerAuthorName}>{activeArticle.author}</Text>
                      <Text style={styles.readerAuthorRole}>{activeArticle.authorRole} · {activeArticle.readTimeMin} min</Text>
                    </View>
                  </View>
                </View>

                {/* Key Takeaways Box */}
                <View style={styles.takeawaysBox}>
                  <Text style={styles.takeawaysTitle}>📌 Puntos Clave para Recordar:</Text>
                  {activeArticle.keyTakeaways.map((point, idx) => (
                    <View key={idx} style={styles.takeawayItem}>
                      <Text style={styles.takeawayBullet}>⚡</Text>
                      <Text style={styles.takeawayText}>{point}</Text>
                    </View>
                  ))}
                </View>

                {/* Sections */}
                {activeArticle.sections.map((sec, idx) => (
                  <View key={idx} style={styles.sectionWrap}>
                    <Text style={styles.sectionHeading}>{sec.heading}</Text>
                    <Text style={styles.sectionBody}>{sec.body}</Text>
                  </View>
                ))}

                {/* Related Glossary Terms */}
                {activeArticle.relatedTerms && activeArticle.relatedTerms.length > 0 && (
                  <View style={styles.relatedTermsBox}>
                    <Text style={styles.relatedTermsTitle}>📖 Términos Relacionados en el Glosario:</Text>
                    <View style={styles.termsRow}>
                      {activeArticle.relatedTerms.map((term, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.termPill}
                          onPress={() => {
                            setActiveArticle(null);
                            router.push('/glossary');
                          }}
                        >
                          <Text style={styles.termPillText}>🔍 {term}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Reader Footer */}
                <View style={styles.readerFooter}>
                  <TouchableOpacity
                    style={styles.finishReadBtn}
                    onPress={() => {
                      triggerSuccessHaptic();
                      setActiveArticle(null);
                    }}
                  >
                    <Text style={styles.finishReadBtnText}>✓ Completar Lectura</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        )}
      </View>
    </ScreenContainer>
  );
}

export default function LibraryScreen() {
  return (
    <RouteFeatureGuard route="/library" title="Biblioteca de Artículos">
      <LibraryScreenContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 2 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.xs, lineHeight: 17 },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  searchWrap: { marginVertical: 2 },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterSectionTitle: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodyBold, textTransform: 'uppercase' },
  savedFilterBtn: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.sm },
  savedFilterBtnActive: { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderWidth: 1, borderColor: '#fbbf24' },
  savedFilterText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },

  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: { backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  catChipTextActive: { color: colors.primary, fontFamily: fonts.bodyBold },

  articleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardCatPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  cardCatPillText: { fontSize: 9, fontFamily: fonts.bodyBold },
  readTimeText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.body },
  readBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  readBadgeText: { color: '#4ade80', fontSize: 9, fontFamily: fonts.bodyBold },
  bookmarkBtn: { marginLeft: 'auto', padding: 4 },
  bookmarkIcon: { fontSize: 18, color: colors.textMuted },

  articleTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md, marginTop: 2 },
  articleSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },

  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: spacing.xs,
    marginTop: 4,
  },
  authorBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 11 },
  authorRole: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10 },
  readActionText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },

  emptyBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  emptyDesc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },

  // Reader Modal Styles
  readerContainer: { flex: 1, backgroundColor: '#09050e' },
  readerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  readerBackBtn: { paddingVertical: 4 },
  readerBackBtnText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  readerActionBtn: {
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
  },
  readerScroll: {
    padding: spacing.md,
    gap: spacing.lg,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  readerHeader: { gap: spacing.xs },
  readerTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.xxl, lineHeight: 30 },
  readerSubtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 20 },
  readerAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  readerAuthorName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  readerAuthorRole: { color: colors.textMuted, fontSize: 10 },

  takeawaysBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.xs,
  },
  takeawaysTitle: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  takeawayItem: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  takeawayBullet: { fontSize: 11, marginTop: 1 },
  takeawayText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 17, fontFamily: fonts.body },

  sectionWrap: { gap: spacing.xs },
  sectionHeading: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md },
  sectionBody: { color: '#d4d4d8', fontFamily: fonts.body, fontSize: fontSize.sm, lineHeight: 22 },

  relatedTermsBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relatedTermsTitle: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodyBold },
  termsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  termPill: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termPillText: { color: colors.primary, fontSize: 11, fontFamily: fonts.bodySemi },

  readerFooter: { paddingVertical: spacing.md, alignItems: 'center' },
  finishReadBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    width: '100%',
  },
  finishReadBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
});
