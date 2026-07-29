import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

export interface GearItem {
  id: string;
  name: string;
  category: string;
  condition: 'excellent' | 'good' | 'needs_care';
  notes?: string;
}

const DEFAULT_GEAR_PRESETS = [
  { name: 'Cuerda de Yute 6mm (Shibari)', category: 'Ataduras', condition: 'excellent' as const },
  { name: 'Flogger de Cuero Vacuno', category: 'Impacto', condition: 'good' as const },
  { name: 'Velas de Cera de Soja 50°C', category: 'Sensaciones', condition: 'excellent' as const },
  { name: 'Tijeras de Rescate de Punta Roma', category: 'Seguridad', condition: 'excellent' as const },
];

const GEAR_STORAGE_KEY = 'user_gear_closet_items';

export default function GearClosetScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [gearList, setGearList] = useState<GearItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Ataduras');
  const [newCondition, setNewCondition] = useState<'excellent' | 'good' | 'needs_care'>('excellent');

  const loadGear = async () => {
    const raw = await AsyncStorage.getItem(GEAR_STORAGE_KEY);
    if (raw) {
      setGearList(JSON.parse(raw));
    } else {
      const presets = DEFAULT_GEAR_PRESETS.map((p, idx) => ({ ...p, id: `preset_${idx}` }));
      setGearList(presets);
      await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(presets));
    }
  };

  useEffect(() => {
    loadGear();
  }, []);

  const handleAddGear = async () => {
    if (!newName.trim()) {
      Alert.alert('Nombre Requerido', 'Por favor ingresa un nombre para el equipamiento.');
      return;
    }

    const newItem: GearItem = {
      id: `${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      condition: newCondition,
    };

    const updated = [...gearList, newItem];
    setGearList(updated);
    await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(updated));
    setNewName('');
    setShowAddModal(false);
  };

  const handleRemoveGear = async (id: string) => {
    const updated = gearList.filter((g) => g.id !== id);
    setGearList(updated);
    await AsyncStorage.setItem(GEAR_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🧰 Inventario de Equipamiento (Gear Closet)</Text>
          <Text style={styles.subtitle}>
            Administra tus accesorios, cuerdas y herramientas de seguridad para vincular a escenas
          </Text>
        </View>

        {/* Add Gear Trigger */}
        <TouchableOpacity style={styles.addTriggerBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addTriggerText}>➕ Registrar Nuevo Equipamiento</Text>
        </TouchableOpacity>

        {/* Modal / Form */}
        {showAddModal && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nuevo Accesorio / Herramienta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Flogger de gamuza, Plugs de silicona, Antifaz..."
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.fieldLabel}>Categoría:</Text>
            <View style={styles.chipsRow}>
              {['Ataduras', 'Impacto', 'Sensaciones', 'Seguridad', 'Juguetes', 'Ropa / Arneses'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, newCat === cat && styles.chipActive]}
                  onPress={() => setNewCat(cat)}
                >
                  <Text style={[styles.chipText, newCat === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Estado:</Text>
            <View style={styles.chipsRow}>
              {[
                { id: 'excellent', label: '🟢 Excelente' },
                { id: 'good', label: '🟡 Buen estado' },
                { id: 'needs_care', label: '🔴 Requiere desinfección / revisión' },
              ].map((cond) => (
                <TouchableOpacity
                  key={cond.id}
                  style={[styles.chip, newCondition === cond.id && styles.chipActive]}
                  onPress={() => setNewCondition(cond.id as any)}
                >
                  <Text style={[styles.chipText, newCondition === cond.id && styles.chipTextActive]}>
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddGear}>
                <Text style={styles.saveBtnText}>Guardar Equipamiento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Gear List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {gearList.map((item) => (
            <View key={item.id} style={styles.gearCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gearName}>{item.name}</Text>
                <Text style={styles.gearCategory}>Categoría: {item.category}</Text>
                <View style={styles.condBadge}>
                  <Text style={styles.condText}>
                    {item.condition === 'excellent' && '🟢 Estado: Excelente'}
                    {item.condition === 'good' && '🟡 Estado: Bueno'}
                    {item.condition === 'needs_care' && '🔴 Estado: Requiere atención'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveGear(item.id)}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  addTriggerBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  addTriggerText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '800' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  formTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  formActions: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: spacing.md },
  cancelBtnText: { color: colors.textMuted, fontSize: fontSize.xs },

  list: { gap: spacing.sm, paddingTop: spacing.xs },
  gearCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gearName: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '800' },
  gearCategory: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  condBadge: { marginTop: 4 },
  condText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
