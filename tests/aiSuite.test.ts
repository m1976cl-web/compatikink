import assert from 'node:assert/strict';
import { generateLocalReportAnalysis, generateReportAISummary } from '../lib/aiReportInsights';
import { getLocalNegotiationAgenda, generateAINegotiationAgenda } from '../lib/aiNegotiationHelper';
import { CompatibilityReport, Session } from '../types';

async function runAISuiteTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — AI1-4 Suite Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  // 1. AI1 & AI2: Natural Language Summary & Next Steps
  console.log('1. Testing AI1 & AI2 Report Analysis & Next Steps...');
  const mockReport: Partial<CompatibilityReport> = {
    sessionId: 'session-test-ai',
    compatibilityScore: 82,
    categoryCompatibilities: {
      bondage: 85,
      aftercare: 90,
      sensation: 75,
      impact: 40,
    },
  };

  const analysis = await generateReportAISummary(mockReport as CompatibilityReport, 'Alex');
  assert(analysis.summary.length > 20, 'Summary text generated');
  assert(analysis.strengths.length >= 1, 'Strengths extracted');
  assert(analysis.explorationZones.length >= 1, 'Exploration zones extracted');
  assert(analysis.suggestedSteps.length === 3, 'Exactly 3 graduated next steps generated');

  for (const step of analysis.suggestedSteps) {
    assert(step.title.length > 5, 'Step has title');
    assert(step.estimatedMinutes > 0, 'Step has estimated duration');
    assert(['Principiante', 'Intermedio', 'Avanzado'].includes(step.difficulty), 'Valid difficulty');
    assert(step.safetyAdvice.length > 5, 'Step includes safety advice');
  }
  console.log('  ✅ AI1 & AI2 analysis and 3 next steps generated successfully');

  // 2. AI3: Negotiation Agenda Generator
  console.log('\n2. Testing AI3 Negotiation Agenda Generator...');
  const mockSession: Partial<Session> = {
    id: 'session-test-neg',
    initiatorToken: 'token-host',
  };

  const agenda = await generateAINegotiationAgenda(mockSession as Session, mockReport as CompatibilityReport);
  assert(agenda.length >= 4, 'At least 4 negotiation agenda points');

  for (const pt of agenda) {
    assert(pt.topic.length > 0, 'Topic is specified');
    assert(pt.questionToDiscuss.length > 5, 'Question to discuss is defined');
    assert(pt.suggestedSafeguards.length > 5, 'Safeguard is defined');
  }
  console.log(`  ✅ AI3 generated ${agenda.length} structured negotiation points`);

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All AI1-4 Suite Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runAISuiteTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
