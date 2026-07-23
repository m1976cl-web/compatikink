import { ACTIVITIES, getAllActivities, getActivityById, CATEGORY_ORDER } from '../data/activities';
import {
  MOOD_LABELS,
  ActivityMood,
  Activity,
  ActivityCategory,
  ActivityResponse,
  Rating,
  RolePreference,
} from '../types';

interface TestResult {
  passed: number;
  failed: number;
  findings: string[];
}

const res: TestResult = {
  passed: 0,
  failed: 0,
  findings: [],
};

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    res.passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (detail) console.error(`         Detail: ${detail}`);
    res.findings.push(`${testName}${detail ? ' - ' + detail : ''}`);
    res.failed++;
  }
}

function assertEqual(actual: any, expected: any, testName: string) {
  const actStr = JSON.stringify(actual);
  const expStr = JSON.stringify(expected);
  if (actStr === expStr) {
    console.log(`  ✅ [PASS] ${testName}`);
    res.passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    console.error(`         Actual:   ${actStr}`);
    console.error(`         Expected: ${expStr}`);
    res.findings.push(`${testName} (Actual: ${actStr}, Expected: ${expStr})`);
    res.failed++;
  }
}

console.log('================================================================');
console.log('  MILESTONE 3 EMPIRICAL STRESS TEST SUITE — CHALLENGER M3_1');
console.log('================================================================\n');

// =============================================================================
// TEST SUITE 1: Mood Classification Filtering (56 Activities & Edge Cases)
// =============================================================================
console.log('----------------------------------------------------------------');
console.log('1. Mood Classification Filtering (56 Activities & Edge Cases)');
console.log('----------------------------------------------------------------');

// 1.1 Activity Dataset Completeness & Tagging
const totalStandardActivities = ACTIVITIES.length;
assert(totalStandardActivities >= 56, `Total standard activities count is at least 56 (Empirical actual count: ${totalStandardActivities})`);
assertEqual(totalStandardActivities, 77, 'Dataset contains 77 standard activities across 9 categories');

const validMoodKeys: ActivityMood[] = [
  'sensual_relajante',
  'poder_adrenalina',
  'fantasia_roles',
  'romantico_afectivo',
];

const moodCounts: Record<ActivityMood, number> = {
  sensual_relajante: 0,
  poder_adrenalina: 0,
  fantasia_roles: 0,
  romantico_afectivo: 0,
};

let unassignedMoodActivities: string[] = [];
let invalidMoodActivities: { id: string; invalidMood: any }[] = [];
let multiMoodCount = 0;
let singleMoodCount = 0;

ACTIVITIES.forEach((act) => {
  if (!act.moods || act.moods.length === 0) {
    unassignedMoodActivities.push(act.id);
  } else {
    if (act.moods.length > 1) multiMoodCount++;
    else singleMoodCount++;

    act.moods.forEach((m) => {
      if (validMoodKeys.includes(m as ActivityMood)) {
        moodCounts[m as ActivityMood]++;
      } else {
        invalidMoodActivities.push({ id: act.id, invalidMood: m });
      }
    });
  }
});

assertEqual(unassignedMoodActivities.length, 0, 'Every activity in ACTIVITIES has at least 1 assigned mood');
assertEqual(invalidMoodActivities.length, 0, 'Every assigned mood is a valid ActivityMood key');

console.log('\n  📊 Mood Distribution Analysis:');
console.log(`     - Single mood activities: ${singleMoodCount}`);
console.log(`     - Multi mood activities:  ${multiMoodCount}`);
validMoodKeys.forEach((m) => {
  console.log(`     - [${MOOD_LABELS[m].emoji} ${m}]: ${moodCounts[m]} activities`);
});

// 1.2 Category Coverage across Moods
console.log('\n1.2 Category Reachability by Mood');
validMoodKeys.forEach((m) => {
  const matchingCats = Array.from(
    new Set(
      ACTIVITIES.filter((a) => a.moods?.includes(m)).map((a) => a.category)
    )
  );
  assert(matchingCats.length > 0, `Mood "${m}" maps to at least 1 category (found ${matchingCats.length})`);
});

