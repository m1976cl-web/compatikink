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
import { colors, fontSize, spacing } from '@/constants/theme';
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
        '¡Perfil Creado! 🎉',
        `Bienvenido/a, ${cleanNick}. Tu perfil personal ha sido creado y protegido con tu PIN.`
      );

      // Reset form
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
        <View style={styles.card}>
          <Text style={styles.headerEmoji}>👤</Text>
          <Text style={styles.title}>Crear Perfil Personal</Text>
          <Text style={styles.subtitle}>
            Registra tu cuenta con tu Nombre y un PIN de 4 dígitos para proteger tus respuestas y sesiones.
          </Text>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Tu Nick o Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Alex"
              placeholderTextColor={colors.textMuted}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
            />

            <Text style={styles.fieldLabel}>PIN de Seguridad (4 dígitos) *</Text>
            <TextInput
              style={[styles.input, styles.pinInput]}
              placeholder="1234"
              placeholderTextColor={colors.textMuted}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
            />

            <Text style={styles.fieldLabel}>Pronombres (opcional)</Text>
            <PronounsPicker value={pronouns} onChange={setPronouns} />

            <Text style={styles.fieldLabel}>Nivel de Experiencia en Kink</Text>
            <ExperiencePicker value={experienceLevel} onChange={setExperienceLevel} />
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creando...' : 'Crear mi Perfil Personal 🔐'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.neonPurple,
    fontSize: fontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  formGroup: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: fontSize.md,
  },
  pinInput: {
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: fontSize.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
});
