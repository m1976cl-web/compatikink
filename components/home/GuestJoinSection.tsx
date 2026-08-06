import React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface GuestJoinSectionProps {
  guestCode: string;
  onChangeCode: (code: string) => void;
  onLayout?: (e: any) => void;
}

export function GuestJoinSection({ guestCode, onChangeCode, onLayout }: GuestJoinSectionProps) {
  const router = useRouter();

  const joinAsGuest = () => {
    const raw = guestCode.trim();
    const secretFromPaste = (() => {
      try {
        if (raw.includes('k=')) {
          const m = raw.match(/[?#&]k=([^&\s#]+)/);
          if (m) return decodeURIComponent(m[1]);
        }
      } catch {
        /* ignore */
      }
      return undefined;
    })();
    const codeMatch = raw.match(/guest\/([A-Za-z0-9]+)/i);
    const code = (codeMatch ? codeMatch[1] : raw.replace(/[^A-Za-z0-9]/g, '')).toUpperCase();
    if (code.length < 4) {
      Alert.alert('Código inválido', 'Introduce el código o el enlace completo.');
      return;
    }
    if (secretFromPaste) {
      router.push(`/guest/${code}?k=${encodeURIComponent(secretFromPaste)}`);
    } else {
      router.push(`/guest/${code}`);
    }
  };

  return (
    <View onLayout={onLayout}>
      <Section title="Me invitaron" subtitle="Pega el código o el enlace completo (#k= / ?k=).">
        <View style={styles.interactivePanel}>
          <TextInput
            style={styles.inputInvite}
            placeholder="Código o enlace de invitación"
            placeholderTextColor={colors.textDim}
            value={guestCode}
            onChangeText={onChangeCode}
            autoCapitalize="characters"
          />
          <Button title="Unirme" onPress={joinAsGuest} variant="secondary" />
        </View>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  interactivePanel: { gap: spacing.md },
  inputInvite: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
