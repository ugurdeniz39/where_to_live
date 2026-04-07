/**
 * ============================================
 * Zemara v4 — Backend Server
 * Express + OpenAI GPT API Routes
 * Optimized with security, caching & rate limiting
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const Iyzipay = require('iyzipay');
const path = require('path');
const fs = require('fs');
const { getSupabase } = require('./api/_lib/supabase');
const { getDB } = require('./api/_lib/db');

// ═══════════════════════════════════════
// PERSISTENT PAYMENT STORAGE (JSON file)
// ═══════════════════════════════════════
const PAYMENTS_FILE = path.join(__dirname, 'data', 'payments.json');

function loadPayments() {
    try {
        const dir = path.dirname(PAYMENTS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(PAYMENTS_FILE)) return [];
        const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ödeme verisi okunamadı:', err.message);
        return [];
    }
}

function savePayments(payments) {
    try {
        const dir = path.dirname(PAYMENTS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
    } catch (err) {
        console.error('Ödeme verisi kaydedilemedi:', err.message);
    }
}

// Load payments into memory on startup
if (!global.payments) global.payments = loadPayments();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim(),
    timeout: 25000,
    maxRetries: 2
});

// iyzico client — FAIL FAST if keys missing in production
if (process.env.NODE_ENV === 'production' && (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY)) {
    console.error('❌ IYZICO_API_KEY ve IYZICO_SECRET_KEY env vars zorunludur (production)');
}
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

// Plan definitions
const PLANS = {
    'premium-monthly': { price: '49.00', name: 'Zemara Premium Aylık' },
    'premium-yearly':  { price: '490.00', name: 'Zemara Premium Yıllık' },
    'vip-monthly':     { price: '99.00', name: 'Zemara VIP Aylık' },
    'vip-yearly':      { price: '990.00', name: 'Zemara VIP Yıllık' }
};

// CORS — restrict to known origins + allow Capacitor mobile apps
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        // Allow known web origins
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow Capacitor/Cordova native app origins
        if (origin === 'https://localhost' || origin === 'capacitor://localhost' || origin === 'http://localhost') return callback(null, true);
        // Allow Vercel preview deployments
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        callback(new Error('CORS policy: Bu origin izinli değil'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '5mb' })); // 5MB for fortune coffee cup images (base64)

// ═══════════════════════════════════════
// RATE LIMITING — AI endpoint'leri koru
// ═══════════════════════════════════════
const aiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Çok fazla istek gönderdin, lütfen 1 dakika bekle.' }
});
// Tüm /api/* yollarına uygula
app.use('/api/fortune', aiRateLimit);
app.use('/api/horoscope', aiRateLimit);
app.use('/api/natal', aiRateLimit);
app.use('/api/transit', aiRateLimit);
app.use('/api/compatibility', aiRateLimit);
app.use('/api/tarot', aiRateLimit);
app.use('/api/dream', aiRateLimit);
app.use('/api/crystal', aiRateLimit);

// ═══════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://i.pravatar.cc",
        "connect-src 'self' https://zemara.app https://*.vercel.app",
        "frame-src 'self' https://*.iyzipay.com",
        "base-uri 'self'",
        "form-action 'self' https://*.iyzipay.com"
    ].join('; '));
    next();
});

// ═══════════════════════════════════════
// RATE LIMITING (IN-MEMORY)
// ═══════════════════════════════════════
const rateLimits = new Map();
const RATE_WINDOW = 60000; // 1 minute
const RATE_MAX = 20; // max 20 AI requests per minute

function customRateLimit(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress;
    const now = Date.now();
    const record = rateLimits.get(ip) || { count: 0, start: now };
    
    if (now - record.start > RATE_WINDOW) {
        record.count = 1;
        record.start = now;
    } else {
        record.count++;
    }
    
    rateLimits.set(ip, record);
    
    if (record.count > RATE_MAX) {
        return res.status(429).json({ error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' });
    }
    
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_MAX - record.count));
    next();
}

// Clean up rate limit map every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimits) {
        if (now - record.start > RATE_WINDOW * 2) rateLimits.delete(ip);
    }
}, 300000);

// ═══════════════════════════════════════
// SERVER-SIDE RESPONSE CACHE
// ═══════════════════════════════════════
const responseCache = new Map();

// Per-endpoint cache TTLs (ms)
const CACHE_TTLS = {
    daily: 3600000,       // 1 hour — daily horoscope changes once per day
    compatibility: 1800000, // 30 min — same input = same result
    crystal: 1800000,      // 30 min — mood-dependent
    city: 7200000,         // 2 hours — city insights are stable
    dream: 0,              // no cache — every dream is unique
    tarot: 0,              // no cache — must be unique each draw
    fortune: 0,            // no cache — each image is unique
    transit: 86400000,     // 24 hours — daily transits stable
    natal: 3600000,        // 1 hour — natal chart interpretation stable
    default: 1800000       // 30 min fallback
};

function getCachedResponse(key, endpoint) {
    const entry = responseCache.get(key);
    if (!entry) return null;
    const ttl = CACHE_TTLS[endpoint] || CACHE_TTLS.default;
    if (ttl === 0 || Date.now() - entry.ts > ttl) {
        responseCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCachedResponse(key, data, endpoint) {
    const ttl = CACHE_TTLS[endpoint] || CACHE_TTLS.default;
    if (ttl === 0) return; // Don't cache endpoints with TTL=0
    responseCache.set(key, { data, ts: Date.now() });
    // Keep max 200 entries
    if (responseCache.size > 200) {
        const oldest = responseCache.keys().next().value;
        responseCache.delete(oldest);
    }
}

// Static files with caching headers — only serve safe public files
const staticOptions = {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        } else if (/\.(png|jpg|svg|ico|webp|woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.json') && !filePath.includes('package')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
};
// Serve only specific safe directories/files, not the project root
app.use('/icons', express.static(path.join(__dirname, 'icons'), staticOptions));
app.use('/manifest.json', express.static(path.join(__dirname, 'manifest.json'), staticOptions));
app.use('/robots.txt', express.static(path.join(__dirname, 'robots.txt'), staticOptions));
app.use('/sitemap.xml', express.static(path.join(__dirname, 'sitemap.xml'), staticOptions));
app.use('/sw.js', express.static(path.join(__dirname, 'sw.js'), staticOptions));
app.use('/app.js', express.static(path.join(__dirname, 'app.js'), staticOptions));
app.use('/style.css', express.static(path.join(__dirname, 'style.css'), staticOptions));
app.use('/astro-engine.js', express.static(path.join(__dirname, 'astro-engine.js'), staticOptions));
app.use('/cities-database.js', express.static(path.join(__dirname, 'cities-database.js'), staticOptions));
app.use('/privacy.html', express.static(path.join(__dirname, 'privacy.html'), staticOptions));

// ═══════════════════════════════════════
// INPUT VALIDATION MIDDLEWARE
// ═══════════════════════════════════════
function validateInput(req, res, next) {
    if (req.method !== 'POST') return next();
    const body = req.body;
    if (!body || typeof body !== 'object') return next();
    // Limit string field lengths to prevent token abuse
    const MAX_TEXT_LEN = 2000;
    for (const [key, val] of Object.entries(body)) {
        if (typeof val === 'string' && val.length > MAX_TEXT_LEN) {
            return res.status(400).json({ error: `Alan çok uzun: ${key} (max ${MAX_TEXT_LEN} karakter)` });
        }
    }
    // Validate nested objects (person1, person2, billing)
    for (const val of Object.values(body)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            for (const [k2, v2] of Object.entries(val)) {
                if (typeof v2 === 'string' && v2.length > MAX_TEXT_LEN) {
                    return res.status(400).json({ error: `Alan çok uzun: ${k2} (max ${MAX_TEXT_LEN} karakter)` });
                }
            }
        }
    }
    next();
}

// Apply rate limiting and input validation to all API routes
app.use('/api', customRateLimit);
app.use('/api', validateInput);

// ═══════════════════════════════════════
// HELPER: GPT Call with retry
// ═══════════════════════════════════════
async function askGPT(systemPrompt, userPrompt, maxTokens = 1000) {
    const MAX_RETRIES = 2;
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature: attempt === 0 ? 0.85 : 0.7 // Lower temp on retry for more consistent JSON
            });
            return response.choices[0].message.content;
        } catch (err) {
            lastError = err;
            console.error(`OpenAI Error (attempt ${attempt + 1}):`, err.message);
            if (err.status === 429) {
                // Rate limited — wait before retry
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }
            if (err.status >= 500) {
                // Server error — retry
                await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                continue;
            }
            // Client error (400, 401, etc) — don't retry
            break;
        }
    }
    console.error('OpenAI final error:', lastError?.message);
    throw new Error('AI servisi şu an yanıt veremiyor. Lütfen tekrar dene.');
}

/**
 * Robust JSON extraction from GPT response
 * Handles markdown code blocks, trailing commas, unescaped newlines
 */
