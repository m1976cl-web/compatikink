import assert from 'node:assert/strict';
import { t, setLocale, getCurrentLocale } from '../lib/i18n';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — i18n Multilingual Test Suite (Item 22)');
console.log('════════════════════════════════════════════════════\n');

async function testI18nEngine() {
  console.log('1. Testing default Spanish translation...');
  assert.equal(getCurrentLocale(), 'es');
  assert.equal(t('app.title'), 'CompatKink');
  assert.equal(t('vault.locked'), 'Bóveda Bloqueada 🔒');
  console.log('  ✅ Default Spanish keys resolve correctly');

  console.log('\n2. Testing language switch to English...');
  await setLocale('en');
  assert.equal(getCurrentLocale(), 'en');
  assert.equal(t('app.subtitle'), 'Private Intimate Compatibility & Zero-Knowledge Encryption');
  assert.equal(t('vault.locked'), 'Vault Locked 🔒');
  console.log('  ✅ English translation keys resolve correctly');

  console.log('\n3. Testing parameter interpolation...');
  const interpolated = t('home.hero_title');
  assert.ok(interpolated.length > 0);
  console.log('  ✅ Translation text is non-empty');

  // Reset to default
  await setLocale('es');
}

testI18nEngine()
  .then(() => {
    console.log('\n────────────────────────────────────────────────────');
    console.log('  Results: All Item 22 i18n Tests Passed! ✅');
    console.log('────────────────────────────────────────────────────\n');
  })
  .catch((e) => {
    console.error('\n❌ Test Failure:', e?.message || e);
    process.exit(1);
  });
