import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import { notify } from '@/lib/notify';
import {
  emptyTributeThread,
  loadTributeThread,
  saveTributeThread,
  type TributeThread,
} from '@/lib/fetishLabs';

function TributeContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [thread, setThread] = useState<TributeThread>(emptyTributeThread());
  const [draft, setDraft] = useState('');
  const [role, setRole] = useState<'initiator' | 'guest'>('initiator');

  useEffect(() => {
    loadTributeThread().then(setThread).catch(() => setThread(emptyTributeThread()));
  }, []);

  const persist = async (next: TributeThread) => {
    setThread(next);
    await saveTributeThread(next);
  };

  const consentsOk = thread.consentAdults && thread.consentNoRedistribute && thread.consentRevocable;

  const send = async () => {
    if (!consentsOk) {
      notify(t('labs.tribute.need_consent_title'), t('labs.tribute.need_consent'));
      return;
    }
    const body = draft.trim();
    if (!body) return;
    const next: TributeThread = {
      ...thread,
      status: role === 'initiator' ? 'requested' : thread.status === 'requested' ? 'accepted' : thread.status,
      messages: [
        ...thread.messages,
        {
          id: `${Date.now()}`,
          fromRole: role,
          body,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    setDraft('');
    await persist(next);
  };

  const decline = async () => {
    await persist({ ...thread, status: 'declined' });
  };

  const complete = async () => {
    await persist({ ...thread, status: 'completed' });
  };

  const toggle = (key: 'consentAdults' | 'consentNoRedistribute' | 'consentRevocable') => {
    void persist({ ...thread, [key]: !thread[key] });
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="invite" variant="compact" />
          <Text style={styles.title}>{t('labs.tribute.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.tribute.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.tribute.legal')} />

        <VaultLockGate title={t('labs.tribute.vault')} subtitle={t('labs.zk_hint')} showLockButton>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.status}>
              {t('labs.tribute.status')}: {thread.status}
            </Text>
            <Text style={styles.prompt}>{thread.prompt}</Text>
            <Text style={styles.noCdn}>{t('labs.tribute.no_cdn')}</Text>

            <TouchableOpacity style={styles.check} onPress={() => toggle('consentAdults')}>
              <Text style={styles.checkMark}>{thread.consentAdults ? '☑' : '☐'}</Text>
              <Text style={styles.checkLabel}>{t('labs.tribute.c1')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.check} onPress={() => toggle('consentNoRedistribute')}>
              <Text style={styles.checkMark}>{thread.consentNoRedistribute ? '☑' : '☐'}</Text>
              <Text style={styles.checkLabel}>{t('labs.tribute.c2')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.check} onPress={() => toggle('consentRevocable')}>
              <Text style={styles.checkMark}>{thread.consentRevocable ? '☑' : '☐'}</Text>
              <Text style={styles.checkLabel}>{t('labs.tribute.c3')}</Text>
            </TouchableOpacity>

            <View style={styles.sideRow}>
              {(['initiator', 'guest'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sideChip, role === s && styles.sideChipOn]}
                  onPress={() => setRole(s)}
                >
                  <Text style={[styles.sideChipText, role === s && styles.sideChipTextOn]}>
                    {s === 'initiator' ? t('labs.foot.you') : t('labs.foot.guest')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {thread.messages.map((m) => (
              <View key={m.id} style={styles.msg}>
                <Text style={styles.msgRole}>
                  {m.fromRole === 'initiator' ? t('labs.foot.you') : t('labs.foot.guest')}
                </Text>
                <Text style={styles.msgBody}>{m.body}</Text>
              </View>
            ))}

            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('labs.tribute.placeholder')}
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <TouchableOpacity style={styles.inviteBtn} onPress={send}>
              <Text style={styles.inviteBtnText}>{t('labs.tribute.send')}</Text>
            </TouchableOpacity>
            <View style={styles.row}>
              <TouchableOpacity style={styles.ghostBtn} onPress={decline}>
                <Text style={styles.ghostBtnText}>{t('labs.tribute.decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={complete}>
                <Text style={styles.ghostBtnText}>{t('labs.tribute.done')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/invite')}>
              <Text style={styles.linkBtnText}>{t('labs.tribute.session')}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
  );
}

export default function TributeScreen() {
  return (
    <RouteFeatureGuard route="/tribute" title="Tribute">
      <TributeContent />
    </RouteFeatureGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },
  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm, lineHeight: 20 },
  scroll: { gap: spacing.md, paddingTop: spacing.md },
  status: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  prompt: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  noCdn: { color: '#fbbf24', fontSize: fontSize.xs, lineHeight: 18 },
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkMark: { color: colors.primary, fontSize: fontSize.md, width: 22 },
  checkLabel: { flex: 1, color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  sideRow: { flexDirection: 'row', gap: spacing.sm },
  sideChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sideChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sideChipText: { color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  sideChipTextOn: { color: colors.onPrimary },
  msg: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  msgRole: { color: colors.primary, fontSize: 11, fontFamily: fonts.bodyBold },
  msgBody: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    color: colors.text,
    textAlignVertical: 'top',
  },
  inviteBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  inviteBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  ghostBtnText: { color: colors.textMuted, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  linkBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  linkBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
});
