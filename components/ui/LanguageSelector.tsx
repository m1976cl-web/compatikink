import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';
import { SupportedLocale } from '@/data/translations';

export function LanguageSelector() {
  const { locale, changeLanguage } = useTranslation();

  return (
    <View style={styles.container}>
      {(['es', 'en'] as SupportedLocale[]).map((l) => {
        const isActive = locale === l;
        return (
          <TouchableOpacity
            key={l}
            style={[styles.btn, isActive && styles.btnActive]}
            onPress={() => changeLanguage(l)}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
              {l === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
            </Text>
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
