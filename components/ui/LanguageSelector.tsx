import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';
import { LOCALE_OPTIONS, SupportedLocale } from '@/data/localeCore';

export function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel="Language">
      {LOCALE_OPTIONS.map((opt) => {
        const isActive = locale === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => changeLanguage(opt.id as SupportedLocale)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={opt.label}
          >
            <Text style={[styles.btnText, isActive && styles.btnTextActive]}>{opt.short}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  btnTextActive: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
});
