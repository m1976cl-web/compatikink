import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View, Text } from 'react-native';
import { Suspense } from 'react';
import { fontAssets } from '@/constants/fonts';
import { OfficeModeModal } from '@/components/OfficeModeModal';
import { colors, fonts, gradients } from '@/constants/theme';

import { ThemeProvider } from '@/lib/themeContext';

/**
 * Fallback minimalista mostrado mientras se carga una pantalla en diferido (#18).
 * Visible < 200ms en la mayoría de dispositivos.
 */
function LazyFallback() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>Cargando…</Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // On Web, never block rendering on font loading to prevent infinite spinner
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return <LazyFallback />;
  }

  const contentStyle =
    Platform.OS === 'web'
      ? ([styles.content, { backgroundImage: gradients.inkRadialHint } as object] as object)
      : styles.content;

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Suspense fallback={<LazyFallback />}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fonts.bodySemi, fontWeight: '600', color: colors.text },
            contentStyle: contentStyle as object,
            headerShadowVisible: false,
            animation: 'fade',
            // ── Mejora #18: Lazy loading — cada pantalla carga su JS al navegar ──
            // Reduce el TTI (Time to Interactive) del dashboard al diferir la carga
            // de pantallas pesadas (dating.tsx 36 KB, manual.tsx 33 KB, etc.)
            lazy: true,
          }}
        >
          <Stack.Screen name="index"                options={{ title: 'Compatikink',               headerShown: false }} />
          <Stack.Screen name="onboarding"           options={{ title: 'Bienvenida',                headerShown: false }} />
          <Stack.Screen name="manual"               options={{ title: 'Manual de Usuario',         headerShown: false }} />
          <Stack.Screen name="questionnaire"        options={{ title: 'Tus preferencias',          headerShown: false }} />
          <Stack.Screen name="invite"               options={{ title: 'Invitar',                   headerShown: false }} />
          <Stack.Screen name="report"               options={{ title: 'Tu reporte',                headerShown: false }} />
          <Stack.Screen name="share"                options={{ title: 'Compartir',                 headerShown: false }} />
          <Stack.Screen name="astrology"            options={{ title: 'Astrología Kink',           headerShown: false }} />
          <Stack.Screen name="pegging"              options={{ title: 'Pegging & Dating',          headerShown: false }} />
          <Stack.Screen name="task-economy"         options={{ title: 'Economía D/s',              headerShown: false }} />
          <Stack.Screen name="fantasy-match"        options={{ title: 'Match Secreto',             headerShown: false }} />
          <Stack.Screen name="archetypes"           options={{ title: 'Quiz Arquetipos',           headerShown: false }} />
          <Stack.Screen name="rituals"              options={{ title: 'Ritual Builder',            headerShown: false }} />
          <Stack.Screen name="contracts"            options={{ title: 'Contratos Digitales',       headerShown: false }} />
          <Stack.Screen name="private-album"        options={{ title: 'Bóveda Privada',            headerShown: false }} />
          <Stack.Screen name="writings"             options={{ title: 'Blog & Escritos',           headerShown: false }} />
          <Stack.Screen name="music-sync"           options={{ title: 'Music Sync',                headerShown: false }} />
          <Stack.Screen name="ai-script"            options={{ title: 'AI Scene Builder',          headerShown: false }} />
          <Stack.Screen name="partner-journal"      options={{ title: 'Vínculos & Diario',         headerShown: false }} />
          <Stack.Screen name="partner-chat"         options={{ title: 'Chat E2EE Efímero',         headerShown: false }} />
          <Stack.Screen name="quick-start-bundle"   options={{ title: 'Kit de Inicio BDSM',        headerShown: false }} />
          <Stack.Screen name="shibari-guide"        options={{ title: 'Guía de Shibari',           headerShown: false }} />
          <Stack.Screen name="daily-submissive-act" options={{ title: 'Acto de Sumisión Diario',   headerShown: false }} />
          <Stack.Screen name="live-scene"           options={{ title: 'Modo Escena en Vivo',       headerShown: false }} />
          <Stack.Screen name="kink-roulette"        options={{ title: 'Ruleta Kink',               headerShown: false }} />
          <Stack.Screen name="events-munches"       options={{ title: 'Munches & Eventos',         headerShown: false }} />
          <Stack.Screen name="admin-dashboard"      options={{ title: 'Panel de Administración',   headerShown: false }} />
          <Stack.Screen name="security-audit"       options={{ title: 'Auditoría PenTest',         headerShown: false }} />
          <Stack.Screen name="blue-pages"           options={{ title: 'Promociona tu Página Azul', headerShown: false }} />
          <Stack.Screen name="backup"               options={{ title: 'Backup Cifrado',            headerShown: false }} />
          <Stack.Screen name="guest/[code]"         options={{ title: 'Cuestionario',              headerShown: false }} />
          <Stack.Screen name="guest/done"           options={{ title: 'Listo',                     headerShown: false }} />
        </Stack>
      </Suspense>
      <OfficeModeModal />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
