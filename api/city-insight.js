const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { city, country, score, influences, sunSign, moonSign, preferences } = req.body;
        if (!city) return res.status(400).json({ error: 'Şehir bilgisi gerekli' });

        const systemPrompt = `Sen astrokartografi ve kaderin coğrafyasında gezgin bir rehbersin. Her şehrin gökyüzündeki gezegenlerle nasıl dans ettiğini bilir, kişinin doğum haritasını bir pusula gibi kullanırsın.
Sesini ilham verici, şiirsel ve özgün tut — klişelerden kaçın. Yalnızca Türkçe yaz.
Güneş ve Ay burçlarını analizin merkezine koy: bu gezegenler o şehrin enerjisiyle nasıl rezonansa giriyor?
Yanıtını YALNIZCA aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:
{
  "headline": "Bu şehri bu kişi için eşsiz kılan tek çarpıcı cümle — burcuna veya gezegensel etkisine dokunarak",
  "whyThisCity": "Bu şehrin kişinin doğum haritasıyla neden uyumlu olduğu, 3-4 cümle. Güneş veya Ay burcunun o şehrin enerjisiyle nasıl örtüştüğünü somutlaştır.",
  "energy": "Şehrin kendine özgü titreşimi ve atmosferi, 2 cümle. Soyut değil, duyusal ve çağrıştırıcı ol.",
  "bestFor": ["Bu şehirde en güçlü gelişeceği alan 1", "alan 2", "alan 3"],
  "lifestyle": "Bu şehirde nasıl bir günlük yaşam ritmi beklemeli? 2-3 cümle. Tercihleriyle örtüşen somut detaylar ver.",
  "bestSeason": "Bu şehre taşınmak veya ziyaret için astrolojik açıdan en güçlü mevsim ve kısa nedeni",
  "tip": "Bu kişiye — burcunun özelliklerini bilerek — bu şehirde köklenmesi için özel ve uygulanabilir bir ipucu, 1-2 cümle",
  "vibe": "Şehrin ruhunu özetleyen tek kelime"
}`;

        const userPrompt = `Şehir: ${city}${country ? `, ${country}` : ''} | Uyum skoru: %${score}
Gezegensel etkiler: ${influences || 'genel'}
Doğum haritası: Güneş ${sunSign || 'bilinmiyor'} · Ay ${moonSign || 'bilinmiyor'}
Yaşam tercihleri: ${preferences?.join(', ') || 'belirtilmedi'}
Bu kişi için ${city} şehrinin astrokartografi derinlemesine analizini yap.`;

        const raw = await askGPT(systemPrompt, userPrompt, 650);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
