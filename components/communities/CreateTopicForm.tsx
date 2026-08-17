import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, fontSize, spacing, fonts, radii } from '@/constants/theme';

interface Props {
  onSubmit: (title: string, content: string, tags?: string[]) => Promise<void>;
  onCancel: () => void;
}

export function CreateTopicForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Campos incompletos', 'Por favor ingresa un título y contenido para el debate.');
      return;
    }

    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await onSubmit(title.trim(), content.trim(), tagsArr.length > 0 ? tagsArr : undefined);
      setTitle('');
      setContent('');
      setTags('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.createTopicForm}>
      <View style={styles.formHeader}>
        <Text style={styles.createFormTitle}>✍️ Iniciar Nuevo Tema de Discusión</Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.formInput}
        placeholder="Título del debate o pregunta clara..."
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.formInput, { minHeight: 90, textAlignVertical: 'top' }]}
        multiline
        placeholder="Escribe el contexto, tu duda o experiencia para la comunidad..."
        placeholderTextColor={colors.textMuted}
        value={content}
        onChangeText={setContent}
      />

      <TextInput
        style={styles.formInput}
        placeholder="Etiquetas separadas por comas (ej. Seguridad, Yute, Cuidados)..."
        placeholderTextColor={colors.textMuted}
        value={tags}
        onChangeText={setTags}
      />

      <TouchableOpacity
        style={[styles.publishTopicBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.publishTopicBtnText}>
          {submitting ? 'Publicando...' : 'Publicar Debate en el Foro 🚀'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createTopicForm: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createFormTitle: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  cancelBtn: { padding: 4 },
  cancelBtnText: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.bodyBold },
  formInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.text,
    fontSize: fontSize.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  publishTopicBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  publishTopicBtnText: { color: '#000', fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
});
