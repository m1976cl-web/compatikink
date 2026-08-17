import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { getFeatureMode, isModuleVisibleInMode, FeatureMode } from '@/lib/featureFlags';

interface Props {
  route: string;
  title?: string;
  children: React.ReactNode;
}

/**
  RouteFeatureGuard protects experimental/social screens in MVP Core mode.
  If the active feature mode is 'mvp_only' and the route is frozen,
  it displays a clean Noir Íntimo notification card advising the user
  that the module is part of the Beta/Lab suite, with a button to return home or unlock all modules.
 */
export function RouteFeatureGuard({ route, title = 'Módulo en Beta', children }: Props) {
  const router = useRouter();
  const [featureMode, setFeatureMode] = useState<FeatureMode>('mvp_only');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFeatureMode().then((mode) => {
      setFeatureMode(mode);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  const isVisible = isModuleVisibleInMode(route, featureMode === 'mvp_only');

  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <ScreenContainer title={title} subtitle="Módulo congelado detrás de Feature Flag (Core First)">
      <View style={styles.card}>
        <Text style={styles.icon}>🧪</Text>
        <Text style={styles.heading}>Módulo en Fase Beta / Laboratorio</Text>
        <Text style={styles.description}>
          Esta sección está deshabilitada en el modo <Text style={styles.highlight}>MVP Core</Text> para preservar la privacidad y prioridad del flujo asimétrico principal (Invitación → Respuestas a Ciegas → Reporte Privado).
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/')}>
            <Text style={styles.primaryBtnText}>🏠 Volver al Core Principal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21, 13, 36, 0.95)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 32px rgba(7, 4, 13, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  icon: {
    fontSize: 48,
  },
  heading: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlight: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  btnRow: {
    width: '100%',
    marginTop: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.md,
  },
});
