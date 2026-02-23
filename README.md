# ✦ AstroMap — AI Destekli Astrokartografi

> Yıldızlar seni nereye çağırıyor? 🌍✨

**AstroMap**, doğum haritanızdaki gezegen pozisyonlarını dünya haritası üzerine yansıtan, AI destekli premium bir astrokartografi uygulamasıdır. 335+ şehir veritabanı, gerçek zamanlı gezegen hesaplamaları ve OpenAI entegrasyonu ile çalışır.

---

## 🚀 Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🌍 **Astrokartografi Haritası** | 335+ şehir, 10 gezegen çizgisi, Leaflet harita |
| 🔮 **Günlük Burç Yorumu** | AI destekli kişiselleştirilmiş günlük yorumlar |
| 💕 **Uyum Testi** | İki kişi arasında astrolojik uyum analizi |
| 🌙 **Ay Takvimi** | Günlük ay fazları ve astrolojik etkileri |
| 🃏 **AI Tarot** | Yapay zeka destekli tarot kartı çekimi |
| 💎 **Kristal Rehberi** | Burcunuza özel kristal tavsiyeleri |
| 💭 **Rüya Yorumu** | AI ile rüya analizi |
| 📱 **PWA** | Offline çalışma, ana ekrana ekleme desteği |

---

## 🛠️ Teknolojiler

- **Frontend:** Vanilla JS, Leaflet.js, CSS3 (PWA)
- **Backend:** Node.js, Express
- **AI:** OpenAI GPT API
- **Ödeme:** iyzico entegrasyonu (sandbox)
- **Astroloji Motoru:** Özel ephemeris hesaplama (astro-engine.js)

---

## ⚡ Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/ugurdeniz39/where_to_live.git
cd where_to_live

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env
# OPENAI_API_KEY ve iyzico anahtarlarını gir

# Sunucuyu başlat
npm start
```

Tarayıcıda `http://localhost:3000` adresine git.

---

## 🔐 Ortam Değişkenleri

`.env` dosyasında aşağıdaki değişkenler gereklidir:

```env
OPENAI_API_KEY=sk-...
IYZICO_API_KEY=sandbox-...
IYZICO_SECRET_KEY=sandbox-...
IYZICO_URI=https://sandbox-api.iyzipay.com
```

---

## 📁 Proje Yapısı

```
├── index.html          # Ana SPA sayfası
├── style.css           # Tüm stiller
├── app.js              # Frontend SPA controller
├── astro-engine.js     # Gezegen hesaplama motoru
├── cities-database.js  # 335+ şehir veritabanı
├── server.js           # Express backend + API routes
├── sw.js               # Service Worker (PWA/offline)
├── manifest.json       # PWA manifest
├── package.json        # Node.js bağımlılıkları
└── .env                # API anahtarları (git'e dahil değil)
```

---

## 📱 Ekran Görüntüleri

*Astrokartografi haritası, günlük burç yorumu, AI tarot ve daha fazlası...*

---

## 📄 Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

---

<p align="center">
  <strong>✦ AstroMap</strong> — Antik bilgelik, modern teknoloji.<br>
  <em>Yıldızlar ve coğrafyanın buluştuğu nokta.</em>
</p>
