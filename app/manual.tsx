import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import { useResponsive } from '@/hooks/useResponsive';
import {
  MANUAL_AREAS,
  MANUAL_MODULES,
  loadManualBookmarks,
  toggleManualBookmark,
} from '@/data/manualData';
import { exportManualAsPDF } from '@/lib/exportManualPDF';
import { copyManualAsMarkdown, downloadManualAsMarkdown } from '@/lib/exportMarkdown';
import { ManualHeaderBar } from '@/components/manual/ManualHeaderBar';
import { ManualSearchAndExport } from '@/components/manual/ManualSearchAndExport';
import { ManualSidebarNavigation } from '@/components/manual/ManualSidebarNavigation';
import { ModuleAccordionItem } from '@/components/manual/ModuleAccordionItem';

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
  useEffect(() => {
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
  }, [searchQuery, selectedAreaId, showBookmarksOnly, bookmarkedIds]);

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
        <ManualHeaderBar
          onBack={() => router.back()}
          copiedToast={copiedToast}
        />

        <NoxHost scene="manual" variant="compact" />

        {/* Responsive Layout: Desktop 2-Column vs Mobile Vertical Stack */}
        {isDesktop ? (
          <View style={styles.desktopLayout}>
            {/* Left Category Sidebar (~30%) */}
            <View style={styles.sidebar}>
              <ManualSearchAndExport
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onExportPDF={handleExportPDF}
                onCopyMarkdown={handleCopyMarkdown}
                onDownloadMarkdown={handleDownloadMarkdown}
              />

              <ManualSidebarNavigation
                selectedAreaId={selectedAreaId}
                showBookmarksOnly={showBookmarksOnly}
                bookmarkedCount={bookmarkedIds.length}
                onSelectArea={(areaId) => {
                  setShowBookmarksOnly(false);
                  setSelectedAreaId(areaId);
                }}
                onToggleShowBookmarks={() => {
                  setShowBookmarksOnly(!showBookmarksOnly);
                  setSelectedAreaId('all');
                }}
              />
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
            <ManualSearchAndExport
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onExportPDF={handleExportPDF}
              onCopyMarkdown={handleCopyMarkdown}
              onDownloadMarkdown={handleDownloadMarkdown}
              isMobile
            />

            <ManualSidebarNavigation
              selectedAreaId={selectedAreaId}
              showBookmarksOnly={showBookmarksOnly}
              bookmarkedCount={bookmarkedIds.length}
              onSelectArea={(areaId) => {
                setShowBookmarksOnly(false);
                setSelectedAreaId(areaId);
              }}
              onToggleShowBookmarks={() => {
                setShowBookmarksOnly(!showBookmarksOnly);
                setSelectedAreaId('all');
              }}
              isMobile
            />

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.md,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  sidebar: {
    width: '32%',
    maxHeight: '100%',
  },
  detailPanel: {
    flex: 1,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultCountText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlTextBtn: {
    padding: 2,
  },
  controlTextBtnLabel: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  modulesScrollList: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  mobileScrollContainer: {
    paddingBottom: spacing.xxl,
  },
  emptyStateContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  emptyDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
});
