# Zemara — Guvenlik Dokumantasyonu

## Ozet

Zemara, kullanici verilerini korumak icin katmanli bir guvenlik yaklasimi kullanir. Bu dokuman mevcut guvenlik onlemlerini, bilinen riskleri ve onerileri kapsar.

---

## Mevcut Guvenlik Onlemleri

### 1. Giris Dogrulamasi (Input Validation)

**Sunucu tarafi (server.js):**
- Tum POST isteklerinde alan uzunlugu kontrolu: max 2000 karakter
- Ic ice nesnelerde de (person1, person2, billing) ayni kontrol
- Kahve fali gorsel boyutu: max 4MB (base64)
- E-posta format dogrulamasi: regex kontrolu (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)

**Istemci tarafi (app.js):**
- DOMPurify ile tum AI yanitlari temizlenir (XSS koruması)
- Izin verilen HTML etiketleri: b, i, em, strong, br, p, span, div, ul, ol, li, h1-h4, small, a
- Izin verilen ozellikler: style, class, href
- `sanitizeData()` fonksiyonu tum string alanlari yinelemeli olarak temizler

### 2. Hiz Sinirlandirma (Rate Limiting)

- **Sinir**: 20 AI istegi / dakika / IP adresi
- **Pencere**: 60 saniye (bellek icinde Map ile takip)
- **Temizlik**: Her 5 dakikada eski kayitlar silinir
- **Baslik**: `X-RateLimit-Remaining` her yanita eklenir
- **Yanit**: 429 Too Many Requests (limit asildiginda)

### 3. CORS Politikasi

```
Izinli kaynaklar:
- ALLOWED_ORIGINS ortam degiskeni (varsayilan: localhost:3000, localhost:5173)
- https://localhost (Capacitor Android)
- capacitor://localhost (Capacitor iOS)
- http://localhost (gelistirme)
- *.vercel.app (Vercel on izleme deploy'lari)

Izinli yontemler: GET, POST, OPTIONS
Izinli basliklar: Content-Type
```

### 4. Guvenlik Basliklari

| Baslik | Deger | Amac |
|--------|-------|------|
| X-Content-Type-Options | nosniff | MIME sniffing engelleme |
| X-Frame-Options | SAMEORIGIN | Clickjacking engelleme |
| X-XSS-Protection | 1; mode=block | Tarayici XSS filtresi |
| Referrer-Policy | strict-origin-when-cross-origin | Referrer bilgi sizintisi |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Cihaz erisim kontrolu |
| Content-Security-Policy | (asagida detay) | Kaynak kontrolu |

### 5. Content Security Policy (CSP)

```
default-src 'self'
script-src 'self' 'unsafe-inline' unpkg.com cdn.jsdelivr.net
style-src 'self' 'unsafe-inline' fonts.googleapis.com unpkg.com
font-src 'self' fonts.gstatic.com
img-src 'self' data: blob: *.basemaps.cartocdn.com *.tile.openstreetmap.org
connect-src 'self'
frame-src 'self' *.iyzipay.com
base-uri 'self'
form-action 'self' *.iyzipay.com
```

### 6. Odeme Guvenligi (iyzico)

- API anahtarlari ortam degiskenlerinde (asla kodda degil)
- Sandbox/production modu ortam degiskeniyle kontrol edilir
- Checkout form iyzico'nun kendi iframe'i uzerinden sunulur
- Callback'te `conversationId` dogrulamasi
- Checkout session'lari token bazli saklanir ve kullanim sonrasi silinir
- Odeme verileri `data/payments.json`'a kaydedilir (gitignore'da)

### 7. Kimlik Dogrulama

- Kullanici sifreleri SHA-256 ile hash'lenir (Web Crypto API)
- Oturum bilgileri localStorage'da saklanir
- Premium durum kontrolu sunucu tarafinda yapilir
- Admin endpointleri token ile korunur (`ADMIN_TOKEN` ortam degiskeni)

### 8. Veri Korumasi

- `.env` dosyasi gitignore'da (API anahtarlari git'e girmez)
- `data/` klasoru gitignore'da (odeme ve kullanici verileri git'e girmez)
- `*.keystore` ve `*.jks` gitignore'da (imzalama anahtarlari git'e girmez)
- Repo private (GitHub'da)

---

## Bilinen Riskler ve Azaltmalar

### Dusuk Risk

| Risk | Durum | Azaltma |
|------|-------|---------|
| XSS (AI yanitlari) | Azaltilmis | DOMPurify tum yanitlari temizler |
| CSRF | Dusuk | API sadece JSON kabul eder, cookie kullanmaz |
| SQL Injection | Yok | Veritabani yok (JSON dosya depolama) |
| Brute force | Azaltilmis | Rate limiting 20/dk/IP |

### Orta Risk

| Risk | Durum | Azaltma |
|------|-------|---------|
| CSP unsafe-inline | Mevcut | Script ve style icin gerekli (SPA yapisi) |
| localStorage auth | Mevcut | Hassas veriler icin yeterli, bankaclik degil |
| In-memory rate limit | Mevcut | Sunucu yeniden baslatildiginda sifirlanir |
| JSON dosya depolama | Mevcut | Production'da veritabani onerilir |

### Dikkat Edilmesi Gerekenler

1. **ADMIN_TOKEN**: Varsayilan deger kodda var (`zemara-admin-2024`). Production'da mutlaka degistirilmeli.
2. **iyzico sandbox**: Varsayilan olarak sandbox modunda. Production'da gercek anahtarlar kullanilmali.
3. **HTTPS**: Vercel otomatik HTTPS saglar. Lokal gelistirmede HTTP kullanilir.
4. **OpenAI API anahtari**: Sunucu tarafinda tutuluyor, istemciye asla gonderilmiyor.

---

## Guvenlik Kontrol Listesi (Deployment Oncesi)

- [ ] GitHub reposu private yapildi mi?
- [ ] `.env` dosyasinda gercek API anahtarlari var mi?
- [ ] `ADMIN_TOKEN` varsayilan degerden degistirildi mi?
- [ ] iyzico production anahtarlari set edildi mi?
- [ ] `ALLOWED_ORIGINS` production domain'i iceriyor mu?
- [ ] Rate limit degerleri uygun mu? (20/dk yeterli mi?)
- [ ] Keystore dosyasi guvenli bir yerde yedeklendi mi?
- [ ] CSP politikasi gozden gecirildi mi?

---

## Gelecek Guvenlik Iyilestirmeleri

1. **JWT token bazli kimlik dogrulama** — localStorage yerine httpOnly cookie
2. **Rate limiting Redis ile** — dagitik ve kalici
3. **CSP nonce** — unsafe-inline yerine script/style nonce'lari
4. **OWASP dependency check** — bagimlilik guvenlik taramasi
5. **API key rotation** — duzeli anahtar yenileme sureci
6. **WAF** — Vercel veya Cloudflare web uygulama guvenlk duvari
7. **Audit log** — Tum admin islemleri icin kayit tutma
