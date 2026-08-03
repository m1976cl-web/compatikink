import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { EventItem, EventType } from '@/types';
import { encryptEventVenueKey, decryptEventVenueKey } from '@/lib/vault';

const INITIAL_EVENTS_DATA: EventItem[] = [
  {
    id: 'ev-1',
    title: 'Munch Social Mensual — Providencia / Madrid',
    type: 'Munch Social',
    eventType: 'munch',
    date: 'Viernes 15 de Agosto',
    time: '19:30 hrs',
    location: 'Providencia, Santiago (Bar / Café Privado)',
    confidentialLocation: true,
    venueAddressEncrypted: 'ck1:address-providencia-secret-room-12',
    description: 'Encuentro social informal en ropa de calle (vanilla). Ideal para principiantes que buscan conocer la comunidad, conversar y resolver dudas sin presión de juego.',
    attendeesCount: 34,
    isRSVP: false,
    isDiscreetRSVP: true,
    etiquetteAgreed: false,
    hostNickname: 'Valeria_Shibari',
  },
  {
    id: 'ev-2',
    title: 'Taller Práctico: Ataduras de Suspensión Corporal & Seguridad',
    type: 'Taller Shibari',
    eventType: 'workshop',
    date: 'Sábado 23 de Agosto',
    time: '16:00 hrs',
    location: 'Dungeon Studio Cifrado',
    confidentialLocation: true,
    venueAddressEncrypted: 'ck1:dungeon-studio-key-9981',
    description: 'Taller intensivo de 3 horas sobre tensión de cuerdas, anatomía de extremidades, nervio radial y rescate de emergencia con tijeras de corte.',
    attendeesCount: 16,
    isRSVP: false,
    isDiscreetRSVP: false,
    etiquetteAgreed: false,
    hostNickname: 'Mateo_Dom',
  },
  {
    id: 'ev-3',
    title: 'Play Party Cifrada: Noche de Dinámicas & Consentimiento',
    type: 'Play Party',
    eventType: 'play_party',
    date: 'Viernes 29 de Agosto',
    time: '21:00 hrs',
    location: 'Club Privado Kink (Dirección bajo aprobación del Host)',
    confidentialLocation: true,
    venueAddressEncrypted: 'ck1:private-dungeon-access-code-44',
    description: 'Reunión privada de juego consensuado. Requiere entrevista previa con el Host, vestimenta fetish/obscura y estricta etiqueta SSC.',
    attendeesCount: 22,
    isRSVP: false,
    isDiscreetRSVP: true,
    etiquetteAgreed: false,
    hostNickname: 'Mateo_Dom',
  },
  {
    id: 'ev-4',
    title: 'Webinar Online: Protocolos D/s & Negociación Consensuada',
    type: 'Encuentro Online',
    eventType: 'online',
    date: 'Miércoles 27 de Agosto',
    time: '20:00 hrs (Zoom E2EE Cifrado)',
    location: 'Sala Virtual Cifrada',
    confidentialLocation: false,
    description: 'Charla educativa virtual sobre redacción de acuerdos consensuados, establecimiento de límites duros y aftercare.',
    attendeesCount: 88,
    isRSVP: true,
    isDiscreetRSVP: true,
    etiquetteAgreed: true,
    hostNickname: 'Sensual_Mind',
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS_DATA);
  const [filterType, setFilterType] = useState<string>('all');

  // Modal for Munch Etiquette Agreement
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<EventItem | null>(null);
  const [isDiscreetOption, setIsDiscreetOption] = useState(true);
  const [agreedVanillaDress, setAgreedVanillaDress] = useState(false);
  const [agreedNoTouch, setAgreedNoTouch] = useState(false);
  const [agreedNoPhotos, setAgreedNoPhotos] = useState(false);

  // Unlocked venue address map
  const [unlockedAddresses, setUnlockedAddresses] = useState<Record<string, string>>({});

  const handleOpenRSVPModal = (ev: EventItem) => {
    if (ev.isRSVP) {
      // Cancel RSVP directly
      setEvents((prev) =>
        prev.map((e) => (e.id === ev.id ? { ...e, isRSVP: false, attendeesCount: e.attendeesCount - 1 } : e))
      );
      Alert.alert('RSVP Cancelado', 'Has cancelado tu confirmación de asistencia.');
      return;
    }

    setSelectedEventForRSVP(ev);
    setAgreedVanillaDress(false);
    setAgreedNoTouch(false);
    setAgreedNoPhotos(false);
    setIsDiscreetOption(true);
  };

  const handleConfirmRSVP = async () => {
    if (!selectedEventForRSVP) return;

    if (selectedEventForRSVP.eventType === 'munch' && (!agreedVanillaDress || !agreedNoTouch || !agreedNoPhotos)) {
      Alert.alert('Etiqueta Requerida', 'Debes aceptar las 3 reglas de etiqueta del Munch para continuar.');
      return;
    }

    // Release venue address using client-side decryption
    let decryptedVenue = selectedEventForRSVP.location;
    if (selectedEventForRSVP.confidentialLocation) {
      decryptedVenue = await decryptEventVenueKey(
        selectedEventForRSVP.venueAddressEncrypted || '',
        'default-host-munch-key'
      );
      if (decryptedVenue.startsWith('Ubicación confidencial')) {
        decryptedVenue = 'Av. Andrés Bello 2425, Providencia (Código de acceso a la sala enviada por el Host)';
      }
    }

    setUnlockedAddresses((prev) => ({ ...prev, [selectedEventForRSVP.id]: decryptedVenue }));

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === selectedEventForRSVP.id) {
          return {
            ...e,
            isRSVP: true,
            isDiscreetRSVP: isDiscreetOption,
            etiquetteAgreed: true,
            attendeesCount: e.attendeesCount + 1,
          };
        }
        return e;
      })
    );

    const evTitle = selectedEventForRSVP.title;
    setSelectedEventForRSVP(null);

    Alert.alert(
      '🎟️ ¡Asistencia Confirmada (Double-Blind Release)!',
      `Tu RSVP ${isDiscreetOption ? 'discreto (solo visible para el host)' : 'público'} ha sido guardado.\n\n📍 Ubicación Desbloqueada:\n${decryptedVenue}`
    );
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.eventType === filterType || ev.type === filterType;
  });

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
            Directorio de reuniones sociales, talleres presenciales de Shibari y libere de ubicación double-blind
          </Text>
        </View>

        {/* Filter Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'all', label: '🌐 Todos' },
            { id: 'munch', label: '☕ Munches' },
            { id: 'workshop', label: '🪢 Talleres' },
            { id: 'play_party', label: '🏰 Play Parties' },
            { id: 'online', label: '💻 Online' },
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
            {filteredEvents.map((ev) => {
              const isUnlocked = unlockedAddresses[ev.id];
              return (
                <View key={ev.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.typeBadge}>{(ev.type || ev.eventType).toUpperCase()}</Text>
                        {ev.confidentialLocation && (
                          <View style={styles.confidentialPill}>
                            <Text style={styles.confidentialPillText}>🔒 Ubicación Cifrada</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.eventTitle}>{ev.title}</Text>
                      <Text style={styles.hostNameText}>Organizado por: {ev.hostNickname || 'Comunidad'}</Text>
                    </View>
                    <Text style={styles.attendeesText}>🎟️ {ev.attendeesCount} Asistentes</Text>
                  </View>

                  <View style={styles.metaBox}>
                    <Text style={styles.metaItem}>📅 Fecha: <Text style={{ color: colors.text }}>{ev.date} · {ev.time}</Text></Text>
                    <Text style={styles.metaItem}>
                      📍 Lugar:{' '}
                      <Text style={{ color: isUnlocked ? colors.neonEmerald : colors.text }}>
                        {isUnlocked ? `🔓 ${isUnlocked}` : ev.location}
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.eventDesc}>{ev.description}</Text>

                  <TouchableOpacity
                    style={[styles.rsvpBtn, ev.isRSVP && styles.rsvpBtnActive]}
                    onPress={() => handleOpenRSVPModal(ev)}
                  >
                    <Text style={[styles.rsvpBtnText, ev.isRSVP && { color: colors.neonEmerald }]}>
                      {ev.isRSVP
                        ? `✓ Asistencia Confirmada (${ev.isDiscreetRSVP ? 'Discreta' : 'Pública'})`
                        : 'Confirmar Asistencia Discreta (Double-Blind) 🎟️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Munch Etiquette & RSVP Modal */}
        {selectedEventForRSVP && (
          <Modal
            visible={!!selectedEventForRSVP}
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedEventForRSVP(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirmación de Asistencia & Etiqueta</Text>
                  <TouchableOpacity onPress={() => setSelectedEventForRSVP(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSub}>
                  Evento: <Text style={{ color: colors.neonPurple, fontWeight: '800' }}>{selectedEventForRSVP.title}</Text>
                </Text>

                {/* Munch Etiquette Rules Checkboxes */}
                <View style={styles.etiquetteSection}>
                  <Text style={styles.etiquetteSectionTitle}>📋 Acuerdo de Etiqueta del Munch (Obligatorio):</Text>

                  <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => setAgreedVanillaDress(!agreedVanillaDress)}
                  >
                    <Text style={styles.checkboxEmoji}>{agreedVanillaDress ? '☑️' : '⬜'}</Text>
                    <Text style={styles.checkText}>
                      1. Vestimenta de calle (Vanilla): Sin atuendos de látex visible ni arneses expuestos.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => setAgreedNoTouch(!agreedNoTouch)}
                  >
                    <Text style={styles.checkboxEmoji}>{agreedNoTouch ? '☑️' : '⬜'}</Text>
                    <Text style={styles.checkText}>
                      2. Cero contacto físico sin consentimiento verbal previo expreso.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => setAgreedNoPhotos(!agreedNoPhotos)}
                  >
                    <Text style={styles.checkboxEmoji}>{agreedNoPhotos ? '☑️' : '⬜'}</Text>
                    <Text style={styles.checkText}>
                      3. Prohibición estricta de fotos o videos para proteger la privacidad de los asistentes.
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* RSVP Privacy Option Selector */}
                <View style={styles.privacyOptionSection}>
                  <Text style={styles.etiquetteSectionTitle}>🔒 Opción de Privacidad de RSVP:</Text>
                  <View style={styles.privacyOptionRow}>
                    <TouchableOpacity
                      style={[styles.privacyChip, isDiscreetOption && styles.privacyChipActive]}
                      onPress={() => setIsDiscreetOption(true)}
                    >
                      <Text style={[styles.privacyChipText, isDiscreetOption && styles.privacyChipTextActive]}>
                        🕵️ RSVP Discreto (Solo Host)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.privacyChip, !isDiscreetOption && styles.privacyChipActive]}
                      onPress={() => setIsDiscreetOption(false)}
                    >
                      <Text style={[styles.privacyChipText, !isDiscreetOption && styles.privacyChipTextActive]}>
                        🌐 Badge Público de Asistente
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmRSVPBtn} onPress={handleConfirmRSVP}>
                  <Text style={styles.confirmRSVPBtnText}>Aceptar Etiqueta & Revelar Ubicación 🗝️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, backgroundColor: '#0a0612' },
  containerDesktop: { maxWidth: 780, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.neonPurple, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  filterScroll: { gap: 6, marginVertical: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.lg, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
  filterChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  filterChipTextActive: { color: '#000' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  eventCard: {
    backgroundColor: '#120b22',
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeBadge: { color: colors.neonPurple, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  confidentialPill: { backgroundColor: 'rgba(244, 63, 94, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  confidentialPillText: { color: colors.neonRose, fontSize: 9, fontWeight: '800' },
  eventTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  hostNameText: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  attendeesText: { color: colors.neonRose, fontSize: fontSize.xs, fontWeight: '800' },

  metaBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: radii.md, gap: 4 },
  metaItem: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },

  eventDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  rsvpBtn: { backgroundColor: colors.neonPurple, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  rsvpBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: colors.neonEmerald },
  rsvpBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: '#120b22',
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 520,
    borderWidth: 1.5,
    borderColor: colors.neonPurple,
    gap: spacing.md,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '900' },
  modalSub: { color: colors.textMuted, fontSize: fontSize.xs },
  closeBtn: { padding: 4 },
  closeBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },

  etiquetteSection: { backgroundColor: 'rgba(192, 132, 252, 0.06)', borderRadius: radii.md, padding: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: colors.border },
  etiquetteSectionTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginVertical: 2 },
  checkboxEmoji: { fontSize: 16 },
  checkText: { flex: 1, color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  privacyOptionSection: { gap: spacing.xs },
  privacyOptionRow: { flexDirection: 'row', gap: spacing.xs },
  privacyChip: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRadius: radii.md, backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  privacyChipActive: { backgroundColor: colors.neonRose, borderColor: colors.neonRose },
  privacyChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  privacyChipTextActive: { color: '#fff', fontWeight: '900' },

  confirmRSVPBtn: { backgroundColor: colors.neonEmerald, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  confirmRSVPBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },
});
