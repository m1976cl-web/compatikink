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

  fs.writeFileSync(indexHtmlPath, content, 'utf8');
  fs.writeFileSync(fourOhFourHtmlPath, content, 'utf8');
  console.log('✅ Created 404.html & updated index.html SPA routing');
}
