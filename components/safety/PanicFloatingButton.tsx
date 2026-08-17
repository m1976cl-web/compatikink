import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import {
  triggerPanicDisguise,
  getPanicSettings,
  PanicDisguiseSettings,
} from '@/lib/panicDisguise';
import { radii, glowShadowPrimary } from '@/constants/theme';

export function PanicFloatingButton() {
  const [settings, setSettings] = useState<PanicDisguiseSettings | null>(null);

  useEffect(() => {
    getPanicSettings().then(setSettings);
  }, []);

  if (!settings || !settings.isFabEnabled) return null;

  const isLeft = settings.fabPosition === 'bottom_left';

  return (
    <TouchableOpacity
      style={[styles.fab, isLeft ? styles.fabLeft : styles.fabRight]}
      onPress={() => triggerPanicDisguise()}
      activeOpacity={0.7}
      accessibilityLabel="Botón de Pánico y Camuflaje Inmediato"
      accessibilityRole="button"
    >
      <Text style={styles.fabIcon}>
        {settings.disguiseMode === 'notes' ? '📝' : '🧮'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181124',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    opacity: 0.85,
    ...glowShadowPrimary,
  },
  fabRight: {
    right: 18,
  },
  fabLeft: {
    left: 18,
  },
  fabIcon: {
    fontSize: 20,
  },
});
