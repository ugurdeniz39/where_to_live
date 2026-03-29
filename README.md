# AstroMap v4 — AI Destekli Astrokartografi & Mistisizm Platformu

> Yildizlarin seni nereye cagiriyor?

AstroMap, dogum haritanizi dunya haritasina yansitan, GPT-4o-mini destekli premium bir astroloji platformudur. 558 sehir, 10 gezegen, 4 tarot acilimi, kahve fali, kristal rehberi ve daha fazlasi.

**Canli:** [wheretolive-nine.vercel.app](https://wheretolive-nine.vercel.app)

---

## Ozellikler

| Ozellik | Aciklama |
|---------|----------|
| Astrokartografi Haritasi | 558 sehir, 10 gezegen cizgisi, Leaflet harita, burc bazli tercih onerisi |
| Gunluk Burc Yorumu | Gunluk/haftalik/aylik/yillik, kisisellestirilmis, 6 kategori skoru |
| Uyum Testi | Iki kisi arasi sinastri analizi, 5 kategori skoru |
| AI Tarot | 4 acilim stili (Uc Kart, Evet/Hayir, Iliski, Kelt Haci), 78 kartlik gercek deste |
| Kristal Rehberi | Ruh haline gore kristal, cakra, meditasyon, bitki cayi onerisi |
| Kahve Fali | GPT Vision ile fincan analizi, max 3 fotograf destegi |
| Ruya Yorumu | Jungcu arketipler, bilincalti katmani, sembol analizi |
| Ay Takvimi | Aylik takvim grid, faz dongusu, ritueller |
| Retrograt Takvimi | 2025-2026 gezegen retrograt tarihleri |
| Tema Sistemi | 6 tema (3 premium), karanlik/aydinlik toggle |
| PWA | Offline destek, ana ekrana ekleme, service worker |
| Mobil Uygulama | Capacitor ile Android & iOS |
| Odeme | iyzico entegrasyonu (Premium/VIP abonelik) |

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Vanilla JS SPA, Leaflet.js, DOMPurify, html2canvas |
| Backend | Node.js 18+, Express.js |
| AI | OpenAI GPT-4o-mini (text + vision) |
| Odeme | iyzico (Turkiye) |
| Mobil | Capacitor 8.3 (Android + iOS) |
| Deploy | Vercel (serverless) |
| PWA | Service Worker v8, Web App Manifest |

---

## Kurulum

```bash
git clone https://github.com/ugurdeniz39/where_to_live.git
cd where_to_live
npm install

# .env dosyasi olustur
cp .env.example .env
# OPENAI_API_KEY ve iyzico anahtarlarini gir

npm start
# http://localhost:3000
```

### Mobil Build (Capacitor)

```bash
npm run cap:sync          # Web assets + Capacitor sync
npm run cap:android       # Android Studio ac
npm run cap:ios           # Xcode ac
npm run cap:run:android   # Android cihazda calistir
```

### Test

```bash
npm test                  # API testleri (Node.js 18+ built-in test runner)
```

---

## Ortam Degiskenleri

```env
OPENAI_API_KEY=sk-...                           # Zorunlu
IYZICO_API_KEY=sandbox-...                      # Odeme icin
IYZICO_SECRET_KEY=sandbox-...                   # Odeme icin
IYZICO_URI=https://sandbox-api.iyzipay.com      # sandbox veya production
PORT=3000                                       # Varsayilan
ALLOWED_ORIGINS=http://localhost:3000            # CORS
```

---

## Proje Yapisi

```
astromap/
├── index.html              # Ana SPA sayfasi (tum sayfa icerikleri)
├── app.js                  # Frontend controller (~4500 satir)
├── style.css               # Tasarim sistemi (~3300 satir)
├── astro-engine.js         # Gezegen hesaplama motoru (NASA/JPL orbital)
├── cities-database.js      # 558 sehir veritabani (lat/lon/climate/vibe)
├── server.js               # Express backend + tum API route'lari
├── sw.js                   # Service Worker (PWA offline)
├── manifest.json           # PWA manifest
│
├── api/                    # Vercel serverless functions
│   ├── _lib/openai.js      # GPT client, JSON parser, CORS helper
│   ├── daily-horoscope.js  # Gunluk burc yorumu
│   ├── compatibility.js    # Uyum testi
│   ├── crystal-guide.js    # Kristal rehberi
│   ├── tarot.js            # Tarot okumasi (4 acilim)
│   ├── dream.js            # Ruya yorumu
│   ├── fortune.js          # Kahve fali (vision)
│   ├── city-insight.js     # Sehir AI analizi
│   ├── health.js           # Saglik kontrolu
│   ├── extras.js           # Analytics, push, premium-status
│   └── checkout/
│       ├── init.js         # iyzico odeme baslat
│       └── callback.js     # iyzico odeme callback
│
├── icons/                  # PWA ikanlari
│   ├── icon-72x72.png ... icon-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png, favicon-32x32.png
│   └── og-image.svg
│
├── tests/
│   └── server.test.js      # API testleri (node:test)
│
├── scripts/
│   └── build-www.js        # Capacitor web build script
│
├── data/                   # Kalici veri (gitignore)
│   ├── payments.json       # Odeme kayitlari
│   ├── push-tokens.json    # Push notification tokenlari
│   └── analytics.jsonl     # Analytics event log
│
├── android/                # Capacitor Android projesi
├── ios/                    # Capacitor iOS projesi
│
├── vercel.json             # Vercel deploy config
├── capacitor.config.json   # Capacitor config
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── .env.example            # Ornek env dosyasi
└── .gitignore
```

---

## API Endpointleri

| Endpoint | Metod | Aciklama | Cache |
|----------|-------|----------|-------|
| `/api/health` | GET | Sunucu durumu | - |
| `/api/daily-horoscope` | POST | Gunluk/haftalik/aylik/yillik yorum | 1 saat |
| `/api/compatibility` | POST | Iki kisi uyum analizi | 30 dk |
| `/api/crystal-guide` | POST | Kristal & wellness | 30 dk |
| `/api/tarot` | POST | Tarot okumasi (4 acilim) | - |
| `/api/dream` | POST | Ruya yorumu | - |
| `/api/fortune` | POST | Kahve fali (vision, max 3 foto) | - |
| `/api/city-insight` | POST | Sehir AI analizi | 2 saat |
| `/api/analytics` | POST/GET | Event logging / ozet | - |
| `/api/push/register` | POST | Push token kaydi | - |
| `/api/premium-status` | POST | Abonelik durumu | - |
| `/api/checkout/init` | POST | iyzico odeme baslat | - |
| `/api/checkout/callback` | POST | iyzico callback | - |

---

## Guvenlik

- Rate limiting: 20 istek/dakika/IP
- Input validasyonu: max 2000 karakter
- XSS korumasi: DOMPurify
- CORS: whitelist bazli
- CSP: script/style/img kaynak kontrolu
- iyzico: conversationId dogrulamasi
- E-posta format validasyonu

---

## Abonelik Planlari

| Plan | Fiyat | Ozellikler |
|------|-------|------------|
| Ucretsiz | 0 TL | Gunluk limit, temel ozellikler |
| Premium | 49 TL/ay | Sinirsiz AI, premium temalar |
| VIP | 99 TL/ay | Tum ozellikler, Kelt Haci tarotu, oncelikli destek |

---

## Lisans

Bu proje ozel kullanim icindir. Tum haklari saklidir.

---

<p align="center">
  <strong>AstroMap</strong> — Antik bilgelik, modern teknoloji.<br>
  <em>Yildizlar ve cografyanin bulustugu nokta.</em>
</p>
