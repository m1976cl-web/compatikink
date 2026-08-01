import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Section } from '@/components/Section';
import { VaultLockGate } from '@/components/VaultLockGate';
import { EmptyState } from '@/components/EmptyState';
import { useResponsive } from '@/hooks/useResponsive';
import { getPhotos, createSharedLink, revokeAllLinks, PrivatePhoto } from '@/lib/privateAlbum';
import { VaultLockGateAPI } from '@/lib/cryptoVault';

export default function PrivateAlbumScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [photos, setPhotos] = useState<PrivatePhoto[]>([]);
  const [vaultUnlocked, setVaultUnlocked] = useState(() => VaultLockGateAPI.isUnlocked());

  useEffect(() => {
    return VaultLockGateAPI.subscribe((snap) => setVaultUnlocked(snap.unlocked));
  }, []);

  useEffect(() => {
    if (!vaultUnlocked) {
      setPhotos([]);
      return;
    }
    (async () => {
      try {
        const loaded = await getPhotos();
        setPhotos(loaded);
      } catch {
        setPhotos([]);
      }
    })();
  }, [vaultUnlocked]);

  const handleSharePhoto = async (photo: PrivatePhoto) => {
    const link = await createSharedLink(photo.id);
    Alert.alert(
      'Enlace temporal creado',
      `Se ha generado un enlace seguro revocable con expiración en 24 horas para "${photo.caption}".\n\nID de Enlace: ${link.id}`
    );
  };

  const handleRevokeAll = async () => {
    Alert.alert(
      'Revocar todo el acceso',
      '¿Estás seguro/a de revocar de inmediato TODOS los enlaces de acceso compartidos a tus fotos privadas?',
      [
        {
          text: 'Sí, revocar todo',
          style: 'destructive',
          onPress: async () => {
            await revokeAllLinks();
            Alert.alert('Acceso revocado', 'Todos los enlaces temporales de tu álbum han sido invalidados.');
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <ScreenContainer title="Álbum privado" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Álbum privado</Text>
          <Text style={styles.subtitle}>
            Fotos cifradas en dispositivo (AES-GCM) con enlaces temporales revocables
          </Text>
        </View>

        <VaultLockGate
          title="Bóveda del álbum"
          subtitle="Introduce tu PIN para descifrar el álbum en este dispositivo."
          showLockButton
        >
          <TouchableOpacity style={styles.revokeBanner} onPress={handleRevokeAll}>
            <Text style={styles.revokeText}>Emergencia: revocar todos los enlaces compartidos</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Section title="Colección cifrada" subtitle="Solo visible con la bóveda desbloqueada">
              {photos.length === 0 ? (
                <EmptyState
                  title="Sin fotos aún"
                  description="Cuando añadas fotos privadas aparecerán aquí, cifradas en este dispositivo."
                />
              ) : (
                <View style={styles.grid}>
                  {photos.map((ph) => (
                    <View key={ph.id} style={styles.photoCard}>
                      <View style={styles.photoHeader}>
                        <Text style={styles.catBadge}>{ph.category.toUpperCase()}</Text>
                        <Text style={styles.encryptedText}>AES-GCM</Text>
                      </View>

                      <Text style={styles.photoCaption}>{ph.caption}</Text>
                      <Text style={styles.photoDate}>
                        Subido: {new Date(ph.createdAt).toLocaleDateString()}
                      </Text>

                      <TouchableOpacity style={styles.shareBtn} onPress={() => handleSharePhoto(ph)}>
                        <Text style={styles.shareBtnText}>Generar link revocable (24h)</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Section>

            <View style={{ height: 60 }} />
          </ScrollView>
        </VaultLockGate>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  revokeBanner: {
    backgroundColor: 'rgba(196, 92, 92, 0.15)',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    marginVertical: spacing.sm,
  },
  revokeText: {
    fontFamily: fonts.bodySemi,
    color: colors.danger,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  grid: { gap: spacing.md },
  photoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: spacing.sm,
  },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  encryptedText: {
    fontFamily: fonts.bodySemi,
    color: colors.success,
    fontSize: fontSize.xs,
  },
  photoCaption: {
    fontFamily: fonts.bodySemi,
    color: colors.text,
    fontSize: fontSize.md,
  },
  photoDate: { color: colors.textMuted, fontSize: fontSize.xs },

  shareBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: 4,
  },
  shareBtnText: { fontFamily: fonts.bodySemi, color: colors.onPrimary, fontSize: fontSize.xs },
});
