import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { DsReward, DsRewardRedemption, DsPointsLedger } from '@/types';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface Props {
  rewards: DsReward[];
  redemptions: DsRewardRedemption[];
  ledger: DsPointsLedger;
  userNickname: string;
  onRedeem: (rewardId: string) => void;
  onFulfill: (redemptionId: string) => void;
  onAddReward: () => void;
  onDeleteReward: (rewardId: string) => void;
}

export function DsRewardShop({
  rewards,
  redemptions,
  ledger,
  userNickname,
  onRedeem,
  onFulfill,
  onAddReward,
  onDeleteReward,
}: Props) {
  const [showHistory, setShowHistory] = useState(false);

  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');

  return (
    <View style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Puntos de Tributo / Recompensa</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.balanceValue}>{ledger.currentBalance}</Text>
              <Text style={styles.ptsUnit}>pts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.historyBtnText}>{showHistory ? 'Ocultar Historial' : '📜 Historial'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statText}>Total Ganado: <Text style={styles.statVal}>+{ledger.totalEarned} pts</Text></Text>
          <Text style={styles.statText}>Total Canjeado: <Text style={styles.statVal}>-{ledger.totalSpent} pts</Text></Text>
        </View>

        {/* Ledger History List */}
        {showHistory && (
          <View style={styles.historyBox}>
            <Text style={styles.historyTitle}>Registro de Puntos:</Text>
            {ledger.history.length === 0 ? (
              <Text style={styles.emptyHistory}>Sin movimientos todavía.</Text>
            ) : (
              ledger.history.slice(0, 8).map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <Text
                    style={[
                      styles.historyType,
                      entry.type === 'earn' || entry.type === 'bonus'
                        ? styles.historyEarn
                        : styles.historySpend,
                    ]}
                  >
                    {entry.type === 'earn' || entry.type === 'bonus' ? '+' : '-'}{entry.amount} pts
                  </Text>
                  <Text style={styles.historyReason} numberOfLines={1}>
                    {entry.reason}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Pending Redemptions Banner */}
      {pendingRedemptions.length > 0 && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>⏳ Canjes Pendientes de Cumplimiento ({pendingRedemptions.length}):</Text>
          {pendingRedemptions.map((red) => (
            <View key={red.id} style={styles.pendingRow}>
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingItemTitle}>{red.rewardTitle}</Text>
                <Text style={styles.pendingMeta}>
                  Canjeado por: {red.redeemedBy} • {red.costPoints} pts
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fulfillBtn}
                onPress={() => onFulfill(red.id)}
              >
                <Text style={styles.fulfillBtnText}>✓ Cumplido</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Rewards Catalog */}
      <View style={styles.catalogHeader}>
        <Text style={styles.catalogTitle}>Tienda de Recompensas & Privilegios</Text>
        <TouchableOpacity style={styles.addRewardBtn} onPress={onAddReward}>
          <Text style={styles.addRewardBtnText}>+ Crear Recompensa</Text>
        </TouchableOpacity>
      </View>

      {rewards.length === 0 ? (
        <View style={styles.emptyCatalog}>
          <Text style={styles.emptyShopEmoji}>🎁</Text>
          <Text style={styles.emptyShopTitle}>Catálogo Vacío</Text>
          <Text style={styles.emptyShopSubtitle}>
            Añade premios o privilegios canjeables (ej. masaje de 20 min, día libre de tareas, elección de cena, sesión especial).
          </Text>
        </View>
      ) : (
        <View style={styles.rewardsGrid}>
          {rewards.map((reward) => {
            const canAfford = ledger.currentBalance >= reward.costPoints;

            return (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <View style={styles.costBadge}>
                    <Text style={styles.costText}>{reward.costPoints} pts</Text>
                  </View>
                </View>

                {reward.description ? (
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                ) : null}

                <View style={styles.rewardFooter}>
                  <Text style={styles.redeemedCountText}>Canjeado: {reward.redeemedCount} veces</Text>

                  <View style={styles.rewardActions}>
                    <TouchableOpacity
                      style={[styles.redeemBtn, !canAfford && styles.redeemBtnDisabled]}
                      disabled={!canAfford}
                      onPress={() => onRedeem(reward.id)}
                    >
                      <Text style={[styles.redeemBtnText, !canAfford && styles.redeemBtnTextDisabled]}>
                        {canAfford ? '🪙 Canjear' : 'Puntos insuficientes'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteRewardBtn}
                      onPress={() => onDeleteReward(reward.id)}
                    >
                      <Text style={styles.deleteRewardBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  balanceCard: {
    backgroundColor: '#120b1c',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: spacing.md,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)',
        } as object)
      : {}),
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  coinEmoji: {
    fontSize: 24,
  },
  balanceValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 28,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  ptsUnit: {
    fontSize: fontSize.sm,
    color: '#D4AF37',
    marginTop: 4,
  },
  historyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyBtnText: {
    color: '#F3E8FF',
    fontSize: fontSize.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statText: {
    fontSize: fontSize.xs,
    color: '#888888',
  },
  statVal: {
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  historyBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  historyTitle: {
    fontSize: fontSize.xs,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptyHistory: {
    fontSize: fontSize.xs,
    color: '#666666',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  historyType: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    minWidth: 55,
  },
  historyEarn: {
    color: '#4ADE80',
  },
  historySpend: {
    color: '#F87171',
  },
  historyReason: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    flex: 1,
  },
  pendingCard: {
    backgroundColor: '#1a0d0d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#990000',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pendingTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.sm,
    color: '#FF8888',
    marginBottom: spacing.xs,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.xs,
    borderRadius: 8,
    marginTop: 4,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingItemTitle: {
    fontSize: fontSize.xs,
    color: '#F3E8FF',
    fontWeight: 'bold',
  },
  pendingMeta: {
    fontSize: 10,
    color: '#AAAAAA',
  },
  fulfillBtn: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fulfillBtnText: {
    color: '#07050a',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  catalogTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: '#F3E8FF',
  },
  addRewardBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addRewardBtnText: {
    color: '#D4AF37',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  emptyCatalog: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyShopEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyShopTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
    marginBottom: 4,
  },
  emptyShopSubtitle: {
    fontSize: fontSize.xs,
    color: '#888888',
    textAlign: 'center',
    maxWidth: 280,
  },
  rewardsGrid: {
    gap: spacing.sm,
  },
  rewardCard: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rewardTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
    flex: 1,
  },
  costBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  costText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  rewardDesc: {
    fontSize: fontSize.xs,
    color: '#AAAAAA',
    marginBottom: spacing.sm,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  redeemedCountText: {
    fontSize: 10,
    color: '#666666',
  },
  rewardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  redeemBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  redeemBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  redeemBtnText: {
    color: '#07050a',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  redeemBtnTextDisabled: {
    color: '#666666',
  },
  deleteRewardBtn: {
    padding: 6,
  },
  deleteRewardBtnText: {
    fontSize: 12,
  },
});
