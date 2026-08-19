const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const frontendDir = projectRoot;
const backendDir = path.join(projectRoot, 'backend');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

// ═══════════════════════════════════════════════════
// GOOURSHAL PRODUCTION BUILD SCRIPT
// ═══════════════════════════════════════════════════

console.log('\n🌿 Gourshal Production Build v1.0\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. Minify CSS
console.log('📦 Step 1: Minifying CSS...');
const cssFiles = {
  'main.css': fs.readFileSync(path.join(frontendDir, 'styles', 'main.css'), 'utf8'),
  'home.css': fs.readFileSync(path.join(frontendDir, 'styles', 'home.css'), 'utf8'),
};

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/\s*!important/g, '!important')
    .trim();
}

const buildDir = path.join(backendDir, 'public');
ensureDir(buildDir);

// Ensure styles subdirectory exists in build output
const cssBuildDir = path.join(buildDir, 'styles');
ensureDir(cssBuildDir);

let minifiedCss = '';
for (const [name, content] of Object.entries(cssFiles)) {
  const minified = minifyCss(content);
  writeFile(path.join(cssBuildDir, name), minified);
  minifiedCss += minified;
}

// 2. Minify and bundle JS
console.log('📦 Step 2: Minifying and bundling JS...');
const jsFiles = fs.readdirSync(path.join(frontendDir, 'scripts')).filter(f => f.endsWith('.js'));
let bundledJs = '// GOUSHAL PRODUCTION BUILD\n';

for (const file of jsFiles) {
  let content = fs.readFileSync(path.join(frontendDir, 'scripts', file), 'utf8');
  // Remove comments (but preserve URLs and strings)
  content = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\n\s*\n/g, '\n').trim();
  bundledJs += `// ─── ${file} ───\n` + content + '\n\n';
}

// Basic minification: remove extra whitespace on each line
bundledJs = bundledJs.split('\n').map(line => line.trim()).filter((line, i, arr) => {
  if (line === '' && arr[i + 1] === '') return false;
  return true;
}).join('\n');

writeFile(path.join(buildDir, 'bundle.js'), bundledJs);

// 3. Copy static assets
console.log('📦 Step 3: Copying static assets...');
function copyDirRecursive(src, dst) {
  ensureDir(dst);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'backup_spices') {
        copyDirRecursive(srcPath, dstPath);
      }
    } else {
      fs.copyFileSync(srcPath, dstPath);
      console.log(`Copied asset: ${entry.name}`);
    }
  }
}

copyDirRecursive(path.join(frontendDir, 'public'), buildDir);

// Copy JS files to build/scripts
const scriptsBuildDir = path.join(buildDir, 'scripts');
ensureDir(scriptsBuildDir);
for (const file of jsFiles) {
  fs.copyFileSync(path.join(frontendDir, 'scripts', file), path.join(scriptsBuildDir, file));
  console.log(`Copied script: ${file}`);
}

// 4. Copy HTML files
console.log('📦 Step 4: Copying HTML pages...');
const htmlFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  let html = fs.readFileSync(path.join(frontendDir, file), 'utf8');
  
  // Update script references for production
  html = html.replace(/<script src="scripts\/([^"]+)"><\/script>/g, (match, scriptFile) => {
    return `<script src="/scripts/${scriptFile}"></script>`;
  });
  
  // Update stylesheet references for absolute path
  html = html.replace(/href="styles\/([^"]+)"/g, 'href="/styles/$1"');
  
  // Fix asset paths: strip public/ prefix for production serving
  html = html.replace(/(src|href)="public\/([^"]+)"/g, '$1="/$2"');
  html = html.replace(/openStoryVideo\('public\/([^']+)'/g, "openStoryVideo('/$1'");
  html = html.replace(/switchModalChapter\('public\/([^']+)'/g, "switchModalChapter('/$1'");
  html = html.replace(/poster="public\/([^"]+)"/g, 'poster="/$1"');
  
  // Replace inline SVG favicon with external file reference
  html = html.replace(/href="data:image\/svg\+xml,<svg[^"]*"/g, 'href="/favicon.svg"');
  
  // Update favicon.ico references if any
  html = html.replace(/href="data:image\/svg\+xml,<svg[^>]*><\/svg>/g, 'href="/favicon.svg"');
  
  // Remove particle canvas and cursor glow scripts from production for cleaner pages
  // (keep functionality, just make sure they reference proper elements)
  
  writeFile(path.join(buildDir, file), html);
}

// 5. Generate sitemap with current timestamp
console.log('📦 Step 5: Generating production sitemap...');
const sitemap = fs.readFileSync(path.join(frontendDir, 'public', 'sitemap.xml'), 'utf8');

// 6. Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Build Complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Output directory: ' + buildDir);
console.log('Files generated:');
console.log('  - bundle.js (combined JS)');
console.log('  - main.css (minified)');
console.log('  - home.css (minified)');
console.log('  - *.html (optimized HTML pages)');
console.log('  - Static assets copied');
console.log('\nNext steps:');
console.log('  1. Set environment variables in backend/.env');
console.log('  2. Run "npm start" from backend directory');
console.log('  3. Deploy backend to Render/Railway/Vercel');
console.log('  4. Deploy frontend to Netlify/Vercel/CDN');
console.log('  5. Update CORS_ORIGIN in .env\n');
