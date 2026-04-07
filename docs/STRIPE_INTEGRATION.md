# Zemara — Stripe Uluslararasi Odeme Entegrasyonu

## Neden?
iyzico sadece Turkiye'de calisir. Uluslararasi kullanicilar icin Stripe gerekli.

## Kurulum

### 1. Stripe Hesabi
1. https://stripe.com adresinde hesap ac
2. Dashboard > Developers > API keys'den anahtarlari al
3. Test modunda baslat (pk_test, sk_test)

### 2. Ortam Degiskenleri
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Bagimlilk
```bash
npm install stripe
```

### 4. API Endpoint (server.js'e ekle)
```javascript
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Checkout Session olustur
app.post('/api/stripe/create-session', async (req, res) => {
    const { plan, email } = req.body;
    const prices = {
        'premium-monthly': { amount: 499, name: 'Zemara Premium Monthly' },  // $4.99
        'premium-yearly': { amount: 4990, name: 'Zemara Premium Yearly' },
        'vip-monthly': { amount: 999, name: 'Zemara VIP Monthly' },
        'vip-yearly': { amount: 9990, name: 'Zemara VIP Yearly' }
    };
    const selected = prices[plan];
    if (!selected) return res.status(400).json({ error: 'Invalid plan' });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: { name: selected.name },
                unit_amount: selected.amount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        customer_email: email,
        success_url: 'https://zemara.app/?checkout=success',
        cancel_url: 'https://zemara.app/?checkout=fail',
    });

    res.json({ url: session.url });
});

// Webhook (odeme onaylama)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Kullaniciyi premium yap
        console.log('Stripe odeme basarili:', session.customer_email);
    }
    res.json({ received: true });
});
```

### 5. Frontend Entegrasyonu
Pricing sayfasinda odeme yontemi secici ekle:
- Turkiye'den geliyorsa → iyzico
- Diger ulkelerden → Stripe

```javascript
// Kullanicinin ulkesini tespit et
const isFromTurkey = navigator.language?.startsWith('tr') || Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Istanbul');
```

## Fiyatlandirma (USD)
| Plan | TRY (iyzico) | USD (Stripe) |
|------|-------------|-------------|
| Premium Aylik | 49 TL | $4.99 |
| Premium Yillik | 490 TL | $49.90 |
| VIP Aylik | 99 TL | $9.99 |
| VIP Yillik | 990 TL | $99.90 |

## Stripe Ucretsiz Plan
- Test modu: Tamamen ucretsiz
- Canli: %2.9 + $0.30 islem basi
- 100 Premium abone ($4.99 × 100) = $499/ay gelir, $14.5 komisyon
