import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  CreatorPromo,
  BluePlatform,
  PLATFORM_INFO,
  getBluePagePromos,
  addBluePagePromo,
  togglePromoLike,
} from '@/lib/bluePages';

export default function BluePagesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [promos, setPromos] = useState<CreatorPromo[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<BluePlatform | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [creatorName, setCreatorName] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<BluePlatform>('OnlyFans');
  const [profileUrl, setProfileUrl] = useState('');
  const [bio, setBio] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [fetishTagsInput, setFetishTagsInput] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('💙');

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    const data = await getBluePagePromos();
    setPromos(data);
  };

  const handleOpenLink = (url: string) => {
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(target, '_blank');
    } else {
      Linking.openURL(target).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el enlace.');
      });
    }
  };

  const handleLike = async (promoId: string) => {
    await togglePromoLike(promoId);
    await loadPromos();
  };

  const handlePublish = async () => {
    if (!creatorName.trim() || !profileUrl.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu nombre de creador/a y el enlace a tu página azul.');
      return;
    }

    const tags = fetishTagsInput
      ? fetishTagsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Kink', 'Fetish'];

    await addBluePagePromo({
      creatorName: creatorName.trim(),
      handle: handle.trim() || `@${creatorName.trim().replace(/\s+/g, '')}`,
      avatarEmoji: avatarEmoji || '💙',
      platform,
      profileUrl: profileUrl.trim(),
      bio: bio.trim() || 'Creador/a de contenido fetichista y sensual en Compatikink.',
      fetishTags: tags,
      promoDiscount: promoDiscount.trim() || undefined,
    });

    setModalVisible(false);
    setCreatorName('');
    setHandle('');
    setProfileUrl('');
    setBio('');
    setPromoDiscount('');
    setFetishTagsInput('');

    Alert.alert(
      '¡Página Azul Publicada! 💙',
      'Tu perfil ya está disponible en el directorio de creadores.'
    );
    await loadPromos();
  };

  // Unique fetish tags across all promos
  const allTags = Array.from(
    new Set(promos.flatMap((p) => p.fetishTags || []))
  );

  const filteredPromos = promos.filter((p) => {
    if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
    if (selectedTag !== 'All' && !p.fetishTags?.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.creatorName.toLowerCase().includes(q);
      const bioMatch = p.bio.toLowerCase().includes(q);
      const tagMatch = p.fetishTags?.some((t) => t.toLowerCase().includes(q));
      if (!nameMatch && !bioMatch && !tagMatch) return false;
    }
    return true;
  });

  return (
    <ScreenContainer title="Promociona tu Página Azul" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Promociona tu Página Azul 💙📸</Text>
          <Text style={styles.subtitle}>
            Directorio exclusivo para creadores/as de contenido BDSM, Fetish, OnlyFans, Fansly, Arsmate y Patreon
          </Text>
        </View>

        {/* Publish Action Banner */}
        <View style={styles.publishBanner}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.publishBannerTitle}>¿Eres creador/a de contenido Kink?</Text>
            <Text style={styles.publishBannerSub}>
              Publica gratis tu enlace a OnlyFans, Fansly o Arsmate y conecta con suscriptores con tus mismos gustos.
            </Text>
          </View>
          <TouchableOpacity style={styles.publishBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.publishBtnText}>➕ Promocionar Mi Página</Text>
          </TouchableOpacity>
        </View>

        {/* Platform Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Plataformas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.platformChip, selectedPlatform === 'All' && styles.platformChipActive]}
              onPress={() => setSelectedPlatform('All')}
            >
              <Text style={[styles.platformChipText, selectedPlatform === 'All' && styles.platformChipTextActive]}>
                🌐 Todas ({promos.length})
              </Text>
            </TouchableOpacity>

            {(Object.keys(PLATFORM_INFO) as BluePlatform[]).map((pKey) => {
              const info = PLATFORM_INFO[pKey];
              const isSel = selectedPlatform === pKey;
              return (
                <TouchableOpacity
                  key={pKey}
                  style={[
                    styles.platformChip,
                    isSel && { backgroundColor: `${info.color}25`, borderColor: info.color },
                  ]}
                  onPress={() => setSelectedPlatform(pKey)}
                >
                  <Text style={[styles.platformChipText, isSel && { color: info.color, fontWeight: '800' }]}>
                    {info.emoji} {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por creador, fetiche o palabra clave (ej: Shibari, Látex, Dominación)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Fetish Tags Filter Row */}
        {allTags.length > 0 && (
          <View style={styles.tagSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.tagChip, selectedTag === 'All' && styles.tagChipActive]}
                onPress={() => setSelectedTag('All')}
              >
                <Text style={[styles.tagChipText, selectedTag === 'All' && styles.tagChipTextActive]}>
                  #TodosLosFetiches
                </Text>
              </TouchableOpacity>

              {allTags.map((tag) => {
                const isSel = selectedTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, isSel && styles.tagChipActive]}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text style={[styles.tagChipText, isSel && styles.tagChipTextActive]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Creator List */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredPromos.map((promo) => {
            const pInfo = PLATFORM_INFO[promo.platform] || PLATFORM_INFO['Otro'];
            return (
              <View key={promo.id} style={styles.promoCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <Text style={styles.avatarEmoji}>{promo.avatarEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.creatorName}>{promo.creatorName}</Text>
                      {promo.verified && <Text style={styles.verifiedCheck}>✓ Verificado</Text>}
                    </View>
                    <Text style={styles.handleText}>{promo.handle}</Text>
                  </View>

                  <View style={[styles.platformBadge, { backgroundColor: `${pInfo.color}20`, borderColor: pInfo.color }]}>
                    <Text style={[styles.platformBadgeText, { color: pInfo.color }]}>
                      {pInfo.emoji} {pInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Promo Discount Banner */}
                {promo.promoDiscount ? (
                  <View style={styles.discountBanner}>
                    <Text style={styles.discountText}>{promo.promoDiscount}</Text>
                  </View>
                ) : null}

                {/* Bio */}
                <Text style={styles.bioText}>{promo.bio}</Text>

                {/* Fetish Tags Grid */}
                {promo.fetishTags && promo.fetishTags.length > 0 && (
                  <View style={styles.tagsGrid}>
                    {promo.fetishTags.map((t, idx) => (
                      <View key={idx} style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText}>#{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.visitBtn, { backgroundColor: pInfo.color }]}
                    onPress={() => handleOpenLink(promo.profileUrl)}
                  >
                    <Text style={styles.visitBtnText}>Visitar {pInfo.label} ↗</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(promo.id)}>
                    <Text style={styles.likeBtnText}>❤️ {promo.likesCount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>

      {/* Modal Form to Publish Creator Promo */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💙 Promociona tu Página Azul</Text>
            <Text style={styles.modalSub}>
              Publica tu enlace directo para que la comunidad BDSM & Kink encuentre tu contenido.
            </Text>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Emoji de Avatar</Text>
              <TextInput
                style={styles.input}
                value={avatarEmoji}
                onChangeText={setAvatarEmoji}
                placeholder="Ej: 💙, 👑, 🐰, 🖤"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Nombre de Creador/a *</Text>
              <TextInput
                style={styles.input}
                value={creatorName}
                onChangeText={setCreatorName}
                placeholder="Ej: Mistress Roxana, KinkBunny..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Handle / Usuario (opcional)</Text>
              <TextInput
                style={styles.input}
                value={handle}
                onChangeText={setHandle}
                placeholder="Ej: @MistressRox"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Plataforma Principal *</Text>
              <View style={styles.chipGrid}>
                {(Object.keys(PLATFORM_INFO) as BluePlatform[]).map((pKey) => {
                  const info = PLATFORM_INFO[pKey];
                  const sel = platform === pKey;
                  return (
                    <TouchableOpacity
                      key={pKey}
                      style={[styles.formChip, sel && { backgroundColor: `${info.color}30`, borderColor: info.color }]}
                      onPress={() => setPlatform(pKey)}
                    >
                      <Text style={[styles.formChipText, sel && { color: info.color, fontWeight: '800' }]}>
                        {info.emoji} {info.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Enlace Directo a tu Perfil *</Text>
              <TextInput
                style={styles.input}
                value={profileUrl}
                onChangeText={setProfileUrl}
                placeholder="Ej: https://onlyfans.com/tu_usuario"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Oferta o Descuento Especial (opcional)</Text>
              <TextInput
                style={styles.input}
                value={promoDiscount}
                onChangeText={setPromoDiscount}
                placeholder="Ej: 🔥 30% OFF en tu primer mes"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Etiquetas de Fetiches (sep. por coma)</Text>
              <TextInput
                style={styles.input}
                value={fetishTagsInput}
                onChangeText={setFetishTagsInput}
                placeholder="Ej: Shibari, Látex, Dominación, ASMR"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Descripción / Bio</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Describe tu contenido, frecuencia de publicación, estilo..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handlePublish}>
                <Text style={styles.submitBtnText}>Publicar Creador/a 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: '#38bdf8', fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  publishBanner: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  publishBannerTitle: { fontFamily: fonts.bodySemi, color: '#ffffff', fontSize: fontSize.sm, fontWeight: '800' },
  publishBannerSub: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 11 },
  publishBtn: { backgroundColor: '#0284c7', borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8 },
  publishBtnText: { fontFamily: fonts.bodySemi, color: '#ffffff', fontSize: fontSize.xs, fontWeight: '800' },

  filterSection: { marginVertical: 4 },
  filterLabel: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi, marginBottom: 4 },
  chipScroll: { flexDirection: 'row', gap: spacing.xs, paddingBottom: 4 },
  platformChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformChipActive: { backgroundColor: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8' },
  platformChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  platformChipTextActive: { color: '#38bdf8', fontWeight: '800' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: spacing.sm, color: colors.text, fontSize: fontSize.sm },

  tagSection: { marginBottom: spacing.xs },
  tagChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: { backgroundColor: colors.accentSoft, borderColor: colors.primary },
  tagChipText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi },
  tagChipTextActive: { color: colors.primary, fontWeight: '800' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  promoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarEmoji: { fontSize: 32 },
  creatorName: { color: '#ffffff', fontSize: fontSize.md, fontFamily: fonts.bodySemi, fontWeight: '800' },
  handleText: { color: colors.textMuted, fontSize: 11 },
  verifiedCheck: { color: '#38bdf8', fontSize: 10, fontWeight: '800' },
  platformBadge: { borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  platformBadgeText: { fontSize: 10, fontWeight: '800' },

  discountBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: { color: '#fbbf24', fontSize: fontSize.xs, fontWeight: '800' },

  bioText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tagBadge: { backgroundColor: 'rgba(192, 132, 252, 0.12)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagBadgeText: { color: colors.primary, fontSize: 10, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  visitBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.md, alignItems: 'center' },
  visitBtnText: { color: '#ffffff', fontSize: fontSize.xs, fontWeight: '800' },
  likeBtn: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  likeBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 5, 10, 0.85)', justifyContent: 'center', padding: spacing.md },
  modalContent: { backgroundColor: '#0f172a', borderRadius: radii.xl, padding: spacing.lg, maxHeight: '90%', borderWidth: 2, borderColor: '#38bdf8', gap: spacing.sm },
  modalTitle: { color: '#38bdf8', fontSize: fontSize.lg, fontWeight: '800' },
  modalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  modalScroll: { gap: spacing.xs },
  fieldLabel: { ...typography.label, marginTop: 6 },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  formChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  formChipText: { color: colors.textMuted, fontSize: 11 },
  modalActionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: colors.surface, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.sm },
  submitBtn: { flex: 2, backgroundColor: '#0284c7', paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: fontSize.sm, fontWeight: '800' },
});
