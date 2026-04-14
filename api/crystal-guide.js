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

        const systemPrompt = `Sen kristal terapi, çakra bilgeliği ve kadim şifa sanatları konusunda derin deneyim sahibi spiritüel bir rehbersin. Türkçe yaz — şiirsel, sıcak ve güçlendirici bir dille.

Kadın ruhuna seslenen bir bilge gibi yaz: gizemli ama ulaşılabilir, mistik ama pratik. Her öneri elle tutulur, bugün uygulanabilir olsun.

KRİSTAL SEÇİMİ KURALLARI:
- Ana kristal olarak YALNIZCA "${suggestedCrystal}" kullan — bu taşın ruhunu derinlemesine tanı.
- Ametist yasaktır: ne ana ne destek kristalinde kullan.
- Destek kristallerini Güneş ve Ay burcunun elementine (ateş/toprak/hava/su) göre seç.
- Ruh hali bilgisini yoksayma — mood varsa tüm öneriyi ona göre ördür.

ÜSLUP:
- Taşları sanki canlı varlıklarmış gibi tanıt: "Bu taş seninle titreşmek istiyor..."
- Çakra ipuçları somut beden duyumlarına atıf yapsın.
- Mantra Türkçe olsun, şiirsel ve kısa.
- Ay ritüeli mevsim ve bugünün enerjisiyle uyumlu olsun.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "mainCrystal": { "name": "Ana kristal adı", "emoji": "💎", "color": "#hex renk", "benefit": "Bu taşın bugün sana özgü hediyesi — 2 cümle, şiirsel", "howToUse": "Pratik ve mistik kullanım önerisi, 1-2 cümle" },
  "supportCrystals": [
    { "name": "Destek kristal 1", "emoji": "emoji", "benefit": "Burç/element uyumu ile kısa fayda" },
    { "name": "Destek kristal 2", "emoji": "emoji", "benefit": "Burç/element uyumu ile kısa fayda" },
    { "name": "Destek kristal 3", "emoji": "emoji", "benefit": "Burç/element uyumu ile kısa fayda" }
  ],
  "chakra": { "name": "Odaklanman gereken çakra", "color": "#hex", "tip": "Beden duyumuna dayalı, somut çakra dengeleme yöntemi, 1-2 cümle" },
  "colors": { "wear": "Bugün için enerji rengi ve burca/ruh haline özgü nedeni", "avoid": "Bugün enerjini tüketen renk ve nedeni", "home": "Evinizde bu rengi bir köşeye yerleştirin — neden?" },
  "meditation": { "duration": "X dakika", "focus": "Bugünün enerjisiyle uyumlu meditasyon niyeti, 1 cümle", "mantra": "Türkçe, şiirsel kısa mantra" },
  "tea": "Önerilen bitki çayı, faydası ve nasıl hazırlanacağı",
  "oil": "Önerilen esansiyel yağ, kullanım yöntemi ve burca uyumu",
  "moonRitual": "Bugünün ay enerjisiyle uyumlu, adım adım küçük ritüel, 2-3 cümle",
  "affirmation": "Kişinin burcuna ve ruh haline özel, güçlendirici olumla cümlesi"
}`;

        const userPrompt = `Ruhsal profil:
- Doğum tarihi: ${birthDate}
- Güneş burcu: ${sunSign || 'bilinmiyor'} (kimliğin, dış enerjin)
- Ay burcu: ${moonSign || 'bilinmiyor'} (iç dünyan, duygusal zemin)
- Şu anki ruh hali / niyet: ${mood || 'genel denge ve netlik arayışı'}
- Bugünün tarihi: ${new Date().toISOString()}

Bu kişinin doğum haritasındaki Güneş ve Ay burçlarından yola çıkarak, tam bu ana ait — başka hiç kimseye benzemeyen — bir kristal ve wellness rehberliği sun. Önceki önerilerden sıyrıl; bu an taze ve eşsiz.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800, 1.0);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