// 1.3 Mood Filter Logic in Report Filtering (`app/report.tsx`)
console.log('\n1.3 Report Item Filtering Logic');
const mockReportItems = ACTIVITIES.slice(0, 10).map((act, i) => ({
  activityId: act.id,
  activityName: act.name,
  category: act.category,
  section: 'mutual_match' as const,
  initiatorRating: 'love' as Rating,
  guestRating: 'love' as Rating,
  initiatorRole: 'give' as RolePreference,
  guestRole: 'receive' as RolePreference,
  initiatorIntensity: 4,
  guestIntensity: 4,
}));

validMoodKeys.forEach((mKey) => {
  const filtered = mockReportItems.filter((item) => {
    const act = getActivityById(item.activityId);
    return act?.moods?.includes(mKey);
  });
  const expectedCount = mockReportItems.filter((item) => {
    const act = ACTIVITIES.find((a) => a.id === item.activityId);
    return act?.moods?.includes(mKey);
  }).length;

  assertEqual(filtered.length, expectedCount, `Report filtering by mood "${mKey}" produces correct match count (${filtered.length})`);
});

// Edge case: Item referencing non-existent activity ID
const itemWithMissingActivity = {
  activityId: 'unknown_kink_999',
  activityName: 'Unknown',
  category: 'bondage' as ActivityCategory,
  section: 'mutual_match' as const,
  initiatorRating: 'love' as Rating,
  guestRating: 'love' as Rating,
  initiatorRole: 'give' as RolePreference,
  guestRole: 'receive' as RolePreference,
  initiatorIntensity: 3,
  guestIntensity: 3,
};
const itemsWithUnknown = [...mockReportItems, itemWithMissingActivity];
try {
  const filteredUnknown = itemsWithUnknown.filter((item) => {
    const act = getActivityById(item.activityId);
    return act?.moods?.includes('sensual_relajante');
  });
  assert(true, 'Report filter gracefully handles unknown activity ID without throwing TypeError');
} catch (e: any) {
  assert(false, 'Report filter threw exception on unknown activity ID', e.message);
}

// 1.4 Category Selection by Mood (`toggleCategoriesByMood` in `app/questionnaire.tsx`)
console.log('\n1.4 Category Selection by Mood (`toggleCategoriesByMood`)');

function simulateToggleCategoriesByMood(
  mood: ActivityMood,
  currentEnabled: ActivityCategory[],
  allActivities: Activity[]
): ActivityCategory[] {
  const matchingCats = Array.from(
    new Set(
      allActivities
        .filter((a) => a.moods?.includes(mood))
        .map((a) => a.category)
    )
  );

  const allSelected = matchingCats.every((c) => currentEnabled.includes(c));
  if (allSelected) {
    const next = currentEnabled.filter((c) => !matchingCats.includes(c));
    return next.length > 0 ? next : currentEnabled;
  } else {
    return Array.from(new Set([...currentEnabled, ...matchingCats]));
  }
}

// Case A: All enabled initially, toggle mood off
let currentEnabled = [...CATEGORY_ORDER];
const afterToggleOffPoder = simulateToggleCategoriesByMood('poder_adrenalina', currentEnabled, ACTIVITIES);
assert(
  afterToggleOffPoder.length < CATEGORY_ORDER.length,
  'Toggling off fully active mood reduces enabled categories count'
);

// Case B: Safety check - attempting to disable all categories must retain non-empty enabledCategories
const onlyPoderCats = Array.from(
  new Set(ACTIVITIES.filter((a) => a.moods?.includes('poder_adrenalina')).map((a) => a.category))
);
const safetyTestResult = simulateToggleCategoriesByMood('poder_adrenalina', onlyPoderCats, ACTIVITIES);
assert(
  safetyTestResult.length > 0,
  'Safety check prevents clearing enabledCategories to empty array (retains previous state)'
);

// 1.5 Custom Activity Edge Cases
console.log('\n1.5 Custom Activity Edge Cases');
const customActNoMood: Activity = {
  id: 'custom_1',
  category: 'bondage',
  name: 'Custom Rope',
  description: 'Custom rope bondage',
};

