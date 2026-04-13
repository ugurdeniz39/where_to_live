const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
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

        // Gender-specific tone
        const genderText = {
            'kadın': { tone: 'zarif, içgüdüsel ve güçlendirici', article: 'kadın' },
            'erkek': { tone: 'kararlı, cesur ve ilham verici', article: 'erkek' },
            'diğer': { tone: 'özgür, saygılı ve ilham verici', article: 'kişi' }
        }[gender] || { tone: 'sıcak ve ilham verici', article: 'kişi' };

        // Build a rich natal chart description only from what's available
        const hasMoon = moonSign && moonSign !== 'bilinmiyor';
        const hasRising = risingSign && risingSign !== 'bilinmiyor';
        const chartParts = [`Güneş: ${sunSign || 'bilinmiyor'}`];
        if (hasMoon) chartParts.push(`Ay: ${moonSign}`);
        if (hasRising) chartParts.push(`Yükselen: ${risingSign}`);
        const chartSummary = chartParts.join(', ');

        // Instruction to weave in the placements if available
        const planetaryNote = (hasMoon || hasRising)
            ? `${name}'in doğum haritasında ${chartSummary} var. ${hasMoon ? `Ay burcu ${moonSign}, duygusal dünyasını ve içgüdüsel tepkilerini renklendirir — bu yerleşimi ${periodLabel.toLowerCase()} yorumuna dahil et.` : ''} ${hasRising ? `Yükselen burç ${risingSign}, ${name}'in dünyaya nasıl göründüğünü ve ilk izlenimlerini şekillendirir — kariyer veya sosyal ipuçları verirken bunu yansıt.` : ''}`
            : `Yalnızca Güneş burcu ${sunSign || 'bilinmiyor'} mevcut; yorumu buna odakla.`;

        const systemPrompt = `Sen derin sezgilere sahip, şiirsel üsluplu ve deneyimli bir astrologsun. Türkçe yaz — akıcı, doğal Türkçe kullan, çeviri gibi durmasın.
${name} adında bir ${genderText.article} için ${periodLabel.toLowerCase()} astroloji yorumu yazıyorsun; ton ${genderText.tone} olsun.
${planetaryNote}
Yorum kozmik imgelerle (gezegenler, ışık, akış, dönüşüm) renklenmeli ama şiirsellik somut tavsiyeyi gölgelememelidir.
Her alan için o alana özgü, bu ${periodLabel.toLowerCase()} döneminde yapılabilecek en az bir somut eylem öner.
${name}'in ismini doğal biçimde 2-3 kez kullan; "Merhaba ${name}," veya "${name}, bu ${periodScope.toLowerCase()}..." gibi açılışlar tercih et.
Yanıtların her seferinde farklı, taze ve yaratıcı olmalı — klişeden kaçın.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "${name} için ${periodScope.toLowerCase()} kozmik enerji mesajı — 2-3 cümle, aktif gezegen veya eleman enerjisine değin",
  "love": "Aşk ve ilişkiler için ${periodScope.toLowerCase()} özel mesaj — 2-3 cümle, somut bir eylem içermeli",
  "career": "Kariyer ve bolluk için ${periodScope.toLowerCase()} rehberlik — 2-3 cümle, fırsat veya dikkat noktası belirt",
  "health": "Beden ve zihin dengesi için ${periodScope.toLowerCase()} tavsiye — 2-3 cümle, uygulanabilir bir öneri içermeli",
  "advice": "${name}'e özel ${periodLabel.toLowerCase()} ana mesajı — 1-2 güçlü cümle, bu döneme ait tek bir netlik anı sun",
  "affirmation": "${name} için kozmik onaylama cümlesi — güçlü, kısa, birinci şahıs, ${periodScope.toLowerCase()} için geçerli",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": "1-99 arası şans sayısı",
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı örn: 14:00-16:00",
  "scores": { "love": 60-100, "career": 60-100, "health": 60-100, "luck": 60-100, "energy": 60-100, "mood": 60-100 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "Bu kartın ${name}'e ${periodScope.toLowerCase()} özel mesajı — 1-2 cümle, doğum haritasıyla bağlantı kur"
}`;

        const userPrompt = `Tarih: ${today}
Kişi: ${name} (${gender}), doğum: ${birthDate}, saat: ${birthTime || 'bilinmiyor'}
Doğum haritası — ${chartSummary}
Dönem: ${periodLabel} (${periodScope})

${name} için bu dönemin enerjisini yansıt. ${sunSign || 'Güneş burcu'} Güneşi'nin özelliklerinden yola çık${hasMoon ? `; ${moonSign} Ayı'nın duygusal derinliğini ekle` : ''}${hasRising ? `; ${risingSign} Yükselen'in dış görünümünü ve sosyal dinamiğini de harmana kat` : ''}. Yorum her defasında özgün, taze ve kişiye özel olsun.`;

        const raw = await askGPT(systemPrompt, userPrompt, 850);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
