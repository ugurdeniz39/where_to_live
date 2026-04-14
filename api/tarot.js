const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

const SPREADS = {
    'three-card': {
        count: 3,
        positions: ['Geçmiş', 'Şimdi', 'Gelecek'],
        desc: 'Geçmiş-Şimdi-Gelecek üç kart açılımı',
        tokens: 1100
    },
    'yes-no': {
        count: 1,
        positions: ['Cevap'],
        desc: 'Tek kart Evet/Hayır açılımı',
        tokens: 700
    },
    'relationship': {
        count: 3,
        positions: ['Sen', 'O', 'Aranızdaki Enerji'],
        desc: 'İlişki dinamiği üç kart açılımı',
        tokens: 1200
    },
    'celtic-cross': {
        count: 10,
        positions: [
            'Mevcut Durum',
            'Engel/Çarpan Güç',
            'Bilinçaltı Temeli',
            'Geçmiş',
            'Olası Gelecek',
            'Yakın Gelecek',
            'Tutum ve Yaklaşım',
            'Dış Çevre ve Başkaları',
            'Umut ve Gizli Korku',
            'Nihai Sonuç'
        ],
        desc: 'Kelt Haçı 10 kart derinlemesine açılımı',
        tokens: 2000
    }
};

const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant',
    'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man',
    'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
];
const suits = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const minorArcana = suits.flatMap(suit => ranks.map(rank => `${rank} of ${suit}`));

const signElements = {
    'Koç': 'fire', 'Aslan': 'fire', 'Yay': 'fire',
    'Boğa': 'earth', 'Başak': 'earth', 'Oğlak': 'earth',
    'İkizler': 'air', 'Terazi': 'air', 'Kova': 'air',
    'Yengeç': 'water', 'Akrep': 'water', 'Balık': 'water'
};
const elementSuit = { fire: 'Wands', water: 'Cups', air: 'Swords', earth: 'Pentacles' };

// Moon phase affects which cards get boosted (dark moon → shadow cards, full moon → revelation cards)
const shadowCards = ['The Moon', 'The Devil', 'The Hanged Man', 'Eight of Swords', 'Nine of Swords'];
const revelationCards = ['The Star', 'The Sun', 'The World', 'Judgement', 'Ace of Cups'];

function getMoonPhase() {
    // Approximate moon phase (0=new, 0.5=full) based on known new moon anchor
    const anchor = new Date('2024-01-11').getTime();
    const synodicMonth = 29.53058867 * 24 * 3600 * 1000;
    const phase = ((Date.now() - anchor) % synodicMonth) / synodicMonth;
    if (phase < 0.05 || phase > 0.95) return 'yeni_ay';
    if (phase < 0.25) return 'hilal';
    if (phase < 0.45) return 'dolunaya_yakin';
    if (phase < 0.55) return 'dolunay';
    if (phase < 0.75) return 'azalan';
    return 'son_dordun';
}

const moonPhaseLabel = {
    'yeni_ay': 'Yeni Ay (başlangıç, niyet kurma)',
    'hilal': 'Artan Hilal (büyüme, harekete geçme)',
    'dolunaya_yakin': 'Dolan Ay (netleşme, doruk öncesi)',
    'dolunay': 'Dolunay (aydınlanma, tamamlanma)',
    'azalan': 'Azalan Ay (bırakma, içe çekilme)',
    'son_dordun': 'Son Dördün (temizlenme, dönüşüm)'
};

function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function normalizePosition(value) {
    return (value || '')
        .toString()
        .toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ı/g, 'i')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function fallbackYesNoAnswer(card) {
    if (card?.reversed) return 'HAYIR';
    return 'EVET';
}

