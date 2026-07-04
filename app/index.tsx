import { ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [guestCode, setGuestCode] = useState('');

  const joinAsGuest = () => {
    const code = guestCode.trim().toUpperCase();
    if (code.length < 4) {
      Alert.alert('Código inválido', 'Introduce el código que te compartieron.');
      return;
    }
    router.push(`/guest/${code}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.tagline}>
            Define tus preferencias, invita a alguien, y recibe un reporte completo de compatibilidad.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soy quien inicia</Text>
          <Text style={styles.cardDesc}>
            Respondo primero, genero un código, y cuando la otra persona termine recibo el análisis completo.
          </Text>
          <Button title="Empezar mis preferencias" onPress={() => router.push('/questionnaire')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Me invitaron</Text>
          <Text style={styles.cardDesc}>
            Responde de forma privada. Quien te invitó verá el cruce cuando termines.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Código de invitación"
            placeholderTextColor={colors.textMuted}
            value={guestCode}
            onChangeText={setGuestCode}
            autoCapitalize="characters"
            maxLength={8}
          />
          <Button title="Unirme con código" onPress={joinAsGuest} variant="secondary" />
        </View>

        <Button
          title="Ver mi reporte guardado"
          onPress={() => router.push('/report')}
          variant="ghost"
        />

        {!isSupabaseConfigured ? (
          <Text style={styles.warning}>
            ⚠️ Modo local: configura Supabase en .env para sincronizar entre dispositivos.
          </Text>
        ) : null}

        <Text style={styles.disclaimer}>
          Solo para mayores de 18 años. Herramienta de comunicación y compatibilidad consensuada.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
    letterSpacing: 2,
    textAlign: 'center',
  },
  warning: {
    color: colors.warning,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
