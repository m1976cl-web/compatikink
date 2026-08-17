import assert from 'node:assert/strict';
import {
  ICEBREAKER_QUESTIONS,
  getTailoredIcebreakers,
  IcebreakerCategory,
} from '../data/icebreakerQuestions';
import { CompatibilityReport } from '../types';

async function runIcebreakerTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — S2 Icebreaker Questions Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Dataset Integrity
  console.log('1. Testing Icebreaker Dataset Integrity...');
  assert(ICEBREAKER_QUESTIONS.length >= 20, 'Should have at least 20 icebreaker questions');

  const categories: IcebreakerCategory[] = [
    'apertura_curiosa',
    'limites_confort',
    'fantasias_deseos',
    'dinamicas_roles',
    'seguridad_senales',
    'aftercare_afecto',
  ];

  for (const cat of categories) {
    const found = ICEBREAKER_QUESTIONS.some((q) => q.category === cat);
    assert(found, `Category ${cat} must have at least one question`);
  }

  for (const q of ICEBREAKER_QUESTIONS) {
    assert(q.id.startsWith('ice-'), `ID ${q.id} has valid prefix`);
    assert(q.question.length > 10, `Question ${q.id} has descriptive text`);
    assert(q.followUpTip.length > 5, `Follow-up tip ${q.id} has guidance text`);
    assert(['ligero', 'intermedio', 'profundo'].includes(q.depthLevel), `Valid depth level for ${q.id}`);
  }
  console.log(`  ✅ ${ICEBREAKER_QUESTIONS.length}/${ICEBREAKER_QUESTIONS.length} icebreaker questions verified`);

  // 2. Testing Tailored Generator
  console.log('\n2. Testing Tailored Icebreakers Generator...');
  const mockReport: Partial<CompatibilityReport> = {
    compatibilityScore: 85,
    categoryCompatibilities: {
      bondage: 90,
      aftercare: 80,
      impact: 20,
    },
  };

  const tailored = getTailoredIcebreakers(mockReport as CompatibilityReport);
  assert(tailored.length === ICEBREAKER_QUESTIONS.length, 'All questions are preserved');

  // The first few questions should prioritize matched categories (bondage / aftercare)
  const firstRelated = tailored.slice(0, 5).some(
    (q) => q.relatedKinkCategory === 'bondage' || q.relatedKinkCategory === 'aftercare'
  );
  assert(firstRelated, 'Tailored questions prioritize matched categories at top');
  console.log('  ✅ Tailored prioritization algorithm working properly');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All S2 Icebreaker Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runIcebreakerTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