module.exports = async (req, res) => {
    corsHeaders(res, req);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { birthDate, sunSign, moonSign, risingSign, question, spread } = req.body || {};
        const langCode = req.body?.lang === 'en' ? 'en' : 'tr';
        if (question) validateTextLength(question, 1000);

        const spreadConfig = SPREADS[spread] || SPREADS['three-card'];
        const langInstruction = langCode === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        const userElement = signElements[sunSign] || null;
        const boostedSuit = userElement ? elementSuit[userElement] : null;

        // Moon phase context
        const moonPhase = getMoonPhase();
        const moonPhaseDesc = moonPhaseLabel[moonPhase] || 'Dolunay';

        // Boost element-aligned suit + moon-phase-aligned cards
        let deck = [...majorArcana, ...minorArcana];
        if (boostedSuit) {
            const boosted = minorArcana.filter(card => card.includes(boostedSuit));
            deck = [...deck, ...boosted, ...boosted]; // double boost for stronger resonance
        }
        if (moonPhase === 'yeni_ay' || moonPhase === 'son_dordun') {
            deck = [...deck, ...shadowCards];
        } else if (moonPhase === 'dolunay') {
            deck = [...deck, ...revelationCards];
        }

        const picked = shuffle(deck).slice(0, spreadConfig.count);
        const reversals = picked.map(() => Math.random() < 0.28); // ~28% reversal rate

        const cardsTemplate = spreadConfig.positions.map((position, i) => (
            `{ "position": "${position}", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın ${position} pozisyonundaki anlamı — kişinin burç enerjisiyle ve soruyla bağlantı kur, 3-4 cümle. Ters kartsa gölge veya gecikme enerjisini yansıt.", "shadow": "${reversals[i] ? 'Bu kartın gölge yüzü veya içe yönelik dersi, 1 cümle' : ''}", "reversed": ${reversals[i]}, "keywords": ["anahtar1", "anahtar2", "anahtar3"] }`
        )).join(',\n    ');

        const pickedList = picked.map((card, i) => (
            `${i + 1}. ${spreadConfig.positions[i]}: ${card}${reversals[i] ? ' (TERS — gölge/iç engel)' : ''}`
        )).join('\n');

        // Build natal context line
        const natalParts = [];
        if (sunSign) natalParts.push(`Güneş: ${sunSign}`);
        if (moonSign && moonSign !== 'bilinmiyor') natalParts.push(`Ay: ${moonSign}`);
        if (risingSign && risingSign !== 'bilinmiyor') natalParts.push(`Yükselen: ${risingSign}`);
        const natalContext = natalParts.length > 0
            ? `Doğum haritası — ${natalParts.join(', ')}. Bu yerleşimler kartların yorumuna sinmeli.`
            : '';

        const systemPrompt = `Sen arketip ve ruh yolculuğu odaklı, empatik ve derin sezgilere sahip bir tarot üstadısın. ${langInstruction}
${natalContext}
Ay evresi: ${moonPhaseDesc} — bu evrenin enerjisini kartların genel mesajına dokuyabilirsin.
Açılım: ${spreadConfig.desc}
${question ? 'Kullanıcının sorusunu her kartın yorumunun merkezine koy.' : 'Kullanıcının ruh haline ve genel akışına odaklan.'}

KURALLAR:
- Verilen kartları ve pozisyonları aynen kullan, değiştirme.
- TERS kartlar için mutlaka gölge, engel veya iç direniş boyutunu yorumla.
- Yüzeysel "Bu kart değişimi temsil eder" gibi klişelerden kaçın; kişinin olası gerçek yaşam durumuna bağlan.
- Arketipsel dil kullan: kahraman yolculuğu, gölge entegrasyonu, iç ses.
- Kelt Haçı açılımında bilinçaltı (3. kart) ve gizli korku (9. kart) derinlemesine işlenmeli.
${spread === 'yes-no' ? '- Evet/Hayır açılımında NET bir cevap ver: EVET / HAYIR / BEKLE. Yanı sıra kısa gerekçe ekle.' : ''}
${spread === 'relationship' ? '- 1. kart "Sen"in iç dünyası, 2. kart "O"nun enerjisi, 3. kart ikiniz arasındaki görünmez dinamik.' : ''}

Yanıtını SADECE şu JSON formatında ver:
{
  "cards": [
    ${cardsTemplate}
  ],
  "overall": "Kartların birlikte söylediği derin mesaj — ay evresi ve burç enerjisini harmana kat, 4-5 cümle",
  "advice": "Somut, bugün veya bu hafta uygulanabilir tavsiye, 2-3 cümle",
  "shadow": "Bu okumanın gösterdiği bilinçdışı tema veya gölge yön — dürüstçe ama şefkatle, 1-2 cümle",
  "energy": "Bu anın baskın arketipsel enerjisi (tek kısa ifade, örn: 'Dönüşümcü Anka' veya 'Sezgisel Kahin')"${spread === 'yes-no' ? ',\n  "answer": "EVET veya HAYIR veya BEKLE",\n  "answerReason": "Neden bu cevap, 1 cümle"' : ''}
}`;

        const userPrompt = `Doğum: ${birthDate || 'bilinmiyor'} | Burç: ${sunSign || 'bilinmiyor'}${moonSign && moonSign !== 'bilinmiyor' ? ` | Ay: ${moonSign}` : ''}${risingSign && risingSign !== 'bilinmiyor' ? ` | Yükselen: ${risingSign}` : ''}
${question ? `Soru: "${question}"` : 'Genel ruh yolculuğu okuması.'}
Açılım: ${spreadConfig.desc}
Çekilen kartlar:
${pickedList}`;

        const raw = await askGPT(systemPrompt, userPrompt, spreadConfig.tokens);
        const parsed = parseJSON(raw) || {};
        const incomingCards = Array.isArray(parsed.cards) ? parsed.cards : [];
        const incomingByPos = new Map(incomingCards.map(card => [normalizePosition(card?.position), card]));

        const cards = spreadConfig.positions.map((position, index) => {
            const normalized = normalizePosition(position);
            const card = incomingByPos.get(normalized) || incomingCards[index] || {};
            return {
                ...card,
                position,
                name: card.name || picked[index],
                emoji: card.emoji || '🃏',
                meaning: card.meaning || '',
                shadow: card.shadow || '',
                keywords: Array.isArray(card.keywords) ? card.keywords : [],
                reversed: typeof card.reversed === 'boolean' ? card.reversed : reversals[index]
            };
        });

        const result = {
            ...parsed,
            cards,
            energy: parsed.energy || (langCode === 'en' ? 'Transformative' : 'Dönüşümcü'),
            overall: parsed.overall || '',
            advice: parsed.advice || '',
            shadow: parsed.shadow || '',
            moonPhase: moonPhaseDesc
        };

        if (spread === 'yes-no' && !result.answer) {
            result.answer = fallbackYesNoAnswer(cards[0]);
        }

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
