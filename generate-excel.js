/**
 * Zemara — Excel Maliyet & Projeksiyon Raporu Üreticisi
 * Çalıştır: node generate-excel.js
 */
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// ══════════════════════════════════════════
// SHEET 1: API Maliyet Analizi (Özellik Bazında)
// ══════════════════════════════════════════
const costData = [
    ['Zemara — OpenAI API Maliyet Analizi', '', '', '', '', ''],
    ['Model: gpt-4o-mini', 'Input: $0.15 / 1M token', 'Output: $0.60 / 1M token', '', '', ''],
    ['', '', '', '', '', ''],
    ['Özellik', 'Input Token', 'Output Token', 'Input Maliyet ($)', 'Output Maliyet ($)', 'Toplam / İstek ($)'],
    ['Günlük Yorum',         600,  500,  0.000090, 0.000300, 0.000390],
    ['Haftalık Yorum',       750,  650,  0.000113, 0.000390, 0.000503],
    ['Aylık Yorum',          900,  800,  0.000135, 0.000480, 0.000615],
    ['Doğum Haritası',       900,  800,  0.000135, 0.000480, 0.000615],
    ['Natal Yorum',          950,  850,  0.000143, 0.000510, 0.000653],
    ['Transit Analizi',     1000,  900,  0.000150, 0.000540, 0.000690],
    ['Uyum Analizi',         950,  850,  0.000143, 0.000510, 0.000653],
    ['Tarot (1 kart)',        700,  600,  0.000105, 0.000360, 0.000465],
    ['Tarot (3 kart)',        900,  800,  0.000135, 0.000480, 0.000615],
    ['Tarot (Celtic Cross)', 1500, 1200, 0.000225, 0.000720, 0.000945],
    ['Rüya Yorumu',           800,  700,  0.000120, 0.000420, 0.000540],
    ['Kristal Rehberi',       750,  650,  0.000113, 0.000390, 0.000503],
    ['Fal Fotoğrafı (vision)',1200, 700,  0.000180, 0.000420, 0.000600],
    ['', '', '', '', '', ''],
    ['ORTALAMA',              878,  767,  0.000132, 0.000460, 0.000592],
];

const ws1 = XLSX.utils.aoa_to_sheet(costData);
ws1['!cols'] = [
    { wch: 28 }, { wch: 14 }, { wch: 15 }, { wch: 18 }, { wch: 19 }, { wch: 22 }
];
XLSX.utils.book_append_sheet(wb, ws1, '📊 Özellik Maliyetleri');

// ══════════════════════════════════════════
// SHEET 2: Günlük Kullanıcı Projeksiyonu
// ══════════════════════════════════════════
const avgCostPerReq = 0.000592;
const reqPerUser = 3;

function proj(dau) {
    const dailyReq = dau * reqPerUser;
    const dailyCost = dailyReq * avgCostPerReq;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = monthlyCost * 12;
    return [dau, dailyReq, +dailyCost.toFixed(4), +monthlyCost.toFixed(2), +yearlyCost.toFixed(2)];
}

const projData = [
    ['Zemara — Günlük Kullanıcı Bazlı Projeksiyon', '', '', '', ''],
    ['Varsayım: Kullanıcı başına günde 3 istek, ortalama $0.000592/istek', '', '', '', ''],
    ['', '', '', '', ''],
    ['Günlük Aktif Kullanıcı', 'Günlük İstek', 'Günlük Maliyet ($)', 'Aylık Maliyet ($)', 'Yıllık Maliyet ($)'],
    ...([10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].map(proj)),
];

const ws2 = XLSX.utils.aoa_to_sheet(projData);
ws2['!cols'] = [
    { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 22 }
];
XLSX.utils.book_append_sheet(wb, ws2, '📈 Kullanıcı Projeksiyonu');

