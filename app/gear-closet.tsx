import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';

export interface GearItem {
  id: string;
  name: string;
  category: string;
  condition: 'excellent' | 'good' | 'needs_care';
  intent: 'owned' | 'wishlist' | 'curious';
  photoUri?: string;
  notes?: string;
}

const DEFAULT_GEAR_PRESETS: Omit<GearItem, 'id'>[] = [
  {
    name: 'Cuerda de Yute 6mm (Shibari)',
    category: 'Ataduras',
    condition: 'excellent',
    intent: 'owned',
    notes: 'Tratada con cera de abejas y aceite de jojoba.',
  },
  {
    name: 'Flogger de Cuero Vacuno',
    category: 'Impacto',
    condition: 'good',
    intent: 'owned',
    notes: 'Peso medio, sensaciones progresivas.',
  },
  {
    name: 'Vibrador de Control Remoto App',
    category: 'Juguetes',
    condition: 'excellent',
    intent: 'wishlist',
    notes: 'Tengo curiosidad de probarlo con otra persona en citas discretas 🔮',
  },
  {
    name: 'Velas de Cera de Soja 50°C',
    category: 'Sensaciones',
    condition: 'excellent',
    intent: 'owned',
    notes: 'Bajo punto de fusión.',
  },
  {
    name: 'Tijeras de Rescate de Punta Roma',
    category: 'Seguridad',
    condition: 'excellent',
    intent: 'owned',
    notes: 'Siempre al alcance en ataduras.',
  },
  {
    name: 'Catsuit de Látex Glossy Black 0.4mm',
    category: 'Látex / Ropa',
    condition: 'excellent',
    intent: 'wishlist',
    notes: 'Deseo explorarlo en escena de rol 🖤',
  },
];

