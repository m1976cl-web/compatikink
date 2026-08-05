import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { useGlobalSearch, GlobalSearchAPI } from '@/lib/globalSearch';
import { searchItems, SearchCategory, SearchItem } from '@/lib/searchIndex';
import { triggerHaptic } from '@/lib/haptics';

const CATEGORY_TABS: { key: SearchCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'Todos', icon: '🔍' },
  { key: 'screen', label: 'Pantallas', icon: '📱' },
  { key: 'manual', label: 'Manual', icon: '📖' },
  { key: 'activity', label: 'Actividades', icon: '⚡' },
  { key: 'glossary', label: 'Glosario', icon: '📚' },
];

export function GlobalSearchModal() {
  const router = useRouter();
  const { active, close } = useGlobalSearch();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (active) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [active]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchItems(query, selectedCategory);
  }, [query, selectedCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  const handleSelectItem = (item: SearchItem) => {
    triggerHaptic.selection();
    close();
    router.push(item.route as any);
  };

  // Web keyboard navigation (ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!active || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        if (results.length > 0 && results[selectedIndex]) {
          e.preventDefault();
          handleSelectItem(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, results, selectedIndex]);

  if (!active) return null;

  return (
    <Modal
      visible={active}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={close}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Input Header */}
          <View style={styles.inputRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Buscar en Compatikink (pantallas, manual, actividades, glosario)..."
              placeholderTextColor={colors.textDim}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={close} style={styles.escBadge}>
              <Text style={styles.escBadgeText}>ESC</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsRow}>
            {CATEGORY_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabChip,
                  selectedCategory === tab.key && styles.tabChipActive,
                ]}
                onPress={() => setSelectedCategory(tab.key)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    selectedCategory === tab.key && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Results List */}
          <ScrollView
            style={styles.resultsScroll}
            contentContainerStyle={styles.resultsContent}
            keyboardShouldPersistTaps="handled"
          >
            {!query.trim() ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💡</Text>
                <Text style={styles.emptyTitle}>Búsqueda Global Instantánea</Text>
                <Text style={styles.emptySubtitle}>
                  Escribe un término (ej: "shibari", "castidad", "safeword") o navega por las pestañas. Usa ↑ ↓ y Enter para navegar.
                </Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🕯️</Text>
                <Text style={styles.emptyTitle}>Sin resultados para "{query}"</Text>
                <Text style={styles.emptySubtitle}>
                  Prueba cambiando los términos o seleccionando la pestaña "Todos".
                </Text>
              </View>
            ) : (
              results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const PressableItem = Pressable as any;
                return (
                  <PressableItem
                    key={item.id}
                    style={[
                      styles.resultItem,
                      isSelected && styles.resultItemSelected,
                    ]}
                    onPress={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <View style={styles.resultIconWrap}>
                      <Text style={styles.resultIcon}>{item.icon || '📌'}</Text>
                    </View>
                    <View style={styles.resultCopy}>
                      <View style={styles.resultHeader}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.catBadge}>
                          <Text style={styles.catBadgeText}>{item.categoryLabel}</Text>
                        </View>
                      </View>
                      {item.subtitle ? (
                        <Text style={styles.resultSubtitle} numberOfLines={2}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.arrowIcon}>➔</Text>
                  </PressableItem>
                );
              })
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 18, 0.85)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.md,
  },
  modalCard: {
    backgroundColor: '#150d24',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    maxWidth: 680,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 0 35px rgba(192, 132, 252, 0.3)' } as any) : {}),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(192, 132, 252, 0.2)',
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    height: 40,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  escBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  escBadgeText: {
    color: colors.textDim,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flexWrap: 'wrap',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  tabChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: '#c084fc',
  },
  tabIcon: {
    fontSize: 12,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  tabLabelActive: {
    color: '#c084fc',
    fontFamily: fonts.bodySemi,
  },
  resultsScroll: {
    maxHeight: 440,
  },
  resultsContent: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.md,
    marginBottom: 4,
  },
  resultItemSelected: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: '#c084fc',
  },
  resultIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIcon: {
    fontSize: 18,
  },
  resultCopy: {
    flex: 1,
    gap: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  resultTitle: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    flex: 1,
  },
  catBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    color: '#c084fc',
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  resultSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  arrowIcon: {
    color: '#c084fc',
    fontSize: 14,
    opacity: 0.8,
  },
});
