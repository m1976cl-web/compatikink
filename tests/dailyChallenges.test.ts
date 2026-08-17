import assert from 'node:assert/strict';
import {
  DAILY_CHALLENGES,
  DAILY_CHALLENGE_CATEGORIES,
  getChallengeForDate,
} from '../data/dailyChallenges';
import {
  getCompletedDailyChallenges,
  isTodayChallengeCompleted,
  completeDailyChallenge,
} from '../lib/dailyChallenges';
import { scheduleDailyChallengeNotification } from '../lib/localNotifications';

async function runDailyChallengesTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — Daily Challenges Test Suite (G4)');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Verify Dataset
  console.log('1. Testing Daily Challenges Dataset Integrity...');
  assert.equal(DAILY_CHALLENGES.length, 31, 'Should have exactly 31 daily challenges (1 per day)');

  // Verify each day 1..31 is present
  for (let day = 1; day <= 31; day++) {
    const found = DAILY_CHALLENGES.find((c) => c.dayNumber === day);
    assert(found !== undefined, `Day ${day} must be defined in DAILY_CHALLENGES`);
    assert(found.title.length > 0, `Day ${day} must have a title`);
    assert(found.description.length > 0, `Day ${day} must have a description`);
    assert(found.xpReward >= 50 && found.xpReward <= 120, `Day ${day} XP reward must be between 50 and 120`);
    assert(DAILY_CHALLENGE_CATEGORIES.includes(found.category), `Day ${day} category is valid`);
  }
  console.log('  ✅ 31/31 daily challenges verified with valid properties');

  // 2. Testing Deterministic Date Retrieval
  console.log('\n2. Testing Deterministic getChallengeForDate...');
  const testDate15 = new Date('2026-08-15T12:00:00Z');
  const challenge15 = getChallengeForDate(testDate15);
  assert.equal(challenge15.dayNumber, 15, 'Day 15 retrieves challenge with dayNumber 15');

  const testDate1 = new Date('2026-08-01T12:00:00Z');
  const challenge1 = getChallengeForDate(testDate1);
  assert.equal(challenge1.dayNumber, 1, 'Day 1 retrieves challenge with dayNumber 1');
  console.log('  ✅ getChallengeForDate retrieves correct day deterministically');

  // 3. Testing Challenge Completion & Storage
  console.log('\n3. Testing completeDailyChallenge Execution...');
  const testToday = new Date('2026-08-17T11:00:00Z');
  const todayChallenge = getChallengeForDate(testToday);

  const initialStatus = await isTodayChallengeCompleted(testToday);
  console.log(`  Initial completion status for today: ${initialStatus}`);

  const completeResult = await completeDailyChallenge(todayChallenge, testToday);
  assert.equal(completeResult.challenge.id, todayChallenge.id, 'Completed challenge ID matches');
  assert.equal(completeResult.xpEarned, todayChallenge.xpReward, 'XP awarded matches reward');

  const completedList = await getCompletedDailyChallenges();
  assert(completedList.length >= 1, 'Completed challenges list is populated');
  assert(completedList.some((c) => c.challengeId === todayChallenge.id), 'Record contains completed challenge');

  const statusNow = await isTodayChallengeCompleted(testToday);
  assert.equal(statusNow, true, 'isTodayChallengeCompleted returns true');
  console.log('  ✅ Daily challenge completed and persisted with XP reward');

  // 4. Testing Idempotency (same-day duplicate completion)
  console.log('\n4. Testing Idempotency on Repeated Completion...');
  const repeatResult = await completeDailyChallenge(todayChallenge, testToday);
  assert.equal(repeatResult.xpEarned, todayChallenge.xpReward, 'Repeated call returns existing reward');
  const listAfterRepeat = await getCompletedDailyChallenges();
  assert.equal(listAfterRepeat.length, completedList.length, 'No duplicate record created');
  console.log('  ✅ Idempotency verified: no duplicate records on same day');

  // 5. Testing Notification Helper
  console.log('\n5. Testing Notification Scheduler...');
  const notifId = await scheduleDailyChallengeNotification(todayChallenge.title);
  assert(typeof notifId === 'string' && notifId.length > 0, 'Notification ID returned');
  console.log('  ✅ scheduleDailyChallengeNotification executed successfully');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All G4 Daily Challenges Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runDailyChallengesTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
