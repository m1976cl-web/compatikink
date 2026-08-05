/**
 * SessionsPanel.tsx
 * Panel de historial de sesiones e acuerdos de escena.
 * Antes era renderSessions() + renderAgreements() inlined en app/index.tsx (líneas 658-775).
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { VaultLockGate } from '@/components/VaultLockGate';
import { exportSceneAgreementPDF } from '@/lib/exportPDF';
import { Session, SceneAgreement } from '@/types';
import { UserProfile } from '@/types';

interface SessionsPanelProps {
  vaultOpen: boolean;
  sessions: Session[];
  sceneAgreements: { sessionId: string; agreements: SceneAgreement[] }[];
  profile: UserProfile | null;
  onRequestInvite: () => void;
  onDebrief: (target: { sessionId: string; activityId: string; activityName: string }) => void;
}

export function SessionsPanel({
  vaultOpen,
  sessions,
  sceneAgreements,
  profile,
  onRequestInvite,
  onDebrief,
}: SessionsPanelProps) {
  const router = useRouter();

  return (
    <>
      {/* ── Historial de Sesiones ── */}
      <Section title="Historial" subtitle="Invitaciones y reportes en este dispositivo.">
        {!vaultOpen ? (
          <VaultLockGate
            title="Historial cifrado"
            subtitle="Desbloquea la bóveda para ver sesiones y acuerdos sensibles."
            showLockButton={false}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            title="Sin sesiones aún"
            description="Crea una invitación o completa un cuestionario para empezar."
            actionLabel="Crear invitación"
            onAction={onRequestInvite}
          />
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((s) => {
              const isInitiator = s.initiatorNickname === profile?.nickname;
              const partner = isInitiator
                ? s.guestNickname || 'Invitado'
                : s.initiatorNickname || 'Iniciador';
              const isComplete = s.status === 'complete';
              const isWaiting  = s.status === 'waiting';
              const isExpired  = !isComplete && s.expiresAt ? new Date(s.expiresAt) < new Date() : false;

              const statusLabel = isExpired ? 'Expirada'
                : isComplete ? 'Completado'
                : isWaiting  ? 'Esperando'
                : 'Borrador';
              const statusColor = isExpired  ? colors.danger
                : isComplete ? colors.success
                : isWaiting  ? colors.warning
                : colors.textMuted;

              return (
                <View key={s.id} style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <Text style={[styles.sessionStatus, { color: statusColor }]}>{statusLabel}</Text>
                    <Text style={styles.sessionCode}>{s.inviteCode}</Text>
                  </View>
                  <Text style={styles.sessionPartner}>{partner}</Text>
                  <View style={styles.sessionActions}>
                    {isComplete ? (
                      <Button
                        title="Reporte"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/report', params: { token: s.initiatorToken } })}
                      />
                    ) : (
                      <Button
                        title="Invitar"
                        variant="secondary"
                        style={styles.sessionActionBtn}
                        onPress={() => router.push({ pathname: '/invite', params: { token: s.initiatorToken } })}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Section>

      {/* ── Acuerdos de Escena ── */}
      {vaultOpen && sceneAgreements.length > 0 && (
        <Section title="Acuerdos de escena" subtitle="Safewords y límites por pareja.">
          {sceneAgreements.map(({ sessionId, agreements }) => {
            const session = sessions.find((s) => s.id === sessionId);
            const partner = session
              ? session.guestNickname || session.initiatorNickname || 'Invitado'
              : sessionId.slice(0, 8);
            return (
              <View key={sessionId} style={styles.agreementGroup}>
                <Text style={styles.agreementPartner}>Con {partner}</Text>
                {agreements.map((ag) => (
                  <View key={ag.id} style={styles.agreementRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.agreementActivity}>{ag.activityName}</Text>
                      <Text style={styles.agreementSafewords}>
                        {ag.safewordGreen} · {ag.safewordYellow} · {ag.safewordRed}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onDebrief({ sessionId: ag.sessionId, activityId: ag.activityId, activityName: ag.activityName })}
                    >
                      <Text style={styles.linkAction}>Debrief</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => exportSceneAgreementPDF(ag, partner)}>
                      <Text style={styles.linkAction}>PDF</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          })}
        </Section>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sessionsList:      { gap: spacing.sm },
  sessionCard:       { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, padding: spacing.md, marginBottom: spacing.sm },
  sessionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  sessionStatus:     { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 0.8, textTransform: 'uppercase' },
  sessionCode:       { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 1 },
  sessionPartner:    { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.md, marginBottom: spacing.sm },
  sessionActions:    { alignItems: 'flex-start' },
  sessionActionBtn:  { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  agreementGroup:    { marginBottom: spacing.md, gap: spacing.xs },
  agreementPartner:  { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, color: colors.primary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.xs },
  agreementRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle },
  agreementActivity: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: fontSize.sm },
  agreementSafewords:{ fontFamily: fonts.body, color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  linkAction:        { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.xs },
});
