import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { useQuickInvite } from '@/hooks/useQuickInvite';
import { useTranslation } from '@/lib/i18n';

interface QuickInviteFormProps {
  invite: ReturnType<typeof useQuickInvite>;
}

export function QuickInviteForm({ invite }: QuickInviteFormProps) {
  const { t } = useTranslation();
  if (!invite.showQuickInvite) return null;

  return (
    <Section title={t('invite.form_title')} subtitle={t('invite.form_sub')}>
      <View style={styles.interactivePanel}>
        <Text style={styles.label}>{t('invite.nick_label')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('invite.nick_ph')}
          placeholderTextColor={colors.textDim}
          value={invite.quickGuestNick}
          onChangeText={invite.setQuickGuestNick}
        />
        <Text style={styles.label}>{t('invite.notes_label')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('invite.notes_ph')}
          placeholderTextColor={colors.textDim}
          value={invite.quickGuestNotes}
          onChangeText={invite.setQuickGuestNotes}
          multiline
        />
        <Text style={styles.expiryHint}>{t('invite.expiry_hint')}</Text>
        <View style={styles.expiryRow}>
          {[
            { label: t('invite.exp_48h'), value: '48h' as const },
            { label: t('invite.exp_7d'), value: '7d' as const },
            { label: t('invite.exp_none'), value: 'none' as const },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.expiryChip,
                invite.expiryOption === opt.value && styles.expiryChipActive,
              ]}
              onPress={() => invite.setExpiryOption(opt.value)}
            >
              <Text
                style={[
                  styles.expiryChipText,
                  invite.expiryOption === opt.value && styles.expiryChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.formRow}>
          <Button
            title={invite.creatingInvite ? t('invite.creating') : t('invite.create')}
            onPress={invite.handleQuickInvite}
            disabled={invite.creatingInvite}
            style={{ flex: 1 }}
          />
          <Button
            title={t('common.cancel')}
            variant="secondary"
            onPress={invite.reset}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  interactivePanel: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  label: { ...typography.label, marginBottom: -4 },
  expiryHint: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  expiryRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  expiryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  expiryChipActive: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  expiryChipText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: fontSize.xs },
  expiryChipTextActive: { color: colors.primary, fontFamily: fonts.bodySemi },
  formRow: { flexDirection: 'row', gap: spacing.md },
});
