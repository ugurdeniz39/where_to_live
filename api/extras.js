const { corsHeaders, askGPT, parseJSON } = require('./_lib/openai');

// Combined serverless function for analytics, push, premium-status, transit, natal-interpretation
// Routed via vercel.json rewrites based on URL path

if (!global._analyticsEvents) global._analyticsEvents = [];
if (!global._pushTokens) global._pushTokens = [];
if (!global._transitCache) global._transitCache = new Map();
if (!global._natalCache) global._natalCache = new Map();

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

    try {

    // ── Analytics ──
    if (url.includes('/analytics')) {
        if (req.method === 'POST') {
            const { event, data, session, page } = req.body || {};
            if (!event || typeof event !== 'string') return res.status(400).json({ error: 'event gerekli' });
            global._analyticsEvents.push({
                event: event.slice(0, 100),
                data: typeof data === 'object' ? data : {},
                session: (session || '').slice(0, 50),
                page: (page || '').slice(0, 100),
                ts: new Date().toISOString()
            });
            if (global._analyticsEvents.length > 5000) global._analyticsEvents = global._analyticsEvents.slice(-2500);
            return res.json({ ok: true });
        }
        // GET summary
        const adminToken = process.env.ADMIN_TOKEN || 'astromap-admin-2024';
        const queryToken = (req.query && req.query.token) || new URL(req.url, 'http://localhost').searchParams.get('token');
        if (queryToken !== adminToken) return res.status(403).json({ error: 'Yetkisiz erisim' });
        const events = {}, pages = {};
        const sessions = new Set();
        for (const e of global._analyticsEvents) {
            events[e.event] = (events[e.event] || 0) + 1;
            if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
            if (e.session) sessions.add(e.session);
        }
        return res.json({ total: global._analyticsEvents.length, uniqueSessions: sessions.size, events, pages });
    }

    // ── Push Notifications ──
    if (url.includes('/push')) {
        if (req.method === 'POST') {
            const { token, subscription, platform, user } = req.body || {};
            if (!token && !subscription) return res.status(400).json({ error: 'Token veya subscription gerekli' });
            const identifier = token || JSON.stringify(subscription);
            const exists = global._pushTokens.find(t => t.identifier === identifier);
            if (exists) {
                exists.lastSeen = new Date().toISOString();
                exists.user = user || exists.user;
            } else {
                global._pushTokens.push({
                    identifier, token: token || null, subscription: subscription || null,
                    platform: platform || 'unknown', user: user || 'anonymous',
                    registeredAt: new Date().toISOString(), lastSeen: new Date().toISOString()
                });
            }
            return res.json({ ok: true, total: global._pushTokens.length });
        }
        // GET stats
        const adminToken2 = process.env.ADMIN_TOKEN || 'astromap-admin-2024';
        const queryToken2 = (req.query && req.query.token) || new URL(req.url, 'http://localhost').searchParams.get('token');
        if (queryToken2 !== adminToken2) return res.status(403).json({ error: 'Yetkisiz erisim' });
        const platforms = {};
        global._pushTokens.forEach(t => { platforms[t.platform] = (platforms[t.platform] || 0) + 1; });
        return res.json({ total: global._pushTokens.length, platforms });
    }

    // ── Premium Status ──
    if (url.includes('/premium-status')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ error: 'E-posta gerekli' });
        if (!global.payments) return res.json({ premium: false, plan: 'free' });
        const payment = global.payments
            .filter(p => p.email === email && p.status === 'active')
            .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))[0];
        if (!payment) return res.json({ premium: false, plan: 'free' });
        const isExpired = new Date(payment.expiresAt) < new Date();
        if (isExpired) { payment.status = 'expired'; return res.json({ premium: false, plan: 'free', expired: true }); }
        return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expiresAt });
    }

    // ── Transit Rapor ──
    if (url.includes('/transit')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
        const { birthDate, sunSign, isPremium, lang } = req.body || {};
        if (!isPremium) return res.status(403).json({ error: 'premium_required' });
        if (!sunSign) return res.status(400).json({ error: 'sunSign gerekli' });

        const today = new Date().toISOString().slice(0, 10);
        const langCode = lang || 'tr';
        const cacheKey = `transit_${sunSign}_${birthDate || 'unknown'}_${today}_${langCode}`;

        const cached = global._transitCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < 86400000) {
            return res.json({ success: true, data: cached.data, cached: true });
        }
        if (cached) global._transitCache.delete(cacheKey);

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
      "aspect": "açı tipi (trikon/kare/kavuşum vb.)",
      "natalPlanet": "natal gezegenin adı",
      "effect": "positive veya challenging veya neutral",
      "title": "kısa başlık",
      "description": "2-3 cümle kişisel açıklama",
      "advice": "somut 1 cümle tavsiye",
      "duration": "süre bilgisi (örn: 3-4 hafta)"
    }
  ],
  "overallEnergy": "Bu dönem genel enerji özeti, 2 cümle",
  "bestDays": "Bu ay en güçlü günler (örn: 5-8, 22-25)"
}`;

        const userPrompt = `${sunSign} burcu için güncel transit raporu hazırla.${birthDate ? ` Doğum tarihi: ${birthDate}.` : ''}
3 önemli aktif transit ver. Mevcut tarihe göre gerçekçi gezegen hareketlerini kullan.`;

        const raw = await askGPT(systemPrompt, userPrompt, 700, 0.8);
        const result = parseJSON(raw);

        // Enforce max 10 cache entries
        if (global._transitCache.size >= 10) {
            global._transitCache.delete(global._transitCache.keys().next().value);
        }
        global._transitCache.set(cacheKey, { data: result, ts: Date.now() });

        return res.json({ success: true, data: result });
    }

    // ── Natal Chart AI Yorumu ──
    if (url.includes('/natal-interpretation')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
        const { planets, sunSign, moonSign, ascendant, lang } = req.body || {};
        if (!planets || !sunSign) return res.status(400).json({ error: 'planets ve sunSign gerekli' });

        const langCode = lang || 'tr';
        const cacheKey = `natal_${sunSign}_${moonSign || ''}_${ascendant || ''}_${JSON.stringify(planets).slice(0, 80)}_${langCode}`;

        const cached = global._natalCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < 3600000) {
            return res.json({ success: true, data: cached.data, cached: true });
        }
        if (cached) global._natalCache.delete(cacheKey);

        const langInstruction = langCode === 'en'
            ? 'Write ALL your response in ENGLISH.'
            : 'Tüm yanıtını TÜRKÇE yaz.';

        const systemPrompt = `Sen doğum haritası yorumlama uzmanı bir astrologsun. ${langInstruction}
Bilgece, ilham verici ama somut bir ton kullan. Klişelerden kaçın. Gezegenleri birbirleriyle bağdaştır.
Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "summary": "Kişinin genel karakter özeti, 4-5 cümle. Gezegenleri birbirleriyle bağdaştır.",
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
        const result = parseJSON(raw);

        if (global._natalCache.size >= 20) {
            global._natalCache.delete(global._natalCache.keys().next().value);
        }
        global._natalCache.set(cacheKey, { data: result, ts: Date.now() });

        return res.json({ success: true, data: result });
    }

    res.status(404).json({ error: 'Endpoint bulunamadı' });

    } catch (err) {
        console.error('extras.js error:', err.message);
        res.status(500).json({ error: 'Servis şu an yanıt veremiyor. Lütfen tekrar dene.' });
    }
};
