import { t } from '@/lib/i18n';
import {
  ActivityMood,
  Rating,
  ReportSectionType,
  RolePreference,
  MOOD_LABELS,
  RATING_LABELS,
  ROLE_LABELS,
  SECTION_DESCRIPTIONS,
  SECTION_LABELS,
} from '@/types';

export function getRatingLabel(rating: Rating): string {
  const key = `rating.${rating}`;
  const translated = t(key);
  return translated !== key ? translated : RATING_LABELS[rating];
}

export function getRoleLabel(role: RolePreference): string {
  const key = `role.${role}`;
  const translated = t(key);
  return translated !== key ? translated : ROLE_LABELS[role];
}

export function getSectionLabel(section: ReportSectionType): string {
  const key = `section.${section}`;
  const translated = t(key);
  return translated !== key ? translated : SECTION_LABELS[section];
}

export function getSectionDescription(section: ReportSectionType): string {
  const key = `section.${section}.desc`;
  const translated = t(key);
  return translated !== key ? translated : SECTION_DESCRIPTIONS[section];
}

export function getMoodLabel(mood: ActivityMood): string {
  const key = `mood.${mood}`;
  const translated = t(key);
  return translated !== key ? translated : MOOD_LABELS[mood].label;
}

export function getConversationPrompt(section: ReportSectionType, activityName: string): string | undefined {
  if (section === 'initiator_only') return undefined;
  const key = `prompt.${section}`;
  const translated = t(key, { name: activityName });
  return translated !== key ? translated : undefined;
}
