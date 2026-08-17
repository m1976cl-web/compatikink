import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface RadarChartProps {
  data: {
    category: string;
    label: string;
    initiatorScore: number; // 0-100
    guestScore: number;     // 0-100
  }[];
  size?: number; // default 300
  showLegend?: boolean; // default true
}

export function RadarChart({ data, size = 300, showLegend = true }: RadarChartProps) {
  const n = data.length;
  if (n === 0) return null;

  const center = size / 2;
  const radius = (size / 2) * 0.62;
  const labelRadius = radius * 1.32;

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoord = (score: number, index: number) => {
    const angle = (2 * Math.PI * index) / n - Math.PI / 2;
    return {
      x: center + radius * (score / 100) * Math.cos(angle),
      y: center + radius * (score / 100) * Math.sin(angle),
    };
  };

  const getLabelCoord = (index: number) => {
    const angle = (2 * Math.PI * index) / n - Math.PI / 2;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      anchor: Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle',
    };
  };

  const polyPoints = (scores: number[]) =>
    scores.map((s, i) => {
      const { x, y } = getCoord(s, i);
      return `${x},${y}`;
    }).join(' ');

  // Grid ring polygons
  const gridPaths = rings.map((r) =>
    polyPoints(data.map(() => r * 100))
  );

  // Data polygons
  const initiatorPoly = polyPoints(data.map((d) => d.initiatorScore));
  const guestPoly = polyPoints(data.map((d) => d.guestScore));

  // Data dots
  const initiatorDots = data.map((d, i) => getCoord(d.initiatorScore, i));
  const guestDots = data.map((d, i) => getCoord(d.guestScore, i));

  // Axis lines
  const axes = data.map((_, i) => {
    const end = getCoord(100, i);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });

  // Labels
  const labels = data.map((d, i) => {
    const pos = getLabelCoord(i);
    return { ...pos, text: d.label };
  });

  if (Platform.OS !== 'web') {
    // Fallback for native: simple text-based summary
    return (
      <View style={styles.container}>
        {data.map((d) => (
          <View key={d.category} style={styles.fallbackRow}>
            <Text style={styles.fallbackLabel}>{d.label}</Text>
            <View style={styles.fallbackBarBg}>
              <View style={[styles.fallbackBar, { width: `${Math.min(d.initiatorScore, 100)}%` }]} />
            </View>
            <Text style={styles.fallbackScore}>{Math.round(d.initiatorScore)}%</Text>
          </View>
        ))}
      </View>
    );
  }

  // Web: render inline SVG via dangerouslySetInnerHTML
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid Rings -->
      ${gridPaths.map((pts, i) => `
        <polygon points="${pts}" fill="transparent" stroke="rgba(192,132,252,0.12)" stroke-width="1"/>
      `).join('')}

      <!-- Axes -->
      ${axes.map((a) => `
        <line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="rgba(192,132,252,0.12)" stroke-width="1"/>
      `).join('')}

      <!-- Guest Data Polygon -->
      <polygon points="${guestPoly}" fill="rgba(244,114,182,0.2)" stroke="#f472b6" stroke-width="2" stroke-linejoin="round"/>
      ${guestDots.map((d, i) => `
        <circle cx="${d.x}" cy="${d.y}" r="4" fill="#f472b6" stroke="#0d0814" stroke-width="1"/>
      `).join('')}

      <!-- Initiator Data Polygon -->
      <polygon points="${initiatorPoly}" fill="rgba(192,132,252,0.2)" stroke="#c084fc" stroke-width="2" stroke-linejoin="round"/>
      ${initiatorDots.map((d) => `
        <circle cx="${d.x}" cy="${d.y}" r="4.5" fill="#c084fc" stroke="#0d0814" stroke-width="1"/>
      `).join('')}

      <!-- Category Labels -->
      ${labels.map((l) => `
        <text x="${l.x}" y="${l.y}" fill="#c084fc" font-size="11" font-weight="600" text-anchor="${l.anchor}" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif">${l.text}</text>
      `).join('')}
    </svg>
  `;

  return (
    <View style={styles.container}>
      <View
        // @ts-ignore — web-only prop for inline SVG rendering
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: size, height: size }}
      />

      {showLegend && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#c084fc' }]} />
            <Text style={styles.legendText}>Tú</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f472b6' }]} />
            <Text style={styles.legendText}>Invitado</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  // Native fallback styles
  fallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  fallbackLabel: {
    color: colors.primary,
    fontSize: fontSize.xs,
    width: 80,
  },
  fallbackBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(192,132,252,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: spacing.xs,
  },
  fallbackBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  fallbackScore: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    width: 36,
    textAlign: 'right',
  },
});
