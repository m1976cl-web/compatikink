import assert from 'node:assert/strict';
import { setLocale, t } from '../lib/i18n';
import { getScreenStatus } from '../data/screenRegistry';
import { isSensitiveStorageKey } from '../lib/cryptoVault';
import {
  FETISH_LAB_ADULTS_ONLY,
  FETISH_LAB_KEYS,
  FETISH_LAB_MIN_AGE,
  FOOT_ACTIVITIES,
  MARKETPLACE_CATALOG,
  SISSY_PROTOCOL_TASKS,
  classifyFetishPair,
  compareFetishResponses,
  copyLooksAdultOnly,
  defaultFootResponse,
  isMarketplaceItemAllowed,
  makeFootResponse,
} from '../lib/fetishLabs';
import {
  CHASTITY_ITEMS_BY_FLOW,
  CHASTITY_KEYHOLDER_ITEMS,
  CHASTITY_LAB_KEYS,
  CHASTITY_LAB_MIN_AGE,
  CHASTITY_PROTOCOL_ITEMS,
  CHASTITY_WEARER_ITEMS,
  chastityCopyIsAdultOnly,
  compareChastityFlow,
  computeChastitySnapshot,
  defaultChastityResponse,
  makeChastityResponse,
} from '../lib/chastityLabs';

const LAB_ROUTES = [
  '/marketplace-dark',
  '/foot-fetish',
  '/tribute',
  '/sissy-training',
  '/chastity',
  '/chastity-wearer',
  '/chastity-keyholder',
  '/chastity-protocol',
  '/chastity-tools',
  '/chastity-cage',
  '/chastity-belt',
  '/chastity-fit',
] as const;

async function run() {
  console.log('Fetish Labs preview slice…\n');

  assert.equal(FETISH_LAB_ADULTS_ONLY, true);
  assert.equal(FETISH_LAB_MIN_AGE, 18);

  assert.ok(MARKETPLACE_CATALOG.length >= 6, 'catalog must have browseable legal items');
  for (const item of MARKETPLACE_CATALOG) {
    assert.equal(item.legal, true, `${item.id} must be marked legal`);
    assert.equal(isMarketplaceItemAllowed(item), true, `${item.id} failed allow-list`);
    assert.ok(copyLooksAdultOnly(`${item.id} ${item.name}`), `${item.id} name must stay adult-only`);
  }

  assert.ok(FOOT_ACTIVITIES.every((a) => a.adultsOnly === true));
  assert.ok(SISSY_PROTOCOL_TASKS.every((a) => a.adultsOnly === true));
  for (const task of SISSY_PROTOCOL_TASKS) {
    assert.ok(copyLooksAdultOnly(task.title), `sissy title not adult-only: ${task.title}`);
  }

  const love = makeFootResponse('ff_massage', 'love', 'flexible', 3);
  const loveRecv = makeFootResponse('ff_massage', 'love', 'flexible', 3);
  assert.equal(classifyFetishPair(love, loveRecv), 'mutual_match');
  const give = makeFootResponse('ff_massage', 'love', 'give', 3);
  const recv = makeFootResponse('ff_massage', 'love', 'receive', 3);
  assert.equal(classifyFetishPair(give, recv), 'role_mismatch');

  const limit = makeFootResponse('ff_massage', 'hard_limit', 'flexible', 1);
  assert.equal(classifyFetishPair(love, limit), 'hard_limit_conflict');

  const mine = [makeFootResponse('ff_massage', 'love', 'flexible', 3)];
  const theirs = [makeFootResponse('ff_massage', 'curious', 'flexible', 3)];
  const report = compareFetishResponses(FOOT_ACTIVITIES, mine, theirs);
  assert.equal(report.length, 1);
  assert.equal(report[0].section, 'explore_together');

  const none = compareFetishResponses(FOOT_ACTIVITIES, [defaultFootResponse('ff_massage')], [
    defaultFootResponse('ff_massage'),
  ]);
  assert.equal(none.length, 0, 'no positive interest → empty compare');

  for (const route of LAB_ROUTES) {
    assert.equal(getScreenStatus(route).status, 'preview', `${route} must be preview`);
  }

  for (const key of Object.values(FETISH_LAB_KEYS)) {
    assert.equal(isSensitiveStorageKey(key), true, `${key} must seal as fetish_lab_`);
  }

  for (const key of Object.values(CHASTITY_LAB_KEYS)) {
    assert.equal(isSensitiveStorageKey(key), true, `${key} must seal as fetish_lab_`);
  }
  assert.equal(isSensitiveStorageKey('chastity_4day_starter_v1'), true);
  assert.equal(isSensitiveStorageKey('fetish_lab_chastity_checkin_v1'), true);
  assert.equal(isSensitiveStorageKey('fetish_lab_chastity_sizing_v1'), true);
  assert.equal(isSensitiveStorageKey('fetish_lab_latex_measurements_v1'), true);

  assert.equal(CHASTITY_LAB_MIN_AGE, 18);
  assert.equal(CHASTITY_WEARER_ITEMS.length, 10);
  assert.equal(CHASTITY_KEYHOLDER_ITEMS.length, 10);
  assert.equal(CHASTITY_PROTOCOL_ITEMS.length, 10);
  for (const flow of Object.values(CHASTITY_ITEMS_BY_FLOW)) {
    assert.ok(flow.every((a) => a.adultsOnly === true));
  }

  const eager = CHASTITY_WEARER_ITEMS.map((a) => makeChastityResponse(a.id, 'love'));
  assert.equal(computeChastitySnapshot(eager), 'structured');
  const hard = [
    ...CHASTITY_WEARER_ITEMS.slice(0, 3).map((a) => makeChastityResponse(a.id, 'hard_limit')),
    ...CHASTITY_WEARER_ITEMS.slice(3).map((a) => defaultChastityResponse(a.id)),
  ];
  assert.equal(computeChastitySnapshot(hard), 'limits');

  const wearerMine = [makeChastityResponse('cw_hygiene', 'love')];
  const wearerGuest = [makeChastityResponse('cw_hygiene', 'curious')];
  const chastityReport = compareChastityFlow('wearer', wearerMine, wearerGuest, t);
  assert.equal(chastityReport.length, 1);
  assert.equal(chastityReport[0].section, 'explore_together');

  await setLocale('es');
  assert.ok(t('labs.adults_only').includes('18'));
  assert.ok(t('labs.chastity.title').length > 3);
  assert.ok(t('labs.chastity.cage.title').length > 4);
  assert.ok(t('latex.measure.field.neckCircum').length > 4);
  assert.ok(chastityCopyIsAdultOnly(t), 'chastity copy must stay adult-only');
  await setLocale('en');
  assert.equal(t('labs.market.no_pay'), 'no in-app payment');
  assert.ok(t('labs.chastity.invite').includes('ZK'));
  assert.ok(chastityCopyIsAdultOnly(t), 'en chastity copy must stay adult-only');
  await setLocale('pt');
  assert.ok(t('labs.sissy.aftercare_list').length > 4);
  assert.ok(t('labs.chastity.protocol.title').length > 4);
  assert.ok(chastityCopyIsAdultOnly(t), 'pt chastity copy must stay adult-only');
  await setLocale('es');

  console.log('  ✅ Fetish Labs data, compare, registry, vault keys, i18n\n');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