// ══════════════════════════════════════════
// SHEET 3: Altyapı Maliyetleri
// ══════════════════════════════════════════
const infraData = [
    ['Zemara — Altyapı Maliyet Tablosu', '', '', '', ''],
    ['', '', '', '', ''],
    ['Servis', 'Ücretsiz Limit', 'Ücretli Plan', 'Aylık Maliyet ($)', 'Ne Zaman Gerekir?'],
    ['Vercel (Hosting)', 'Hobby sınırsız', 'Pro $20/ay', '$0 → $20', '100K+ req/ay veya custom domain gerekince'],
    ['Neon PostgreSQL', '0.5 GB, 1 proje', 'Launch $19/ay', '$0 → $19', '0.5 GB dolarsa veya daha fazla bağlantı lazımsa'],
    ['OpenAI API', 'Yok (prepaid)', 'Pay-as-you-go', 'Kullanıma göre', 'Her zaman ücretli'],
    ['Domain (.com)', '—', '$12/yıl', '$1/ay', 'Yayın başlangıcında'],
    ['Google Play', '—', '$25 tek seferlik', '$0 (sonrası)', 'Uygulama yüklemede bir kez'],
    ['App Store (Apple)', '—', '$99/yıl', '$8.25/ay', 'iOS yayını için'],
    ['Firebase (Push)', '10K mesaj/gün', 'Spark ücretsiz', '$0', 'Büyük ölçeğe kadar ücretsiz'],
    ['', '', '', '', ''],
    ['TOPLAM (küçük ölçek)', '', '', '$1 - $20 / ay', 'İlk 1-2 ay'],
    ['TOPLAM (orta ölçek)', '', '', '$40 - $80 / ay', '1K-10K kullanıcı'],
    ['TOPLAM (büyük ölçek)', '', '', '$200+ / ay', '100K+ kullanıcı'],
];

const ws3 = XLSX.utils.aoa_to_sheet(infraData);
ws3['!cols'] = [
    { wch: 26 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 42 }
];
XLSX.utils.book_append_sheet(wb, ws3, '🏗️ Altyapı Maliyetleri');

