import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Share, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { filterReportForSharing, generateReport } from '@/lib/compatibility';
import { getSessionByToken } from '@/lib/sessions';
import { getInitiatorToken } from '@/lib/storage';
import { ReportSectionType, SECTION_LABELS } from '@/types';

type ShareMode = 'mutual_only' | 'mutual_explore' | 'full_safe';

const MODES: { id: ShareMode; label: string; sections: ReportSectionType[] }[] = [
  {
    id: 'mutual_only',
    label: 'Solo matches mutuos',
    sections: ['mutual_match'],
  },
  {
    id: 'mutual_explore',
    label: 'Matches + explorar juntos',
    sections: ['mutual_match', 'explore_together'],
  },
  {
    id: 'full_safe',
    label: 'Completo (sin tus intereses privados)',
    sections: ['mutual_match', 'explore_together', 'role_mismatch', 'guest_only', 'hard_limit_conflict'],
  },
];

export default function ShareScreen() {
  const { token: paramToken } = useLocalSearchParams<{ token?: string }>();
  const [mode, setMode] = useState<ShareMode>('mutual_only');
  const [previewCount, setPreviewCount] = useState(0);

  useEffect(() => {
    (async () => {
      const token = paramToken || (await getInitiatorToken());
      if (!token) return;
      const session = await getSessionByToken(token);
      if (!session?.guestResponses) return;
      const full = generateReport(session.id, session.initiatorResponses, session.guestResponses);
      const selected = MODES.find((m) => m.id === mode)!;
      const filtered = filterReportForSharing(full, selected.sections);
      setPreviewCount(filtered.items.length);
    })();
  }, [paramToken, mode]);

  const share = async () => {
    const token = paramToken || (await getInitiatorToken());
    if (!token) return;
    const session = await getSessionByToken(token);
    if (!session?.guestResponses) return;

    const full = generateReport(session.id, session.initiatorResponses, session.guestResponses);
    const selected = MODES.find((m) => m.id === mode)!;
    const filtered = filterReportForSharing(full, selected.sections);

    const lines = filtered.items.map(
      (i) => `• ${i.activityName} — ${SECTION_LABELS[i.section]}`
    );

    const message =
      `Compatikink — Resultados compartidos\n` +
      `Compatibilidad: ${filtered.compatibilityScore}%\n` +
      `Matches: ${filtered.mutualMatchCount} · Explorar: ${filtered.exploreCount}\n\n` +
      (lines.length > 0 ? lines.join('\n') : 'Sin coincidencias en este filtro.') +
      `\n\n💬 Conversemos con calma y consentimiento.`;

    try {
      await Share.share({ message });
      Alert.alert('Compartido', 'Elige la app donde enviar el resumen.');
    } catch (e) {
      await Clipboard.setStringAsync(message);
      Alert.alert('Copiado', 'El resumen del reporte se ha copiado al portapapeles.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>¿Qué compartir?</Text>
        <Text style={styles.desc}>
          Tú controlas qué ve la otra persona. Tus intereses no compartidos no se incluyen por defecto.
        </Text>

        {MODES.map((m) => (
          <Button
            key={m.id}
            title={m.label}
            onPress={() => setMode(m.id)}
            variant={mode === m.id ? 'primary' : 'secondary'}
            style={styles.modeBtn}
          />
        ))}

        <Text style={styles.preview}>
          Vista previa: {previewCount} actividades en este filtro
        </Text>

        <Button title="Compartir por WhatsApp / etc." onPress={share} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  desc: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modeBtn: { marginBottom: spacing.sm },
  preview: {
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
});
