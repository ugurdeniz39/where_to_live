const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, moonSign, mood } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });

        const systemPrompt = `Sen kristal terapi, çakra dengeleme ve wellness konusunda uzman bir spiritüel rehbersin. Türkçe yaz.
Nazik, şefkatli ve bilge bir ton kullan. Kadınlara hitap ediyorsun — onları güçlendiren, rahatlatıcı bir dil kullan.

ÖNEMLİ KURALLAR:
- Her seferinde FARKLI kristaller ve tavsiyeler ver. Tekrara düşme.
- Kişinin ruh haline (mood) göre özel, kişiselleştirilmiş öneriler sun.
- Kristal, çakra, renk, meditasyon, çay ve yağ önerilerini çeşitle — hep aynı şeyleri önerme.
- Günün tarih ve enerjisinne göre farklılaştır.

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

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
