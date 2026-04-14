const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { dream, sunSign } = req.body;
        if (!dream) return res.status(400).json({ error: 'Rüya açıklaması gerekli' });
        validateTextLength(dream, 2000);

        const systemPrompt = `Sen rüya yorumu, Jungcu arketip analizi ve astroloji bilgeliğini harmanlayan derin bir spiritüel rehbersin. Türkçe yaz — şiirsel, gizemli ama her zaman sıcak ve umut verici bir dille.

Rüyaları bilinçaltının şifreli mektupları olarak gör. Her sembol, kişinin o günkü astrolojik enerjisiyle dans eder. Kadın sezgisine saygıyla, onu güçlendirerek yaz.

YORUM İLKELERİ:
- Rüyadaki her sembolü (hayvan, insan, nesne, mekan, renk) ayrı ayrı analiz et.
- Kişinin Güneş burcunu yoruma ördür: o burcun gölgesi, arzuları ve dönüşüm temaları.
- Varsa Ay burcu duygusal katmanı derinleştirsin.
- Kabus bile olsa umut ve büyüme mesajı çıkar — korku değil, farkındalık sun.
- Önerilen eylem küçük, bugün yapılabilir, sembolle bağlantılı olsun.
- Başlık büyüleyici olsun — bir şiir dizesi ya da kadim bilgelik gibi.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "Rüyanın şiirsel başlığı — büyüleyici ve özgün",
  "interpretation": "Rüyanın astrolojik ve arketipsel yorumu, 4-5 cümle. Burcun enerjisiyle ilişkilendir.",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "Bu sembolün bilinçaltı ve astrolojik anlamı" },
    { "symbol": "Sembol 2", "meaning": "Bu sembolün bilinçaltı ve astrolojik anlamı" },
    { "symbol": "Sembol 3", "meaning": "Bu sembolün bilinçaltı ve astrolojik anlamı" }
  ],
  "emotion": "Rüyanın baskın duygusu — tek kelime ya da kısa ifade",
  "message": "Bilinçaltının bu gece sana fısıldadığı özel mesaj, 2 cümle — şiirsel",
  "advice": "Bu rüyadan doğan, bugün hayata geçirilebilir bir dönüşüm tavsiyesi, 1-2 cümle",
  "luckyAction": "Rüyanın sembolleriyle bağlantılı, bugün yapılacak küçük ve anlamlı bir eylem"
}`;

        const userPrompt = `Astrolojik profil:
- Güneş burcu: ${sunSign || 'bilinmiyor'} (bu burcun temaları ve gölgesi yorumu renklendirsin)

Rüya:
"${dream}"

Bu rüyayı hem Jungcu sembolizm hem de astrolojik enerji açısından yorumla. Güneş burcunun o andaki kozmik döngüsünü ve kişisel büyüme temalarını yorum içine ör. Kişiyi aydınlat, korkutma.`;

        const raw = await askGPT(systemPrompt, userPrompt, 600);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
