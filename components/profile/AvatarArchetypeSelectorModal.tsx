import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  getNoxAvatars,
  getIntimateArchetypes,
  saveUserAvatarSelection,
  getUserAvatarSelection,
  NoxAvatarItem,
  IntimateArchetype,
} from '@/lib/noxAvatars';
import { notify } from '@/lib/notify';
import { colors, fonts, spacing, radii } from '@/constants/theme';
import { Button } from '@/components/Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave?: (avatarId: string, archetypeTitle: string) => void;
}

export function AvatarArchetypeSelectorModal({ visible, onClose, onSave }: Props) {
  const avatars = getNoxAvatars();
  const archetypes = getIntimateArchetypes();

  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(avatars[0].id);
  const [selectedArchetype, setSelectedArchetype] = useState<string>(archetypes[0].name);

  useEffect(() => {
    if (visible) {
      loadSelection();
    }
  }, [visible]);

  const loadSelection = async () => {
    const data = await getUserAvatarSelection();
    setSelectedAvatarId(data.avatarId);
    setSelectedArchetype(data.archetypeTitle);
  };

  const handleSelectAvatar = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAvatarId(id);
  };

  const handleSelectArchetype = (arch: IntimateArchetype) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArchetype(arch.name);
    // Optionally auto-select the recommended avatar
    if (arch.recommendedAvatarId) {
      setSelectedAvatarId(arch.recommendedAvatarId);
    }
  };

  const handleSave = async () => {
    await saveUserAvatarSelection(selectedAvatarId, selectedArchetype);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    notify('Perfil actualizado', 'Tu Avatar y Arquetipo han sido guardados.');
    if (onSave) onSave(selectedAvatarId, selectedArchetype);
    onClose();
  };

  const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId) || avatars[0];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Personaliza tu Perfil</Text>

          <View style={styles.previewContainer}>
            <View
              style={[
                styles.previewAvatarBorder,
                { borderColor: selectedAvatar.glowColor },
              ]}
            >
              <Image source={selectedAvatar.imageSource} style={styles.previewAvatar} />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{selectedAvatar.name}</Text>
              <Text style={styles.previewArchetype}>
                {selectedArchetype} {selectedAvatar.emoji}
              </Text>
              <Text style={styles.previewQuote}>"{selectedAvatar.quote}"</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.sectionTitle}>1. Selecciona tu Avatar Nox</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {avatars.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatarId === av.id && { borderColor: av.glowColor, borderWidth: 2 },
                  ]}
                  onPress={() => handleSelectAvatar(av.id)}
                >
                  <Image source={av.imageSource} style={styles.avatarThumb} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>2. Selecciona tu Arquetipo Íntimo</Text>
            {archetypes.map((arch) => (
              <TouchableOpacity
                key={arch.id}
                style={[
                  styles.archetypeOption,
                  selectedArchetype === arch.name && styles.archetypeOptionSelected,
                ]}
                onPress={() => handleSelectArchetype(arch)}
              >
                <Text style={styles.archetypeTitle}>
                  {arch.emoji} {arch.name}
                </Text>
                <Text style={styles.archetypeDesc}>{arch.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1, marginRight: spacing.sm }} />
            <Button title="Guardar" variant="primary" onPress={handleSave} style={{ flex: 1, marginLeft: spacing.sm }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.backgroundMid,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.md,
    maxHeight: '90%',
  },
  title: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  previewAvatarBorder: {
    borderWidth: 3,
    borderRadius: 50,
    padding: 2,
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  previewInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  previewName: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
  previewArchetype: {
    color: colors.primary,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginTop: 2,
  },
  previewQuote: {
    color: colors.textDim,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 4,
  },
  scrollArea: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  horizontalScroll: {
    marginBottom: spacing.md,
  },
  avatarOption: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },
  archetypeOption: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  archetypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  archetypeTitle: {
    color: colors.primaryLight,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  archetypeDesc: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
