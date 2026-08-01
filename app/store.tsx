import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { getCurrentProfile, getWishlist } from '@/lib/storage';
import { UserProfile, ActivityCategory, CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/types';

interface ProductItem {
  id: string;
  name: string;
  category: ActivityCategory;
  price: number;
  currency: string;
  vendorName: string;
  vendorIsVerified: boolean;
  imageUri: string;
  description: string;
  discountCode?: string;
  affiliateUrl?: string;
  rating: number;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Kit de Cuerda Yute Tratada 6mm (3x10m)',
    category: 'bondage',
    price: 34.99,
    currency: 'USD',
    vendorName: 'Shibari Artisan Co.',
    vendorIsVerified: true,
    imageUri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=60',
    description: 'Cuerda de yute natural aplanada y suavizada con aceite de jojoba. Ideal para ataduras de suspensión suave.',
    discountCode: 'COMPATIKINK10',
    rating: 4.9,
  },
  {
    id: 'p2',
    name: 'Flogger de Cuero Vacuno Premium 45cm',
    category: 'impact',
    price: 49.99,
    currency: 'USD',
    vendorName: 'LeatherCraft Kink Store',
    vendorIsVerified: true,
    imageUri: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60',
    description: 'Flogger de peso balanceado con 40 tiras de cuero suave. Sensación sorda y segura para novatos y expertos.',
    discountCode: 'COMPATIKINK15',
    rating: 4.8,
  },
  {
    id: 'p3',
    name: 'Velas de Soya para Juego de Cera (Set de 3)',
    category: 'sensation',
    price: 24.5,
    currency: 'USD',
    vendorName: 'Sensual Glow Botánica',
    vendorIsVerified: true,
    imageUri: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&auto=format&fit=crop&q=60',
    description: 'Velas de bajo punto de fusión (45°C - 48°C) enriquecidas con manteca de karité. Seguras para la piel.',
    discountCode: 'COMPATIKINK10',
    rating: 5.0,
  },
  {
    id: 'p4',
    name: 'Dispositivo QIUI Cellmate 2 + API Bluetooth',
    category: 'lifestyle',
    price: 119.0,
    currency: 'USD',
    vendorName: 'Teledildonics Tech Distribuidores',
    vendorIsVerified: true,
    imageUri: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60',
    description: 'Candado de castidad ergonómico con control Bluetooth y compatibilidad directa con Compatikink Hardware.',
    discountCode: 'QIUIKINK20',
    rating: 4.7,
  },
  {
    id: 'p5',
    name: 'Arnés Corporal de Piel & Lencería Fetish',
    category: 'roleplay',
    price: 59.99,
    currency: 'USD',
    vendorName: 'Neon Velvet Boutique',
    vendorIsVerified: true,
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=60',
    description: 'Arnés ajustable de alta costura con herrajes de acero inoxidable. Talla adaptable S-XL.',
    discountCode: 'COMPATIKINK10',
    rating: 4.9,
  },
];

