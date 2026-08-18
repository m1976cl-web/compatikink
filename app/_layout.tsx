import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View, Text } from 'react-native';
import { Suspense, useEffect } from 'react';
import { fontAssets } from '@/constants/fonts';
import { OfficeModeModal } from '@/components/OfficeModeModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { NetworkStatusToast } from '@/components/NetworkStatusToast';
import { PanicDisguiseModal } from '@/components/safety/PanicDisguiseModal';
import { PanicFloatingButton } from '@/components/safety/PanicFloatingButton';
import { colors, fonts, gradients } from '@/constants/theme';
import { initLocale } from '@/lib/i18n';

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

  useEffect(() => {
    void initLocale();
  }, []);

  // On Web, never block rendering on font loading to prevent infinite spinner
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return <LazyFallback />;
  }

  const contentStyle =
    Platform.OS === 'web'
      ? ([styles.content, { backgroundImage: gradients.inkRadialHint } as object] as object)
      : styles.content;

  return (
    <ErrorBoundary>
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
            <Stack.Screen name="ds-tasks"             options={{ title: 'Tareas & Hábitos D/s',       headerShown: false }} />
            <Stack.Screen name="fantasy-match"        options={{ title: 'Match Secreto',             headerShown: false }} />
            <Stack.Screen name="archetypes"           options={{ title: 'Quiz Arquetipos',           headerShown: false }} />
            <Stack.Screen name="rituals"              options={{ title: 'Ritual Builder',            headerShown: false }} />
            <Stack.Screen name="contracts"            options={{ title: 'Contratos Digitales',       headerShown: false }} />
            <Stack.Screen name="private-album"        options={{ title: 'Bóveda Privada',            headerShown: false }} />
            <Stack.Screen name="writings"             options={{ title: 'Blog & Escritos',           headerShown: false }} />
            <Stack.Screen name="music-sync"           options={{ title: 'Music Sync',                headerShown: false }} />
            <Stack.Screen name="ai-script"            options={{ title: 'AI Scene Builder',          headerShown: false }} />
            <Stack.Screen name="partner-journal"      options={{ title: 'Vínculos & Diario',         headerShown: false }} />
            <Stack.Screen name="session-diff"         options={{ title: 'Historial & Diff',          headerShown: false }} />
            <Stack.Screen name="poly-group"           options={{ title: 'Matriz Poli',               headerShown: false }} />
            <Stack.Screen name="partner-chat"         options={{ title: 'Chat E2EE Efímero',         headerShown: false }} />
            <Stack.Screen name="quick-start-bundle"   options={{ title: 'Kit de Inicio BDSM',        headerShown: false }} />
            <Stack.Screen name="shibari-guide"        options={{ title: 'Guía de Shibari',           headerShown: false }} />
            <Stack.Screen name="latex-guide"          options={{ title: 'Guía de Cuidado de Látex',  headerShown: false }} />
            <Stack.Screen name="daily-submissive-act" options={{ title: 'Acto de Sumisión Diario',   headerShown: false }} />
            <Stack.Screen name="live-scene"           options={{ title: 'Modo Escena en Vivo',       headerShown: false }} />
            <Stack.Screen name="scene-builder"        options={{ title: 'Creador de Escenas',        headerShown: false }} />
            <Stack.Screen name="kink-roulette"        options={{ title: 'Ruleta Kink',               headerShown: false }} />
            <Stack.Screen name="events-munches"       options={{ title: 'Munches & Eventos',         headerShown: false }} />
            <Stack.Screen name="admin-dashboard"      options={{ title: 'Panel de Administración',   headerShown: false }} />
            <Stack.Screen name="security-audit"       options={{ title: 'Auditoría PenTest',         headerShown: false }} />
            <Stack.Screen name="blue-pages"           options={{ title: 'Promociona tu Página Azul', headerShown: false }} />
            <Stack.Screen name="ephemeral-wishes"     options={{ title: 'Deseos Efímeros 24h',       headerShown: false }} />
            <Stack.Screen name="linked-couples"       options={{ title: 'Perfil de Pareja',          headerShown: false }} />
            <Stack.Screen name="wild-feed"            options={{ title: 'Galería Salvaje (18+)',     headerShown: false }} />
            <Stack.Screen name="p2p-sync"             options={{ title: 'Sincronización P2P',       headerShown: false }} />
            <Stack.Screen name="terms"                options={{ title: 'Términos de Servicio',      headerShown: false }} />
            <Stack.Screen name="backup"               options={{ title: 'Backup Cifrado',            headerShown: false }} />
            <Stack.Screen name="ai-assistant"         options={{ title: 'Asistente IA Íntimo',       headerShown: false }} />
            <Stack.Screen name="landing"              options={{ title: 'Presentación',              headerShown: false }} />
            <Stack.Screen name="guest/[code]"         options={{ title: 'Cuestionario',              headerShown: false }} />
            <Stack.Screen name="guest/done"           options={{ title: 'Listo',                     headerShown: false }} />
            <Stack.Screen name="marketplace-dark"     options={{ title: 'Marketplace Dark',          headerShown: false }} />
            <Stack.Screen name="foot-fetish"          options={{ title: 'Foot Fetish',               headerShown: false }} />
            // <Stack.Screen name="leisure"               options={{ title: 'Leisure Suite Larry',        headerShown: false }} />
            <Stack.Screen name="tribute"              options={{ title: 'Tribute',                   headerShown: false }} />
            <Stack.Screen name="sissy-training"       options={{ title: 'Sissy Training',            headerShown: false }} />
            <Stack.Screen name="chastity"             options={{ title: 'Castidad',                  headerShown: false }} />
            <Stack.Screen name="chastity-wearer"      options={{ title: 'Castidad · Portador',       headerShown: false }} />
            <Stack.Screen name="chastity-keyholder"   options={{ title: 'Castidad · Keyholder',      headerShown: false }} />
            <Stack.Screen name="chastity-protocol"    options={{ title: 'Castidad · Protocolo',      headerShown: false }} />
            <Stack.Screen name="chastity-tools"       options={{ title: 'Castidad · Herramientas',   headerShown: false }} />
            <Stack.Screen name="chastity-cage"        options={{ title: 'Castidad · Jaula',          headerShown: false }} />
            <Stack.Screen name="chastity-belt"        options={{ title: 'Castidad · Cinturón',       headerShown: false }} />
            <Stack.Screen name="chastity-fit"         options={{ title: 'Castidad · Estilo y talla', headerShown: false }} />
            <Stack.Screen name="private-sessions"     options={{ title: 'Mis Sesiones',              headerShown: false }} />
            <Stack.Screen name="trophy-room"          options={{ title: 'Sala de Trofeos',           headerShown: false }} />
            <Stack.Screen name="specialized-guides"   options={{ title: 'Guías Especializadas',      headerShown: false }} />
            <Stack.Screen name="aftercare-checkin"    options={{ title: 'Check-in de Aftercare',     headerShown: false }} />
          </Stack>
        </Suspense>
        <OfficeModeModal />
        <GlobalSearchModal />
        <NetworkStatusToast />
        <PanicFloatingButton />
        <PanicDisguiseModal />
      </ThemeProvider>
    </ErrorBoundary>
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
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
