import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function GlossaryQuizModal({ visible, onClose }: Props) {
  const quizQuestions = [
    {
      term: 'Afterdrop',
      correctDefinition: 'Caída emocional o física post-escena debido al descenso de endorfinas y dopamina.',
      options: [
        'Caída emocional o física post-escena debido al descenso de endorfinas y dopamina.',
        'Herramienta de corte de emergencia en sesiones de Shibari.',
        'La persona que conecta dos relaciones en un vínculo poliamoroso.',
      ],
    },
    {
      term: 'FRIES',
      correctDefinition: 'Modelo de consentimiento: Freely given, Reversible, Informed, Enthusiastic, Specific.',
      options: [
        'Tipo de cuerda japonesa de cáñamo natural tratada con cera.',
        'Modelo de consentimiento: Freely given, Reversible, Informed, Enthusiastic, Specific.',
        'Dispositivo de estimulación eléctrica de alta frecuencia.',
      ],
    },
    {
      term: 'Compersión',
      correctDefinition: 'Sentimiento de alegría empática por la felicidad amorosa o sexual de tu pareja con otra persona.',
      options: [
        'Compresión física controlada mediante arneses de látex.',
        'Sentimiento de alegría empática por la felicidad amorosa o sexual de tu pareja con otra persona.',
        'Acuerdo formal de castidad con traspaso de llave.',
      ],
    },
  ];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = quizQuestions[questionIndex] || quizQuestions[0];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctDefinition) {
      triggerSuccessHaptic();
      setScore((s) => s + 1);
    } else {
      triggerLightHaptic();
    }
  };

  const handleNext = () => {
    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.quizCard}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizTitle}>🧠 Mini-Quiz de Glosario</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.quizCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isFinished ? (
            <View style={styles.quizResultWrap}>
              <Text style={styles.quizScoreEmoji}>{score === 3 ? '🏆' : '✨'}</Text>
              <Text style={styles.quizScoreTitle}>
                ¡Completaste el Quiz! Puntaje: {score} de {quizQuestions.length}
              </Text>
              <Text style={styles.quizScoreSub}>
                {score === 3
                  ? '¡Excelente dominio del vocabulario y conceptos!'
                  : 'Sigue explorando los términos para afianzar tus conocimientos.'}
              </Text>
              <TouchableOpacity style={styles.quizActionBtn} onPress={handleReset}>
                <Text style={styles.quizActionBtnText}>Jugar de nuevo 🔄</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.quizBody}>
              <Text style={styles.quizProgressText}>
                Pregunta {questionIndex + 1} de {quizQuestions.length}
              </Text>
              <Text style={styles.quizPrompt}>
                ¿Cuál es la definición correcta de <Text style={styles.quizTermHighlight}>{currentQ.term}</Text>?
              </Text>

              <View style={styles.quizOptionsList}>
                {currentQ.options.map((opt, idx) => {
                  const isCorrect = opt === currentQ.correctDefinition;
                  const isSelected = selectedAnswer === opt;

                  let borderStyle = colors.border;
                  let bgStyle = colors.surfaceLight;

                  if (isAnswered) {
                    if (isCorrect) {
                      borderStyle = '#4ade80';
                      bgStyle = 'rgba(74, 222, 128, 0.15)';
                    } else if (isSelected && !isCorrect) {
                      borderStyle = colors.danger;
                      bgStyle = 'rgba(248, 113, 113, 0.15)';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.quizOptionBtn, { borderColor: borderStyle, backgroundColor: bgStyle }]}
                      onPress={() => handleSelectOption(opt)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.quizOptionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isAnswered ? (
                <TouchableOpacity style={styles.quizActionBtn} onPress={handleNext}>
                  <Text style={styles.quizActionBtnText}>
                    {questionIndex === quizQuestions.length - 1 ? 'Ver Resultado 🏁' : 'Siguiente Pregunta →'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  quizCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    maxWidth: 520,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.md,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  quizCloseText: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    padding: 4,
  },
  quizBody: {
    gap: spacing.sm,
  },
  quizProgressText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
  },
  quizPrompt: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  quizTermHighlight: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  quizOptionsList: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  quizOptionBtn: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  quizOptionText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  quizActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  quizActionBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  quizResultWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  quizScoreEmoji: {
    fontSize: 48,
  },
  quizScoreTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  quizScoreSub: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
