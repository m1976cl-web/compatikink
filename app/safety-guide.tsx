import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface SafetyTopic {
  id: string;
  emoji: string;
  title: string;
  category: 'ethics' | 'bondage' | 'impact' | 'sensation' | 'aftercare' | 'emergency';
  summary: string;
  details: string[];
  warningTip?: string;
}

const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: 'rack_ssc',
    emoji: '🛡️',
    title: 'Marcos Éticos: SSC vs RACK',
    category: 'ethics',
    summary: 'Los dos grandes marcos de trabajo para la exploración segura y consensuada.',
    details: [
      'SSC (Safe, Sane, Consensual): Todo juego debe ser Seguro (minimizar riesgos), Sensato (juicio claro sin sustancias) y Consensuado por ambas partes.',
      'RACK (Risk-Aware Consensual Kink): Reconoce que algunas prácticas tienen riesgos inherentes (ej. quemaduras, marcas) y enfatiza la educación activa, la toma de riesgos informados y la gestión responsable.',
      'Ambos requieren comunicación continua y la posibilidad real de revocar el consentimiento en cualquier momento sin represalias.',
    ],
  },
  {
    id: 'bondage_nerve',
    emoji: '🪢',
    title: 'Seguridad en Cuerdas y Circulación Novedosa',
    category: 'bondage',
    summary: 'Prevención de lesiones nerviosas, hormigueo y cortes de circulación.',
    details: [
      'Regla de los 2 dedos: Toda atadura alrededor de extremidades o cuello debe permitir deslizar al menos dos dedos cómodamente.',
      'Monitoreo constante de temperatura y pulso: Si los dedos de manos o pies se sienten fríos, adormecidos o cambian a color púrpura/blanco, DESATAR INMEDIATAMENTE.',
      'Zonas de riesgo nervioso: Evitar presión directa sobre el nervio radial (muñeca) y el nervio peroneo (debajo de la rodilla).',
      'Tijeras de rescate: Tener SIEMPRE a la mano tijeras de punta roma (tijeras de traumatología o rescate de $5 usd) antes de colocar la primera cuerda.',
    ],
    warningTip: 'NUNCA dejar a una persona atada sola en la habitación, ni siquiera por 1 minuto.',
  },
  {
    id: 'impact_zones',
    emoji: '🖐️',
    title: 'Zonas Seguras de Impacto y Técnica',
    category: 'impact',
    summary: 'Dónde golpear de forma segura y qué zonas evitar a toda costa.',
    details: [
      'Zonas Seguras (Verde): Glúteos (zonas carnosas), muslos superiores traseros.',
      'Zonas de Cuidado (Amarillo): Espalda alta (evitando la columna y omóplatos), carnosidades de los brazos.',
      'Zonas PROHIBIDAS (Rojo absoluto): Riñones (zona lumbar baja), columna vertebral, cabeza/cara, cuello, articulaciones, genitales o vientre.',
      'Calentamiento previo: Empezar siempre con impacto suave o manual para aumentar la irrigación sanguínea antes de usar paletas, floggers o varas.',
    ],
    warningTip: 'Un golpe mal colocado en los riñones puede causar sangrado interno y daño renal grave.',
  },
  {
    id: 'wax_thermal',
    emoji: '🕯️',
    title: 'Cera Caliente y Juegos Térmicos',
    category: 'sensation',
    summary: 'Control de temperatura y prevención de quemaduras de segundo grado.',
    details: [
      'Tipo de cera: Usar exclusivamente velas de parafina de baja temperatura (45°C - 52°C) o cera de soja especial para masajes/kink.',
      'NUNCA usar velas aromáticas normales ni de cera de abejas: Su punto de fusión supera los 65°C-70°C y causarán quemaduras graves con ampollas.',
      'Prueba en el antebrazo: Dejar caer 2 gotas en tu propio antebrazo antes de aplicarla sobre la pareja.',
      'Distancia de goteo: Sostener la vela a 40-60 cm de altura para permitir que la gota se enfríe ligeramente durante la caída.',
    ],
  },
  {
    id: 'afterdrop_care',
    emoji: '🫂',
    title: 'Manejo de Afterdrop y Bajones Emocionales',
    category: 'aftercare',
    summary: 'Qué hacer cuando caen las endorfinas después de una escena intensa.',
    details: [
      '¿Qué es el Afterdrop?: Bajón de ánimo, llanto, temblores o ansiedad horas o días después de una escena muy intensa.',
      'Hidratación y glucosa: Ofrecer agua con electrólitos, té tibio con miel o chocolates para recuperar los niveles de azúcar.',
      'Contacto y abrigo: Envolver en mantas cálidas (la temperatura corporal suele bajar tras la adrenalina) y dar abrazos contenedor (cuddling).',
      'Check-in a las 24 horas: Mandar un mensaje cariñoso al día siguiente para verificar la estabilidad emocional de ambos.',
    ],
  },
  {
    id: 'emergency_protocol',
    emoji: '🚨',
    title: 'Protocolo de Emergencia y Primeros Auxilios',
    category: 'emergency',
    summary: 'Pasos inmediatos si ocurre un accidente durante una escena.',
    details: [
      '1. Detener la escena y usar Safeword Rojo de inmediato.',
      '2. Liberar todas las ataduras o restricciones físicas usando tijeras de rescate.',
      '3. Si hay sangrado: Aplicar presión directa con gasa limpia o paño seco.',
      '4. Si hay quemadura: Lavar con abundante agua fresca (nunca fría ni hielo) durante 15 minutos. No aplicar pasta de dientes ni crema.',
      '5. Llamar a servicios de emergencia si hay pérdida de conciencia, dificultad respiratoria o sospecha de fractura.',
    ],
    warningTip: 'Los profesionales médicos están obligados a atenderte sin juzgar. Prioriza la salud por sobre la vergüenza.',
  },
];

