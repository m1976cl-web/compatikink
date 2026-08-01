import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing, typography } from '@/constants/theme';
import { UserProfile, ExperienceLevel } from '@/types';
import { registerProfile, getProfile } from '@/lib/storage';
import { PronounsPicker } from '@/components/PronounsPicker';
import { ExperiencePicker } from '@/components/ExperiencePicker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export function RegisterProfileModal({ visible, onClose, onSuccess }: Props) {
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanNick = nickname.trim();
    if (!cleanNick) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nick o nombre.');
      return;
    }
    if (!pin || pin.length < 4) {
      Alert.alert('PIN requerido', 'Ingresa un PIN de seguridad de al menos 4 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const existing = await getProfile(cleanNick);
      if (existing) {
        Alert.alert(
          'Perfil ya existe',
          `El nombre "${cleanNick}" ya está registrado en este dispositivo. Por favor selecciona tu perfil e ingresa tu PIN.`
        );
        setLoading(false);
        return;
      }

      const newProfile: UserProfile = {
        nickname: cleanNick,
        pin: pin.trim(),
        pronouns: pronouns || undefined,
        experienceLevel,
        baseResponses: [],
        createdSessionIds: [],
        receivedSessionIds: [],
      };

      const created = await registerProfile(newProfile);
      Alert.alert(
        'Perfil creado',
        `Bienvenido/a, ${cleanNick}. Tu perfil está protegido con tu PIN.`
      );

      setNickname('');
      setPin('');
      setPronouns('');
      setExperienceLevel(undefined);

      onSuccess(created);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo crear el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.brand}>Compatikink</Text>
          <Text style={styles.title}>Crear perfil</Text>
          <Text style={styles.subtitle}>
            Registra tu nombre y un PIN de al menos 4 dígitos para proteger respuestas y sesiones
            en este dispositivo.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Nick o nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Alex"
              placeholderTextColor={colors.textDim}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
            />

            <Text style={styles.fieldLabel}>PIN de seguridad</Text>
            <TextInput
              style={[styles.input, styles.pinInput]}
              placeholder="••••"
              placeholderTextColor={colors.textDim}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
            />

            <Text style={styles.fieldLabel}>Pronombres (opcional)</Text>
            <PronounsPicker value={pronouns} onChange={setPronouns} />

            <Text style={styles.fieldLabel}>Nivel de experiencia</Text>
            <ExperiencePicker value={experienceLevel} onChange={setExperienceLevel} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creando…' : 'Crear perfil'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 9, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: fontSize.lg,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMuted,
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  formGroup: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.label,
  },
  input: {
    backgroundColor: colors.backgroundMid,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  pinInput: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  submitBtnText: {
    fontFamily: fonts.bodySemi,
    color: colors.onPrimary,
    fontSize: fontSize.md,
    letterSpacing: 0.3,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
  },
  closeBtnText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
