import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { AuthorizedMediaItem } from '@/types/profileEnhancements';
import {
  loadAllAuthorizedMedia,
  saveAuthorizedMediaItem,
  toggleTargetUserAuthorization,
  canUserViewMedia,
} from '@/lib/authorizedMediaStorage';

interface Props {
  visible: boolean;
  targetProfileNickname: string;
  currentProfileNickname: string;
  onClose: () => void;
}

export function AuthorizedMediaGallery({
  visible,
  targetProfileNickname,
  currentProfileNickname,
  onClose,
}: Props) {
  const [mediaList, setMediaList] = useState<AuthorizedMediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'view' | 'manage'>('view');
  const [newTitle, setNewTitle] = useState('');
  const [newUri, setNewUri] = useState('');
  const [newTargetAuth, setNewTargetAuth] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends_only' | 'authorized_only' | 'private_vault'>('authorized_only');

  useEffect(() => {
    if (visible) {
      loadMedia();
    }
  }, [visible]);

  const loadMedia = async () => {
    const all = await loadAllAuthorizedMedia();
    setMediaList(all);
  };

  const handleCreateMedia = async () => {
    if (!newTitle.trim() || !newUri.trim()) return;

    const newItem: AuthorizedMediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerNickname: currentProfileNickname,
      title: newTitle.trim(),
      mediaType: newUri.includes('.mp4') ? 'video' : 'photo',
      uri: newUri.trim(),
      isPrivateVault: privacyLevel !== 'public',
      privacyLevel,
      authorizedTargetNicknames: newTargetAuth.trim() ? [newTargetAuth.trim()] : [targetProfileNickname],
      createdAt: new Date().toISOString(),
    };

    await saveAuthorizedMediaItem(newItem);
    setNewTitle('');
    setNewUri('');
    setNewTargetAuth('');
    await loadMedia();
    setActiveTab('view');
  };

  const handleToggleAuth = async (mediaId: string, nicknameToToggle: string) => {
    await toggleTargetUserAuthorization(mediaId, nicknameToToggle);
    await loadMedia();
  };

  const targetMedia = mediaList.filter(
    (m) => m.ownerNickname.toLowerCase() === targetProfileNickname.toLowerCase()
  );
  const myMedia = mediaList.filter(
    (m) => m.ownerNickname.toLowerCase() === currentProfileNickname.toLowerCase()
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>🔒 Álbum Privado Autorizado ZK</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitleText}>
            Material multimedia íntimo cifrado. Solo accesible mediante autorización de apodo puntual.
          </Text>

          {/* Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'view' && styles.activeTabBtn]}
              onPress={() => setActiveTab('view')}
            >
              <Text style={[styles.tabText, activeTab === 'view' && styles.activeTabText]}>
                🖼️ Fotos de {targetProfileNickname}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'manage' && styles.activeTabBtn]}
              onPress={() => setActiveTab('manage')}
            >
              <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>
                ⚙️ Mis Fotos y Autorizaciones
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {activeTab === 'view' ? (
              targetMedia.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🔒</Text>
                  <Text style={styles.emptyTitle}>Sin multimedia privada publicada</Text>
                  <Text style={styles.emptySub}>
                    {targetProfileNickname} no ha compartido aún contenido privado en su bóveda.
                  </Text>
                </View>
              ) : (
                <View style={styles.mediaGrid}>
                  {targetMedia.map((item) => {
                    const isAllowed = canUserViewMedia(item, currentProfileNickname);
                    return (
                      <View key={item.id} style={styles.mediaCard}>
                        {isAllowed ? (
                          <View style={styles.mediaImageWrapper}>
                            <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
                            <View style={styles.unlockedBadge}>
                              <Text style={styles.unlockedBadgeText}>🔓 Autorizado para Ti</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.lockedMediaBox}>
                            <Text style={styles.lockedIcon}>🔒</Text>
                            <Text style={styles.lockedTitle}>Acceso Restringido</Text>
                            <Text style={styles.lockedSub}>Solo usuarios autorizados puntualmente pueden ver este contenido.</Text>
                          </View>
                        )}
                        <Text style={styles.mediaTitleText}>{item.title}</Text>
                      </View>
                    );
                  })}
                </View>
              )
            ) : (
              <View style={styles.manageSection}>
                {/* Upload Form */}
                <View style={styles.uploadCard}>
                  <Text style={styles.sectionHeading}>➕ Agregar Nueva Foto/Video Íntimo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Título del contenido (ej. Shibari Noche)"
                    placeholderTextColor={colors.textMuted}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="URL o URI de la imagen/video (https://...)"
                    placeholderTextColor={colors.textMuted}
                    value={newUri}
                    onChangeText={setNewUri}
                  />
                  <Text style={styles.fieldLabel}>Visibilidad de Privacidad (Estilo FetLife):</Text>
                  <View style={styles.privacyChipsRow}>
                    {[
                      { level: 'public', label: '🌐 Público', color: colors.success },
                      { level: 'friends_only', label: '👥 Solo Amigos', color: colors.warning },
                      { level: 'authorized_only', label: '🔒 Autorizados', color: colors.neonPurple },
                      { level: 'private_vault', label: '🔐 Bóveda Privada', color: colors.danger },
                    ].map((p) => {
                      const active = privacyLevel === p.level;
                      return (
                        <TouchableOpacity
                          key={p.level}
                          style={[styles.privacyChip, active && { borderColor: p.color, backgroundColor: `${p.color}22` }]}
                          onPress={() => setPrivacyLevel(p.level as any)}
                        >
                          <Text style={[styles.privacyChipText, active && { color: p.color, fontWeight: '700' }]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {privacyLevel === 'authorized_only' ? (
                    <TextInput
                      style={styles.input}
                      placeholder={`Apodo a autorizar (ej. ${targetProfileNickname})`}
                      placeholderTextColor={colors.textMuted}
                      value={newTargetAuth}
                      onChangeText={setNewTargetAuth}
                    />
                  ) : null}

                  <TouchableOpacity style={styles.submitBtn} onPress={handleCreateMedia}>
                    <Text style={styles.submitBtnText}>🔒 Cifrar & Guardar Multimedia</Text>
                  </TouchableOpacity>
                </View>

                {/* My Media List */}
                <Text style={styles.sectionHeading}>📋 Mis Archivos y Permisos Activos:</Text>
                {myMedia.length === 0 ? (
                  <Text style={styles.emptySub}>No has subido ningún contenido privado aún.</Text>
                ) : (
                  myMedia.map((m) => (
                    <View key={m.id} style={styles.myMediaItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.myMediaTitle}>{m.title}</Text>
                        <Text style={styles.myMediaAuthList}>
                          Autorizados: {m.authorizedTargetNicknames.join(', ') || 'Ninguno'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.toggleAuthBtn}
                        onPress={() => handleToggleAuth(m.id, targetProfileNickname)}
                      >
                        <Text style={styles.toggleAuthText}>
                          {m.authorizedTargetNicknames.includes(targetProfileNickname)
                            ? '🔴 Revocar'
                            : '🟢 Autorizar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: 'rgba(21, 13, 36, 0.96)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    width: '100%',
    maxWidth: 580,
    maxHeight: '88%',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 16px 48px rgba(7, 4, 13, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
        }
      : {}),
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.lg, color: colors.text },
  closeBtn: { padding: 4 },
  closeBtnText: { color: colors.textMuted, fontSize: 18, fontWeight: 'bold' },
  subtitleText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  tabsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  activeTabBtn: { backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: colors.neonPurple },
  tabText: { fontSize: fontSize.xs, color: colors.textMuted, fontFamily: fonts.body },
  activeTabText: { color: colors.text, fontWeight: 'bold' },
  scrollContent: { gap: spacing.md },
  emptyBox: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.md, color: colors.text },
  emptySub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  mediaGrid: { gap: spacing.md },
  mediaCard: {
    backgroundColor: 'rgba(35, 23, 62, 0.6)',
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImageWrapper: { position: 'relative', width: '100%', height: 220 },
  mediaImage: { width: '100%', height: '100%' },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  unlockedBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  lockedMediaBox: {
    height: 180,
    backgroundColor: 'rgba(10, 7, 18, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: 4,
  },
  lockedIcon: { fontSize: 36 },
  lockedTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.sm, color: colors.neonRose },
  lockedSub: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  mediaTitleText: { padding: spacing.sm, fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.text },
  manageSection: { gap: spacing.md },
  uploadCard: {
    backgroundColor: 'rgba(35, 23, 62, 0.5)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  sectionHeading: { fontFamily: fonts.displaySemi, fontSize: fontSize.sm, color: colors.text },
  input: {
    backgroundColor: 'rgba(10, 7, 18, 0.7)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: colors.onPrimary, fontSize: fontSize.xs, fontWeight: 'bold' },
  myMediaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 23, 62, 0.4)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myMediaTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.text },
  myMediaAuthList: { fontSize: 11, color: colors.textMuted },
  privacyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  privacyChip: {
    backgroundColor: 'rgba(10, 7, 18, 0.7)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  privacyChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.bodySemi,
  },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    color: colors.text,
    marginTop: 6,
    marginBottom: 2,
  },
  toggleAuthBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: colors.neonPurple,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toggleAuthText: { color: colors.neonPurple, fontSize: 11, fontWeight: 'bold' },
});
