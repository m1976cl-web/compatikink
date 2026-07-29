import { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface GlossaryTerm {
  term: string;
  definition: string;
}

const GLOSSARY: GlossaryTerm[] = [
  { term: 'Aftercare', definition: 'Cuidado posterior a una escena para reconectar emocionalmente. Incluye contacto físico, charla, bebidas calientes y validación emocional.' },
  { term: 'AfterDrop', definition: 'Bajón emocional o físico que puede ocurrir horas o días después de una escena intensa. Se debe a la caída de endorfinas y adrenalina.' },
  { term: 'Bondage', definition: 'Práctica de restricción física consensuada usando cuerdas, esposas u otros elementos. Puede ser decorativo o restrictivo.' },
  { term: 'Bratting', definition: 'Comportamiento provocador del sumiso para obtener una reacción del dominante. Común en dinámicas Brat/Brat Tamer.' },
  { term: 'CNC', definition: 'Consensual Non-Consent. Fantasía de no-consentimiento completamente consensuada y negociada previamente con límites claros y safewords.' },
  { term: 'Collar', definition: 'Elemento simbólico (collar, pulsera, anillo) que representa el vínculo en una dinámica D/s. Puede tener diferentes niveles de compromiso.' },
  { term: 'Consent (Consentimiento)', definition: 'Acuerdo libre, informado, entusiasta y revocable en cualquier momento para participar en una actividad.' },
  { term: 'D/s (Dominación/sumisión)', definition: 'Dinámica de poder donde una persona asume el rol dominante y otra el sumiso, siempre dentro de un marco consensuado.' },
  { term: 'Dominante (Dom/Domme)', definition: 'Persona que asume el control en una dinámica de poder consensuada. Responsable del bienestar de la persona sumisa.' },
  { term: 'Dungeon', definition: 'Espacio privado equipado para prácticas BDSM. Puede incluir cruz de San Andrés, bancos, poleas y otros equipos.' },
  { term: 'Edging', definition: 'Técnica de llevar al borde del orgasmo repetidamente sin permitir el clímax. Intensifica el placer final.' },
  { term: 'E-stim', definition: 'Electro-estimulación. Uso de dispositivos eléctricos de baja intensidad diseñados para estimulación sensorial segura.' },
  { term: 'Fetiche', definition: 'Atracción intensa hacia un objeto, material (cuero, látex) o parte del cuerpo específica que genera excitación.' },
  { term: 'Flogger', definition: 'Instrumento de impacto con múltiples tiras de cuero o gamuza. Produce sensaciones que van desde suaves hasta intensas.' },
  { term: 'Hard Limit (Límite duro)', definition: 'Límite absoluto que no debe cruzarse bajo ninguna circunstancia. No es negociable y debe ser respetado sin cuestionar.' },
  { term: 'Impacto', definition: 'Prácticas que involucran golpes consensuados con mano, paleta, flogger, fusta u otros implementos en zonas seguras del cuerpo.' },
  { term: 'Kink', definition: 'Término general para prácticas sexuales no convencionales consensuadas. Abarca un amplio espectro de actividades.' },
  { term: 'Límite blando (Soft Limit)', definition: 'Actividad que genera incomodidad pero podría explorarse gradualmente con confianza, comunicación y a un ritmo cómodo.' },
  { term: 'Masoquismo', definition: 'Placer derivado de recibir sensaciones intensas o dolor controlado dentro de un marco seguro y consensuado.' },
  { term: 'Munch', definition: 'Encuentro social informal de la comunidad kink en un espacio público (café, restaurante). No hay actividad sexual.' },
  { term: 'Negociación', definition: 'Conversación previa a una escena para establecer límites, deseos, safewords y expectativas. Es un paso obligatorio.' },
  { term: 'Orgasm Control', definition: 'Control del orgasmo de la pareja mediante permiso o denegación. Incluye edging, orgasmos forzados y castidad.' },
  { term: 'Pet Play', definition: 'Juego de rol donde una persona adopta el comportamiento de una mascota (puppy, kitten, pony) con accesorios opcionales.' },
  { term: 'Protocolo', definition: 'Conjunto de reglas acordadas dentro de una dinámica D/s. Puede incluir posiciones, formas de hablar y comportamiento.' },
  { term: 'RACK', definition: 'Risk-Aware Consensual Kink. Marco ético que reconoce riesgos inherentes y enfatiza consentimiento informado y mitigación.' },
  { term: 'Sadomasoquismo', definition: 'Combinación de sadismo (placer al dar sensaciones) y masoquismo (placer al recibirlas) en prácticas consensuadas.' },
  { term: 'Safeword (Palabra de seguridad)', definition: 'Palabra acordada para detener inmediatamente una escena. Sistema de semáforo: Verde (continúa), Amarillo (baja intensidad), Rojo (para).' },
  { term: 'Sadismo', definition: 'Placer derivado de administrar sensaciones intensas consensuadas a otra persona que disfruta recibiéndolas.' },
  { term: 'Scene (Escena)', definition: 'Encuentro o sesión de juego BDSM con inicio y fin definidos. Incluye negociación previa y aftercare posterior.' },
  { term: 'Shibari', definition: 'Arte japonés de ataduras decorativas con cuerda. Combina estética, restricción y conexión íntima entre rigger y modelo.' },
  { term: 'SSC', definition: 'Safe, Sane, Consensual. Marco ético fundamental del BDSM: Seguro (minimizar riesgos), Sensato (juicio claro) y Consensuado.' },
  { term: 'Subspace', definition: 'Estado alterado de conciencia (euforia, trance) que puede experimentar la persona sumisa durante una escena intensa por liberación de endorfinas.' },
  { term: 'Sumiso/a (Sub)', definition: 'Persona que cede el control en una dinámica de poder consensuada. Confía en el dominante para guiar la experiencia.' },
  { term: 'Switch', definition: 'Persona que disfruta tanto del rol dominante como del sumiso, alternando según la escena, pareja o momento.' },
  { term: 'Tease & Denial', definition: 'Estimulación provocativa combinada con la denegación del clímax. Intensifica la tensión y el deseo progresivamente.' },
  { term: 'Topdrop', definition: 'Bajón emocional del dominante después de una escena intensa. Similar al afterdrop pero del lado de quien dirige.' },
  { term: 'Topspace', definition: 'Estado de flujo o euforia que experimenta el dominante durante una escena. Concentración intensa en el bienestar del sumiso.' },
  { term: 'Vanilla', definition: 'Prácticas sexuales convencionales, sin elementos kink o BDSM. No tiene connotación negativa, es simplemente diferente.' },
  { term: 'Voyeurismo', definition: 'Placer de observar a otros en actos íntimos con su consentimiento. En contexto kink, siempre es consensuado.' },
];

export default function GlossaryScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const alphabet = useMemo(() => {
    const letters = new Set(GLOSSARY.map((t) => t.term[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  const filtered = useMemo(() => {
    let results = GLOSSARY;
    if (selectedLetter) {
      results = results.filter((t) => t.term[0].toUpperCase() === selectedLetter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return results;
  }, [search, selectedLetter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📚 Glosario Kink</Text>
          <Text style={styles.subtitle}>
            {GLOSSARY.length} términos · Educación y consentimiento
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar término..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setSelectedLetter(null);
            }}
          />
        </View>

        {/* Alphabet bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alphabetBar}>
          <TouchableOpacity
            style={[styles.letterChip, !selectedLetter && styles.letterChipActive]}
            onPress={() => setSelectedLetter(null)}
          >
            <Text style={[styles.letterText, !selectedLetter && styles.letterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {alphabet.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={[styles.letterChip, selectedLetter === letter && styles.letterChipActive]}
              onPress={() => {
                setSelectedLetter(selectedLetter === letter ? null : letter);
                setSearch('');
              }}
            >
              <Text style={[styles.letterText, selectedLetter === letter && styles.letterTextActive]}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <Text style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'término' : 'términos'}
        </Text>

        {/* Terms list */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => (
            <View key={item.term} style={styles.termCard}>
              <Text style={styles.termName}>{item.term}</Text>
              <Text style={styles.termDef}>{item.definition}</Text>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤔</Text>
              <Text style={styles.emptyText}>No se encontraron términos</Text>
            </View>
          )}
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
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSize.md,
  },
  alphabetBar: {
    marginTop: spacing.sm,
    maxHeight: 40,
    flexGrow: 0,
  },
  letterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  letterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  letterTextActive: {
    color: '#fff',
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  termName: {
    color: colors.neonPurple,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  termDef: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
