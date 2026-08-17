import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { MANUAL_AREAS, ManualModule } from '@/data/manualData';

export interface ModuleAccordionItemProps {
  module: ManualModule;
  isExpanded: boolean;
  isBookmarked?: boolean;
  onToggle: () => void;
  onToggleBookmark?: () => void;
  onNavigate: (path: string) => void;
}

export function ModuleAccordionItem({
  module,
  isExpanded,
  isBookmarked,
  onToggle,
  onToggleBookmark,
  onNavigate,
}: ModuleAccordionItemProps) {
  // Find associated area icon for category
  const areaIcon = useMemo(() => {
    const area = MANUAL_AREAS.find((a) => a.moduleIds.includes(module.id));
    return area ? area.icon : '📖';
  }, [module.id]);

  // Determine navigation route & label based on module ID or category
  const actionTarget = useMemo(() => {
    if (module.id.includes('poly')) {
      return { path: '/poly-group', label: 'Ir a Matriz Poliamor' };
    }
    if (module.id.includes('pass_and_play')) {
      return { path: '/pass-and-play', label: 'Ir a Modo Pass & Play' };
    }
    if (module.id.includes('admin')) {
      return { path: '/admin', label: 'Ir a Admin Dashboard' };
    }
    if (module.id.includes('ai_roleplay')) {
      return { path: '/ai-roleplay', label: 'Ir a AI Roleplay Sandbox' };
    }
    if (module.id.includes('cellmate') || module.id.includes('lovense') || module.id.includes('hardware')) {
      return { path: '/hardware', label: 'Ir a Control Hardware' };
    }
    if (module.category.includes('Seguridad')) {
      return { path: '/safety-guide', label: 'Ver Guía de Seguridad' };
    }
    if (module.category.includes('Cuestionario')) {
      return { path: '/questionnaire', label: 'Ir al Cuestionario' };
    }
    if (module.category.includes('Conexiones')) {
      return { path: '/kink-feed', label: 'Ver Conexiones & Feed' };
    }
    if (module.category.includes('Castidad')) {
      return { path: '/chastity', label: 'Ver Módulo Castidad' };
    }
    if (module.category.includes('Negociación')) {
      return { path: '/negotiation', label: 'Ir a Sala de Negociación' };
    }
    if (module.category.includes('Bóveda')) {
      return { path: '/quick-profile', label: 'Ver Bóveda & Perfil' };
    }
    return { path: '/questionnaire', label: 'Ver en Aplicación' };
  }, [module]);

  const isWarningCallout = useMemo(() => {
    return module.tags.some((t) =>
      ['seguridad', 'panico', 'alerta', 'emergencia', 'limite', 'hard_limit'].includes(
        t.toLowerCase()
      )
    );
  }, [module.tags]);

  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      {/* Header (Accordion Toggle) */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <Text style={styles.cardEmoji}>{areaIcon}</Text>
        <View style={styles.cardHeaderContent}>
          <View style={styles.cardCategoryRow}>
            <View style={styles.categoryBadgeTag}>
              <Text style={styles.categoryBadgeTagText}>{module.category}</Text>
            </View>
            <Text style={styles.stepCountLabel}>
              {module.stepByStepGuide.length} pasos
            </Text>
          </View>

          <Text style={styles.cardTitle}>{module.title}</Text>
          <Text style={styles.cardSummary}>{module.summary}</Text>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleBookmark?.();
          }}
          style={{ paddingHorizontal: 6 }}
        >
          <Text style={{ fontSize: 18 }}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>

        <View style={styles.arrowBox}>
          <Text style={styles.arrowText}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Accordion Body */}
      {isExpanded && (
        <View style={styles.cardBody}>
          <View style={styles.cardDivider} />

          <Text style={styles.descriptionText}>{module.description}</Text>

          {/* Key Features List */}
          {module.keyFeatures && module.keyFeatures.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>⚡ Características Clave</Text>
              {module.keyFeatures.map((feature, idx) => (
                <View key={idx} style={styles.featureItemRow}>
                  <Text style={styles.featureBullet}>✓</Text>
                  <Text style={styles.featureItemText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Step By Step Guide */}
          {module.stepByStepGuide && module.stepByStepGuide.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📋 Guía Paso a Paso</Text>
              {module.stepByStepGuide.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Callout Box */}
          {module.callout && (
            <View
              style={[
                styles.safetyCallout,
                (module.callout.type === 'warning' || isWarningCallout) && styles.safetyCalloutWarning,
              ]}
            >
              <Text
                style={[
                  styles.safetyCalloutTitle,
                  (module.callout.type === 'warning' || isWarningCallout) && styles.safetyCalloutTitleWarning,
                ]}
              >
                {module.callout.type === 'warning' || isWarningCallout
                  ? '🚨 Protocolo de Seguridad & Privacidad'
                  : '💡 Recomendación de Seguridad'}
              </Text>
              <Text
                style={[
                  styles.safetyTipText,
                  (module.callout.type === 'warning' || isWarningCallout) && styles.safetyTipTextWarning,
                ]}
              >
                • {module.callout.text}
              </Text>
            </View>
          )}

          {/* Tag Cloud */}
          {module.tags && module.tags.length > 0 && (
            <View style={styles.tagCloud}>
              {module.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Trigger Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onNavigate(actionTarget.path)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>{actionTarget.label} →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  cardHeaderContent: {
    flex: 1,
    gap: 4,
  },
  cardCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadgeTag: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  categoryBadgeTagText: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
  },
  stepCountLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  cardSummary: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  arrowBox: {
    padding: spacing.xs,
  },
  arrowText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  detailSection: {
    gap: spacing.xs,
  },
  detailSectionTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureBullet: {
    color: colors.success,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  featureItemText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: 4,
  },
  stepBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  stepText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  safetyCallout: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: spacing.md,
    gap: 4,
  },
  safetyCalloutWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftColor: colors.danger,
  },
  safetyCalloutTitle: {
    color: colors.info,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  safetyCalloutTitleWarning: {
    color: colors.danger,
  },
  safetyTipText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  safetyTipTextWarning: {
    color: colors.text,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagBadge: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagBadgeText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  actionBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
});
