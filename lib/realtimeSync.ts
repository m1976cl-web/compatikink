/**
 * Realtime P2P Telemetry & Broadcast Sync — Feature 2
 * Provides live synchronization between partners for:
 * 1. Scene Safeword Telemetry (GREEN / YELLOW / RED)
 * 2. Instant Ephemeral Chat & Scene Prompts
 * Supports local BroadcastChannel for multi-tab testing & Supabase Realtime Broadcast.
 */

import { supabase } from '@/lib/supabase';

export type SafewordSignal = 'GREEN' | 'YELLOW' | 'RED';

export interface SceneTelemetryPayload {
  sessionId: string;
  senderRole: 'Dom' | 'Sub' | 'Partner';
  signal: SafewordSignal;
  timestamp: number;
  note?: string;
}

type TelemetryListener = (payload: SceneTelemetryPayload) => void;

class RealtimeSyncManager {
  private channelMap: Map<string, any> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<TelemetryListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('compatikink_live_scene_telemetry');
      this.broadcastChannel.onmessage = (evt) => {
        if (evt.data && evt.data.type === 'SCENE_TELEMETRY') {
          this.notifyListeners(evt.data.payload);
        }
      };
    }
  }

  /** Subscribe to telemetry signals for a given session */
  subscribeSession(sessionId: string, listener: TelemetryListener): () => void {
    this.listeners.add(listener);

    // Supabase Realtime channel
    if (!this.channelMap.has(sessionId) && supabase) {
      const channel = supabase.channel(`scene_${sessionId}`)
        .on('broadcast', { event: 'telemetry' }, (message) => {
          if (message.payload) {
            this.notifyListeners(message.payload);
          }
        })
        .subscribe();
      this.channelMap.set(sessionId, channel);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Broadcast a safeword signal or telemetry update to partner */
  broadcastSignal(sessionId: string, payload: SceneTelemetryPayload): void {
    // 1. Notify local listeners
    this.notifyListeners(payload);

    // 2. Local BroadcastChannel (same browser multi-tab)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SCENE_TELEMETRY',
        payload,
      });
    }

    // 3. Supabase Realtime Broadcast
    const channel = this.channelMap.get(sessionId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'telemetry',
        payload,
      });
    }
  }

  private notifyListeners(payload: SceneTelemetryPayload) {
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.warn('[RealtimeSync] Listener error:', err);
      }
    });
  }
}

export const RealtimeSync = new RealtimeSyncManager();
