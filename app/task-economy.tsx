import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, fonts, radii, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useResponsive } from '@/hooks/useResponsive';
import {
  getTasks,
  saveTasks,
  getCoins,
  addCoins,
  spendCoins,
  getStreakData,
  recordTaskCompletion,
  getDefaultRewards,
  DSTask,
  Reward,
  StreakData,
} from '@/lib/taskEconomy';

export default function TaskEconomyScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const [tasks, setTasks] = useState<DSTask[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActivityDate: '', totalTasksCompleted: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTasks = await getTasks();
    const loadedCoins = await getCoins();
    const loadedStreak = await getStreakData();
    setTasks(loadedTasks);
    setCoins(loadedCoins);
    setStreak(loadedStreak);
    setRewards(getDefaultRewards());
  };

  const handleToggleTask = async (task: DSTask) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        const nextState = !t.completed;
        return { ...t, completed: nextState, completedAt: nextState ? new Date().toISOString() : undefined };
      }
      return t;
    });

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);

    if (!task.completed) {
      const newCoins = await addCoins(task.pointValue);
      const newStreak = await recordTaskCompletion();
      setCoins(newCoins);
      setStreak(newStreak);
      Alert.alert(
        '¡Tarea Completada! 🎉',
        `Has ganado +${task.pointValue} Kink Coins 🪙. Tu racha actual es de ${newStreak.currentStreak} días seguidos 🔥.`
      );
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (coins < reward.cost) {
      Alert.alert('Saldo Insuficiente 🪙', `Necesitas ${reward.cost} Kink Coins. Tienes ${coins} Coins. ¡Completa más tareas para acumular!`);
      return;
    }

    Alert.alert(
      `Canjear "${reward.title}" 🎁`,
      `¿Deseas gastar ${reward.cost} Kink Coins para desbloquear esta recompensa?`,
      [
        {
          text: 'Confirmar Canje ✅',
          onPress: async () => {
            const newCoins = await spendCoins(reward.cost);
            setCoins(newCoins);
            setRewards(rewards.map((r) => (r.id === reward.id ? { ...r, redeemed: true } : r)));
            Alert.alert('¡Recompensa Canjeada! 🎁', `Has canjeado "${reward.title}". Tu pareja ha sido notificada para cumplir el acuerdo.`);
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Economía D/s & Tareas Gamificadas</Text>
          <Text style={styles.subtitle}>
            Completa protocolos y tareas diarias para ganar Kink Coins y canjearlos por recompensas negociadas
          </Text>
        </View>

        {/* Top Balance Banner */}
        <View style={styles.balanceBanner}>
          <View style={styles.balanceCol}>
            <Text style={styles.balanceLabel}>SALDO ACTUAL</Text>
            <Text style={styles.balanceValue}>🪙 {coins} Coins</Text>
          </View>
          <View style={styles.streakCol}>
            <Text style={styles.balanceLabel}>RACHA D/s</Text>
            <Text style={styles.streakValue}>🔥 {streak.currentStreak} días</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'tasks' && styles.tabBtnTextActive]}>
              📋 Tareas & Protocolos ({tasks.filter((t) => !t.completed).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'rewards' && styles.tabBtnActive]}
            onPress={() => setActiveTab('rewards')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'rewards' && styles.tabBtnTextActive]}>
              🎁 Tienda de Recompensas ({rewards.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'tasks' ? (
            /* Tasks List */
            <View style={{ gap: spacing.md }}>
              {tasks.map((task) => (
                <View key={task.id} style={[styles.card, task.completed && styles.cardCompleted]}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 32 }}>{task.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.freqBadge}>{task.frequency.toUpperCase()}</Text>
                        {task.requiresPhoto ? <Text style={styles.photoBadge}>📸 REQUIERE FOTO</Text> : null}
                      </View>
                      <Text style={styles.cardTitle}>{task.title}</Text>
                    </View>
                    <Text style={styles.coinValue}>+{task.pointValue} 🪙</Text>
                  </View>

                  <Text style={styles.cardDesc}>{task.description}</Text>

                  <TouchableOpacity
                    style={[styles.checkBtn, task.completed && styles.checkBtnDone]}
                    onPress={() => handleToggleTask(task)}
                  >
                    <Text style={[styles.checkBtnText, task.completed && { color: colors.success }]}>
                      {task.completed ? '✓ Tarea Completada (+Coins Ganados)' : 'Marcar como Completada ✅'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            /* Rewards Shop */
            <View style={{ gap: spacing.md }}>
              {rewards.map((reward) => (
                <View key={reward.id} style={[styles.card, reward.redeemed && styles.cardCompleted]}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 32 }}>{reward.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{reward.title}</Text>
                      <Text style={styles.cardDesc}>{reward.description}</Text>
                    </View>
                    <Text style={styles.costValue}>{reward.cost} 🪙</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.redeemBtn, reward.redeemed && styles.checkBtnDone]}
                    onPress={() => handleRedeemReward(reward)}
                    disabled={reward.redeemed}
                  >
                    <Text style={[styles.redeemBtnText, reward.redeemed && { color: colors.success }]}>
                      {reward.redeemed ? '✓ Recompensa Solicitada' : 'Canjear Recompensa 🎁'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  balanceBanner: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  balanceCol: { flex: 1, gap: 2 },
  streakCol: { flex: 1, gap: 2, alignItems: 'flex-end' },
  balanceLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  balanceValue: { color: colors.warning, fontSize: fontSize.md, fontWeight: '900' },
  streakValue: { color: colors.accent, fontSize: fontSize.md, fontWeight: '900' },

  tabRow: { flexDirection: 'row', gap: 6, marginVertical: spacing.xs },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.md, backgroundColor: colors.surfaceLight, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabBtnText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '800' },
  tabBtnTextActive: { color: '#fff' },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    gap: spacing.md,
  },
  cardCompleted: { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.05)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  freqBadge: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  photoBadge: { color: colors.warning, fontSize: 10, fontWeight: '900' },
  cardTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  coinValue: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '900' },
  costValue: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '900' },

  cardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  checkBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  checkBtnDone: { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderWidth: 1, borderColor: colors.success },
  checkBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  redeemBtn: { backgroundColor: colors.warning, paddingVertical: spacing.md, borderRadius: radii.lg, alignItems: 'center' },
  redeemBtnText: { color: '#000', fontSize: fontSize.xs, fontWeight: '900' },
});
