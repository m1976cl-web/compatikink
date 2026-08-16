import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { CompatibilityReport, ReportItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { getConversationPrompt } from '@/lib/localeLabels';

interface Props {
  report: CompatibilityReport;
  guestName: string;
}

export function ReportActionPanel({ report, guestName }: Props) {
  const { t } = useTranslation();
  const hardItems = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const mutual = report.items.filter((i) => i.section === 'mutual_match').slice(0, 3);
  const explore = report.items.filter((i) => i.section === 'explore_together').slice(0, 2);

  const script: string[] = [t('report.script_0')];
  if (hardItems.length > 0) {
    script.push(t('report.script_hard', { list: hardItems.map((i) => i.activityName).join(', ') }));
  } else {
    script.push(t('report.script_no_hard'));
  }
  if (mutual.length > 0) {
    script.push(t('report.script_mutual', { list: mutual.map((i) => i.activityName).join(', ') }));
  } else {
    script.push(t('report.script_no_mutual'));
  }
  if (explore.length > 0) {
    script.push(t('report.script_explore', { list: explore.map((i) => i.activityName).join(', ') }));
  }
  script.push(t('report.script_close', { name: guestName }));

  const scoreNote = hardItems.length > 0 ? t('report.score_note_hard') : t('report.score_note_ok');

  return (
    <View style={styles.wrap}>
      {hardItems.length > 0 ? (
        <View style={styles.hardBanner} accessibilityRole="alert">
          <Text style={styles.hardTitle}>{t('report.hard_title')}</Text>
          <Text style={styles.hardBody}>{t('report.hard_body', { n: String(hardItems.length) })}</Text>
          {hardItems.map((item: ReportItem) => (
            <Text key={item.activityId} style={styles.hardItem}>
              • {item.activityName}
              {getConversationPrompt(item.section, item.activityName)
                ? ` — ${getConversationPrompt(item.section, item.activityName)}`
                : ''}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.scriptBox}>
        <Text style={styles.scriptTitle}>{t('report.script_title')}</Text>
        <Text style={styles.scoreNote}>{scoreNote}</Text>
        {script.map((line, idx) => (
          <Text key={idx} style={styles.scriptLine}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, marginBottom: spacing.lg },
  hardBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  hardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
    color: colors.danger,
  },
  hardBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  hardItem: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: 4,
  },
  scriptBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  scriptTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  scoreNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  scriptLine: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
