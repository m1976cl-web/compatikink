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

  console.log('\n4. Testing Activity Catalog i18n translation helpers (Item #8)...');
  const { getActivityName, getActivityDescription, getActivitySafetyTip, getCategoryLabel, getActivityById } = await import('../data/activities');

  const ropeAct = getActivityById('bo_rope')!;
  const agePlayAct = getActivityById('pe_age_play')!;

  // Test Spanish (current)
  await setLocale('es');
  assert.equal(getCategoryLabel('bondage'), 'Ataduras');
  assert.equal(getActivityName(ropeAct), 'Cuerdas (shibari)');
  assert.equal(getActivityDescription(ropeAct), 'Ataduras decorativas o restrictivas con cuerda.');
  assert.equal(getActivitySafetyTip(agePlayAct), 'Requiere negociación profunda y límites claros. Siempre entre adultos.');

  // Test English
  await setLocale('en');
  assert.equal(getCategoryLabel('bondage'), 'Bondage & Restraints');
  assert.equal(getActivityName(ropeAct), 'Rope Bondage (Shibari)');
  assert.equal(getActivityDescription(ropeAct), 'Decorative or restrictive Japanese rope bondage.');
  assert.equal(getActivitySafetyTip(agePlayAct), 'Requires deep negotiation and clear boundaries. Always strictly between adults.');
  console.log('  ✅ Activity Catalog helper functions translate dynamically across locales');

  console.log('\n5. Testing Portuguese locale + core copy...');
  await setLocale('pt');
  assert.equal(getCurrentLocale(), 'pt');
  assert.equal(t('vault.locked'), 'Cofre bloqueado 🔒');
  assert.equal(t('landing.title'), 'Compatibilidade íntima, assimétrica e privada');
  assert.equal(t('path.step1'), '1. Responder');
  assert.equal(t('rating.hard_limit'), 'Limite rígido');
  assert.equal(getCategoryLabel('bondage'), 'Ataduras');
  assert.equal(getActivityName(ropeAct), 'Cordas (shibari)');
  assert.ok(t('talk.bo_rope').includes('circulação') || t('talk.bo_rope').includes('Circulação'));
  assert.equal(t('home.hello', { name: 'Alex' }), 'Olá, Alex');
  console.log('  ✅ Portuguese UI + catalog + talk tips resolve');

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
