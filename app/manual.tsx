import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, glowShadowPrimary, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import { useResponsive } from '@/hooks/useResponsive';
import {
  MANUAL_AREAS,
  MANUAL_MODULES,
  ManualModule,
  ManualArea,
  loadManualBookmarks,
  toggleManualBookmark,
} from '@/data/manualData';
import { exportManualAsPDF } from '@/lib/exportManualPDF';
import { copyManualAsMarkdown, downloadManualAsMarkdown } from '@/lib/exportMarkdown';

export default function UserManualScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [copiedToast, setCopiedToast] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Load bookmarks on mount
  React.useEffect(() => {
    loadManualBookmarks().then((saved) => {
      if (Array.isArray(saved)) setBookmarkedIds(saved);
    });
  }, []);

  const handleToggleBookmark = async (id: string) => {
    const next = await toggleManualBookmark(id);
    setBookmarkedIds(next);
  };

  // Filter modules dynamically by category area and search query
  const filteredModules = useMemo(() => {
    return MANUAL_MODULES.filter((module) => {
      if (showBookmarksOnly && !bookmarkedIds.includes(module.id)) {
        return false;
      }

      if (selectedAreaId !== 'all') {
        const area = MANUAL_AREAS.find((a) => a.id === selectedAreaId);
        if (area && !area.moduleIds.includes(module.id)) {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = module.title.toLowerCase().includes(q);
      const inDesc = module.description.toLowerCase().includes(q);
      const inSummary = module.summary.toLowerCase().includes(q);
      const inCategory = module.category.toLowerCase().includes(q);
      const inTags = module.tags.some((t) => t.toLowerCase().includes(q));
      const inSteps = module.stepByStepGuide.some((step) =>
        step.toLowerCase().includes(q)
      );

      return inTitle || inDesc || inSummary || inCategory || inTags || inSteps;
    });
  }, [searchQuery, selectedAreaId]);

  const selectedArea = useMemo(() => {
    return MANUAL_AREAS.find((a) => a.id === selectedAreaId);
  }, [selectedAreaId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const nextState: Record<string, boolean> = {};
    filteredModules.forEach((mod) => {
      nextState[mod.id] = true;
    });
    setExpandedModules(nextState);
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
  };

  // Export Action Handlers
  const handleExportPDF = () => {
    const areaTitle = selectedArea ? selectedArea.title : 'Manual de Usuario Completo';
    exportManualAsPDF(filteredModules, areaTitle);
  };

  const handleCopyMarkdown = async () => {
    const success = await copyManualAsMarkdown(filteredModules);
    if (success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleDownloadMarkdown = () => {
    downloadManualAsMarkdown(filteredModules);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={styles.root}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.mainTitle}>Manual de Usuario</Text>
            <Text style={styles.mainSubtitle}>
              Guía interactiva, tutoriales paso a paso y protocolos BDSM de seguridad
            </Text>
          </View>
        </View>

        <NoxHost scene="manual" variant="compact" />

        {/* Global Toast Notification */}
        {copiedToast && (
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>
              📋 ¡Manual copiado en formato Markdown al portapapeles!
            </Text>
          </View>
        )}

        {/* Responsive Layout: Desktop 2-Column vs Mobile Vertical Stack */}
        {isDesktop ? (
          <View style={styles.desktopLayout}>
            {/* Left Category Sidebar (~30%) */}
            <View style={styles.sidebar}>
              {/* Search Box */}
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar tema, safewords, cuerdas..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Action Export Bar */}
              <View style={styles.exportCard}>
                <Text style={styles.exportCardTitle}>⚡ Exportar & Compartir</Text>
                <View style={styles.exportButtonGroup}>
                  <TouchableOpacity
                    style={styles.btnPdf}
                    onPress={handleExportPDF}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnPdfText}>🖨️ Exportar a PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnMd}
                    onPress={handleCopyMarkdown}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnMdText}>📋 Copiar Markdown</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnMd}
                    onPress={handleDownloadMarkdown}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnMdText}>💾 Descargar Markdown</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category List Navigation */}
              <Text style={styles.sectionHeaderLabel}>Categorías Principales</Text>
              <ScrollView
                style={styles.sidebarCategoryScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Category "Marcadores" */}
                <TouchableOpacity
                  style={[
                    styles.sidebarCategoryItem,
                    showBookmarksOnly && styles.sidebarCategoryItemActive,
                  ]}
                  onPress={() => {
                    setShowBookmarksOnly(!showBookmarksOnly);
                    setSelectedAreaId('all');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>⭐</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      showBookmarksOnly && styles.categoryNameActive,
                    ]}
                  >
                    Mis Marcadores ({bookmarkedIds.length})
                  </Text>
                </TouchableOpacity>

                {/* Category "Todas" */}
                <TouchableOpacity
                  style={[
                    styles.sidebarCategoryItem,
                    !showBookmarksOnly && selectedAreaId === 'all' && styles.sidebarCategoryItemActive,
                  ]}
                  onPress={() => {
                    setShowBookmarksOnly(false);
                    setSelectedAreaId('all');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>📚</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedAreaId === 'all' && styles.categoryNameActive,
                    ]}
                  >
                    Todas las Áreas
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      selectedAreaId === 'all' && styles.countBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countBadgeText,
                        selectedAreaId === 'all' && styles.countBadgeTextActive,
                      ]}
                    >
                      {MANUAL_MODULES.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 6 Primary Categories from MANUAL_AREAS */}
                {MANUAL_AREAS.map((area) => {
                  const isActive = selectedAreaId === area.id;
                  const count = area.moduleIds.length;
                  return (
                    <TouchableOpacity
                      key={area.id}
                      style={[
                        styles.sidebarCategoryItem,
                        isActive && styles.sidebarCategoryItemActive,
                      ]}
                      onPress={() => setSelectedAreaId(area.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryEmoji}>{area.icon}</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          isActive && styles.categoryNameActive,
                        ]}
                        numberOfLines={2}
                      >
                        {area.title}
                      </Text>
                      <View
                        style={[
                          styles.countBadge,
                          isActive && styles.countBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            isActive && styles.countBadgeTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Detail / Modules Panel (~70%) */}
            <View style={styles.detailPanel}>
              {/* Controls Bar */}
              <View style={styles.controlsBar}>
                <Text style={styles.resultCountText}>
                  {filteredModules.length}{' '}
                  {filteredModules.length === 1
                    ? 'módulo disponible'
                    : 'módulos disponibles'}
                </Text>
                <View style={styles.expandRow}>
                  <TouchableOpacity
                    onPress={handleExpandAll}
                    style={styles.controlTextBtn}
                  >
                    <Text style={styles.controlTextBtnLabel}>Expandir Todo</Text>
                  </TouchableOpacity>
                  <Text style={{ color: colors.textMuted }}>•</Text>
                  <TouchableOpacity
                    onPress={handleCollapseAll}
                    style={styles.controlTextBtn}
                  >
                    <Text style={styles.controlTextBtnLabel}>Colapsar Todo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Module Accordion Cards */}
              <ScrollView
                contentContainerStyle={styles.modulesScrollList}
                showsVerticalScrollIndicator={false}
              >
                {filteredModules.map((module) => (
                  <ModuleAccordionItem
                    key={module.id}
                    module={module}
                    isExpanded={!!expandedModules[module.id]}
                    isBookmarked={bookmarkedIds.includes(module.id)}
                    onToggle={() => toggleModule(module.id)}
                    onToggleBookmark={() => handleToggleBookmark(module.id)}
                    onNavigate={(path) => router.push(path as any)}
                  />
                ))}

                {filteredModules.length === 0 && (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyEmoji}>🔎</Text>
                    <Text style={styles.emptyTitle}>No se encontraron módulos</Text>
                    <Text style={styles.emptyDesc}>
                      Intenta buscar con otros términos como "safeword", "cuerdas",
                      "reporte" o "bóveda".
                    </Text>
                  </View>
                )}
                <View style={{ height: spacing.xl }} />
              </ScrollView>
            </View>
          </View>
        ) : (
          /* Mobile Stacked Layout */
          <ScrollView
            contentContainerStyle={styles.mobileScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Input */}
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar en el manual..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Horizontal Category Badges Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mobileCategoryBar}
            >
              <TouchableOpacity
                style={[
                  styles.mobileChip,
                  selectedAreaId === 'all' && styles.mobileChipActive,
                ]}
                onPress={() => setSelectedAreaId('all')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.mobileChipText,
                    selectedAreaId === 'all' && styles.mobileChipTextActive,
                  ]}
                >
                  📚 Todas
                </Text>
              </TouchableOpacity>

              {MANUAL_AREAS.map((area) => {
                const isActive = selectedAreaId === area.id;
                return (
                  <TouchableOpacity
                    key={area.id}
                    style={[
                      styles.mobileChip,
                      isActive && styles.mobileChipActive,
                    ]}
                    onPress={() => setSelectedAreaId(area.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.mobileChipText,
                        isActive && styles.mobileChipTextActive,
                      ]}
                    >
                      {area.icon} {area.title.split(':')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Mobile Action Bar for Exports */}
            <View style={styles.exportCardMobile}>
              <Text style={styles.exportCardTitle}>⚡ Herramientas de Exportación</Text>
              <View style={styles.exportGridMobile}>
                <TouchableOpacity
                  style={styles.btnPdf}
                  onPress={handleExportPDF}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPdfText}>🖨️ PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnMd}
                  onPress={handleCopyMarkdown}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnMdText}>📋 Copiar MD</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnMd}
                  onPress={handleDownloadMarkdown}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnMdText}>💾 Descargar MD</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Controls Bar */}
            <View style={styles.controlsBar}>
              <Text style={styles.resultCountText}>
                {filteredModules.length}{' '}
                {filteredModules.length === 1 ? 'módulo' : 'módulos'}
              </Text>
              <View style={styles.expandRow}>
                <TouchableOpacity onPress={handleExpandAll}>
                  <Text style={styles.controlTextBtnLabel}>Expandir</Text>
                </TouchableOpacity>
                <Text style={{ color: colors.textMuted }}>•</Text>
                <TouchableOpacity onPress={handleCollapseAll}>
                  <Text style={styles.controlTextBtnLabel}>Colapsar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mobile Modules Stack */}
            <View style={styles.modulesScrollList}>
              {filteredModules.map((module) => (
                <ModuleAccordionItem
                  key={module.id}
                  module={module}
                  isExpanded={!!expandedModules[module.id]}
                  isBookmarked={bookmarkedIds.includes(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  onToggleBookmark={() => handleToggleBookmark(module.id)}
                  onNavigate={(path) => router.push(path as any)}
                />
              ))}

              {filteredModules.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyEmoji}>🔎</Text>
                  <Text style={styles.emptyTitle}>No se encontraron módulos</Text>
                  <Text style={styles.emptyDesc}>
                    Prueba buscando otros términos como "safeword", "cuerdas",
                    "reporte" o "bóveda".
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

interface ModuleAccordionItemProps {
  module: ManualModule;
  isExpanded: boolean;
  isBookmarked?: boolean;
  onToggle: () => void;
  onToggleBookmark?: () => void;
  onNavigate: (path: string) => void;
}

function ModuleAccordionItem({
  module,
  isExpanded,
  isBookmarked,
  onToggle,
  onToggleBookmark,
  onNavigate,
}: ModuleAccordionItemProps) {
  // Find associated area icon for category
  const areaIcon = useMemo(() => {
    const area = MANUAL_AREAS.find((a) => a.moduleIds.includes(module.id));
    return area ? area.icon : '📖';
  }, [module.id]);

  // Determine navigation route & label based on module ID or category
  const actionTarget = useMemo(() => {
    if (module.id.includes('poly')) {
      return { path: '/poly-group', label: 'Ir a Matriz Poliamor' };
    }
    if (module.id.includes('pass_and_play')) {
      return { path: '/pass-and-play', label: 'Ir a Modo Pass & Play' };
    }
    if (module.id.includes('admin')) {
      return { path: '/admin', label: 'Ir a Admin Dashboard' };
    }
    if (module.id.includes('ai_roleplay')) {
      return { path: '/ai-roleplay', label: 'Ir a AI Roleplay Sandbox' };
    }
    if (module.id.includes('cellmate') || module.id.includes('lovense') || module.id.includes('hardware')) {
      return { path: '/hardware', label: 'Ir a Control Hardware' };
    }
    if (module.category.includes('Seguridad')) {
      return { path: '/safety-guide', label: 'Ver Guía de Seguridad' };
    }
    if (module.category.includes('Cuestionario')) {
      return { path: '/questionnaire', label: 'Ir al Cuestionario' };
    }
    if (module.category.includes('Conexiones')) {
      return { path: '/kink-feed', label: 'Ver Conexiones & Feed' };
    }
    if (module.category.includes('Castidad')) {
      return { path: '/chastity', label: 'Ver Módulo Castidad' };
    }
    if (module.category.includes('Negociación')) {
      return { path: '/negotiation', label: 'Ir a Sala de Negociación' };
    }
    if (module.category.includes('Bóveda')) {
      return { path: '/quick-profile', label: 'Ver Bóveda & Perfil' };
    }
    return { path: '/questionnaire', label: 'Ver en Aplicación' };
  }, [module]);

  // Determine callout type based on tags
  const isWarningCallout = useMemo(() => {
    return module.tags.some((t) =>
      ['seguridad', 'panico', 'alerta', 'emergencia', 'limite', 'hard_limit'].includes(
        t.toLowerCase()
      )
    );
  }, [module.tags]);

  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      {/* Header (Accordion Toggle) */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <Text style={styles.cardEmoji}>{areaIcon}</Text>
        <View style={styles.cardHeaderContent}>
          <View style={styles.cardCategoryRow}>
            <View style={styles.categoryBadgeTag}>
              <Text style={styles.categoryBadgeTagText}>{module.category}</Text>
            </View>
            <Text style={styles.stepCountLabel}>
              {module.stepByStepGuide.length} pasos
            </Text>
          </View>

          <Text style={styles.cardTitle}>{module.title}</Text>
          <Text style={styles.cardSummary}>{module.summary}</Text>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleBookmark?.();
          }}
          style={{ paddingHorizontal: 6 }}
        >
          <Text style={{ fontSize: 18 }}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>

        <View style={styles.arrowBox}>
          <Text style={styles.arrowText}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.cardDivider} />

          <Text style={styles.descriptionText}>{module.description}</Text>

          {/* Key Features List */}
          {module.keyFeatures && module.keyFeatures.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>⚡ Características Clave</Text>
              {module.keyFeatures.map((feature, idx) => (
                <View key={idx} style={styles.featureItemRow}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Numbered Step-by-step guide */}
          {module.stepByStepGuide && module.stepByStepGuide.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📌 Guía Paso a Paso</Text>
              {module.stepByStepGuide.map((step, idx) => (
                <View key={idx} style={styles.stepItemCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Practical Usage Example */}
          {module.practicalExample ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💡 Ejemplo Práctico</Text>
              <View style={styles.codeSnippetBox}>
                <Text style={styles.codeSnippetText}>{module.practicalExample}</Text>
              </View>
            </View>
          ) : null}

          {/* Callout Box */}
          <View
            style={[
              styles.calloutContainer,
              isWarningCallout ? styles.calloutWarning : styles.calloutTip,
            ]}
          >
            <Text style={styles.calloutText}>
              {isWarningCallout
                ? '⚠️ Importante: Verifica los protocolos de consentimiento, límites y safewords antes de iniciar esta práctica.'
                : '💡 Tip Pro: Puedes acceder y configurar esta función directamente en la sección correspondiente de la aplicación.'}
            </Text>
          </View>

          {/* Action Button Navigation */}
          <TouchableOpacity
            style={styles.actionBtnRoute}
            onPress={() => onNavigate(actionTarget.path)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnRouteText}>{actionTarget.label} ›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  headerBar: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 8,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  headerTitleGroup: {
    gap: 2,
  },
  mainTitle: {
    fontFamily: fonts.displaySemi,
    color: colors.text,
    fontSize: fontSize.xl,
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },

  /* Toast Notification */
  toastBox: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginVertical: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  toastText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },

  /* Search Input */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Desktop 2-Column Layout */
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  sidebar: {
    width: 320,
    gap: spacing.xs,
  },
  sectionHeaderLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  sidebarCategoryScroll: {
    flex: 1,
  },
  sidebarCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  sidebarCategoryItemActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
    ...glowShadowPrimary(0.3),
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    flex: 1,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  categoryNameActive: {
    color: colors.text,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: colors.primary,
  },
  countBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: '#ffffff',
  },

  detailPanel: {
    flex: 1,
    gap: spacing.xs,
  },

  /* Export Action Cards */
  exportCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  exportCardMobile: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  exportCardTitle: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
    marginBottom: 4,
  },
  exportButtonGroup: {
    gap: 8,
  },
  exportGridMobile: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  btnPdf: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  btnPdfText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  btnMd: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnMdText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  /* Mobile Vertical Scroll */
  mobileScrollContainer: {
    paddingBottom: spacing.xl,
  },
  mobileCategoryBar: {
    maxHeight: 44,
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  mobileChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mobileChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.primary,
    ...glowShadowPrimary(0.3),
  },
  mobileChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  mobileChipTextActive: {
    color: colors.text,
    fontWeight: '800',
  },

  /* Controls Header Bar */
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  resultCountText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlTextBtn: {
    paddingVertical: 2,
  },
  controlTextBtnLabel: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  modulesScrollList: {
    gap: spacing.md,
  },

  /* Accordion Module Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: colors.primary,
    ...glowShadowPrimary(0.2),
  },
  cardHeader: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  cardHeaderContent: {
    flex: 1,
    gap: 2,
  },
  cardCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  categoryBadgeTag: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeTagText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stepCountLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
    lineHeight: 22,
  },
  cardSummary: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  arrowBox: {
    padding: 4,
  },
  arrowText: {
    color: colors.primary,
    fontSize: 12,
  },

  /* Card Body (Expanded) */
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  descriptionText: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  detailSection: {
    gap: spacing.xs,
  },
  detailSectionTitle: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '800',
    marginBottom: 2,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureBullet: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '900',
  },
  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },

  /* Step by Step Items */
  stepItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },

  /* Code Snippet Box */
  codeSnippetBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeSnippetText: {
    color: colors.info,
    fontFamily: Platform.OS === 'web' ? 'monospace' : Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },

  /* Callout Boxes */
  calloutContainer: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  calloutTip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: colors.info,
  },
  calloutWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: colors.warning,
  },
  calloutText: {
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Direct Action Route Button */
  actionBtnRoute: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: 4,
    ...glowShadowPrimary(0.3),
  },
  actionBtnRouteText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },

  /* Empty State */
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    maxWidth: 300,
  },
});
