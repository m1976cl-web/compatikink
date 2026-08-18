import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';

interface Props {
  onNext: (profile: any) => void;
}

const ROLES = [
  { id: 'dom', label: 'Dominante / Top', emoji: '👑' },
  { id: 'sub', label: 'Sumiso / Bottom', emoji: '🧎' },
  { id: 'switch', label: 'Switch / Versátil', emoji: '⚡' },
  { id: 'curious', label: 'Curioso / Explorador', emoji: '🔮' },
  { id: 'keyholder', label: 'Keyholder', emoji: '🗝️' },
  { id: 'chastity', label: 'Portador / Chastity', emoji: '🔒' },
];

const INTEREST_TAGS = [
  'Bondage & Shibari',
  'Impacto & Spanking',
  'Sensorial & Cera',
  'Dominación Psicológica',
  'Roleplay',
  'Castidad',
  'Fetichismo Látex',
  'Intimidad Emocional',
];

const PRONOUNS = ['Él', 'Ella', 'Elle', 'Otro'];
const EXPERIENCES = ['Principiante', 'Intermedio', 'Avanzado'];

export function OnboardingStepProfile({ onNext }: Props) {
  const [nickname, setNickname] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPronoun, setSelectedPronoun] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);

  useEffect(() => {
    if (!nickname) {
      const randomNicks = ['Shadow', 'Fox', 'Raven', 'Luna', 'Neo', 'Nova', 'Rex'];
      setNickname(randomNicks[Math.floor(Math.random() * randomNicks.length)] + Math.floor(Math.random() * 1000));
    }
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const canContinue = !!selectedRole;

  const handleContinue = () => {
    onNext({
      nickname,
      role: selectedRole,
      interests: selectedTags,
      pronoun: selectedPronoun,
      experience: selectedExp,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Perfil Inicial 🎭</Text>
      <Text style={styles.subtitle}>
        Personaliza cómo te verán los demás.
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Apodo / Nickname</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Ej: ShadowHunter99"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Rol Principal *</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((r) => {
            const isActive = selectedRole === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleCard, isActive && styles.roleCardActive]}
                onPress={() => setSelectedRole(r.id)}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleLabel, isActive && styles.roleLabelActive]}>{r.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Intereses Rápidos</Text>
        <View style={styles.tagsContainer}>
          {INTEREST_TAGS.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, isActive && styles.tagActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Pronombres</Text>
          <View style={styles.pillContainer}>
            {PRONOUNS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pill, selectedPronoun === p && styles.pillActive]}
                onPress={() => setSelectedPronoun(p)}
              >
                <Text style={[styles.pillText, selectedPronoun === p && styles.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Nivel de Experiencia</Text>
        <View style={styles.pillContainer}>
          {EXPERIENCES.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.pill, selectedExp === e && styles.pillActive]}
              onPress={() => setSelectedExp(e)}
            >
              <Text style={[styles.pillText, selectedExp === e && styles.pillTextActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
        disabled={!canContinue}
        onPress={handleContinue}
      >
        <Text style={styles.continueBtnText}>Guardar Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tagActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  tagTextActive: {
    color: '#000',
    fontFamily: fonts.bodySemi,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  pillTextActive: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: '#000',
  },
});
