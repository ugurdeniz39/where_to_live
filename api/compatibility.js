const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { person1, person2 } = req.body;
        if (!person1?.birthDate || !person2?.birthDate) {
            return res.status(400).json({ error: 'Her iki kişinin doğum tarihi gerekli' });
        }

        const systemPrompt = `Sen romantik ilişki uyumu konusunda uzman bir astrologsun. Türkçe yaz.
Samimi, sıcak ve romantik bir ton kullan. Emoji kullan.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "overall": 50-99 arası genel uyum skoru,
  "romance": 40-99 arası romantizm skoru,
  "communication": 40-99 arası iletişim skoru, 
  "passion": 40-99 arası tutku skoru,
  "longTerm": 40-99 arası uzun vade skoru,
  "trust": 40-99 arası güven skoru,
  "summary": "Genel uyum hakkında 2-3 cümlelik özet",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
  "challenges": ["Zorluk 1", "Zorluk 2"],
  "advice": "İlişki için özel tavsiye, 2-3 cümle",
  "soulConnection": "Ruhsal bağlantı açıklaması, 1-2 cümle",
  "bestDates": "Birlikte en iyi vakit geçirecekleri aktiviteler, 1 cümle",
  "sign1": "Kişi 1 güneş burcu",
  "sign2": "Kişi 2 güneş burcu",
  "elementCompat": "Element uyumu açıklaması, 1 cümle"
}`;

        const userPrompt = `İki kişinin astrolojik uyumunu analiz et:
Kişi 1: Doğum ${person1.birthDate}, saat ${person1.birthTime || 'bilinmiyor'}, burç: ${person1.sunSign || 'bilinmiyor'}, ay: ${person1.moonSign || 'bilinmiyor'}
Kişi 2: Doğum ${person2.birthDate}, saat ${person2.birthTime || 'bilinmiyor'}, burç: ${person2.sunSign || 'bilinmiyor'}, ay: ${person2.moonSign || 'bilinmiyor'}
Detaylı romantik uyum analizi yap.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
