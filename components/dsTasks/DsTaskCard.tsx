import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { DsTask, DsTaskStatus, DsRoleType } from '@/types';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface Props {
  task: DsTask;
  activeRole: DsRoleType;
  onUpdateStatus: (taskId: string, status: DsTaskStatus, proofNote?: string, rejectedReason?: string) => void;
  onDelete: (taskId: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  service: { label: 'Servicio', emoji: '🧹' },
  wellness: { label: 'Bienestar', emoji: '💧' },
  obedience: { label: 'Obediencia', emoji: '🙇' },
  protocol: { label: 'Protocolo', emoji: '📜' },
  intimacy: { label: 'Intimidad', emoji: '💋' },
  custom: { label: 'Personalizado', emoji: '✨' },
};

const STATUS_BADGES: Record<DsTaskStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' },
  submitted: { label: 'Enviada', bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8' },
  verified: { label: 'Verificada', bg: 'rgba(74, 222, 128, 0.15)', text: '#4ADE80' },
  rejected: { label: 'Rechazada', bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171' },
};

export function DsTaskCard({ task, activeRole, onUpdateStatus, onDelete }: Props) {
  const [proofNote, setProofNote] = useState(task.proofNote || '');
  const [rejectedReason, setRejectedReason] = useState(task.rejectedReason || '');
  const [showProofForm, setShowProofForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const categoryInfo = CATEGORY_LABELS[task.category] || { label: task.category, emoji: '📌' };
  const statusInfo = STATUS_BADGES[task.status];

  // Overdue check
  const isOverdue = task.dueDate && task.status === 'pending' && new Date(task.dueDate).getTime() < Date.now();

  const handleSubSubmit = () => {
    onUpdateStatus(task.id, 'submitted', proofNote);
    setShowProofForm(false);
  };

  const handleDomVerify = () => {
    onUpdateStatus(task.id, 'verified');
  };

  const handleDomReject = () => {
    onUpdateStatus(task.id, 'rejected', undefined, rejectedReason || 'Requiere corrección');
    setShowRejectForm(false);
  };

  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
          <Text style={styles.categoryText}>{categoryInfo.label}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>+{task.pointsValue} pts</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
          </View>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>{task.title}</Text>
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

      {/* Meta Row: Deadline & Recurrence */}
      <View style={styles.metaRow}>
        {task.dueDate && (
          <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
            {isOverdue ? '⚠️ Vencida: ' : '⏱️ Vence: '}
            {new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </Text>
        )}
        <Text style={styles.metaText}>
          🔁 {task.recurrence === 'once' ? 'Una vez' : task.recurrence === 'daily' ? 'Diaria' : 'Semanal'}
        </Text>
      </View>

      {/* Proof Note Display */}
      {task.proofNote ? (
        <View style={styles.proofBox}>
          <Text style={styles.proofLabel}>Notas de entrega:</Text>
          <Text style={styles.proofText}>{task.proofNote}</Text>
        </View>
      ) : null}

      {/* Rejected Reason Display */}
      {task.status === 'rejected' && task.rejectedReason ? (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectLabel}>Motivo de rechazo:</Text>
          <Text style={styles.rejectText}>{task.rejectedReason}</Text>
        </View>
      ) : null}

      {/* Action Forms */}
      {showProofForm && (
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>Enviar nota de cumplimiento:</Text>
          <TextInput
            style={styles.textInput}
            value={proofNote}
            onChangeText={setProofNote}
            placeholder="Escribe detalles o notas sobre tu entrega..."
            placeholderTextColor="#666666"
            multiline
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProofForm(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubSubmit}>
              <Text style={styles.submitBtnText}>Enviar Entrega</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showRejectForm && (
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>Indica el motivo de rechazo:</Text>
          <TextInput
            style={styles.textInput}
            value={rejectedReason}
            onChangeText={setRejectedReason}
            placeholder="Razón del rechazo o corrección requerida..."
            placeholderTextColor="#666666"
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRejectForm(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectSubmitBtn} onPress={handleDomReject}>
              <Text style={styles.rejectBtnText}>Confirmar Rechazo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        {/* Role: Sub / Self - Mark as submitted */}
        {task.status === 'pending' && (
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => setShowProofForm(true)}
          >
            <Text style={styles.actionBtnPrimaryText}>Mark Completed / Submit</Text>
          </TouchableOpacity>
        )}

        {/* Role: Dom / Self - Verify or Reject */}
        {task.status === 'submitted' && (
          <View style={styles.domActionGroup}>
            <TouchableOpacity style={styles.verifyBtn} onPress={handleDomVerify}>
              <Text style={styles.verifyBtnText}>✓ Aprobar (+{task.pointsValue} pts)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowRejectForm(true)}>
              <Text style={styles.rejectBtnText}>✗ Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Self check-off directly */}
        {activeRole === 'self' && task.status === 'pending' && (
          <TouchableOpacity style={styles.verifyBtn} onPress={handleDomVerify}>
            <Text style={styles.verifyBtnText}>✓ Completar Tarea</Text>
          </TouchableOpacity>
        )}

        {/* Delete button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task.id)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0d0814',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing.md,
    marginBottom: spacing.md,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        } as object)
      : {}),
  },
  cardOverdue: {
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: '#CCCCCC',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: '#F3E8FF',
    marginBottom: 4,
  },
  description: {
    fontSize: fontSize.sm,
    color: '#AAAAAA',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: '#888888',
  },
  overdueText: {
    color: '#F87171',
    fontWeight: 'bold',
  },
  proofBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    padding: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: 4,
  },
  proofLabel: {
    fontSize: fontSize.xs,
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  proofText: {
    fontSize: fontSize.xs,
    color: '#DDDDDD',
  },
  rejectBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#F87171',
    padding: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: 4,
  },
  rejectLabel: {
    fontSize: fontSize.xs,
    color: '#F87171',
    fontWeight: 'bold',
  },
  rejectText: {
    fontSize: fontSize.xs,
    color: '#DDDDDD',
  },
  formBox: {
    backgroundColor: '#160d24',
    borderRadius: 8,
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  formTitle: {
    fontSize: fontSize.xs,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#07050a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#352054',
    color: '#F3E8FF',
    padding: spacing.xs,
    fontSize: fontSize.xs,
    minHeight: 40,
    marginBottom: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#888888',
    fontSize: fontSize.xs,
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitBtnText: {
    color: '#07050a',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  rejectSubmitBtn: {
    backgroundColor: '#990000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtnPrimary: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    color: '#07050a',
    fontWeight: 'bold',
    fontSize: fontSize.xs,
  },
  domActionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyBtn: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verifyBtnText: {
    color: '#07050a',
    fontWeight: 'bold',
    fontSize: fontSize.xs,
  },
  rejectBtn: {
    backgroundColor: 'rgba(153, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: '#990000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectBtnText: {
    color: '#FF8888',
    fontWeight: 'bold',
    fontSize: fontSize.xs,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 'auto',
  },
  deleteBtnText: {
    fontSize: 14,
  },
});