function extractJSON(raw) {
    // Strip markdown code blocks
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Try direct parse first
    try { return JSON.parse(cleaned.trim()); } catch {}

    // Extract outermost {...}
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    let jsonStr = match[0];

    // Fix common GPT JSON issues:
    // 1. Trailing commas before } or ]
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
    // 2. Single quotes → double quotes (careful with apostrophes in text)
    // Only do this if there are no double-quoted strings
    if (!jsonStr.includes('"')) {
        jsonStr = jsonStr.replace(/'/g, '"');
    }
    // 3. Unquoted keys
    jsonStr = jsonStr.replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":');

    try { return JSON.parse(jsonStr); } catch {}

    // Last resort: try to fix broken strings with newlines
    jsonStr = jsonStr.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
    try { return JSON.parse(jsonStr); } catch (e) {
        console.error('JSON extraction failed:', e.message, '\nRaw:', raw.substring(0, 200));
        return null;
    }
}

// ═══════════════════════════════════════
// API: Analytics — Event Logging
// ═══════════════════════════════════════
const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics.jsonl');

app.post('/api/analytics', (req, res) => {
    try {
        const { event, data, session, page } = req.body;
        if (!event || typeof event !== 'string') return res.status(400).json({ error: 'event gerekli' });

        const rawIp = req.ip || req.socket?.remoteAddress || '';
        // GDPR/KVKK: Anonymize IP — zero out last octet (IPv4) or last 80 bits (IPv6)
        const ip = rawIp.includes(':')
            ? rawIp.replace(/:[0-9a-f]{0,4}:[0-9a-f]{0,4}:[0-9a-f]{0,4}:[0-9a-f]{0,4}:[0-9a-f]{0,4}$/i, ':0:0:0:0:0')
            : rawIp.replace(/\.\d+$/, '.0');

        // DB (fire-and-forget — don't block response)
        const db = getDB() || getSupabase();
        if (db && db.query) {
            // Neon/pg
            db.query(
                'INSERT INTO analytics (event, data, session_id, page, ip) VALUES ($1, $2, $3, $4, $5)',
                [event.slice(0, 100), JSON.stringify(typeof data === 'object' ? data : {}), (session || '').slice(0, 50), (page || '').slice(0, 100), ip || null]
            ).catch(() => {});
            return res.json({ ok: true });
        } else if (db) {
            // Supabase fallback
            db.from('analytics').insert({
                event: event.slice(0, 100),
                data: typeof data === 'object' ? data : {},
                session_id: (session || '').slice(0, 50),
                page: (page || '').slice(0, 100),
                ip  // Already anonymized above
            }).then(() => {}).catch(() => {});
            return res.json({ ok: true });
        }

        // Fallback: JSONL file
        const entry = {
            event: event.slice(0, 100),
            data: typeof data === 'object' ? data : {},
            session: (session || '').slice(0, 50),
            page: (page || '').slice(0, 100),
            ts: new Date().toISOString(),
            ip
        };
        const dir = path.dirname(ANALYTICS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(ANALYTICS_FILE, JSON.stringify(entry) + '\n', 'utf-8');
        res.json({ ok: true });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.json({ ok: false });
    }
});

app.get('/api/analytics/summary', async (req, res) => {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || req.query.token !== adminToken) return res.status(403).json({ error: 'Yetkisiz erişim' });
    try {
        const db = getDB() || getSupabase();
        if (db && db.query) {
            // Neon/pg
            const [rowsRes, countRes] = await Promise.all([
                db.query('SELECT event, page, session_id FROM analytics ORDER BY created_at DESC LIMIT 10000'),
                db.query('SELECT COUNT(*) as total FROM analytics')
            ]);
            const events = {}, pages = {};
            const sessions = new Set();
            for (const e of rowsRes.rows) {
                events[e.event] = (events[e.event] || 0) + 1;
                if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
                if (e.session_id) sessions.add(e.session_id);
            }
            return res.json({ total: parseInt(countRes.rows[0].total), uniqueSessions: sessions.size, events, pages, source: 'neon' });
        } else if (db) {
            // Supabase fallback
            const { data, count } = await db.from('analytics')
                .select('event, page, session_id', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(10000);
            const events = {}, pages = {};
            const sessions = new Set();
            for (const e of (data || [])) {
                events[e.event] = (events[e.event] || 0) + 1;
                if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
                if (e.session_id) sessions.add(e.session_id);
            }
            return res.json({ total: count || 0, uniqueSessions: sessions.size, events, pages, source: 'supabase' });
        }
        // Fallback: JSONL file
        if (!fs.existsSync(ANALYTICS_FILE)) return res.json({ total: 0, events: {} });
        const lines = fs.readFileSync(ANALYTICS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
        const events = {}, pages = {};
        const sessions = new Set();
        for (const line of lines.slice(-10000)) {
            try {
                const e = JSON.parse(line);
                events[e.event] = (events[e.event] || 0) + 1;
                if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
                if (e.session) sessions.add(e.session);
            } catch {}
        }
        res.json({ total: lines.length, uniqueSessions: sessions.size, events, pages, source: 'file' });
    } catch (err) {
        res.json({ total: 0, events: {}, error: err.message });
    }
});

// ═══════════════════════════════════════
// API: Push Notification — Token Registration
// ═══════════════════════════════════════
const PUSH_TOKENS_FILE = path.join(__dirname, 'data', 'push-tokens.json');

function loadPushTokens() {
    try {
        if (!fs.existsSync(PUSH_TOKENS_FILE)) return [];
        return JSON.parse(fs.readFileSync(PUSH_TOKENS_FILE, 'utf-8'));
    } catch { return []; }
}

function savePushTokens(tokens) {
    try {
        const dir = path.dirname(PUSH_TOKENS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(PUSH_TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
    } catch (err) { console.error('Push token kayıt hatası:', err.message); }
}

app.post('/api/push/register', async (req, res) => {
    try {
        const { token, subscription, platform, user } = req.body;
        if (!token && !subscription) return res.status(400).json({ error: 'Token veya subscription gerekli' });

        const identifier = token || JSON.stringify(subscription);

        const db = getDB() || getSupabase();
        if (db && db.query) {
            // Neon/pg
            await db.query(
                `INSERT INTO push_tokens (identifier, token, subscription, platform, user_email, last_seen)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 ON CONFLICT (identifier) DO UPDATE SET
                   token = EXCLUDED.token, platform = EXCLUDED.platform,
                   user_email = EXCLUDED.user_email, last_seen = NOW()`,
                [identifier, token || null, subscription ? JSON.stringify(subscription) : null, platform || 'unknown', user || 'anonymous']
            );
            return res.json({ ok: true });
        } else if (db) {
            // Supabase fallback
            await db.from('push_tokens').upsert({
                identifier,
                token: token || null,
                subscription: subscription || null,
                platform: platform || 'unknown',
                user_email: user || 'anonymous',
                last_seen: new Date().toISOString()
            }, { onConflict: 'identifier' });
            return res.json({ ok: true });
        }

        // Fallback: JSON file
        const tokens = loadPushTokens();
        const exists = tokens.find(t => t.identifier === identifier);
        if (exists) {
            exists.lastSeen = new Date().toISOString();
            exists.user = user || exists.user;
        } else {
            tokens.push({
                identifier,
                token: token || null,
                subscription: subscription || null,
                platform: platform || 'unknown',
                user: user || 'anonymous',
                registeredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            });
        }
        savePushTokens(tokens);
        res.json({ ok: true, total: tokens.length });
    } catch (err) {
        console.error('Push register error:', err.message);
        res.status(500).json({ error: 'Token kaydedilemedi' });
    }
});

app.get('/api/push/stats', (req, res) => {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || req.query.token !== adminToken) return res.status(403).json({ error: 'Yetkisiz erişim' });
    const tokens = loadPushTokens();
    const platforms = {};
    tokens.forEach(t => { platforms[t.platform] = (platforms[t.platform] || 0) + 1; });
    res.json({ total: tokens.length, platforms });
});

// ═══════════════════════════════════════
// API: Health Check
// ═══════════════════════════════════════
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        version: '4.0', 
        ai: !!process.env.OPENAI_API_KEY,
        cache: responseCache.size,
        uptime: Math.round(process.uptime()) + 's'
    });
});

