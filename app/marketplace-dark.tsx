import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';
import { NoxHost } from '@/components/nox';
import { AdultConsentBanner } from '@/components/fetishLabs/AdultConsentBanner';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import {
  MARKETPLACE_CATALOG,
  type MarketplaceCategory,
  loadWishlistIds,
  saveWishlistIds,
} from '@/lib/fetishLabs';

const CATS: { id: MarketplaceCategory | 'all'; labelKey: string }[] = [
  { id: 'all', labelKey: 'labs.market.cat.all' },
  { id: 'toys', labelKey: 'labs.market.cat.toys' },
  { id: 'gear', labelKey: 'labs.market.cat.gear' },
  { id: 'care', labelKey: 'labs.market.cat.care' },
  { id: 'shipping', labelKey: 'labs.market.cat.ship' },
];

function MarketplaceDarkContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [cat, setCat] = useState<MarketplaceCategory | 'all'>('all');
  const [wish, setWish] = useState<string[]>([]);

  useEffect(() => {
    loadWishlistIds().then(setWish).catch(() => setWish([]));
  }, []);

  const toggleWish = async (id: string) => {
    const next = wish.includes(id) ? wish.filter((x) => x !== id) : [...wish, id];
    setWish(next);
    await saveWishlistIds(next);
  };

  const items = MARKETPLACE_CATALOG.filter((i) => cat === 'all' || i.category === cat);

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t('nav.back')}</Text>
          </TouchableOpacity>
          <NoxHost scene="share" variant="compact" />
          <Text style={styles.title}>{t('labs.market.title')}</Text>
          <Text style={styles.subtitle}>{t('labs.market.lead')}</Text>
        </View>

        <AdultConsentBanner extra={t('labs.market.legal')} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.tabChip, cat === c.id && styles.tabChipActive]}
              onPress={() => setCat(c.id)}
            >
              <Text style={[styles.tabChipText, cat === c.id && styles.tabChipTextActive]}>
                {t(c.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.wishCount}>
            {t('labs.market.wish', { n: String(wish.length) })}
          </Text>

          {items.map((item) => {
            const on = wish.includes(item.id);
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBlurb}>{item.blurb}</Text>
                <Text style={styles.discreet}>📦 {item.discreetNote}</Text>
                <Text style={styles.meta}>
                  {item.typicalRange} · {t('labs.market.no_pay')}
                </Text>
                <TouchableOpacity
                  style={[styles.wishBtn, on && styles.wishBtnOn]}
                  onPress={() => toggleWish(item.id)}
                >
                  <Text style={[styles.wishBtnText, on && styles.wishBtnTextOn]}>
                    {on ? t('labs.market.wished') : t('labs.market.wish_add')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity style={styles.inviteBtn} onPress={() => router.push('/invite')}>
            <Text style={styles.inviteBtnText}>{t('labs.market.invite')}</Text>
          </TouchableOpacity>
          <Text style={styles.footnote}>{t('labs.market.invite_hint')}</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

export default function MarketplaceDarkScreen() {
  return (
    <RouteFeatureGuard route="/marketplace-dark" title="Marketplace Dark">
      <MarketplaceDarkContent />
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
  tabsScroll: { marginVertical: spacing.sm, maxHeight: 44 },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  tabChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabChipTextActive: { color: '#000', fontWeight: '900' },
  scroll: { gap: spacing.md, paddingTop: spacing.xs },
  wishCount: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  itemName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.md },
  itemBlurb: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  discreet: { color: '#38bdf8', fontSize: fontSize.xs, lineHeight: 18 },
  meta: { color: colors.textDim, fontSize: 11 },
  wishBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  wishBtnOn: { backgroundColor: colors.primary },
  wishBtnText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.xs },
  wishBtnTextOn: { color: colors.onPrimary },
  inviteBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  inviteBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  footnote: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
});
