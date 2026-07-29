import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { getPhotos, createSharedLink, revokeAllLinks, PrivatePhoto } from '@/lib/privateAlbum';

export default function PrivateAlbumScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [photos, setPhotos] = useState<PrivatePhoto[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await getPhotos();
      setPhotos(loaded);
    })();
  }, []);

  const handleSharePhoto = async (photo: PrivatePhoto) => {
    const link = await createSharedLink(photo.id);
    Alert.alert(
      'Enlace Temporal Creado 🔗',
      `Se ha generado un enlace seguro revocable con expiración en 24 horas para "${photo.caption}".\n\nID de Enlace: ${link.id}`
    );
  };

  const handleRevokeAll = async () => {
    Alert.alert(
      '🚨 REVOCAR TODO EL ACCESO',
      '¿Estás seguro/a de revocar de inmediato TODOS los enlaces de acceso compartidos a tus fotos privadas?',
      [
        {
          text: 'Sí, Revocar Todo 🚨',
          style: 'destructive',
          onPress: async () => {
            await revokeAllLinks();
            Alert.alert('Acceso Revocado ✅', 'Todos los enlaces temporales de tu álbum han sido invalidados de forma permanente.');
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🔐 Bóveda de Fotos Privadas (AES-256)</Text>
          <Text style={styles.subtitle}>
            Álbum personal con cifrado de grado militar y enlaces de acceso temporal con revocación instantánea
          </Text>
        </View>

        {/* Global Revoke Button */}
        <TouchableOpacity style={styles.revokeBanner} onPress={handleRevokeAll}>
          <Text style={styles.revokeText}>🚨 Botón de Emergencia: Revocar Todo el Acceso a Enlaces Compartidos</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {photos.map((ph) => (
              <View key={ph.id} style={styles.photoCard}>
                <View style={styles.photoHeader}>
                  <Text style={styles.catBadge}>{ph.category.toUpperCase()}</Text>
                  <Text style={styles.encryptedText}>🔒 AES-256</Text>
                </View>

                <Text style={styles.photoCaption}>{ph.caption}</Text>
                <Text style={styles.photoDate}>Subido: {new Date(ph.createdAt).toLocaleDateString()}</Text>

                <TouchableOpacity style={styles.shareBtn} onPress={() => handleSharePhoto(ph)}>
                  <Text style={styles.shareBtnText}>Generar Link Revocable (24h) 🔗</Text>
                </TouchableOpacity>
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

  revokeBanner: { backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: spacing.md, borderRadius: 14, borderWidth: 1.5, borderColor: colors.danger, marginVertical: spacing.xs },
  revokeText: { color: colors.danger, fontSize: fontSize.xs, fontWeight: '900', textAlign: 'center' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  grid: { gap: spacing.md },
  photoCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, borderWidth: 1.5, borderColor: 'rgba(192, 132, 252, 0.3)', gap: spacing.sm },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: { color: colors.neonPurple, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  encryptedText: { color: colors.success, fontSize: 10, fontWeight: '900' },
  photoCaption: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  photoDate: { color: colors.textMuted, fontSize: 10 },

  shareBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  shareBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
