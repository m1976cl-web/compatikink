/**
 * Express questionnaire — ~25 curated activities across moods.
 * Faster path than the full catalog; user can expand later.
 */

import { Activity, ActivityMood } from '@/types';
import { ACTIVITIES } from '@/data/activities';

/** Canonical activity IDs for the express (~25) preset. */
export const EXPRESS_ACTIVITY_IDS: string[] = [
  'pe_d/s_dynamic',
  'pe_orgasm_control',
  'pe_bratting',
  'pe_praise',
  'pe_protocols',
  'bo_rope',
  'bo_cuffs',
  'bo_blindfold',
  'bo_gags',
  'im_spanking',
  'im_flogger',
  'se_wax',
  'se_ice',
  'se_massage',
  'se_vibration',
  'se_feather',
  'ps_tease_deny',
  'ps_worship',
  'rp_strangers',
  'ex_public_subtle',
  'in_extended_foreplay',
  'in_eye_contact',
  'ac_cuddling',
  'ac_talk',
  'tg_wand',
];

export function getExpressActivities(): Activity[] {
  const byId = new Map(ACTIVITIES.map((a) => [a.id, a]));
  return EXPRESS_ACTIVITY_IDS.map((id) => byId.get(id)).filter(Boolean) as Activity[];
}

/** Pick up to `limit` activities that include the given mood. */
export function getExpressActivitiesByMood(mood: ActivityMood, limit = 25): Activity[] {
  const matched = ACTIVITIES.filter((a) => a.moods?.includes(mood));
  if (matched.length >= 12) return matched.slice(0, limit);
  const ids = new Set(matched.map((a) => a.id));
  const merged = [...matched];
  for (const a of getExpressActivities()) {
    if (ids.has(a.id)) continue;
    merged.push(a);
    ids.add(a.id);
    if (merged.length >= limit) break;
  }
  return merged.slice(0, limit);
}

export const EXPRESS_COUNT = EXPRESS_ACTIVITY_IDS.length;
