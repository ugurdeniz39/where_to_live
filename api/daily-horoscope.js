const { askGPT, parseJSON, corsHeaders } = require('./_lib/openai');

// Known Mercury retrograde windows (extend as needed)
const MERCURY_RETROGRADES = [
    { start: '2025-01-24', end: '2025-02-15' },
    { start: '2025-05-29', end: '2025-06-22' },
    { start: '2025-09-21', end: '2025-10-13' },
    { start: '2026-01-06', end: '2026-01-28' },
    { start: '2026-05-11', end: '2026-06-03' },
    { start: '2026-09-04', end: '2026-09-28' }
];

// Known Venus retrograde windows
const VENUS_RETROGRADES = [
    { start: '2025-03-01', end: '2025-04-12' },
    { start: '2026-07-23', end: '2026-09-03' }
];

// Known Mars retrograde windows
const MARS_RETROGRADES = [
    { start: '2024-12-06', end: '2025-02-24' },
    { start: '2026-10-29', end: '2027-01-02' }
];

function isInWindow(dateStr, windows) {
    return windows.some(w => dateStr >= w.start && dateStr <= w.end);
}

function getRetrogradePlanets(dateStr) {
    const retrogrades = [];
    if (isInWindow(dateStr, MERCURY_RETROGRADES)) retrogrades.push('Merkür');
    if (isInWindow(dateStr, VENUS_RETROGRADES)) retrogrades.push('Venüs');
    if (isInWindow(dateStr, MARS_RETROGRADES)) retrogrades.push('Mars');
    return retrogrades;
}

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
        const todayISO = new Date().toISOString().slice(0, 10);
        const periodLabel = { weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık' }[period] || 'Günlük';
        const periodScope = { weekly: 'Bu hafta', monthly: 'Bu ay', yearly: 'Bu yıl' }[period] || 'Bugün';

        // Retrograde context (only for daily/weekly — meaningful at short timescales)
        const isDaily = !period || period === 'daily';
        const retrogradePlanets = (isDaily || period === 'weekly') ? getRetrogradePlanets(todayISO) : [];
        const retrogradeNote = retrogradePlanets.length > 0
            ? `ŞU AN RETROGRAT: ${retrogradePlanets.join(', ')}. ${
                retrogradePlanets.includes('Merkür')
                    ? 'Merkür retrosu; iletişim, anlaşmalar ve seyahatlerde dikkat, eskiyle yeniden bağlanma fırsatı.'
                    : ''
              }${
                retrogradePlanets.includes('Venüs')
                    ? ' Venüs retrosu; aşkta netleşme dönemi, eski ilişkiler yüzeye çıkabilir.'
                    : ''
              }${
                retrogradePlanets.includes('Mars')
                    ? ' Mars retrosu; harekete geçmeden önce strateji gözden geçirme zamanı, sabır önemli.'
                    : ''
              } Bu retro enerjisini yoruma yansıt — hem günlük pratik önerilerde hem de genel mesajda.`
            : 'Büyük retrograt gezegen yok; enerjiler ileri akışta.';

        // Gender-specific tone
        const genderText = {
            'kadın': { tone: 'zarif, içgüdüsel ve güçlendirici', article: 'kadın' },
            'erkek': { tone: 'kararlı, cesur ve ilham verici', article: 'erkek' },
            'diğer': { tone: 'özgür, kapsayıcı ve ilham verici', article: 'kişi' }
        }[gender] || { tone: 'sıcak ve ilham verici', article: 'kişi' };

        // Build natal chart description from available placements
        const hasMoon = moonSign && moonSign !== 'bilinmiyor';
        const hasRising = risingSign && risingSign !== 'bilinmiyor';
        const chartParts = [`Güneş: ${sunSign || 'bilinmiyor'}`];
        if (hasMoon) chartParts.push(`Ay: ${moonSign}`);
        if (hasRising) chartParts.push(`Yükselen: ${risingSign}`);
        const chartSummary = chartParts.join(', ');

        const planetaryNote = (hasMoon || hasRising)
            ? `${name}'in doğum haritası — ${chartSummary}. ${hasMoon ? `${moonSign} Ayı duygusal tonu ve sezgisel tepkileri renklendirir.` : ''} ${hasRising ? `${risingSign} Yükselen dış görünümü ve sosyal dinamiği şekillendirir.` : ''} Bu yerleşimleri yorumun dokusuna işle.`
            : `Yalnızca ${sunSign || 'bilinmiyor'} Güneş burcu mevcut; yorumu bu enerji üzerine kur.`;

        // Time-of-day guidance block (only for daily)
        const timeOfDayBlock = isDaily
            ? `"timeOfDay": {
    "morning": "${name} için sabah (06:00-12:00) önerisi — enerjiyi başlatmak için somut 1 eylem",
    "afternoon": "${name} için öğleden sonra (12:00-18:00) önerisi — odak veya dikkat noktası, 1 cümle",
    "evening": "${name} için akşam (18:00-24:00) önerisi — yansıma veya enerji tamamlama ritüeli, 1 cümle"
  },`
            : '';

        const systemPrompt = `Sen derin sezgilere sahip, şiirsel üsluplu ve deneyimli bir astrologsun. Türkçe yaz — akıcı, doğal Türkçe kullan, çeviri gibi durmasın.
${name} adında bir ${genderText.article} için ${periodLabel.toLowerCase()} astroloji yorumu yazıyorsun; ton ${genderText.tone} olsun.
${planetaryNote}
${retrogradeNote}
Yorum kozmik imgelerle (gezegenler, ışık, akış, dönüşüm) renklenmeli ama şiirsellik somut tavsiyeyi gölgelememelidir.
Her alan için o alana özgü, bu ${periodLabel.toLowerCase()} döneminde yapılabilecek en az bir somut eylem öner.
${name}'in ismini doğal biçimde 2-3 kez kullan; "${name}, bu ${periodScope.toLowerCase()}..." gibi açılışlar tercih et.
Yanıtların her seferinde farklı, taze ve yaratıcı olmalı — klişeden kaçın.
Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "general": "${name} için ${periodScope.toLowerCase()} kozmik enerji mesajı — 2-3 cümle, aktif gezegen enerjisine ve varsa retro etkisine değin",
  "love": "Aşk ve ilişkiler için ${periodScope.toLowerCase()} özel mesaj — 2-3 cümle, somut bir eylem veya dikkat noktası",
  "career": "Kariyer ve bolluk için ${periodScope.toLowerCase()} rehberlik — 2-3 cümle, fırsat veya dikkat noktası belirt",
  "health": "Beden ve zihin dengesi için ${periodScope.toLowerCase()} tavsiye — 2-3 cümle, uygulanabilir bir öneri",
  ${timeOfDayBlock}
  "advice": "${name}'e özel ${periodLabel.toLowerCase()} ana mesajı — 1-2 güçlü cümle, bu döneme ait tek bir netlik anı sun",
  "affirmation": "${name} için kozmik onaylama cümlesi — güçlü, kısa, birinci şahıs",
  "luckyColor": "Şans rengi (tek kelime)",
  "luckyNumber": 42,
  "luckyStone": "Şans taşı adı",
  "luckyHour": "Şanslı saat aralığı (örn: 14:00-16:00)",
  "scores": { "love": 78, "career": 85, "health": 72, "luck": 80, "energy": 75, "mood": 82 },
  "tarotCard": "Günün tarot kartı adı",
  "tarotMeaning": "Bu kartın ${name}'e ${periodScope.toLowerCase()} özel mesajı — 1-2 cümle, burç enerjisiyle bağlantı kur"${retrogradePlanets.length > 0 ? `,\n  "retrogradeNote": "${retrogradePlanets.join('+')} retrosunun ${name}'e bu dönem özel etkisi — 1 pratik cümle"` : ''}
}`;

        const userPrompt = `Tarih: ${today} | Kişi: ${name} (${gender}) | Doğum: ${birthDate}${birthTime ? ', ' + birthTime : ''}
Harita: ${chartSummary}${retrogradePlanets.length > 0 ? ` | Retrograt: ${retrogradePlanets.join(', ')}` : ''}
Dönem: ${periodLabel}

${name} için bu dönemin enerjisini yansıt. ${sunSign || 'Güneş burcu'} Güneşi'nden yola çık${hasMoon ? `; ${moonSign} Ayı'nın duygusal katmanını ekle` : ''}${hasRising ? `; ${risingSign} Yükselen'in dış dinamiğini harmana kat` : ''}. Özgün, taze ve kişiye özel yorum yaz.`;

        const raw = await askGPT(systemPrompt, userPrompt, 950);
        const result = parseJSON(raw);

        // Ensure scores are integers, not strings
        if (result?.scores && typeof result.scores === 'object') {
            for (const key of Object.keys(result.scores)) {
                const val = parseInt(result.scores[key], 10);
                result.scores[key] = isNaN(val) ? 75 : Math.min(100, Math.max(1, val));
            }
        }

        // Ensure luckyNumber is an integer
        if (result?.luckyNumber !== undefined) {
            const num = parseInt(result.luckyNumber, 10);
            result.luckyNumber = isNaN(num) ? Math.floor(Math.random() * 99) + 1 : num;
        }

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
