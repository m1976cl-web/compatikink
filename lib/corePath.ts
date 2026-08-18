import type { Session, UserProfile } from '@/types';

export type CoreStep = 1 | 2 | 3;
export type CoreStepStatus = 'todo' | 'doing' | 'done';

export interface CorePathState {
  currentStep: CoreStep;
  step1: CoreStepStatus;
  step2: CoreStepStatus;
  step3: CoreStepStatus;
  hasProfile: boolean;
  hasResponses: boolean;
  vaultOpen: boolean;
  waitingSession: Session | undefined;
  completeSession: Session | undefined;
  step2Locked: boolean;
  step3Locked: boolean;
}

/**
 * Linear tester path: (1) base answers → (2) invite/wait → (3) report ready.
 * Later steps stay locked until prerequisites exist.
 */
export function getCorePathState(
  profile: UserProfile | null,
  vaultOpen: boolean,
  sessions: Session[]
): CorePathState {
  const hasProfile = Boolean(profile);
  const hasResponses = Boolean(profile?.baseResponses && profile.baseResponses.length > 0);
  const waitingSession = sessions.find((s) => s.status === 'waiting');
  const completeSession = sessions.find((s) => s.status === 'complete');

  const answersReady = hasResponses && vaultOpen;
  const step1: CoreStepStatus = answersReady ? 'done' : 'doing';
  const step2: CoreStepStatus = !answersReady ? 'todo' : completeSession ? 'done' : 'doing';
  const step3: CoreStepStatus = completeSession ? 'done' : 'todo';

  let currentStep: CoreStep = 1;
  if (!answersReady) currentStep = 1;
  else if (!completeSession) currentStep = 2;
  else currentStep = 3;

  return {
    currentStep,
    step1,
    step2,
    step3,
    hasProfile,
    hasResponses,
    vaultOpen,
    waitingSession,
    completeSession,
    step2Locked: !answersReady,
    step3Locked: !completeSession,
  };
}
