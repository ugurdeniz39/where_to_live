const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { name, gender, birthDate, birthTime, sunSign, moonSign, risingSign, period } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });
        if (!name) return res.status(400).json({ error: 'Ad gerekli' });
        if (!gender) return res.status(400).json({ error: 'Cinsiyet gerekli' });

        const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const periodLabel = { weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık' }[period] || 'Günlük';
        const periodScope = { weekly: 'Bu hafta', monthly: 'Bu ay', yearly: 'Bu yıl' }[period] || 'Bugün';
        
        // Gender-specific pronoun and tone
        const genderText = {
            'kadın': { pronoun: 'sen', tone: 'zarif, şefkatli ve güçlendirici', article: 'Kadın' },
            'erkek': { pronoun: 'sen', tone: 'güçlü, cesur ve ilham verici', article: 'Erkek' },
            'diğer': { pronoun: 'sen', tone: 'dost canlı, saygılı ve ilham verici', article: 'Kimse' }
        }[gender] || { pronoun: 'sen', tone: 'sıcak ve ilham verici', article: 'Kimse' };

        const systemPrompt = `Sen deneyimli, sıcak ve empatik bir astrologsun. Türkçe yaz. 
${name} adında ${genderText.article.toLowerCase()}, doğum tarihi ${birthDate} olan birine astroloji yorumu yapıyorsun.
Yanıtlarını samimi, ilham verici ve motive edici tut. ${name}'e hitap ediyorsun — ${genderText.tone} bir ton kullan.
Emoji kullan ama abartma. Her bölümü net ve akıcı yaz.
Bu bir ${periodLabel} yorumdur. ${periodScope} için detaylı, çok spesifik ve ${name}'e kişisel olarak seslenen yorum yaz.
${name}'in adını en az 2-3 kez yorumda kullan, adına hitap biçiminde. Örneğin "Merhaba ${name}!" gibi başla veya "${name}, bu dönem..." şeklinde bahset.
Genellikle aynı yorumları yazma! Çok çeşitli, benzersiz ve yaratıcı tavsiyeler sun.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "${name}, ${periodScope.toLowerCase()} genel enerjisi hakkında kişisel mesaj — 2-3 cümle",
  "love": "${name}'in aşk ve ilişkileri hakkında spesifik yorum — 2-3 cümle", 
  "career": "${name}'in kariyer ve para hakkında tavsiye — 2-3 cümle",
  "health": "${name}'in sağlık ve enerji hakkında — 2-3 cümle",
  "advice": "${name}'e özel ${periodLabel.toLowerCase()} tavsiyesi — 1-2 cümle, çok spesifik",
  "affirmation": "${name} için güçlendirici söz — kısa, güçlü, ${periodScope.toLowerCase()} geçerli",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": 60-100, "career": 60-100, "health": 60-100, "luck": 60-100, "energy": 60-100, "mood": 60-100 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "${name}'e bu kartın ${periodScope.toLowerCase()} anlamı — 1-2 cümle, çok kişisel"
}`;

        const userPrompt = `Bugün ${today}.
Kişi: ${name} (${gender})
Doğum tarihi ${birthDate}, doğum saati ${birthTime || 'bilinmiyor'}.

⚠️ Bu kişinin burcu KESİNLİKLE ${sunSign || 'bilinmiyor'}. Başka burç yazma!
Güneş burcu: ${sunSign || 'bilinmiyor'}, Ay burcu: ${moonSign || 'bilinmiyor'}, Yükselen: ${risingSign || 'bilinmiyor'}.

${name} için çok spesifik, kişisel ve benzersiz bir yorumun olsun! Aynı şeyleri yazma. ${sunSign} burcuna özgü olmalı.
${name}'e doğrudan seslenleri ve ismini sık sık kullan. Yorumun son derece kişiselleştirilmiş olmalı.`;

        const raw = await askGPT(systemPrompt, userPrompt, 800);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
