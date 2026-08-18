import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { VaultLockGate } from '@/components/VaultLockGate';
import { useTranslation } from '@/lib/i18n';
import {
  EMPTY_LATEX_PROFILE,
  LATEXPATTERN_FIELDS,
  LATEX_GROUPS,
  formatLatexMeasurementJson,
  formatLatexMeasurementMarkdown,
  loadLatexMeasurements,
  saveLatexMeasurements,
  type LatexMeasurementProfile,
  type LatexSilhouette,
  type LatexTension,
} from '@/lib/latexMeasurements';
import { copyPlainText, downloadPlainText } from '@/lib/measurementExport';

function parseNum(raw: string): number | null {
  const n = Number(String(raw).replace(',', '.'));
  return Number.isFinite(n) && String(raw).trim() !== '' ? n : null;
}

export function LatexMeasurementForm() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<LatexMeasurementProfile>(EMPTY_LATEX_PROFILE);
  const [scope, setScope] = useState<'essential' | 'full'>('essential');

  useEffect(() => {
    loadLatexMeasurements().then(setProfile);
  }, []);

  const fields = useMemo(
    () =>
      scope === 'essential'
        ? LATEXPATTERN_FIELDS.filter((f) => f.essential)
        : LATEXPATTERN_FIELDS,
    [scope]
  );

  const persist = async () => {
    const saved = await saveLatexMeasurements(profile);
    setProfile(saved);
    Alert.alert(t('latex.measure.saved_title'), t('latex.measure.saved_body'));
  };

  const exportMd = async (download: boolean) => {
    const md = formatLatexMeasurementMarkdown(profile);
    if (download) {
      const ok = downloadPlainText('compatikink-latex-ficha.md', md, 'text/markdown;charset=utf-8');
      Alert.alert(t('latex.measure.export_title'), ok ? t('latex.measure.downloaded') : t('latex.measure.copied'));
      return;
    }
    const copied = await copyPlainText(md);
    Alert.alert(t('latex.measure.export_title'), copied ? t('latex.measure.copied') : t('latex.measure.copy_fail'));
  };

  const exportJson = async () => {
    const json = formatLatexMeasurementJson(profile);
    const ok = downloadPlainText(
      'compatikink-latexpattern.json',
      json,
      'application/json;charset=utf-8'
    );
    if (!ok) await copyPlainText(json);
    Alert.alert(t('latex.measure.export_title'), ok ? t('latex.measure.downloaded') : t('latex.measure.copied'));
  };

  return (
    <VaultLockGate title={t('latex.measure.vault')} subtitle={t('labs.zk_hint')} showLockButton>
      <View style={styles.scroll}>
        <Text style={styles.sectionTitle}>{t('latex.measure.title')}</Text>
        <Text style={styles.sectionDesc}>{t('latex.measure.lead')}</Text>

        <Text style={styles.kicker}>{t('latex.measure.silhouette')}</Text>
        <View style={styles.row}>
          {(['female', 'male'] as LatexSilhouette[]).map((id) => (
            <TouchableOpacity
              key={id}
              style={[styles.chip, profile.silhouette === id && styles.chipOn]}
              onPress={() => setProfile({ ...profile, silhouette: id })}
            >
              <Text style={[styles.chipText, profile.silhouette === id && styles.chipTextOn]}>
                {t(`latex.measure.${id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.kicker}>{t('latex.measure.tension')}</Text>
        <View style={styles.row}>
          {(['comfort', 'tight', 'second_skin'] as LatexTension[]).map((id) => (
            <TouchableOpacity
              key={id}
              style={[styles.chip, profile.tension === id && styles.chipOn]}
              onPress={() => setProfile({ ...profile, tension: id })}
            >
              <Text style={[styles.chipText, profile.tension === id && styles.chipTextOn]}>
                {t(`latex.measure.tension.${id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, scope === 'essential' && styles.chipOn]}
            onPress={() => setScope('essential')}
          >
            <Text style={[styles.chipText, scope === 'essential' && styles.chipTextOn]}>
              {t('latex.measure.scope.essential')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, scope === 'full' && styles.chipOn]}
            onPress={() => setScope('full')}
          >
            <Text style={[styles.chipText, scope === 'full' && styles.chipTextOn]}>
              {t('latex.measure.scope.full')}
            </Text>
          </TouchableOpacity>
        </View>

        {LATEX_GROUPS.map((group) => {
          const groupFields = fields.filter((f) => f.group === group);
          if (groupFields.length === 0) return null;
          return (
            <View key={group} style={styles.group}>
              <Text style={styles.kicker}>{t(`latex.measure.group.${group}`)}</Text>
              {groupFields.map((field) => (
                <View key={field.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t(`latex.measure.field.${field.key}`)}
                    <Text style={styles.fieldKey}>  `{field.key}`</Text>
                  </Text>
                  <TextInput
                    value={profile.values[field.key] == null ? '' : String(profile.values[field.key])}
                    onChangeText={(raw) =>
                      setProfile({
                        ...profile,
                        values: { ...profile.values, [field.key]: parseNum(raw) },
                      })
                    }
                    keyboardType="decimal-pad"
                    placeholder={`${field.placeholder} ${field.unit}`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>
              ))}
            </View>
          );
        })}

        <Text style={styles.fieldLabel}>{t('latex.measure.notes')}</Text>
        <TextInput
          value={profile.notes ?? ''}
          onChangeText={(notes) => setProfile({ ...profile, notes })}
          placeholder={t('latex.measure.notes_ph')}
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.notes]}
        />

        <TouchableOpacity style={styles.primary} onPress={() => void persist()}>
          <Text style={styles.primaryText}>{t('latex.measure.save')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghost} onPress={() => void exportMd(false)}>
          <Text style={styles.ghostText}>{t('latex.measure.copy')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghost} onPress={() => void exportMd(true)}>
          <Text style={styles.ghostText}>{t('latex.measure.download_md')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghost} onPress={() => void exportJson()}>
          <Text style={styles.ghostText}>{t('latex.measure.download_json')}</Text>
        </TouchableOpacity>
        <Text style={styles.meta}>{t('latex.measure.disclaimer')}</Text>
      </View>
    </VaultLockGate>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.sm, paddingTop: spacing.xs },
  sectionTitle: { color: colors.primary, fontSize: fontSize.lg, fontWeight: '800' },
  sectionDesc: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  kicker: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    marginTop: 8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipTextOn: { color: '#000', fontWeight: '900' },
  group: { gap: 8 },
  field: { gap: 4 },
  fieldLabel: { color: colors.text, fontSize: fontSize.xs, fontWeight: '800' },
  fieldKey: { color: colors.textMuted, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: fontSize.sm,
  },
  notes: { minHeight: 72, textAlignVertical: 'top' },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: fontSize.sm },
  ghost: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  ghostText: { color: colors.primary, fontFamily: fonts.bodySemi, fontSize: fontSize.sm },
  meta: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
});