// ═══════════════════════════════════════
// API: AI Günlük Yorum
// ═══════════════════════════════════════
app.post('/api/daily-horoscope', async (req, res) => {
    try {
        const { name, gender, birthDate, birthTime, sunSign, moonSign, risingSign, period } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });

        const lang = req.body.lang || 'tr';
        const langInstruction = lang === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const periodLabel = { weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık' }[period] || 'Günlük';
        const periodScope = { weekly: 'Bu hafta', monthly: 'Bu ay', yearly: 'Bu yıl' }[period] || 'Bugün';
        const userName = name || 'Sevgili';

        const genderText = {
            'kadın': { tone: 'zarif, şefkatli ve güçlendirici' },
            'erkek': { tone: 'güçlü, cesur ve ilham verici' },
            'diğer': { tone: 'dost canlı, saygılı ve ilham verici' }
        }[gender] || { tone: 'sıcak ve ilham verici' };

        // Period-specific configuration
        const periodConfig = {
            daily:   { scoreLow: 35, scoreHigh: 98, sentences: '2-3', maxTokens: 800 },
            weekly:  { scoreLow: 40, scoreHigh: 95, sentences: '3-4', maxTokens: 900 },
            monthly: { scoreLow: 30, scoreHigh: 97, sentences: '4-5', maxTokens: 1000 },
            yearly:  { scoreLow: 25, scoreHigh: 99, sentences: '5-6', maxTokens: 1100 }
        };
        const pc = periodConfig[period] || periodConfig.daily;

        const systemPrompt = `Sen derin astroloji bilgisine sahip, sezgisel ve empatik bir astrologsun. ${langInstruction}
${userName} adında birine hitap ediyorsun — ${genderText.tone} bir ton kullan.
${userName}'in adını doğal şekilde kullan (her cümlede değil, anahtar noktalarda).
Emoji kullan ama abartma. Her bölümü net, akıcı ve BİRBİRİNDEN FARKLI yaz.

Bu bir ${periodLabel} yorumdur. ${periodScope} için detaylı yorum yaz.

ÖNEMLI KURALLAR:
- Skorlar GERÇEKÇİ olsun. Her gün mükemmel olamaz! Bazı alanlar düşük (${pc.scoreLow}-55), bazıları yüksek (75-${pc.scoreHigh}) olabilir.
- Her skor alanı İÇ TUTARLI olsun: düşük skor verdiysen yorumda da bunu yansıt (zorluk, dikkat gereken alan).
- Klişe "harika günler seni bekliyor" tipi cümlelerden KAÇIN. Spesifik, somut ve kişiye özel yaz.
- ${period === 'yearly' ? 'Yıllık yorumda mevsim mevsim farklı enerjilere değin.' : ''}
- ${period === 'monthly' ? 'Aylık yorumda haftalar arası enerji değişimlerine değin.' : ''}
- ${period === 'weekly' ? 'Haftalık yorumda hafta başı-ortası-sonu farklı enerjilerine değin.' : ''}

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "${periodScope} genel enerjisi, ${pc.sentences} cümle. Gezegen geçişlerine değin.",
  "love": "Aşk ve ilişkiler, ${pc.sentences} cümle. Somut tavsiyelerle.",
  "career": "Kariyer ve finans, ${pc.sentences} cümle. Pratik önerilerle.",
  "health": "Sağlık ve enerji, ${pc.sentences} cümle. Spesifik öneriler.",
  "advice": "${periodLabel} en önemli tavsiye, 1-2 cümle. SOMUT ve uygulanabilir.",
  "affirmation": "Güçlü ve özgün bir olumlama cümlesi",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": ${pc.scoreLow}-${pc.scoreHigh}, "career": ${pc.scoreLow}-${pc.scoreHigh}, "health": ${pc.scoreLow}-${pc.scoreHigh}, "luck": ${pc.scoreLow}-${pc.scoreHigh}, "energy": ${pc.scoreLow}-${pc.scoreHigh}, "mood": ${pc.scoreLow}-${pc.scoreHigh} },
  "tarotCard": "${periodLabel} tarot kartı adı (gerçek tarot kartı seç)",
  "tarotMeaning": "Bu kartın ${periodScope.toLowerCase()} senin için anlamı, 1-2 cümle"
}`;

        const userPrompt = `Bugün ${today}.
Kişi bilgileri: ${userName}, doğum tarihi ${birthDate}, doğum saati ${birthTime || 'bilinmiyor'}.
Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}, Yükselen: ${risingSign || 'bilinmiyor'}.
Bu kişi için ${periodLabel.toLowerCase()} detaylı ve GERÇEKÇİ astroloji yorumunu yaz.
Tüm alanlar mükemmel olamaz — bazı konularda zorluklar veya dikkat edilmesi gereken noktalar olmalı.`;

        // Check server cache
        const cacheKey = `daily_${period || 'daily'}_${birthDate}_${birthTime}_${sunSign}_${(name || '').slice(0,20)}_${gender || ''}`;
        const cached = getCachedResponse(cacheKey, 'daily');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, pc.maxTokens);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'daily');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: AI Uyum Testi
