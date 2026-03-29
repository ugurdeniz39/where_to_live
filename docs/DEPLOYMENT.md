# AstroMap — Deployment Rehberi

## Ortam Degiskenleri

`.env` dosyasinda asagidaki degiskenler gereklidir:

```env
# Zorunlu
OPENAI_API_KEY=sk-...                              # OpenAI API anahtari

# Odeme (production icin zorunlu)
IYZICO_API_KEY=sandbox-...                          # iyzico API anahtari
IYZICO_SECRET_KEY=sandbox-...                       # iyzico gizli anahtar
IYZICO_URI=https://sandbox-api.iyzipay.com          # sandbox veya production

# Sunucu
PORT=3000                                           # Varsayilan port
ALLOWED_ORIGINS=http://localhost:3000                # CORS izinli kaynaklar
NODE_ENV=production                                 # Ortam (production/development)

# Guvenlik
ADMIN_TOKEN=guclu-rastgele-token-buraya             # Admin endpoint erisim tokeni
```

---

## Vercel Deploy

### Ilk Kurulum
```bash
npm install -g vercel
vercel login
vercel link     # Mevcut projeye bagla
```

### Deploy
```bash
vercel --prod   # Production deploy
```

### Ortam Degiskenleri (Vercel Dashboard)
Settings > Environment Variables'da tum degiskenleri ekleyin.

### Limitler (Hobby Plan)
- Max 12 serverless function (su an 11 kullaniliyor)
- 100GB bandwidth / ay
- 100 saat function calistirma / ay

---

## Android Build

### Gereksinimler
- Node.js 18+
- JDK 21 (Microsoft OpenJDK onerilir)
- Android SDK (platform-tools, build-tools 36, platforms;android-36)

### Debug APK (Test)
```bash
npm run build:web                    # Web assets olustur + minify
npx cap sync android                 # Capacitor sync
cd android && ./gradlew assembleDebug    # APK olustur
# Cikti: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release AAB (Play Store)
```bash
# Keystore olustur (sadece 1 kez)
keytool -genkeypair -v \
  -keystore android/app/astromap-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias astromap -storepass SIFRENIZ -keypass SIFRENIZ \
  -dname "CN=AstroMap, O=AstroMap, L=Istanbul, C=TR"

# Release build
npm run build:web
npx cap sync android
cd android && ./gradlew bundleRelease
# Cikti: android/app/build/outputs/bundle/release/app-release.aab
```

### Keystore Guvenligi
- Keystore dosyasini ASLA git'e eklemeyin (gitignore'da)
- Guvenli bir yerde yedekleyin
- Kaybederseniz Play Store'da guncelleme yayinlayamazsiniz

---

## iOS Build (Planlanan)

### Gereksinimler
- macOS + Xcode 15+
- Apple Developer hesabi ($99/yil)

### Build
```bash
npm run build:web
npx cap sync ios
npx cap open ios     # Xcode'da ac
# Xcode'dan Archive > App Store Connect'e yukle
```

---

## Lokal Gelistirme

```bash
git clone https://github.com/ugurdeniz39/where_to_live.git
cd where_to_live
npm install
cp .env.example .env   # API anahtarlarini gir
npm start              # http://localhost:3000
```

### Test
```bash
npm test    # API testleri (sunucu calisirken)
```

---

## Production Kontrol Listesi

### Deploy Oncesi
- [ ] GitHub reposu private
- [ ] `.env` gercek anahtarlarla dolduruldu
- [ ] `ADMIN_TOKEN` varsayilandan degistirildi
- [ ] iyzico production moduna gecildi
- [ ] `ALLOWED_ORIGINS` production domain iceriyor
- [ ] Rate limit degerleri uygun

### Deploy Sonrasi
- [ ] /api/health 200 donuyor
- [ ] Gunluk burc yorumu calisiyor
- [ ] Tarot calisiyor (4 acilim)
- [ ] Kahve fali foto yukleme calisiyor
- [ ] Odeme akisi calisiyor (sandbox test)
- [ ] Mobil responsive kontrol
- [ ] APK API baglantisi calisiyor

### Izleme
- [ ] /api/analytics/summary?token=TOKEN ile kullanim takibi
- [ ] /api/push/stats?token=TOKEN ile push token sayisi
- [ ] OpenAI kullanim dashboardu: platform.openai.com/usage
- [ ] Vercel dashboard: vercel.com/dashboard
