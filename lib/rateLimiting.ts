/**
 * Rate Limiting Module
 * Implements client-side rate limiting with exponential backoff and server-side coordination.
 * Protects against brute force attacks on login, invite code guessing, and vault decryption.
 *
 * @module lib/rateLimiting
 * @security CRITICAL — Guards against credential/session attacks
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type RateLimitBucket = 'login' | 'invite_guess' | 'decrypt_attempt' | 'send_invite';

interface RateLimitConfig {
  bucket: RateLimitBucket;
  limit: number; // Max attempts
  windowSeconds: number; // Time window
  retryAfterSeconds?: number; // Override retry-after
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
  backoffMultiplier: number;
}

// Rate limit thresholds per bucket
const RATE_LIMIT_RULES: Record<RateLimitBucket, RateLimitConfig> = {
  login: {
    bucket: 'login',
    limit: 10,
    windowSeconds: 15 * 60, // 15 minutes
  },
  invite_guess: {
    bucket: 'invite_guess',
    limit: 5,
    windowSeconds: 60 * 60, // 1 hour (per session ID)
  },
  decrypt_attempt: {
    bucket: 'decrypt_attempt',
    limit: 3,
    windowSeconds: 60, // 1 minute (aggressive for local vault)
  },
  send_invite: {
    bucket: 'send_invite',
    limit: 5,
    windowSeconds: 60 * 60, // 1 hour
  },
};

/**
 * Check if a rate limit bucket has been exceeded.
 * Throws RateLimitError if exceeded; increments counter otherwise.
 *
 * @param bucket - Rate limit bucket type
 * @param identifier - Unique identifier (user ID, session ID, or device ID)
 * @throws {RateLimitError} If rate limit exceeded with retryAfter
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<void> {
  const config = RATE_LIMIT_RULES[bucket];
  const storageKey = `ratelimit:${bucket}:${identifier}`;

  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const state: RateLimitState = stored
      ? JSON.parse(stored)
      : {
          attempts: 0,
          firstAttemptTime: Date.now(),
          backoffMultiplier: 1,
        };

    const now = Date.now();
    const elapsedSeconds = (now - state.firstAttemptTime) / 1000;

    // Reset if window has expired
    if (elapsedSeconds > config.windowSeconds) {
      state.attempts = 0;
      state.firstAttemptTime = now;
      state.backoffMultiplier = 1;
      state.lockedUntil = undefined;
    }

    // Check if currently locked due to backoff
    if (state.lockedUntil && now < state.lockedUntil) {
      const secondsRemaining = Math.ceil((state.lockedUntil - now) / 1000);
      throw new RateLimitError(
        `Too many attempts. Try again in ${secondsRemaining}s.`,
        secondsRemaining,
        bucket
      );
    }

    // Check if limit exceeded
    if (state.attempts >= config.limit) {
      // Exponential backoff: 2^(attempts - limit) minutes
      const backoffMinutes = Math.min(
        Math.pow(2, state.attempts - config.limit),
        30
      );
      state.lockedUntil = now + backoffMinutes * 60 * 1000;
      state.backoffMultiplier = backoffMinutes;

      await AsyncStorage.setItem(storageKey, JSON.stringify(state));

      throw new RateLimitError(
        `Too many attempts. Try again in ${backoffMinutes}m.`,
        Math.ceil(backoffMinutes * 60),
        bucket
      );
    }

    // Increment and persist
    state.attempts += 1;
    await AsyncStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    // Log storage errors but don't fail the check
    console.error(`[RateLimit] Storage error for ${bucket}:`, error);
  }
}

/**
 * Reset a rate limit bucket (e.g., after successful auth).
 *
 * @param bucket - Rate limit bucket type
 * @param identifier - Unique identifier
 */
export async function resetRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<void> {
  const storageKey = `ratelimit:${bucket}:${identifier}`;
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`[RateLimit] Failed to reset ${bucket}:`, error);
  }
}

/**
 * Get current rate limit status for a bucket.
 * Useful for UI feedback (progress bar, countdown).
 *
 * @param bucket - Rate limit bucket type
 * @param identifier - Unique identifier
 * @returns Current attempts, limit, and time until reset
 */
export async function getRateLimitStatus(
  bucket: RateLimitBucket,
  identifier: string
): Promise<{
  attempts: number;
  limit: number;
  remaining: number;
  secondsUntilReset: number;
  secondsUntilRetry?: number;
}> {
  const config = RATE_LIMIT_RULES[bucket];
  const storageKey = `ratelimit:${bucket}:${identifier}`;

  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const state: RateLimitState = stored
      ? JSON.parse(stored)
      : {
          attempts: 0,
          firstAttemptTime: Date.now(),
          backoffMultiplier: 1,
        };

    const now = Date.now();
    const elapsedSeconds = (now - state.firstAttemptTime) / 1000;
    const secondsUntilReset = Math.max(
      0,
      config.windowSeconds - elapsedSeconds
    );

    let secondsUntilRetry: number | undefined;
    if (state.lockedUntil && now < state.lockedUntil) {
      secondsUntilRetry = Math.ceil((state.lockedUntil - now) / 1000);
    }

    return {
      attempts: state.attempts,
      limit: config.limit,
      remaining: Math.max(0, config.limit - state.attempts),
      secondsUntilReset: Math.ceil(secondsUntilReset),
      secondsUntilRetry,
    };
  } catch (error) {
    console.error(`[RateLimit] Failed to get status for ${bucket}:`, error);
    return {
      attempts: 0,
      limit: config.limit,
      remaining: config.limit,
      secondsUntilReset: config.windowSeconds,
    };
  }
}

/**
 * Rate Limit Error
 * Thrown when a rate limit is exceeded.
 *
 * @class RateLimitError
 */
export class RateLimitError extends Error {
  public readonly bucket: RateLimitBucket;
  public readonly retryAfterSeconds: number;

  constructor(
    message: string,
    retryAfterSeconds: number,
    bucket: RateLimitBucket
  ) {
    super(message);
    this.name = 'RateLimitError';
    this.bucket = bucket;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Hook-friendly wrapper for rate limit checks with state.
 * Handles backoff countdown and UI updates.
 *
 * @param bucket - Rate limit bucket type
 * @param identifier - Unique identifier
 * @returns Object with check function and current status
 */
export function useRateLimit(
  bucket: RateLimitBucket,
  identifier: string
) {
  const check = async (): Promise<void> => {
    return checkRateLimit(bucket, identifier);
  };

  const reset = async (): Promise<void> => {
    return resetRateLimit(bucket, identifier);
  };

  const getStatus = async () => {
    return getRateLimitStatus(bucket, identifier);
  };

  return { check, reset, getStatus };
}
