const { openai, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { images, image, cup, sunSign, status } = req.body;
        const imageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
        if (imageList.length === 0) return res.status(400).json({ error: 'Fincan fotoğrafı gerekli' });
        if (imageList.length > 6) return res.status(400).json({ error: 'En fazla 6 fotoğraf gönderilebilir' });
        for (const img of imageList) {
            if (typeof img !== 'string' || !img.startsWith('data:image/')) {
                return res.status(400).json({ error: 'Geçersiz resim formatı. Lütfen fotoğraf yükleyin.' });
            }
            if (img.length > 4 * 1024 * 1024) {
                return res.status(400).json({ error: 'Resim çok büyük. Daha küçük bir fotoğraf deneyin.' });
            }
        }
        if (cup) validateTextLength(cup, 500);
        const multiPhoto = imageList.length > 1;

        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz.
${multiPhoto ? `Toplam ${imageList.length} farklı açıdan çekilmiş fincan fotoğrafını birlikte değerlendir — tabanı, duvarları, kenarları tüm açılardan incele.` : 'Fotoğraftaki fincanı detaylı incele — tabanı, duvarları, kenarları.'}
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
${multiPhoto ? `${imageList.length} farklı açıdan yüklenen fincan fotoğraflarını birlikte inceleyip tek bir fal yorumu ver.` : 'Bu fincan fotoğrafını detaylı incele ve kahve falı yorumla.'}`;

        const userContent = [
            { type: 'text', text: textPart },
            ...imageList.map(img => ({ type: 'image_url', image_url: { url: img, detail: 'high' } }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
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
