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
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { NoxHost } from '@/components/nox';
import { useResponsive } from '@/hooks/useResponsive';
import { purgeAllUserData } from '@/lib/storage';
import { PrivacySecurityAuditorCard } from '@/components/privacy/PrivacySecurityAuditorCard';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [purging, setPurging] = useState(false);

  const handlePurgeData = () => {
    Alert.alert(
      '⚠️ Borrado Permanente ("Derecho al Olvido")',
      'Esta acción eliminará de forma irreversible todas tus respuestas, sesiones, perfiles y claves cifradas tanto de tu dispositivo como del servidor. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Eliminar Todo Permanentemente',
          style: 'destructive',
          onPress: async () => {
            setPurging(true);
            try {
              await purgeAllUserData();
              Alert.alert(
                'Datos Eliminados ✓',
                'Toda tu información ha sido eliminada permanentemente. La app se reiniciará.',
                [{ text: 'OK', onPress: () => router.replace('/onboarding') }]
              );
            } catch {
              Alert.alert('Error', 'No se pudo completar la eliminación total.');
            } finally {
              setPurging(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer title="Privacidad & Consentimiento Legal" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacidad & Control de Datos 🛡️</Text>
          <NoxHost scene="privacy" variant="compact" />
          <Text style={styles.subtitle}>
            Cumplimiento GDPR Art. 9, Ley 21.719 y Especificación Zero-Knowledge AES-GCM-256
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* P1: Privacy & Security Level Auditor Card */}
          <PrivacySecurityAuditorCard />

          {/* Card 1: Zero Knowledge Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔐 Garantía Zero-Knowledge (Cero Conocimiento)</Text>
            <Text style={styles.cardText}>
              Tus respuestas y preferencias sexuales nunca se almacenan en texto plano. Se cifran localmente en tu propio dispositivo utilizando AES-GCM-256 con claves derivadas mediante PBKDF2-SHA-256 (100.000 iteraciones). Ni los servidores de la app ni administradores pueden leer tus datos.
            </Text>
          </View>

          {/* Card 2: Legal Consent */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚖️ Base Legal & Consentimiento Informado</Text>
            <Text style={styles.cardText}>
              Bajo la Ley N° 21.719 (Chile) y el Art. 9 del GDPR, las preferencias íntimas son consideradas Datos de Categoría Especial. El tratamiento de tus datos se realiza únicamente en base a tu consentimiento explícito otorgado en el onboarding.
            </Text>
          </View>

          {/* Card 3: Expiration & Rate Limits */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⏳ Expiración & Rate-Limiting</Text>
            <Text style={styles.cardText}>
              - Códigos de invitación: Expiran automáticamente a las 48 horas.{'\n'}
              - Canje único: Invalidación tras el primer uso exitoso.{'\n'}
              - Protección contra fuerza bruta: Bloqueo de 15 minutos ante 5 intentos fallidos consecutuivos.
            </Text>
          </View>

          {/* Danger Zone: Right to be forgotten P0.4 */}
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>🗑️ Derecho al Olvido (Borrado Permanente P0.4)</Text>
            <Text style={styles.dangerText}>
              Puedes borrar irrevocablemente toda tu información de la app y del servidor en un solo paso. Esta acción limpia tus claves de memoria, base de datos local y solicita la purga remota.
            </Text>

            <TouchableOpacity
              style={styles.purgeBtn}
              onPress={handlePurgeData}
              disabled={purging}
            >
              <Text style={styles.purgeBtnText}>
                {purging ? 'Eliminando datos...' : '🔥 Eliminar Todos Mis Datos Permanentemente'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md, backgroundColor: '#0a0612' },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },
  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },
  scroll: { gap: spacing.md, paddingTop: spacing.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: { color: colors.primary, fontSize: fontSize.md, fontWeight: '800' },
  cardText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 20 },

  dangerCard: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.danger,
    gap: spacing.xs,
  },
  dangerTitle: { color: colors.danger, fontSize: fontSize.md, fontWeight: '800' },
  dangerText: { color: colors.text, fontSize: fontSize.xs, lineHeight: 20 },
  purgeBtn: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  purgeBtnText: { color: '#ffffff', fontSize: fontSize.xs, fontWeight: '900' },
});
