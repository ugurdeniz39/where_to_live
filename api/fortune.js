const { openai, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { image, cup, sunSign, status } = req.body;
        if (!image) return res.status(400).json({ error: 'Fincan fotoğrafı gerekli' });
        if (cup) validateTextLength(cup, 500);

        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz.
Fotoğraftaki fincanı detaylı incele — tabanı, duvarları, kenarları.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Falın başlığı — yaratıcı ve dikkat çekici, 4-6 kelime",
  "mood": "Falın genel havası — tek emoji + 1-2 kelime",
  "general": "Fincanın genel yorumu, 4-5 cümle. Gizemli ve etkileyici.",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "1-2 cümle anlamı" },
    { "symbol": "Sembol 2", "meaning": "Anlamı" },
    { "symbol": "Sembol 3", "meaning": "Anlamı" }
  ],
  "love": "Aşk ve ilişki hakkında yorum, 2-3 cümle",
  "career": "Kariyer ve para hakkında yorum, 2-3 cümle",
  "health": "Sağlık ve enerji hakkında yorum, 1-2 cümle",
  "answer": "Kullanıcının notundaki soruya yanıt, yoksa null",
  "luckyTip": "Şans getiren bir ipucu veya tavsiye",
  "timing": "Falda görülen olayların tahmini zamanlaması"
}`;

        const textPart = `Kişinin burcu: ${sunSign || 'bilinmiyor'}. Medeni durumu: ${status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide'}.
${cup ? `Kullanıcının notu: "${cup}"` : ''}
Bu fincan fotoğrafını detaylı incele ve kahve falı yorumla.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: [
                    { type: 'text', text: textPart },
                    { type: 'image_url', image_url: { url: image, detail: 'high' } }
                ]}
            ],
            max_tokens: 900,
            temperature: 0.85
        });
        const raw = response.choices[0].message.content;
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Fortune error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
