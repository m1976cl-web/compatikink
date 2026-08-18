import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { SPECIALIZED_GUIDES, SpecializedGuide } from '@/data/specializedGuides';
import { getGuidesProgress, toggleChecklistItem, markGuideCompleted, GuidesProgress } from '@/lib/specializedGuidesProgress';

export default function SpecializedGuidesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(SPECIALIZED_GUIDES[0].id);
  const [progress, setProgress] = useState<GuidesProgress>({ completedChecklists: [], completedGuides: [] });
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await getGuidesProgress();
    setProgress(data);
  };

  const activeGuide = SPECIALIZED_GUIDES.find(g => g.id === activeTab) || SPECIALIZED_GUIDES[0];

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleToggleChecklist = async (checkId: string) => {
    const updated = await toggleChecklistItem(checkId);
    setProgress(updated);
  };

  const handleMarkCompleted = async () => {
    const updated = await markGuideCompleted(activeGuide.id, activeGuide.badgeId);
    setProgress(updated);
    alert('¡Guía marcada como completada! Has ganado +40 XP.');
  };

  const isCompleted = progress.completedGuides.includes(activeGuide.id);
  
  const allChecklistsChecked = activeGuide.checklist.every(chk => progress.completedChecklists.includes(chk.id));

  return (
    <ScreenContainer title="Guías Especializadas">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <Stack.Screen options={{ title: 'Guías Especializadas', headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: colors.primary, fontSize: fontSize.md, marginBottom: spacing.md }}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
          {SPECIALIZED_GUIDES.map(guide => (
            <TouchableOpacity
              key={guide.id}
              style={[styles.tab, activeTab === guide.id && styles.activeTab]}
              onPress={() => setActiveTab(guide.id)}
            >
              <Text style={[styles.tabText, activeTab === guide.id && styles.activeTabText]}>
                {guide.title.split(' ')[0]}...
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.guideContainer}>
          <Text style={styles.guideTitle}>{activeGuide.title}</Text>
          <Text style={styles.guideDesc}>{activeGuide.shortDescription}</Text>
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={{ color: colors.success, fontSize: 16 }}>✓</Text>
              <Text style={styles.completedBadgeText}>Guía Completada (+40 XP)</Text>
            </View>
          )}

          <View style={styles.sections}>
            {activeGuide.sections.map(section => (
              <View key={section.id} style={styles.sectionWrap}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => handleToggleSection(section.id)}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                    {expandedSections.includes(section.id) ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                
                {expandedSections.includes(section.id) && (
                  <View style={[
                    styles.sectionContent, 
                    section.type === 'warning' && styles.warningBox,
                    section.type === 'danger' && styles.dangerBox
                  ]}>
                    {section.type && (
                      <Text style={{ fontSize: 18, marginBottom: spacing.xs }}>
                        {section.type === 'danger' ? '🚨' : '⚠️'}
                      </Text>
                    )}
                    <Text style={[
                      styles.sectionText,
                      section.type === 'warning' && { color: colors.warning },
                      section.type === 'danger' && { color: colors.danger }
                    ]}>
                      {section.content}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>Checklist de Preparación</Text>
            {activeGuide.checklist.map(chk => {
              const isChecked = progress.completedChecklists.includes(chk.id);
              return (
                <TouchableOpacity key={chk.id} style={styles.checkItem} onPress={() => handleToggleChecklist(chk.id)}>
                  <Text style={{ fontSize: 20, marginRight: spacing.sm }}>
                    {isChecked ? '☑️' : '⬜'}
                  </Text>
                  <Text style={[styles.checkLabel, isChecked && { color: colors.text, fontFamily: fonts.bodySemi }]}>
                    {chk.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button 
            title={isCompleted ? "✓ Guía Completada" : "✓ Marcar Guía como Completada"}
            onPress={handleMarkCompleted}
            disabled={isCompleted || !allChecklistsChecked}
            style={styles.completeBtn}
          />
          {!isCompleted && !allChecklistsChecked && (
            <Text style={styles.completeHint}>Completa el checklist primero.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  tabsContainer: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  tabsContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  activeTabText: {
    color: '#fff',
  },
  guideContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  guideDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  completedBadgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  sections: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionWrap: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.md,
    color: colors.text,
  },
  sectionContent: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  sectionText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  dangerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  checklistContainer: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  checklistTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  completeBtn: {
    marginTop: spacing.md,
  },
  completeHint: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  }
});
