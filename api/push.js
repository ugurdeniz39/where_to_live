const { corsHeaders } = require('./_lib/openai');

// In-memory push token storage for Vercel (resets per cold start)
if (!global._pushTokens) global._pushTokens = [];

module.exports = (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();

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
                identifier,
                token: token || null,
                subscription: subscription || null,
                platform: platform || 'unknown',
                user: user || 'anonymous',
                registeredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            });
        }
        return res.json({ ok: true, total: global._pushTokens.length });
    }

    // GET — stats
    const platforms = {};
    global._pushTokens.forEach(t => { platforms[t.platform] = (platforms[t.platform] || 0) + 1; });
    res.json({ total: global._pushTokens.length, platforms });
};
