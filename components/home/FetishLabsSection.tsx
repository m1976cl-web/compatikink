import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Section } from '@/components/Section';
import { colors, fontSize, radii, spacing } from '@/constants/theme';
import { useTranslation } from '@/lib/i18n';

const LABS = [
  {
    route: '/marketplace-dark',
    emoji: '🛍️',
    titleKey: 'labs.market.title',
    descKey: 'labs.market.desc',
    accent: '#38bdf8',
  },
  {
    route: '/foot-fetish',
    emoji: '🦶',
    titleKey: 'labs.foot.title',
    descKey: 'labs.foot.desc',
    accent: '#f472b6',
  },
  {
    route: '/tribute',
    emoji: '✉️',
    titleKey: 'labs.tribute.title',
    descKey: 'labs.tribute.desc',
    accent: '#c084fc',
  },
  {
    route: '/sissy-training',
    emoji: '🎀',
    titleKey: 'labs.sissy.title',
    descKey: 'labs.sissy.desc',
    accent: '#fbbf24',
  },
  {
    route: '/chastity',
    emoji: '🔒',
    titleKey: 'labs.chastity.title',
    descKey: 'labs.chastity.desc',
    accent: '#a78bfa',
  },
] as const;

/** Shown only when EXPO_PUBLIC_MVP=0 (FetishSuite sibling). Preview / demo. */
export function FetishLabsSection() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Section title={t('labs.section.title')} subtitle={t('labs.section.subtitle')}>
      <View style={styles.grid}>
        {LABS.map((lab) => (
          <TouchableOpacity
            key={lab.route}
            style={[styles.card, { borderColor: lab.accent }]}
            onPress={() => router.push(lab.route as never)}
          >
            <View style={styles.header}>
              <Text style={styles.emoji}>{lab.emoji}</Text>
              <View style={[styles.pill, { backgroundColor: `${lab.accent}33` }]}>
                <Text style={[styles.pillText, { color: lab.accent }]}>{t('labs.badge')}</Text>
              </View>
            </View>
            <Text style={styles.title}>{t(lab.titleKey)}</Text>
            <Text style={styles.desc}>{t(lab.descKey)}</Text>
            <Text style={[styles.action, { color: lab.accent }]}>{t('labs.open')} ➔</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md, marginVertical: spacing.xs },
  card: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emoji: { fontSize: 28 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.md },
  pillText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  desc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
  action: { fontSize: fontSize.xs, fontWeight: '800', marginTop: 4 },
});
