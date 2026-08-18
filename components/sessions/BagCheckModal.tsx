import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { SessionGearItem } from '@/lib/privateSessions';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';

interface BagCheckModalProps {
  visible: boolean;
  onClose: () => void;
  gearList: SessionGearItem[];
  onToggleItem: (id: string, packedIn: boolean) => void;
  prePhotoUri?: string;
  postPhotoUri?: string;
  onSelectPhoto: (type: 'pre' | 'post', uri: string) => void;
}

export const BagCheckModal: React.FC<BagCheckModalProps> = ({
  visible,
  onClose,
  gearList,
  onToggleItem,
  prePhotoUri,
  postPhotoUri,
  onSelectPhoto
}) => {
  const unverifiedCount = gearList.filter(g => !g.packedIn).length;

  // Sample presetted images for demo
  const samplePre = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400";
  const samplePost = "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?auto=format&fit=crop&q=80&w=400";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎒 Bag Check (Pre/Post)</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: fontSize.xl, color: colors.text }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.photoComparator}>
            <View style={styles.photoBox}>
              <Text style={styles.photoLabel}>Foto de Salida</Text>
              {prePhotoUri ? (
                <Image source={{ uri: prePhotoUri }} style={styles.photo} />
              ) : (
                <TouchableOpacity style={styles.photoPlaceholder} onPress={() => onSelectPhoto('pre', samplePre)}>
                  <Text style={{ fontSize: 32, color: colors.textMuted }}>📷</Text>
                  <Text style={styles.placeholderText}>Añadir (Sample)</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.photoBox}>
              <Text style={styles.photoLabel}>Foto de Regreso</Text>
              {postPhotoUri ? (
                <Image source={{ uri: postPhotoUri }} style={styles.photo} />
              ) : (
                <TouchableOpacity style={styles.photoPlaceholder} onPress={() => onSelectPhoto('post', samplePost)}>
                  <Text style={{ fontSize: 32, color: colors.textMuted }}>📸</Text>
                  <Text style={styles.placeholderText}>Añadir (Sample)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {unverifiedCount > 0 ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ Tienes {unverifiedCount} ítem{unverifiedCount !== 1 && 's'} sin verificar antes de irte.
              </Text>
            </View>
          ) : (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>🎒 Todo verificado. ¡Listo!</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Checklist de Equipamiento</Text>
          {gearList.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.gearItem, item.packedIn && styles.gearItemVerified]} 
              onPress={() => onToggleItem(item.id, !item.packedIn)}
              activeOpacity={0.7}
            >
              <View style={styles.gearInfo}>
                <Text style={[styles.gearName, item.packedIn && styles.textVerified]}>{item.name}</Text>
                <Text style={styles.gearCategory}>{item.category}</Text>
              </View>
              <View style={styles.checkbox}>
                {item.packedIn && <Text style={{ fontSize: fontSize.sm, color: colors.background, fontWeight: 'bold' }}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}

          {gearList.length === 0 && (
            <Text style={styles.emptyText}>No hay equipamiento registrado en esta sesión.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  photoComparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  photoBox: {
    width: '48%',
  },
  photoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    color: '#856404',
    marginLeft: spacing.sm,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  successText: {
    color: '#155724',
    marginLeft: spacing.sm,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  gearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gearItemVerified: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  gearInfo: {
    flex: 1,
  },
  gearName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  textVerified: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  gearCategory: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  }
});
