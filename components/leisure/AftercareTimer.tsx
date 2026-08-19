import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import { schedule3PhaseAftercareProtocol } from '@/lib/localNotifications';

export function AftercareTimer({ onNext }: { onNext: () => void }) {
  const [scheduling, setScheduling] = useState(false);
  const [scheduledIds, setScheduledIds] = useState<string[]>();

  const handleStart = async () => {
    setScheduling(true);
    try {
      const ids = await schedule3PhaseAftercareProtocol();
      setScheduledIds(ids);
    } catch (e) {
      console.warn('Error scheduling aftercare:', e);
    } finally {
      setScheduling(false);
      // Proceed immediately after scheduling; actual notifications fire later.
      onNext();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>After‑care</Text>
      <Text style={styles.info}>Se programarán tres notificaciones de after‑care para los próximos 24 horas.</Text>
      {scheduling ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Programar Notificaciones</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontFamily: fonts.displaySemi, color: colors.text, marginBottom: 12, textAlign: 'center' },
  info: { fontSize: 16, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: colors.background, fontFamily: fonts.bodySemi, fontSize: 16 },
});
