import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { KinkDiploma } from '@/lib/partnerJournal';

interface DiplomaModalProps {
  visible: boolean;
  diploma: KinkDiploma | null;
  onClose: () => void;
}

export function DiplomaModal({ visible, diploma, onClose }: DiplomaModalProps) {
  if (!diploma) return null;

  const handlePrintOrShare = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Alert.alert('Certificado Cifrado 📜', `Diploma emitido a favor de "${diploma.recipientName}".`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Certificate Frame */}
          <View style={styles.certificateBorder}>
            <View style={styles.certificateInner}>
              <Text style={styles.sealEmoji}>{diploma.sealEmoji || '📜'}</Text>
              
              <Text style={styles.issuerHeader}>{diploma.issuerName.toUpperCase()}</Text>
              <Text style={styles.certLabel}>CERTIFICADO & DIPLOMA OFICIAL</Text>

              <View style={styles.goldDivider} />

              <Text style={styles.certBodyText}>Se otorga el presente reconocimiento a:</Text>
              <Text style={styles.recipientName}>{diploma.recipientName}</Text>

              <Text style={styles.certTitle}>{diploma.title}</Text>
              <Text style={styles.categoryBadge}>Categoría: {diploma.practiceCategory}</Text>

              <Text style={styles.description}>{diploma.description}</Text>

              <View style={styles.goldDivider} />

              <View style={styles.footerRow}>
                <View style={styles.footerCol}>
                  <Text style={styles.footerLabel}>FECHA DE EMISIÓN</Text>
                  <Text style={styles.footerValue}>{new Date(diploma.issueDate).toLocaleDateString()}</Text>
                </View>

                <View style={styles.badgeStamp}>
                  <Text style={styles.stampText}>VERIFICADO ZERO-KNOWLEDGE</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrintOrShare}>
              <Text style={styles.printBtnText}>🖨️ Imprimir / Guardar PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 10, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#0a0612',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#fbbf24',
    gap: spacing.md,
  },
  certificateBorder: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: radii.lg,
    padding: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
  },
  certificateInner: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(21, 13, 36, 0.95)',
  },
  sealEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  issuerHeader: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: '#fbbf24',
    letterSpacing: 3,
    fontWeight: '900',
  },
  certLabel: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  goldDivider: {
    height: 1.5,
    backgroundColor: '#fbbf24',
    width: '80%',
    marginVertical: spacing.xs,
    opacity: 0.6,
  },
  certBodyText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  recipientName: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: '#ffffff',
    marginVertical: 2,
    letterSpacing: 1,
  },
  certTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md + 2,
    color: '#fbbf24',
    textAlign: 'center',
    lineHeight: 22,
  },
  categoryBadge: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginTop: 2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 440,
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
  },
  footerCol: {
    gap: 2,
  },
  footerLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 1,
  },
  footerValue: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  badgeStamp: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  stampText: {
    fontSize: 8,
    fontFamily: fonts.bodySemi,
    color: '#fbbf24',
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  printBtn: {
    flex: 2,
    backgroundColor: '#fbbf24',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  printBtnText: {
    fontFamily: fonts.bodySemi,
    color: '#07050a',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  closeBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
