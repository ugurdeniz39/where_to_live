/**
 * AstroMap API Tests
 * Run: node --test tests/server.test.js
 * Requires: Node.js 18+ (built-in test runner)
 * Note: Start server first with `npm start` or set TEST_URL
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function api(path, body = null) {
    const opts = body
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : { method: 'GET' };
    const res = await fetch(`${BASE_URL}${path}`, opts);
    return { status: res.status, data: await res.json().catch(() => null), headers: res.headers };
}

describe('Health Check', () => {
    it('GET /api/health returns ok', async () => {
        const { status, data } = await api('/api/health');
        assert.equal(status, 200);
        assert.equal(data.status, 'ok');
        assert.equal(data.version, '4.0');
        assert.equal(typeof data.uptime, 'string');
        assert.equal(typeof data.cache, 'number');
    });
});

describe('Input Validation', () => {
    it('daily-horoscope requires birthDate', async () => {
        const { status, data } = await api('/api/daily-horoscope', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('compatibility requires both birthDates', async () => {
        const { status, data } = await api('/api/compatibility', { person1: {}, person2: {} });
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('crystal-guide requires birthDate', async () => {
        const { status, data } = await api('/api/crystal-guide', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('dream requires dream text', async () => {
        const { status, data } = await api('/api/dream', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('fortune requires image', async () => {
        const { status, data } = await api('/api/fortune', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('checkout/init requires valid plan', async () => {
        const { status, data } = await api('/api/checkout/init', { plan: 'invalid', billing: { email: 'a@b.com', name: 'Test' } });
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('checkout/init validates email format', async () => {
        const { status, data } = await api('/api/checkout/init', { plan: 'premium-monthly', billing: { email: 'invalid', name: 'Test' } });
        assert.equal(status, 400);
        assert.match(data.error, /e-posta/i);
    });

    it('premium-status requires email', async () => {
        const { status, data } = await api('/api/premium-status', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });
});

describe('Premium Status', () => {
    it('returns free for unknown email', async () => {
        const { status, data } = await api('/api/premium-status', { email: 'nonexistent@test.com' });
        assert.equal(status, 200);
        assert.equal(data.premium, false);
        assert.equal(data.plan, 'free');
    });
});

describe('Analytics', () => {
    it('POST /api/analytics accepts events', async () => {
        const { status, data } = await api('/api/analytics', { event: 'test_event', data: { foo: 'bar' }, session: 'test_session' });
        assert.equal(status, 200);
        assert.equal(data.ok, true);
    });

    it('POST /api/analytics requires event field', async () => {
        const { status, data } = await api('/api/analytics', {});
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('GET /api/analytics/summary returns stats', async () => {
        const { status, data } = await api('/api/analytics/summary');
        assert.equal(status, 200);
        assert.equal(typeof data.total, 'number');
        assert.equal(typeof data.events, 'object');
    });
});

describe('Push Notification', () => {
    it('POST /api/push/register requires token or subscription', async () => {
        const { status, data } = await api('/api/push/register', { platform: 'test' });
        assert.equal(status, 400);
        assert.ok(data.error);
    });

    it('POST /api/push/register accepts token', async () => {
        const { status, data } = await api('/api/push/register', { token: 'test_token_123', platform: 'test', user: 'test@test.com' });
        assert.equal(status, 200);
        assert.equal(data.ok, true);
        assert.equal(typeof data.total, 'number');
    });

    it('GET /api/push/stats returns counts', async () => {
        const { status, data } = await api('/api/push/stats');
        assert.equal(status, 200);
        assert.equal(typeof data.total, 'number');
        assert.equal(typeof data.platforms, 'object');
    });
});

describe('Security Headers', () => {
    it('returns security headers on API response', async () => {
        const { headers } = await api('/api/health');
        assert.equal(headers.get('x-content-type-options'), 'nosniff');
        assert.equal(headers.get('x-frame-options'), 'SAMEORIGIN');
        assert.ok(headers.get('content-security-policy'));
    });
});

describe('Static Files', () => {
    it('serves index.html', async () => {
        const res = await fetch(`${BASE_URL}/`);
        assert.equal(res.status, 200);
        const text = await res.text();
        assert.ok(text.includes('AstroMap'));
    });

    it('serves manifest.json', async () => {
        const res = await fetch(`${BASE_URL}/manifest.json`);
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(data.name);
    });
});
