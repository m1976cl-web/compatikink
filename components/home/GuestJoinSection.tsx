import React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { parseInviteLink } from '@/lib/linking';

interface GuestJoinSectionProps {
  guestCode: string;
  onChangeCode: (code: string) => void;
  onLayout?: (e: any) => void;
}

export function GuestJoinSection({ guestCode, onChangeCode, onLayout }: GuestJoinSectionProps) {
  const router = useRouter();

  const handleJoin = (input: string) => {
    const parsed = parseInviteLink(input);
    if (!parsed.isValid) {
      Alert.alert('Código inválido', 'Introduce un código o enlace de invitación válido.');
      return;
    }
    const { inviteCode, inviteSecret } = parsed;
    if (inviteSecret) {
      const enc = encodeURIComponent(inviteSecret);
      router.push(`/guest/${inviteCode}?k=${enc}#k=${enc}`);
    } else {
      router.push(`/guest/${inviteCode}`);
    }
  };

  const joinAsGuest = () => {
    handleJoin(guestCode);
  };

  const pasteAndJoin = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        onChangeCode(text);
        const parsed = parseInviteLink(text);
        if (parsed.isValid) {
          handleJoin(text);
          return;
        }
      }
      Alert.alert('Portapapeles', 'No se encontró un código o enlace de invitación válido en el portapapeles.');
    } catch {
      Alert.alert('Error', 'No se pudo acceder al portapapeles.');
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
          <View style={styles.buttonRow}>
            <Button title="Pegar y unirme" onPress={pasteAndJoin} variant="secondary" style={{ flex: 1 }} />
            <Button title="Unirme" onPress={joinAsGuest} style={{ flex: 1 }} />
          </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
