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
  loadCustomSceneTemplates,
  saveCustomSceneTemplate,
  deleteCustomSceneTemplate,
  SceneTemplate,
} from '@/lib/sceneTemplateManager';
import { SceneTemplateCard } from '@/components/scene-builder/SceneTemplateCard';
import { SceneTemplateEditorModal } from '@/components/scene-builder/SceneTemplateEditorModal';
import { SceneTemplatePlayerModal } from '@/components/scene-builder/SceneTemplatePlayerModal';

export default function SceneBuilderScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const [templates, setTemplates] = useState<SceneTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [activePlayerTemplate, setActivePlayerTemplate] = useState<SceneTemplate | null>(null);

  useEffect(() => {
    loadCustomSceneTemplates().then(setTemplates);
  }, []);

  const handleSaveTemplate = async (template: SceneTemplate) => {
    const updated = await saveCustomSceneTemplate(template);
    setTemplates(updated);
    Alert.alert('¡Plantilla Guardada! 💾', 'La plantilla de escena se ha cifrado en tu bóveda local.');
  };

  const handleDeleteTemplate = async (id: string) => {
    const updated = await deleteCustomSceneTemplate(id);
    setTemplates(updated);
  };

  return (
    <ScreenContainer title="" hideHeader>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scene Template Builder 🎬</Text>
          <Text style={styles.subtitle}>
            Diseña, personaliza y ejecuta secuencias de escena presenciales con temporizadores y check-ins de seguridad
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowEditor(true)} activeOpacity={0.85}>
          <Text style={styles.createBtnText}>🎨 Diseñar Nueva Escena Personalizada</Text>
        </TouchableOpacity>

        {/* Templates List */}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>PLANTILLAS DISPONIBLES ({templates.length}):</Text>
          {templates.map((tpl) => (
            <SceneTemplateCard
              key={tpl.id}
              template={tpl}
              onLaunch={setActivePlayerTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Modals */}
        <SceneTemplateEditorModal
          visible={showEditor}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveTemplate}
        />

        <SceneTemplatePlayerModal
          visible={!!activePlayerTemplate}
          template={activePlayerTemplate}
          onClose={() => setActivePlayerTemplate(null)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 760, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: fontSize.sm },
  title: { fontFamily: fonts.displaySemi, color: colors.text, fontSize: fontSize.xxl },
  subtitle: { ...typography.bodyMuted, fontSize: fontSize.sm },

  createBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  createBtnText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  scroll: { gap: spacing.xs, paddingTop: spacing.xs },
});