// ═══════════════════════════════════════
app.post('/api/compatibility', async (req, res) => {
    try {
        const { person1, person2 } = req.body;
        if (!person1?.birthDate || !person2?.birthDate) {
            return res.status(400).json({ error: 'Her iki kişinin doğum tarihi gerekli' });
        }

        const systemPrompt = `Sen romantik ilişki uyumu konusunda uzman bir astrologsun. Türkçe yaz.
Samimi, sıcak ve romantik bir ton kullan. Emoji kullan.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "overall": 50-99 arası genel uyum skoru,
  "romance": 40-99 arası romantizm skoru,
  "communication": 40-99 arası iletişim skoru, 
  "passion": 40-99 arası tutku skoru,
  "longTerm": 40-99 arası uzun vade skoru,
  "trust": 40-99 arası güven skoru,
  "summary": "Genel uyum hakkında 2-3 cümlelik özet",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
  "challenges": ["Zorluk 1", "Zorluk 2"],
  "advice": "İlişki için özel tavsiye, 2-3 cümle",
  "soulConnection": "Ruhsal bağlantı açıklaması, 1-2 cümle",
  "bestDates": "Birlikte en iyi vakit geçirecekleri aktiviteler, 1 cümle",
  "sign1": "Kişi 1 güneş burcu",
  "sign2": "Kişi 2 güneş burcu",
  "elementCompat": "Element uyumu açıklaması, 1 cümle"
}`;

        const userPrompt = `İki kişinin astrolojik uyumunu analiz et:
Kişi 1: Doğum ${person1.birthDate}, saat ${person1.birthTime || 'bilinmiyor'}, burç: ${person1.sunSign || 'bilinmiyor'}, ay: ${person1.moonSign || 'bilinmiyor'}
Kişi 2: Doğum ${person2.birthDate}, saat ${person2.birthTime || 'bilinmiyor'}, burç: ${person2.sunSign || 'bilinmiyor'}, ay: ${person2.moonSign || 'bilinmiyor'}
Detaylı romantik uyum analizi yap.`;

        // Cache compatibility results
        const cacheKey = `compat_${person1.birthDate}_${person2.birthDate}_${person1.sunSign}_${person2.sunSign}`;
        const cached = getCachedResponse(cacheKey, 'compatibility');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'compatibility');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: AI Kristal & Wellness Rehberi
// ═══════════════════════════════════════
app.post('/api/crystal-guide', async (req, res) => {
    try {
        const { birthDate, sunSign, moonSign, mood } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });

        const lang = req.body.lang || 'tr';
        const langInstruction = lang === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

        const systemPrompt = `Sen kristal terapi, çakra dengeleme, aromaterapi ve bütünsel wellness konusunda 20 yıllık deneyime sahip bir spiritüel rehbersin. ${langInstruction}
Sıcak, şefkatli ve bilge bir ton kullan. Kişiyi güçlendiren, rahatlatıcı bir dil kullan.

ÖNEMLİ KURALLAR:
- Her seferinde FARKLI kristaller öner. Ametist, Rozekuvars gibi bilinen kristalleri BAZEN öner, ama Labradorit, Moldavit, Sunstone, Larimar, Selenite, Karneol, Sitrin, Akuamarin, Lepidolit, Rodokrozit gibi çeşitli kristalleri de kullan.
- Ruh haline GERÇEKTEN uygun kristal seç — "stresli" diyen birine rahatlatıcı, "enerjisiz" diyen birine enerji veren.
- Çakra bilgisi SPESİFİK olsun — hangi çakra neden bloke, nasıl açılır.
- Meditasyon süresi ve mantra kişiselleştirilmiş olsun.
- Renk önerileri burcun elementine uygun olsun.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "mainCrystal": { "name": "Ana kristal adı", "emoji": "uygun emoji", "color": "#hex renk", "benefit": "Bu kristalin sana faydası, 2-3 cümle. SPESİFİK.", "howToUse": "Nasıl kullanılır — nereye koyulmalı, ne zaman tutulmalı, 2 cümle", "cleansingTip": "Bu kristali nasıl temizlersin, 1 cümle" },
  "supportCrystals": [
    { "name": "Destek kristal 1", "emoji": "emoji", "benefit": "Kısa fayda, 1-2 cümle" },
    { "name": "Destek kristal 2", "emoji": "emoji", "benefit": "Kısa fayda, 1-2 cümle" },
    { "name": "Destek kristal 3", "emoji": "emoji", "benefit": "Kısa fayda, 1-2 cümle" }
  ],
  "chakra": { "name": "Odaklanman gereken çakra", "color": "#hex", "location": "Çakranın vücuttaki yeri", "blockReason": "Bu çakra neden bloke olabilir, 1 cümle", "tip": "Çakra dengeleme tekniği, 2 cümle" },
  "colors": { "wear": "Bugün giymeni önerdiğim renk ve NEDEN", "avoid": "Kaçınman gereken renk ve NEDEN", "home": "Evinde bulundurman gereken renk" },
  "meditation": { "duration": "X dakika", "focus": "Meditasyon odağı, 1 cümle", "mantra": "Tekrar edilecek mantra — TÜRKÇE ve anlamlı", "technique": "Nefes tekniği veya pozisyon, 1 cümle" },
  "tea": { "name": "Bitki çayı adı", "benefit": "Faydası, 1 cümle", "recipe": "Nasıl demlenir, 1 cümle" },
  "oil": { "name": "Esansiyel yağ adı", "usage": "Nasıl kullanılır, 1 cümle", "blend": "Hangi yağla karıştırılabilir" },
  "moonRitual": "Bugünün ay fazına göre yapılabilecek ritüel, 3 cümle. SPESİFİK adımlar ver.",
  "dailyPractice": "Bugüne özel 3 adımlık mini wellness rutini",
  "affirmation": "Güçlendirici ve ÖZGÜN bir olumlama cümlesi — klişe olmasın"
}`;

        const userPrompt = `Tarih: ${today}.
Kişi: Doğum ${birthDate}, Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}.
Şu anki ruh hali: ${mood || 'genel denge arayışı'}.
Bu kişi için BUGÜNÜN enerjisine özel, derinlemesine kristal ve wellness rehberliği ver.
Her öneri spesifik ve uygulanabilir olsun.`;

        const cacheKey = `crystal_${birthDate}_${sunSign}_${mood || 'general'}_${new Date().toDateString()}`;
        const cached = getCachedResponse(cacheKey, 'crystal');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, 1000);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'crystal');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: AI Tarot Çekimi
// ═══════════════════════════════════════
app.post('/api/tarot', async (req, res) => {
    try {
        const { birthDate, sunSign, question, spread, forOther } = req.body;

        const lang = req.body.lang || 'tr';
        const langInstruction = lang === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        // ── Spread configurations ──
        const SPREADS = {
            'three-card': {
                count: 3,
                positions: ['Geçmiş', 'Şimdi', 'Gelecek'],
                desc: 'Geçmiş-Şimdi-Gelecek üç kart açılımı',
                tokens: 1000
            },
            'yes-no': {
                count: 1,
                positions: ['Cevap'],
                desc: 'Tek kart Evet/Hayır açılımı — kartın dik veya ters gelmesine göre cevap',
                tokens: 600
            },
            'relationship': {
                count: 3,
                positions: ['Sen', 'O', 'Aranızdaki Enerji'],
                desc: 'İlişki açılımı — iki kişi arasındaki enerjiyi inceler',
                tokens: 1000
            },
            'celtic-cross': {
                count: 10,
                positions: ['Mevcut Durum', 'Engel', 'Bilinçaltı', 'Geçmiş', 'Olası Gelecek', 'Yakın Gelecek', 'Tutum', 'Çevre', 'Umut & Korku', 'Sonuç'],
                desc: 'Kelt Haçı — 10 kartlık derinlemesine analiz',
                tokens: 3200
            }
        };

        const spreadConfig = SPREADS[spread] || SPREADS['three-card'];

        // ── Build 78-card deck with zodiac element weighting ──
        const majorArcana = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
        const suits = ['Wands','Cups','Swords','Pentacles'];
        const ranks = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
        const minorArcana = suits.flatMap(s => ranks.map(r => `${r} of ${s}`));

        // Element-weighted deck: boost suit matching zodiac element
        const signElements = {
            'Koç': 'fire', 'Aslan': 'fire', 'Yay': 'fire',
            'Boğa': 'earth', 'Başak': 'earth', 'Oğlak': 'earth',
            'İkizler': 'air', 'Terazi': 'air', 'Kova': 'air',
            'Yengeç': 'water', 'Akrep': 'water', 'Balık': 'water'
        };
        const elementSuit = { fire: 'Wands', water: 'Cups', air: 'Swords', earth: 'Pentacles' };
        const userElement = signElements[sunSign] || null;
        const boostedSuit = userElement ? elementSuit[userElement] : null;

        // Build weighted deck — boosted suit cards appear 2x
        let fullDeck = [...majorArcana, ...minorArcana];
        if (boostedSuit) {
            const boosted = minorArcana.filter(c => c.includes(boostedSuit));
            fullDeck = [...fullDeck, ...boosted]; // Add extra copies of matching suit
        }

        // Shuffle and pick
        const shuffled = fullDeck.sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, spreadConfig.count);
        const reversals = picked.map(() => Math.random() < 0.3);

        // ── Build dynamic prompt based on spread ──
        const cardsList = picked.map((card, i) =>
            `{ "position": "${spreadConfig.positions[i]}", "name": "Kartın Türkçe adı", "nameEn": "${card}", "emoji": "uygun tek emoji", "arcanaType": "Büyük Arcana veya Küçük Arcana", "romanNumeral": "Büyük Arcana için romen rakamı örn: XIV (Büyük Arcana değilse null)", "meaning": "Bu kartın ${spreadConfig.positions[i]} pozisyonundaki DERİN anlamı, 3-4 cümle.", "reversed": ${reversals[i]}, "keywords": ["kısa anahtar 1", "kısa anahtar 2", "kısa anahtar 3"] }`
        ).join(',\n    ');

        const pickedList = picked.map((card, i) =>
            `${i + 1}. ${spreadConfig.positions[i]}: ${card}${reversals[i] ? ' (TERS)' : ''}`
        ).join('\n');

        const systemPrompt = `Sen derin bilgiye sahip, gizemli ve empatik bir tarot ustasısın. ${langInstruction}
Mistik, şefkatli ve bilge bir ton kullan. Danışanını derinden anlamaya çalış.
${question ? 'Danışanın sana özel bir soru sordu — okumanın HER AŞAMASINI bu soruya bağla.' : ''}
Bu bir ${spreadConfig.desc}.
${sunSign ? `Danışanın ${sunSign} burcunda — bu burcun enerjisini yorumlarına yansıt.` : ''}

KURALLAR:
- Sana verilen ${spreadConfig.count} kartı AYNEN kullan, değiştirme.
- Her kartın anlamını pozisyonuna ve ${question ? 'sorulan soruya' : 'kişinin yaşam enerjisine'} göre ÖZEL yorumla.
- Reversed (ters) kartları farklı yorumla — engel, iç çatışma veya gizli ders.
- Genel mesajda kartların BAĞLANTISINI kur — bir hikaye anlat.
${spread === 'yes-no' ? '- Evet/Hayır açılımı: Kartın dik gelmesi olumlu (EVET), ters gelmesi olumsuz (HAYIR) veya bekle anlamına gelir. Net bir cevap ver.' : ''}
${spread === 'relationship' ? '- İlişki açılımı: Her kartı ilgili kişinin perspektifinden oku. Üçüncü kart ilişkinin dinamiğini gösterir.' : ''}

Yanıtını MUTLAKA aşağıdaki JSON formatında ver:
{
  "cards": [
    ${cardsList}
  ],
  "overall": "Kartların birlikte anlattığı HIKAYE, 4-5 cümle.",
  "advice": "Somut ve uygulanabilir tavsiye, 2-3 cümle",
  "energy": "Baskın enerji, tek kelime veya kısa ifade",
  "warning": "Dikkat çekilen nokta, 1 cümle"${spread === 'yes-no' ? ',\n  "answer": "EVET veya HAYIR veya BEKLE — net bir cevap"' : ''}
}`;

        const subjectLine = forOther
            ? `Fal bakılan kişi: ${forOther.name || 'bilinmiyor'}, Doğum: ${forOther.birthDate || 'bilinmiyor'}, Güneş burcu: ${forOther.sunSign || sunSign || 'bilinmiyor'}.`
            : `Danışan: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.`;

        const userPrompt = `${subjectLine}
${question ? `SORUSU: "${question}"` : 'Hayatının genel akışı hakkında derin bir okuma isteniyor.'}

Açılım: ${spreadConfig.desc}
Çekilen kartlar:
${pickedList}

Bu kartları derinlemesine yorumla.`;

        const raw = await askGPT(systemPrompt, userPrompt, spreadConfig.tokens);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: Transit Rapor
// ═══════════════════════════════════════
app.post('/api/transit', async (req, res) => {
    try {
        const { birthDate, sunSign, isPremium, lang } = req.body;
        if (!isPremium) return res.status(403).json({ error: 'premium_required' });
        if (!sunSign) return res.status(400).json({ error: 'sunSign gerekli' });

        const today = new Date().toISOString().slice(0, 10);
        const langCode = lang || 'tr';
        const cacheKey = `transit_${sunSign}_${birthDate || 'unknown'}_${today}_${langCode}`;
        const cached = getCachedResponse(cacheKey, 'transit');
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const langInstruction = langCode === 'en'
            ? 'Write ALL your response in ENGLISH.'
            : 'Tüm yanıtını TÜRKÇE yaz.';

        const systemPrompt = `Sen deneyimli bir astroloji uzmanısın. ${langInstruction}
Güncel gezegen konumlarına dayanarak kişisel transit raporu hazırla.
Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "transits": [
    {
      "planet": "gezegen adı",
      "aspect": "açı tipi",
      "natalPlanet": "natal gezegenin adı",
      "effect": "positive veya challenging veya neutral",
      "title": "kısa başlık",
      "description": "2-3 cümle kişisel açıklama",
      "advice": "somut 1 cümle tavsiye",
      "duration": "süre bilgisi"
    }
  ],
  "overallEnergy": "Bu dönem genel enerji özeti, 2 cümle",
  "bestDays": "Bu ay en güçlü günler"
}`;

        const userPrompt = `${sunSign} burcu için güncel transit raporu hazırla.${birthDate ? ` Doğum tarihi: ${birthDate}.` : ''}
3 önemli aktif transit ver. Mevcut tarihe göre gerçekçi gezegen hareketlerini kullan.`;

        const raw = await askGPT(systemPrompt, userPrompt, 700, 0.8);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'transit');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: Natal Chart AI Yorumu
// ═══════════════════════════════════════
app.post('/api/natal-interpretation', async (req, res) => {
    try {
        const { planets, sunSign, moonSign, ascendant, lang } = req.body;
        if (!planets || !sunSign) return res.status(400).json({ error: 'planets ve sunSign gerekli' });

        const langCode = lang || 'tr';
        const cacheKey = `natal_${sunSign}_${moonSign || ''}_${ascendant || ''}_${JSON.stringify(planets).slice(0, 80)}_${langCode}`;
        const cached = getCachedResponse(cacheKey, 'natal');
        if (cached) return res.json({ success: true, data: cached, cached: true });

        const langInstruction = langCode === 'en'
            ? 'Write ALL your response in ENGLISH.'
            : 'Tüm yanıtını TÜRKÇE yaz.';

        const systemPrompt = `Sen doğum haritası yorumlama uzmanı bir astrologsun. ${langInstruction}
Bilgece, ilham verici ama somut bir ton kullan. Klişelerden kaçın. Gezegenleri birbirleriyle bağdaştır.
Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "summary": "Kişinin genel karakter özeti, 4-5 cümle.",
  "strongestPlanet": "En güçlü gezegen adı",
  "strongestPlanetReason": "Neden bu gezegen güçlü, 1-2 cümle",
  "lifeThemes": ["Temel yaşam teması 1", "tema 2", "tema 3"],
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
  "challenges": ["Zorluk 1", "Zorluk 2"],
  "advice": "Bu kişiye özel yaşam tavsiyesi, 2-3 cümle. Somut ve uygulanabilir.",
  "soulPurpose": "Ruhsal amaç veya yaşam dersi, 1-2 cümle"
}`;

        const planetList = Object.entries(planets)
            .map(([k, v]) => `${k}: ${v.sign}${v.degree ? ' ' + Number(v.degree).toFixed(1) + '°' : ''}`)
            .join(', ');

        const userPrompt = `Doğum haritası:
Gezegenler: ${planetList}
Güneş: ${sunSign}, Ay: ${moonSign || 'bilinmiyor'}, Yükselen: ${ascendant || 'bilinmiyor'}
Bu haritayı derinlemesine yorumla. Somut ve kişisel ol.`;

        const raw = await askGPT(systemPrompt, userPrompt, 700, 0.85);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'natal');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: AI Şehir Tavsiyesi (Neden bu şehir?)
// ═══════════════════════════════════════
app.post('/api/city-insight', async (req, res) => {
    try {
        const { city, country, score, influences, sunSign, moonSign, preferences } = req.body;
        if (!city) return res.status(400).json({ error: 'Şehir bilgisi gerekli' });

        const systemPrompt = `Sen astrokartografi ve yaşam koçluğu uzmanısın. Türkçe yaz.
İlham verici, heyecan uyandıran bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "headline": "Bu şehir hakkında çarpıcı tek cümle başlık",
  "whyThisCity": "Bu şehrin kişi için neden ideal olduğu, 3-4 cümle. Astrolojik açıdan açıkla.",
  "energy": "Şehrin genel enerjisi ve atmosferi, 2 cümle",
  "bestFor": ["Bu şehirde en iyi yapılacak şey 1", "şey 2", "şey 3"],
  "lifestyle": "Bu şehirde nasıl bir yaşam tarzı beklemeli, 2-3 cümle",
  "bestSeason": "Bu şehre taşınmak/ziyaret için en iyi mevsim ve nedeni",
  "tip": "Bu şehirde yaşayacak birine özel ipucu, 1-2 cümle",
  "vibe": "Tek kelimelik ruh hali tanımı"
}`;

        const userPrompt = `Şehir: ${city}, ${country} (Uyum skoru: %${score})
Astrolojik etkiler: ${influences || 'genel'}
Kişi: Güneş ${sunSign || 'bilinmiyor'}, Ay ${moonSign || 'bilinmiyor'}
Tercihleri: ${preferences?.join(', ') || 'genel'}
Bu kişi için bu şehrin astrokartografi analizini yap.`;

        const cacheKey = `city_${city}_${country}_${sunSign}`;
        const cached = getCachedResponse(cacheKey, 'city');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, 600);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        setCachedResponse(cacheKey, result, 'city');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: AI Rüya Yorumu (Bonus)
// ═══════════════════════════════════════
app.post('/api/dream', async (req, res) => {
    try {
        const { dream, sunSign } = req.body;
        if (!dream) return res.status(400).json({ error: 'Rüya açıklaması gerekli' });

        const lang = req.body.lang || 'tr';
        const langInstruction = lang === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        const systemPrompt = `Sen Jungcu psikoloji ve astroloji bilgisiyle rüya yorumlayan derin bir spiritüel rehbersin. ${langInstruction}
Gizemli, derin ama şefkatli bir ton kullan. Rüyayı sadece yüzeysel sembollerle değil,
bilinçaltı arketipleri, duygusal bağlamlar ve kişisel dönüşüm perspektifinden oku.

KURALLAR:
- Rüyadaki HER önemli detayı ayrı ayrı ele al.
- Klişe "bu olumlu bir rüya" tipi genellemelerden KAÇIN.
- Semboller en az 3, en fazla 5 tane olsun — her biri farklı bir katmana işaret etsin.
- Rüyanın duygusal tonunu doğru yakala — korku, huzur, kafa karışıklığı, özlem vs.
- Burcun rüya yorumuna etkisini de ekle (opsiyonel ama değerli).

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Rüyanın yaratıcı ve etkileyici başlığı",
  "interpretation": "Rüyanın katmanlı, derin yorumu. Psikolojik ve spiritüel açıdan, 5-6 cümle",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "Bu sembolün psikolojik ve spiritüel anlamı, 2 cümle" },
    { "symbol": "Sembol 2", "meaning": "Anlamı, 2 cümle" },
    { "symbol": "Sembol 3", "meaning": "Anlamı, 2 cümle" }
  ],
  "emotion": "Rüyanın baskın duygusu — tek kelime veya kısa ifade",
  "layer": "Bu rüya hangi bilinçaltı katmanına işaret ediyor? (Arzu, korku, dönüşüm, yas, özgürleşme vs.) 1 cümle",
  "message": "Bilinçaltının sana vermek istediği mesaj, 2-3 cümle. Spesifik ve dokunaklı.",
  "advice": "Bu rüyadan çıkarılacak somut hayat tavsiyesi, 2 cümle",
  "luckyAction": "Bugün yapman gereken bir eylem — spesifik ve uygulanabilir"
}`;

        const userPrompt = `Kişinin burcu: ${sunSign || 'bilinmiyor'}.
Gördüğü rüya: "${dream}"
Bu rüyayı Jungcu arketipler, astrolojik bağlam ve duygusal katmanlar açısından DERİN yorumla.
Yüzeysel kalma — bilinçaltının gerçekten ne söylemeye çalıştığını bul.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: Kahve Falı
// ═══════════════════════════════════════
app.post('/api/fortune', async (req, res) => {
    try {
        const { images, image, cup, sunSign, status, fortuneType = 'coffee', forOther } = req.body;
        const imageList = images && images.length > 0 ? images : (image ? [image] : []);
        if (imageList.length === 0) return res.status(400).json({ error: 'Fotoğraf gerekli' });
        if (imageList.length > 6) return res.status(400).json({ error: 'En fazla 6 fotoğraf gönderilebilir' });
        for (const img of imageList) {
            if (!img.startsWith('data:image/')) return res.status(400).json({ error: 'Geçersiz resim formatı.' });
            if (img.length * 0.75 > 4 * 1024 * 1024) return res.status(400).json({ error: 'Resim çok büyük (max 4MB).' });
        }

        const multiPhoto = imageList.length > 1;
        const subjectDesc = forOther ? `Fal bakılan kişi: ${forOther.name || 'başka biri'}, burcu: ${forOther.sunSign || 'bilinmiyor'}.` : `Kişinin burcu: ${sunSign || 'bilinmiyor'}. Medeni durumu: ${status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide'}.`;

        // ── Type-specific prompts ──
        const TYPE_CONFIG = {
            coffee: {
                role: 'Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.',
                imageDesc: multiPhoto ? 'Birden fazla açıdan çekilmiş kahve fincanı fotoğraflarını birlikte değerlendir — tabanı, duvarları, kenarları tüm açılardan incele.' : 'Fotoğraftaki kahve fincanını detaylı incele — tabanı, duvarları, kenarları.',
                validation: 'ÖNCELİKLE fotoğrafın gerçekten bir kahve fincanı olup olmadığını kontrol et. Fincan değilse "general" alanında bunu belirt ve kibarca fincan fotoğrafı istediğini açıkla.',
                symbolsLabel: 'Kahve izlerindeki semboller',
                actionVerb: 'kahve falı yorumla'
            },
            palm: {
                role: 'Sen deneyimli bir el falcısısın. Chiromancy (el falı) geleneğine ve çizgi analizine hakimsin.',
                imageDesc: multiPhoto ? 'Birden fazla açıdan çekilmiş el fotoğraflarını incele — ana çizgiler, tepe bölgeleri, parmak yapısı.' : 'Fotoğraftaki eli detaylı incele — yaşam çizgisi, kalp çizgisi, akıl çizgisi, kader çizgisi ve tepe bölgeleri.',
                validation: 'ÖNCELİKLE fotoğrafın gerçekten bir el (avuç içi açık) fotoğrafı olup olmadığını kontrol et. El fotoğrafı değilse bunu belirt.',
                symbolsLabel: 'El çizgileri ve tepeleri',
                actionVerb: 'el falı yorumla'
            },
            general: {
                role: 'Sen sezgisel bir fal ve spiritüel rehber uzmanısın. Fotoğraftaki her türlü sembol ve enerjiyi okuyabilirsin.',
                imageDesc: multiPhoto ? 'Birden fazla fotoğrafı bir bütün olarak değerlendir — her görseldeki sembolleri, şekilleri ve enerjiyi oku.' : 'Fotoğraftaki sembolleri, şekilleri ve enerjiyi sezgisel olarak oku.',
                validation: 'Fotoğrafta ne görüyorsan onu yorumla — tarot kartı, kristal, rüya günlüğü, doğa nesnesi, kahve, el vb. olabilir.',
                symbolsLabel: 'Fotoğraftaki semboller',
                actionVerb: 'sezgisel fal yorumla'
            }
        };
        const config = TYPE_CONFIG[fortuneType] || TYPE_CONFIG.coffee;

        const systemPrompt = `${config.role}
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz.
${config.imageDesc}
${config.validation}
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Falın başlığı — yaratıcı ve dikkat çekici, 4-6 kelime",
  "mood": "Falın genel havası — tek emoji + 1-2 kelime",
  "general": "Genel yorum, 4-5 cümle. Gizemli ve etkileyici.",
  "symbols": [
    { "symbol": "${config.symbolsLabel} 1", "meaning": "1-2 cümle anlamı" },
    { "symbol": "Sembol 2", "meaning": "Anlamı" },
    { "symbol": "Sembol 3", "meaning": "Anlamı" }
  ],
  "love": "Aşk ve ilişki hakkında yorum, 2-3 cümle",
  "career": "Kariyer ve para hakkında yorum, 2-3 cümle",
  "health": "Sağlık ve enerji hakkında yorum, 1-2 cümle",
  "answer": "Kullanıcının notundaki soruya yanıt, yoksa null",
  "luckyTip": "Şans getiren bir ipucu veya tavsiye",
  "timing": "Falda görülen olayların tahmini zamanlaması"
}`;

        const textPart = `${subjectDesc}
${cup ? `Not / Soru: "${cup}"` : ''}
${multiPhoto ? `${imageList.length} fotoğrafı birlikte incele ve ${config.actionVerb}.` : `Bu fotoğrafı detaylı incele ve ${config.actionVerb}.`}`;

        const userContent = [
            { type: 'text', text: textPart },
            ...imageList.map(img => ({ type: 'image_url', image_url: { url: img, detail: 'high' } }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
            max_tokens: 1100,
            temperature: 0.85
        });
        const raw = response.choices[0].message.content;
        const result = extractJSON(raw);
        if (!result) throw new Error('AI yanıtı parse edilemedi');
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Fortune error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════
// API: iyzico Checkout — Form Başlat
// ═══════════════════════════════════════
app.post('/api/checkout/init', async (req, res) => {
    try {
        const { plan, billing } = req.body;
        const selected = PLANS[plan];
        if (!selected) return res.status(400).json({ error: 'Geçersiz plan' });
        if (!billing?.email || !billing?.name) {
            return res.status(400).json({ error: 'Ad ve e-posta gerekli' });
        }
        // E-posta format validasyonu
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(billing.email)) {
            return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin' });
        }

        const conversationId = `ASTRO_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId,
            price: selected.price,
            paidPrice: selected.price,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: `B_${conversationId}`,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${req.protocol}://${req.get('host')}/api/checkout/callback`,
            enabledInstallments: [1, 2, 3, 6],
            buyer: {
                id: 'BY_' + Date.now(),
                name: (billing?.name || 'Misafir').split(' ')[0],
                surname: (billing?.name || 'Kullanıcı').split(' ').slice(1).join(' ') || 'Kullanıcı',
                gsmNumber: billing?.phone || '+905000000000',
                email: billing?.email || 'misafir@zemara.app',
                identityNumber: '11111111111',
                lastLoginDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
                registrationDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
                registrationAddress: 'İstanbul, Türkiye',
                ip: req.ip || req.socket?.remoteAddress || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34000'
            },
            shippingAddress: {
                contactName: billing?.name || 'Misafir Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'İstanbul, Türkiye',
                zipCode: '34000'
            },
            billingAddress: {
                contactName: billing?.name || 'Misafir Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'İstanbul, Türkiye',
                zipCode: '34000'
            },
            basketItems: [{
                id: plan,
                name: selected.name,
                category1: 'Dijital Ürün',
                category2: 'Abonelik',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: selected.price
            }]
        };

        iyzipay.checkoutFormInitialize.create(request, (err, result) => {
            if (err) {
                console.error('iyzico Error:', err);
                return res.status(500).json({ error: 'Ödeme sistemi şu an yanıt veremiyor' });
            }
            if (result.status === 'success') {
                // Token → conversationId eşleştirmesi sakla (callback doğrulaması için)
                if (!global.checkoutSessions) global.checkoutSessions = new Map();
                global.checkoutSessions.set(result.token, { conversationId, plan, email: billing.email, createdAt: Date.now() });
                res.json({
                    success: true,
                    checkoutFormContent: result.checkoutFormContent,
                    token: result.token,
                    plan: plan,
                    amount: selected.price
                });
            } else {
                console.error('iyzico Form Error:', result.errorMessage);
                res.status(400).json({ error: result.errorMessage || 'Ödeme formu oluşturulamadı' });
            }
        });
    } catch (err) {
        console.error('Checkout Init Error:', err);
        res.status(500).json({ error: 'Ödeme başlatılamadı' });
    }
});

// ═══════════════════════════════════════
// API: iyzico Checkout — Callback
// ═══════════════════════════════════════
app.post('/api/checkout/callback', express.urlencoded({ extended: true }), async (req, res) => {
    const { token } = req.body;
    if (!token) return res.redirect('/?checkout=fail&msg=Token+bulunamadı');

    // Checkout session doğrulaması
    const session = global.checkoutSessions?.get(token);
    const conversationId = session?.conversationId || '';

    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId,
        token
    }, async (err, result) => {
        if (err) {
            console.error('iyzico Callback Error:', err);
            return res.redirect('/?checkout=fail&msg=Doğrulama+hatası');
        }

        if (result.paymentStatus === 'SUCCESS') {
            console.log('✅ Ödeme başarılı:', {
                paymentId: result.paymentId,
                price: result.paidPrice,
                currency: result.currency,
                basketId: result.basketId,
                cardType: result.cardType,
                lastFourDigits: result.lastFourDigits
            });

            const planKey = result.basketItems?.[0]?.id || 'premium-monthly';
            const isYearly = planKey.includes('yearly');
            const planTier = planKey.includes('vip') ? 'vip' : 'premium';
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1));
            const email = result.buyer?.email || 'unknown';

            // Store payment — Neon/Supabase (preferred) or JSON file (fallback)
            const db = getDB() || getSupabase();
            if (db && db.query) {
                // Neon/pg
                await db.query(
                    `INSERT INTO payments (payment_id, email, plan, period, amount, currency, expires_at, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
                     ON CONFLICT (payment_id) DO NOTHING`,
                    [result.paymentId, email, planTier, isYearly ? 'yearly' : 'monthly',
                     parseFloat(result.paidPrice) || 0, result.currency || 'TRY', expiresAt.toISOString()]
                ).catch(err => console.error('Neon payment insert error:', err.message));
            } else if (db) {
                // Supabase fallback
                const { error: dbErr } = await db.from('payments').insert({
                    payment_id: result.paymentId,
                    email,
                    plan: planTier,
                    period: isYearly ? 'yearly' : 'monthly',
                    amount: parseFloat(result.paidPrice) || 0,
                    currency: result.currency || 'TRY',
                    expires_at: expiresAt.toISOString(),
                    status: 'active'
                });
                if (dbErr) console.error('Supabase payment insert error:', dbErr.message);
            } else {
                // Fallback: JSON file
                if (!global.payments) global.payments = loadPayments();
                global.payments.push({
                    paymentId: result.paymentId,
                    email,
                    plan: planTier,
                    period: isYearly ? 'yearly' : 'monthly',
                    amount: result.paidPrice,
                    currency: result.currency,
                    activatedAt: new Date().toISOString(),
                    expiresAt: expiresAt.toISOString(),
                    status: 'active'
                });
                savePayments(global.payments);
            }

            console.log(`✅ Premium aktif: ${planTier} (${isYearly ? 'yıllık' : 'aylık'}) — Bitiş: ${expiresAt.toLocaleDateString('tr-TR')}`);

            // Kullanılmış session'ı temizle
            global.checkoutSessions?.delete(token);

            res.redirect(`/?checkout=success&amount=${result.paidPrice}&plan=${planTier}`);
        } else {
            console.log('❌ Ödeme başarısız:', result.errorMessage);
            res.redirect(`/?checkout=fail&msg=${encodeURIComponent(result.errorMessage || 'Ödeme tamamlanamadı')}`);
        }
    });
});

// ═══════════════════════════════════════
// API: Premium Status Check
// ═══════════════════════════════════════
app.post('/api/premium-status', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta gerekli' });

    const db = getDB() || getSupabase();
    if (db && db.query) {
        try {
            // Neon/pg
            const result = await db.query(
                `SELECT plan, period, expires_at FROM payments
                 WHERE email = $1 AND status = 'active' AND expires_at > NOW()
                 ORDER BY activated_at DESC LIMIT 1`,
                [email]
            );
            const payment = result.rows[0];
            if (!payment) return res.json({ premium: false, plan: 'free' });
            return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expires_at });
        } catch (err) {
            console.error('Neon premium-status error:', err.message);
        }
    } else if (db) {
        try {
            // Supabase fallback
            const { data } = await db.from('payments')
                .select('plan, period, expires_at')
                .eq('email', email)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('activated_at', { ascending: false })
                .limit(1);
            const payment = data?.[0];
            if (!payment) return res.json({ premium: false, plan: 'free' });
            return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expires_at });
        } catch (err) {
            console.error('Supabase premium-status error:', err.message);
        }
    }

    if (!global.payments) return res.json({ premium: false, plan: 'free' });

    const payment = global.payments
        .filter(p => p.email === email && p.status === 'active')
        .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))[0];

    if (!payment) return res.json({ premium: false, plan: 'free' });

    const isExpired = new Date(payment.expiresAt) < new Date();
    if (isExpired) {
        payment.status = 'expired';
        savePayments(global.payments);
        return res.json({ premium: false, plan: 'free', expired: true });
    }

    res.json({
        premium: true,
        plan: payment.plan,
        period: payment.period,
        expiresAt: payment.expiresAt
    });
});

// ═══════════════════════════════════════
// Catch all — serve index.html
// ═══════════════════════════════════════
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════
process.on('SIGTERM', () => {
    console.log('\n✦ Shutting down gracefully...');
    process.exit(0);
});

// ═══════════════════════════════════════
// API: Kullanıcı Kaydı → Neon DB
// ═══════════════════════════════════════
app.post('/api/register-user', async (req, res) => {
    try {
        const { id, name, email, birthDate, plan, createdAt } = req.body;
        if (!email || !id) return res.status(400).json({ error: 'id ve email gerekli' });
        const db = getDB();
        if (!db) return res.json({ ok: true, stored: false }); // DB yoksa sessizce geç
        // Tablo yoksa oluştur
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                birth_date TEXT,
                plan TEXT DEFAULT 'free',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await db.query(`
            INSERT INTO users (id, name, email, birth_date, plan, created_at)
            VALUES ($1, $2, $3, $4, $5, TO_TIMESTAMP($6 / 1000.0))
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                birth_date = EXCLUDED.birth_date,
                plan = EXCLUDED.plan,
                updated_at = NOW()
        `, [id, name, email, birthDate || null, plan || 'free', createdAt || Date.now()]);
        res.json({ ok: true, stored: true });
    } catch (err) {
        console.error('register-user error:', err.message);
        res.json({ ok: true, stored: false }); // Hata olsa bile kayıt akışını bloklama
    }
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
});

app.listen(PORT, () => {
    console.log(`\n✦ Zemara Server v4.0 — Optimized Edition`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  → AI: ${process.env.OPENAI_API_KEY ? '✅ OpenAI bağlı' : '❌ API key yok'}`);
    console.log(`  → Security: Headers ✅ | Rate Limit: ${RATE_MAX}/min ✅ | Cache: ✅`);
    console.log(`  → iyzico: ${process.env.IYZICO_API_KEY ? '✅ Bağlı' : '⚠️ Sandbox'} (${process.env.IYZICO_URI || 'sandbox'})`);
    console.log(`  → Routes: /api/daily-horoscope, /api/compatibility, /api/crystal-guide, /api/tarot, /api/city-insight, /api/dream, /api/fortune`);
    console.log(`  → Payment: /api/checkout/init, /api/checkout/callback\n`);
});
