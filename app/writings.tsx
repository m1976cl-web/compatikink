import React, { useState } from 'react';
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
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Writing {
  id: string;
  title: string;
  category: 'Diario' | 'Reflexión' | 'Poesía Erótica' | 'Educación';
  content: string;
  privacy: 'Privado (Solo yo)' | 'Solo Pareja' | 'Comunidad Anónima';
  createdAt: string;
}

const DEFAULT_WRITINGS: Writing[] = [
  {
    id: 'w-1',
    title: 'Mi experiencia con el Subspace por primera vez',
    category: 'Reflexión',
    content: 'Sensación de ingravidez y desconexión completa de las preocupaciones diarias tras 40 minutos de ataduras suaves.',
    privacy: 'Solo Pareja',
    createdAt: '2026-07-28',
  },
  {
    id: 'w-2',
    title: 'Notas sobre tensión de cuerda de yute 6mm',
    category: 'Educación',
    content: 'Comprobar siempre la soltura de 2 dedos bajo el arnés de pecho para no comprimir la caja torácica.',
    privacy: 'Privado (Solo yo)',
    createdAt: '2026-07-25',
  },
];

export default function WritingsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [writings, setWritings] = useState<Writing[]>(DEFAULT_WRITINGS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Diario' | 'Reflexión' | 'Poesía Erótica' | 'Educación'>('Reflexión');

  const handleCreateWriting = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Campos Incompletos 📝', 'Por favor ingresa un título y contenido para tu escrito.');
      return;
    }

    const item: Writing = {
      id: `w-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      privacy: 'Solo Pareja',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWritings([item, ...writings]);
    setNewTitle('');
    setNewContent('');
    Alert.alert('Escrito Publicado ✍️', 'Tu diario o escrito ha sido guardado de forma privada en tu perfil.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>✍️ Blog Personal & Escritos Kink</Text>
          <Text style={styles.subtitle}>
            Espacio de expresión personal estilo FetLife Writings para redactar diarios de escena, poesía erótica y reflexiones
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Create Form */}
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>✍️ Redactar Nuevo Escrito:</Text>
            <TextInput
              style={styles.input}
              placeholder="Título del escrito..."
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            {/* Category Selector */}
            <View style={styles.catRow}>
              {(['Reflexión', 'Diario', 'Poesía Erótica', 'Educación'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, newCategory === cat && styles.catChipActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catChipText, newCategory === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe tus reflexiones, notas de aprendizaje o sentimientos..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={newContent}
              onChangeText={setNewContent}
            />

            <TouchableOpacity style={styles.publishBtn} onPress={handleCreateWriting}>
              <Text style={styles.publishBtnText}>Guardar Escrito ✍️</Text>
            </TouchableOpacity>
          </View>

          {/* Writings List */}
          <View style={{ gap: spacing.md }}>
            {writings.map((w) => (
              <View key={w.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.catBadge}>{w.category.toUpperCase()}</Text>
                  <Text style={styles.privacyBadge}>🔒 {w.privacy}</Text>
                </View>

                <Text style={styles.cardTitle}>{w.title}</Text>
                <Text style={styles.cardDesc}>{w.content}</Text>
                <Text style={styles.cardDate}>Publicado: {w.createdAt}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  createCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.4)', gap: spacing.sm },
  createTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  input: { backgroundColor: colors.surfaceLight, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },
  textArea: { height: 90, textAlignVertical: 'top' },

  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },

  publishBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  publishBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '900' },

  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { color: colors.neonPink, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  privacyBadge: { color: colors.success, fontSize: 10, fontWeight: '800' },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  cardDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },
  cardDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
});
