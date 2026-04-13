const { corsHeaders, askGPT, parseJSON } = require('./_lib/openai');
const { getSupabase } = require('./_lib/supabase');
const { getDB } = require('./_lib/db');

// ── Resend welcome email ──────────────────────────────────────────────────────
async function sendWelcomeEmail(email, name) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;
    const firstName = (name || 'Ziyaretçi').split(' ')[0];
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'Zemara <merhaba@zemara.app>',
            to: [email],
            subject: `${firstName}, yıldız haritanı keşfetmeye hazır mısın? ✦`,
            html: `
<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#0e0e2e;color:#e2e0ff;padding:32px;border-radius:16px">
  <h1 style="color:#c9a0ff;font-size:24px;margin-bottom:8px">Hoş geldin, ${firstName} ✦</h1>
  <p style="color:#b8b0d0;line-height:1.6">Zemara'ya katıldığın için teşekkürler. Şimdi yıldızların seni nereye çağırdığını keşfetmeye hazırsın.</p>
  <div style="background:#1a1a3e;border-radius:12px;padding:20px;margin:20px 0">
    <p style="margin:0 0 12px;font-weight:600;color:#fff">Sana özel ücretsiz özellikler:</p>
    <p style="margin:6px 0;color:#c9a0ff">🌟 Günlük kişisel burç yorumu</p>
    <p style="margin:6px 0;color:#c9a0ff">🗺️ İlk 10 şehir astrokartografi analizi</p>
    <p style="margin:6px 0;color:#c9a0ff">🌙 Doğum haritası & ay takvimi</p>
  </div>
  <a href="https://zemara.app" style="display:inline-block;background:#c9a0ff;color:#0e0e2e;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-bottom:24px">Haritamı Gör →</a>
  <hr style="border:1px solid rgba(255,255,255,.1);margin:20px 0">
  <p style="font-size:12px;color:rgba(255,255,255,.3)">Zemara &middot; <a href="https://zemara.app/privacy.html" style="color:rgba(255,255,255,.3)">Gizlilik Politikası</a> &middot; Bu emaili almak istemiyorsan bize <a href="mailto:merhaba@zemara.app" style="color:rgba(255,255,255,.3)">yaz</a></p>
</div>`
        })
    });
}

