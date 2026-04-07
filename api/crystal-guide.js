const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, moonSign, mood } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });
        if (mood) validateTextLength(mood, 200);

        // Pick a random crystal pool to force variety
        const crystalPools = [
            ['Sitrin', 'Akuamarin', 'Karneol', 'Labradorit', 'Turkuaz'],
            ['Lapis Lazuli', 'Aventurin', 'Rodonit', 'Obsidyen', 'Ay Taşı'],
            ['Kuvars (Dumanlı)', 'Yeşim', 'Florit', 'Hematit', 'Amazonit'],
            ['Kaplan Gözü', 'Selenit', 'Rodokrozit', 'Aragonit', 'Kunzit'],
            ['Apatit', 'Akik', 'Celestit', 'Prehnit', 'Moldavit'],
            ['Mercan', 'Serpantin', 'İyolit', 'Morganit', 'Krizokol'],
            ['Kehribar', 'Topaz', 'Zümrüt', 'Peridot', 'Tanzanit'],
            ['Sunstone', 'Larimar', 'Howlit', 'Granat', 'Sodalit']
        ];
        const pool = crystalPools[Math.floor(Math.random() * crystalPools.length)];
        const suggestedCrystal = pool[Math.floor(Math.random() * pool.length)];

        const systemPrompt = `Sen kristal terapi, çakra dengeleme ve wellness konusunda uzman bir spiritüel rehbersin. Türkçe yaz.
Nazik, şefkatli ve bilge bir ton kullan. Kadınlara hitap ediyorsun — onları güçlendiren, rahatlatıcı bir dil kullan.

KRİTİK KURALLAR:
- Ana kristal olarak MUTLAKA "${suggestedCrystal}" öner. Ametist ÖNERİLMEYECEK.
- Destek kristallerinde de Ametist KULLANMA. Her seferinde farklı kristaller seç.
- Kişinin ruh haline (mood) göre özel, kişiselleştirilmiş öneriler sun.
- Kristal, çakra, renk, meditasyon, çay ve yağ önerilerini çeşitle.
- Günün tarih ve enerjisine göre farklılaştır.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "mainCrystal": { "name": "Ana kristal adı", "emoji": "💎", "color": "#hex renk", "benefit": "Bu kristalin sana faydası, 2 cümle", "howToUse": "Nasıl kullanılır, 1-2 cümle" },
  "supportCrystals": [
    { "name": "Destek kristal 1", "emoji": "emoji", "benefit": "Kısa fayda" },
    { "name": "Destek kristal 2", "emoji": "emoji", "benefit": "Kısa fayda" },
    { "name": "Destek kristal 3", "emoji": "emoji", "benefit": "Kısa fayda" }
  ],
  "chakra": { "name": "Odaklanman gereken çakra", "color": "#hex", "tip": "Çakra dengeleme ipucu, 1-2 cümle" },
  "colors": { "wear": "Bugün giymeni önerdiğim renk ve neden", "avoid": "Kaçınman gereken renk ve neden", "home": "Evinde bulundurman gereken renk" },
  "meditation": { "duration": "X dakika", "focus": "Meditasyon odağı, 1 cümle", "mantra": "Tekrar edilecek mantra" },
  "tea": "Önerilen bitki çayı ve faydası",
  "oil": "Önerilen esansiyel yağ ve kullanımı",
  "moonRitual": "Ay fazına göre bugün yapılabilecek ritüel, 2-3 cümle",
  "affirmation": "Güçlendirici bir olumla"
}`;

        const userPrompt = `Kişi: Doğum ${birthDate}, Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}.
Şu anki ruh hali: ${mood || 'genel denge arayışı'}.
Tarih: ${new Date().toISOString()}.
Bu kişi için bugüne ÖZEL, BENZERSİZ kristal, wellness ve spiritüel rehberlik ver. Daha önce verdiğin önerilerden farklı ol.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800, 1.0);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
