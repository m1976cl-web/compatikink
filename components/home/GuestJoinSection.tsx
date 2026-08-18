import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { parseInviteLink } from '@/lib/linking';
import { useTranslation } from '@/lib/i18n';
import { notify } from '@/lib/notify';

interface GuestJoinSectionProps {
  guestCode: string;
  onChangeCode: (code: string) => void;
  onLayout?: (e: any) => void;
}

export function GuestJoinSection({ guestCode, onChangeCode, onLayout }: GuestJoinSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleJoin = (input: string) => {
    const parsed = parseInviteLink(input);
    if (!parsed.isValid) {
      notify(t('guest.join_title'), t('guest.invalid'));
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
      notify(t('guest.join_title'), t('guest.clip_empty'));
    } catch {
      notify(t('guest.join_title'), t('guest.clip_error'));
    }
  };

  return (
    <View onLayout={onLayout}>
      <Section title={t('guest.join_title')} subtitle={t('guest.join_sub')}>
        <View style={styles.interactivePanel}>
          <Text style={styles.blindNote}>{t('guest.blind_note')}</Text>
          <TextInput
            style={styles.inputInvite}
            placeholder={t('guest.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={guestCode}
            onChangeText={onChangeCode}
            autoCapitalize="characters"
          />
          <View style={styles.buttonRow}>
            <Button title={t('guest.paste')} onPress={pasteAndJoin} variant="secondary" style={{ flex: 1 }} />
            <Button title={t('guest.join')} onPress={joinAsGuest} style={{ flex: 1 }} />
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
  blindNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