// Simple in-memory rate limiter per IP (survives for process lifetime)
if (!global._rlMap) global._rlMap = new Map();
function isRateLimited(ip, maxReq = 60, windowMs = 60000) {
    const now = Date.now();
    const entry = global._rlMap.get(ip);
    if (!entry || now > entry.resetAt) {
        global._rlMap.set(ip, { count: 1, resetAt: now + windowMs });
        if (global._rlMap.size > 10000) { // prevent unbounded growth
            const oldest = [...global._rlMap.entries()].filter(([, v]) => now > v.resetAt);
            oldest.forEach(([k]) => global._rlMap.delete(k));
        }
        return false;
    }
    if (entry.count >= maxReq) return true;
    entry.count++;
    return false;
}

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
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

    // Rate limit write endpoints (POST only, 60 req/min per IP)
    if (req.method === 'POST' && isRateLimited(ip)) {
        return res.status(429).json({ error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' });
    }

    try {

    // ── Register User ──
    if (url.includes('/register-user')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { id, name, email, birthDate, plan, createdAt } = req.body || {};
        if (!email || !id) return res.status(400).json({ error: 'id ve email gerekli' });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ error: 'Geçersiz e-posta formatı' });
        const db = getDB();
        if (!db) return res.json({ ok: true, stored: false });
        await db.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL, birth_date TEXT, plan TEXT DEFAULT 'free', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`);
        const insertResult = await db.query(`INSERT INTO users (id, name, email, birth_date, plan, created_at) VALUES ($1, $2, $3, $4, $5, TO_TIMESTAMP($6 / 1000.0)) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, birth_date = EXCLUDED.birth_date, plan = EXCLUDED.plan, updated_at = NOW() RETURNING (xmax = 0) AS is_new`,
            [id, name || null, email, birthDate || null, plan || 'free', createdAt || Date.now()]);
        // Send welcome email only for brand new users
        const isNew = insertResult.rows?.[0]?.is_new;
        if (isNew && process.env.RESEND_API_KEY) {
            sendWelcomeEmail(email, name).catch(() => {});
        }
        return res.json({ ok: true, stored: true });
    }

    // ── Analytics ──
    if (url.includes('/analytics')) {
        if (req.method === 'POST') {
            const { event, data, session, page } = req.body || {};
            if (!event || typeof event !== 'string') return res.status(400).json({ error: 'event gerekli' });

            const db = getDB() || getSupabase();
            if (db && db.query) {
                db.query(
                    'INSERT INTO analytics (event, data, session_id, page) VALUES ($1, $2, $3, $4)',
                    [event.slice(0, 100), JSON.stringify(typeof data === 'object' ? data : {}), (session || '').slice(0, 50), (page || '').slice(0, 100)]
                ).catch(() => {});
                return res.json({ ok: true });
            } else if (db) {
                db.from('analytics').insert({
                    event: event.slice(0, 100),
                    data: typeof data === 'object' ? data : {},
                    session_id: (session || '').slice(0, 50),
                    page: (page || '').slice(0, 100)
                }).then(() => {}).catch(() => {});
                return res.json({ ok: true });
            }

            // In-memory fallback
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
        const adminToken = process.env.ADMIN_TOKEN;
        const queryToken = (req.query && req.query.token) || new URL(req.url, 'http://localhost').searchParams.get('token');
        if (!adminToken || queryToken !== adminToken) return res.status(403).json({ error: 'Yetkisiz erişim' });

        const db = getDB() || getSupabase();
        if (db && db.query) {
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
        // In-memory fallback
        const events = {}, pages = {};
        const sessions = new Set();
        for (const e of global._analyticsEvents) {
            events[e.event] = (events[e.event] || 0) + 1;
            if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
            if (e.session) sessions.add(e.session);
        }
        return res.json({ total: global._analyticsEvents.length, uniqueSessions: sessions.size, events, pages, source: 'memory' });
    }

    // ── Push Notifications ──
    if (url.includes('/push')) {
        if (req.method === 'POST') {
            const { token, subscription, platform, user } = req.body || {};
            if (!token && !subscription) return res.status(400).json({ error: 'Token veya subscription gerekli' });
            const identifier = token || JSON.stringify(subscription);

            const db = getDB() || getSupabase();
            if (db && db.query) {
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

            // In-memory fallback
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
        const adminToken2 = process.env.ADMIN_TOKEN;
        const queryToken2 = (req.query && req.query.token) || new URL(req.url, 'http://localhost').searchParams.get('token');
        if (queryToken2 !== adminToken2) return res.status(403).json({ error: 'Yetkisiz erişim' });

        const db2 = getDB() || getSupabase();
        if (db2 && db2.query) {
            const [statsRes, countRes] = await Promise.all([
                db2.query('SELECT platform, COUNT(*) as cnt FROM push_tokens GROUP BY platform'),
                db2.query('SELECT COUNT(*) as total FROM push_tokens')
            ]);
            const platforms = {};
            statsRes.rows.forEach(r => { platforms[r.platform] = parseInt(r.cnt); });
            return res.json({ total: parseInt(countRes.rows[0].total), platforms, source: 'neon' });
        } else if (db2) {
            const { data, count } = await db2.from('push_tokens').select('platform', { count: 'exact' });
            const platforms = {};
            (data || []).forEach(t => { platforms[t.platform] = (platforms[t.platform] || 0) + 1; });
            return res.json({ total: count || 0, platforms, source: 'supabase' });
        }
        const platforms = {};
        global._pushTokens.forEach(t => { platforms[t.platform] = (platforms[t.platform] || 0) + 1; });
        return res.json({ total: global._pushTokens.length, platforms, source: 'memory' });
    }

    // ── Premium Status ──
    if (url.includes('/premium-status')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ error: 'E-posta gerekli' });

        const db = getDB() || getSupabase();
        if (db && db.query) {
            // Check iyzico payments table
            const result = await db.query(
                `SELECT plan, period, expires_at FROM payments
                 WHERE email = $1 AND status = 'active' AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [email]
            );
            const payment = result.rows[0];
            if (payment) return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expires_at });

            // Also check Lemon Squeezy subscriptions table
            try {
                const lsResult = await db.query(
                    `SELECT plan, expires_at FROM zemara_subscriptions
                     WHERE email = $1 AND status = 'active'
                       AND (expires_at IS NULL OR expires_at > NOW())
                     LIMIT 1`,
                    [email]
                );
                const lsSub = lsResult.rows[0];
                if (lsSub) return res.json({ premium: true, plan: lsSub.plan, period: 'monthly', expiresAt: lsSub.expires_at });
            } catch (_) { /* table may not exist yet */ }

            return res.json({ premium: false, plan: 'free' });
        } else if (db) {
            const { data } = await db.from('payments')
                .select('plan, period, expires_at')
                .eq('email', email)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);
            const payment = data?.[0];
            if (payment) return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expires_at });

            // Also check Lemon Squeezy subscriptions
            const { data: lsData } = await db.from('zemara_subscriptions')
                .select('plan, expires_at')
                .eq('email', email)
                .eq('status', 'active')
                .limit(1)
                .maybeSingle();
            if (lsData && (!lsData.expires_at || new Date(lsData.expires_at) > new Date())) {
                return res.json({ premium: true, plan: lsData.plan, period: 'monthly', expiresAt: lsData.expires_at });
            }

            return res.json({ premium: false, plan: 'free' });
        }

        // In-memory fallback
        if (!global.payments) return res.json({ premium: false, plan: 'free' });
        const payment = global.payments
            .filter(p => p.email === email && p.status === 'active')
            .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))[0];
        if (!payment) return res.json({ premium: false, plan: 'free' });
        const isExpired = new Date(payment.expiresAt) < new Date();
        if (isExpired) { payment.status = 'expired'; return res.json({ premium: false, plan: 'free', expired: true }); }
        return res.json({ premium: true, plan: payment.plan, period: payment.period, expiresAt: payment.expiresAt });
    }

    // ── Free Trial Start ──
    if (url.includes('/extras') && req.body?.action === 'start-trial') {
        const { email, userId } = req.body || {};
        if (!email) return res.status(400).json({ error: 'email gerekli' });
        const db = getDB();
        if (db) {
            const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            await db.query(
                `INSERT INTO payments (email, plan, period, status, amount, created_at, expires_at)
                 VALUES ($1, 'premium', 'trial', 'active', 0, NOW(), $2)
                 ON CONFLICT DO NOTHING`,
                [email, trialEnd]
            ).catch(() => {});
        }
        if (process.env.RESEND_API_KEY) {
            sendWelcomeEmail(email, null).catch(() => {});
        }
        return res.json({ ok: true, trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() });
    }

    // ── Transit Rapor ──
    if (url.includes('/transit')) {
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
        const { birthDate, sunSign, email, lang } = req.body || {};
        if (!sunSign) return res.status(400).json({ error: 'sunSign gerekli' });

        // Server-side premium verification — never trust client-supplied isPremium flag
        if (!email) return res.status(403).json({ error: 'premium_required' });
        const transitDb = getDB() || getSupabase();
        let premiumVerified = false;
        if (transitDb && transitDb.query) {
            try {
                const [pr, lsr] = await Promise.all([
                    transitDb.query(
                        `SELECT 1 FROM payments WHERE email=$1 AND status='active' AND expires_at > NOW() LIMIT 1`,
                        [email]
                    ),
                    transitDb.query(
                        `SELECT 1 FROM zemara_subscriptions WHERE email=$1 AND status='active' AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`,
                        [email]
                    ).catch(() => ({ rows: [] }))
                ]);
                premiumVerified = (pr.rows?.length > 0) || (lsr.rows?.length > 0);
            } catch (_) {}
        } else if (transitDb) {
            const { data: pd } = await transitDb.from('payments').select('plan').eq('email', email).eq('status', 'active').limit(1);
            premiumVerified = (pd?.length > 0);
        }
        if (!premiumVerified) return res.status(403).json({ error: 'premium_required' });

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
