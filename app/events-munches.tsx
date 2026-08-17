/**
 * Directorio de Eventos, Munches & Talleres Fetichistas — Feature 4
 * Pantalla interactiva con confirmaciones RSVP confidenciales cifradas en la Bóveda (AES-GCM),
 * filtros por tipo de evento (Munch, Workshop, PlayParty) y reglas de protocolo.
 */

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
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/themeContext';
import { FETISH_EVENTS, FetishEvent, EventType } from '@/data/eventsData';
import { readStorageValue, writeStorageValue } from '@/lib/cryptoVault';
import { triggerHaptic } from '@/lib/haptics';

import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

const RSVP_STORAGE_KEY = 'fetish_events_rsvp_sealed_v1';

function EventsMunchesScreenContent() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { palette } = useTheme();

  const [selectedType, setSelectedType] = useState<EventType | 'Todos'>('Todos');
  const [rsvpMap, setRsvpMap] = useState<Record<string, 'going' | 'interested' | 'none'>>({});
  const [activeTab, setActiveTab] = useState<'directory' | 'my_rsvps'>('directory');

  useEffect(() => {
    loadRSVPs();
  }, []);

  const loadRSVPs = async () => {
    try {
      const raw = await readStorageValue(RSVP_STORAGE_KEY);
      if (raw) {
        setRsvpMap(JSON.parse(raw));
      }
    } catch {
      setRsvpMap({});
    }
  };

  const handleToggleRSVP = async (eventId: string, status: 'going' | 'interested') => {
    const current = rsvpMap[eventId];
    const newStatus = current === status ? 'none' : status;
    setRsvpMap((prev) => ({ ...prev, [eventId]: newStatus }));
    const updated: Record<string, 'none' | 'going' | 'interested'> = { ...rsvpMap, [eventId]: newStatus };
    await writeStorageValue(RSVP_STORAGE_KEY, JSON.stringify(updated));

    if (newStatus !== 'none') {
      triggerHaptic.success();
      Alert.alert(
        'RSVP Guardado Cifrado 🔐',
        `Tu asistencia (${newStatus === 'going' ? 'Asistiré' : 'Me Interesa'}) ha sido cifrada localmente en tu bóveda. Nadie más puede ver tus eventos.`
      );
    } else {
      triggerHaptic.light();
    }
  };

  const filteredEvents = FETISH_EVENTS.filter((evt) => {
    if (activeTab === 'my_rsvps') {
      return rsvpMap[evt.id] && rsvpMap[evt.id] !== 'none';
    }
    if (selectedType === 'Todos') return true;
    return evt.type === selectedType;
  });

  return (
    <ScreenContainer title="Eventos & Munches" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: palette.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text }]}>Munches & Eventos Fetichistas 🍸🪢</Text>
          <Text style={styles.subtitle}>
            Directorio confidencial de encuentros sociales, talleres de Shibari y fiestas de escena con RSVP cifrado en tu Bóveda.
          </Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'directory' && { backgroundColor: palette.primary }]}
            onPress={() => setActiveTab('directory')}
          >
            <Text style={[styles.mainTabText, activeTab === 'directory' && { color: '#07050a', fontWeight: '800' }]}>
              🌐 Directorio de Eventos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'my_rsvps' && { backgroundColor: palette.primary }]}
            onPress={() => setActiveTab('my_rsvps')}
          >
            <Text style={[styles.mainTabText, activeTab === 'my_rsvps' && { color: '#07050a', fontWeight: '800' }]}>
              🔐 Mis RSVPs Cifrados ({Object.values(rsvpMap).filter((v) => v !== 'none').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {activeTab === 'directory' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['Todos', 'Munch', 'Workshop', 'PlayParty', 'VirtualMunch'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.filterChip,
                  selectedType === t && { backgroundColor: palette.primary, borderColor: palette.primary },
                ]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[styles.filterChipText, selectedType === t && { color: '#07050a', fontWeight: '800' }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Events List */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🕯️</Text>
              <Text style={styles.emptyTitle}>No hay eventos en esta sección</Text>
              <Text style={styles.emptySub}>
                {activeTab === 'my_rsvps'
                  ? 'Aún no has guardado ninguna asistencia confidencial.'
                  : 'Prueba cambiando el filtro de búsqueda.'}
              </Text>
            </View>
          ) : (
            filteredEvents.map((evt) => {
              const rsvpStatus = rsvpMap[evt.id] || 'none';
              return (
                <View key={evt.id} style={[styles.eventCard, { borderColor: palette.borderSubtle }]}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.eventEmoji}>{evt.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.eventTypeTag, { color: palette.primary }]}>{evt.type.toUpperCase()}</Text>
                      <Text style={[styles.eventTitle, { color: palette.text }]}>{evt.title}</Text>
                      <Text style={styles.organizerText}>Organizado por {evt.organizer}</Text>
                    </View>
                  </View>

                  {/* Date & Location */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaBadge}>📅 {evt.date} • {evt.time}</Text>
                    <Text style={styles.metaBadge}>📍 {evt.location}</Text>
                  </View>

                  {/* Dress Code */}
                  <View style={styles.dressCodeBox}>
                    <Text style={styles.dressCodeLabel}>👔 Código de Vestimenta:</Text>
                    <Text style={styles.dressCodeText}>{evt.dressCode}</Text>
                  </View>

                  <Text style={styles.eventDesc}>{evt.description}</Text>

                  {/* Safety Rules */}
                  <View style={styles.safetyBox}>
                    <Text style={styles.safetyTitle}>🛡️ Protocolo de Seguridad & Etiqueta:</Text>
                    {evt.safetyRules.map((rule, idx) => (
                      <Text key={idx} style={styles.safetyRuleText}>• {rule}</Text>
                    ))}
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    {evt.vibeTags.map((tag, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* RSVP Buttons */}
                  <View style={styles.rsvpRow}>
                    <TouchableOpacity
                      style={[
                        styles.rsvpBtn,
                        rsvpStatus === 'going' && { backgroundColor: palette.primary, borderColor: palette.primary },
                      ]}
                      onPress={() => handleToggleRSVP(evt.id, 'going')}
                    >
                      <Text style={[styles.rsvpBtnText, rsvpStatus === 'going' && { color: '#07050a', fontWeight: '800' }]}>
                        {rsvpStatus === 'going' ? '✓ Asistiré (Cifrado)' : 'Confirmar Asistencia'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.rsvpBtnSecondary,
                        rsvpStatus === 'interested' && { borderColor: palette.primary, backgroundColor: 'rgba(192, 132, 252, 0.15)' },
                      ]}
                      onPress={() => handleToggleRSVP(evt.id, 'interested')}
                    >
                      <Text style={[styles.rsvpBtnSecondaryText, rsvpStatus === 'interested' && { color: palette.primary }]}>
                        {rsvpStatus === 'interested' ? '★ Me Interesa' : 'Interesado'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  tabRow: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  mainTab: { flex: 1, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.borderSubtle },
  mainTabText: { color: colors.textMuted, fontSize: fontSize.xs },

  filterRow: { flexDirection: 'row', gap: 6, marginVertical: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
  filterChipText: { color: colors.textMuted, fontSize: 10 },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  eventCard: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  eventEmoji: { fontSize: 34 },
  eventTypeTag: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  eventTitle: { fontSize: fontSize.md, fontWeight: '800' },
  organizerText: { color: colors.textDim, fontSize: 10 },

  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: 2 },
  metaBadge: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, color: colors.text, fontSize: 10 },

  dressCodeBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle },
  dressCodeLabel: { color: colors.warning, fontSize: 10, fontWeight: '800' },
  dressCodeText: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },

  eventDesc: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  safetyBox: { backgroundColor: 'rgba(192, 132, 252, 0.08)', borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, gap: 2 },
  safetyTitle: { color: colors.text, fontSize: 10, fontWeight: '800' },
  safetyRuleText: { color: colors.textMuted, fontSize: 10 },

  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginVertical: 2 },
  tagChip: { backgroundColor: colors.background, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagChipText: { color: colors.textDim, fontSize: 9 },

  rsvpRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  rsvpBtn: { flex: 2, paddingVertical: 10, borderRadius: radii.lg, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  rsvpBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '600' },
  rsvpBtnSecondary: { flex: 1, paddingVertical: 10, borderRadius: radii.lg, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  rsvpBtnSecondaryText: { color: colors.textMuted, fontSize: fontSize.xs },

  emptyBox: { alignItems: 'center', padding: spacing.xl, gap: spacing.xs },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  emptySub: { color: colors.textDim, fontSize: fontSize.xs, textAlign: 'center' },
});

export default function EventsMunchesScreen() {
  return (
    <RouteFeatureGuard route="/events-munches" title="Munches & Eventos">
      <EventsMunchesScreenContent />
    </RouteFeatureGuard>
  );
}
