import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  height?: number;
  borderRadius?: number;
  label?: string;
}

export function LoadingSkeleton({ height = 180, borderRadius = radii.xl, label = 'Cargando módulo...' }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.skeleton, { height, borderRadius, opacity: pulseAnim }]}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.xs,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});