export default function StoreScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerStoreName, setPartnerStoreName] = useState('');
  const [partnerContactEmail, setPartnerContactEmail] = useState('');

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      const w = await getWishlist();
      setWishlistCount(w.length);
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    return FEATURED_PRODUCTS.filter((prod) => {
      if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesVendor = prod.vendorName.toLowerCase().includes(q);
        const matchesDesc = prod.description.toLowerCase().includes(q);
        if (!matchesName && !matchesVendor && !matchesDesc) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleRegisterPartnerStore = () => {
    if (!partnerStoreName.trim() || !partnerContactEmail.trim()) {
      Alert.alert('Campos Incompletos', 'Ingresa el nombre de tu Sexshop o Distribuidor y un correo de contacto.');
      return;
    }

    setShowPartnerModal(false);
    Alert.alert(
      'Solicitud de Sexshop Partners Recibida 🛍️',
      `Gracias por registrar ${partnerStoreName}. Nuestro equipo revisará tus productos y te contactará a ${partnerContactEmail} para activar tu catálogo pagado.`
    );
    setPartnerStoreName('');
    setPartnerContactEmail('');
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mercado & Tienda Kink</Text>
          <Text style={styles.subtitle}>
            Accesorios, cuerdas, ropa y juguetes recomendados según tus gustos eróticos y Wishlist
          </Text>
        </View>

        {/* Search & Vendor Banner */}
        <View style={styles.partnerBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.partnerTitle}>🏪 ¿Eres una Sexshop o Distribuidor?</Text>
            <Text style={styles.partnerSub}>
              Publica tu catálogo de productos destacados frente a usuarios altamente compatibles.
            </Text>
          </View>

          <TouchableOpacity style={styles.partnerBtn} onPress={() => setShowPartnerModal(true)}>
            <Text style={styles.partnerBtnText}>Vender mi Catálogo 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Search TextInput */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar cuerdas, floggers, velas, QIUI, arneses..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {[
            { id: 'all', label: '🌐 Todo' },
            { id: 'bondage', label: '🪢 Cuerdas & Shibari' },
            { id: 'impact', label: '⚡ Impacto & Cuero' },
            { id: 'sensation', label: '🕯️ Velas & Sensorial' },
            { id: 'lifestyle', label: '🔒 Castidad & Hardware' },
            { id: 'roleplay', label: '👙 Lencería & Arneses' },
          ].map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, selectedCategory === c.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(c.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === c.id && styles.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Cards Grid */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md }}>
            {filteredProducts.map((p) => (
              <View key={p.id} style={styles.productCard}>
                <Image source={{ uri: p.imageUri }} style={styles.productImg} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.vendorBadge}>
                      {p.vendorIsVerified ? '✓ Verified ' : ''}{p.vendorName}
                    </Text>
                    <Text style={styles.ratingText}>★ {p.rating}</Text>
                  </View>

                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productDesc}>{p.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>
                      ${p.price.toFixed(2)} {p.currency}
                    </Text>
                    {p.discountCode && (
                      <View style={styles.couponBadge}>
                        <Text style={styles.couponText}>Cupón: {p.discountCode}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.buyBtn}
                    onPress={() =>
                      Alert.alert(
                        `Comprar ${p.name}`,
                        `Obtén un 10% de descuento usando el código ${p.discountCode} en el sitio del distribuidor verificado ${p.vendorName}.`,
                        [
                          { text: 'Copiar Cupón & Ir a Tienda 🛒', onPress: () => {} },
                          { text: 'Cancelar', style: 'cancel' },
                        ]
                      )
                    }
                  >
                    <Text style={styles.buyBtnText}>Comprar en Sexshop Verificada 🛒</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Partner Vendor Modal */}
        <Modal visible={showPartnerModal} transparent animationType="fade" onRequestClose={() => setShowPartnerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowPartnerModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>🏪 Registro de Sexshop o Distribuidor Partner</Text>
              <Text style={styles.modalSub}>
                Ofrece tu catálogo de productos, cuerdas o juguetes pagados directamente a usuarios interesados en tu categoría:
              </Text>

              <Text style={styles.fieldLabel}>Nombre de la Tienda / Distribuidora *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: KinkShop Santiago"
                placeholderTextColor={colors.textMuted}
                value={partnerStoreName}
                onChangeText={setPartnerStoreName}
              />

              <Text style={styles.fieldLabel}>Correo de Contacto Comercial *</Text>
              <TextInput
                style={styles.input}
                placeholder="contacto@kinkshop.com"
                placeholderTextColor={colors.textMuted}
                value={partnerContactEmail}
                onChangeText={setPartnerContactEmail}
                keyboardType="email-address"
              />

              <TouchableOpacity style={styles.submitPartnerBtn} onPress={handleRegisterPartnerStore}>
                <Text style={styles.submitPartnerText}>Enviar Solicitud Comercial 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  partnerBanner: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  partnerTitle: { color: colors.success, fontSize: fontSize.xs, fontWeight: '900' },
  partnerSub: { color: colors.text, fontSize: 10, marginTop: 2, lineHeight: 14 },
  partnerBtn: { backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  partnerBtnText: { color: '#000', fontSize: 10, fontWeight: '900' },

  searchInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },

  catScroll: { gap: 6, marginVertical: spacing.xs },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  catChipTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  productCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    flexDirection: 'row',
    gap: spacing.md,
  },
  productImg: { width: 90, height: 110, borderRadius: radii.lg },
  vendorBadge: { color: colors.success, fontSize: 10, fontWeight: '800' },
  ratingText: { color: colors.warning, fontSize: 10, fontWeight: '800' },
  productName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '900' },
  productDesc: { color: colors.textMuted, fontSize: 10, lineHeight: 14 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  priceText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '900' },
  couponBadge: { backgroundColor: 'rgba(244, 114, 182, 0.15)', borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  couponText: { color: colors.accent, fontSize: 9, fontWeight: '800' },

  buyBtn: { backgroundColor: colors.primary, paddingVertical: 8, borderRadius: radii.md, alignItems: 'center', marginTop: 4 },
  buyBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 6, 18, 0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  modalCard: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.xl, maxWidth: 440, width: '100%', borderWidth: 1.5, borderColor: colors.primary, gap: spacing.md },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: colors.textMuted, fontSize: 14 },
  modalTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900' },
  modalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  input: { backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },
  submitPartnerBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  submitPartnerText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '800' },
});
