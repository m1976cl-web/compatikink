import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { fontAssets } from '@/constants/fonts';
import { colors, fonts, gradients } from '@/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
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
        <Stack.Screen name="questionnaire" options={{ title: 'Tus preferencias' }} />
        <Stack.Screen name="invite" options={{ title: 'Invitar' }} />
        <Stack.Screen name="report" options={{ title: 'Tu reporte' }} />
        <Stack.Screen name="share" options={{ title: 'Compartir' }} />
        <Stack.Screen name="guest/[code]" options={{ title: 'Cuestionario' }} />
        <Stack.Screen name="guest/done" options={{ title: 'Listo', headerBackVisible: false }} />
      </Stack>
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
