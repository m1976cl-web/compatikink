import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { getCurrentProfile, listMyLocalSessions, getWishlist, toggleWishlist, WishlistItem } from '@/lib/storage';
import { calculateCompassPoint, determineArchetype } from '@/lib/compatibility';
import { UserProfile, Session, CATEGORY_LABELS, CATEGORY_EMOJIS, ActivityCategory } from '@/types';
import { getAllActivities } from '@/data/activities';

export default function CompassScreen() {
  const router = useRouter();
  const { isDesktop, width } = useResponsive();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedPartnerIndex, setSelectedPartnerIndex] = useState<number>(0);

  // Calculate Category Affinity Breakdown for profile baseResponses
  const categoryBreakdown = useMemo(() => {
    if (!profile?.baseResponses || profile.baseResponses.length === 0) return [];
    const activities = getAllActivities();
    const map: Record<string, { totalScore: number; count: number }> = {};

    for (const resp of profile.baseResponses) {
      const act = activities.find((a) => a.id === resp.activityId);
      if (!act) continue;
      const cat = act.category;
      if (!map[cat]) map[cat] = { totalScore: 0, count: 0 };
      
      let val = 0;
      if (resp.rating === 'love') val = 100;
      else if (resp.rating === 'like') val = 75;
      else if (resp.rating === 'curious') val = 50;
      else if (resp.rating === 'not_interested') val = 10;
      else if (resp.rating === 'hard_limit') val = 0;

      map[cat].totalScore += val;
      map[cat].count += 1;
    }

    return Object.entries(map)
      .map(([category, { totalScore, count }]) => ({
        category: category as ActivityCategory,
        avgPct: Math.round(totalScore / Math.max(1, count)),
      }))
      .sort((a, b) => b.avgPct - a.avgPct);
  }, [profile]);

  const dynamicPlotSize = Math.min(400, Math.max(280, leftColWidth));

  const myPoint = profile && profile.baseResponses && profile.baseResponses.length > 0
    ? calculateCompassPoint(profile.baseResponses)
    : { x: 50, y: 50 };
  const myArchetype = profile && profile.baseResponses && profile.baseResponses.length > 0
    ? determineArchetype(profile.baseResponses, myPoint.y)
    : 'Explorador Versátil';

  const selectedSession = sessions[selectedPartnerIndex];
  const partnerPoint = selectedSession && selectedSession.guestResponses
    ? calculateCompassPoint(selectedSession.guestResponses)
    : null;
  const partnerName = selectedSession
    ? (selectedSession.guestNickname || selectedSession.guestProfile?.nickname || 'Pareja')
    : null;
  const partnerArchetype = selectedSession && selectedSession.guestResponses && partnerPoint
    ? determineArchetype(selectedSession.guestResponses, partnerPoint.y)
    : null;

  const renderPlot = (size = 280) => (
    <View style={[styles.compassPlot, { width: size, height: size }]}>
      {/* Quadrants */}
      <View style={[styles.quadrant, styles.qTR]} />
      <View style={[styles.quadrant, styles.qBL]} />

      {/* Grid lines */}
      <View style={styles.gridLineX} />
      <View style={styles.gridLineY} />

      {/* Axis Labels */}
      <Text style={[styles.axisLabel, styles.axisTop]}>⬆ Dominante</Text>
      <Text style={[styles.axisLabel, styles.axisBottom]}>⬇ Sumiso / Pasivo</Text>
      <Text style={[styles.axisLabel, styles.axisLeft]}>Vanilla</Text>
      <Text style={[styles.axisLabel, styles.axisRight]}>Exploratorio</Text>

      {/* My position */}
      <View
        style={[
          styles.dot,
          styles.myDot,
          { left: `${myPoint.x}%`, bottom: `${myPoint.y}%` },
        ]}
      >
        <View style={styles.myGlow} />
        <Text style={[styles.dotLabel, styles.myLabel]}>
          {profile?.nickname || 'Tú'}
        </Text>
      </View>

      {/* Partner position */}
      {partnerPoint && partnerName ? (
        <View
          style={[
            styles.dot,
            styles.partnerDot,
            { left: `${partnerPoint.x}%`, bottom: `${partnerPoint.y}%` },
          ]}
        >
          <View style={styles.partnerGlow} />
          <Text style={[styles.dotLabel, styles.partnerLabel]}>
            {partnerName}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderWishlistCard = () => (
    <View style={styles.explainerCard}>
      <Text style={styles.cardHeader}>💌 Mi Lista de Deseos ("Quiero Probar") ({wishlist.length})</Text>
      {wishlist.length === 0 ? (
        <Text style={styles.explainerText}>
          Aún no has guardado ítems. Presiona el botón "🤍 Deseo" en cualquier tarjeta del reporte para agregarlos aquí.
        </Text>
      ) : (
        <View style={styles.wishlistGrid}>
          {wishlist.map((item) => (
            <View key={item.activityId} style={styles.wishlistItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wishlistItemName}>{item.activityName}</Text>
                <Text style={styles.wishlistItemCat}>
                  {CATEGORY_EMOJIS[item.category as ActivityCategory] ?? '✨'} {CATEGORY_LABELS[item.category as ActivityCategory] ?? item.category}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeWishlistBtn}
                onPress={async () => {
                  await toggleWishlist({ activityId: item.activityId, activityName: item.activityName, category: item.category });
                  loadData();
                }}
              >
                <Text style={styles.removeWishlistText}>✕ Quitar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCategoryBreakdownCard = () => (
    <View style={styles.explainerCard}>
      <Text style={styles.cardHeader}>📊 Tu Mapa de Afinidad por Categoría</Text>
      {categoryBreakdown.length === 0 ? (
        <Text style={styles.explainerText}>
          Responde tu cuestionario base para calcular el desglose de afinidad por categorías.
        </Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {categoryBreakdown.map(({ category, avgPct }) => (
            <View key={category} style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontSize: fontSize.xs, fontWeight: '700' }}>
                  {CATEGORY_EMOJIS[category]} {CATEGORY_LABELS[category]}
                </Text>
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' }}>{avgPct}%</Text>
              </View>
              <View style={{ height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${avgPct}%`,
                    backgroundColor: avgPct > 70 ? colors.primary : avgPct > 40 ? colors.accent : colors.info,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderQuadrantExplainer = () => (
    <View style={styles.explainerCard}>
      <Text style={styles.cardHeader}>🧭 Ejes y Cuadrantes del Compás</Text>
      <View style={styles.explainerGrid}>
        <View style={styles.explainerItem}>
          <Text style={styles.explainerTitle}>⬆ Eje Vertical (Y): Rol</Text>
          <Text style={styles.explainerText}>
            Arriba (&gt;50%): Preferencia hacia roles Dominantes, Top o Activos.{'\n'}
            Abajo (&lt;50%): Preferencia hacia roles Sumisos, Bottom o Pasivos.
          </Text>
        </View>
        <View style={styles.explainerItem}>
          <Text style={styles.explainerTitle}>➡ Eje Horizontal (X): Exploración</Text>
          <Text style={styles.explainerText}>
            Derecha (&gt;50%): Alta curiosidad e intensidad en prácticas Kink/BDSM.{'\n'}
            Izquierda (&lt;50%): Preferencia por dinámicas más tradicionales o sensaciones suaves.
          </Text>
        </View>
      </View>

      <View style={styles.archetypeBreakdown}>
        <Text style={styles.cardHeader}>✨ Tu Arquetipo: <Text style={{ color: colors.neonPurple }}>{myArchetype}</Text></Text>
        {partnerArchetype ? (
          <Text style={[styles.cardHeader, { marginTop: 6 }]}>
            ✨ Arquetipo de {partnerName}: <Text style={{ color: colors.neonPink }}>{partnerArchetype}</Text>
          </Text>
        ) : null}
      </View>
    </View>
  );

  const renderPartnerSelector = () => (
    sessions.length > 0 ? (
      <View style={styles.partnerCard}>
        <Text style={styles.cardHeader}>👥 Comparar con Pareja Guardada</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerList}>
          {sessions.map((s, idx) => {
            const name = s.guestNickname || s.guestProfile?.nickname || `Pareja ${idx + 1}`;
            const isSel = selectedPartnerIndex === idx;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.partnerChip, isSel && styles.partnerChipActive]}
                onPress={() => setSelectedPartnerIndex(idx)}
              >
                <Text style={[styles.partnerChipText, isSel && styles.partnerChipTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ) : null
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>🧭 Compás Kink Interactivo</Text>
          <Text style={styles.subtitle}>
            Mapa 2D interactivo de tu perfil erótico y comparación con tus vínculos.
          </Text>
        </View>

        {isDesktop ? (
          <View style={styles.desktopLayout}>
            {/* Left Column: Dynamic Compass Plot */}
            <View style={styles.desktopLeftCol}>
              <View style={styles.plotCardDesktop}>
                {renderPlot(dynamicPlotSize)}
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={styles.legendDotPurple} />
                    <Text style={styles.legendText}>{profile?.nickname || 'Tú'}</Text>
                  </View>
                  {partnerName ? (
                    <View style={styles.legendItem}>
                      <View style={styles.legendDotPink} />
                      <Text style={styles.legendText}>{partnerName}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {renderPartnerSelector()}
            {renderQuadrantExplainer()}
            {renderWishlistCard()}
            {renderCategoryBreakdownCard()}
          </View>
        ) : (
          /* Mobile Single Column */
          <View style={styles.mobileLayout}>
            <View style={styles.plotCardMobile}>
              {renderPlot(280)}
            </View>
            {renderPartnerSelector()}
            {renderQuadrantExplainer()}
            {renderWishlistCard()}
            {renderCategoryBreakdownCard()}
          </View>
        )}

        <Button title="Volver al inicio" onPress={() => router.replace('/')} variant="secondary" style={styles.backBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  desktopLeftCol: {
    flex: 48,
    alignItems: 'center',
  },
  desktopRightCol: {
    flex: 52,
    gap: spacing.lg,
  },
  mobileLayout: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  plotCardDesktop: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
    width: '100%',
  },
  plotCardMobile: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
  },
  compassPlot: {
    backgroundColor: 'rgba(13, 8, 25, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  quadrant: {
    position: 'absolute',
    width: '50%',
    height: '50%',
  },
  qTR: {
    top: 0, right: 0,
    backgroundColor: 'rgba(192, 132, 252, 0.05)',
  },
  qBL: {
    bottom: 0, left: 0,
    backgroundColor: 'rgba(244, 114, 182, 0.05)',
  },
  gridLineX: {
    position: 'absolute',
    left: 0, right: 0, top: '50%',
    height: 1,
    backgroundColor: 'rgba(192, 132, 252, 0.25)',
  },
  gridLineY: {
    position: 'absolute',
    top: 0, bottom: 0, left: '50%',
    width: 1,
    backgroundColor: 'rgba(192, 132, 252, 0.25)',
  },
  axisLabel: {
    position: 'absolute',
    color: colors.neonPurple,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  axisTop: { top: 8, alignSelf: 'center' },
  axisBottom: { bottom: 8, alignSelf: 'center' },
  axisLeft: { left: 8, top: '48%' },
  axisRight: { right: 8, top: '48%' },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -8 }, { translateY: 8 }],
  },
  myDot: {
    backgroundColor: colors.neonPurple,
  },
  partnerDot: {
    backgroundColor: colors.neonPink,
  },
  myGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(192, 132, 252, 0.35)',
  },
  partnerGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 114, 182, 0.35)',
  },
  dotLabel: {
    fontSize: 11,
    fontWeight: '700',
    position: 'absolute',
    top: 18,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 44,
  },
  myLabel: {
    color: colors.neonPurple,
    backgroundColor: 'rgba(10, 6, 18, 0.9)',
  },
  partnerLabel: {
    color: colors.neonPink,
    backgroundColor: 'rgba(10, 6, 18, 0.9)',
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDotPurple: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neonPurple,
  },
  legendDotPink: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neonPink,
  },
  legendText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  explainerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    width: '100%',
  },
  cardHeader: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  explainerGrid: {
    gap: spacing.md,
  },
  explainerItem: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explainerTitle: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  explainerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  archetypeBreakdown: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partnerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    width: '100%',
  },
  partnerList: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  partnerChip: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(244, 114, 182, 0.15)',
  },
  partnerChipText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  partnerChipTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: spacing.md,
  },
  wishlistGrid: {
    gap: spacing.xs,
  },
  wishlistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wishlistItemName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  wishlistItemCat: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  removeWishlistBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  removeWishlistText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
