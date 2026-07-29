import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';
import { usePWAInstall } from '@/lib/pwaInstall';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PWAInstallPromptModal({ visible, onClose }: Props) {
  const { canInstall, isIOS, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
      onClose();
    } else if (isIOS) {
      Alert.alert(
        '📲 Instalar en iOS (iPhone / iPad)',
        '1. Toca el botón "Compartir" (el ícono con un cuadrado y flecha arriba) en Safari.\n2. Selecciona "Agregar al inicio" ➕.\n3. ¡Listo! Compatikink funcionará como app nativa sin barra de dirección.'
      );
    } else {
      Alert.alert(
        '📲 Instalar en Android / Chrome',
        'Toca los 3 puntos del navegador en la esquina superior derecha y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".'
      );
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>📲</Text>
          <Text style={styles.title}>Instalar Compatikink App en tu Teléfono</Text>
          <Text style={styles.desc}>
            Accede instantáneamente desde tu pantalla de inicio con rendimiento nativo, notificaciones push y funcionamiento 100% offline.
          </Text>

          <View style={styles.benefitsBox}>
            <Text style={styles.benefitItem}>⚡ Carga ultra rápida sin barra de navegador</Text>
            <Text style={styles.benefitItem}>🔐 Acceso directo a tu Bóveda Cifrada</Text>
            <Text style={styles.benefitItem}>🔔 Notificaciones push para aftercare y mensajes</Text>
          </View>

          <TouchableOpacity style={styles.installBtn} onPress={handleInstallClick}>
            <Text style={styles.installBtnText}>
              {canInstall ? 'Instalar App Ahora (1-Tap) 📲' : 'Ver Instrucciones de Instalación 📲'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 18, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    maxWidth: 440,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.md,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textMuted, fontSize: 14 },
  emoji: { fontSize: 44 },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '900', textAlign: 'center' },
  desc: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  benefitsBox: {
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderRadius: 14,
    padding: spacing.md,
    width: '100%',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  benefitItem: { color: colors.text, fontSize: fontSize.xs, fontWeight: '600' },

  installBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  installBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '900' },
});
