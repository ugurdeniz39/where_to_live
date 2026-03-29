/**
 * ============================================
 * AstroMap v4 — Backend Server
 * Express + OpenAI GPT API Routes
 * Optimized with security, caching & rate limiting
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const Iyzipay = require('iyzipay');
const path = require('path');
const fs = require('fs');

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
    apiKey: process.env.OPENAI_API_KEY?.trim()
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
    'premium-monthly': { price: '49.00', name: 'AstroMap Premium Aylık' },
    'premium-yearly':  { price: '490.00', name: 'AstroMap Premium Yıllık' },
    'vip-monthly':     { price: '99.00', name: 'AstroMap VIP Aylık' },
    'vip-yearly':      { price: '990.00', name: 'AstroMap VIP Yıllık' }
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
// SECURITY HEADERS
// ═══════════════════════════════════════
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://i.pravatar.cc",
        "connect-src 'self'",
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

function rateLimit(req, res, next) {
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

// Static files with caching headers
app.use(express.static(path.join(__dirname), {
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
}));

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
app.use('/api', rateLimit);
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

        const entry = {
            event: event.slice(0, 100),
            data: typeof data === 'object' ? data : {},
            session: (session || '').slice(0, 50),
            page: (page || '').slice(0, 100),
            ts: new Date().toISOString(),
            ip: req.ip || req.socket?.remoteAddress
        };

        // Append to JSONL file (one JSON per line)
        const dir = path.dirname(ANALYTICS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(ANALYTICS_FILE, JSON.stringify(entry) + '\n', 'utf-8');

        res.json({ ok: true });
    } catch (err) {
        console.error('Analytics error:', err.message);
        res.json({ ok: false });
    }
});

app.get('/api/analytics/summary', (req, res) => {
    try {
        if (!fs.existsSync(ANALYTICS_FILE)) return res.json({ total: 0, events: {} });
        const lines = fs.readFileSync(ANALYTICS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
        const events = {};
        const pages = {};
        const sessions = new Set();
        for (const line of lines.slice(-10000)) { // Last 10k events
            try {
                const e = JSON.parse(line);
                events[e.event] = (events[e.event] || 0) + 1;
                if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
                if (e.session) sessions.add(e.session);
            } catch {}
        }
        res.json({ total: lines.length, uniqueSessions: sessions.size, events, pages });
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

app.post('/api/push/register', (req, res) => {
    try {
        const { token, subscription, platform, user } = req.body;
        if (!token && !subscription) return res.status(400).json({ error: 'Token veya subscription gerekli' });

        const tokens = loadPushTokens();
        const identifier = token || JSON.stringify(subscription);

        // Deduplicate
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
        console.log(`📱 Push token kaydedildi: ${platform} — ${(user || 'anonymous').slice(0, 30)}`);
        res.json({ ok: true, total: tokens.length });
    } catch (err) {
        console.error('Push register error:', err.message);
        res.status(500).json({ error: 'Token kaydedilemedi' });
    }
});

app.get('/api/push/stats', (req, res) => {
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

        const systemPrompt = `Sen derin astroloji bilgisine sahip, sezgisel ve empatik bir astrologsun. Türkçe yaz.
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

        const systemPrompt = `Sen kristal terapi, çakra dengeleme ve wellness konusunda uzman bir spiritüel rehbersin. Türkçe yaz.
Nazik, şefkatli ve bilge bir ton kullan. Kadınlara hitap ediyorsun — onları güçlendiren, rahatlatıcı bir dil kullan.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "mainCrystal": { "name": "Ana kristal adı", "emoji": "💎", "color": "#hex renk", "benefit": "Bu kristalin sana faydası, 2 cümle", "howToUse": "Nasıl kullanılır, 1-2 cümle" },
  "supportCrystals": [
    { "name": "Destek kristal 1", "emoji": "emoji", "benefit": "Kısa fayda" },
    { "name": "Destek kristal 2", "emoji": "emoji", "benefit": "Kısa fayda" }
  ],
  "chakra": { "name": "Odaklanman gereken çakra", "color": "#hex", "tip": "Çakra dengeleme ipucu, 1-2 cümle" },
  "colors": { "wear": "Bugün giymeni önerdiğim renk", "avoid": "Kaçınman gereken renk", "home": "Evinde bulundurman gereken renk" },
  "meditation": { "duration": "X dakika", "focus": "Meditasyon odağı, 1 cümle", "mantra": "Tekrar edilecek mantra" },
  "tea": "Önerilen bitki çayı ve faydası",
  "oil": "Önerilen esansiyel yağ ve kullanımı",
  "moonRitual": "Ay fazına göre bugün yapılabilecek ritüel, 2-3 cümle",
  "affirmation": "Güçlendirici bir olumla"
}`;

        const userPrompt = `Kişi: Doğum ${birthDate}, Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}.
Şu anki ruh hali: ${mood || 'genel denge arayışı'}.
Bu kişi için bugün özel kristal, wellness ve spiritüel rehberlik ver.`;

        const cacheKey = `crystal_${birthDate}_${sunSign}_${mood || 'general'}`;
        const cached = getCachedResponse(cacheKey, 'crystal');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, 800);
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
        const { birthDate, sunSign, question, spread } = req.body;

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
                tokens: 1800
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
            `{ "position": "${spreadConfig.positions[i]}", "name": "Kartın Türkçe adı", "nameEn": "English name", "emoji": "uygun emoji", "meaning": "Bu kartın ${spreadConfig.positions[i]} pozisyonundaki DERİN anlamı, 3-4 cümle.", "reversed": ${reversals[i]}, "keywords": ["anahtar1", "anahtar2", "anahtar3"] }`
        ).join(',\n    ');

        const pickedList = picked.map((card, i) =>
            `${i + 1}. ${spreadConfig.positions[i]}: ${card}${reversals[i] ? ' (TERS)' : ''}`
        ).join('\n');

        const systemPrompt = `Sen derin bilgiye sahip, gizemli ve empatik bir tarot ustasısın. Türkçe yaz.
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

        const userPrompt = `Danışan: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.
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

        const systemPrompt = `Sen Jungcu psikoloji ve astroloji bilgisiyle rüya yorumlayan derin bir spiritüel rehbersin. Türkçe yaz.
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
        const { images, image, cup, sunSign, status } = req.body;
        // Support both array (new) and single image (backward compat)
        const imageList = images && images.length > 0 ? images : (image ? [image] : []);
        if (imageList.length === 0) return res.status(400).json({ error: 'Fincan fotoğrafı gerekli' });
        if (imageList.length > 3) return res.status(400).json({ error: 'En fazla 3 fotoğraf gönderilebilir' });
        // Validate all images
        for (const img of imageList) {
            if (!img.startsWith('data:image/')) {
                return res.status(400).json({ error: 'Geçersiz resim formatı. Lütfen fotoğraf yükleyin.' });
            }
            const base64Size = img.length * 0.75;
            if (base64Size > 4 * 1024 * 1024) {
                return res.status(400).json({ error: 'Resim çok büyük. Lütfen daha küçük bir fotoğraf deneyin.' });
            }
        }

        const multiPhoto = imageList.length > 1;
        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz.
${multiPhoto ? 'Birden fazla açıdan çekilmiş fincan fotoğraflarını birlikte değerlendir — tabanı, duvarları, kenarları tüm açılardan incele.' : 'Fotoğraftaki fincanı detaylı incele — tabanı, duvarları, kenarları.'}
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Falın başlığı — yaratıcı ve dikkat çekici, 4-6 kelime",
  "mood": "Falın genel havası — tek emoji + 1-2 kelime",
  "general": "Fincanın genel yorumu, 4-5 cümle. Gizemli ve etkileyici.",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "1-2 cümle anlamı" },
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

        const textPart = `Kişinin burcu: ${sunSign || 'bilinmiyor'}. Medeni durumu: ${status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide'}.
${cup ? `Kullanıcının notu: "${cup}"` : ''}
${multiPhoto ? `${imageList.length} farklı açıdan çekilmiş fincan fotoğraflarını birlikte incele ve kahve falı yorumla.` : 'Bu fincan fotoğrafını detaylı incele ve kahve falı yorumla.'}`;

        const userContent = [
            { type: 'text', text: textPart },
            ...imageList.map(img => ({ type: 'image_url', image_url: { url: img, detail: 'high' } }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            max_tokens: 900,
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
                email: billing?.email || 'misafir@astromap.app',
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
app.post('/api/checkout/callback', express.urlencoded({ extended: true }), (req, res) => {
    const { token } = req.body;
    if (!token) return res.redirect('/?checkout=fail&msg=Token+bulunamadı');

    // Checkout session doğrulaması
    const session = global.checkoutSessions?.get(token);
    const conversationId = session?.conversationId || '';

    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId,
        token
    }, (err, result) => {
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

            // Store payment in memory (production: use a real DB like PostgreSQL/MongoDB)
            const planKey = result.basketItems?.[0]?.id || 'premium-monthly';
            const isYearly = planKey.includes('yearly');
            const planTier = planKey.includes('vip') ? 'vip' : 'premium';
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1));

            // Store payment persistently (JSON file + memory)
            if (!global.payments) global.payments = loadPayments();
            global.payments.push({
                paymentId: result.paymentId,
                email: result.buyer?.email || 'unknown',
                plan: planTier,
                period: isYearly ? 'yearly' : 'monthly',
                amount: result.paidPrice,
                currency: result.currency,
                activatedAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString(),
                status: 'active'
            });
            savePayments(global.payments);

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
app.post('/api/premium-status', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta gerekli' });

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

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
});

app.listen(PORT, () => {
    console.log(`\n✦ AstroMap Server v4.0 — Optimized Edition`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  → AI: ${process.env.OPENAI_API_KEY ? '✅ OpenAI bağlı' : '❌ API key yok'}`);
    console.log(`  → Security: Headers ✅ | Rate Limit: ${RATE_MAX}/min ✅ | Cache: ✅`);
    console.log(`  → iyzico: ${process.env.IYZICO_API_KEY ? '✅ Bağlı' : '⚠️ Sandbox'} (${process.env.IYZICO_URI || 'sandbox'})`);
    console.log(`  → Routes: /api/daily-horoscope, /api/compatibility, /api/crystal-guide, /api/tarot, /api/city-insight, /api/dream, /api/fortune`);
    console.log(`  → Payment: /api/checkout/init, /api/checkout/callback\n`);
});
