import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { useDsTaskStore } from '@/stores/dsTaskStore';
import { DsTaskCard } from '@/components/dsTasks/DsTaskCard';
import { DsHabitTracker } from '@/components/dsTasks/DsHabitTracker';
import { DsRewardShop } from '@/components/dsTasks/DsRewardShop';
import { DsDuressSafetyNotice } from '@/components/dsTasks/DsDuressSafetyNotice';
import { DsRoleType, DsTaskCategory, DsRecurrence } from '@/types';
import { useHomeStore } from '@/stores/homeStore';

import { RouteFeatureGuard } from '@/components/RouteFeatureGuard';

function DsTasksScreenContent() {
  const router = useRouter();
  const currentProfile = useHomeStore((s) => s.profile);
  const userNickname = currentProfile?.nickname || 'Usuario';

  const {
    tasks,
    habits,
    rewards,
    redemptions,
    ledger,
    activeRole,
    isLoading,
    error,
    loadAll,
    setActiveRole,
    addTask,
    updateTaskStatus,
    deleteTask,
    addHabit,
    completeHabit,
    deleteHabit,
    addReward,
    deleteReward,
    redeemReward,
    fulfillRedemption,
  } = useDsTaskStore();

  const [activeTab, setActiveTab] = useState<'tasks' | 'habits' | 'shop'>('tasks');

  // Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // Form States - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState<DsTaskCategory>('service');
  const [taskPoints, setTaskPoints] = useState('20');
  const [taskRecurrence, setTaskRecurrence] = useState<DsRecurrence>('once');

  // Form States - Habit
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitCategory, setHabitCategory] = useState<DsTaskCategory>('wellness');
  const [habitPoints, setHabitPoints] = useState('10');
  const [habitTargetStreak, setHabitTargetStreak] = useState('7');

  // Form States - Reward
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardCost, setRewardCost] = useState('50');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Create Task Handler
  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    const pts = parseInt(taskPoints, 10) || 10;
    await addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      category: taskCategory,
      assignerRole: activeRole === 'dom' ? 'dom' : 'sub',
      assignedToRole: activeRole === 'dom' ? 'sub' : 'dom',
      pointsValue: pts,
      recurrence: taskRecurrence,
    });
    setTaskTitle('');
    setTaskDesc('');
    setShowTaskModal(false);
  };

  // Create Habit Handler
  const handleCreateHabit = async () => {
    if (!habitTitle.trim()) return;
    const pts = parseInt(habitPoints, 10) || 10;
    const target = parseInt(habitTargetStreak, 10) || 7;
    await addHabit({
      title: habitTitle.trim(),
      description: habitDesc.trim() || undefined,
      category: habitCategory,
      frequency: 'daily',
      targetStreak: target,
      pointsPerCompletion: pts,
      streakMultiplierEnabled: true,
    });
    setHabitTitle('');
    setHabitDesc('');
    setShowHabitModal(false);
  };

  // Create Reward Handler
  const handleCreateReward = async () => {
    if (!rewardTitle.trim()) return;
    const cost = parseInt(rewardCost, 10) || 50;
    await addReward({
      title: rewardTitle.trim(),
      description: rewardDesc.trim() || undefined,
      costPoints: cost,
    });
    setRewardTitle('');
    setRewardDesc('');
    setShowRewardModal(false);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tareas D/s & Hábitos con Recompensas</Text>
          <Text style={styles.subtitle}>
            Bóveda ZK AES-256 • Protocolos de poder, seguimiento de hábitos y tienda de tributos
          </Text>
        </View>

        {/* Safety & Duress Banner */}
        <DsDuressSafetyNotice />

        {/* Role Picker Bar */}
        <View style={styles.roleBar}>
          <Text style={styles.roleLabel}>Modo de Vista:</Text>
          <View style={styles.roleTabs}>
            {(['sub', 'dom', 'self'] as DsRoleType[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleTabBtn, activeRole === r && styles.roleTabBtnActive]}
                onPress={() => setActiveRole(r)}
              >
                <Text style={[styles.roleTabText, activeRole === r && styles.roleTabTextActive]}>
                  {r === 'sub' ? '🙇 Submisivo/a' : r === 'dom' ? '👑 Dominante' : '⚡ Auto-Protocolo'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              📋 Tareas ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'habits' && styles.tabBtnActive]}
            onPress={() => setActiveTab('habits')}
          >
            <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>
              🔥 Hábitos ({habits.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'shop' && styles.tabBtnActive]}
            onPress={() => setActiveTab('shop')}
          >
            <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>
              🪙 Tienda ({ledger.currentBalance} pts)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'tasks' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Listado de Tareas & Órdenes</Text>
                <TouchableOpacity
                  style={styles.addBtnPrimary}
                  onPress={() => setShowTaskModal(true)}
                >
                  <Text style={styles.addBtnPrimaryText}>+ Asignar Tarea</Text>
                </TouchableOpacity>
              </View>

              {tasks.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📜</Text>
                  <Text style={styles.emptyTitle}>Sin Tareas Pendientes</Text>
                  <Text style={styles.emptySubtitle}>
                    Asigna una tarea u orden con asignación de puntos para comenzar tu protocolo.
                  </Text>
                </View>
              ) : (
                tasks.map((t) => (
                  <DsTaskCard
                    key={t.id}
                    task={t}
                    activeRole={activeRole}
                    onUpdateStatus={updateTaskStatus}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </View>
          )}

          {activeTab === 'habits' && (
            <DsHabitTracker
              habits={habits}
              onCompleteHabit={completeHabit}
              onAddHabit={() => setShowHabitModal(true)}
              onDeleteHabit={deleteHabit}
            />
          )}

          {activeTab === 'shop' && (
            <DsRewardShop
              rewards={rewards}
              redemptions={redemptions}
              ledger={ledger}
              userNickname={userNickname}
              onRedeem={(rId) => redeemReward(rId, userNickname)}
              onFulfill={fulfillRedemption}
              onAddReward={() => setShowRewardModal(true)}
              onDeleteReward={deleteReward}
            />
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Modal: New Task */}
        <Modal visible={showTaskModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nueva Tarea / Orden D/s</Text>

              <Text style={styles.label}>Título de la tarea:</Text>
              <TextInput
                style={styles.input}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Ej. Postura correcta durante 30 min, reporte nocturno"
                placeholderTextColor="#666666"
              />

              <Text style={styles.label}>Descripción / Instrucciones:</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={taskDesc}
                onChangeText={setTaskDesc}
                placeholder="Detalles del protocolo, límite de tiempo o condiciones..."
                placeholderTextColor="#666666"
                multiline
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Puntos al verificar:</Text>
                  <TextInput
                    style={styles.input}
                    value={taskPoints}
                    onChangeText={setTaskPoints}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Recurrencia:</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() =>
                      setTaskRecurrence(
                        taskRecurrence === 'once'
                          ? 'daily'
                          : taskRecurrence === 'daily'
                          ? 'weekly'
                          : 'once'
                      )
                    }
                  >
                    <Text style={styles.selectBtnText}>
                      {taskRecurrence === 'once' ? 'Una vez' : taskRecurrence === 'daily' ? 'Diaria' : 'Semanal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowTaskModal(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleCreateTask}>
                  <Text style={styles.modalSaveText}>Guardar Tarea</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: New Habit */}
        <Modal visible={showHabitModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nuevo Hábito D/s</Text>

              <Text style={styles.label}>Título del hábito:</Text>
              <TextInput
                style={styles.input}
                value={habitTitle}
                onChangeText={setHabitTitle}
                placeholder="Ej. Hidratación 2L, Ejercicios Kegel, Diario"
                placeholderTextColor="#666666"
              />

              <Text style={styles.label}>Descripción:</Text>
              <TextInput
                style={styles.input}
                value={habitDesc}
                onChangeText={setHabitDesc}
                placeholder="Meta o condición diaria..."
                placeholderTextColor="#666666"
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Puntos/día:</Text>
                  <TextInput
                    style={styles.input}
                    value={habitPoints}
                    onChangeText={setHabitPoints}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Meta racha (días):</Text>
                  <TextInput
                    style={styles.input}
                    value={habitTargetStreak}
                    onChangeText={setHabitTargetStreak}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowHabitModal(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleCreateHabit}>
                  <Text style={styles.modalSaveText}>Guardar Hábito</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: New Reward */}
        <Modal visible={showRewardModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nueva Recompensa / Privilegio</Text>

              <Text style={styles.label}>Título del premio:</Text>
              <TextInput
                style={styles.input}
                value={rewardTitle}
                onChangeText={setRewardTitle}
                placeholder="Ej. Masaje de pies 20 min, elección de película"
                placeholderTextColor="#666666"
              />

              <Text style={styles.label}>Descripción:</Text>
              <TextInput
                style={styles.input}
                value={rewardDesc}
                onChangeText={setRewardDesc}
                placeholder="Detalles de la recompensa..."
                placeholderTextColor="#666666"
              />

              <Text style={styles.label}>Costo en Puntos (pts):</Text>
              <TextInput
                style={styles.input}
                value={rewardCost}
                onChangeText={setRewardCost}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRewardModal(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={handleCreateReward}>
                  <Text style={styles.modalSaveText}>Guardar Recompensa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 4,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backBtnText: {
    color: '#D4AF37',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: fonts.displaySemi,
    color: '#F3E8FF',
    fontSize: fontSize.xxl,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    marginBottom: spacing.xs,
  },
  roleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#120b1c',
    borderRadius: 12,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: spacing.md,
  },
  roleLabel: {
    fontSize: fontSize.xs,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  roleTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleTabBtnActive: {
    backgroundColor: '#D4AF37',
  },
  roleTabText: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
  },
  roleTabTextActive: {
    color: '#07050a',
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#F87171',
    fontSize: fontSize.xs,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#120b1c',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  tabText: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#07050a',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: '#F3E8FF',
  },
  addBtnPrimary: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnPrimaryText: {
    color: '#07050a',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: '#F3E8FF',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: fontSize.xs,
    color: '#888888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: '#120b1c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
  },
  modalTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: '#D4AF37',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#07050a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#352054',
    color: '#F3E8FF',
    padding: spacing.xs,
    fontSize: fontSize.xs,
    marginBottom: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectBtn: {
    backgroundColor: '#07050a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#352054',
    padding: spacing.xs,
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#D4AF37',
    fontSize: fontSize.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#888888',
    fontSize: fontSize.xs,
  },
  modalSave: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#07050a',
    fontWeight: 'bold',
    fontSize: fontSize.xs,
  },
});

export default function DsTasksScreen() {
  return (
    <RouteFeatureGuard route="/ds-tasks" title="Tareas D/s & Recompensas">
      <DsTasksScreenContent />
    </RouteFeatureGuard>
  );
}