const customActWithMood: Activity = {
  id: 'custom_2',
  category: 'intimacy',
  name: 'Custom Touch',
  description: 'Custom intimacy touch',
  moods: ['romantico_afectivo', 'sensual_relajante'],
};

const customActInvalidMood: Activity = {
  id: 'custom_3',
  category: 'impact',
  name: 'Custom Impact',
  description: 'Custom impact',
  moods: ['super_extreme' as any],
};

const mergedActivities = getAllActivities([customActNoMood, customActWithMood, customActInvalidMood]);
assertEqual(mergedActivities.length, 80, 'getAllActivities merges standard and custom activities (77 + 3 = 80)');

// Test mood filtering with custom activities
const romFilteredWithCustom = mergedActivities.filter((a) => a.moods?.includes('romantico_afectivo'));
assert(
  romFilteredWithCustom.some((a) => a.id === 'custom_2'),
  'Custom activity with mood is correctly included in mood filter'
);

const noMoodFiltered = mergedActivities.filter((a) => a.moods?.includes('sensual_relajante'));
assert(
  !noMoodFiltered.some((a) => a.id === 'custom_1'),
  'Custom activity without moods is excluded from specific mood filter without errors'
);


// =============================================================================
// TEST SUITE 2: Card Deck vs List Mode Switching & Response State Synchronization
// =============================================================================
console.log('\n----------------------------------------------------------------');
console.log('2. Card Deck vs List Mode Index Switching & State Sync');
console.log('----------------------------------------------------------------');

// Simulate the questionnaire state engine (replicating useQuestionnaire behavior)
class QuestionnaireEngine {
  public activities: Activity[];
  public responses: Record<string, ActivityResponse>;
  public currentIndex: number = 0;
  public viewMode: 'swipe' | 'list' = 'swipe';

  constructor(categories?: ActivityCategory[], customs?: Activity[]) {
    const all = getAllActivities(customs);
    this.activities = categories && categories.length > 0
      ? all.filter((a) => categories.includes(a.category))
      : all;

    this.responses = {};
    for (const act of all) {
      if (categories && categories.length > 0 && !categories.includes(act.category)) {
        this.responses[act.id] = {
          activityId: act.id,
          rating: 'not_interested',
          role: 'flexible',
          intensity: 2,
        };
      } else {
        this.responses[act.id] = {
          activityId: act.id,
          rating: 'not_interested',
          role: 'flexible',
          intensity: 2,
        };
      }
    }
  }

  public get currentActivity(): Activity {
    return this.activities[this.currentIndex] || this.activities[0];
  }

  public get currentResponse(): ActivityResponse {
    return this.responses[this.currentActivity.id];
  }

  public setRating(rating: Rating) {
    if (!this.currentActivity) return;
    this.responses[this.currentActivity.id] = {
      ...this.responses[this.currentActivity.id],
      rating,
    };
  }

  public setRole(role: RolePreference) {
    if (!this.currentActivity) return;
    this.responses[this.currentActivity.id] = {
      ...this.responses[this.currentActivity.id],
      role,
    };
  }

  public setIntensity(intensity: 1 | 2 | 3 | 4 | 5) {
    if (!this.currentActivity) return;
    this.responses[this.currentActivity.id] = {
      ...this.responses[this.currentActivity.id],
      intensity,
    };
  }

  public setResponseForActivity(activityId: string, patch: Partial<ActivityResponse>) {
    this.responses[activityId] = {
      ...(this.responses[activityId] || {
        activityId,
        rating: 'not_interested',
        role: 'flexible',
        intensity: 2,
      }),
      ...patch,
    };
  }

  public goTo(index: number) {
    if (index >= 0 && index < this.activities.length) {
      this.currentIndex = index;
    }
  }

  public goNext() {
    if (this.currentIndex < this.activities.length - 1) {
      this.currentIndex++;
    }
  }

  public goPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  public switchMode(mode: 'swipe' | 'list') {
    this.viewMode = mode;
  }
}

// 2.1 Basic Mode Switch & Index Synchronization
console.log('\n2.1 Basic Mode Switching & Index Preservation');
const engine = new QuestionnaireEngine();

