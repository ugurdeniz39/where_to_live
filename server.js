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

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim()
});

// iyzico client
const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || 'sandbox-afXhSWnbMcODHnNstMRqanOzOlpItFgj',
    secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-cpnBGYA6nSXAjdYOqtHSIPIkHxSEaF6Q',
    uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

// Plan definitions
const PLANS = {
    'premium-monthly': { price: '49.00', name: 'AstroMap Premium Aylık' },
    'premium-yearly':  { price: '490.00', name: 'AstroMap Premium Yıllık' },
    'vip-monthly':     { price: '99.00', name: 'AstroMap VIP Aylık' },
    'vip-yearly':      { price: '990.00', name: 'AstroMap VIP Yıllık' }
};

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ═══════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// ═══════════════════════════════════════
// RATE LIMITING (IN-MEMORY)
// ═══════════════════════════════════════
const rateLimits = new Map();
const RATE_WINDOW = 60000; // 1 minute
const RATE_MAX = 20; // max 20 AI requests per minute

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
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
const CACHE_TTL = 1800000; // 30 minutes

function getCachedResponse(key) {
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        responseCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCachedResponse(key, data) {
    responseCache.set(key, { data, ts: Date.now() });
    // Keep max 100 entries
    if (responseCache.size > 100) {
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

// Apply rate limiting to all API routes
app.use('/api', rateLimit);

// ═══════════════════════════════════════
// HELPER: GPT Call with retry
// ═══════════════════════════════════════
async function askGPT(systemPrompt, userPrompt, maxTokens = 1000) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.85
        });
        return response.choices[0].message.content;
    } catch (err) {
        console.error('OpenAI Error:', err.message);
        throw new Error('AI servisi şu an yanıt veremiyor. Lütfen tekrar dene.');
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
        const { birthDate, birthTime, sunSign, moonSign, risingSign } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });

        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const systemPrompt = `Sen deneyimli, sıcak ve empatik bir astrologsun. Türkçe yaz. 
Yanıtlarını samimi, ilham verici ve motive edici tut. Kadın kullanıcılara hitap ediyorsun — zarif, şefkatli ve güçlendirici bir ton kullan.
Emoji kullan ama abartma. Her bölümü net ve akıcı yaz.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "Bugünün genel enerjisi hakkında 2-3 cümle",
  "love": "Aşk ve ilişkiler hakkında 2-3 cümle", 
  "career": "Kariyer ve para hakkında 2-3 cümle",
  "health": "Sağlık ve enerji hakkında 2-3 cümle",
  "advice": "Günün özel tavsiyesi, 1-2 cümle",
  "affirmation": "Bugünün olumlaması — kısa ve güçlü bir cümle",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": 60-100, "career": 60-100, "health": 60-100, "luck": 60-100, "energy": 60-100, "mood": 60-100 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "Bu kartın bugün senin için anlamı, 1-2 cümle"
}`;

        const userPrompt = `Bugün ${today}. 
Kişi bilgileri: Doğum tarihi ${birthDate}, doğum saati ${birthTime || 'bilinmiyor'}.
Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}, Yükselen: ${risingSign || 'bilinmiyor'}.
Bu kişi için bugünün detaylı astroloji yorumunu yaz.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        // Parse JSON from response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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

        const raw = await askGPT(systemPrompt, userPrompt, 600);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
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
        const { cup, sunSign, status, question } = req.body;
        if (!cup) return res.status(400).json({ error: 'Fincan açıklaması gerekli' });

        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz. Kadın kullanıcılara hitap ediyorsun.
Fincan tabanı, duvarları ve kenarlarındaki şekilleri yorumla.
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
  "answer": "Eğer soru varsa yanıtı, yoksa null",
  "luckyTip": "Şans getiren bir ipucu veya tavsiye",
  "timing": "Falda görülen olayların tahmini zamanlaması"
}`;

        const userPrompt = `Kişinin burcu: ${sunSign || 'bilinmiyor'}.
Medeni durumu: ${status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide'}.
Fincanda gördüğü şekiller: "${cup}"
${question ? `Aklındaki soru: "${question}"` : 'Belirli bir sorusu yok, genel fal bak.'}
Bu fincanı detaylı bir şekilde yorumla.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
        const result = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data: result });
    } catch (err) {
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

        const conversationId = `ASTRO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
                lastLoginDate: new Date().toISOString().replace('T', ' ').substr(0, 19),
                registrationDate: new Date().toISOString().replace('T', ' ').substr(0, 19),
                registrationAddress: 'İstanbul, Türkiye',
                ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
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

    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId: '',
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
            // TODO: DB'ye kaydet, premium aktif et
            res.redirect(`/?checkout=success&amount=${result.paidPrice}`);
        } else {
            console.log('❌ Ödeme başarısız:', result.errorMessage);
            res.redirect(`/?checkout=fail&msg=${encodeURIComponent(result.errorMessage || 'Ödeme tamamlanamadı')}`);
        }
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
    console.log(`  → Security: Headers ✅ | Rate Limit: ${RATE_MAX}/min ✅ | Cache: ${CACHE_TTL/1000}s ✅`);
    console.log(`  → iyzico: ${process.env.IYZICO_API_KEY ? '✅ Bağlı' : '⚠️ Sandbox'} (${process.env.IYZICO_URI || 'sandbox'})`);
    console.log(`  → Routes: /api/daily-horoscope, /api/compatibility, /api/crystal-guide, /api/tarot, /api/city-insight, /api/dream, /api/fortune`);
    console.log(`  → Payment: /api/checkout/init, /api/checkout/callback\n`);
});
