/**
 * Castidad mini-apps — original CompatKink quizzes (not Oxy-Shop/Typeform copies).
 *
 * Themes: wearer self-assessment, keyholder dynamic, duration/protocol/aftercare.
 * Answers stay in the local vault (`fetish_lab_chastity_*` → ck1: when unlocked).
 * Never plaintext in Supabase. No checkout. Local measurement bands live in chastitySizing.ts.
 *
 * Adults 18+ only. Consent. Hygiene/circulation/emergency-key first.
 */

import type { ActivityResponse, Rating, RolePreference } from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import {
  compareFetishResponses,
  copyLooksAdultOnly,
  type FetishCompareItem,
  type FetishLabActivity,
} from '@/lib/fetishLabs';

export type ChastityFlowId = 'wearer' | 'keyholder' | 'protocol';

export const CHASTITY_LAB_MIN_AGE = 18;

export const CHASTITY_LAB_KEYS = {
  wearerInitiator: 'fetish_lab_chastity_wearer_initiator_v1',
  wearerGuest: 'fetish_lab_chastity_wearer_guest_v1',
  keyholderInitiator: 'fetish_lab_chastity_keyholder_initiator_v1',
  keyholderGuest: 'fetish_lab_chastity_keyholder_guest_v1',
  protocolInitiator: 'fetish_lab_chastity_protocol_initiator_v1',
  protocolGuest: 'fetish_lab_chastity_protocol_guest_v1',
  sizing: 'fetish_lab_chastity_sizing_v1',
} as const;

const KEYS_BY_FLOW: Record<
  ChastityFlowId,
  { initiator: string; guest: string }
> = {
  wearer: {
    initiator: CHASTITY_LAB_KEYS.wearerInitiator,
    guest: CHASTITY_LAB_KEYS.wearerGuest,
  },
  keyholder: {
    initiator: CHASTITY_LAB_KEYS.keyholderInitiator,
    guest: CHASTITY_LAB_KEYS.keyholderGuest,
  },
  protocol: {
    initiator: CHASTITY_LAB_KEYS.protocolInitiator,
    guest: CHASTITY_LAB_KEYS.protocolGuest,
  },
};

function item(id: string): FetishLabActivity {
  return {
    id,
    name: id,
    description: id,
    safetyTip: id,
    adultsOnly: true,
  };
}

/** Wearer / self-assessment — comfort, hygiene, emergency key. Not a size calculator. */
export const CHASTITY_WEARER_ITEMS: FetishLabActivity[] = [
  item('cw_why'),
  item('cw_device'),
  item('cw_hygiene'),
  item('cw_bloodflow'),
  item('cw_emergency'),
  item('cw_shortlock'),
  item('cw_discretion'),
  item('cw_drop'),
  item('cw_pain_stop'),
  item('cw_wearer_aftercare'),
];

/** Keyholder / dynamic — care, check-ins, unlock-on-stop. Not a product quiz. */
export const CHASTITY_KEYHOLDER_ITEMS: FetishLabActivity[] = [
  item('ck_care'),
  item('ck_agenda'),
  item('ck_checkins'),
  item('ck_tease'),
  item('ck_unlock'),
  item('ck_keys'),
  item('ck_private'),
  item('ck_frame'),
  item('ck_power'),
  item('ck_holder_aftercare'),
];

/** Duration / protocol / aftercare — hours-first, inspect, pause without shame. */
export const CHASTITY_PROTOCOL_ITEMS: FetishLabActivity[] = [
  item('cp_hours'),
  item('cp_overnight'),
  item('cp_daytime'),
  item('cp_hygiene_window'),
  item('cp_movement'),
  item('cp_sleep'),
  item('cp_inspect_max'),
  item('cp_travel'),
  item('cp_unlock_care'),
  item('cp_pause'),
];

export const CHASTITY_ITEMS_BY_FLOW: Record<ChastityFlowId, FetishLabActivity[]> = {
  wearer: CHASTITY_WEARER_ITEMS,
  keyholder: CHASTITY_KEYHOLDER_ITEMS,
  protocol: CHASTITY_PROTOCOL_ITEMS,
};

export type ChastitySnapshotId = 'cautious' | 'curious' | 'structured' | 'limits';

export function chastityQuestionKey(id: string, field: 'name' | 'desc' | 'safety'): string {
  return `labs.chastity.q.${id}.${field}`;
}

export function defaultChastityResponse(activityId: string): ActivityResponse {
  return {
    activityId,
    rating: 'not_interested',
    role: 'flexible',
    intensity: 3,
  };
}

export function makeChastityResponse(
  activityId: string,
  rating: Rating,
  role: RolePreference = 'flexible',
  intensity: ActivityResponse['intensity'] = 3
): ActivityResponse {
  return { activityId, rating, role, intensity };
}

export function computeChastitySnapshot(responses: ActivityResponse[]): ChastitySnapshotId {
  const hard = responses.filter((r) => r.rating === 'hard_limit').length;
  const eager = responses.filter((r) => r.rating === 'love' || r.rating === 'like').length;
  const curious = responses.filter((r) => r.rating === 'curious').length;
  if (hard >= 3) return 'limits';
  if (eager >= 5) return 'structured';
  if (curious >= 3 || eager >= 2) return 'curious';
  return 'cautious';
}

export function labelChastityItems(
  items: FetishLabActivity[],
  translate: (key: string) => string
): FetishLabActivity[] {
  return items.map((a) => ({
    ...a,
    name: translate(chastityQuestionKey(a.id, 'name')),
    description: translate(chastityQuestionKey(a.id, 'desc')),
    safetyTip: translate(chastityQuestionKey(a.id, 'safety')),
  }));
}

export function compareChastityFlow(
  flow: ChastityFlowId,
  initiator: ActivityResponse[],
  guest: ActivityResponse[],
  translate: (key: string) => string
): FetishCompareItem[] {
  const labeled = labelChastityItems(CHASTITY_ITEMS_BY_FLOW[flow], translate);
  return compareFetishResponses(labeled, initiator, guest);
}

export async function loadChastityResponses(
  flow: ChastityFlowId,
  side: 'initiator' | 'guest'
): Promise<ActivityResponse[]> {
  const key = KEYS_BY_FLOW[flow][side];
  const fallback = CHASTITY_ITEMS_BY_FLOW[flow].map((a) => defaultChastityResponse(a.id));
  return readJsonStorage<ActivityResponse[]>(key, fallback);
}

export async function saveChastityResponses(
  flow: ChastityFlowId,
  side: 'initiator' | 'guest',
  responses: ActivityResponse[]
): Promise<void> {
  await writeJsonStorage(KEYS_BY_FLOW[flow][side], responses);
}

export function chastityCopyIsAdultOnly(translate: (key: string) => string): boolean {
  const ids = Object.values(CHASTITY_ITEMS_BY_FLOW).flat().map((a) => a.id);
  return ids.every((id) =>
    copyLooksAdultOnly(
      `${translate(chastityQuestionKey(id, 'name'))} ${translate(chastityQuestionKey(id, 'desc'))}`
    )
  );
}
