/**
 * ErrorModal Component
 * Unified error display with contextual actions and retry logic.
 *
 * Usage:
 *   const [error, setError] = useState<Error | null>(null);
 *   <ErrorModal error={error} onDismiss={() => setError(null)} />
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Pressable,
  useTheme,
  Icon,
  Spinner,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import {
  resolveError,
  ErrorCode,
  formatCountdown,
  RateLimitError,
} from '../lib/errorHandler';

export interface ErrorModalProps {
  /**
   * Error object to display (null = hidden)
   */
  error: Error | null;
  /**
   * Callback when modal is dismissed
   */
  onDismiss: () => void;
  /**
   * Optional callback for retry action
   */
  onRetry?: () => void | Promise<void>;
  /**
   * Hide the modal (alternative to error=null)
   */
  isOpen?: boolean;
  /**
   * Custom actions to append to catalog actions
   */
  additionalActions?: Array<{
    label: string;
    onPress: () => void;
    style?: 'default' | 'destructive' | 'cancel';
  }>;
}

interface CountdownState {
  secondsRemaining: number;
  isActive: boolean;
}

/**
 * Main ErrorModal component
 */
export function ErrorModal({
  error,
  onDismiss,
  onRetry,
  isOpen = !!error,
  additionalActions = [],
}: ErrorModalProps) {
  const theme = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>({
    secondsRemaining: 0,
    isActive: false,
  });

  // Resolve error to spec
  const { spec, code } = resolveError(error, {
    retryAfterSeconds: error instanceof RateLimitError ? error.retryAfterSeconds : undefined,
  });

  // Countdown timer for rate limit errors
  useEffect(() => {
    if (code !== 'RATE_LIMIT' || !isOpen) {
      setCountdown({ secondsRemaining: 0, isActive: false });
      return;
    }

    if (error instanceof RateLimitError) {
      setCountdown({
        secondsRemaining: error.retryAfterSeconds,
        isActive: true,
      });

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev.secondsRemaining <= 1) {
            clearInterval(interval);
            return { secondsRemaining: 0, isActive: false };
          }
          return {
            secondsRemaining: prev.secondsRemaining - 1,
            isActive: true,
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [code, error, isOpen]);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
      onDismiss();
    } catch (e) {
      console.error('[ErrorModal] Retry failed:', e);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setIsRetrying(false);
    onDismiss();
  };

  const getIconName = (icon?: string): keyof typeof MaterialIcons.glyphMap => {
    switch (icon) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'offline':
        return 'cloud-off';
      default:
        return 'help';
    }
  };

  const getIconColor = () => {
    switch (spec.icon) {
      case 'warning':
        return theme.colors.warning[500];
      case 'error':
        return theme.colors.danger[500];
      case 'offline':
        return theme.colors.muted[400];
      case 'info':
        return theme.colors.info[500];
      default:
        return theme.colors.gray[500];
    }
  };

  // Combine catalog actions with additional actions
  const allActions = [
    ...(spec.actions || []),
    ...additionalActions,
  ];

  // Add retry button if available and not already in actions
  const hasRetryAction = allActions.some((a) => a.label.toLowerCase().includes('retry'));
  if (spec.retry && onRetry && !hasRetryAction) {
    allActions.unshift({
      label: 'Reintentar',
      onPress: handleRetry,
      style: 'default' as const,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="lg">
      <Modal.Content bg={theme.colors.gray[50]} borderRadius="lg">
        {/* Header with icon */}
        <VStack
          alignItems="center"
          space="md"
          p="lg"
          borderBottomWidth={1}
          borderBottomColor={theme.colors.gray[200]}
        >
          <Box
            width="16"
            height="16"
            borderRadius="full"
            bg={
              spec.icon === 'warning'
                ? theme.colors.warning[100]
                : spec.icon === 'error'
                  ? theme.colors.danger[100]
                  : spec.icon === 'offline'
                    ? theme.colors.gray[100]
                    : theme.colors.info[100]
            }
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={MaterialIcons}
              name={getIconName(spec.icon)}
              size="8"
              color={getIconColor()}
            />
          </Box>

          <Text
            fontSize="lg"
            fontWeight="bold"
            color={theme.colors.text}
            textAlign="center"
          >
            {spec.title}
          </Text>
        </VStack>

        {/* Message Body */}
        <VStack space="md" p="lg">
          <Text
            fontSize="md"
            color={theme.colors.text}
            textAlign="center"
            lineHeight="lg"
          >
            {spec.message}
          </Text>

          {/* Countdown Timer (for rate limits) */}
          {countdown.isActive && (
            <Box
              bg={theme.colors.warning[50]}
              borderLeftWidth={4}
              borderLeftColor={theme.colors.warning[500]}
              p="md"
              borderRadius="md"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color={theme.colors.warning[700]}>
                  Intenta de nuevo en:
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={theme.colors.warning[600]}
                  fontFamily="Courier New"
                >
                  {formatCountdown(countdown.secondsRemaining)}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Offline Note */}
          {spec.offline && (
            <Box
              bg={theme.colors.info[50]}
              borderLeftWidth={4}
              borderLeftColor={theme.colors.info[500]}
              p="md"
              borderRadius="md"
            >
              <Text fontSize="sm" color={theme.colors.info[700]}>
                💾 Tu progreso se guardará localmente y se sincronizará cuando
                haya conexión.
              </Text>
            </Box>
          )}
        </VStack>

        {/* Actions */}
        {allActions.length > 0 && (
          <VStack space="2" p="lg" borderTopWidth={1} borderTopColor={theme.colors.gray[200]}>
            {allActions.map((action, index) => (
              <Button
                key={index}
                variant={action.style === 'destructive' ? 'solid' : 'outline'}
                colorScheme={
                  action.style === 'destructive'
                    ? 'danger'
                    : action.style === 'cancel'
                      ? 'gray'
                      : 'primary'
                }
                isDisabled={isRetrying || (countdown.isActive && action.label.toLowerCase().includes('retry'))}
                onPress={action.onPress}
                width="100%"
                _text={{ fontSize: 'md' }}
              >
                {isRetrying && action.label.toLowerCase().includes('retry') && (
                  <HStack space="2" alignItems="center">
                    <Spinner
                      color={theme.colors.primary[500]}
                      size="sm"
                    />
                    <Text>Reintentando...</Text>
                  </HStack>
                )}
                {!isRetrying && action.label}
              </Button>
            ))}
          </VStack>
        )}

        {/* Close button (always available) */}
        {allActions.length === 0 && (
          <VStack p="lg" borderTopWidth={1} borderTopColor={theme.colors.gray[200]}>
            <Button
              variant="outline"
              colorScheme="gray"
              onPress={handleDismiss}
              width="100%"
            >
              Cerrar
            </Button>
          </VStack>
        )}
      </Modal.Content>
    </Modal>
  );
}

/**
 * Hook for managing error state with ErrorModal
 * Usage:
 *   const { error, showError, hideError } = useErrorModal();
 *   <ErrorModal error={error.current} onDismiss={hideError} />
 */
export function useErrorModal() {
  const [error, setError] = React.useState<Error | null>(null);

  const showError = (err: Error | string) => {
    const errorObj =
      typeof err === 'string' ? new Error(err) : err;
    setError(errorObj);
  };

  const hideError = () => {
    setError(null);
  };

  const clearError = hideError;

  return {
    error,
    showError,
    hideError,
    clearError,
    isOpen: !!error,
  };
}
