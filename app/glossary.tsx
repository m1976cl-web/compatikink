import { useState, useMemo } from 'react';
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
import { GLOSSARY, GlossaryTerm } from '@/data/glossaryData';

export default function GlossaryScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = useMemo(() => {
    const letters = new Set(GLOSSARY.map((t) => t.term[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const filtered = useMemo(() => {
    let results = GLOSSARY;
    if (selectedLetter) {
      results = results.filter((t) => t.term[0].toUpperCase() === selectedLetter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, selectedLetter]);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Glosario Kink</Text>
          <Text style={styles.subtitle}>
            {GLOSSARY.length} términos · Educación y consentimiento
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar término..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setSelectedLetter(null);
            }}
          />
        </View>

        {/* Alphabet bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alphabetBar}>
          <TouchableOpacity
            style={[styles.letterChip, !selectedLetter && styles.letterChipActive]}
            onPress={() => setSelectedLetter(null)}
          >
            <Text style={[styles.letterText, !selectedLetter && styles.letterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {alphabet.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={[styles.letterChip, selectedLetter === letter && styles.letterChipActive]}
              onPress={() => {
                setSelectedLetter(selectedLetter === letter ? null : letter);
                setSearch('');
              }}
            >
              <Text style={[styles.letterText, selectedLetter === letter && styles.letterTextActive]}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <Text style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'término' : 'términos'}
        </Text>

        {/* Terms list */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => (
            <View key={item.term} style={styles.termCard}>
              <Text style={styles.termName}>{item.term}</Text>
              <Text style={styles.termDef}>{item.definition}</Text>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤔</Text>
              <Text style={styles.emptyText}>No se encontraron términos</Text>
            </View>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  containerDesktop: {
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSize.md,
  },
  alphabetBar: {
    marginTop: spacing.sm,
    maxHeight: 40,
    flexGrow: 0,
  },
  letterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
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
    fontWeight: '700',
  },
  letterTextActive: {
    color: '#fff',
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  termName: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  termDef: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
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
    fontSize: fontSize.md,
  },
});
