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

const LAB_ROUTES = ['/marketplace-dark', '/foot-fetish', '/tribute', '/sissy-training'] as const;

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

  await setLocale('es');
  assert.ok(t('labs.adults_only').includes('18'));
  await setLocale('en');
  assert.equal(t('labs.market.no_pay'), 'no in-app payment');
  await setLocale('pt');
  assert.ok(t('labs.sissy.aftercare_list').length > 4);
  await setLocale('es');

  console.log('  ✅ Fetish Labs data, compare, registry, vault keys, i18n\n');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
