/**
 * Unified Error Handler & Catalog
 * Centralizes error messages, recovery actions, and offline-first queuing.
 *
 * @module lib/errorHandler
 */

import { RateLimitError } from './rateLimiting';

export type ErrorCategory =
  | 'auth'
  | 'session'
  | 'vault'
  | 'network'
  | 'storage'
  | 'sync'
  | 'validation'
  | 'unknown';

export interface ErrorAction {
  label: string;
  onPress: () => void | Promise<void>;
  style?: 'default' | 'destructive' | 'cancel';
}

export interface ErrorSpec {
  title: string;
  message: string | ((context: Record<string, any>) => string);
  category: ErrorCategory;
  icon?: 'warning' | 'error' | 'info' | 'offline';
  actions?: ErrorAction[];
  retry?: boolean;
  offline?: boolean; // Can be queued for offline sync
}

export type ErrorCode =
  | 'SESSION_EXPIRED'
  | 'SESSION_NOT_FOUND'
  | 'VAULT_LOCKED'
  | 'VAULT_DECRYPT_FAILED'
  | 'VAULT_ENCRYPT_FAILED'
  | 'RATE_LIMIT'
  | 'NETWORK_TIMEOUT'
  | 'NETWORK_OFFLINE'
  | 'INVALID_PIN'
  | 'INVALID_CODE'
  | 'BACKUP_CORRUPTED'
  | 'SYNC_CONFLICT'
  | 'UNKNOWN';

/**
 * Master error catalog.
 * Strings support interpolation: {variable} for simple values,
 * {count, plural, one {...} other {...}} for pluralization.
 */
export const ERROR_CATALOG: Record<ErrorCode, ErrorSpec> = {
  SESSION_EXPIRED: {
    title: 'Sesión expirada',
    message:
      'La invitación caducó (máx. 48h). Pide al iniciador que genere una nueva.',
    category: 'session',
    icon: 'warning',
    actions: [
      {
        label: 'Volver a home',
        onPress: () => {
          // Handled by caller
        },
      },
    ],
  },

  SESSION_NOT_FOUND: {
    title: 'Sesión no encontrada',
    message:
      'No pudimos acceder a esa sesión. Verifica el código de invitación.',
    category: 'session',
    icon: 'error',
    actions: [
      {
        label: 'Reintentar',
        onPress: () => {},
      },
    ],
    retry: true,
  },

  VAULT_LOCKED: {
    title: 'Bóveda bloqueada',
    message:
      'Tu bóveda está protegida por PIN. Desbloquea para continuar.',
    category: 'vault',
    icon: 'warning',
    actions: [
      {
        label: 'Desbloquear',
        onPress: () => {},
      },
    ],
  },

  VAULT_DECRYPT_FAILED: {
    title: 'Error al descifrar',
    message:
      'No pudimos descifrar tu bóveda. Verifica tu PIN o restaura desde backup.',
    category: 'vault',
    icon: 'error',
    actions: [
      {
        label: 'Reintentar',
        onPress: () => {},
        style: 'default',
      },
      {
        label: 'Restaurar backup',
        onPress: () => {},
        style: 'default',
      },
    ],
    retry: true,
  },

  VAULT_ENCRYPT_FAILED: {
    title: 'Error al guardar',
    message:
      'No pudimos guardar tu bóveda. Verifica el espacio en dispositivo.',
    category: 'vault',
    icon: 'error',
    retry: true,
  },

  RATE_LIMIT: {
    title: 'Demasiados intentos',
    message: (ctx) => {
      const bucket = ctx.bucket || 'unknown';
      const seconds = ctx.retryAfterSeconds || 60;
      const minutes = Math.ceil(seconds / 60);

      if (bucket === 'decrypt_attempt') {
        return `Bloqueado por seguridad. Intenta de nuevo en ${seconds}s.`;
      }
      if (seconds > 60) {
        return `Demasiados intentos. Intenta de nuevo en ${minutes}m.`;
      }
      return `Demasiados intentos. Intenta de nuevo en ${seconds}s.`;
    },
    category: 'auth',
    icon: 'warning',
  },

  NETWORK_TIMEOUT: {
    title: 'Tiempo agotado',
    message:
      'La conexión tardó demasiado. Verifica tu conexión e intenta de nuevo.',
    category: 'network',
    icon: 'offline',
    retry: true,
  },

  NETWORK_OFFLINE: {
    title: 'Sin conexión',
    message:
      'Estás offline. Puedes responder el cuestionario; se sincronizará cuando haya conexión.',
    category: 'network',
    icon: 'offline',
    offline: true,
  },

  INVALID_PIN: {
    title: 'PIN incorrecto',
    message: (ctx) => {
      const remaining = ctx.remaining || 'varios';
      return `PIN incorrecto. Te quedan ${remaining} intentos.`;
    },
    category: 'vault',
    icon: 'warning',
    retry: true,
  },

  INVALID_CODE: {
    title: 'Código inválido',
    message:
      'El código de invitación no es válido o ya expiró. Pide uno nuevo.',
    category: 'validation',
    icon: 'error',
  },

  BACKUP_CORRUPTED: {
    title: 'Backup dañado',
    message:
      'El backup no se pudo restaurar. Intenta con otro o contacta soporte.',
    category: 'storage',
    icon: 'error',
  },

  SYNC_CONFLICT: {
    title: 'Conflicto de sincronización',
    message:
      'Tu bóveda se modificó en otro dispositivo. Descarga la versión más reciente.',
    category: 'sync',
    icon: 'info',
    actions: [
      {
        label: 'Recargar',
        onPress: () => {},
      },
    ],
  },

  UNKNOWN: {
    title: 'Error inesperado',
    message:
      'Algo salió mal. Por favor, intenta de nuevo o contacta a soporte.',
    category: 'unknown',
    icon: 'error',
    retry: true,
  },
};

