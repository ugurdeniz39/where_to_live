# AstroMap — Teknik Mimari

## Genel Bakis

AstroMap, Vanilla JavaScript ile yazilmis tek sayfalik bir web uygulamasidir (SPA). Backend Express.js + OpenAI API, frontend ise HTML/CSS/JS ile calisir. Capacitor ile Android/iOS native uygulamaya donusturulur.

```
Kullanici (Mobil/Web)
    |
    v
[Capacitor WebView] veya [Tarayici]
    |
    v
[index.html + app.js + style.css]  ← Frontend (istemci tarafinda calisir)
    |
    v (API istekleri)
[Vercel Serverless Functions]  ← Backend
    |
    v
[OpenAI GPT-4o-mini]  ← AI Motor
[iyzico]               ← Odeme
```

---

## Dosya Yapisi

```
astromap/
├── index.html              # Tek HTML dosyasi — tum sayfalarin icerigi
├── app.js                  # Ana uygulama kontrolcusu (~4800 satir)
├── style.css               # Tum stiller (~3400 satir)
├── astro-engine.js         # Gezegen hesaplama motoru (NASA/JPL orbitalleri)
├── cities-database.js      # 558 sehir veritabani
├── server.js               # Express.js backend (lokal calistirma)
├── sw.js                   # Service Worker (PWA offline)
├── manifest.json           # PWA manifest
│
├── api/                    # Vercel serverless functions
│   ├── _lib/openai.js      # Paylasilan: GPT client, JSON parser, CORS
│   ├── daily-horoscope.js  # POST — Gunluk/haftalik/aylik/yillik burc
│   ├── compatibility.js    # POST — Uyum testi
│   ├── crystal-guide.js    # POST — Kristal & wellness rehberi
│   ├── tarot.js            # POST — Tarot (4 acilim stili)
│   ├── dream.js            # POST — Ruya yorumu
│   ├── fortune.js          # POST — Kahve fali (GPT Vision, max 6 foto)
│   ├── city-insight.js     # POST — Sehir AI analizi
│   ├── health.js           # GET — Sunucu saglik kontrolu
│   ├── extras.js           # Analytics + Push + Premium-status
│   └── checkout/
│       ├── init.js         # iyzico odeme baslat
│       └── callback.js     # iyzico odeme dogrulama
│
├── icons/                  # PWA ikonlari (72x72 — 512x512)
├── tests/                  # API testleri (node:test)
├── scripts/                # Build aracalri
│   └── build-www.js        # Capacitor icin web build + minify
├── android/                # Capacitor Android projesi
├── ios/                    # Capacitor iOS projesi
├── data/                   # Kalici veri (gitignore)
└── docs/                   # Dokumantasyon
```

---

## Frontend Mimarisi

### SPA Yonlendirme
- Tek `index.html` dosyasinda tum sayfalar `<section class="page">` olarak yer alir
- `navigateTo(pageId)` fonksiyonu sayfa gecislerini yonetir
- Sayfa gecmisi `_pageHistory[]` arrayinde tutulur (back button icin)
- Android geri tusu: onceki sayfaya git, ana sayfadaysa uygulamadan cik

### Durum Yonetimi
- Tum durum global degiskenlerde tutulur (framework yok)
- `AuthSystem` — localStorage tabanli kullanici yonetimi
- `AICache` — API yanitlarini 1 saat onbelleğe alir (max 30 kayit)
- `UsageLimiter` — Ucretsiz kullanicilar icin gunluk API limiti

### Tema Sistemi
- 6 tema: Cosmic (varsayilan), Moonlight (acik), Aurora, Nebula, Ocean, Solar
- CSS degiskenleri ile dinamik tema degisimi
- Premium temalar giris gerektirir (native app'te tamami acik)
- Karanlik/aydinlik toggle navbar'da

### Guvenlik (Frontend)
- DOMPurify ile tum AI yanitlari XSS'e karsi temizlenir
- `sanitize()`, `safeHTML()`, `sanitizeData()` fonksiyonlari
- Hassas bilgiler localStorage'da tutulur (sifre hash'lenir)

---

## Backend Mimarisi

### Cift Calisma Modu
1. **Lokal**: `server.js` (Express.js) — tek sunucu, tum route'lar
2. **Vercel**: `api/*.js` — serverless fonksiyonlar (her endpoint ayri)

Her iki mod da ayni OpenAI istemcisini ve JSON parser'i kullanir (`api/_lib/openai.js`).

### API Istek Akisi
```
Istemci istegi
    → Rate limit kontrolu (20/dk/IP)
    → Input validasyon (max 2000 karakter)
    → Onbellek kontrolu (endpoint'e gore TTL)
    → [Cache hit] → Yanitla
    → [Cache miss] → OpenAI GPT-4o-mini istegi
    → JSON cikartma ve dogrulama
    → Onbelleğe al
    → Yanitla
```

