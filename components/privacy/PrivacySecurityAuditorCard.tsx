import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii, glowShadowPrimary } from '@/constants/theme';
import { runPrivacyAudit, PrivacyAuditReport } from '@/lib/privacyAuditor';
import { triggerLightHaptic, triggerSuccessHaptic } from '@/lib/haptics';

interface Props {
  onConfigureDuress?: () => void;
}

export function PrivacySecurityAuditorCard({ onConfigureDuress }: Props) {
  const [report, setReport] = useState<PrivacyAuditReport | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadAudit = async () => {
    const res = await runPrivacyAudit();
    setReport(res);
  };

  useEffect(() => {
    loadAudit();
  }, []);

  if (!report) return null;

  return (
    <View style={styles.card}>
      {/* Top Banner: Shield, Score & Tier */}
      <View style={styles.headerRow}>
        <View style={[styles.shieldIconBox, { borderColor: report.shieldColor }]}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.scoreTitleRow}>
            <Text style={styles.scoreNum}>{report.overallScore}%</Text>
            <Text style={[styles.shieldTier, { color: report.shieldColor }]}>
              {report.shieldTier}
            </Text>
          </View>
          <Text style={styles.subtext}>
            {report.passedChecks} de {report.totalChecks} capas criptográficas activas
          </Text>
        </View>

        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => {
            triggerLightHaptic();
            setIsExpanded(!isExpanded);
          }}
        >
          <Text style={styles.expandBtnText}>
            {isExpanded ? 'Ocultar ▲' : 'Detalles ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${report.overallScore}%`, backgroundColor: report.shieldColor },
          ]}
        />
      </View>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <View style={styles.breakdownBox}>
          <Text style={styles.breakdownTitle}>Auditoría de Capas de Seguridad:</Text>

          {report.layers.map((layer) => (
            <View key={layer.id} style={styles.layerRow}>
              <Text style={{ fontSize: 16 }}>{layer.isSecured ? '🔒' : '⚠️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.layerName, !layer.isSecured && { color: '#fbbf24' }]}>
                  {layer.name}
                </Text>
                <Text style={styles.layerDesc}>{layer.description}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  layer.isSecured ? styles.statusBadgeSecured : styles.statusBadgeWarning,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    layer.isSecured ? { color: '#4ade80' } : { color: '#fbbf24' },
                  ]}
                >
                  {layer.isSecured ? 'Activo' : 'Pendiente'}
                </Text>
              </View>
            </View>
          ))}

          {/* Recommendations if any */}
          {report.recommendations.length > 0 && (
            <View style={styles.recommendationsBox}>
              <Text style={styles.recsTitle}>💡 Sugerencias de Blindaje:</Text>
              {report.recommendations.map((rec, idx) => (
                <Text key={idx} style={styles.recItem}>• {rec}</Text>
              ))}
              {onConfigureDuress && (
                <TouchableOpacity style={styles.actionLinkBtn} onPress={onConfigureDuress}>
                  <Text style={styles.actionLinkText}>Configurar PIN de Coacción →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    gap: spacing.xs,
    ...glowShadowPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shieldIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: {
    fontSize: 22,
  },
  scoreTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  scoreNum: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
  },
  shieldTier: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  subtext: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },
  expandBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expandBtnText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  track: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.xs,
  },
  breakdownTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  layerName: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  layerDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeSecured: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  statusBadgeWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  recommendationsBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    marginTop: 4,
    gap: 2,
  },
  recsTitle: {
    color: '#fbbf24',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
  recItem: {
    color: colors.text,
    fontSize: 10,
    fontFamily: fonts.body,
    lineHeight: 14,
  },
  actionLinkBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  actionLinkText: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
  },
});
