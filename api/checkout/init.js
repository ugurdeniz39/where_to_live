const Iyzipay = require('iyzipay');
const { corsHeaders } = require('../_lib/openai');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

const PLANS = {
    'premium-monthly': { price: '49.00', name: 'AstroMap Premium Aylık' },
    'premium-yearly':  { price: '490.00', name: 'AstroMap Premium Yıllık' },
    'vip-monthly':     { price: '99.00', name: 'AstroMap VIP Aylık' },
    'vip-yearly':      { price: '990.00', name: 'AstroMap VIP Yıllık' }
};

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { plan, billing } = req.body;
        const selected = PLANS[plan];
        if (!selected) return res.status(400).json({ error: 'Geçersiz plan' });

        const conversationId = `ASTRO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const proto = req.headers['x-forwarded-proto'] || 'https';

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId,
            price: selected.price,
            paidPrice: selected.price,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: `B_${conversationId}`,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${proto}://${host}/api/checkout/callback`,
            enabledInstallments: [1, 2, 3, 6],
            buyer: {
                id: 'BY_' + Date.now(),
                name: (billing?.name || 'Misafir').split(' ')[0],
                surname: (billing?.name || 'Kullanıcı').split(' ').slice(1).join(' ') || 'Kullanıcı',
                gsmNumber: billing?.phone || '+905000000000',
                email: billing?.email || 'misafir@astromap.app',
                identityNumber: '11111111111',
                lastLoginDate: new Date().toISOString().replace('T', ' ').substr(0, 19),
                registrationDate: new Date().toISOString().replace('T', ' ').substr(0, 19),
                registrationAddress: 'İstanbul, Türkiye',
                ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34000'
            },
            shippingAddress: {
                contactName: billing?.name || 'Misafir Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'İstanbul, Türkiye',
                zipCode: '34000'
            },
            billingAddress: {
                contactName: billing?.name || 'Misafir Kullanıcı',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'İstanbul, Türkiye',
                zipCode: '34000'
            },
            basketItems: [{
                id: plan,
                name: selected.name,
                category1: 'Dijital Ürün',
                category2: 'Abonelik',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: selected.price
            }]
        };

        await new Promise((resolve, reject) => {
            iyzipay.checkoutFormInitialize.create(request, (err, result) => {
                if (err) {
                    console.error('iyzico Error:', err);
                    return reject(new Error('Ödeme sistemi şu an yanıt veremiyor'));
                }
                if (result.status === 'success') {
                    res.json({
                        success: true,
                        checkoutFormContent: result.checkoutFormContent,
                        token: result.token,
                        plan: plan,
                        amount: selected.price
                    });
                    resolve();
                } else {
                    console.error('iyzico Form Error:', result.errorMessage);
                    res.status(400).json({ error: result.errorMessage || 'Ödeme formu oluşturulamadı' });
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error('Checkout Init Error:', err);
        res.status(500).json({ error: 'Ödeme başlatılamadı' });
    }
};
