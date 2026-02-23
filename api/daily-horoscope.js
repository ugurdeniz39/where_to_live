const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, birthTime, sunSign, moonSign, risingSign } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });

        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const systemPrompt = `Sen deneyimli, sıcak ve empatik bir astrologsun. Türkçe yaz. 
Yanıtlarını samimi, ilham verici ve motive edici tut. Kadın kullanıcılara hitap ediyorsun — zarif, şefkatli ve güçlendirici bir ton kullan.
Emoji kullan ama abartma. Her bölümü net ve akıcı yaz.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "Bugünün genel enerjisi hakkında 2-3 cümle",
  "love": "Aşk ve ilişkiler hakkında 2-3 cümle", 
  "career": "Kariyer ve para hakkında 2-3 cümle",
  "health": "Sağlık ve enerji hakkında 2-3 cümle",
  "advice": "Günün özel tavsiyesi, 1-2 cümle",
  "affirmation": "Bugünün olumlaması — kısa ve güçlü bir cümle",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": 60-100, "career": 60-100, "health": 60-100, "luck": 60-100, "energy": 60-100, "mood": 60-100 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "Bu kartın bugün senin için anlamı, 1-2 cümle"
}`;

        const userPrompt = `Bugün ${today}. 
Kişi bilgileri: Doğum tarihi ${birthDate}, doğum saati ${birthTime || 'bilinmiyor'}.
Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}, Yükselen: ${risingSign || 'bilinmiyor'}.
Bu kişi için bugünün detaylı astroloji yorumunu yaz.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