const SAMPLE_PHOTO_PRESETS = [
  { label: '🪢 Cuerdas', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop' },
  { label: '🖤 Látex', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=300&auto=format&fit=crop' },
  { label: '🧸 Juguete', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop' },
  { label: '🔒 Castidad', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=300&auto=format&fit=crop' },
];

const GEAR_STORAGE_KEY = 'user_gear_closet_items_v2';

export default function GearClosetScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [gearList, setGearList] = useState<GearItem[]>([]);
  const [activeTab, setActiveTab] = useState<'owned' | 'wishlist' | 'compat'>('owned');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedGearIds, setSelectedGearIds] = useState<Set<string>>(new Set());

  // Form states
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Juguetes');
  const [newCondition, setNewCondition] = useState<'excellent' | 'good' | 'needs_care'>('excellent');
  const [newIntent, setNewIntent] = useState<'owned' | 'wishlist' | 'curious'>('owned');
  const [newPhotoUri, setNewPhotoUri] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadGear = async () => {
    const raw = await AsyncStorage.getItem(GEAR_STORAGE_KEY);
    if (raw) {
      setGearList(JSON.parse(raw));
    } else {
      const presets: GearItem[] = DEFAULT_GEAR_PRESETS.map((p, idx) => ({ ...p, id: `preset_${idx}` }));
      setGearList(presets);
      await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(presets));
    }
  };

  useEffect(() => {
    loadGear();
  }, []);

  const handleAddGear = async () => {
    if (!newName.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor ingresa un nombre para el equipamiento o juguete.');
      return;
    }

    const newItem: GearItem = {
      id: `${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      condition: newCondition,
      intent: newIntent,
      photoUri: newPhotoUri.trim() || undefined,
      notes: newNotes.trim() || undefined,
    };

    const updated = [...gearList, newItem];
    setGearList(updated);
    await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(updated));
    setNewName('');
    setNewPhotoUri('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleRemoveGear = async (id: string) => {
    const updated = gearList.filter((g) => g.id !== id);
    setGearList(updated);
    await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredItems = gearList.filter((item) => {
    if (activeTab === 'owned') return item.intent === 'owned';
    if (activeTab === 'wishlist') return item.intent === 'wishlist' || item.intent === 'curious';
    return true; // compat mode shows all
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedGearIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedGearIds(newSelection);
  };

  const handleGenerateShowcase = async () => {
    if (selectedGearIds.size === 0) {
      Alert.alert('Sin selección', 'Selecciona al menos un elemento para el showcase.');
      return;
    }
    const selectedItems = gearList.filter(g => selectedGearIds.has(g.id));
    const text = `*Mi Gear Closet Disponible*\n\n` + selectedItems.map(g => `- ${g.name} (${g.category})`).join('\n') + `\n\n[Compartido desde CompatKink]`;
    await Clipboard.setStringAsync(text);
    Alert.alert('¡Copiado!', 'El Showcase se ha copiado al portapapeles.');
    setIsShareMode(false);
    setSelectedGearIds(new Set());
  };

  const handleStartSession = () => {
    if (selectedGearIds.size === 0) {
      Alert.alert('Sin selección', 'Selecciona equipamiento para iniciar la sesión.');
      return;
    }
    const ids = Array.from(selectedGearIds).join(',');
    setIsShareMode(false);
    setSelectedGearIds(new Set());
    router.push(`/private-sessions?new=true&gearIds=${ids}`);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.title}>Gear Closet & Juguetes ⚙️</Text>
            <TouchableOpacity 
              style={[styles.shareToggleBtn, isShareMode && styles.shareToggleBtnActive]} 
              onPress={() => {
                setIsShareMode(!isShareMode);
                if (isShareMode) setSelectedGearIds(new Set());
              }}
            >
              <Text style={[styles.shareToggleText, isShareMode && styles.shareToggleTextActive]}>
                {isShareMode ? 'Cancelar Showcase' : 'Compartir / Sesión'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Armario personal de implementos, fotos, wishlist de curiosidades y compatibilidad de juegos con tu pareja.
          </Text>
        </View>

        {isShareMode && (
          <View style={styles.shareActionsCard}>
            <Text style={styles.shareTitle}>Modo Showcase ZK</Text>
            <Text style={styles.shareSubtitle}>Selecciona los ítems a compartir o usar en una sesión.</Text>
            <View style={styles.shareActionButtons}>
              <TouchableOpacity style={styles.shareCopyBtn} onPress={handleGenerateShowcase}>
                <Text style={styles.shareBtnText}>📋 Copiar Showcase</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareSessionBtn} onPress={handleStartSession}>
                <Text style={styles.shareBtnTextSession}>🎒 Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* View Tabs */}
        {!isShareMode && (
          <View style={styles.viewTabs}>
            {[
              { id: 'owned', label: '🧰 Mi Armario', count: gearList.filter((g) => g.intent === 'owned').length },
              { id: 'wishlist', label: '🔮 Wishlist (Probar)', count: gearList.filter((g) => g.intent !== 'owned').length },
              { id: 'compat', label: '🤝 Compatibilidad & Test', count: gearList.length },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.viewTab, activeTab === tab.id && styles.viewTabActive]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.viewTabText, activeTab === tab.id && styles.viewTabTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add Gear Trigger */}
        {!isShareMode && (
          <TouchableOpacity
            style={styles.addTriggerBtn}
            onPress={() => {
              setNewIntent(activeTab === 'wishlist' ? 'wishlist' : 'owned');
              setShowAddModal(true);
            }}
          >
            <Text style={styles.addTriggerText}>
              {activeTab === 'wishlist'
                ? '🔮 Registrar Juguete / Juego a Probar (Wishlist)'
                : '➕ Registrar Nuevo Juguete / Accesorio con Foto'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Modal / Form */}
        {showAddModal && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nuevo Juguete / Implemento</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre (ej. Vibrador app, Catsuit látex, Cuerdas...)"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.fieldLabel}>Intención / Estado:</Text>
            <View style={styles.chipsRow}>
              {[
                { id: 'owned', label: '🧰 Lo tengo en mi armario' },
                { id: 'wishlist', label: '🔮 Wishlist / Curiosidad' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, newIntent === item.id && styles.chipActive]}
                  onPress={() => setNewIntent(item.id as any)}
                >
                  <Text style={[styles.chipText, newIntent === item.id && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Categoría:</Text>
            <View style={styles.chipsRow}>
              {['Juguetes', 'Ataduras', 'Impacto', 'Sensaciones', 'Látex / Ropa', 'Seguridad', 'Castidad'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, newCat === cat && styles.chipActive]}
                  onPress={() => setNewCat(cat)}
                >
                  <Text style={[styles.chipText, newCat === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Foto (URL o Preset):</Text>
            <TextInput
              style={styles.input}
              placeholder="https://... o pega URL"
              placeholderTextColor={colors.textMuted}
              value={newPhotoUri}
              onChangeText={setNewPhotoUri}
            />

            <View style={styles.presetPhotoRow}>
              <Text style={styles.presetPhotoLabel}>Ejemplos:</Text>
              {SAMPLE_PHOTO_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.presetChip}
                  onPress={() => setNewPhotoUri(p.url)}
                >
                  <Text style={styles.presetChipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {newPhotoUri ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: newPhotoUri }} style={styles.photoPreviewImage} />
              </View>
            ) : null}

            <Text style={styles.fieldLabel}>Notas:</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              multiline
              placeholder="Detalles de cuidado, fantasía..."
              placeholderTextColor={colors.textMuted}
              value={newNotes}
              onChangeText={setNewNotes}
            />

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddGear}>
                <Text style={styles.saveBtnText}>Guardar Juguete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay elementos guardados.</Text>
            </View>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedGearIds.has(item.id);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.gearCard, 
                    isShareMode && styles.gearCardSelectable,
                    isSelected && styles.gearCardSelected
                  ]}
                  activeOpacity={isShareMode ? 0.7 : 1}
                  onPress={() => isShareMode ? toggleSelection(item.id) : null}
                >
                  {isShareMode && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  )}
                  {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={styles.gearImage} />
                  ) : (
                    <View style={styles.gearPlaceholderImage}>
                      <Text style={styles.gearPlaceholderText}>
                        {item.category === 'Látex / Ropa' ? '🖤' : item.category === 'Ataduras' ? '🪢' : '🧸'}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.gearName}>{item.name}</Text>
                      {item.intent !== 'owned' && (
                        <View style={styles.wishlistTag}>
                          <Text style={styles.wishlistTagText}>🔮 Wishlist</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.gearCategory}>Categoría: {item.category}</Text>
                    {item.notes ? <Text style={styles.gearNotes}>"{item.notes}"</Text> : null}
                  </View>

                  {!isShareMode && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveGear(item.id)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xl, flex: 1 },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  shareToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareToggleBtnActive: { backgroundColor: colors.danger + '20', borderColor: colors.danger },
  shareToggleText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700' },
  shareToggleTextActive: { color: colors.danger },

  shareActionsCard: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  shareTitle: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  shareSubtitle: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.sm },
  shareActionButtons: { flexDirection: 'row', gap: spacing.sm },
  shareCopyBtn: { flex: 1, backgroundColor: colors.surface, paddingVertical: 10, borderRadius: radii.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  shareSessionBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: radii.md, alignItems: 'center' },
  shareBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  shareBtnTextSession: { color: '#000', fontSize: fontSize.sm, fontWeight: '900' },

  viewTabs: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  viewTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  viewTabText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  viewTabTextActive: { color: '#000', fontWeight: '900' },

  addTriggerBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addTriggerText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  formTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipTextActive: { color: '#000', fontWeight: '900' },

  presetPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginVertical: 2 },
  presetPhotoLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  presetChip: { backgroundColor: colors.surfaceLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  presetChipText: { color: colors.primary, fontSize: fontSize.xs },

  photoPreviewBox: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginVertical: 4 },
  photoPreviewImage: { width: '100%', height: '100%' },

  formActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 6 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: spacing.md },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.xs },

  list: { gap: spacing.sm, paddingTop: spacing.xs },
  gearCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gearCardSelectable: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gearCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.05)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gearImage: { width: 64, height: 64, borderRadius: radii.md },
  gearPlaceholderImage: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gearPlaceholderText: { fontSize: 28 },
  gearName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  gearCategory: { color: colors.textMuted, fontSize: fontSize.xs },
  gearNotes: { color: colors.primary, fontSize: fontSize.xs, fontStyle: 'italic' },
  wishlistTag: { backgroundColor: 'rgba(192, 132, 252, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  wishlistTagText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  deleteBtn: { padding: 8 },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
  emptyBox: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
});
