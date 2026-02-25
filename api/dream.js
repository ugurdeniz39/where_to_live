const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { dream, sunSign } = req.body;
        if (!dream) return res.status(400).json({ error: 'Rüya açıklaması gerekli' });
        validateTextLength(dream, 2000);

        const systemPrompt = `Sen rüya yorumu ve astroloji konusunda uzman bir spiritüel rehbersin. Türkçe yaz.
Gizemli, derin ama sıcak bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Rüyanın başlığı — yaratıcı ve dikkat çekici",
  "interpretation": "Rüyanın detaylı yorumu, 4-5 cümle",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "Kısa anlamı" },
    { "symbol": "Sembol 2", "meaning": "Kısa anlamı" }
  ],
  "emotion": "Rüyanın baskın duygusu",
  "message": "Bilinçaltının sana vermek istediği mesaj, 2 cümle",
  "advice": "Bu rüyadan çıkarılacak hayat tavsiyesi, 1-2 cümle",
  "luckyAction": "Bugün yapman gereken bir eylem"
}`;

        const userPrompt = `Kişinin burcu: ${sunSign || 'bilinmiyor'}.
Gördüğü rüya: "${dream}"
Bu rüyayı astrolojik ve psikolojik açıdan yorumla.`;

        const raw = await askGPT(systemPrompt, userPrompt, 600);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
