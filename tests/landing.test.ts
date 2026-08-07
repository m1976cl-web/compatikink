import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('════════════════════════════════════════════════════');
console.log('  COMPATIKINK — PWA & Landing Assets Test Suite (Opción A)');
console.log('════════════════════════════════════════════════════\n');

function testPwaAndLanding() {
  console.log('1. Checking public/manifest.json Web App Manifest...');
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.short_name, 'CompatKink');
  assert.equal(manifest.display, 'standalone');
  console.log('  ✅ manifest.json valid and properly structured');

  console.log('\n2. Checking public/sw.js Service Worker...');
  const swPath = path.join(__dirname, '../public/sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js Service Worker must exist');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.ok(swContent.includes('caches.open'), 'Service Worker must implement cache API');
  console.log('  ✅ sw.js Service Worker valid and implements offline cache API');
}

try {
  testPwaAndLanding();
  console.log('\n────────────────────────────────────────────────────');
  console.log('  Results: All Option A PWA & Landing Tests Passed! ✅');
  console.log('────────────────────────────────────────────────────\n');
} catch (e: any) {
  console.error('\n❌ Test Failure:', e?.message || e);
  process.exit(1);
}