export default function SafetyGuideScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTopics = selectedCategory === 'all'
    ? SAFETY_TOPICS
    : SAFETY_TOPICS.filter((t) => t.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📚 Guía de Seguridad & Salud Kink</Text>
          <Text style={styles.subtitle}>
            Protocolos de mitigación de riesgos, prevención de lesiones y primeros auxilios
          </Text>
        </View>

        {/* Categories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ethics', label: '🛡️ Ética' },
            { id: 'bondage', label: '🪢 Cuerdas' },
            { id: 'impact', label: '🖐️ Impacto' },
            { id: 'sensation', label: '🕯️ Cera/Frío' },
            { id: 'aftercare', label: '🫂 Aftercare' },
            { id: 'emergency', label: '🚨 Emergencia' },
          ].map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Topics List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredTopics.map((topic) => (
            <View key={topic.id} style={styles.topicCard}>
              <View style={styles.topicHeader}>
                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicSummary}>{topic.summary}</Text>
                </View>
              </View>

              <View style={styles.detailsList}>
                {topic.details.map((detail, idx) => (
                  <View key={idx} style={styles.detailRow}>
                    <Text style={styles.detailBullet}>•</Text>
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>

              {topic.warningTip ? (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ Alerta Importante</Text>
                  <Text style={styles.warningText}>{topic.warningTip}</Text>
                </View>
              ) : null}
            </View>
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  containerDesktop: {
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  filterBar: {
    maxHeight: 40,
    marginVertical: spacing.sm,
    flexGrow: 0,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  catChipTextActive: {
    color: '#fff',
  },

  list: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  topicCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    gap: spacing.md,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topicEmoji: {
    fontSize: 40,
  },
  topicTitle: {
    color: colors.neonPurple,
    fontSize: fontSize.lg,
    fontWeight: '900',
  },
  topicSummary: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  detailsList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  detailBullet: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  detailText: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 20,
    flex: 1,
  },
  warningBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: spacing.md,
    gap: 4,
  },
  warningTitle: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
  warningText: {
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});
