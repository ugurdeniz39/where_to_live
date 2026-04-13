const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { person1, person2 } = req.body;
        if (!person1?.birthDate || !person2?.birthDate) {
            return res.status(400).json({ error: 'Her iki kişinin doğum tarihi gerekli' });
        }

        // Build readable chart descriptions, including moon/rising when available
        const describeChart = (p, label) => {
            const parts = [`Güneş: ${p.sunSign || 'bilinmiyor'}`];
            if (p.moonSign && p.moonSign !== 'bilinmiyor') parts.push(`Ay: ${p.moonSign}`);
            if (p.risingSign && p.risingSign !== 'bilinmiyor') parts.push(`Yükselen: ${p.risingSign}`);
            return `${label} — ${parts.join(', ')}`;
        };

        const chart1 = describeChart(person1, 'Kişi 1');
        const chart2 = describeChart(person2, 'Kişi 2');

        // Determine which layers are available to guide the AI
        const hasMoon1 = person1.moonSign && person1.moonSign !== 'bilinmiyor';
        const hasMoon2 = person2.moonSign && person2.moonSign !== 'bilinmiyor';
        const hasRising1 = person1.risingSign && person1.risingSign !== 'bilinmiyor';
        const hasRising2 = person2.risingSign && person2.risingSign !== 'bilinmiyor';

        const layerNote = (hasMoon1 || hasMoon2 || hasRising1 || hasRising2)
            ? `Mevcut harita verileri: ${chart1}; ${chart2}. ` +
              ((hasMoon1 || hasMoon2) ? 'Ay burçları duygusal uyumu ve güvenliği belirler — bu katmanı iletişim ve güven skorlarına yansıt. ' : '') +
              ((hasRising1 || hasRising2) ? 'Yükselen burçlar ilk çekimi ve uzun vadeli dinamiği etkiler — romantizm ve uzun vade skorlarına dahil et.' : '')
            : 'Yalnızca Güneş burçları mevcut; temel element ve modalite uyumuna odaklan.';

        const systemPrompt = `Sen doğum haritası uyumu konusunda derin bilgiye sahip, şiirsel ve sezgisel bir astrologsun. Türkçe yaz — akıcı, doğal bir dil kullan.
İki kişinin astrolojik uyumunu analiz ediyorsun. Yorum romantik, dürüst ve kozmik bir bakış açısıyla yapılmalı; hem güçlü yönleri hem de dürüstçe ele alınması gereken zorlukları içermeli.
${layerNote}
Element uyumunu (Ateş/Hava, Toprak/Su gibi sinerjiler veya çatışmalar) ve modalite dinamiğini (Kardinal, Sabit, Değişken) yoruma yansıt.
Güçlü yönler ve zorluklar somut, ilişkiye özgü gözlemler olmalı — klişeden kaçın.
Tavsiye, bu iki özgün haritanın birlikte nasıl büyüyebileceğine dair uygulanabilir bir yol göstermelidir.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "overall": 50-99 arası genel uyum skoru,
  "romance": 40-99 arası romantizm ve çekim skoru,
  "communication": 40-99 arası iletişim ve anlayış skoru,
  "passion": 40-99 arası tutku ve fiziksel uyum skoru,
  "longTerm": 40-99 arası uzun vadeli uyum skoru,
  "trust": 40-99 arası güven ve sadakat skoru,
  "summary": "Bu iki haritanın birlikteliğine dair kozmik özet — 2-3 cümle, element veya gezegen dinamiğine değin",
  "strengths": ["Bu çiftin özgün güçlü yönü 1", "Güçlü yön 2", "Güçlü yön 3"],
  "challenges": ["Dürüstçe ele alınması gereken zorluk 1", "Zorluk 2"],
  "advice": "Bu iki harita için özel ilişki tavsiyesi — 2-3 cümle, somut adımlar içermeli",
  "soulConnection": "Bu birlikteliğin ruhsal veya karmik boyutu — 1-2 cümle",
  "bestDates": "Bu çiftin enerjisini en iyi besleyen aktiviteler veya ortamlar — 1 cümle",
  "sign1": "Kişi 1 güneş burcu",
  "sign2": "Kişi 2 güneş burcu",
  "elementCompat": "İki haritanın element ve modalite etkileşimi — 1-2 cümle, özgün gözlem"
}`;

        const userPrompt = `Astrolojik uyum analizi:
${chart1}, doğum: ${person1.birthDate}, saat: ${person1.birthTime || 'bilinmiyor'}
${chart2}, doğum: ${person2.birthDate}, saat: ${person2.birthTime || 'bilinmiyor'}

Bu iki kişinin haritaları arasındaki gerçek astrolojik dinamiği—ateş veya sürtüşme noktaları, element sinerjileri, Ay uyumu, Yükselen etkileşimi dahil—derinlemesine analiz et. Yorum özgün ve bu çifte özgü olsun.`;

        const raw = await askGPT(systemPrompt, userPrompt, 850);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
