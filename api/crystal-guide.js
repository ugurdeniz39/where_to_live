const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, moonSign, mood, intention } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Doğum tarihi gerekli' });
        if (mood) validateTextLength(mood, 200);

        // Intention-based crystal pools — different stones for different purposes
        const intentionPools = {
            koruma: ['Obsidyen', 'Hematit', 'Kara Turmalin', 'Labradorit', 'Pirit'],
            ask: ['Rodonit', 'Morganit', 'Rodokrozit', 'Kunzit', 'Ay Taşı'],
            bolluk: ['Sitrin', 'Yeşim', 'Aventurin', 'Topaz', 'Pirit'],
            netlik: ['Kuvars (Dumanlı)', 'Florit', 'Sodalit', 'Apatit', 'Akuamarin'],
            iyilesme: ['Amazonit', 'Celestit', 'Prehnit', 'Angelit', 'Krizokol'],
            guc: ['Karneol', 'Kaplan Gözü', 'Granat', 'Aragonit', 'Sunstone'],
            genel: [
                ['Sitrin', 'Akuamarin', 'Karneol', 'Labradorit', 'Turkuaz'],
                ['Lapis Lazuli', 'Aventurin', 'Rodonit', 'Obsidyen', 'Ay Taşı'],
                ['Kuvars (Dumanlı)', 'Yeşim', 'Florit', 'Hematit', 'Amazonit'],
                ['Kaplan Gözü', 'Selenit', 'Rodokrozit', 'Aragonit', 'Kunzit'],
                ['Apatit', 'Akik', 'Celestit', 'Prehnit', 'Moldavit'],
                ['Mercan', 'Serpantin', 'İyolit', 'Morganit', 'Krizokol'],
                ['Kehribar', 'Topaz', 'Zümrüt', 'Peridot', 'Tanzanit'],
                ['Sunstone', 'Larimar', 'Howlit', 'Granat', 'Sodalit']
            ]
        };

        // Determine active intention
        const normalizeIntention = (i) => {
            if (!i) return null;
            const lower = i.toLowerCase();
            if (lower.includes('koruma') || lower.includes('güvenlik') || lower.includes('korun')) return 'koruma';
            if (lower.includes('aşk') || lower.includes('ask') || lower.includes('sevgi') || lower.includes('ilişki')) return 'ask';
            if (lower.includes('bolluk') || lower.includes('para') || lower.includes('refah') || lower.includes('bereket') || lower.includes('maddi')) return 'bolluk';
            if (lower.includes('netlik') || lower.includes('odak') || lower.includes('karar') || lower.includes('zihin')) return 'netlik';
            if (lower.includes('iyileş') || lower.includes('şifa') || lower.includes('dingin') || lower.includes('huzur')) return 'iyilesme';
            if (lower.includes('güç') || lower.includes('cesaret') || lower.includes('enerji') || lower.includes('motivasyon')) return 'guc';
            return null;
        };

        // Also check mood for intention hints
        const activeIntention = normalizeIntention(intention) || normalizeIntention(mood);

        // Pick crystal from the appropriate pool
        let suggestedCrystal;
        if (activeIntention && intentionPools[activeIntention]) {
            const pool = intentionPools[activeIntention];
            suggestedCrystal = pool[Math.floor(Math.random() * pool.length)];
        } else {
            const generalPools = intentionPools.genel;
            const pool = generalPools[Math.floor(Math.random() * generalPools.length)];
            suggestedCrystal = pool[Math.floor(Math.random() * pool.length)];
        }

        // Human-readable intention label for the AI
        const intentionLabels = {
            koruma: 'koruma ve güvenlik',
            ask: 'aşk ve ilişki',
            bolluk: 'bolluk ve bereket',
            netlik: 'zihinsel netlik ve odak',
            iyilesme: 'iyileşme ve huzur',
            guc: 'güç ve motivasyon'
        };
        const intentionContext = activeIntention
            ? `Bu kişinin birincil niyeti: **${intentionLabels[activeIntention]}**. Tüm öneri bu niyet etrafında örülmeli — kristal seçimi, çakra, ritüel ve olumla bu niyetle rezonans halinde olsun.`
            : 'Belirli bir niyet yok; genel denge, netlik ve içsel uyuma odaklan.';

        const systemPrompt = `Sen kristal terapi, çakra bilgeliği ve kadim şifa sanatları konusunda derin deneyim sahibi spiritüel bir rehbersin. Türkçe yaz — şiirsel, sıcak, güçlendirici bir dil kullan. Cümleler doğal aksın; çeviri gibi değil, gerçekten Türkçe düşünen biri gibi yaz.

Kadın ruhuna seslenen bir bilge gibi konuş: gizemli ama ulaşılabilir, mistik ama pratik. Her öneri bugün, elle tutulur biçimde uygulanabilir olsun.

NİYET ODAĞI:
${intentionContext}

KRİSTAL SEÇİMİ KURALLARI:
- Ana kristal olarak YALNIZCA "${suggestedCrystal}" kullan — bu taşın özünü, tarihini ve titreşimini derinlemesine tanıt.
- Ametist yasaktır: ne ana ne destek kristalinde kullan.
- Destek kristallerini Güneş ve Ay burcunun elementine (ateş/toprak/hava/su) VE aktif niyete göre seç.
- Ruh hali bilgisini yoksayma — mood varsa tüm öneriyi o ruh haline göre ördür.

ÜSLUP:
- Taşları sanki canlı varlıklarmış gibi tanıt: "Bu taş seninle titreşmek istiyor...", "Elinde tuttuğunda hissedeceksin..."
- Çakra bilgisi somut beden duyumlarına atıf yapsın — "kalp bölgesinde genişleme", "kaş ortasında hafif bir basınç" gibi.
- Mantra Türkçe olsun, şiirsel ve kısa, kolayca hatırlanır.
- Ay ritüeli mevsim ve bugünün enerjisiyle uyumlu olsun.
- Temizleme ve şarj talimatları bu taşa özgü olsun — her kristal aynı yöntemle temizlenmez.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
{
  "mainCrystal": {
    "name": "Ana kristal adı",
    "emoji": "💎",
    "color": "#hex renk",
    "benefit": "Bu taşın bugün sana özgü hediyesi — 2 cümle, şiirsel ve niyetle uyumlu",
    "howToUse": "Pratik ve mistik kullanım önerisi — nerede taş, ne zaman, nasıl, 1-2 cümle",
    "cleansing": "Bu taşa özgü temizleme yöntemi: hangi yöntem işe yarar, hangisi zarar verir (su hassasiyeti, tuz hassasiyeti vb.) — 1-2 cümle",
    "charging": "Bu taşı nasıl şarj edersin: ay ışığı, güneş, toprak, ses tonu, nefes — taşın doğasına uygun yöntem, 1 cümle"
  },
  "supportCrystals": [
    { "name": "Destek kristal 1", "emoji": "emoji", "benefit": "Burç/element ve niyet uyumuyla kısa fayda" },
    { "name": "Destek kristal 2", "emoji": "emoji", "benefit": "Burç/element ve niyet uyumuyla kısa fayda" },
    { "name": "Destek kristal 3", "emoji": "emoji", "benefit": "Burç/element ve niyet uyumuyla kısa fayda" }
  ],
  "chakra": {
    "name": "Odaklanman gereken çakra adı (Türkçe + Sanskrit)",
    "bodyLocation": "Bedenin tam olarak neresi — göğüs ortası, kaş arası, karın alt kısmı gibi spesifik beden konumu",
    "color": "#hex",
    "tip": "Bu çakrayı dengelemek için somut bir uygulama — beden duyumunu da tarif et, 1-2 cümle"
  },
  "colors": {
    "wear": "Bugün için enerji rengi ve burca/ruh haline/niyete özgü nedeni",
    "avoid": "Bugün enerjini tüketen renk ve nedeni",
    "home": "Evinizde bu rengi bir köşeye yerleştirin — neden?"
  },
  "meditation": {
    "duration": "X dakika",
    "focus": "Bugünün enerjisiyle ve niyetle uyumlu meditasyon odağı, 1 cümle",
    "mantra": "Türkçe, şiirsel, kısa mantra — niyete özel"
  },
  "tea": "Önerilen bitki çayı, faydası ve nasıl hazırlanacağı",
  "oil": "Önerilen esansiyel yağ, kullanım yöntemi ve burca/niyete uyumu",
  "moonRitual": "Bugünün ay enerjisiyle uyumlu, adım adım küçük ritüel — kristali de dahil et, 2-3 cümle",
  "affirmation": "Kişinin burcuna, ruh haline ve aktif niyetine özel, güçlendirici bir olumla cümlesi"
}`;

        const userPrompt = `Ruhsal profil:
- Doğum tarihi: ${birthDate}
- Güneş burcu: ${sunSign || 'bilinmiyor'} (kimliğin, dış enerjin)
- Ay burcu: ${moonSign || 'bilinmiyor'} (iç dünyan, duygusal zemin)
- Şu anki niyet: ${intention || 'belirtilmedi'}
- Şu anki ruh hali: ${mood || 'genel denge ve netlik arayışı'}
- Bugünün tarihi: ${new Date().toISOString()}

Bu kişinin Güneş ve Ay burcundan, ruh halinden ve niyetinden yola çıkarak tam bu ana ait — başka hiç kimseye benzemeyen — bir kristal ve wellness rehberliği sun. "${suggestedCrystal}" taşının bu kişiyle neden rezonans kurduğunu, nasıl temizleneceğini ve şarj edileceğini, hangi çakrayı bedenin tam olarak hangi noktasında uyandıracağını içten ve özgün bir şekilde anlat.`;

        const raw = await askGPT(systemPrompt, userPrompt, 950, 1.0);
        const result = parseJSON(raw);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
