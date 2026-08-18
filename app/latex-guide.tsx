import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from '@/lib/i18n';
import { LatexMeasurementForm } from '@/components/latex/LatexMeasurementForm';

export default function LatexGuideScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'wash' | 'shine' | 'dangers' | 'repair' | 'storage' | 'measures'>('wash');

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🖤 Guía de Cuidado & Reparación de Látex</Text>
          <Text style={styles.subtitle}>
            Manual maestro de mantenimiento, lavado, pulido al espejo y reparación de rasgaduras para prendas y equipo de látex.
          </Text>
        </View>

        {/* Navigation Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {[
            { id: 'wash', label: '🧼 Lavado', emoji: '🧼' },
            { id: 'shine', label: '✨ Brillo & Talco', emoji: '✨' },
            { id: 'dangers', label: '🚫 Enemigos', emoji: '🚫' },
            { id: 'repair', label: '🩹 Reparación', emoji: '🩹' },
            { id: 'storage', label: '📦 Almacén', emoji: '📦' },
            { id: 'measures', label: t('latex.measure.tab'), emoji: '📏' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabChipText, activeTab === tab.id && styles.tabChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Section */}
        <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'wash' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🧼 Lavado & Desinfección Correcta</Text>
              <Text style={styles.sectionDesc}>
                El látex acumula sudor, aceites corporales y polvo. Lavarlo adecuadamente tras cada uso previene el deterioro prematuro de la goma.
              </Text>

              <View style={styles.stepBox}>
                <Text style={styles.stepNum}>Paso 1: Preparar la tina</Text>
                <Text style={styles.stepBody}>Llena un recipiente limpio con agua tibia (máximo 30°C). Añade unas gotas de detergente neutro de platos o limpiador especializado para látex.</Text>
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepNum}>Paso 2: Lavado suave</Text>
                <Text style={styles.stepBody}>Sumerge la prenda y frota delicadamente con las yemas de los dedos. No uses esponjas abrasivas ni cepillos.</Text>
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepNum}>Paso 3: Enjuague profundo</Text>
                <Text style={styles.stepBody}>Enjuaga 2 o 3 veces con agua limpia hasta eliminar por completo los residuos de jabón.</Text>
              </View>

              <View style={styles.stepBox}>
                <Text style={styles.stepNum}>Paso 4: Secado sin calor</Text>
                <Text style={styles.stepBody}>Escurre suavemente con una toalla sin retorcer. Cuelga en una percha plástica a la sombra en un lugar ventilado. Jamás uses secador de pelo o sol directo.</Text>
              </View>
            </View>
          )}

          {activeTab === 'shine' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>✨ Brillo Espejo & Acondicionamiento</Text>
              <Text style={styles.sectionDesc}>
                El látex natural recién lavado luce opaco o pálido. Para lograr el acabado ultra brillante Glossy Black, sigue estos consejos.
              </Text>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>✨ Aceite de Silicona (Shiner)</Text>
                <Text style={styles.tipBody}>
                  Usa únicamente lubricantes o abrillantadores a base de silicona médica de alta viscosidad (ej. Begloss, Vividdress, Vivishine). Aplica unas gotas y esparce con una bayeta de microfibra suave.
                </Text>
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>🧊 Talco sin Aceites (Almacenamiento)</Text>
                <Text style={styles.tipBody}>
                  Si vas a guardar la prenda durante semanas, espolvorea talco puro cosmético o almidón de maíz por dentro y por fuera. Esto evita que los lados se adhieran entre sí.
                </Text>
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>💡 Tip de Colocación (Dressing Aid)</Text>
                <Text style={styles.tipBody}>
                  Para vestir monos o catsuits ajustados, usa spray lubricante de silicona o talco por todo el cuerpo para que la prenda se deslice sin tirones ni uñas.
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'dangers' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🚫 Enemigos Mortales del Látex</Text>
              <Text style={styles.sectionDesc}>
                Sustancias y elementos que destruyen irreversiblemente la estructura molecular del látex en cuestión de minutos.
              </Text>

              <View style={styles.dangerItem}>
                <Text style={styles.dangerHeader}>🧴 Aceites Minerales & Vaselina</Text>
                <Text style={styles.dangerText}>Los lubricantes de petróleo, aceites de masaje y cremas corporales ablandan la goma haciéndola pegajosa y desintegrándola. Usa solo silicona o agua.</Text>
              </View>

              <View style={styles.dangerItem}>
                <Text style={styles.dangerHeader}>🪙 Metales de Cobre & Latón</Text>
                <Text style={styles.dangerText}>El contacto con monedas, perchas metálicas o cierres de latón causa "manchas de cobre" que oxidan el látex dejándolo marrón o amarillo de forma permanente.</Text>
              </View>

              <View style={styles.dangerItem}>
                <Text style={styles.dangerHeader}>☀️ Luz Solar & Rayos UV</Text>
                <Text style={styles.dangerText}>La luz UV rompe las cadenas del caucho natural. Almacena siempre tus prendas en bolsas oscuras lejos de la ventana.</Text>
              </View>

              <View style={styles.dangerItem}>
                <Text style={styles.dangerHeader}>💅 Uñas Largas & Joyas Afiladas</Text>
                <Text style={styles.dangerText}>Son la causa #1 de rasgaduras al vestir la prenda. Retira anillos y usa las yemas de los dedos, no las uñas.</Text>
              </View>
            </View>
          )}

          {activeTab === 'repair' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🩹 Manual Paso a Paso para Reparar Rasgaduras</Text>
              <Text style={styles.sectionDesc}>
                No tires una prenda rota. El látex se puede reparar en casa con parches y solventes especiales logrando un acabado tan resistente como el original.
              </Text>

              <View style={styles.repairStep}>
                <Text style={styles.repairStepTitle}>1. Limpieza de Superficie con Solvente</Text>
                <Text style={styles.repairStepBody}>Limpia la zona alrededor de la rotura por la parte posterior con alcohol isopropílico o solvente de tiza de látex para quitar siliconas o talco.</Text>
              </View>

              <View style={styles.repairStep}>
                <Text style={styles.repairStepTitle}>2. Corte del Parche de Látex</Text>
                <Text style={styles.repairStepBody}>Corta un trozo de látex del mismo grosor (ej. 0.4 mm) redondeando absolutamente las esquinas (los cantos cuadrados tienden a desengancharse).</Text>
              </View>

              <View style={styles.repairStep}>
                <Text style={styles.repairStepTitle}>3. Aplicación de Pegamento de Caucho</Text>
                <Text style={styles.repairStepBody}>Aplica una capa ultra fina de pegamento especial para látex (Rubber Cement) tanto en el parche como en la zona rota. Deja secar 3 minutos hasta que esté morderte (pegajoso al tacto sin mojar).</Text>
              </View>

              <View style={styles.repairStep}>
                <Text style={styles.repairStepTitle}>4. Prensado Firme</Text>
                <Text style={styles.repairStepBody}>Junta los bordes de la rotura, coloca el parche encima y presiona firmemente con un rodillo de goma o un objeto pesado sobre una superficie plana durante 2 minutos.</Text>
              </View>

              <View style={styles.repairStep}>
                <Text style={styles.repairStepTitle}>5. Curado de 24 Horas</Text>
                <Text style={styles.repairStepBody}>Deja vulcanizar la unión durante 24 horas antes de ponerte la prenda o someterla a tensión.</Text>
              </View>
            </View>
          )}

          {activeTab === 'measures' && (
            <View style={styles.sectionCard}>
              <LatexMeasurementForm />
            </View>
          )}

          {activeTab === 'storage' && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📦 Almacenamiento Seguro a Largo Plazo</Text>
              <Text style={styles.sectionDesc}>
                Garantiza que tus prendas y juguetes de látex duren años como el primer día.
              </Text>

              <View style={styles.storageBox}>
                <Text style={styles.storageTitle}>📁 Bolsas de Polietileno Oscuras</Text>
                <Text style={styles.storageText}>Guarda cada prenda en una bolsa individual sellada para evitar la oxidación atmosférica y la transferencia de tintes.</Text>
              </View>

              <View style={styles.storageBox}>
                <Text style={styles.storageTitle}>🌡️ Temperatura & Humedad Controladas</Text>
                <Text style={styles.storageText}>Mantén tu colección en un ambiente fresco (15°C a 20°C) y seco. Evita sótanos húmedos o áticos calurosos.</Text>
              </View>

              <View style={styles.storageBox}>
                <Text style={styles.storageTitle}>🧥 Perchas de Plástico Ancho</Text>
                <Text style={styles.storageText}>Si cuelgas vestidos o monos, usa perchas plásticas redondas y acolchadas para evitar arrugas permanentes en los hombros.</Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm, lineHeight: 20 },

  tabsScroll: { marginVertical: spacing.sm, maxHeight: 44 },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  tabChipTextActive: { color: '#000', fontWeight: '900' },

  contentScroll: { paddingTop: spacing.xs },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sectionTitle: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  sectionDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },

  stepBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: 4,
  },
  stepNum: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  stepBody: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  tipCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  tipTitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  tipBody: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  dangerItem: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    gap: 4,
  },
  dangerHeader: { color: colors.danger, fontSize: fontSize.xs, fontWeight: '800' },
  dangerText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 18 },

  repairStep: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
  },
  repairStepTitle: { color: colors.primary, fontSize: fontSize.xs, fontWeight: '800' },
  repairStepBody: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  storageBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
  },
  storageTitle: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  storageText: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },
});
