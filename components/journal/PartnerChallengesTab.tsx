import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PartnerChallenge, PartnerLink, PartnerReward } from '@/lib/partnerJournal';

export interface PartnerChallengesTabProps {
  activePartner?: PartnerLink;
  chTitle: string;
  setChTitle: (val: string) => void;
  chDesc: string;
  setChDesc: (val: string) => void;
  onCreateChallenge: () => void;
  challenges: PartnerChallenge[];
  onCompleteChallenge: (chId: string) => void;
  rewTitle: string;
  setRewTitle: (val: string) => void;
  onCreateReward: () => void;
  rewards: PartnerReward[];
  onRedeemReward: (rewId: string) => void;
}

export function PartnerChallengesTab({
  activePartner,
  chTitle,
  setChTitle,
  chDesc,
  setChDesc,
  onCreateChallenge,
  challenges,
  onCompleteChallenge,
  rewTitle,
  setRewTitle,
  onCreateReward,
  rewards,
  onRedeemReward,
}: PartnerChallengesTabProps) {
  return (
    <View style={styles.sectionGap}>
      {activePartner ? (
        <View style={styles.xpBanner}>
          <Text style={styles.xpBannerTitle}>
            Puntos XP con {activePartner.partnerName}: <Text style={{ color: '#fbbf24' }}>{activePartner.totalXp} XP</Text> (Nivel {activePartner.level})
          </Text>
        </View>
      ) : null}

      {/* Create Challenge Form */}
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>🎯 Proponer Nuevo Desafío en Pareja</Text>

        <Text style={styles.fieldLabel}>Título del Desafío</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Masaje tántrico de 20 min, Día de protocolo..."
          placeholderTextColor={colors.textDim}
          value={chTitle}
          onChangeText={setChTitle}
        />

        <Text style={styles.fieldLabel}>Descripción del Reto</Text>
        <TextInput
          style={styles.input}
          placeholder="Detalles o instrucciones del desafío..."
          placeholderTextColor={colors.textDim}
          value={chDesc}
          onChangeText={setChDesc}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onCreateChallenge} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Publicar Desafío 🎯</Text>
        </TouchableOpacity>
      </View>

      {/* Active Challenges List */}
      <Text style={styles.sectionHeader}>Desafíos Activos ({challenges.length}):</Text>
      {challenges.map((ch) => (
        <View key={ch.id} style={styles.challengeCard}>
          <View style={styles.chHeader}>
            <Text style={styles.chTitle}>{ch.title}</Text>
            <Text style={styles.chXp}>+{ch.xpReward} XP</Text>
          </View>
          {ch.description ? <Text style={styles.chDesc}>{ch.description}</Text> : null}

          {ch.completed ? (
            <Text style={styles.completedText}>✓ Completado el {new Date(ch.completedAt!).toLocaleDateString()}</Text>
          ) : (
            <TouchableOpacity style={styles.completeBtn} onPress={() => onCompleteChallenge(ch.id)} activeOpacity={0.8}>
              <Text style={styles.completeBtnText}>Marcar como Cumplido ✓</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Create & Redeem Rewards Shop */}
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>🎁 Tienda de Recompensas de Pareja</Text>
        <Text style={styles.fieldLabel}>Crear Nueva Recompensa Canjeable</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 1 Deseo Concedido, Elección de próxima escena..."
          placeholderTextColor={colors.textDim}
          value={rewTitle}
          onChangeText={setRewTitle}
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={onCreateReward} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Agregar Recompensa 🎁</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Recompensas Disponibles ({rewards.length}):</Text>
        {rewards.map((rew) => (
          <View key={rew.id} style={styles.rewardCard}>
            <View style={styles.chHeader}>
              <Text style={styles.chTitle}>{rew.title}</Text>
              <Text style={styles.rewCost}>{rew.xpCost} XP</Text>
            </View>
            {rew.redeemed ? (
              <Text style={styles.completedText}>👑 Canjeado el {new Date(rew.redeemedAt!).toLocaleDateString()}</Text>
            ) : (
              <TouchableOpacity style={styles.redeemBtn} onPress={() => onRedeemReward(rew.id)} activeOpacity={0.8}>
                <Text style={styles.redeemBtnText}>Canjear Recompensa 👑</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionGap: { gap: spacing.md },
  xpBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  xpBannerTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardBoxTitle: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    color: colors.text,
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  rewardCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    marginTop: spacing.xs,
  },
  chHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chTitle: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  chXp: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  chDesc: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
  },
  rewCost: {
    color: '#fbbf24',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  completedText: {
    color: colors.success,
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  completeBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginTop: 4,
  },
  completeBtnText: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
  redeemBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#fbbf24',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginTop: 4,
  },
  redeemBtnText: {
    color: '#fbbf24',
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
  },
});