// ══════════════════════════════════════════
// SHEET 4: 6 Aylık İş Planı
// ══════════════════════════════════════════
const businessData = [
    ['Zemara — 6 Aylık Kümülatif İş Planı', '', '', '', '', '', '', ''],
    ['Fiyatlar: Ücretsiz ₺0 | Premium ₺49/ay | VIP ₺99/ay', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Ay', 'Ücretsiz Kullanıcı', 'Premium (₺49)', 'VIP (₺99)', 'Aylık Gelir (₺)', 'Aylık Maliyet (₺)', 'Aylık Kâr (₺)', 'Kümülatif Net (₺)'],
    [1,  200,    5,    2,   443,    800,   -357,   -357],
    [2,  600,   20,    5,  1475,   1200,    275,    -82],
    [3, 1500,   60,   15,  4425,   2500,   1925,   1843],
    [4, 4000,  150,   40, 11310,   5000,   6310,   8153],
    [5,10000,  400,  100, 29500,  12000,  17500,  25653],
    [6,25000, 1000,  250, 74250,  28000,  46250,  71903],
    ['', '', '', '', '', '', '', ''],
    ['NOT:', 'Maliyet = OpenAI API + Vercel + Neon + domain', '', '', '', '', '', ''],
    ['NOT:', 'Dolar/TL kuru ₺33 baz alınmıştır', '', '', '', '', '', ''],
    ['NOT:', 'Kullanıcı büyümesi organik (TikTok/ASO) varsayılmıştır', '', '', '', '', '', ''],
];

const ws4 = XLSX.utils.aoa_to_sheet(businessData);
ws4['!cols'] = [
    { wch: 6 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 18 }, { wch: 22 }
];
XLSX.utils.book_append_sheet(wb, ws4, '💰 6 Aylık İş Planı');

// ══════════════════════════════════════════
// SHEET 5: Tier Yapısı
// ══════════════════════════════════════════
const tierData = [
    ['Zemara — Premium vs VIP Özellik Karşılaştırması', '', '', ''],
    ['', '', '', ''],
    ['Özellik', 'Ücretsiz (₺0)', 'Premium (₺49/ay)', 'VIP (₺99/ay)'],
    ['Günlük Burç Yorumu',      '✓ (kısa)',   '✓ (detaylı)',  '✓ (detaylı)'],
    ['Haftalık Yorum',          '✗',          '✓',            '✓'],
    ['Aylık Yorum',             '✗',          '✓',            '✓'],
    ['Doğum Haritası',          '✗',          '✓',            '✓'],
    ['Natal Yorum',             '✗',          '✓',            '✓'],
    ['Tek Kart Tarot',          '✓',          '✓',            '✓'],
    ['3 Kart Tarot',            '✗',          '✓',            '✓'],
    ['Celtic Cross (10 kart)',  '✗',          '✗',            '✓'],
    ['Rüya Yorumu',             '✗',          '2/gün',        'Sınırsız'],
    ['Kristal Rehberi',         '✗',          '✓',            '✓'],
    ['Transit Analizi',         '✗',          '✗',            '✓'],
    ['Uyum Analizi',            '✗',          '✗',            '✓'],
    ['Fal Fotoğrafı',           '✗',          '✗',            '✓'],
    ['Ay Takvimi',              '✓',          '✓',            '✓'],
    ['AI İstek Limiti',         '3/gün',      '20/gün',       'Sınırsız'],
    ['Bildirimler',             '✗',          '✓',            '✓'],
    ['VIP Rozeti',              '✗',          '✗',            '✓'],
    ['Yeni Özellik Erken Erişim','✗',         '✗',            '✓'],
    ['', '', '', ''],
    ['Yıllık Plan',             '—',          '₺490 (%17 indirim)', '₺990 (%17 indirim)'],
];

const ws5 = XLSX.utils.aoa_to_sheet(tierData);
ws5['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 24 }, { wch: 24 }
];
XLSX.utils.book_append_sheet(wb, ws5, '⭐ Tier Yapısı');

// ══════════════════════════════════════════
// SHEET 6: Test Promptları
// ══════════════════════════════════════════
const testData = [
    ['Zemara — Her Özellik İçin Test Promptları', '', '', ''],
    ['Test Kullanıcısı: Ayşe Kaya | Doğum: 15.05.1990 | Şehir: İstanbul | Saat: 09:30', '', '', ''],
    ['', '', '', ''],
    ['Özellik', 'Test Girdisi', 'Beklenen Çıktı', 'Tier'],
    ['Günlük Yorum',      'Ad: Ayşe, Doğum: 15.05.1990',                                                     'Boğa burcuna özel günlük enerji yorumu, tavsiyeler',     'Ücretsiz'],
    ['Doğum Haritası',   'Tarih: 15.05.1990, Saat: 09:30, Şehir: İstanbul',                                 'Ascendant, 12 ev, gezegen pozisyonları',                 'Premium'],
    ['Natal Yorum',      'Tarih: 15.05.1990, Saat: 09:30, Şehir: İstanbul',                                 'Güneş Boğa, Ay Yengeç karakteri analizi',                'Premium'],
    ['Transit Analizi',  'Doğum: 15.05.1990, Bugün: 01.04.2026, Burç: Boğa',                                'Jüpiter/Satürn transit etkileri, 3 aylık öneri',         'VIP'],
    ['Uyum Analizi',     'Kişi 1: 15.05.1990 (Boğa) / Kişi 2: 22.08.1988 (Aslan)',                         'Duygusal/fiziksel/zihinsel uyum skoru, tavsiyeler',      'VIP'],
    ['Tarot (1 kart)',   '1 kart çek (serbest)',                                                              'Kart adı, yön, anlam, günlük mesaj',                     'Ücretsiz'],
    ['Tarot (Celtic Cross)', '10 kart açılımı',                                                              '10 pozisyon bazlı yorum + genel mesaj',                  'VIP'],
    ['Rüya Yorumu',      '"Denizin üzerinde uçuyordum, altımda dalgalar vardı, güneş batıyordu"',            'Jung arketip analizi, bilinçaltı mesajı',                'Premium'],
    ['Kristal Rehberi',  '"Kaygı ve odak sorunu yaşıyorum, uyku kalitem çok bozuk"',                        'Ametist, Labradorit, Siyah Turmalin önerileri + kullanım', 'Premium'],
    ['Fal Fotoğrafı',    'El fotoğrafı yükle: JPEG, iyi ışık, avuç içi açık, net',                         'Baş/kalp/akıl çizgileri, tepe yorumu',                   'VIP'],
    ['Ay Takvimi',       'Ay: Nisan 2026',                                                                    'Dolunay 13 Nisan, Yeni Ay 27 Nisan, ritüel önerileri',   'Ücretsiz'],
];

const ws6 = XLSX.utils.aoa_to_sheet(testData);
ws6['!cols'] = [
    { wch: 24 }, { wch: 60 }, { wch: 52 }, { wch: 12 }
];
XLSX.utils.book_append_sheet(wb, ws6, '🧪 Test Promptları');

// ══════════════════════════════════════════
// KAYDET
// ══════════════════════════════════════════
const outPath = path.join(__dirname, 'Zemara_Maliyet_Analizi.xlsx');
XLSX.writeFile(wb, outPath);
console.log('✅ Excel oluşturuldu:', outPath);
