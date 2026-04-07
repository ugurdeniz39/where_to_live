# Zemara — Supabase Veritabani Gecisi

## Neden?
Su an odeme verileri JSON dosyasinda tutuluyor. Sunucu yeniden baslatildiginda veya Vercel cold start'ta veriler kaybolabilir.

## Kurulum

### 1. Supabase Hesabi
1. https://supabase.com adresinde ucretsiz hesap ac
2. Yeni proje olustur (Region: Frankfurt/EU onerilir)
3. Project Settings > API'den anahtarlari al

### 2. Ortam Degiskenleri
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...    # Sadece server-side
```

### 3. Veritabani Tablolari
Supabase SQL Editor'de calistir:

```sql
-- Kullanicilar
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'vip')),
    birth_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Odemeler
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    payment_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    plan TEXT NOT NULL,
    period TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    activated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- Analytics
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    event TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    session_id TEXT,
    page TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Push Tokenlari
CREATE TABLE push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT,
    subscription JSONB,
    platform TEXT DEFAULT 'unknown',
    user_email TEXT,
    registered_at TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now()
);

-- Geri Bildirimler
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    mood TEXT,
    feature TEXT,
    message TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Referanslar
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_code TEXT NOT NULL,
    referrer_email TEXT,
    referred_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexler
CREATE INDEX idx_payments_email ON payments(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_analytics_event ON analytics(event);
CREATE INDEX idx_analytics_created ON analytics(created_at);
```

### 4. Kod Entegrasyonu
`npm install @supabase/supabase-js` sonra server.js'de:

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
```

JSON dosya fonksiyonlarini (loadPayments, savePayments vb.) Supabase sorgulariyla degistir.

## Ucretsiz Plan Limitleri
- 500 MB veritabani
- 50,000 satir/ay API istegi
- 1 GB dosya depolama
- Zemara icin fazlasiyla yeterli
