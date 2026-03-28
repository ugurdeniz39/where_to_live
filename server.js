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

// CORS — restrict to known origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
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

        const systemPrompt = `Sen deneyimli, sıcak ve empatik bir astrologsun. Türkçe yaz.
${userName} adında birine hitap ediyorsun — ${genderText.tone} bir ton kullan.
Yanıtlarını samimi, ilham verici ve motive edici tut. ${userName}'in adını sık sık kullan.
Emoji kullan ama abartma. Her bölümü net ve akıcı yaz.
Bu bir ${periodLabel} yorumdur. ${periodScope} için detaylı yorum yaz.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "${periodScope} genel enerjisi hakkında 2-3 cümle",
  "love": "Aşk ve ilişkiler hakkında 2-3 cümle", 
  "career": "Kariyer ve para hakkında 2-3 cümle",
  "health": "Sağlık ve enerji hakkında 2-3 cümle",
  "advice": "${periodLabel} özel tavsiye, 1-2 cümle",
  "affirmation": "${periodScope} olumlaması — kısa ve güçlü bir cümle",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": 60-100, "career": 60-100, "health": 60-100, "luck": 60-100, "energy": 60-100, "mood": 60-100 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "Bu kartın ${periodScope.toLowerCase()} senin için anlamı, 1-2 cümle"
}`;

        const userPrompt = `Bugün ${today}. 
Kişi bilgileri: Doğum tarihi ${birthDate}, doğum saati ${birthTime || 'bilinmiyor'}.
Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}, Yükselen: ${risingSign || 'bilinmiyor'}.
Bu kişi için ${periodLabel.toLowerCase()} detaylı astroloji yorumunu yaz.`;

        // Check server cache
        const cacheKey = `daily_${period || 'daily'}_${birthDate}_${birthTime}_${sunSign}_${(name || '').slice(0,20)}_${gender || ''}`;
        const cached = getCachedResponse(cacheKey, 'daily');
        if (cached) return res.json({ success: true, data: cached });

        const raw = await askGPT(systemPrompt, userPrompt, 800);
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
        const { birthDate, sunSign, question } = req.body;

        const systemPrompt = `Sen deneyimli ve gizemli bir tarot okuyucususun. Türkçe yaz.
Mistik ama sıcak bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Kullanıcıya 3 kart çek ve oku: Geçmiş, Şimdi, Gelecek.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "cards": [
    { "position": "Geçmiş", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false },
    { "position": "Şimdi", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false },
    { "position": "Gelecek", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false }
  ],
  "overall": "Üç kartın birlikte söylediği genel mesaj, 3-4 cümle",
  "advice": "Kartların sana özel tavsiyesi, 2 cümle",
  "energy": "Bugünün baskın enerjisi, tek kelime veya kısa ifade"
}`;

        const userPrompt = `Kişi: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.
${question ? `Sorusu: "${question}"` : 'Genel bir okuma isteniyor.'}
3 kartlık (Geçmiş-Şimdi-Gelecek) tarot okuması yap.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
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

        const systemPrompt = `Sen rüya yorumu ve astroloji konusunda uzman bir spiritüel rehbersin. Türkçe yaz.
Gizemli, derin ama sıcak bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Rüyanın başlığı — yaratıcı ve dikkat çekici",
  "interpretation": "Rüyanın detaylı yorumu, 4-5 cümle",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "Kısa anlamı" },
    { "symbol": "Sembol 2", "meaning": "Kısa anlamı" }
  ],
  "emotion": "Rüyanın baskın duygusu",
  "message": "Bilinçaltının sana vermek istediği mesaj, 2 cümle",
  "advice": "Bu rüyadan çıkarılacak hayat tavsiyesi, 1-2 cümle",
  "luckyAction": "Bugün yapman gereken bir eylem"
}`;

        const userPrompt = `Kişinin burcu: ${sunSign || 'bilinmiyor'}.
Gördüğü rüya: "${dream}"
Bu rüyayı astrolojik ve psikolojik açıdan yorumla.`;

        const raw = await askGPT(systemPrompt, userPrompt, 600);
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
        const { image, cup, sunSign, status } = req.body;
        if (!image) return res.status(400).json({ error: 'Fincan fotoğrafı gerekli' });
        // Validate base64 image
        if (!image.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Geçersiz resim formatı. Lütfen fotoğraf yükleyin.' });
        }
        // Check image size (~4MB max for base64 = ~3MB actual image)
        const base64Size = image.length * 0.75;
        if (base64Size > 4 * 1024 * 1024) {
            return res.status(400).json({ error: 'Resim çok büyük. Lütfen daha küçük bir fotoğraf deneyin.' });
        }

        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz.
Fotoğraftaki fincanı detaylı incele — tabanı, duvarları, kenarları.
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
Bu fincan fotoğrafını detaylı incele ve kahve falı yorumla.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: [
                    { type: 'text', text: textPart },
                    { type: 'image_url', image_url: { url: image, detail: 'high' } }
                ]}
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
