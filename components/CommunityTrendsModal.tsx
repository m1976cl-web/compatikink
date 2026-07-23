import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TREND_STATS = [
  { rank: '1', title: 'Cuerdas (Shibari)', pct: '88%', category: 'Bondage', tag: '🔥 Top Match' },
  { rank: '2', title: 'Venda en Ojos & Privación Sensorial', pct: '82%', category: 'Sensaciones', tag: '✨ Favorito' },
  { rank: '3', title: 'Control de Orgasmo & Edging', pct: '76%', category: 'Intercambio Poder', tag: '🤔 Curiosidad #1' },
  { rank: '4', title: 'Cera Caliente Corporal', pct: '71%', category: 'Sensaciones', tag: '🔥 Pop-Up' },
  { rank: '5', title: 'Juegos de Roles & Fantasías Tabú', pct: '68%', category: 'Psicológico', tag: '🎭 Tendencia' },
  { rank: '6', title: 'Ritual de Aftercare & Té Caliente', pct: '94%', category: 'Aftercare', tag: '💚 Esencial' },
];

export function CommunityTrendsModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.headerEmoji}>📊</Text>
          <Text style={styles.title}>Radar de Tendencias de la Comunidad</Text>
          <Text style={styles.subtitle}>
            Estadísticas anónimas consolidadas sobre las prácticas con más interés mutuo.
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {TREND_STATS.map((item) => (
              <View key={item.rank} style={styles.itemCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>#{item.rank}</Text>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemCategory}>{item.category} · {item.tag}</Text>
                </View>

                <View style={styles.pctBadge}>
                  <Text style={styles.pctText}>{item.pct}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  headerEmoji: { fontSize: 44, marginBottom: spacing.xs },
  title: {
    color: colors.neonPurple,
    fontSize: fontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  scroll: { width: '100%' },
  scrollContent: { gap: spacing.sm },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rankBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankBadgeText: {
    color: colors.neonPurple,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  itemCategory: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  pctBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pctText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  closeBtn: { marginTop: spacing.md },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
