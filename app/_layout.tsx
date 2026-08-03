import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { fontAssets } from '@/constants/fonts';
import { ScreenContainer } from '@/components/ScreenContainer';
import { OfficeModeModal } from '@/components/OfficeModeModal';
import { colors, fonts, gradients } from '@/constants/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // On Web, never block rendering on font loading to prevent infinite spinner
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const contentStyle =
    Platform.OS === 'web'
      ? ([
          styles.content,
          { backgroundImage: gradients.inkRadialHint } as object,
        ] as object)
      : styles.content;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: fonts.bodySemi,
            fontWeight: '600',
            color: colors.text,
          },
          contentStyle: contentStyle as object,
          headerShadowVisible: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Compatikink', headerShown: false }} />
        <Stack.Screen name="manual" options={{ title: 'Manual de Usuario', headerShown: false }} />
        <Stack.Screen name="questionnaire" options={{ title: 'Tus preferencias', headerShown: false }} />
        <Stack.Screen name="invite" options={{ title: 'Invitar', headerShown: false }} />
        <Stack.Screen name="report" options={{ title: 'Tu reporte', headerShown: false }} />
        <Stack.Screen name="share" options={{ title: 'Compartir', headerShown: false }} />
        <Stack.Screen name="astrology" options={{ title: 'Astrología Kink', headerShown: false }} />
        <Stack.Screen name="pegging" options={{ title: 'Pegging & Dating', headerShown: false }} />
        <Stack.Screen name="task-economy" options={{ title: 'Economía D/s', headerShown: false }} />
        <Stack.Screen name="fantasy-match" options={{ title: 'Match Secreto', headerShown: false }} />
        <Stack.Screen name="archetypes" options={{ title: 'Quiz Arquetipos', headerShown: false }} />
        <Stack.Screen name="rituals" options={{ title: 'Ritual Builder', headerShown: false }} />
        <Stack.Screen name="contracts" options={{ title: 'Contratos Digitales', headerShown: false }} />
        <Stack.Screen name="private-album" options={{ title: 'Bóveda Privada', headerShown: false }} />
        <Stack.Screen name="writings" options={{ title: 'Blog & Escritos', headerShown: false }} />
        <Stack.Screen name="music-sync" options={{ title: 'Music Sync', headerShown: false }} />
        <Stack.Screen name="ai-script" options={{ title: 'AI Scene Builder', headerShown: false }} />
        <Stack.Screen name="partner-journal" options={{ title: 'Vínculos & Diario', headerShown: false }} />
        <Stack.Screen name="blue-pages" options={{ title: 'Promociona tu Página Azul', headerShown: false }} />
        <Stack.Screen name="guest/[code]" options={{ title: 'Cuestionario', headerShown: false }} />
        <Stack.Screen name="guest/done" options={{ title: 'Listo', headerShown: false }} />
      </Stack>
      <OfficeModeModal />
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
