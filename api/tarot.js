const { askGPT, parseJSON, corsHeaders, validateTextLength } = require('./_lib/openai');

const SPREADS = {
    'three-card': {
        count: 3,
        positions: ['Geçmiş', 'Şimdi', 'Gelecek'],
        desc: 'Geçmiş-Şimdi-Gelecek üç kart açılımı',
        tokens: 1000
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
        desc: 'İlişki açılımı',
        tokens: 1100
    },
    'celtic-cross': {
        count: 10,
        positions: [
            'Mevcut Durum',
            'Engel',
            'Bilinçaltı',
            'Geçmiş',
            'Olası Gelecek',
            'Yakın Gelecek',
            'Tutum',
            'Çevre',
            'Umut & Korku',
            'Sonuç'
        ],
        desc: 'Kelt Haçı 10 kart açılımı',
        tokens: 1800
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
        const { birthDate, sunSign, question, spread } = req.body || {};
        const langCode = req.body?.lang === 'en' ? 'en' : 'tr';
        if (question) validateTextLength(question, 1000);

        const spreadConfig = SPREADS[spread] || SPREADS['three-card'];
        const langInstruction = langCode === 'en' ? 'Write ALL your response in ENGLISH.' : 'Türkçe yaz.';

        const userElement = signElements[sunSign] || null;
        const boostedSuit = userElement ? elementSuit[userElement] : null;

        let deck = [...majorArcana, ...minorArcana];
        if (boostedSuit) {
            const boosted = minorArcana.filter(card => card.includes(boostedSuit));
            deck = [...deck, ...boosted];
        }

        const picked = shuffle(deck).slice(0, spreadConfig.count);
        const reversals = picked.map(() => Math.random() < 0.3);

        const cardsTemplate = spreadConfig.positions.map((position, i) => (
            `{ "position": "${position}", "name": "Kart adı", "emoji": "uygun emoji", "meaning": "Bu kartın ${position} pozisyonundaki anlamı, 3-4 cümle", "reversed": ${reversals[i]}, "keywords": ["anahtar1", "anahtar2"] }`
        )).join(',\n    ');

        const pickedList = picked.map((card, i) => (
            `${i + 1}. ${spreadConfig.positions[i]}: ${card}${reversals[i] ? ' (TERS)' : ''}`
        )).join('\n');

        const systemPrompt = `Sen deneyimli, empatik ve sezgisel bir tarot danışmanısın. ${langInstruction}
Yorumların kişiye özel, somut ve derin olsun.
Bu okuma ${spreadConfig.desc} formatında yapılacak.
${question ? 'Kullanıcının sorusunu merkeze al ve her kartı soruyla ilişkilendir.' : 'Kullanıcının genel hayat akışına odaklan.'}

KURALLAR:
- Sana verilen kartları ve pozisyonları aynen kullan.
- Ters kartları mutlaka farklı yorumla.
- Yüzeysel/genel cümlelerden kaçın, kişisel bağlam kur.
${spread === 'yes-no' ? '- Evet/Hayır açılımında net ve kısa cevap ver (EVET/HAYIR/BEKLE).' : ''}
${spread === 'relationship' ? '- İlişki açılımında 1. kart "Sen", 2. kart "O", 3. kart "Aranızdaki Enerji" olarak yorumlanmalı.' : ''}

Yanıtını SADECE şu JSON formatında ver:
{
  "cards": [
    ${cardsTemplate}
  ],
  "overall": "Kartların ortak mesajı, 4-5 cümle",
  "advice": "Uygulanabilir tavsiye, 2-3 cümle",
  "energy": "Baskın enerji, kısa ifade"${spread === 'yes-no' ? ',\n  "answer": "EVET veya HAYIR veya BEKLE"' : ''}
}`;

        const userPrompt = `Kişi: Doğum ${birthDate || 'bilinmiyor'}, Güneş burcu: ${sunSign || 'bilinmiyor'}.
${question ? `Sorusu: "${question}"` : 'Genel bir okuma isteniyor.'}
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
                reversed: typeof card.reversed === 'boolean' ? card.reversed : reversals[index]
            };
        });

        const result = {
            ...parsed,
            cards,
            energy: parsed.energy || (langCode === 'en' ? 'Focused' : 'Odaklı'),
            overall: parsed.overall || '',
            advice: parsed.advice || ''
        };

        if (spread === 'yes-no' && !result.answer) {
            result.answer = fallbackYesNoAnswer(cards[0]);
        }

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
