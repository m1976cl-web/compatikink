import React from 'react';
import { SessionsPanel } from '@/components/SessionsPanel';
import { Session, SceneAgreement, UserProfile } from '@/types';

interface SessionListProps {
  vaultOpen: boolean;
  sessions: Session[];
  sceneAgreements: { sessionId: string; agreements: SceneAgreement[] }[];
  profile: UserProfile | null;
  onRequestInvite: () => void;
  onDebrief: (target: { sessionId: string; activityId: string; activityName: string }) => void;
}

export function SessionList({
  vaultOpen,
  sessions,
  sceneAgreements,
  profile,
  onRequestInvite,
  onDebrief,
}: SessionListProps) {
  return (
    <SessionsPanel
      vaultOpen={vaultOpen}
      sessions={sessions}
      sceneAgreements={sceneAgreements}
      profile={profile}
      onRequestInvite={onRequestInvite}
      onDebrief={onDebrief}
    />
  );
}
