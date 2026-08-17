import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { colors, radii } from '@/constants/theme';

interface Props {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = radii.md,
  style,
}: Props) {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: shimmerAnim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCardGroup() {
  return (
    <View style={styles.groupContainer}>
      <SkeletonLoader height={120} borderRadius={radii.xl} />
      <SkeletonLoader height={70} borderRadius={radii.lg} />
      <SkeletonLoader height={70} borderRadius={radii.lg} />
      <SkeletonLoader height={200} borderRadius={radii.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
    borderWidth: 1,
  },
  groupContainer: {
    gap: 12,
    width: '100%',
    padding: 16,
  },
});
