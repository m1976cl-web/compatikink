import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/constants/theme';

// Simple placeholder quiz questions
const QUESTIONS = [
  {
    id: 1,
    question: '¿Entiendes que el consentimiento puede retirarse en cualquier momento?',
    options: ['Sí', 'No'],
  },
  {
    id: 2,
    question: '¿Aceptas seguir las medidas de after‑care después de la sesión?',
    options: ['Sí', 'No'],
  },
];

export function ConsentQuiz({ onNext }: { onNext: (answers: Record<number, string>) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qid: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qid]: option }));
  };

  const canProceed = QUESTIONS.every(q => answers[q.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz de Consentimiento</Text>
      {QUESTIONS.map(q => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.question}>{q.question}</Text>
          {q.options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, answers[q.id] === opt && styles.optionSelected]}
              onPress={() => handleSelect(q.id, opt)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity
        style={[styles.nextButton, !canProceed && styles.nextDisabled]}
        disabled={!canProceed}
        onPress={() => onNext(answers)}
      >
        <Text style={styles.nextText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 22, fontFamily: fonts.displaySemi, color: colors.text, marginBottom: 12, textAlign: 'center' },
  questionBlock: { marginBottom: 16 },
  question: { fontSize: 16, fontFamily: fonts.body, color: colors.text, marginBottom: 8 },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontFamily: fonts.body, color: colors.text },
  nextButton: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  nextDisabled: { backgroundColor: colors.textMuted },
  nextText: { color: colors.background, fontFamily: fonts.bodySemi, fontSize: 16 },
});
