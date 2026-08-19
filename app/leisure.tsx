import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts } from '@/constants/theme';

export default function LeisureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leisure Suite Larry</Text>
      <Text style={styles.subtitle}>�Bienvenido! Esta es una versi�n preliminar del juego.</Text>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Start game placeholder')}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.displaySemi,
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
});