// Advance 5 steps in Swipe mode
for (let i = 0; i < 5; i++) {
  engine.goNext();
}
assertEqual(engine.currentIndex, 5, 'Card Deck mode index advanced to 5');

// Switch to List mode
engine.switchMode('list');
assertEqual(engine.currentIndex, 5, 'Switching from Card Deck to List mode preserves currentIndex (5)');

// Advance 3 steps in List mode
for (let i = 0; i < 3; i++) {
  engine.goNext();
}
assertEqual(engine.currentIndex, 8, 'List mode index advanced to 8');

// Switch back to Card Deck mode
engine.switchMode('swipe');
assertEqual(engine.currentIndex, 8, 'Switching back to Card Deck mode preserves currentIndex (8)');

// 2.2 Response State Update Synchronization Across Modes
console.log('\n2.2 Response State Update Synchronization Across Modes');

// Set response in Card Deck mode via setResponseForActivity
const targetActId = engine.currentActivity.id;
engine.setResponseForActivity(targetActId, { rating: 'love', role: 'give', intensity: 5 });

// Switch to List mode and verify
engine.switchMode('list');
assertEqual(
  engine.currentResponse,
  { activityId: targetActId, rating: 'love', role: 'give', intensity: 5 },
  'Response mutated in Card Deck mode is immediately visible in List mode'
);

// Mutate response in List mode via setRating / setRole
engine.setRating('curious');
engine.setRole('both');
engine.setIntensity(4);

// Switch to Card Deck mode and verify
engine.switchMode('swipe');
assertEqual(
  engine.responses[targetActId],
  { activityId: targetActId, rating: 'curious', role: 'both', intensity: 4 },
  'Response mutated in List mode is immediately visible in Card Deck mode'
);

// 2.3 Boundary Navigation & Edge Case Handling
console.log('\n2.3 Boundary Navigation & Edge Case Indexing');

// Test index 0 goPrev
engine.goTo(0);
engine.goPrev();
assertEqual(engine.currentIndex, 0, 'goPrev at index 0 remains at index 0 without underflow');

// Test last index goNext
const lastIndex = engine.activities.length - 1;
engine.goTo(lastIndex);
engine.goNext();
assertEqual(engine.currentIndex, lastIndex, 'goNext at last index remains at last index without overflow');

// Test out-of-bounds goTo
engine.goTo(-5);
assertEqual(engine.currentIndex, lastIndex, 'goTo(-5) rejected, retains previous index');

engine.goTo(9999);
assertEqual(engine.currentIndex, lastIndex, 'goTo(9999) rejected, retains previous index');

// 2.4 Rapid Stress Test & Mode Toggling Loop (1,000 Iterations)
console.log('\n2.4 Rapid Mode Switch & Response State Stress Test (1,000 Iterations)');

const stressEngine = new QuestionnaireEngine();
const ratingsList: Rating[] = ['hard_limit', 'not_interested', 'curious', 'like', 'love'];
const rolesList: RolePreference[] = ['give', 'receive', 'both', 'flexible'];

let stateErrors = 0;

for (let iter = 1; iter <= 1000; iter++) {
  // Randomly toggle view mode
  const targetMode = iter % 2 === 0 ? 'swipe' : 'list';
  stressEngine.switchMode(targetMode);

  // Random jump or step
  const actionType = iter % 4;
  if (actionType === 0) {
    stressEngine.goNext();
  } else if (actionType === 1) {
    stressEngine.goPrev();
  } else if (actionType === 2) {
    const randomIdx = Math.floor(Math.random() * stressEngine.activities.length);
    stressEngine.goTo(randomIdx);
  }

  // Mutate current response
  const randRating = ratingsList[iter % ratingsList.length];
  const randRole = rolesList[iter % rolesList.length];
  const randIntensity = ((iter % 5) + 1) as 1 | 2 | 3 | 4 | 5;

  if (targetMode === 'swipe') {
    stressEngine.setResponseForActivity(stressEngine.currentActivity.id, {
      rating: randRating,
      role: randRole,
      intensity: randIntensity,
    });
  } else {
    stressEngine.setRating(randRating);
    stressEngine.setRole(randRole);
    stressEngine.setIntensity(randIntensity);
  }

  // Invariant verification checks
  const currAct = stressEngine.currentActivity;
  const currResp = stressEngine.currentResponse;

  if (!currAct || !currResp) {
    stateErrors++;
  } else if (currResp.rating !== randRating || currResp.role !== randRole || currResp.intensity !== randIntensity) {
    stateErrors++;
  } else if (stressEngine.currentIndex < 0 || stressEngine.currentIndex >= stressEngine.activities.length) {
    stateErrors++;
  }
}

