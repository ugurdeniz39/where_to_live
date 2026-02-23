const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY?.trim()
});

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

function parseJSON(raw) {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI yanıtı parse edilemedi');
    return JSON.parse(jsonMatch[0]);
}

function corsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { openai, askGPT, parseJSON, corsHeaders };
