import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { CompatibilityReport, ReportItem } from '@/types';

interface Props {
  report: CompatibilityReport;
  guestName: string;
}

function buildTenMinuteScript(report: CompatibilityReport, guestName: string): string[] {
  const hard = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const mutual = report.items.filter((i) => i.section === 'mutual_match').slice(0, 3);
  const explore = report.items.filter((i) => i.section === 'explore_together').slice(0, 2);

  const steps: string[] = [
    '0–1 min — Check-in: “¿Cómo te sientes hablando de esto hoy? ¿Algo fuera de límites ahora mismo?”',
  ];

  if (hard.length > 0) {
    steps.push(
      `1–3 min — Límites duros primero (no negociables): ${hard
        .map((i) => i.activityName)
        .join(', ')}. Confirma en voz alta que no se cruzarán.`
    );
  } else {
    steps.push('1–3 min — Confirma que no hay conflictos de límite duro en este reporte.');
  }

  if (mutual.length > 0) {
    steps.push(
      `3–7 min — Matches mutuos: elegid 1–2 de [${mutual
        .map((i) => i.activityName)
        .join(', ')}] y acordad intensidad + safeword.`
    );
  } else {
    steps.push('3–7 min — Si no hay matches fuertes, hablad de curiosidades compartidas sin presión.');
  }

  if (explore.length > 0) {
    steps.push(
      `7–9 min — Explorar con cuidado: ${explore
        .map((i) => i.activityName)
        .join(', ')}. Solo si ambos dicen sí explícito.`
    );
  }

  steps.push(
    `9–10 min — Cierre con ${guestName}: aftercare, qué repetir, qué aparcar. Nada de “presionar el %”.`
  );

  return steps;
}

export function ReportActionPanel({ report, guestName }: Props) {
  const hardItems = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const script = buildTenMinuteScript(report, guestName);
  const scoreNote =
    hardItems.length > 0
      ? 'El % no sustituye los límites: los conflictos duros se listan aparte y no “promedian” el score.'
      : 'El % resume matches/explorar; usad el guión de abajo para conversar.';

  return (
    <View style={styles.wrap}>
      {hardItems.length > 0 ? (
        <View style={styles.hardBanner} accessibilityRole="alert">
          <Text style={styles.hardTitle}>Límites duros — leer antes del score</Text>
          <Text style={styles.hardBody}>
            Hay {hardItems.length} conflicto{hardItems.length === 1 ? '' : 's'} donde alguien marcó
            límite duro. No los ignore el porcentaje.
          </Text>
          {hardItems.map((item: ReportItem) => (
            <Text key={item.activityId} style={styles.hardItem}>
              • {item.activityName}
              {item.conversationPrompt ? ` — ${item.conversationPrompt}` : ''}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.scriptBox}>
        <Text style={styles.scriptTitle}>Guión de conversación (~10 min)</Text>
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
