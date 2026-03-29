const { corsHeaders } = require('./_lib/openai');

// Combined serverless function for analytics, push, and premium-status
// Routed via vercel.json rewrites based on URL path

if (!global._analyticsEvents) global._analyticsEvents = [];
if (!global._pushTokens) global._pushTokens = [];

module.exports = (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.url || '';

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

    res.status(404).json({ error: 'Endpoint bulunamadı' });
};
