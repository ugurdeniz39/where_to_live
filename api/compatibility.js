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

        // Detect element combination for targeted nuance guidance
        const elementOf = (sign) => {
            const fireSign = ['Koç', 'Aslan', 'Yay', 'Aries', 'Leo', 'Sagittarius'];
            const earthSign = ['Boğa', 'Başak', 'Oğlak', 'Taurus', 'Virgo', 'Capricorn'];
            const airSign = ['İkizler', 'Terazi', 'Kova', 'Gemini', 'Libra', 'Aquarius'];
            const waterSign = ['Yengeç', 'Akrep', 'Balık', 'Cancer', 'Scorpio', 'Pisces'];
            if (fireSign.some(s => sign?.includes(s))) return 'ateş';
            if (earthSign.some(s => sign?.includes(s))) return 'toprak';
            if (airSign.some(s => sign?.includes(s))) return 'hava';
            if (waterSign.some(s => sign?.includes(s))) return 'su';
            return null;
        };

        const el1 = elementOf(person1.sunSign);
        const el2 = elementOf(person2.sunSign);
        const sameElement = el1 && el2 && el1 === el2;
        const elementPair = el1 && el2 ? `${el1}-${el2}` : null;

        // Element synergy guidance for the AI
        const elementDynamics = {
            'ateş-ateş': 'Aynı element (Ateş-Ateş): İki alev bir arada tutuşur ama bazen birbirini yakar. Benzer tutku ve ego çatışmaları, kim lider olacak sorusu — bu dinamiği hem heyecan hem de güç mücadelesi açısından işle.',
            'toprak-toprak': 'Aynı element (Toprak-Toprak): Ortak değerler ve güvenlik ihtiyacı sağlam zemin kurar; ancak iki sabit toprak birbirinin büyümesini frenleyebilir. Konfor alanından çıkma meydan okumasını vurgula.',
            'hava-hava': 'Aynı element (Hava-Hava): Zihinsel kimya çok güçlü; iki hava birbirini anlıyor ama ikisi de karar vermekte ve derinleşmekte zorlanabilir. Duygusal köklülük eksikliğini işle.',
            'su-su': 'Aynı element (Su-Su): Duygusal derinlik ve sezgisel bağ güçlü; risk ise iki suyun birbirini girdaba çekmesi, sınırların erimesi. Sağlıklı bağımsızlık ihtiyacını ele al.',
            'ateş-hava': 'Ateş-Hava sinerjisi: Hava, Ateşi besler ve yükseltir; Ateş, Havaya canlılık katar. Entelektüel heyecan ve macera ortaklığı güçlü; duygusal derinlik için bilinçli çaba gerekir.',
            'hava-ateş': 'Hava-Ateş sinerjisi: Hava, Ateşi besler ve yükseltir; Ateş, Havaya canlılık katar. Entelektüel heyecan ve macera ortaklığı güçlü; duygusal derinlik için bilinçli çaba gerekir.',
            'toprak-su': 'Toprak-Su sinerjisi: Su, Toprağı besler; Toprak, Suya şekil ve güvenlik verir. Duygusal beslenme ve pratik istikrar birleşir — en verimli çiftlerden biri. Eğilim ise fazla içe kapanmak.',
            'su-toprak': 'Su-Toprak sinerjisi: Su, Toprağı besler; Toprak, Suya şekil ve güvenlik verir. Duygusal beslenme ve pratik istikrar birleşir — en verimli çiftlerden biri. Eğilim ise fazla içe kapanmak.',
            'ateş-toprak': 'Ateş-Toprak gerilimi: Ateşin vizyonu ile Toprağın temkinliliği çatışabilir. Ateş sıkılabilir, Toprak bunalabilir; ama birbirini tamamlayabilirler — biri ateşler, diğeri sürdürür.',
            'toprak-ateş': 'Toprak-Ateş gerilimi: Ateşin vizyonu ile Toprağın temkinliliği çatışabilir. Ateş sıkılabilir, Toprak bunalabilir; ama birbirini tamamlayabilirler — biri ateşler, diğeri sürdürür.',
            'hava-su': 'Hava-Su gerilimi: Hava, duyguları kavramlaştırır; Su, mantıktan önce hisseder. Biri kelimelerle anlarken diğeri sessizce yaşar — yanlış anlama riski yüksek ama dönüşüm potansiyeli de büyük.',
            'su-hava': 'Su-Hava gerilimi: Hava, duyguları kavramlaştırır; Su, mantıktan önce hisseder. Biri kelimelerle anlarken diğeri sessizce yaşar — yanlış anlama riski yüksek ama dönüşüm potansiyeli de büyük.',
        };

        const elementNote = elementPair
            ? (elementDynamics[elementPair] || `Element dinamiği (${elementPair}): Bu iki elementin etkileşimini özgün biçimde yorumla.`)
            : 'Güneş burçları bilinmiyor; genel element dinamiğine odaklan.';

        const layerNote = (hasMoon1 || hasMoon2 || hasRising1 || hasRising2)
            ? `Mevcut harita verileri: ${chart1}; ${chart2}. ` +
              ((hasMoon1 || hasMoon2) ? 'Ay burçları duygusal uyumu ve güvenliği belirler — bu katmanı iletişim ve güven skorlarına yansıt. ' : '') +
              ((hasRising1 || hasRising2) ? 'Yükselen burçlar ilk çekimi ve uzun vadeli dinamiği etkiler — romantizm ve uzun vade skorlarına dahil et.' : '')
            : 'Yalnızca Güneş burçları mevcut; temel element ve modalite uyumuna odaklan.';

        const systemPrompt = `Sen doğum haritası uyumu ve sinastri konusunda derin bilgiye sahip, şiirsel ve sezgisel bir astrologsun. Türkçe yaz — akıcı, doğal, içten bir dil kullan; çeviri kokmamalı.

İki kişinin astrolojik uyumunu analiz ediyorsun. Yorum romantik, dürüst ve kozmik bir bakış açısıyla yapılmalı; hem güçlü yönleri hem de dürüstçe ele alınması gereken zorlukları içermeli.

ELEMENT DİNAMİĞİ (Bu çiftin spesifik durumu):
${elementNote}

KATMAN BİLGİSİ:
${layerNote}

SİNASTRİ GEZEGENLERİ (Mevcut bilgiye göre bunları mutlaka ele al):
- Güneş-Ay etkileşimi: Bu çiftin kimlik ve duygusal ihtiyaç uyumu — biri ışınırken diğeri nasıl hissediyor?
- Güneş-Güneş açısı: İki benliğin yan yana varoluşu — uyum mu, güç mücadelesi mi, büyüme mi?
- Ay-Ay uyumu: Duygusal diller ne kadar örtüşüyor? İkisi de güvende hissediyor mu?
- Venüs-Mars dinamiği: Aşkı verme ve alma biçimleri, çekim enerjisi, fiziksel uyum
- Yükselen uyumu (varsa): İlk izlenim ve uzun vadeli beraber var olma biçimi
Bu gezegen çiftlerini somut, bu çifte özgü biçimde yorumla — genel bilgi değil, bu iki haritanın diyaloğu.

KISA VADELİ vs. UZUN VADELİ:
- Kısa vadede (0-2 yıl) bu çift neyle karşılaşır? Çekimin yoğunluğu, keşif dönemi, ilk sürtüşmeler neler?
- Uzun vadede (2+ yıl) ne gerekir? Hangi alışkanlıkları birlikte inşa etmeli, hangi desenler farkındalıkla dönüştürülmeli?
Bu ayrımı advice ve growthEdge alanlarında net yansıt.

Modalite dinamiğini de gez: Kardinal/Sabit/Değişken kombinasyonu bu çifte ne anlatıyor?

Güçlü yönler ve zorluklar somut, ilişkiye özgü gözlemler olmalı — klişeden kaçın, her cümle bu iki haritadan türemeli.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "overall": 50-99 arası genel uyum skoru,
  "romance": 40-99 arası romantizm ve çekim skoru,
  "communication": 40-99 arası iletişim ve anlayış skoru,
  "passion": 40-99 arası tutku ve fiziksel uyum skoru,
  "longTerm": 40-99 arası uzun vadeli uyum skoru,
  "trust": 40-99 arası güven ve sadakat skoru,
  "summary": "Bu iki haritanın birlikteliğine dair kozmik özet — 2-3 cümle, element ve gezegen dinamiğine değin",
  "synastrySummary": "En belirleyici 2-3 gezegen çiftinin (Venüs-Mars, Güneş-Ay, Ay-Ay vb.) bu çift için ne anlama geldiği — 2-3 cümle, somut ve bu çifte özgü",
  "strengths": ["Bu çiftin özgün güçlü yönü 1", "Güçlü yön 2", "Güçlü yön 3"],
  "challenges": ["Dürüstçe ele alınması gereken zorluk 1", "Zorluk 2"],
  "advice": "Bu iki harita için özel ilişki tavsiyesi — 2-3 cümle, kısa ve uzun vadeli somut adımlar içermeli",
  "growthEdge": "Bu çiftin birlikte dönüşebileceği en derin alan — hangi kör noktayı birlikte aşarlarsa ilişki gerçek olgunluğuna ulaşır? 1-2 cümle, cesur ve içten",
  "soulConnection": "Bu birlikteliğin ruhsal veya karmik boyutu — 1-2 cümle",
  "bestDates": "Bu çiftin enerjisini en iyi besleyen aktiviteler veya ortamlar — 1 cümle",
  "sign1": "Kişi 1 güneş burcu",
  "sign2": "Kişi 2 güneş burcu",
  "elementCompat": "İki haritanın element ve modalite etkileşimi — 1-2 cümle, aynı element mi farklı mı, bu ne anlama geliyor?"
}`;

        const userPrompt = `Astrolojik uyum analizi:
${chart1}, doğum: ${person1.birthDate}, saat: ${person1.birthTime || 'bilinmiyor'}
${chart2}, doğum: ${person2.birthDate}, saat: ${person2.birthTime || 'bilinmiyor'}

Bu iki kişinin haritaları arasındaki gerçek sinastri dinamiğini derinlemesine analiz et: Venüs-Mars çekimi, Güneş-Ay duygusal diyaloğu, Ay-Ay duygusal dil uyumu, element sinerjisi veya gerilimi, Yükselen etkileşimi. Kısa vadeli (ilk 2 yıl) ve uzun vadeli (2+ yıl) boyutları ayırt et. Yorum özgün ve bu çifte özgü olsun — ne kopya-yapıştır ne de genel bilgi.`;

        const raw = await askGPT(systemPrompt, userPrompt, 1000);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
