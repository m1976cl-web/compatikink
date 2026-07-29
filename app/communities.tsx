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

interface CommunityGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  memberCount: number;
  topics: { id: string; title: string; author: string; replies: number }[];
}

const COMMUNITIES_DATA: CommunityGroup[] = [
  {
    id: 'comm-shibari',
    name: 'Shibari & Rope Arts Madrid / Latam',
    emoji: '🪢',
    description: 'Comunidad dedicada a la técnica, seguridad anatómica, cuerdas naturales y estética del bondage japonés.',
    memberCount: 1420,
    topics: [
      { id: 't1', title: '¿Cuerda de Yute o Cáñamo para principiantes?', author: 'RopeLover', replies: 28 },
      { id: 't2', title: 'Revisión de nervios en suspensión suave de brazos', author: 'AnatomíaKink', replies: 14 },
    ],
  },
  {
    id: 'comm-aftercare',
    name: 'Aftercare & Cuidado Emocional',
    emoji: '🪷',
    description: 'Espacio seguro para compartir estrategias contra el Afterdrop/Topdrop, contención y reconexión afectiva.',
    memberCount: 980,
    topics: [
      { id: 't3', title: 'Mi experiencia con el Topdrop tras escenas largas', author: 'Domina_V', replies: 19 },
      { id: 't4', title: 'Kits de Aftercare recomendados (mantas, infusiones)', author: 'SoftCare', replies: 32 },
    ],
  },
  {
    id: 'comm-power',
    name: 'Power Exchange & Dinámicas D/s 24/7',
    emoji: '🗝️',
    description: 'Discusión sobre contratos consensuados, protocolos de dominación/sumisión e intercambio de poder responsable.',
    memberCount: 1150,
    topics: [
      { id: 't5', title: 'Cómo negociar un protocolo de comunicación diario', author: 'KeyMaster', replies: 45 },
    ],
  },
];

export default function CommunitiesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [joinedIds, setJoinedIds] = useState<string[]>(['comm-shibari']);
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  const toggleJoinGroup = (id: string) => {
    if (joinedIds.includes(id)) {
      setJoinedIds(joinedIds.filter((g) => g !== id));
      Alert.alert('Saliste del grupo', 'Has dejado de seguir esta comunidad.');
    } else {
      setJoinedIds([...joinedIds, id]);
      Alert.alert('¡Bienvenido/a! 🎉', 'Te has unido a la comunidad exitosamente.');
    }
  };

  const handleCreateTopic = (group: CommunityGroup) => {
    if (!newTopicTitle.trim()) return;
    const newTopic = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      author: 'Tú (Anónimo)',
      replies: 0,
    };
    group.topics.unshift(newTopic);
    setNewTopicTitle('');
    Alert.alert('Tema Creado 💬', 'Tu tema ha sido publicado en el foro de la comunidad.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏘️ Comunidades & Grupos Privados</Text>
          <Text style={styles.subtitle}>
            Espacios temáticos para compartir recursos, debates de seguridad y experiencias de nicho
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!selectedGroup ? (
            /* Groups List */
            <View style={{ gap: spacing.md }}>
              {COMMUNITIES_DATA.map((group) => {
                const isJoined = joinedIds.includes(group.id);
                return (
                  <View key={group.id} style={styles.groupCard}>
                    <View style={styles.groupHeader}>
                      <Text style={{ fontSize: 36 }}>{group.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupMembers}>👥 {group.memberCount} Miembros</Text>
                        <Text style={styles.groupName}>{group.name}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                        onPress={() => toggleJoinGroup(group.id)}
                      >
                        <Text style={[styles.joinBtnText, isJoined && { color: colors.textMuted }]}>
                          {isJoined ? 'Siguiendo ✓' : 'Unirme +'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.groupDesc}>{group.description}</Text>

                    <TouchableOpacity style={styles.enterBtn} onPress={() => setSelectedGroup(group)}>
                      <Text style={styles.enterBtnText}>Entrar a Debates ({group.topics.length} Temas) 💬</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            /* Selected Group Topics */
            <View style={styles.groupCard}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedGroup(null)}>
                <Text style={styles.backBtnText}>← Volver a Comunidades</Text>
              </TouchableOpacity>

              <Text style={styles.groupName}>{selectedGroup.emoji} {selectedGroup.name}</Text>

              {/* Create Topic Box */}
              <View style={styles.createBox}>
                <Text style={styles.createTitle}>✍️ Iniciar un Nuevo Tema de Debate:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu pregunta o tema de discusión..."
                  placeholderTextColor={colors.textMuted}
                  value={newTopicTitle}
                  onChangeText={setNewTopicTitle}
                />
                <TouchableOpacity style={styles.enterBtn} onPress={() => handleCreateTopic(selectedGroup)}>
                  <Text style={styles.enterBtnText}>Publicar Tema 🚀</Text>
                </TouchableOpacity>
              </View>

              {/* Topics List */}
              <View style={{ gap: spacing.xs }}>
                {selectedGroup.topics.map((t) => (
                  <View key={t.id} style={styles.topicRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.topicTitle}>{t.title}</Text>
                      <Text style={styles.topicAuthor}>Por {t.author}</Text>
                    </View>
                    <Text style={styles.repliesCount}>💬 {t.replies}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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

  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  groupMembers: { color: colors.neonPurple, fontSize: 10, fontWeight: '800' },
  groupName: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  groupDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  joinBtn: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  joinBtnActive: { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  joinBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  enterBtn: { backgroundColor: colors.surfaceLight, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  enterBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  createBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, gap: spacing.xs },
  createTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  input: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 8, color: colors.text, fontSize: fontSize.xs, borderWidth: 1, borderColor: colors.border },

  topicRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  topicTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  topicAuthor: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  repliesCount: { color: colors.neonPurple, fontSize: fontSize.xs, fontWeight: '800' },
});
