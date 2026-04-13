/**
 * Zemara — Lemon Squeezy Checkout + Webhook
 *
 * Routes:
 *   POST /api/checkout/ls          → returns { checkoutUrl } with email pre-filled
 *   POST /api/checkout/ls?webhook=1 → Webhook handler (called by LS)
 *
 * ENV vars:
 *   LS_CHECKOUT_PREMIUM_MONTHLY / _YEARLY  — direct checkout URLs from LS dashboard
 *   LS_CHECKOUT_VIP_MONTHLY / _YEARLY
 *   LEMONSQUEEZY_WEBHOOK_SECRET            — webhook signature verification
 */

const { corsHeaders } = require('../_lib/openai');
const crypto = require('crypto');

// Plan → direct checkout URL (from LS dashboard → Share Product → Checkout Link)
const LS_CHECKOUT_URLS = {
  'premium-monthly': process.env.LS_CHECKOUT_PREMIUM_MONTHLY || 'https://zemara.lemonsqueezy.com/checkout/buy/422387ea-d06a-4eb0-ab94-c168384d42c8',
  'premium-yearly':  process.env.LS_CHECKOUT_PREMIUM_YEARLY  || 'https://zemara.lemonsqueezy.com/checkout/buy/b17004eb-30ce-4e96-8712-5e54e1f4fd64',
  'vip-monthly':     process.env.LS_CHECKOUT_VIP_MONTHLY     || 'https://zemara.lemonsqueezy.com/checkout/buy/20953a6e-8ac6-4769-930a-c0d07a067555',
  'vip-yearly':      process.env.LS_CHECKOUT_VIP_YEARLY      || 'https://zemara.lemonsqueezy.com/checkout/buy/87568b4f-bad9-4a7d-84f2-5a6ff566daa0',
};

// Variant IDs (for reference / webhook matching)
// premium-monthly: 1525717 (product: 971833)
// premium-yearly:  1525789 (product: 971875)
// vip-monthly:     1525820 (product: 971896)
// vip-yearly:      1525822 (product: 971898)

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

// ─── Checkout: build direct checkout URL with pre-filled email/name ──────────
async function handleCheckout(req, res) {
  const { plan, email, name } = req.body || {};

  if (!plan || !email) return res.status(400).json({ error: 'plan ve email gerekli' });

  const baseUrl = LS_CHECKOUT_URLS[plan];
  if (!baseUrl) return res.status(400).json({ error: `Geçersiz plan: ${plan}` });

  // Lemon Squeezy supports pre-filling via query params
  const url = new URL(baseUrl);
  url.searchParams.set('checkout[email]', email);
  if (name) url.searchParams.set('checkout[name]', name);
  url.searchParams.set('checkout[custom][plan]', plan);

  return res.json({ checkoutUrl: url.toString() });
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
