const { corsHeaders } = require('./_lib/openai');

module.exports = (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'E-posta gerekli' });

    // Check in-memory payments (Vercel: resets per cold start)
    if (!global.payments) return res.json({ premium: false, plan: 'free' });

    const payment = global.payments
        .filter(p => p.email === email && p.status === 'active')
        .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))[0];

    if (!payment) return res.json({ premium: false, plan: 'free' });

    const isExpired = new Date(payment.expiresAt) < new Date();
    if (isExpired) {
        payment.status = 'expired';
        return res.json({ premium: false, plan: 'free', expired: true });
    }

    res.json({
        premium: true,
        plan: payment.plan,
        period: payment.period,
        expiresAt: payment.expiresAt
    });
};