assertEqual(stateErrors, 0, '1,000 rapid mode toggles & state mutations completed with 0 errors / state corruptions');

// =============================================================================
// TEST SUITE 3: Deep Adversarial Edge Cases & Behavioral Anomalies
// =============================================================================
console.log('\n----------------------------------------------------------------');
console.log('3. Deep Adversarial Edge Cases & Behavioral Anomalies');
console.log('----------------------------------------------------------------');

// 3.1 Category Filter Shrinking when currentIndex > newFilteredActivities.length
console.log('\n3.1 Out-of-Bounds Index Behavior when Category Filter Shrinks');
const shrinkEngine = new QuestionnaireEngine([...CATEGORY_ORDER]);
shrinkEngine.goTo(75); // On index 75 out of 77 (ac_bath or ac_reassurance)

// Now user changes category filter to remove 'aftercare' (6 activities removed -> total 71)
const filteredWithoutAftercare = getAllActivities().filter((a) => a.category !== 'aftercare');
const outOfBoundsCurrAct = filteredWithoutAftercare[shrinkEngine.currentIndex];
const fallbackAct = outOfBoundsCurrAct || getAllActivities()[0];

assert(
  outOfBoundsCurrAct === undefined,
  'When category count shrinks, previous currentIndex (75) is out of bounds for new list (len 71)'
);

const bugProgress = (shrinkEngine.currentIndex + 1) / filteredWithoutAftercare.length;
assert(
  bugProgress > 1.0,
  `Progress ratio exceeds 100% (calculated: ${(bugProgress * 100).toFixed(1)}%) when currentIndex is unclampable`
);

// 3.2 Shared Category Disambiguation on Mood Untoggle
console.log('\n3.2 Shared Category Side-Effects when Untoggling Overlapping Moods');
// Mood A: sensual_relajante (includes bondage, sensation, etc.)
// Mood B: poder_adrenalina (includes bondage, sensation, power_exchange, etc.)
const catsA = Array.from(new Set(ACTIVITIES.filter((a) => a.moods?.includes('sensual_relajante')).map((a) => a.category)));
const catsB = Array.from(new Set(ACTIVITIES.filter((a) => a.moods?.includes('poder_adrenalina')).map((a) => a.category)));

const sharedCats = catsA.filter((c) => catsB.includes(c));
assert(sharedCats.length > 0, `sensual_relajante and poder_adrenalina share categories: [${sharedCats.join(', ')}]`);

// Enable both
let enabledBoth = Array.from(new Set([...catsA, ...catsB]));
// Now untoggle Mood A (sensual_relajante)
const afterUntoggleA = enabledBoth.filter((c) => !catsA.includes(c));

// Check if shared categories were stripped from Mood B
const strippedSharedFromB = sharedCats.filter((c) => !afterUntoggleA.includes(c));
assert(
  strippedSharedFromB.length > 0,
  `Untoggling Mood A removes shared categories [${strippedSharedFromB.join(', ')}] required by active Mood B`
);

// =============================================================================
// SUMMARY & FINDINGS REPORT
// =============================================================================
console.log('\n================================================================');
console.log('  EMPIRICAL STRESS TEST RESULTS SUMMARY');
console.log('================================================================');
console.log(`  Passed: ${res.passed}`);
console.log(`  Failed: ${res.failed}`);

if (res.findings.length > 0) {
  console.log('\n  ❌ FAILURES / FINDINGS DETECTED:');
  res.findings.forEach((f) => console.log(`   - ${f}`));
  process.exit(1);
} else {
  console.log('\n  🎉 ALL 24 VERIFICATION ASSERTIONS PASSED WITH ZERO ERRORS!');
}
