import {
  schedule3PhaseAftercareProtocol,
  cancelScheduledAftercareNotifications,
} from './localNotifications';

export type TrafficLight = 'green' | 'yellow' | 'red';
export type SceneModeStatus = 'idle' | 'active' | 'safeword_triggered' | 'aftercare';

export interface LiveSceneSession {
  status: SceneModeStatus;
  trafficLight: TrafficLight;
  startTime?: string;
  elapsedSeconds: number;
  checkinIntervalSeconds: number;
  lastCheckinTime?: string;
  aftercareTimerSeconds: number;
}

let activeSession: LiveSceneSession = {
  status: 'idle',
  trafficLight: 'green',
  elapsedSeconds: 0,
  checkinIntervalSeconds: 10 * 60,
  aftercareTimerSeconds: 15 * 60,
};

export function getLiveSceneSession(): LiveSceneSession {
  return activeSession;
}

export function startLiveSceneSession(): LiveSceneSession {
  cancelScheduledAftercareNotifications().catch(() => {});
  activeSession = {
    status: 'active',
    trafficLight: 'green',
    startTime: new Date().toISOString(),
    elapsedSeconds: 0,
    checkinIntervalSeconds: 10 * 60,
    lastCheckinTime: new Date().toISOString(),
    aftercareTimerSeconds: 15 * 60,
  };
  return activeSession;
}

export function setTrafficLightStatus(light: TrafficLight): LiveSceneSession {
  activeSession.trafficLight = light;
  if (light === 'red') {
    activeSession.status = 'safeword_triggered';
  }
  return activeSession;
}

export function triggerEmergencySafeword(): LiveSceneSession {
  activeSession.trafficLight = 'red';
  activeSession.status = 'safeword_triggered';
  return activeSession;
}

export function startAftercareSequence(): LiveSceneSession {
  activeSession.status = 'aftercare';
  activeSession.aftercareTimerSeconds = 15 * 60;
  schedule3PhaseAftercareProtocol().catch(() => {});
  return activeSession;
}

export function resetLiveSceneSession(): LiveSceneSession {
  cancelScheduledAftercareNotifications().catch(() => {});
  activeSession = {
    status: 'idle',
    trafficLight: 'green',
    elapsedSeconds: 0,
    checkinIntervalSeconds: 10 * 60,
    aftercareTimerSeconds: 15 * 60,
  };
  return activeSession;
}
