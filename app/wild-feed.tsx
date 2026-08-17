import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { DirectComparisonModal } from '@/components/profile/DirectComparisonModal';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  loadAllWildPosts,
  createWildPost,
  addWildComment,
  incrementComparisonRequest,
  reportWildPost,
  hasAcceptedWildTerms,
  setAcceptedWildTerms,
  ILLEGAL_CONTENT_WARNING_TEXT,
} from '@/lib/wildFeedStorage';
import { getCurrentProfile } from '@/lib/storage';
import { WildPost } from '@/types/wildFeed';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '@/lib/haptics';

export default function WildFeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<WildPost[]>([]);
  const [myNickname, setMyNickname] = useState<string>('Anónimo');
  const [hasTerms, setHasTerms] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // New Post State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCaption, setNewCaption] = useState<string>('');
  const [newMediaUri, setNewMediaUri] = useState<string>('');
  const [isAnonPost, setIsAnonPost] = useState<boolean>(true);

  // Comment State
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentAnonMap, setCommentAnonMap] = useState<Record<string, boolean>>({});

  // Direct Comparison Modal State
  const [targetComparisonUser, setTargetComparisonUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      if (p?.nickname) setMyNickname(p.nickname);

      if (!p || p.nickname === 'Anónimo') {
        Alert.alert(
          '🔞 Galería Salvaje — Autenticación Requerida',
          'La Galería Salvaje es un espacio exclusivo para usuarios autenticados.\n\nInicia sesión con tu cuenta de Google para ingresar. Una vez adentro, podrás publicar fotos/videos y comentar de forma 100% anónima si lo prefieres.',
          [
            { text: 'Iniciar Sesión con Google 🔵', onPress: () => router.replace('/auth') },
          ]
        );
        return;
      }

      const accepted = await hasAcceptedWildTerms();
      setHasTerms(accepted);
      if (!accepted) {
        setShowTermsModal(true);
      }

      const list = await loadAllWildPosts();
      setPosts(list);
    })();
  }, []);

  const handleAcceptTerms = async () => {
    triggerSuccessHaptic();
    await setAcceptedWildTerms(true);
    setHasTerms(true);
    setShowTermsModal(false);
  };

  const handlePublish = async () => {
    if (!newTitle.trim() || !newMediaUri.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un título y la URL de la imagen.');
      return;
    }

    triggerSuccessHaptic();
    const updated = await createWildPost({
      authorNickname: isAnonPost ? 'Anónimo' : myNickname,
      isAnonymous: isAnonPost,
      title: newTitle.trim(),
      caption: newCaption.trim(),
      mediaUri: newMediaUri.trim(),
      mediaType: 'photo',
    });

    setPosts(updated.filter((p) => !p.isBlocked));
    setShowCreateModal(false);
    setNewTitle('');
    setNewCaption('');
    setNewMediaUri('');
  };

  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    triggerLightHaptic();
    const isAnon = commentAnonMap[postId] ?? true;
    const updated = await addWildComment(postId, myNickname, text, isAnon);
    setPosts(updated.filter((p) => !p.isBlocked));

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCompareRequest = async (post: WildPost) => {
    triggerMediumHaptic();
    await incrementComparisonRequest(post.id);
    const target = post.isAnonymous ? 'Anónimo' : post.authorNickname;
    setTargetComparisonUser(target);
  };

  const handleReport = async (postId: string) => {
    triggerLightHaptic();
    const reported = await reportWildPost(postId, myNickname);
    if (reported) {
      Alert.alert('Reporte enviado', 'Gracias por mantener la comunidad segura. La publicación ha sido revisada.');
      const list = await loadAllWildPosts();
      setPosts(list);
    } else {
      Alert.alert('Aviso', 'Ya habías reportado esta publicación.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          brand
          title="Galería Salvaje & Comentarios (Sin Censura)"
          subtitle="Comparte tus imágenes fetiche en un entorno 100% seguro entre adultos (18+)."
        />

        {/* Security Warning Banner */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ SEGURIDAD REFORZADA & REGLAS LEGALES ⚠️</Text>
          <Text style={styles.warningSub}>
            Strictly Prohibited: Contenido ilegal, menores de edad (hasta 18 años), zoofilia o no consensuado. Cero tolerancia.
          </Text>
          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
            <Text style={styles.termsLink}>Ver Términos de Servicio Legales Completos 📜</Text>
          </TouchableOpacity>
        </View>

        {/* Create Post Button */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {
            if (!hasTerms) {
              setShowTermsModal(true);
            } else {
              setShowCreateModal(true);
            }
          }}
        >
          <Text style={styles.createBtnBadge}>🔥 PÚBLICO O ANÓNIMO</Text>
          <Text style={styles.createBtnTitle}>+ Publicar Imagen en la Galería Salvaje</Text>
          <Text style={styles.createBtnSub}>Sube tu foto y recibe solicitudes de "Comparemos Nuestros Test"</Text>
        </TouchableOpacity>

        {/* Feed Posts */}
        {posts.map((post) => {
          const isAnonComment = commentAnonMap[post.id] ?? true;
          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorBadge}>
                  <Text style={styles.authorBadgeText}>
                    {post.isAnonymous ? '🕶️ Publicación Anónima' : `👤 ${post.authorNickname}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleReport(post.id)}>
                  <Text style={styles.reportBtnText}>🚩 Reportar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              {post.caption ? <Text style={styles.postCaption}>{post.caption}</Text> : null}

              <Image source={{ uri: post.mediaUri }} style={styles.postMedia} resizeMode="cover" />

              {/* Interaction Buttons */}
              <View style={styles.interactionRow}>
                <TouchableOpacity
                  style={styles.compareBtn}
                  onPress={() => handleCompareRequest(post)}
                >
                  <Text style={styles.compareBtnText}>
                    ⚡ Comparemos nuestros Test ({post.comparisonRequestsCount || 0})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>💬 Comentarios ({post.comments.length})</Text>
                {post.comments.map((c) => (
                  <View key={c.id} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>
                      {c.isAnonymous ? '🕶️ Anónimo' : `👤 ${c.authorNickname}`}
                    </Text>
                    <Text style={styles.commentContent}>{c.content}</Text>
                  </View>
                ))}

                {/* Comment Input */}
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentTextInput}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor={colors.textMuted}
                    value={commentInputs[post.id] || ''}
                    onChangeText={(val) => setCommentInputs((prev) => ({ ...prev, [post.id]: val }))}
                  />
                  <View style={styles.anonToggleRow}>
                    <Text style={styles.anonToggleLabel}>
                      {isAnonComment ? '🕶️ Anónimo' : '👤 Público'}
                    </Text>
                    <Switch
                      value={isAnonComment}
                      onValueChange={(val) =>
                        setCommentAnonMap((prev) => ({ ...prev, [post.id]: val }))
                      }
                      trackColor={{ false: '#334155', true: colors.neonPurple }}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.sendCommentBtn}
                    onPress={() => handleSendComment(post.id)}
                  >
                    <Text style={styles.sendCommentText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal Terms of Service Legal */}
      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.termsModalCard}>
            <Text style={styles.termsModalTitle}>📜 Términos de Servicio & Protocolo Legal 18+</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              <Text style={styles.termsModalBody}>{ILLEGAL_CONTENT_WARNING_TEXT}</Text>
              <Text style={[styles.termsModalBody, { marginTop: 12 }]}>
                Al hacer clic en "Acepto Cumplir los Términos Legales", declaras expresamente que eres mayor de 18 años, que aceptas la política de cero tolerancia a contenido ilegal y que todas tus publicaciones cuentan con el consentimiento previo de todos los participantes.
              </Text>
            </ScrollView>
            <Button title="Acepto Cumplir los Términos Legales ✅" onPress={handleAcceptTerms} />
          </View>
        </View>
      </Modal>

      {/* Create Wild Post Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.createModalCard}>
            <Text style={styles.createModalTitle}>🔥 Nueva Publicación Salvaje</Text>
            <ScrollView contentContainerStyle={{ gap: 10 }}>
              <Text style={styles.inputLabel}>Título de la escena / foto *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Shibari de torso & látex"
                placeholderTextColor={colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>URL de la Imagen (HTTPS) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://ejemplo.com/mi-foto.jpg"
                placeholderTextColor={colors.textMuted}
                value={newMediaUri}
                onChangeText={setNewMediaUri}
              />

              <Text style={styles.inputLabel}>Leyenda / Descripción opcional</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                multiline
                placeholder="Describe tu escena o lo que buscas explorar..."
                placeholderTextColor={colors.textMuted}
                value={newCaption}
                onChangeText={setNewCaption}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {isAnonPost ? '🕶️ Publicar de forma ANÓNIMA' : `👤 Publicar como ${myNickname}`}
                </Text>
                <Switch
                  value={isAnonPost}
                  onValueChange={setIsAnonPost}
                  trackColor={{ false: '#334155', true: colors.neonPurple }}
                />
              </View>

              <Text style={styles.warningNote}>
                ⚠️ Al publicar declaras que la imagen cumple estrictamente con los Términos Legales de la Plataforma (18+, Consensuado).
              </Text>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <Button title="Cancelar" variant="ghost" onPress={() => setShowCreateModal(false)} style={{ flex: 1 }} />
              <Button title="Publicar Ahora 🔥" onPress={handlePublish} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Direct Comparison Modal */}
      {targetComparisonUser ? (
        <DirectComparisonModal
          visible={Boolean(targetComparisonUser)}
          targetProfile={{ nickname: targetComparisonUser || 'Anónimo', allowPublicComparison: true }}
          currentProfile={{ nickname: myNickname, allowPublicComparison: true }}
          onClose={() => setTargetComparisonUser(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  warningCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: 6,
  },
  warningTitle: { color: '#ef4444', fontFamily: fonts.bodyBold, fontSize: fontSize.xs, letterSpacing: 0.5 },
  warningSub: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  termsLink: { color: '#38bdf8', fontFamily: fonts.bodySemi, fontSize: fontSize.xs, textDecorationLine: 'underline', marginTop: 4 },
  createBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  createBtnBadge: { color: colors.neonPurple, fontSize: 10, fontFamily: fonts.bodyBold, letterSpacing: 1 },
  createBtnTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.sm, fontWeight: '800' },
  createBtnSub: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, textAlign: 'center' },
  postCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorBadge: { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3 },
  authorBadgeText: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.bodySemi },
  reportBtnText: { color: '#ef4444', fontSize: 11, fontFamily: fonts.body },
  postTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md, fontWeight: '800', marginTop: 4 },
  postCaption: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  postMedia: { width: '100%', height: 260, borderRadius: radii.lg, marginVertical: spacing.xs, backgroundColor: '#0f172a' },
  interactionRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.xs },
  compareBtn: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: radii.lg,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  compareBtnText: { color: '#38bdf8', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  commentsSection: { backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: radii.lg, padding: spacing.sm, gap: 6, marginTop: 4 },
  commentsTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  commentItem: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: radii.sm, padding: 6 },
  commentAuthor: { color: colors.primary, fontSize: 10, fontFamily: fonts.bodyBold },
  commentContent: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.body, marginTop: 2 },
  commentInputRow: { gap: 6, marginTop: 6 },
  commentTextInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  anonToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  anonToggleLabel: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.bodySemi },
  sendCommentBtn: { backgroundColor: colors.primary, borderRadius: radii.md, paddingVertical: 6, alignItems: 'center' },
  sendCommentText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  termsModalCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, width: '100%', maxWidth: 480, borderWidth: 1.5, borderColor: '#ef4444', gap: spacing.md },
  termsModalTitle: { color: '#ef4444', fontFamily: fonts.displaySemi, fontSize: fontSize.md, textAlign: 'center' },
  termsModalBody: { color: colors.text, fontFamily: fonts.body, fontSize: fontSize.xs, lineHeight: 18 },
  createModalCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, width: '100%', maxWidth: 480, borderWidth: 1, borderColor: colors.borderSubtle, gap: spacing.md, maxHeight: '85%' },
  createModalTitle: { color: colors.text, fontFamily: fonts.displaySemi, fontSize: fontSize.md, textAlign: 'center' },
  inputLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: fonts.bodyBold },
  textInput: { backgroundColor: colors.surfaceLight, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  switchLabel: { color: colors.text, fontSize: fontSize.xs, fontFamily: fonts.bodySemi },
  warningNote: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.body, fontStyle: 'italic' },
  modalActionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
});
