const Iyzipay = require('iyzipay');
const { corsHeaders } = require('../_lib/openai');
const { parse } = require('querystring');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || 'sandbox-afXhSWnbMcODHnNstMRqanOzOlpItFgj',
    secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-cpnBGYA6nSXAjdYOqtHSIPIkHxSEaF6Q',
    uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

module.exports = async (req, res) => {
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Parse URL-encoded body if needed
        let body = req.body;
        if (typeof body === 'string') {
            body = parse(body);
        }

        const token = body?.token;
        if (!token) {
            res.writeHead(302, { Location: '/?checkout=fail&msg=Token+bulunamadı' });
            return res.end();
        }

        await new Promise((resolve) => {
            iyzipay.checkoutForm.retrieve({
                locale: Iyzipay.LOCALE.TR,
                conversationId: '',
                token
            }, (err, result) => {
                if (err) {
                    console.error('iyzico Callback Error:', err);
                    res.writeHead(302, { Location: '/?checkout=fail&msg=Doğrulama+hatası' });
                    res.end();
                    return resolve();
                }

                if (result.paymentStatus === 'SUCCESS') {
                    console.log('✅ Ödeme başarılı:', result.paymentId, result.paidPrice);
                    res.writeHead(302, { Location: `/?checkout=success&amount=${result.paidPrice}` });
                } else {
                    console.log('❌ Ödeme başarısız:', result.errorMessage);
                    res.writeHead(302, { Location: `/?checkout=fail&msg=${encodeURIComponent(result.errorMessage || 'Ödeme tamamlanamadı')}` });
                }
                res.end();
                resolve();
            });
        });
    } catch (err) {
        console.error('Callback Error:', err);
        res.writeHead(302, { Location: '/?checkout=fail&msg=Sistem+hatası' });
        res.end();
    }
};
