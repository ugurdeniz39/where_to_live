const { corsHeaders } = require('./_lib/openai');

// In-memory analytics for Vercel (serverless — resets per cold start)
// For persistent analytics, use Vercel KV or external service
if (!global._analyticsEvents) global._analyticsEvents = [];

module.exports = (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();

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

        // Keep max 5000 events in memory
        if (global._analyticsEvents.length > 5000) global._analyticsEvents = global._analyticsEvents.slice(-2500);

        return res.json({ ok: true });
    }

    // GET — summary
    const events = {};
    const pages = {};
    const sessions = new Set();
    for (const e of global._analyticsEvents) {
        events[e.event] = (events[e.event] || 0) + 1;
        if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
        if (e.session) sessions.add(e.session);
    }
    res.json({ total: global._analyticsEvents.length, uniqueSessions: sessions.size, events, pages });
};
