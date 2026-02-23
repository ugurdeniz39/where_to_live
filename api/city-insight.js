const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { city, country, score, influences, sunSign, moonSign, preferences } = req.body;
        if (!city) return res.status(400).json({ error: 'Şehir bilgisi gerekli' });

        const systemPrompt = `Sen astrokartografi ve yaşam koçluğu uzmanısın. Türkçe yaz.
İlham verici, heyecan uyandıran bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "headline": "Bu şehir hakkında çarpıcı tek cümle başlık",
  "whyThisCity": "Bu şehrin kişi için neden ideal olduğu, 3-4 cümle. Astrolojik açıdan açıkla.",
  "energy": "Şehrin genel enerjisi ve atmosferi, 2 cümle",
  "bestFor": ["Bu şehirde en iyi yapılacak şey 1", "şey 2", "şey 3"],
  "lifestyle": "Bu şehirde nasıl bir yaşam tarzı beklemeli, 2-3 cümle",
  "bestSeason": "Bu şehre taşınmak/ziyaret için en iyi mevsim ve nedeni",
  "tip": "Bu şehirde yaşayacak birine özel ipucu, 1-2 cümle",
  "vibe": "Tek kelimelik ruh hali tanımı"
}`;

        const userPrompt = `Şehir: ${city}, ${country} (Uyum skoru: %${score})
Astrolojik etkiler: ${influences || 'genel'}
Kişi: Güneş ${sunSign || 'bilinmiyor'}, Ay ${moonSign || 'bilinmiyor'}
Tercihleri: ${preferences?.join(', ') || 'genel'}
Bu kişi için bu şehrin astrokartografi analizini yap.`;

        const raw = await askGPT(systemPrompt, userPrompt, 600);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
