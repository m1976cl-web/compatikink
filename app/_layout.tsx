import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Compatikink' }} />
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
