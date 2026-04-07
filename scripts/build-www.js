/**
 * Build script: Copies web assets to www/ for Capacitor
 * Usage: node scripts/build-www.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

// Clean www/
if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true });
}
fs.mkdirSync(WWW, { recursive: true });

// Files to copy (web-only, no server/api files)
const FILES = [
    'index.html',
    'app.js',
    'style.css',
    'astro-engine.js',
    'cities-database.js',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    // Icons (in icons/ folder)
    'icons/apple-touch-icon.png',
    'icons/favicon-16x16.png',
    'icons/favicon-32x32.png',
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png',
    'icons/og-image.svg'
];

let copied = 0;
for (const file of FILES) {
    const src = path.join(ROOT, file);
    const dest = path.join(WWW, file);
    // Ensure subdirectory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        copied++;
    } else {
        console.warn(`  SKIP: ${file} (not found)`);
    }
}

// Patch index.html for Capacitor:
// 1. Add Capacitor JS bridge
// 2. Update API base URL to use the live server
const indexPath = path.join(WWW, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Inject Capacitor bridge before </head>
if (!html.includes('capacitor.js')) {
    html = html.replace(
        '</head>',
        '    <script src="capacitor.js"></script>\n</head>'
    );
}

// Inject native API base URL config before app.js loads
const nativeConfig = `
<script>
    // Capacitor native app config — ALWAYS use remote API in native builds
    window.__ZEMARA_CONFIG = {
        isNative: true,
        apiBase: 'https://zemara.app',
        openVipAccess: true
    };
</script>`;

// Match both <script src="app.js and <script defer src="app.js
html = html.replace(
    /(<script[^>]*src="app\.js)/,
    nativeConfig + '\n$1'
);

fs.writeFileSync(indexPath, html);

// ── Minify JS files ──
const { execSync } = require('child_process');
const jsFiles = ['app.js', 'astro-engine.js', 'cities-database.js'];
let savedBytes = 0;
for (const jsFile of jsFiles) {
    const jsPath = path.join(WWW, jsFile);
    if (!fs.existsSync(jsPath)) continue;
    const originalSize = fs.statSync(jsPath).size;
    try {
        execSync(`npx terser "${jsPath}" --compress --mangle --format ascii_only=false --output "${jsPath}"`, { stdio: 'pipe' });
        const newSize = fs.statSync(jsPath).size;
        const saved = originalSize - newSize;
        savedBytes += saved;
        console.log(`  Minified ${jsFile}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (-${(saved/1024).toFixed(0)}KB)`);
    } catch (e) {
        console.warn(`  SKIP minify ${jsFile}: ${e.message.slice(0, 80)}`);
    }
}

// ── Minify CSS ──
const cssPath = path.join(WWW, 'style.css');
if (fs.existsSync(cssPath)) {
    const originalSize = fs.statSync(cssPath).size;
    let css = fs.readFileSync(cssPath, 'utf8');
    // Basic CSS minification (no dependency needed)
    css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove comments
    css = css.replace(/\s+/g, ' '); // Collapse whitespace
    css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1'); // Remove space around selectors
    css = css.replace(/;}/g, '}'); // Remove last semicolons
    fs.writeFileSync(cssPath, css);
    const newSize = fs.statSync(cssPath).size;
    savedBytes += (originalSize - newSize);
    console.log(`  Minified style.css: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (-${((originalSize-newSize)/1024).toFixed(0)}KB)`);
}

// ── Minify HTML ──
const htmlSize = fs.statSync(indexPath).size;
html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
html = html.replace(/^\s+/gm, ''); // Remove leading whitespace
html = html.replace(/\n\s*\n/g, '\n'); // Remove empty lines
fs.writeFileSync(indexPath, html);
const htmlNewSize = fs.statSync(indexPath).size;
savedBytes += (htmlSize - htmlNewSize);
console.log(`  Minified index.html: ${(htmlSize/1024).toFixed(0)}KB → ${(htmlNewSize/1024).toFixed(0)}KB (-${((htmlSize-htmlNewSize)/1024).toFixed(0)}KB)`);

console.log(`\n  Built www/ — ${copied} files, saved ${(savedBytes/1024).toFixed(0)}KB total`);
console.log('  Ready for: npx cap sync\n');
