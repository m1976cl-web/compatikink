import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/constants/theme';

export function ScavengerHunt({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caza del Tesoro</Text>
      <Text style={styles.info}>Recoge los objetos de seguridad (tarjeta de palabra segura, checklist de aftercare, etc.).</Text>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontFamily: fonts.displaySemi, color: colors.text, marginBottom: 8 },
  info: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: colors.background, fontFamily: fonts.bodySemi, fontSize: 16 },
});
