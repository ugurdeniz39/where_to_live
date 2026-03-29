const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim(),
    timeout: 25000, // 25 second timeout — fail fast
    maxRetries: 2
});

async function askGPT(systemPrompt, userPrompt, maxTokens = 1000, temperature = 0.85) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: maxTokens,
            temperature
        });
        return response.choices[0].message.content;
    } catch (err) {
        console.error('OpenAI Error:', err.message);
        if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
            throw new Error('Sunucu yanitlamiyor. Lutfen tekrar dene.');
        }
        throw new Error('AI servisi su an yanit veremiyor. Lutfen tekrar dene.');
    }
}

function parseJSON(raw) {
    // Strip markdown code blocks
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Try direct parse first
    try { return JSON.parse(cleaned.trim()); } catch {}

    // Extract outermost {...}
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI yanıtı parse edilemedi');
    let jsonStr = match[0];

    // Fix common GPT JSON issues
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1'); // trailing commas
    jsonStr = jsonStr.replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":'); // unquoted keys

    try { return JSON.parse(jsonStr); } catch {}

    // Last resort: flatten newlines
    jsonStr = jsonStr.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
    try { return JSON.parse(jsonStr); } catch (e) {
        console.error('JSON parse failed:', e.message, 'Raw:', raw.slice(0, 200));
        throw new Error('AI yanıtı parse edilemedi');
    }
}

function corsHeaders(res, req) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
    const origin = req && req.headers && req.headers.origin;
    // Allow known origins, Capacitor native apps, and Vercel previews
    const isAllowed = !origin
        || allowedOrigins.includes(origin)
        || origin === 'https://localhost'
        || origin === 'capacitor://localhost'
        || origin === 'http://localhost'
        || origin.endsWith('.vercel.app');
    if (isAllowed && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
}

// Input validation helper
function validateTextLength(text, maxLen = 2000) {
    if (typeof text === 'string' && text.length > maxLen) {
        throw new Error(`Metin çok uzun (max ${maxLen} karakter)`);
    }
    return text;
}

module.exports = { openai, askGPT, parseJSON, corsHeaders, validateTextLength };
