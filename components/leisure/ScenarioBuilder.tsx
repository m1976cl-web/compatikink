import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/constants/theme';

type Scenario = {
  title: string;
  description: string;
  tags?: string[];
};

export function ScenarioBuilder({ onNext }: { onNext: (scenario: Scenario) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const canProceed = title.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = () => {
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    onNext({ title: title.trim(), description: description.trim(), tags: tags.length ? tags : undefined });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creador de Escenario</Text>
      <TextInput
        style={styles.input}
        placeholder="Título del escenario"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Descripción..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Etiquetas (separadas por coma)"
        value={tagsInput}
        onChangeText={setTagsInput}
        placeholderTextColor={colors.textMuted}
      />
      <TouchableOpacity
        style={[styles.button, !canProceed && styles.buttonDisabled]}
        disabled={!canProceed}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontFamily: fonts.displaySemi, color: colors.text, marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    color: colors.text,
    fontFamily: fonts.body,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.textMuted },
  buttonText: { color: colors.background, fontFamily: fonts.bodySemi, fontSize: 16 },
});
