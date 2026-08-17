import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

export interface ManualSearchAndExportProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportPDF: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
  isMobile?: boolean;
}

export function ManualSearchAndExport({
  searchQuery,
  onSearchChange,
  onExportPDF,
  onCopyMarkdown,
  onDownloadMarkdown,
  isMobile = false,
}: ManualSearchAndExportProps) {
  if (isMobile) {
    return (
      <>
        {/* Mobile Search Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en el manual..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mobile Export Card */}
        <View style={styles.exportCardMobile}>
          <Text style={styles.exportCardTitle}>⚡ Herramientas de Exportación</Text>
          <View style={styles.exportGridMobile}>
            <TouchableOpacity
              style={styles.btnPdf}
              onPress={onExportPDF}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPdfText}>🖨️ PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMd}
              onPress={onCopyMarkdown}
              activeOpacity={0.8}
            >
              <Text style={styles.btnMdText}>📋 Copiar MD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMd}
              onPress={onDownloadMarkdown}
              activeOpacity={0.8}
            >
              <Text style={styles.btnMdText}>💾 Descargar MD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {/* Search Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tema, safewords, cuerdas..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
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
            onPress={onExportPDF}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPdfText}>🖨️ Exportar a PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnMd}
            onPress={onCopyMarkdown}
            activeOpacity={0.8}
          >
            <Text style={styles.btnMdText}>📋 Copiar Markdown</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnMd}
            onPress={onDownloadMarkdown}
            activeOpacity={0.8}
          >
            <Text style={styles.btnMdText}>💾 Descargar Markdown</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  exportCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  exportCardTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exportButtonGroup: {
    gap: spacing.xs,
  },
  exportCardMobile: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  exportGridMobile: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  btnPdf: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    flex: 1,
  },
  btnPdfText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  btnMd: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    flex: 1,
  },
  btnMdText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
});
