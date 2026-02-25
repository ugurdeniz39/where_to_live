const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim()
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
        throw new Error('AI servisi şu an yanıt veremiyor. Lütfen tekrar dene.');
    }
}

function parseJSON(raw) {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
    return JSON.parse(jsonMatch[0]);
}

function corsHeaders(res) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim());
    // For Vercel serverless, we'll use the first allowed origin or allow the request origin if it matches
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Input validation helper
function validateTextLength(text, maxLen = 2000) {
    if (typeof text === 'string' && text.length > maxLen) {
        throw new Error(`Metin çok uzun (max ${maxLen} karakter)`);
    }
    return text;
}

module.exports = { openai, askGPT, parseJSON, corsHeaders, validateTextLength };
