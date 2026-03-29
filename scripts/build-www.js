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
    // Capacitor native app config
    window.__ASTROMAP_CONFIG = {
        isNative: typeof window.Capacitor !== 'undefined',
        // Set your production API URL here
        apiBase: 'https://wheretolive-nine.vercel.app'
    };
</script>`;

// Match both <script src="app.js and <script defer src="app.js
html = html.replace(
    /(<script[^>]*src="app\.js)/,
    nativeConfig + '\n$1'
);

fs.writeFileSync(indexPath, html);

console.log(`\n  Built www/ — ${copied} files copied`);
console.log('  Ready for: npx cap sync\n');
