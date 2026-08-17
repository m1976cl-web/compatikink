import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { listMyLocalSessions } from '@/lib/storage';
import { Session } from '@/types';
import { compareSessions, generateDiffMarkdownReport, SessionDiffReport } from '@/lib/sessionDiff';
import { SessionDiffSelector } from '@/components/session-diff/SessionDiffSelector';
import { SessionDiffHeader } from '@/components/session-diff/SessionDiffHeader';
import { SessionDiffList } from '@/components/session-diff/SessionDiffList';

export default function SessionDiffScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [oldSessionId, setOldSessionId] = useState<string | null>(null);
  const [newSessionId, setNewSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await listMyLocalSessions();
      const completeSessions = all.filter((s) => s.status === 'complete');
      setSessions(completeSessions);
      if (completeSessions.length >= 2) {
        setOldSessionId(completeSessions[0].id);
        setNewSessionId(completeSessions[completeSessions.length - 1].id);
      } else if (completeSessions.length === 1) {
        setOldSessionId(completeSessions[0].id);
        setNewSessionId(completeSessions[0].id);
      }
    })();
  }, []);

  const oldSession = sessions.find((s) => s.id === oldSessionId);
  const newSession = sessions.find((s) => s.id === newSessionId);

  const diffReport: SessionDiffReport | null = oldSession && newSession
    ? compareSessions(oldSession, newSession)
    : null;

  const handleCopyMarkdown = () => {
    if (!diffReport) return;
    const md = generateDiffMarkdownReport(diffReport);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('¡Copiado! 📋', 'Reporte de evolución en Markdown copiado al portapapeles.');
    }
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Historial & Diff de Sesiones 📈</Text>
          <Text style={styles.subtitle}>
            Compara la evolución temporal de la compatibilidad y nuevos límites entre distintas fechas con tu pareja
          </Text>
        </View>

        {/* Session Selector */}
        <SessionDiffSelector
          sessions={sessions}
          oldSessionId={oldSessionId}
          newSessionId={newSessionId}
          onSelectOldSession={setOldSessionId}
          onSelectNewSession={setNewSessionId}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!diffReport ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44 }}>📈</Text>
              <Text style={styles.emptyTitle}>Selecciona 2 sesiones completadas</Text>
              <Text style={styles.emptyText}>
                Necesitas tener al menos 2 sesiones registradas con respuestas completadas para generar una comparación de evolución temporal.
              </Text>
            </View>
          ) : (
            <>
              <SessionDiffHeader
                diff={diffReport}
                onExportMarkdown={handleCopyMarkdown}
                copied={copied}
              />

              <SessionDiffList
                newMatches={diffReport.newMatches}
                newOpenings={diffReport.newOpenings}
                newLimits={diffReport.newLimits}
              />
            </>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.lg },
  emptyText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 360 },
});
