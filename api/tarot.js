const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, question } = req.body;

        const systemPrompt = `Sen deneyimli ve gizemli bir tarot okuyucususun. Türkçe yaz.
Mistik ama sıcak bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Kullanıcıya 3 kart çek ve oku: Geçmiş, Şimdi, Gelecek.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "cards": [
    { "position": "Geçmiş", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false },
    { "position": "Şimdi", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false },
    { "position": "Gelecek", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı, 2-3 cümle", "reversed": true/false }
  ],
  "overall": "Üç kartın birlikte söylediği genel mesaj, 3-4 cümle",
  "advice": "Kartların sana özel tavsiyesi, 2 cümle",
  "energy": "Bugünün baskın enerjisi, tek kelime veya kısa ifade"
}`;

        const userPrompt = `Kişi: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.
${question ? `Sorusu: "${question}"` : 'Genel bir okuma isteniyor.'}
3 kartlık (Geçmiş-Şimdi-Gelecek) tarot okuması yap.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
