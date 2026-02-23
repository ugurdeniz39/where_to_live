const { corsHeaders } = require('./_lib/openai');

module.exports = (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    res.json({
        status: 'ok',
        version: '4.0',
        ai: !!process.env.OPENAI_API_KEY,
        platform: 'vercel'
    });
};
