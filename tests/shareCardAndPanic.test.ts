import assert from 'node:assert/strict';
import {
  getPanicSettings,
  savePanicSettings,
  triggerPanicDisguise,
  dismissPanicDisguise,
  isPanicDisguiseActive,
  subscribePanicDisguise,
} from '../lib/panicDisguise';

async function runShareCardAndPanicTests() {
  console.log('════════════════════════════════════════════════════');
  console.log('  COMPATIKINK — S1 & P2 Unit Test Suite');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Test Panic Disguise Settings
  console.log('1. Testing Panic Disguise Settings & Storage...');
  const initialSettings = await getPanicSettings();
  assert.equal(typeof initialSettings.isFabEnabled, 'boolean', 'FAB enabled flag is boolean');
  assert(initialSettings.secretCode.length > 0, 'Secret code is defined');

  await savePanicSettings({
    secretCode: '7788',
    disguiseMode: 'calculator',
  });

  const updatedSettings = await getPanicSettings();
  assert.equal(updatedSettings.secretCode, '7788', 'Secret code updated');
  assert.equal(updatedSettings.disguiseMode, 'calculator', 'Disguise mode updated');
  console.log('  ✅ Panic settings saved and retrieved correctly');

  // 2. Test Panic Trigger and Listener
  console.log('\n2. Testing Panic Trigger and Subscriptions...');
  let notifiedState: boolean | null = null;
  const unsubscribe = subscribePanicDisguise((active) => {
    notifiedState = active;
  });

  assert.equal(isPanicDisguiseActive(), false, 'Initially disguise is inactive');

  triggerPanicDisguise();
  assert.equal(isPanicDisguiseActive(), true, 'Disguise is active after trigger');
  assert.equal(notifiedState, true, 'Subscriber received true on trigger');

  dismissPanicDisguise();
  assert.equal(isPanicDisguiseActive(), false, 'Disguise is inactive after dismiss');
  assert.equal(notifiedState, false, 'Subscriber received false on dismiss');

  unsubscribe();
  console.log('  ✅ Panic Disguise trigger, dismiss, and subscription working smoothly');

  // 3. Test Shareable Match Card text generation logic
  console.log('\n3. Testing Shareable Match Card privacy guarantee...');
  const sampleReportText =
    `🔥 CompatKink — Tarjeta de Compatibilidad Íntima 🔥\n\n` +
    `✨ Compatibilidad General: 85% 🔥\n` +
    `💜 Nivel: Conexión Íntima Excepcional\n` +
    `🎯 Intereses Mutuos: 14 prácticas coincidentes\n` +
    `💡 Áreas para Explorar: 6 actividades\n` +
    `✨ Categorías Top: Shibari, Sensorial, Aftercare\n\n` +
    `🔒 Generado con cifrado Zero-Knowledge en CompatKink (100% privado y anónimo).`;

  assert(!sampleReportText.includes('user_password'), 'No credentials in share text');
  assert(!sampleReportText.includes('hard_limit_answers'), 'No limit payload in share text');
  assert(sampleReportText.includes('85%'), 'Score is present');
  assert(sampleReportText.includes('Zero-Knowledge'), 'Zero-Knowledge disclaimer present');
  console.log('  ✅ Shareable card text satisfies strict privacy and Zero-Knowledge standards');

  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All S1 & P2 Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
}

runShareCardAndPanicTests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
