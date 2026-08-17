const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const localBin = path.join(rootDir, 'node_modules', '.bin');
const customEnv = { ...process.env, PATH: `${localBin};${process.env.PATH}` };

console.log('🚀 Compilando web bundle...');
execSync('pnpm run build:web', { cwd: rootDir, stdio: 'inherit' });

console.log('🌿 Cambiando a rama local gh-pages...');
execSync('git checkout -B gh-pages', { cwd: rootDir, stdio: 'inherit' });

console.log('🧹 Copiando dist a la raíz de la rama gh-pages...');
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      if (item !== '.git') copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Copy dist contents to temporary location
const tempDist = path.join(rootDir, '_temp_dist_hold');
if (fs.existsSync(tempDist)) fs.rmSync(tempDist, { recursive: true, force: true });
copyDir(distDir, tempDist);

// Clear tracked files from root (except .git, node_modules, and _temp_dist_hold)
for (const item of fs.readdirSync(rootDir)) {
  if (item !== '.git' && item !== '_temp_dist_hold' && item !== 'node_modules') {
    fs.rmSync(path.join(rootDir, item), { recursive: true, force: true });
  }
}

// Move temp contents to root
copyDir(tempDist, rootDir);
fs.rmSync(tempDist, { recursive: true, force: true });

console.log('📌 Agregando archivos...');
execSync('git add -A', { cwd: rootDir, stdio: 'inherit', env });
execSync('git commit -m "Deploy Google Auth and restricted anon mode"', { cwd: rootDir, stdio: 'inherit', env });

console.log('🔥 Forzando push a origin gh-pages...');
execSync('git push origin gh-pages --force', { cwd: rootDir, stdio: 'inherit' });

console.log('🔙 Regresando a main...');
execSync('git checkout main -f', { cwd: rootDir, stdio: 'inherit' });

console.log('🎉 Despliegue forzado a GitHub Pages completado con éxito!');
