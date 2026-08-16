import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { AppHeader } from '@/components/AppHeader';
import { NoxHost } from '@/components/nox';
import { VaultLockGate } from '@/components/VaultLockGate';
import { colors, fonts, fontSize, spacing, typography } from '@/constants/theme';
import { filterReportForSharing, generateReport } from '@/lib/compatibility';
import { getSessionByToken } from '@/lib/sessions';
import { getInitiatorToken } from '@/lib/storage';
import { VaultLockGateAPI } from '@/lib/cryptoVault';
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
    label: 'Completo (sin intereses privados)',
    sections: ['mutual_match', 'explore_together', 'role_mismatch', 'guest_only', 'hard_limit_conflict'],
  },
];

export default function ShareScreen() {
  const router = useRouter();
  const { token: paramToken } = useLocalSearchParams<{ token?: string }>();
  const [mode, setMode] = useState<ShareMode>('mutual_only');
  const [previewCount, setPreviewCount] = useState(0);
  const [unlocked, setUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());

  useEffect(() => VaultLockGateAPI.subscribe((s) => setUnlocked(s.unlocked)), []);

  useEffect(() => {
    if (!unlocked) return;
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
  }, [paramToken, mode, unlocked]);

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
      `\n\nConversemos con calma y consentimiento.`;

    try {
      await Share.share({ message });
      Alert.alert('Compartido', 'Elige la app donde enviar el resumen.');
    } catch {
      await Clipboard.setStringAsync(message);
      Alert.alert('Copiado', 'El resumen se ha copiado al portapapeles.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Button title="← Volver" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <AppHeader
          title="¿Qué compartir?"
          subtitle="Tú controlas qué ve la otra persona. Tus intereses no compartidos no se incluyen por defecto."
        />
        <NoxHost scene="share" variant="compact" />

        <VaultLockGate
          unlocked={unlocked}
          title="Compartir reporte"
          subtitle="Desbloquea la bóveda para leer la sesión y generar el resumen."
        >
          {MODES.map((m) => (
            <Button
              key={m.id}
              title={m.label}
              onPress={() => setMode(m.id)}
              variant={mode === m.id ? 'primary' : 'secondary'}
              style={styles.modeBtn}
            />
          ))}

          <Text style={styles.preview}>Vista previa: {previewCount} actividades en este filtro</Text>
          <Button title="Compartir" onPress={share} />
        </VaultLockGate>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.lg,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  back: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  modeBtn: { marginBottom: spacing.sm },
  preview: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginVertical: spacing.lg,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
});
