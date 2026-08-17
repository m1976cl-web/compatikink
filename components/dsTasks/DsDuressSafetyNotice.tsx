import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { useHomeStore, HomeState } from '@/stores/homeStore';

interface Props {
  onPanicWipe?: () => void;
}

export function DsDuressSafetyNotice({ onPanicWipe }: Props) {
  const [expanded, setExpanded] = useState(false);
  const handlePanicWipe = useHomeStore((s: HomeState) => s.handlePanicWipe);

  const triggerWipe = () => {
    const confirmMessage =
      '¿Estás seguro de ejecutar el borrado de pánico? Se eliminarán inmediatamente todas las tareas D/s, hábitos, registros de la bóveda y sesiones ZK.';
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(confirmMessage)) {
        handlePanicWipe();
        onPanicWipe?.();
      }
    } else {
      Alert.alert('Borrado de Pánico', confirmMessage, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'BORRAR TODO',
          style: 'destructive',
          onPress: () => {
            handlePanicWipe();
            onPanicWipe?.();
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
        style={styles.headerRow}
      >
        <View style={styles.titleRow}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
          <View>
            <Text style={styles.title}>Protocolo de Seguridad SSC / RACK</Text>
            <Text style={styles.subtitle}>Cifrado ZK AES-256 local • Consentimiento Revocable</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedBody}>
          <Text style={styles.bodyText}>
            • <Text style={styles.bold}>SSC (Sano, Seguro y Consentido)</Text> & <Text style={styles.bold}>RACK (Kink Consentido Asumiendo Riesgos)</Text>: Todo protocolo, tarea o hábito en esta app es 100% voluntario. El consentimiento puede revocarse en cualquier momento con tu palabra de seguridad.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.bold}>Privacidad Zero-Knowledge</Text>: Tus tareas y hábitos se cifran localmente en tu dispositivo con AES-GCM-256. Nadie sin tu PIN puede leerlos.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.bold}>PIN Canario / Coacción</Text>: Si te ves forzado/a a desbloquear la app, tu PIN de Coacción abrirá una bóveda señuelo vacía o borrará tus datos al instante.
          </Text>

          <TouchableOpacity style={styles.wipeButton} onPress={triggerWipe}>
            <Text style={styles.wipeButtonText}>⚠️ Borrado de Pánico Inmediato</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#12070a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(153, 0, 0, 0.4)',
    padding: spacing.md,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 16px rgba(153, 0, 0, 0.15)',
        } as object)
      : {}),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  shieldEmoji: {
    fontSize: 22,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: '#D4AF37',
    marginTop: 2,
  },
  chevron: {
    color: '#990000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandedBody: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(153, 0, 0, 0.25)',
    gap: spacing.xs,
  },
  bodyText: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#F3E8FF',
  },
  wipeButton: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(153, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: '#990000',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  wipeButtonText: {
    color: '#FF6666',
    fontWeight: 'bold',
    fontSize: fontSize.xs,
  },
});
