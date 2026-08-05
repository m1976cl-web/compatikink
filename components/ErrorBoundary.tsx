import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

/**
 * Global ErrorBoundary Component styled with the Noir Íntimo aesthetic.
 * Catches unhandled React render tree errors and displays a safe crash screen,
 * ensuring no sensitive decrypted vault data or key material is exposed.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitized logging (prevent transmitting any vault context or sensitive payloads)
    console.error('[Global ErrorBoundary Caught Exception]:', error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🛡️</Text>
              </View>

              <Text style={styles.brand}>Compatikink</Text>
              <Text style={styles.title}>Desviación de Protocolo Detectada</Text>
              <Text style={styles.subtitle}>
                Se ha producido un error inesperado en la interfaz. Tus datos cifrados en la Bóveda permanecen 100% protegidos e inaccesibles.
              </Text>

              <View style={styles.actions}>
                <Button
                  title="Reiniciar Aplicación"
                  onPress={this.handleReload}
                  style={styles.primaryBtn}
                />
                <Button
                  title="Volver al Dashboard"
                  variant="secondary"
                  onPress={this.handleReset}
                  style={styles.secondaryBtn}
                />
              </View>

              {isDev ? (
                <View style={styles.devBox}>
                  <TouchableOpacity
                    onPress={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                    style={styles.devHeader}
                  >
                    <Text style={styles.devHeaderText}>
                      {this.state.showDetails ? '▼ Ocultar detalles técnicos (__DEV__)' : '▶ Ver detalles técnicos (__DEV__)'}
                    </Text>
                  </TouchableOpacity>
                  {this.state.showDetails && this.state.error ? (
                    <Text style={styles.devErrorText}>
                      {this.state.error.name}: {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.footnote}>
                Seguridad Zero-Knowledge activa • Cifrado AES-GCM local
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0612',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: '#150d24',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: '#c084fc',
    padding: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignItems: 'center',
    boxShadow: '0 0 30px rgba(192, 132, 252, 0.25)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: '#c084fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.md,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
  devBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  devHeader: {
    paddingVertical: spacing.xs,
  },
  devHeaderText: {
    color: '#f43f5e',
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  devErrorText: {
    color: colors.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: spacing.xs,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textDim,
    textAlign: 'center',
  },
});
