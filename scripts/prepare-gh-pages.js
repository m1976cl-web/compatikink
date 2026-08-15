const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const fourOhFourHtmlPath = path.join(distDir, '404.html');
const noJekyllPath = path.join(distDir, '.nojekyll');

// 1. Create .nojekyll
fs.writeFileSync(noJekyllPath, '');
console.log('✅ Created .nojekyll');

// 2. Duplicate _expo to expo directory to avoid Jekyll underscore blocking
const underscoreExpo = path.join(distDir, '_expo');
const plainExpo = path.join(distDir, 'expo');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(underscoreExpo)) {
  copyRecursiveSync(underscoreExpo, plainExpo);
  console.log('✅ Duplicated _expo to expo for Jekyll compatibility');
}

// 3. Fix index.html script references and create 404.html SPA fallback
if (fs.existsSync(indexHtmlPath)) {
  let content = fs.readFileSync(indexHtmlPath, 'utf8');

  // Also add fallback script loading for /expo/ in case _expo is blocked
  if (content.includes('/_expo/')) {
    content = content.replace(/\/_expo\//g, '/compatikink/_expo/');
    // Handle double prefix if any
    content = content.replace(/\/compatikink\/compatikink\//g, '/compatikink/');
  }

  // Inject PWA manifest & Service Worker registration
  if (!content.includes('serviceWorker')) {
    const swScript = `
    <link rel="manifest" href="/compatikink/manifest.json" />
    <script>
      if ('serviceWorker' in navigator && location.protocol === 'https:') {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/compatikink/sw.js').then(function(reg) {
            console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
          }).catch(function(err) {
            console.warn('[PWA] ServiceWorker registration failed:', err);
          });
        });
      }
    </script>
    </head>`;
    content = content.replace('</head>', swScript);
  }

  fs.writeFileSync(indexHtmlPath, content, 'utf8');
  fs.writeFileSync(fourOhFourHtmlPath, content, 'utf8');
  console.log('✅ Created 404.html & updated index.html SPA routing + PWA ServiceWorker');
}

// 4. Ensure sw.js and manifest.json exist in dist
const publicSw = path.join(__dirname, '..', 'public', 'sw.js');
const publicManifest = path.join(__dirname, '..', 'public', 'manifest.json');
const distSw = path.join(distDir, 'sw.js');
const distManifest = path.join(distDir, 'manifest.json');

if (fs.existsSync(publicSw)) {
  fs.copyFileSync(publicSw, distSw);
  console.log('✅ Copied sw.js to dist');
}
if (fs.existsSync(publicManifest)) {
  fs.copyFileSync(publicManifest, distManifest);
  console.log('✅ Copied manifest.json to dist');
}

// 5. Deep link verification files (AASA / Digital Asset Links)
const publicWellKnown = path.join(__dirname, '..', 'public', '.well-known');
const distWellKnown = path.join(distDir, '.well-known');
if (fs.existsSync(publicWellKnown)) {
  copyRecursiveSync(publicWellKnown, distWellKnown);
  console.log('✅ Copied .well-known (AASA + assetlinks) to dist');
}

