const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { cup, sunSign, status, question } = req.body;
        if (!cup) return res.status(400).json({ error: 'Fincan açıklaması gerekli' });

        const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Geleneksel Türk kahve falı geleneğine hakimsin.
Sıcak, samimi, gizemli ama umut verici bir ton kullan. Türkçe yaz. Kadın kullanıcılara hitap ediyorsun.
Fincan tabanı, duvarları ve kenarlarındaki şekilleri yorumla.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Falın başlığı — yaratıcı ve dikkat çekici, 4-6 kelime",
  "mood": "Falın genel havası — tek emoji + 1-2 kelime (örn: ✨ Umut dolu)",
  "general": "Fincanın genel yorumu, 4-5 cümle. Gizemli ve etkileyici.",
  "symbols": [
    { "symbol": "☕ Sembol adı", "meaning": "Bu sembolün faldaki anlamı, 1-2 cümle" },
    { "symbol": "☕ Sembol 2", "meaning": "Anlamı" },
    { "symbol": "☕ Sembol 3", "meaning": "Anlamı" }
  ],
  "love": "Aşk ve ilişki hakkında yorum, 2-3 cümle",
  "career": "Kariyer ve para hakkında yorum, 2-3 cümle",
  "health": "Sağlık ve enerji hakkında yorum, 1-2 cümle",
  "answer": "Eğer soru varsa yanıtı, yoksa null",
  "luckyTip": "Şans getiren bir ipucu veya tavsiye",
  "timing": "Falda görülen olayların tahmini zamanlaması"
}`;

        const userPrompt = `Kişinin burcu: ${sunSign || 'bilinmiyor'}.
Medeni durumu: ${status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide'}.
Fincanda gördüğü şekiller: "${cup}"
${question ? `Aklındaki soru: "${question}"` : 'Belirli bir sorusu yok, genel fal bak.'}
Bu fincanı detaylı bir şekilde yorumla.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
