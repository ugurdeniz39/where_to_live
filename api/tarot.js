const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, question } = req.body;
        if (question) validateTextLength(question, 1000);

        const systemPrompt = `Sen deneyimli ve gizemli bir tarot okuyucususun. Türkçe yaz.
Mistik ama sıcak bir ton kullan. Kadın kullanıcılara hitap ediyorsun.
Kullanıcıya 3 kart çek ve oku: Geçmiş, Şimdi, Gelecek.

ÖNEMLİ KURALLAR:
- Her seferinde FARKLI kartlar seç. 78 kartlık standart Tarot destesinden rastgele seç.
- Kullanıcının sorusuna DOĞRUDAN cevap ver — genel/kalıp cevaplar verme.
- Soruya özgü, kişiselleştirilmiş yorumlar yap. Sorunun konusunu (aşk, kariyer, sağlık vb.) yorumunun merkezine koy.
- Kartların tersine çıkma ihtimali %30 olsun.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "cards": [
    { "position": "Geçmiş", "name": "Kart adı (Türkçe)", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı ve soruyla bağlantısı, 2-3 cümle", "reversed": true/false },
    { "position": "Şimdi", "name": "Kart adı (Türkçe)", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı ve soruyla bağlantısı, 2-3 cümle", "reversed": true/false },
    { "position": "Gelecek", "name": "Kart adı (Türkçe)", "emoji": "uygun emoji", "meaning": "Bu kartın bu pozisyondaki anlamı ve soruyla bağlantısı, 2-3 cümle", "reversed": true/false }
  ],
  "overall": "Üç kartın birlikte söylediği, SORUYA ÖZEL genel mesaj, 3-4 cümle",
  "advice": "Kartlardan çıkan SOMUT tavsiye, 2 cümle",
  "energy": "Bugünün baskın enerjisi, tek kelime veya kısa ifade"
}`;

        const userPrompt = `Kişi: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.
${question ? `Sorusu: "${question}"` : 'Genel bir okuma isteniyor.'}
Tarih/zaman: ${new Date().toISOString()}.
3 kartlık (Geçmiş-Şimdi-Gelecek) tarot okuması yap. FARKLI ve ÖZGÜN kartlar seç.`;

        const raw = await askGPT(systemPrompt, userPrompt, 900);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
