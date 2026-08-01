import React, { useState } from 'react';
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
import { useResponsive } from '@/hooks/useResponsive';

interface KinkEvent {
  id: string;
  title: string;
  type: 'Munch Social' | 'Taller Shibari' | 'Charla Consentimiento' | 'Encuentro Online';
  date: string;
  time: string;
  location: string;
  description: string;
  attendeesCount: number;
  isRSVP: boolean;
}

const EVENTS_DATA: KinkEvent[] = [
  {
    id: 'ev-1',
    title: 'Munch Social Mensual Santiago / Madrid',
    type: 'Munch Social',
    date: 'Viernes 15 de Agosto',
    time: '19:30 hrs',
    location: 'Café Privado (Ubicación revelada post-RSVP)',
    description: 'Encuentro social informal en ropa de calle (vanilla). Ideal para principiantes que buscan conocer la comunidad, conversar y resolver dudas sin presión.',
    attendeesCount: 34,
    isRSVP: false,
  },
  {
    id: 'ev-2',
    title: 'Taller Práctico: Ataduras de Suspensión Corporal & Seguridad',
    type: 'Taller Shibari',
    date: 'Sábado 23 de Agosto',
    time: '16:00 hrs',
    location: 'Dungeon Studio Providencia',
    description: 'Taller intensivo de 3 horas sobre tensión de cuerdas, anatomía de extremidades y rescate de emergencia.',
    attendeesCount: 16,
    isRSVP: false,
  },
  {
    id: 'ev-3',
    title: 'Webinar Online: Protocolos D/s & Negociación Consensuada',
    type: 'Encuentro Online',
    date: 'Miércoles 27 de Agosto',
    time: '20:00 hrs (Zoom Cifrado)',
    description: 'Charla educativa virtual sobre redacción de acuerdos consensuados y establecimiento de límites duros.',
    attendeesCount: 88,
    isRSVP: true,
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [events, setEvents] = useState<KinkEvent[]>(EVENTS_DATA);
  const [filterType, setFilterType] = useState<string>('all');

  const toggleRSVP = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const nextRSVP = !ev.isRSVP;
          const nextCount = nextRSVP ? ev.attendeesCount + 1 : ev.attendeesCount - 1;
          Alert.alert(
            nextRSVP ? 'Asistencia Confirmada (RSVP) 🎟️' : 'Reserva Cancelada',
            nextRSVP
              ? `Has reservado tu lugar discreto para ${ev.title}. Te hemos enviado los detalles de acceso.`
              : `Has cancelado tu confirmación de asistencia.`
          );
          return { ...ev, isRSVP: nextRSVP, attendeesCount: nextCount };
        }
        return ev;
      })
    );
  };

  const filteredEvents = events.filter(
    (ev) => filterType === 'all' || ev.type === filterType
  );

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Directorio de Eventos & Munches</Text>
          <Text style={styles.subtitle}>
            Calendario de reuniones sociales, talleres presenciales de Shibari y webinars de consentimiento
          </Text>
        </View>

        {/* Filter Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all', label: '🌐 Todos' },
            { id: 'Munch Social', label: '☕ Munches' },
            { id: 'Taller Shibari', label: '🪢 Talleres' },
            { id: 'Encuentro Online', label: '💻 Online' },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filterType === f.id && styles.filterChipActive]}
              onPress={() => setFilterType(f.id)}
            >
              <Text style={[styles.filterChipText, filterType === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md }}>
            {filteredEvents.map((ev) => (
              <View key={ev.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeBadge}>{ev.type.toUpperCase()}</Text>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                  </View>
                  <Text style={styles.attendeesText}>🎟️ {ev.attendeesCount} Asistentes</Text>
                </View>

                <View style={styles.metaBox}>
                  <Text style={styles.metaItem}>📅 Fecha: <Text style={{ color: colors.text }}>{ev.date} · {ev.time}</Text></Text>
                  <Text style={styles.metaItem}>📍 Lugar: <Text style={{ color: colors.text }}>{ev.location}</Text></Text>
                </View>

                <Text style={styles.eventDesc}>{ev.description}</Text>

                <TouchableOpacity
                  style={[styles.rsvpBtn, ev.isRSVP && styles.rsvpBtnActive]}
                  onPress={() => toggleRSVP(ev.id)}
                >
                  <Text style={[styles.rsvpBtnText, ev.isRSVP && { color: colors.success }]}>
                    {ev.isRSVP ? '✓ Asistencia Confirmada (RSVP)' : 'Confirmar Asistencia Discreta 🎟️'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  filterScroll: { gap: 6, marginVertical: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeBadge: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  eventTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  attendeesText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },

  metaBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.md, gap: 4 },
  metaItem: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  eventDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  rsvpBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  rsvpBtnActive: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success },
  rsvpBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },
});