### Onbellek Stratejisi
| Endpoint | TTL | Neden |
|----------|-----|-------|
| daily-horoscope | 1 saat | Gunluk degisir |
| compatibility | 30 dakika | Ayni girisler = ayni sonuc |
| crystal-guide | 30 dakika | Ruh haline bagli |
| city-insight | 2 saat | Sabit bilgi |
| tarot | Yok | Her cekis benzersiz |
| dream | Yok | Her ruya benzersiz |
| fortune | Yok | Her fincan benzersiz |

### Guvenlik (Backend)
- Rate limiting: 20 istek/dakika/IP
- CORS: whitelist bazli (localhost, Vercel, Capacitor)
- CSP: script/style/img kaynak kontrolu
- Input validasyon: max 2000 karakter/alan
- Admin endpointleri token korumalı
- iyzico: conversationId dogrulamasi

---

## Astroloji Motoru (astro-engine.js)

### Hesaplamalar
- **Gezegen pozisyonlari**: NASA/JPL orbital elementleri, Kepler denklemi (Newton-Raphson)
- **Ev sistemi**: Quadrant (Placidus benzeri)
- **Aspektler**: Konjunksiyon, sekstil, kare, trigon, karsilik
- **Ay fazlari**: Iluminasyon yuzdesi, faz adi, sonraki dolunay/yeni ay
- **Nutasyon & aberasyon**: IAU 1980 duzetmeleri

### Astrokartografi Skorlama
```
Ham Skor = AstroBase(90) + LifestyleBonus(max 8) - LifestylePenalty(max 14)
         + RegionBonus(max 4) + ConvergenceBonus(max 20)
         + HarmonicBonus(max 14) + ElementBonus(max 6)
         + VibeBonus(max 2) + SizeMod + Jitter(±5)

Nihai Skor = clamp(12, 98, yuvarla(Ham Skor))
```

### Cesitlilik Garantisi
- Ayni ulkeden top-10'da max 2 sehir
- 6 derece cografi minimum mesafe
- Koordinat hash jitter (dogum tarihine bagli)

---

## Mobil Uygulama (Capacitor)

### Build Sureci
```bash
npm run build:web      # www/ olustur + minify (JS/CSS/HTML)
npx cap sync android   # Web assets + plugin sync
cd android && ./gradlew assembleDebug   # Debug APK
cd android && ./gradlew bundleRelease   # Release AAB (Play Store)
```

### Native Ozellikler
- **Kamera**: Kahve fali fotograf cekimi
- **Haptics**: Buton tiklamalarinda titresim
- **Share**: Sonuc kartlarini paylasma
- **Push Notifications**: Token kaydi (Firebase olmadan)
- **Status Bar**: Karanlik tema, WebView overlay yok
- **Splash Screen**: 2 saniye, koyu arka plan

### API Baglantisi
- Native build'de `window.__ASTROMAP_CONFIG.apiBase` set edilir
- Tum API istekleri `https://wheretolive-nine.vercel.app` uzerinden gider
- CORS: `https://localhost` ve `capacitor://localhost` izinli

---

## Odeme Sistemi (iyzico)

### Akis
```
Kullanici plan secer → /api/checkout/init → iyzico form olustur
    → Kullanici odeme yapar → iyzico callback → /api/checkout/callback
    → Odeme dogrulama → Kullanici planini guncelle → Anasayfaya yonlendir
```

### Planlar
| Plan | Fiyat | Ozellikler |
|------|-------|------------|
| Ucretsiz | 0 TL | 3 AI istek/gun, 10 sehir, temel ozellikler |
| Premium | 49 TL/ay | Sinirsiz AI, 558 sehir, premium temalar |
| VIP | 99 TL/ay | Her sey + Kelt Haci + 6 foto fal + PDF |

---

## Maliyet Analizi

### OpenAI API
- Model: gpt-4o-mini ($0.15/1M input, $0.60/1M output)
- Ortalama istek: ~300 input + ~400 output token
- Maliyet/istek: **~$0.0003 (0.03 sent)**
- 1000 kullanici/gun × 3 istek = $0.90/gun = **~$27/ay**
- Cache hit %40 ile: **~$16/ay**

### Vercel
- Hobby plan: Ucretsiz (max 12 serverless function, 100GB bandwidth)
- Pro plan: $20/ay (sinirsiz function, 1TB bandwidth)

### Toplam
- Dusuk trafik: **~$16/ay** (sadece OpenAI)
- Orta trafik: **~$50/ay** (OpenAI + Vercel Pro)
- 100 Premium abone geliri: **~$165/ay** → Pozitif kar
