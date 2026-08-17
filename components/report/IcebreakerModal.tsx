import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { CompatibilityReport } from '@/types';
import {
  IcebreakerQuestion,
  IcebreakerCategory,
  getTailoredIcebreakers,
} from '@/data/icebreakerQuestions';
import { triggerLightHaptic, triggerSelectionHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  report: CompatibilityReport;
  guestName?: string;
}

export function IcebreakerModal({ visible, onClose, report, guestName = 'tu pareja' }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<IcebreakerCategory | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const questionsList = useMemo(() => {
    const list = getTailoredIcebreakers(report);
    if (selectedCategory === 'all') return list;
    return list.filter((q) => q.category === selectedCategory);
  }, [report, selectedCategory]);

  const currentQ: IcebreakerQuestion | undefined = questionsList[currentIndex] || questionsList[0];

  const handleNext = () => {
    triggerLightHaptic();
    if (currentIndex < questionsList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    triggerLightHaptic();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(questionsList.length - 1);
    }
  };

  const handleRandom = () => {
    triggerSelectionHaptic();
    if (questionsList.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * questionsList.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % questionsList.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleToggleCompleted = (id: string) => {
    triggerSuccessHaptic();
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyQuestion = async () => {
    if (!currentQ) return;
    triggerLightHaptic();
    const text = `💬 Pregunta para conversar juntos:\n"${currentQ.question}"\n\n💡 Tip: ${currentQ.followUpTip}`;
    await Clipboard.setStringAsync(text);
    triggerSuccessHaptic();
    Alert.alert('¡Copiado!', 'La pregunta y el consejo se han copiado al portapapeles.');
  };

  if (!currentQ) return null;

  const isCompleted = completedIds.has(currentQ.id);

  const getDepthColor = (depth: string) => {
    if (depth === 'ligero') return '#4ade80';
    if (depth === 'intermedio') return '#38bdf8';
    return '#c084fc';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>🧊 Modo "Abre-hielos" Post-Reporte</Text>
              <Text style={styles.headerSubtitle}>
                Preguntas guiadas para romper el hielo y conversar con {guestName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('all');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
                ✨ Todas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'apertura_curiosa' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('apertura_curiosa');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'apertura_curiosa' && styles.catChipTextActive]}>
                ✨ Apertura
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'limites_confort' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('limites_confort');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'limites_confort' && styles.catChipTextActive]}>
                🛡️ Límites
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'fantasias_deseos' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('fantasias_deseos');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'fantasias_deseos' && styles.catChipTextActive]}>
                🔥 Deseos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'dinamicas_roles' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('dinamicas_roles');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'dinamicas_roles' && styles.catChipTextActive]}>
                🗝️ Roles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'seguridad_senales' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('seguridad_senales');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'seguridad_senales' && styles.catChipTextActive]}>
                🚦 Seguridad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catChip, selectedCategory === 'aftercare_afecto' && styles.catChipActive]}
              onPress={() => {
                triggerSelectionHaptic();
                setSelectedCategory('aftercare_afecto');
                setCurrentIndex(0);
              }}
            >
              <Text style={[styles.catChipText, selectedCategory === 'aftercare_afecto' && styles.catChipTextActive]}>
                🪷 Aftercare
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Main Card Canvas */}
          <View style={styles.cardBox}>
            {/* Top Card Meta */}
            <View style={styles.cardMetaRow}>
              <View style={styles.badgeWrap}>
                <Text style={styles.catBadge}>
                  {currentQ.categoryEmoji} {currentQ.categoryLabel}
                </Text>
                <View
                  style={[
                    styles.depthPill,
                    { borderColor: getDepthColor(currentQ.depthLevel), backgroundColor: `${getDepthColor(currentQ.depthLevel)}15` },
                  ]}
                >
                  <Text style={[styles.depthPillText, { color: getDepthColor(currentQ.depthLevel) }]}>
                    {currentQ.depthLevel.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.counterText}>
                {currentIndex + 1} / {questionsList.length}
              </Text>
            </View>

            {/* Question Text */}
            <ScrollView style={styles.questionScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.questionText}>"{currentQ.question}"</Text>

              {/* Follow up Tip Box */}
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>💡 Consejo de Comunicación:</Text>
                <Text style={styles.tipText}>{currentQ.followUpTip}</Text>
              </View>
            </ScrollView>

            {/* Bottom Card Actions */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={[styles.actionIconBtn, isCompleted && styles.actionIconBtnActive]}
                onPress={() => handleToggleCompleted(currentQ.id)}
              >
                <Text style={[styles.actionIconBtnText, isCompleted && { color: '#4ade80' }]}>
                  {isCompleted ? '✓ Conversada' : '💬 Marcar Conversada'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconBtn} onPress={handleCopyQuestion}>
                <Text style={styles.actionIconBtnText}>📋 Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Navigation Controls */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
              <Text style={styles.navBtnText}>← Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, styles.randomBtn]} onPress={handleRandom}>
              <Text style={styles.randomBtnText}>🎲 Al Azar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  categoryChips: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: colors.primary,
  },
  catChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.bodySemi,
  },
  catChipTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  cardBox: {
    backgroundColor: '#0d0716',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    gap: spacing.sm,
    minHeight: 260,
    ...glowShadowPrimary,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  depthPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  depthPillText: {
    fontSize: 8,
    fontFamily: fonts.bodyBold,
  },
  counterText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  questionScroll: {
    maxHeight: 180,
  },
  questionText: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    lineHeight: 24,
    marginVertical: 4,
  },
  tipBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginTop: spacing.xs,
    gap: 2,
  },
  tipTitle: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: spacing.xs,
  },
  actionIconBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  actionIconBtnActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  actionIconBtnText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  navBtnText: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  randomBtn: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: colors.primary,
  },
  randomBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  nextBtnText: {
    color: '#000',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
