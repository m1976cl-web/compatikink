import assert from 'node:assert/strict';
import { askGeminiAssistant } from '../lib/geminiAssistant';
import { setLocale } from '../lib/i18n';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — Gemini AI Assistant Test Suite (Item 30)');
console.log('════════════════════════════════════════════════════\n');

async function testGeminiAssistantEngine() {
  console.log('1. Testing Spanish fallback response for Shibari prompt...');
  await setLocale('es');
  const responseShibariEs = await askGeminiAssistant('¿Cómo atar nudos en Shibari sin lastimar nervios?');
  assert.ok(responseShibariEs.includes('Shibari'), 'Response must mention Shibari');
  assert.ok(responseShibariEs.includes('nervio'), 'Response must address nerve safety');
  console.log('  ✅ Spanish Shibari safety advice generated correctly');

  console.log('\n2. Testing English fallback response for Aftercare prompt...');
  await setLocale('en');
  const responseAftercareEn = await askGeminiAssistant('How to perform good aftercare?');
  assert.ok(responseAftercareEn.includes('Aftercare'), 'Response must mention Aftercare');
  console.log('  ✅ English Aftercare guidance generated correctly');

  console.log('\n3. Testing synthetic general intimacy prompt...');
  await setLocale('es');
  const responseGeneral = await askGeminiAssistant('¿Cómo negociar límites en la primera cita?');
  assert.ok(responseGeneral.length > 20, 'Response should contain detailed guidance');
  console.log('  ✅ General intimacy response generated correctly');
}

testGeminiAssistantEngine()
  .then(() => {
    console.log('\n────────────────────────────────────────────────────');
    console.log('  Results: All Item 30 Gemini AI Tests Passed! ✅');
    console.log('────────────────────────────────────────────────────\n');
  })
  .catch((e) => {
    console.error('\n❌ Test Failure:', e?.message || e);
    process.exit(1);
  });
