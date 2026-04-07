/**
 * Zemara — Lemon Squeezy (Single File: Checkout + Webhook)
 *
 * Routes:
 *   POST /api/checkout/ls          → Create checkout session → returns { checkoutUrl }
 *   POST /api/checkout/ls?webhook=1 → Webhook handler (called by LS)
 *
 * ENV vars:
 *   LEMONSQUEEZY_API_KEY
 *   LEMONSQUEEZY_STORE_ID
 *   LEMONSQUEEZY_WEBHOOK_SECRET
 *   LS_VARIANT_PREMIUM_MONTHLY / _YEARLY
 *   LS_VARIANT_VIP_MONTHLY / _YEARLY
 */

const { corsHeaders } = require('../_lib/openai');
const crypto = require('crypto');

// Plan → Lemon Squeezy Variant ID mapping (fill after creating products in LS dashboard)
const LS_VARIANTS = {
  'premium-monthly': process.env.LS_VARIANT_PREMIUM_MONTHLY || '',
  'premium-yearly':  process.env.LS_VARIANT_PREMIUM_YEARLY  || '',
  'vip-monthly':     process.env.LS_VARIANT_VIP_MONTHLY     || '',
  'vip-yearly':      process.env.LS_VARIANT_VIP_YEARLY      || '',
};

const LS_API   = 'https://api.lemonsqueezy.com/v1';
const LS_KEY   = () => process.env.LEMONSQUEEZY_API_KEY || '';
const LS_STORE = () => process.env.LEMONSQUEEZY_STORE_ID || '';

// ─── DB helper (optional — save subscription status) ─────────────────────────
let pool;
try {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 2 });
  }
} catch (_) {}

async function upsertSub({ email, plan, status, lsSubId, lsOrderId, expiresAt }) {
  if (!pool || !email) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zemara_subscriptions (
        email TEXT PRIMARY KEY, plan TEXT, status TEXT DEFAULT 'active',
        ls_sub_id TEXT, ls_order_id TEXT, expires_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      INSERT INTO zemara_subscriptions (email, plan, status, ls_sub_id, ls_order_id, expires_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      ON CONFLICT (email) DO UPDATE SET
        plan=EXCLUDED.plan, status=EXCLUDED.status,
        ls_sub_id=EXCLUDED.ls_sub_id, ls_order_id=EXCLUDED.ls_order_id,
        expires_at=EXCLUDED.expires_at, updated_at=NOW()
    `, [email, plan, status, lsSubId || null, lsOrderId || null, expiresAt || null]);
    console.log('[LS] DB upsert OK:', email, plan, status);
  } catch (e) { console.error('[LS] DB error:', e.message); }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  corsHeaders(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Route: webhook vs checkout
  const isWebhook = req.query?.webhook === '1' || req.url?.includes('?webhook=1') || req.headers['x-event-name'];
  return isWebhook ? handleWebhook(req, res) : handleCheckout(req, res);
};

// ─── Checkout: create LS checkout session ────────────────────────────────────
async function handleCheckout(req, res) {
  const { plan, email, name } = req.body || {};

  if (!plan || !email) return res.status(400).json({ error: 'plan ve email gerekli' });

  const variantId = LS_VARIANTS[plan];
  if (!variantId) return res.status(400).json({ error: `Geçersiz plan veya LS_VARIANT_${plan.toUpperCase().replace('-','_')} env eksik` });
  if (!LS_KEY()) return res.status(500).json({ error: 'LEMONSQUEEZY_API_KEY eksik' });

  try {
    const host  = req.headers['x-forwarded-host'] || req.headers.host || 'zemara.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const base  = `${proto}://${host}`;

    const body = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            name: name || '',
            custom: { plan, source: 'zemara-web' },
          },
          product_options: {
            redirect_url: `${base}/?ls_success=1&plan=${plan}`,
            receipt_thank_you_note: 'Zemara\'ya hoş geldiniz! Kozmik yolculuğunuz başlıyor ✨',
          },
          checkout_options: { embed: false, media: true, logo: true },
          expires_at: null,
        },
        relationships: {
          store:   { data: { type: 'stores',   id: String(LS_STORE()) } },
          variant: { data: { type: 'variants', id: String(variantId)  } },
        },
      },
    };

    const lsRes = await fetch(`${LS_API}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization':  `Bearer ${LS_KEY()}`,
        'Accept':         'application/vnd.api+json',
        'Content-Type':   'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });

    const result = await lsRes.json();

    if (result.errors) {
      console.error('[LS] Checkout error:', JSON.stringify(result.errors));
      return res.status(500).json({ error: result.errors[0]?.detail || 'Lemon Squeezy hatası' });
    }

    const checkoutUrl = result.data?.attributes?.url;
    if (!checkoutUrl) return res.status(500).json({ error: 'Checkout URL alınamadı' });

    return res.json({ checkoutUrl });

  } catch (err) {
    console.error('[LS] Checkout fatal:', err.message);
    return res.status(500).json({ error: 'Ödeme sistemi hatası' });
  }
}

// ─── Webhook: handle LS events ───────────────────────────────────────────────
async function handleWebhook(req, res) {
  const signature = req.headers['x-signature'] || '';
  let rawBody = '';
  await new Promise(r => { req.on('data', c => rawBody += c); req.on('end', r); });

  // Verify signature
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';
  if (secret && signature) {
    const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      if (!crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(signature, 'hex'))) {
        console.warn('[LS Webhook] Bad signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch { return res.status(401).json({ error: 'Signature error' }); }
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }

  const eventName = event.meta?.event_name;
  const data      = event.data?.attributes || {};
  const custom    = event.meta?.custom_data || {};
  const email     = data.user_email;

  console.log('[LS Webhook]', eventName, email);

  const statusMap = { active:'active', past_due:'past_due', unpaid:'past_due', cancelled:'cancelled', expired:'cancelled', on_trial:'trial', paused:'paused' };

  switch (eventName) {
    case 'order_created':
      await upsertSub({ email, plan: custom.plan || 'premium-lifetime', status: data.status === 'paid' ? 'active' : 'pending', lsOrderId: String(event.data?.id||''), expiresAt: null });
      break;
    case 'subscription_created':
    case 'subscription_updated':
      await upsertSub({ email, plan: custom.plan || 'premium-monthly', status: statusMap[data.status] || data.status, lsSubId: String(event.data?.id||''), expiresAt: data.renews_at || data.ends_at || null });
      break;
    case 'subscription_cancelled':
    case 'subscription_expired':
      await upsertSub({ email, plan: custom.plan || 'cancelled', status: 'cancelled', lsSubId: String(event.data?.id||''), expiresAt: data.ends_at || null });
      break;
    default:
      console.log('[LS Webhook] Unhandled event:', eventName);
  }

  return res.status(200).json({ received: true });
}
