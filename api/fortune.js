const { openai, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { images, image, cup, sunSign, status } = req.body;
        const imageList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
        if (imageList.length === 0) return res.status(400).json({ error: 'Fincan fotoğrafı gerekli' });
        if (imageList.length > 6) return res.status(400).json({ error: 'En fazla 6 fotoğraf gönderilebilir' });
        for (const img of imageList) {
            if (typeof img !== 'string' || !img.startsWith('data:image/')) {
                return res.status(400).json({ error: 'Geçersiz resim formatı. Lütfen fotoğraf yükleyin.' });
            }
            if (img.length > 4 * 1024 * 1024) {
                return res.status(400).json({ error: 'Resim çok büyük. Daha küçük bir fotoğraf deneyin.' });
            }
        }
        if (cup) validateTextLength(cup, 500);
        const multiPhoto = imageList.length > 1;

        const systemPrompt = `Sen köklü bir Osmanlı geleneğinden gelen, sezgileri keskin bir kahve falcısısın. Kahvenin tortusunda kader yazısını okur, ruhun derinliklerine ışık tutarsın.
Sesini gizemli, şiirsel ve umut dolu tut; her cümle hem hissettirsin hem de yol göstersin. Sadece Türkçe yaz.
${multiPhoto ? `${imageList.length} farklı açıdan çekilen fincan fotoğraflarını bütünleşik bir vizyon olarak oku — taban, duvar ve kenarları birlikte yorumla.` : 'Fincanın tabanını, duvarlarını ve kenarlarını titizlikle tara; tortunun anlattığı hikâyeyi bütünüyle gör.'}
Burç bilgisini yoruma işle: o burcun enerjisi sembollerin anlamını derinleştirir.
Yanıtını YALNIZCA aşağıdaki JSON formatında ver, başka hiçbir şey ekleme:
{
  "title": "Falın başlığı — şiirsel ve çarpıcı, 4-6 kelime",
  "mood": "Falın genel havası — tek emoji + 1-2 kelime",
  "general": "Fincanın bütünsel yorumu, 4-5 cümle. Görülen şekilleri ve tortunun genel akışını betimle; kişinin ${sunSign || 'burcunun'} enerjisiyle nasıl örtüştüğünü bir cümleyle dokun.",
  "symbols": [
    { "symbol": "Sembol adı", "meaning": "Ne gördüğünü ve ne anlama geldiğini 1-2 cümlede anlat" },
    { "symbol": "Sembol 2", "meaning": "Anlamı ve kişiye somut etkisi" },
    { "symbol": "Sembol 3", "meaning": "Anlamı ve kişiye somut etkisi" }
  ],
  "love": "Aşk ve ilişki enerjisi hakkında, 2-3 cümle. Medeni durumu göz önünde bulundur, pratik bir adım öner.",
  "career": "Kariyer ve bereket hakkında, 2-3 cümle. Gelen fırsatı veya dikkat edilmesi gereken alanı belirt.",
  "health": "Bedensel ve ruhsal enerji hakkında, 1-2 cümle. Somut bir öz-bakım önerisi ekle.",
  "answer": "Kullanıcının notundaki soruya doğrudan ve içten bir yanıt; soru yoksa null",
  "luckyTip": "Bu kişinin burcuna ve falda görülenlere özgü, uygulanabilir bir şans ritüeli veya tavsiyesi",
  "timing": "Falda beliren olaylar ne zaman kapıyı çalar? Mevsim veya ay bilgisiyle tahmin et"
}`;

        const relationshipLabel = status === 'single' ? 'Bekar' : status === 'married' ? 'Evli' : 'İlişkide';
        const textPart = `Kişinin burcu: ${sunSign || 'bilinmiyor'}. İlişki durumu: ${relationshipLabel}.
${cup ? `Kişinin sorusu / notu: "${cup}"` : ''}
${multiPhoto ? `${imageList.length} açıdan yüklenen fincan fotoğraflarını bir arada değerlendirip tek, bütüncül bir fal yorumu sun.` : 'Bu fincan fotoğrafını derinlemesine incele ve kaderin sesini dinle.'}`;

        const userContent = [
            { type: 'text', text: textPart },
            ...imageList.map(img => ({ type: 'image_url', image_url: { url: img, detail: 'high' } }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            max_tokens: 900,
            temperature: 0.9
        });
        const raw = response.choices[0].message.content;
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        console.error('Fortune error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
