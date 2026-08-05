import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatusToast() {
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const translateYAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wasOffline && isOnline) {
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -60,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          resetWasOffline();
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  if (!wasOffline || !isOnline) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <View style={styles.toastCard}>
        <Text style={styles.toastText}>🟢 Conexión restablecida — Bóveda Sincronizada</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    backgroundColor: '#061614',
    borderColor: '#10b981',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
  },
  toastText: {
    color: '#10b981',
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 0.2,
  },
});
