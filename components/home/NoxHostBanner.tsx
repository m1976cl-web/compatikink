import React from 'react';
import { StyleSheet, Text, View, Image, Platform } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface NoxHostBannerProps {
  activeTab: string;
}

const NOX_CONFIGS: Record<
  string,
  { image: any; title: string; subtitle: string; accent: string }
> = {
  explore: {
    image: require('@/assets/images/nox_astrologer.jpg'),
    title: '🔮 Nox el Astrólogo',
    subtitle: 'Anfitrión de Exploración: Mapa de afinidades 2D, astrología kink y arquetipos.',
    accent: '#c084fc',
  },
  scenes: {
    image: require('@/assets/images/nox_director.jpg'),
    title: '🎬 Nox el Director de Escena',
    subtitle: 'Anfitrión de Escenas: Monitor en vivo con Safeword, creador de secuencias y hábitos D/s.',
    accent: '#f472b6',
  },
  social: {
    image: require('@/assets/images/nox_host.jpg'),
    title: '🍸 Nox el Anfitrión Social',
    subtitle: 'Anfitrión de Comunidad: Munches, deseos efímeros 24h Pure ZK y perfil de pareja vinculada.',
    accent: '#38bdf8',
  },
  ai: {
    image: require('@/assets/images/nox_cyber_ai.jpg'),
    title: '🤖 Nox Cyber AI',
    subtitle: 'Anfitrión de Inteligencia: Consultas confidenciales Gemini ZK, guiones y economía D/s.',
    accent: '#4ade80',
  },
  vault: {
    image: require('@/assets/images/nox_vault_keeper.jpg'),
    title: '🔒 Nox Guardián de la Bóveda',
    subtitle: 'Anfitrión de Seguridad: Cifrado AES-256 en RAM, borrado de pánico y backups cifrados.',
    accent: '#fbbf24',
  },
};

export function NoxHostBanner({ activeTab }: NoxHostBannerProps) {
  const config = NOX_CONFIGS[activeTab] || NOX_CONFIGS.explore;

  return (
    <View style={[styles.card, { borderColor: config.accent + '55' }]}>
      <Image source={config.image} style={[styles.avatar, { borderColor: config.accent }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.accent }]}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 13, 36, 0.85)',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    gap: spacing.md,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 20px rgba(7, 4, 13, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
        }
      : {}),
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