/**
 * Resolve an error to a display-friendly ErrorSpec.
 * Handles native errors, custom errors, and fallback to UNKNOWN.
 *
 * @param error - Any error or exception
 * @param context - Additional context for message interpolation
 * @returns ErrorSpec with title, message, and actions
 */
export function resolveError(
  error: unknown,
  context: Record<string, any> = {}
): {
  spec: ErrorSpec;
  code: ErrorCode;
} {
  let code: ErrorCode = 'UNKNOWN';
  let errorSpec: ErrorSpec = ERROR_CATALOG.UNKNOWN;

  if (error instanceof RateLimitError) {
    code = 'RATE_LIMIT';
    errorSpec = {
      ...ERROR_CATALOG.RATE_LIMIT,
      message: ERROR_CATALOG.RATE_LIMIT.message as (
        ctx: Record<string, any>
      ) => string,
    };
    context.bucket = error.bucket;
    context.retryAfterSeconds = error.retryAfterSeconds;
  } else if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Map error messages to codes
    if (message.includes('session') && message.includes('expired')) {
      code = 'SESSION_EXPIRED';
      errorSpec = ERROR_CATALOG.SESSION_EXPIRED;
    } else if (message.includes('session') && message.includes('not found')) {
      code = 'SESSION_NOT_FOUND';
      errorSpec = ERROR_CATALOG.SESSION_NOT_FOUND;
    } else if (message.includes('vault') && message.includes('locked')) {
      code = 'VAULT_LOCKED';
      errorSpec = ERROR_CATALOG.VAULT_LOCKED;
    } else if (message.includes('decrypt') || message.includes('cipher')) {
      code = 'VAULT_DECRYPT_FAILED';
      errorSpec = ERROR_CATALOG.VAULT_DECRYPT_FAILED;
    } else if (message.includes('pin') || message.includes('incorrect')) {
      code = 'INVALID_PIN';
      errorSpec = ERROR_CATALOG.INVALID_PIN;
    } else if (message.includes('network') || message.includes('timeout')) {
      code = 'NETWORK_TIMEOUT';
      errorSpec = ERROR_CATALOG.NETWORK_TIMEOUT;
    } else if (message.includes('offline')) {
      code = 'NETWORK_OFFLINE';
      errorSpec = ERROR_CATALOG.NETWORK_OFFLINE;
    }
  }

  // Interpolate message if it's a function
  let resolvedMessage =
    typeof errorSpec.message === 'function'
      ? errorSpec.message(context)
      : errorSpec.message;

  // Simple variable interpolation (e.g., {retry_count})
  resolvedMessage = resolvedMessage.replace(
    /\{(\w+)\}/g,
    (_, key) => context[key] ?? `{${key}}`
  );

  return {
    code,
    spec: {
      ...errorSpec,
      message: resolvedMessage,
    },
  };
}

/**
 * Queue an offline action for later sync.
 * Used for operations that can be retried when network is restored.
 *
 * @param action - Action descriptor
 * @param payload - Data to serialize
 */
export interface QueuedAction {
  id: string;
  type: 'send_invite' | 'sync_vault' | 'upload_media';
  timestamp: number;
  payload: Record<string, any>;
  retries: number;
  maxRetries: number;
}

/**
 * Format a countdown timer for display (used in rate limit errors).
 * Outputs: "45s", "2m 30s", or "1h 5m"
 *
 * @param secondsRemaining - Total seconds
 * @returns Formatted string
 */
export function formatCountdown(secondsRemaining: number): string {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse error context from common sources.
 * Extracts useful info for logging and error reporting.
 *
 * @param error - Error object
 * @returns Structured error context
 */
export function getErrorContext(error: unknown): {
  name: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      category: 'unknown',
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
    category: 'unknown',
  };
}
