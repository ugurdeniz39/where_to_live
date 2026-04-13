/**
 * Zemara — Excel Maliyet & Projeksiyon Raporu Üreticisi
 * Çalıştır: node generate-excel.js
 * Fiyatlar: TR ₺150 Premium / ₺400 VIP | Intl $5.99 Premium / $12.99 VIP
 */
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// ─── Renk yardımcıları ────────────────────────────────────────────────────────
const COLORS = {
  headerDark:  '1A0533',
  headerMid:   '4A1070',
  headerLight: '7B2FBE',
  accent:      'C9A0FF',
  green:       '16A34A',
  red:         'DC2626',
  yellow:      'CA8A04',
  rowAlt:      'F3E8FF',
  white:       'FFFFFF',
  black:       '000000',
};

function cellStyle(bg, fg, bold = false, sz = 11, wrapText = false) {
  return {
    font: { bold, sz, color: { rgb: fg || COLORS.black } },
    fill: { fgColor: { rgb: bg || COLORS.white } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText },
    border: {
      top:    { style: 'thin', color: { rgb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
      left:   { style: 'thin', color: { rgb: 'D1D5DB' } },
      right:  { style: 'thin', color: { rgb: 'D1D5DB' } },
    }
  };
}

function applyStyles(ws, styleMap) {
  Object.entries(styleMap).forEach(([cell, style]) => {
    if (!ws[cell]) ws[cell] = { v: '', t: 's' };
    ws[cell].s = style;
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SHEET 1 — ÖZET DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
const dash = [
  ['ZEMARA — MALİYET & GELİR ANALİZİ', '', '', '', '', '', ''],
  ['Hazırlık tarihi: Nisan 2026 | Hedef: ₺70.000 net/ay', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['FİYATLANDIRMA', '', '', '', '', '', ''],
  ['', 'TR (₺)', '', '', 'ULUSLARARASI ($)', '', ''],
  ['', 'Aylık', 'Yıllık', 'Yıllık İndirim', 'Aylık', 'Yıllık', 'Yıllık İndirim'],
  ['Premium', 150, 1500, '%17', 5.99, 59.99, '%17'],
  ['VIP',     400, 4000, '%17', 12.99, 129.99, '%17'],
  ['Ücretsiz', 0, 0, '—', 0, 0, '—'],
  ['', '', '', '', '', '', ''],
  ['SABİT AYLIK GİDERLER', '', '', '', '', '', ''],
  ['Kalem', 'USD', 'TRY (₺38 kur)', 'Not', '', '', ''],
  ['Vercel Pro', 20, 760, 'Analitik + custom domain', '', '', ''],
  ['Supabase Pro', 25, 950, 'Auth + DB + realtime', '', '', ''],
  ['OpenAI API (300 paid user)', 25, 950, 'Ortalama $0.083/kullanıcı/ay', '', '', ''],
  ['Domain / misc', 5, 190, 'Yıllık $60 ÷ 12', '', '', ''],
  ['Apple Developer', 8.25, 314, '$99/yıl ÷ 12', '', '', ''],
  ['TOPLAM ALTYAPI', 83.25, 3164, 'Sabit gider', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['PAZARLAMA GİDERLERİ', '', '', '', '', '', ''],
  ['Dönem', 'Aylık Bütçe (₺)', '', '', '', '', ''],
  ['Ay 1–3 (büyüme fazı)', 12000, '', '', '', '', ''],
  ['Ay 4–6 (olgunlaşma)', 6000, '', '', '', '', ''],
  ['Ay 7+ (sürdürülebilir)', 3500, '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['ÖDEME KOMİSYONLARI', '', '', '', '', '', ''],
  ['Ödeme Sağlayıcı', 'Komisyon', 'Sabit Ücret', 'Kullanım', '', '', ''],
  ['iyzico (TR)',          '%3.3', '₺0.25 / işlem', 'TR kullanıcıları', '', '', ''],
  ['Lemon Squeezy (Intl)', '%5.0', '$0.50 / işlem', 'Uluslararası kullanıcılar', '', '', ''],
];

const ws1 = XLSX.utils.aoa_to_sheet(dash);
ws1['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
ws1['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
  { s: { r: 10, c: 0 }, e: { r: 10, c: 6 } },
  { s: { r: 19, c: 0 }, e: { r: 19, c: 6 } },
  { s: { r: 25, c: 0 }, e: { r: 25, c: 6 } },
];
XLSX.utils.book_append_sheet(wb, ws1, '📊 Özet Dashboard');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 2 — ₺70K HEDEF: SENARYO ANALİZİ
// ═══════════════════════════════════════════════════════════════════════
// Hesap mantığı:
// Net gelir per Premium TR = 150 × (1 - 0.035) - (150*0.05 OpenAI) = 150 × 0.965 - 7.5 = 136.75
// Net gelir per VIP TR = 400 × 0.965 - 400*0.05 = 386 - 20 = 366
// Net gelir per Premium Intl ($5.99) = $5.99*38*0.95 - $5.99*38*0.05 - $0.50*38 = ≈ ₺178.5
//   LS: 5% comm + $0.50 flat = 5.99*0.95 - 0.50 = $5.19 = ₺197  minus OpenAI ₺11.4 = ₺186
// Net gelir per VIP Intl ($12.99) = 12.99*38 = ₺493.6 - LS(5%+$0.50)= 12.99*0.95-0.50=11.84 = ₺450 - OpenAI₺24.7 = ₺425

const FIXED = 3164;
const NETU = { premTR: 137, vipTR: 366, premIntl: 186, vipIntl: 425 };

function scenario(premTR, vipTR, premIntl, vipIntl, marketing) {
  const gross = premTR * NETU.premTR + vipTR * NETU.vipTR + premIntl * NETU.premIntl + vipIntl * NETU.vipIntl;
  const net = gross - FIXED - marketing;
  const totalPaid = premTR + vipTR + premIntl + vipIntl;
  const totalGross = premTR*150 + vipTR*400 + premIntl*5.99*38 + vipIntl*12.99*38;
  return [premTR, vipTR, premIntl, vipIntl, totalPaid,
    Math.round(totalGross), Math.round(gross), FIXED, marketing,
    Math.round(net), net >= 70000 ? '✅ HEDEF' : net >= 50000 ? '🟡 YEŞİL' : '❌'];
}

const scenData = [
  ['ZEMARA — ₺70.000 NET KÂR HEDEFİ: SENARYO ANALİZİ', '', '', '', '', '', '', '', '', '', ''],
  ['Sabit gider: ₺3.164/ay | Net katkı: Premium TR ₺137 | VIP TR ₺366 | Premium Intl ₺186 | VIP Intl ₺425', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['SENARYO', 'P TR', 'VIP TR', 'P Intl', 'VIP Intl', 'Toplam Ü.', 'Brüt Gelir (₺)', 'Net Katkı (₺)', 'Altyapı (₺)', 'Pazarlama (₺)', 'NET KÂR (₺)', 'DURUM'],
  // Steady state scenarios (marketing ₺3500)
  ['── STEADY STATE (Paz. ₺3.500) ──', '', '', '', '', '', '', '', '', '', '', ''],
  ['%100 Premium TR',          500,   0,   0,   0, ...scenario(500,   0,   0,   0, 3500)],
  ['%100 VIP TR',              0,  200,   0,   0, ...scenario(  0, 200,   0,   0, 3500)],
  ['%70 Prem / %30 VIP TR',   270,  80,   0,   0, ...scenario(270,  80,   0,   0, 3500)],
  ['%50 Prem / %50 VIP TR',   170, 100,   0,   0, ...scenario(170, 100,   0,   0, 3500)],
  ['%30 Prem / %70 VIP TR',    90, 180,   0,   0, ...scenario( 90, 180,   0,   0, 3500)],
  ['Karma: %50 TR / %50 Intl', 150,  75, 130,  30, ...scenario(150,  75, 130,  30, 3500)],
  ['Ağırlıklı VIP + Intl',      80,  60, 100,  80, ...scenario( 80,  60, 100,  80, 3500)],
  ['Sadece VIP Intl',            0,   0,   0, 165, ...scenario(  0,   0,   0, 165, 3500)],
  ['Optimal Mix (öneri)',       120,  80,  80,  50, ...scenario(120,  80,  80,  50, 3500)],
  ['', '', '', '', '', '', '', '', '', '', '', ''],
  ['── BÜYÜME FAZI Ay 1-3 (Paz. ₺12.000) ──', '', '', '', '', '', '', '', '', '', '', ''],
  ['10 paid user (start)',       8,   2,   0,   0, ...scenario(  8,   2,   0,   0, 12000)],
  ['30 paid user',              20,   8,   2,   0, ...scenario( 20,   8,   2,   0, 12000)],
  ['60 paid user',              40,  15,   5,   0, ...scenario( 40,  15,   5,   0, 12000)],
  ['100 paid user',             60,  25,  10,   5, ...scenario( 60,  25,  10,   5, 12000)],
  ['', '', '', '', '', '', '', '', '', '', '', ''],
  ['── OLGUNLAŞMA Ay 4-6 (Paz. ₺6.000) ──', '', '', '', '', '', '', '', '', '', '', ''],
  ['150 paid user',             90,  35,  15,  10, ...scenario( 90,  35,  15,  10, 6000)],
  ['200 paid user',            110,  50,  25,  15, ...scenario(110,  50,  25,  15, 6000)],
  ['280 paid user',            150,  70,  40,  20, ...scenario(150,  70,  40,  20, 6000)],
  ['350 paid user',            180,  90,  55,  25, ...scenario(180,  90,  55,  25, 6000)],
  ['', '', '', '', '', '', '', '', '', '', '', ''],
  ['── HEDEF KIRILMA NOKTASİ (Paz. ₺3.500) ──', '', '', '', '', '', '', '', '', '', '', ''],
  ['Min. sadece VIP TR',         0, 202,   0,   0, ...scenario(  0, 202,   0,   0, 3500)],
  ['Min. %50/%50 mix',         200, 110,   0,   0, ...scenario(200, 110,   0,   0, 3500)],
  ['Min. Optimal Mix',         120,  80,  80,  50, ...scenario(120,  80,  80,  50, 3500)],
  ['Min. Ağırlıklı Intl',       50,  30, 100,  80, ...scenario( 50,  30, 100,  80, 3500)],
];

const ws2 = XLSX.utils.aoa_to_sheet(scenData);
ws2['!cols'] = [
  { wch: 36 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 9 }, { wch: 10 },
  { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
];
ws2['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
];
XLSX.utils.book_append_sheet(wb, ws2, '🎯 70K Hedef Senaryolar');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 3 — 18 AYLIK PROJEKSIYON
// ═══════════════════════════════════════════════════════════════════════
// Ay başına büyüme tahmini, conversion rate %2.5 hedef
function monthRow(ay, freeUsers, premTR, vipTR, premIntl, vipIntl, marketing) {
  const totalPaid = premTR + vipTR + premIntl + vipIntl;
  const grossRev = premTR*150 + vipTR*400 + premIntl*Math.round(5.99*38) + vipIntl*Math.round(12.99*38);
  const netContrib = premTR*NETU.premTR + vipTR*NETU.vipTR + premIntl*NETU.premIntl + vipIntl*NETU.vipIntl;
  const netProfit = netContrib - FIXED - marketing;
  return [ay, freeUsers, totalPaid, premTR, vipTR, premIntl, vipIntl,
    Math.round(grossRev), Math.round(netContrib), FIXED, marketing, Math.round(netProfit)];
}

let cumNet = 0;
const months = [
  [1,   300,   5,   2,   1,   0, 12000],
  [2,   700,  12,   5,   2,   1, 12000],
  [3,  1400,  25,  10,   5,   2, 12000],
  [4,  2500,  50,  20,  10,   5,  6000],
  [5,  4000,  85,  32,  18,   8,  6000],
  [6,  6000, 130,  48,  28,  12,  6000],
  [7,  8500, 175,  65,  40,  18,  3500],
  [8, 11000, 215,  80,  50,  22,  3500],
  [9, 14000, 255,  95,  62,  28,  3500],
  [10, 17000, 285, 110,  72,  32,  3500],
  [11, 20000, 310, 122,  80,  36,  3500],
  [12, 23000, 330, 130,  85,  38,  3500],
  [13, 26000, 345, 138,  90,  42,  3500],
  [14, 29000, 360, 145,  95,  45,  3500],
  [15, 32000, 370, 150, 100,  48,  3500],
  [16, 35000, 378, 155, 103,  50,  3500],
  [17, 38000, 384, 158, 106,  52,  3500],
  [18, 41000, 388, 162, 108,  54,  3500],
];

const projRows = months.map(([ay, fr, pTR, vTR, pI, vI, mkt]) => {
  const row = monthRow(ay, fr, pTR, vTR, pI, vI, mkt);
  cumNet += row[11];
  return [...row, Math.round(cumNet)];
});

const projData = [
  ['ZEMARA — 18 AYLIK GELİR & KÂR PROJEKSİYONU', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['Kur: $1 = ₺38 | Büyüme: Organik + Ücretli Pazarlama | Conversion: free→paid %2-3', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['AY', 'Ücretsiz K.', 'Toplam Paid', 'Prem TR', 'VIP TR', 'Prem Intl', 'VIP Intl',
   'Brüt Gelir (₺)', 'Net Katkı (₺)', 'Altyapı (₺)', 'Pazarlama (₺)', 'Aylık Net (₺)', 'Kümülatif (₺)'],
  ...projRows,
];

const ws3 = XLSX.utils.aoa_to_sheet(projData);
ws3['!cols'] = [
  { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 11 }, { wch: 10 },
  { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 16 },
];
ws3['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
];
XLSX.utils.book_append_sheet(wb, ws3, '📈 18 Ay Projeksiyon');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 4 — ÖDEME SAĞLAYICI & LS KOMİSYON ANALİZİ
// ═══════════════════════════════════════════════════════════════════════
function lsCalc(priceUSD) {
  const comm = priceUSD * 0.05;
  const flat = 0.50;
  const net = priceUSD - comm - flat;
  const pct = ((comm + flat) / priceUSD * 100).toFixed(1);
  return [priceUSD, comm.toFixed(2), flat, net.toFixed(2), pct + '%', Math.round(net * 38)];
}
function iyziCalc(priceTRY) {
  const comm = priceTRY * 0.033;
  const flat = 0.25;
  const net = priceTRY - comm - flat;
  const pct = ((comm + flat) / priceTRY * 100).toFixed(1);
  return [priceTRY, comm.toFixed(2), flat, net.toFixed(2), pct + '%', Math.round(net)];
}

const payData = [
  ['ZEMARA — ÖDEME KOMİSYON ANALİZİ', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['── LEMON SQUEEZY (Uluslararası) — %5 + $0.50/işlem ──', '', '', '', '', '', ''],
  ['Plan', 'Fiyat ($)', 'LS %5 ($)', 'LS Sabit ($)', 'Net Alınan ($)', 'Eff. Komisyon %', 'TRY Karşılığı'],
  ['Premium Monthly', ...lsCalc(5.99)],
  ['Premium Yearly',  ...lsCalc(59.99)],
  ['VIP Monthly',     ...lsCalc(12.99)],
  ['VIP Yearly',      ...lsCalc(129.99)],
  ['', '', '', '', '', '', ''],
  ['NOT: Yıllık ödeme alındığında flat $0.50 sadece 1 kez kesilir → yıllık çok daha karlı', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['── İYZİCO (Türkiye) — %3.3 + ₺0.25/işlem ──', '', '', '', '', '', ''],
  ['Plan', 'Fiyat (₺)', 'iyzico %3.3 (₺)', 'iyzico Sabit (₺)', 'Net Alınan (₺)', 'Eff. Komisyon %', 'TRY Net'],
  ['Premium Monthly', ...iyziCalc(150)],
  ['Premium Yearly',  ...iyziCalc(1500)],
  ['VIP Monthly',     ...iyziCalc(400)],
  ['VIP Yearly',      ...iyziCalc(4000)],
  ['', '', '', '', '', '', ''],
  ['── RAKIP KARŞILAŞTIRMA ──', '', '', '', '', '', ''],
  ['Platform', 'Komisyon', 'Sabit/İşlem', 'Min Fiyat Önerisi', 'Notlar', '', ''],
  ['iyzico',           '%3.3', '₺0.25', '₺50+', 'TR için ideal', '', ''],
  ['Lemon Squeezy',    '%5.0', '$0.50', '$7+', '$5.99 borderline, $12.99 iyi', '', ''],
  ['Stripe',           '%2.9', '$0.30', 'Her fiyat', 'TR kart desteği yok', '', ''],
  ['Paddle',           '%5.0', '$0.50', '$8+', 'LS muadili', '', ''],
  ['Apple IAP',       '%15-30', '—', 'Her fiyat', 'App Store zorunlu iOS satışta', '', ''],
  ['Google Play',     '%15-30', '—', 'Her fiyat', 'Play Store zorunlu Android satışta', '', ''],
  ['', '', '', '', '', '', ''],
  ['⚠️ UYARI: iOS App Store / Google Play üzerinden abonelik alınırsa %30 komisyon düşülür!', '', '', '', '', '', ''],
  ['Çözüm: Kullanıcıları web üzerinden (Vercel) abone olmaya yönlendir, app sadece içerik göstersin.', '', '', '', '', '', ''],
];

const ws4 = XLSX.utils.aoa_to_sheet(payData);
ws4['!cols'] = [
  { wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
];
ws4['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 26, c: 0 }, e: { r: 26, c: 6 } },
  { s: { r: 27, c: 0 }, e: { r: 27, c: 6 } },
];
XLSX.utils.book_append_sheet(wb, ws4, '💳 Ödeme Komisyonları');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 5 — OPENAI MALİYET ANALİZİ
// ═══════════════════════════════════════════════════════════════════════
const avgCostPerReq = 0.000592; // gpt-4o-mini ortalaması
const reqPerUser = 3; // günlük ortalama istek

function aiProj(paidUsers, freeUsers) {
  const totalDAU = paidUsers * 0.6 + freeUsers * 0.15; // paid 60% daily, free 15%
  const dailyReq = totalDAU * reqPerUser;
  const monthlyReq = dailyReq * 30;
  const monthlyCost = monthlyReq * avgCostPerReq;
  const perUserMonthlyCost = paidUsers > 0 ? (monthlyCost / paidUsers) : 0;
  return [
    paidUsers, freeUsers, Math.round(totalDAU), Math.round(monthlyReq),
    +monthlyCost.toFixed(2), +(monthlyCost * 38).toFixed(0), +perUserMonthlyCost.toFixed(3),
  ];
}

const aiData = [
  ['ZEMARA — OPENAİ API MALİYET PROJEKSİYONU (gpt-4o-mini)', '', '', '', '', '', ''],
  ['Input: $0.15/1M token | Output: $0.60/1M token | Ort. istek: $0.000592 | Kullanıcı/gün: 3 istek', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['ÖZELLİK MALİYETLERİ', '', '', '', '', '', ''],
  ['Özellik', 'Input Token', 'Output Token', 'Input ($)', 'Output ($)', 'Toplam/İstek ($)', 'Aylık/Kullanıcı ($)'],
  ['Günlük Yorum',           600,  500, 0.000090, 0.000300, 0.000390, +(0.000390*3*30).toFixed(3)],
  ['Haftalık Yorum',         750,  650, 0.000113, 0.000390, 0.000503, +(0.000503*1*30/4).toFixed(3)],
  ['Natal Harita Yorumu',    950,  850, 0.000143, 0.000510, 0.000653, +(0.000653*0.3*30).toFixed(3)],
  ['Transit Analizi',       1000,  900, 0.000150, 0.000540, 0.000690, +(0.000690*0.5*30).toFixed(3)],
  ['Uyum Analizi',           950,  850, 0.000143, 0.000510, 0.000653, +(0.000653*0.3*30).toFixed(3)],
  ['Tarot (3 kart)',          900,  800, 0.000135, 0.000480, 0.000615, +(0.000615*0.5*30).toFixed(3)],
  ['Rüya Yorumu',             800,  700, 0.000120, 0.000420, 0.000540, +(0.000540*0.5*30).toFixed(3)],
  ['Kristal Rehberi',         750,  650, 0.000113, 0.000390, 0.000503, +(0.000503*0.3*30).toFixed(3)],
  ['ORTALAMA (karma)',         878,  767, 0.000132, 0.000460, 0.000592, +(0.000592*3*30).toFixed(3)],
  ['', '', '', '', '', '', ''],
  ['KULLANICI BAZLI AYLIK MALİYET', '', '', '', '', '', ''],
  ['Paid Kullanıcı', 'Ücretsiz K.', 'Günlük Aktif', 'Aylık İstek', 'Aylık ($)', 'Aylık (₺)', '$/paid user'],
  ...([
    [50,   500],
    [100,  1000],
    [200,  2000],
    [300,  3000],
    [500,  5000],
    [750,  8000],
    [1000, 12000],
  ].map(([p, f]) => aiProj(p, f))),
];

const ws5 = XLSX.utils.aoa_to_sheet(aiData);
ws5['!cols'] = [
  { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 },
];
ws5['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
  { s: { r: 15, c: 0 }, e: { r: 15, c: 6 } },
];
XLSX.utils.book_append_sheet(wb, ws5, '🤖 OpenAI Maliyetleri');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 6 — BREAK-EVEN & KAR MARJI
// ═══════════════════════════════════════════════════════════════════════
function beRow(paidTotal, mixLabel, avgARPU, marketing) {
  const grossRev = paidTotal * avgARPU;
  const commCost = grossRev * 0.035;
  const aiCost = paidTotal * 3; // ~₺3/kullanıcı/ay OpenAI
  const netContrib = grossRev - commCost - aiCost;
  const totalFixed = FIXED + marketing;
  const netProfit = netContrib - totalFixed;
  const margin = grossRev > 0 ? ((netProfit / grossRev) * 100).toFixed(1) : 0;
  const roi = marketing > 0 ? ((netProfit / marketing) * 100).toFixed(0) : '∞';
  return [paidTotal, mixLabel, Math.round(avgARPU), Math.round(grossRev),
    Math.round(commCost), Math.round(aiCost), Math.round(netContrib),
    Math.round(totalFixed), Math.round(netProfit), margin + '%', roi + '%'];
}

const beData = [
  ['ZEMARA — BREAK-EVEN & KÂR MARJI ANALİZİ', '', '', '', '', '', '', '', '', '', ''],
  ['ARPU = Aylık Ortalama Gelir/Kullanıcı (mix bazlı) | Kur: ₺38=$1', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['Paid K.', 'Mix', 'ARPU (₺)', 'Brüt (₺)', 'Komisyon (₺)', 'OpenAI (₺)', 'Net Katkı (₺)', 'Sabit+Mkt (₺)', 'Net Kâr (₺)', 'Marj %', 'MKT ROI %'],
  // %100 Premium TR (ARPU=150)
  ['── %100 Premium TR (ARPU ₺150) ──', '', '', '', '', '', '', '', '', '', ''],
  ...([30, 60, 100, 150, 200, 280, 350, 450, 550].map(n => beRow(n, '%100 Prem TR', 150, n < 150 ? 12000 : n < 280 ? 6000 : 3500))),
  ['', '', '', '', '', '', '', '', '', '', ''],
  // %50/%50 mix (ARPU=275)
  ['── %50 Premium / %50 VIP TR (ARPU ₺275) ──', '', '', '', '', '', '', '', '', '', ''],
  ...([20, 40, 80, 120, 180, 240, 300].map(n => beRow(n, '50/50 Mix', 275, n < 80 ? 12000 : n < 180 ? 6000 : 3500))),
  ['', '', '', '', '', '', '', '', '', '', ''],
  // %100 VIP TR (ARPU=400)
  ['── %100 VIP TR (ARPU ₺400) ──', '', '', '', '', '', '', '', '', '', ''],
  ...([15, 30, 60, 100, 150, 200, 220].map(n => beRow(n, '%100 VIP TR', 400, n < 60 ? 12000 : n < 150 ? 6000 : 3500))),
  ['', '', '', '', '', '', '', '', '', '', ''],
  // Optimal mix intl dahil (ARPU=280 avg)
  ['── Optimal Mix (TR+Intl, ARPU ₺280 avg) ──', '', '', '', '', '', '', '', '', '', ''],
  ...([40, 80, 130, 180, 250, 300, 340].map(n => beRow(n, 'Optimal Mix', 280, n < 80 ? 12000 : n < 180 ? 6000 : 3500))),
];

const ws6 = XLSX.utils.aoa_to_sheet(beData);
ws6['!cols'] = [
  { wch: 8 }, { wch: 28 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
  { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
];
ws6['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
];
XLSX.utils.book_append_sheet(wb, ws6, '🔵 Break-Even Analizi');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 7 — MARKETİNG ROI
// ═══════════════════════════════════════════════════════════════════════
function mktRow(budget, cpm, ctr, cvr, arpu) {
  const impressions = Math.round((budget / cpm) * 1000);
  const clicks = Math.round(impressions * ctr / 100);
  const freeSignups = Math.round(clicks * cvr / 100);
  const paidConversion = 0.025; // %2.5 free→paid
  const paidUsers = Math.round(freeSignups * paidConversion);
  const revenue = paidUsers * arpu;
  const roi = ((revenue - budget) / budget * 100).toFixed(0);
  return [budget, cpm, ctr + '%', cvr + '%', impressions, clicks, freeSignups, paidUsers, Math.round(revenue), roi + '%'];
}

const mktData = [
  ['ZEMARA — MARKETİNG ROI SENARYOLARI', '', '', '', '', '', '', '', '', ''],
  ['Varsayım: %2.5 ücretsiz→ücretli dönüşüm | ARPU = ₺200 karma', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['── INSTAGRAM / TİKTOK REKLAM ──', '', '', '', '', '', '', '', '', ''],
  ['Bütçe (₺)', 'CPM (₺)', 'CTR %', 'Landing CVR %', 'İzlenme', 'Tıklama', 'Ücretsiz K.', 'Ücretli K.', 'Gelir (₺)', 'ROI %'],
  ...([3000, 6000, 10000, 15000, 20000].map(b => mktRow(b, 8, 2.5, 25, 200))),
  ['', '', '', '', '', '', '', '', '', ''],
  ['── ASO (App Store Optim) — Organik, Sıfır Maliyet ──', '', '', '', '', '', '', '', '', ''],
  ['Ay', 'Organik İndirme', 'Aktif K.', 'Dönüşüm %', 'Paid K.', 'Gelir (₺)', '', '', '', ''],
  [1,  200, 150, '2%',  4,   800, '', '', '', ''],
  [3,  800, 600, '2.5%', 15, 3000, '', '', '', ''],
  [6, 2500, 1800, '3%', 54, 10800, '', '', '', ''],
  [12, 8000, 5500, '3%', 165, 33000, '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['── İÇERİK MARKETİNG (TİKTOK/REELS ORGANİK) ──', '', '', '', '', '', '', '', '', ''],
  ['Takipçi', 'Aylık Erişim', 'Sitenize Gelen', 'Kayıt %', 'Ücretsiz K.', 'Paid K. (%2.5)', 'Gelir (₺)', '', '', ''],
  [1000,   5000,   100, '30%',  30,  1,   200, '', '', ''],
  [5000,  30000,   750, '30%', 225,  6,  1200, '', '', ''],
  [20000, 150000,  4500, '30%', 1350, 34, 6800, '', '', ''],
  [50000, 400000, 12000, '30%', 3600, 90, 18000, '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['ÖNERİLEN KANAL MİXİ (Ay 1-3)', '', '', '', '', '', '', '', '', ''],
  ['Kanal', 'Aylık Bütçe (₺)', 'Beklenen Paid K.', 'Not', '', '', '', '', '', ''],
  ['TikTok/Instagram reklam', 6000, '15-20', 'En hızlı dönüş', '', '', '', '', '', ''],
  ['ASO optimizasyonu', 0, '5-10', 'Yatırımsız', '', '', '', '', '', ''],
  ['Organik içerik üretimi', 1000, '5-8', 'Araçlar, ekipman maliyeti', '', '', '', '', '', ''],
  ['Influencer partnership', 3000, '10-15', '1-2 mikro influencer', '', '', '', '', '', ''],
  ['Google Ads (astrology)', 2000, '8-12', 'Anahtar kelime hedefleme', '', '', '', '', '', ''],
  ['TOPLAM', 12000, '43-65', 'İlk 3 ay tahmini', '', '', '', '', '', ''],
];

const ws7 = XLSX.utils.aoa_to_sheet(mktData);
ws7['!cols'] = [
  { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
];
ws7['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
];
XLSX.utils.book_append_sheet(wb, ws7, '📣 Marketing ROI');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 8 — RAKİP FİYAT KARŞILAŞTIRMA
// ═══════════════════════════════════════════════════════════════════════
const compData = [
  ['ZEMARA — RAKİP FİYAT & ÖZELLİK KARŞILAŞTIRMASI', '', '', '', '', '', ''],
  ['Kaynak: App Store / resmi websiteler | Nisan 2026', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['Uygulama', 'Aylık ($)', 'Yıllık ($)', 'Model', 'Ücretsiz Tier', 'Astroharita?', 'Platform'],
  ['CHANI',            12.00,  108, 'Hub (içerik+ses)', 'Temel chart, podcast', 'Hayır', 'iOS/Android'],
  ['The Pattern',      14.99,  120, 'Hub (içerik kütüphanesi)', 'Bazı içerikler', 'Hayır', 'iOS'],
  ['TimePassages',      7.99,   60, 'Chart tool', '1 chart', 'Hayır (web)', 'iOS/Android/Web'],
  ['Astro Future',      4.99,   30, 'Chart tool', 'Temel chart', 'Hayır', 'iOS/Android'],
  ['AstroMatrix',       —,      14.99, 'Chart tool (ad destekli)', 'Neredeyse her şey', 'Hayır', 'iOS/Android'],
  ['astro.com',         1.07,   12.90, 'Web tool', 'Tam ACG harita + 10 özellik', '✅ ÜCRETSİZ', 'Web'],
  ['Astro Gold iOS',    7.99,   40, 'Pro chart', 'Temel chart', '+$24.99 ek', 'iOS'],
  ['Co-Star',           0,       0, 'Sosyal', 'Her şey ücretsiz', 'Hayır', 'iOS/Android'],
  ['Nebula',            9.99,   50, 'Hub', 'Temel', 'Hayır', 'iOS/Android'],
  ['Kasamba',           0,       0, 'Canlı okuma', '3 dk ücretsiz', 'Hayır', 'iOS/Android/Web'],
  ['', '', '', '', '', '', ''],
  ['ZEMARA Premium (TR)', '~$3.95', '~$39.47', 'Hub + Map + AI', 'İlk 10 şehir, 3 AI/gün', '✅ DAHİL', 'iOS/Android/Web'],
  ['ZEMARA VIP (TR)', '~$10.52', '~$105.26', 'Hub + Map + AI VIP', 'İlk 10 şehir, 3 AI/gün', '✅ DAHİL + Derin', 'iOS/Android/Web'],
  ['ZEMARA Premium (Intl)', '$5.99', '$59.99', 'Hub + Map + AI', 'İlk 10 şehir, 3 AI/gün', '✅ DAHİL', 'iOS/Android/Web'],
  ['ZEMARA VIP (Intl)', '$12.99', '$129.99', 'Hub + Map + AI VIP', 'İlk 10 şehir, 3 AI/gün', '✅ DAHİL + Derin', 'iOS/Android/Web'],
  ['', '', '', '', '', '', ''],
  ['SONUÇ: Zemara, rakiplere kıyasla düşük-orta fiyatta ama çok daha geniş kapsam sunuyor.', '', '', '', '', '', ''],
  ['Intl fiyat pozisyonu: $5.99 rekabetçi (CHANI $12 / The Pattern $14.99 altında).', '', '', '', '', '', ''],
  ['TR fiyat pozisyonu: ₺150 yüksek sınır — Netflix ₺99, Spotify ₺35 baz alındığında dönüşüm riski var.', '', '', '', '', '', ''],
];

const ws8 = XLSX.utils.aoa_to_sheet(compData);
ws8['!cols'] = [
  { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 26 }, { wch: 30 }, { wch: 16 }, { wch: 20 },
];
ws8['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  { s: { r: 17, c: 0 }, e: { r: 17, c: 6 } },
  { s: { r: 18, c: 0 }, e: { r: 18, c: 6 } },
  { s: { r: 19, c: 0 }, e: { r: 19, c: 6 } },
];
XLSX.utils.book_append_sheet(wb, ws8, '🏆 Rakip Karşılaştırma');

// ═══════════════════════════════════════════════════════════════════════
// SHEET 9 — ÖZET ÇÖZÜM
// ═══════════════════════════════════════════════════════════════════════
const sumData = [
  ['ZEMARA — ₺70K HEDEF ÖZET YÖNERGE', '', '', ''],
  ['', '', '', ''],
  ['SORU', 'CEVAP', 'NOT', ''],
  ['Kaç paid user lazım (tek senaryo)?', '~200-220 (sadece VIP TR)', 'En kolay kırılma noktası', ''],
  ['Kaç paid user lazım (karma mix)?', '~315 (%50 prem / %50 VIP)', 'Daha stabil gelir', ''],
  ['Kaç paid user lazım (sadece Premium)?', '~550-580', 'Çok zor conversion maliyeti', ''],
  ['Intl dahil en az kaç user?', '~260 (karma TR+Intl)', 'Biraz daha az user lazım', ''],
  ['', '', '', ''],
  ['ZAMAN ÇİZELGESİ (₺12K/ay pazarlama)', '', '', ''],
  ['Ay 1-3', 'Kayıp faz: -₺20K - -₺30K', 'Normal, yatırım dönemi', ''],
  ['Ay 4-6', 'Düşük kâr: +₺5K - +₺20K', 'Büyüme hızlanıyor', ''],
  ['Ay 7-9', 'Orta kâr: +₺20K - +₺45K', 'Pazarlama ₺3.5K'ye indi', ''],
  ['Ay 10-12', 'Hedef kâr: +₺50K - +₺65K', 'Yaklaşıyoruz', ''],
  ['Ay 12+', '₺70K+ net kâr', '✅ HEDEF', ''],
  ['', '', '', ''],
  ['EN KRİTİK FAKTÖRLER', '', '', ''],
  ['1', 'VIP dönüşüm oranı', '%30 VIP mix ile ~220 user yeterli. Daha az user = daha az marketing', ''],
  ['2', 'iOS/Android komisyon tuzağı', 'In-app abonelik = %30 komisyon. Web üzerinden satmak şart!', ''],
  ['3', 'Intl kullanıcı kazanma', 'Avrupa + US pazarında CHANI ($12) ile yarışıyoruz $5.99 ile', ''],
  ['4', 'Churn (kayıp) oranı', 'Aylık %5-10 churn normaldir. Her ay ~10-20 yeni paid user lazım', ''],
  ['5', 'LS verification bekleme', 'Verification olmadan intl satış yok. Alternatif: Stripe Atlas', ''],
  ['', '', '', ''],
  ['RİSK DERECELENDİRME', '', '', ''],
  ['Risk', 'Olasılık', 'Etki', 'Önlem'],
  ['LS verification gecikmesi', 'Orta', 'Yüksek', 'Stripe Atlas veya alternatif araştır'],
  ['TR dönüşüm düşük (₺150 çok)', 'Yüksek', 'Yüksek', 'A/B test: ₺99 vs ₺150'],
  ['OpenAI API fiyat artışı', 'Düşük', 'Orta', 'Önbellekleme + rate limiting'],
  ['Rakip ücretsiz içerik artışı', 'Orta', 'Orta', 'VIP özelliklere odaklan'],
  ['App Store IAP zorunluluğu', 'Orta', 'Çok Yüksek', 'Web-first satış stratejisi'],
];

const ws9 = XLSX.utils.aoa_to_sheet(sumData);
ws9['!cols'] = [{ wch: 32 }, { wch: 30 }, { wch: 40 }, { wch: 12 }];
ws9['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } },
  { s: { r: 15, c: 0 }, e: { r: 15, c: 3 } },
  { s: { r: 21, c: 0 }, e: { r: 21, c: 3 } },
];
XLSX.utils.book_append_sheet(wb, ws9, '✅ Özet & Yönergeler');

// ═══════════════════════════════════════════════════════════════════════
// KAYDET
// ═══════════════════════════════════════════════════════════════════════
const outPath = path.join(__dirname, 'Zemara_Maliyet_Analizi.xlsx');
XLSX.writeFile(wb, outPath);
console.log('✅ Excel oluşturuldu:', outPath);
console.log('📊 9 sheet: Özet Dashboard | 70K Senaryolar | 18 Ay Projeksiyon |');
console.log('   Ödeme Komisyonları | OpenAI Maliyetleri | Break-Even | Marketing ROI |');
console.log('   Rakip Karşılaştırma | Özet Yönergeler');


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
