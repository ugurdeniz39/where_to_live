/**
 * ============================================
 * AstroMap v4 — Premium SPA Controller
 * Navigation, Daily Horoscope, Compatibility,
 * Moon Calendar, Astrocartography, Comparison,
 * Share, Timing, Auth UI
 * Optimized & Enhanced Edition
 * ============================================
 */

// ═══════════════════════════════════════
// PERFORMANCE UTILITIES
// ═══════════════════════════════════════
function throttle(fn, delay = 16) {
    let lastCall = 0, timer = null;
    return function(...args) {
        const now = performance.now();
        const remaining = delay - (now - lastCall);
        if (remaining <= 0) {
            lastCall = now;
            fn.apply(this, args);
        } else if (!timer) {
            timer = setTimeout(() => {
                lastCall = performance.now();
                timer = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
}

function debounce(fn, delay = 200) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ═══════════════════════════════════════
// API RESPONSE CACHE
// ═══════════════════════════════════════
const AICache = {
    prefix: 'astromap_cache_',
    ttl: 3600000, // 1 hour in ms
    
    _key(endpoint, body) {
        return this.prefix + endpoint + '_' + btoa(unescape(encodeURIComponent(JSON.stringify(body)))).slice(0, 60);
    },
    
    get(endpoint, body) {
        try {
            const key = this._key(endpoint, body);
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > this.ttl) {
                localStorage.removeItem(key);
                return null;
            }
            return data;
        } catch { return null; }
    },
    
    set(endpoint, body, data) {
        try {
            const key = this._key(endpoint, body);
            localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
            this._cleanup();
        } catch { /* quota exceeded — ignore */ }
    },
    
    _cleanup() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(this.prefix)) keys.push(k);
        }
        // keep max 30 cached items
        if (keys.length > 30) {
            keys.sort((a, b) => {
                try {
                    return JSON.parse(localStorage.getItem(a)).ts - JSON.parse(localStorage.getItem(b)).ts;
                } catch { return 0; }
            });
            keys.slice(0, keys.length - 30).forEach(k => localStorage.removeItem(k));
        }
    }
};

// ═══════════════════════════════════════
// KEYBOARD SHORTCUTS SYSTEM
// ═══════════════════════════════════════
const KeyboardShortcuts = {
    shortcuts: {},
    enabled: true,
    
    register(key, description, handler) {
        this.shortcuts[key.toLowerCase()] = { description, handler };
    },
    
    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            // Don't intercept when typing in inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            
            const key = (e.altKey ? 'alt+' : '') + (e.ctrlKey ? 'ctrl+' : '') + e.key.toLowerCase();
            const shortcut = this.shortcuts[key];
            if (shortcut) {
                e.preventDefault();
                shortcut.handler();
            }
        });
    },
    
    getAll() { return this.shortcuts; }
};

// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let selectedPreferences = [];
let lifestyleChoices = {};
let map = null;
let mapMarkers = [];
let mapLines = [];
let mapHeatCircles = [];
let results = null;
let allRenderedCities = [];
let currentFilter = 'all';
let currentSearch = '';
let compareSlots = [null, null];
let showMarkers = true;
let showLines = true;
let showHeatmap = false;
let visiblePlanets = new Set();
let currentPage = 'home';

// ═══════════════════════════════════════
// NAVIGATION (SPA Router)
// ═══════════════════════════════════════
function navigateTo(pageId) {
    SoundFX.play('click');
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show target with animation
    const target = document.getElementById('page-' + pageId) || document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        // Re-trigger animation
        target.style.animation = 'none';
        target.offsetHeight; // reflow
        target.style.animation = '';
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile nav
    document.getElementById('nav-links').classList.remove('open');

    currentPage = pageId;
    window.scrollTo(0, 0);

    // Load page data
    if (pageId === 'moon') loadMoonCalendar();
    
    // Track visited pages (remove "Yeni" badges)
    try {
        const visited = JSON.parse(localStorage.getItem('astromap_visited') || '[]');
        if (!visited.includes(pageId)) {
            visited.push(pageId);
            localStorage.setItem('astromap_visited', JSON.stringify(visited));
        }
        const badge = document.querySelector(`.nav-link[data-page="${pageId}"] .nav-new-badge`);
        if (badge) badge.remove();
    } catch(e) {}
    
    // Announce to screen reader
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        const pageName = activeLink?.textContent?.replace('Yeni', '').trim() || pageId;
        announcer.textContent = pageName + ' sayfası açıldı';
    }
}

// ═══════════════════════════════════════
// AI API HELPER
// ═══════════════════════════════════════
async function callAI(endpoint, body, useCache = true) {
    // Check cache first
    if (useCache) {
        const cached = AICache.get(endpoint, body);
        if (cached) {
            console.log(`✦ AI Cache hit: ${endpoint}`);
            return cached;
        }
    }
    
    const res = await fetch('/api/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'AI isteği başarısız');
    
    // Cache the response
    if (useCache) AICache.set(endpoint, body, data.data);
    
    return data.data;
}

function showAILoading(container, message) {
    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="ai-loading">
            <div class="ai-loading-spinner"></div>
            <p class="ai-loading-text">${message || 'AI yanıt hazırlıyor...'}</p>
            <p class="ai-loading-sub">Bu birkaç saniye sürebilir ✨</p>
        </div>
    `;
}

function showAIError(container, msg) {
    container.innerHTML = `
        <div class="ai-error">
            <span class="ai-error-icon">⚠️</span>
            <p>${msg || 'Bir hata oluştu. Lütfen tekrar dene.'}</p>
        </div>
    `;
}

function resetAIPage(formId, resultId) {
    document.getElementById(formId).style.display = '';
    const res = document.getElementById(resultId);
    res.classList.add('hidden');
    res.innerHTML = '';
}

function getSunSignFromDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const signs = [
        { sign: 'Oğlak', end: [1, 19] }, { sign: 'Kova', end: [2, 18] },
        { sign: 'Balık', end: [3, 20] }, { sign: 'Koç', end: [4, 19] },
        { sign: 'Boğa', end: [5, 20] }, { sign: 'İkizler', end: [6, 20] },
        { sign: 'Yengeç', end: [7, 22] }, { sign: 'Aslan', end: [8, 22] },
        { sign: 'Başak', end: [9, 22] }, { sign: 'Terazi', end: [10, 22] },
        { sign: 'Akrep', end: [11, 21] }, { sign: 'Yay', end: [12, 21] },
        { sign: 'Oğlak', end: [12, 31] }
    ];
    for (const s of signs) {
        if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.sign;
    }
    return 'Oğlak';
}

function toggleMobileNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

// Astro app step navigation
function startApp() { navigateToStep('step-birth'); }
function goToStep(stepId) { navigateToStep(stepId); }

function navigateToStep(stepId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(stepId);
    if (el) el.classList.add('active');
    // Clear nav active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    window.scrollTo(0, 0);
}

function resetApp() {
    selectedPreferences = [];
    lifestyleChoices = {};
    results = null;
    compareSlots = [null, null];
    document.querySelectorAll('.pref-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    if (map) {
        mapMarkers.forEach(m => map.removeLayer(m));
        mapLines.forEach(l => map.removeLayer(l));
        mapHeatCircles.forEach(c => map.removeLayer(c));
        mapMarkers = []; mapLines = []; mapHeatCircles = [];
    }
    navigateTo('home');
}

// ═══════════════════════════════════════
// STARS ANIMATION
// ═══════════════════════════════════════
function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    const stars = [];
    for (let i = 0; i < 250; i++) {
        stars.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.6 + 0.3, alpha: Math.random(), speed: Math.random() * 0.015 + 0.003
        });
    }
    // Occasional shooting star
    let shootingStar = null;
    function createShootingStar() {
        shootingStar = {
            x: Math.random() * canvas.width * 0.8,
            y: Math.random() * canvas.height * 0.3,
            len: 60 + Math.random() * 80,
            speed: 8 + Math.random() * 6,
            angle: Math.PI / 6 + Math.random() * 0.3,
            life: 1
        };
    }
    setInterval(createShootingStar, 6000);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const star of stars) {
            star.alpha += star.speed;
            const brightness = (Math.sin(star.alpha) + 1) / 2;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 190, 255, ${brightness * 0.8})`;
            ctx.fill();
        }
        // Draw shooting star
        if (shootingStar && shootingStar.life > 0) {
            const s = shootingStar;
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.life -= 0.02;
            const grad = ctx.createLinearGradient(
                s.x, s.y,
                s.x - Math.cos(s.angle) * s.len,
                s.y - Math.sin(s.angle) * s.len
            );
            grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
            grad.addColorStop(1, 'rgba(201,160,255,0)');
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', resize);
}

// ═══════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
});

// ═══════════════════════════════════════
// MODALS
// ═══════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Close modal on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// ═══════════════════════════════════════
// TOAST
// ═══════════════════════════════════════
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

// ═══════════════════════════════════════
// AUTH (UI only — backend later)
// ═══════════════════════════════════════
function handleLogin(e) {
    e.preventDefault();
    showToast('Giriş başarılı! (Demo mod) ✨');
    closeModal('login-modal');
}

function handleSignup(e) {
    e.preventDefault();
    showToast('Hesap oluşturuldu! Hoş geldin ✨');
    closeModal('signup-modal');
}

function socialLogin(provider) {
    showToast(`${provider === 'google' ? 'Google' : 'Apple'} ile giriş yapılıyor... (Demo mod)`);
    setTimeout(() => {
        closeModal('login-modal');
        closeModal('signup-modal');
    }, 1000);
}

// ═══════════════════════════════════════
// PRICING
// ═══════════════════════════════════════
function toggleBilling() {
    const isYearly = document.getElementById('billing-toggle').checked;
    document.getElementById('lbl-monthly').classList.toggle('active', !isYearly);
    document.getElementById('lbl-yearly').classList.toggle('active', isYearly);
    document.getElementById('price-premium').textContent = isYearly ? '₺490' : '₺49';
    document.getElementById('period-premium').textContent = isYearly ? '/yıl' : '/ay';
    document.getElementById('price-vip').textContent = isYearly ? '₺990' : '₺99';
    document.getElementById('period-vip').textContent = isYearly ? '/yıl' : '/ay';
}

function toggleFaq(el) { el.classList.toggle('open'); }

// ═══════════════════════════════════════
// iyzico CHECKOUT FLOW
// ═══════════════════════════════════════
let currentCheckoutPlan = null;

const PLAN_DETAILS = {
    'premium-monthly': { name: 'Premium Aylık', price: '₺49', period: '/ay' },
    'premium-yearly':  { name: 'Premium Yıllık', price: '₺490', period: '/yıl', save: '2 ay bedava!' },
    'vip-monthly':     { name: 'VIP Aylık', price: '₺99', period: '/ay' },
    'vip-yearly':      { name: 'VIP Yıllık', price: '₺990', period: '/yıl', save: '2 ay bedava!' }
};

function startCheckout(tier) {
    // tier = 'premium' or 'vip'
    const isYearly = document.getElementById('billing-toggle')?.checked || false;
    const planKey = `${tier}-${isYearly ? 'yearly' : 'monthly'}`;
    const plan = PLAN_DETAILS[planKey];
    if (!plan) return showToast('Geçersiz plan seçimi');

    currentCheckoutPlan = planKey;

    // Update checkout modal labels
    document.getElementById('checkout-plan-label').textContent = `${plan.name} ${plan.save ? '(' + plan.save + ')' : ''}`;
    document.getElementById('checkout-summary-plan').textContent = plan.name;
    document.getElementById('checkout-summary-amount').textContent = `${plan.price}${plan.period}`;

    // Reset to billing step
    document.getElementById('checkout-step-billing').classList.remove('hidden');
    document.getElementById('checkout-step-payment').classList.add('hidden');
    document.getElementById('iyzico-checkout-form').innerHTML = '<div class="checkout-loading"><div class="loading-spinner">✦</div><p>Ödeme formu yükleniyor...</p></div>';

    // Open modal
    openModal('checkout-modal');
    playSound('click');
}

async function submitBillingAndPay(e) {
    e.preventDefault();

    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();

    if (!name || !email || !phone) {
        showToast('Lütfen tüm alanları doldurun');
        return;
    }

    // Switch to payment step
    document.getElementById('checkout-step-billing').classList.add('hidden');
    document.getElementById('checkout-step-payment').classList.remove('hidden');

    try {
        const response = await fetch('/api/checkout/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: currentCheckoutPlan,
                billing: { name, email, phone }
            })
        });

        const data = await response.json();

        if (data.success && data.checkoutFormContent) {
            // Render iyzico checkout form
            const container = document.getElementById('iyzico-checkout-form');
            container.innerHTML = '';

            // Create a div and inject iyzico's checkout form HTML+JS
            const formDiv = document.createElement('div');
            formDiv.innerHTML = data.checkoutFormContent;
            container.appendChild(formDiv);

            // Execute any scripts in the injected content
            const scripts = formDiv.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });

            playSound('success');
        } else {
            showToast(data.error || 'Ödeme formu yüklenemedi');
            // Go back to billing step
            document.getElementById('checkout-step-payment').classList.add('hidden');
            document.getElementById('checkout-step-billing').classList.remove('hidden');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        showToast('Ödeme sistemi şu an yanıt veremiyor. Lütfen tekrar deneyin.');
        document.getElementById('checkout-step-payment').classList.add('hidden');
        document.getElementById('checkout-step-billing').classList.remove('hidden');
    }
}

function closeCheckout() {
    closeModal('checkout-modal');
    currentCheckoutPlan = null;
}

// Listen for checkout result (from callback redirect)
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');

    if (checkoutStatus === 'success') {
        const amount = params.get('amount');
        showToast(`Ödeme başarılı! ${amount ? '₺' + amount + ' alındı.' : ''} Premium aktif ✨`, 5000);
        playSound('success');

        // Clean URL
        window.history.replaceState({}, '', '/');

        // Show celebration
        if (typeof launchCelebration === 'function') launchCelebration();
    } else if (checkoutStatus === 'fail') {
        const msg = params.get('msg') || 'Ödeme tamamlanamadı';
        showToast(`${decodeURIComponent(msg)} 😔`, 5000);
        window.history.replaceState({}, '', '/');
        navigateTo('pricing');
    }
});

// Listen for postMessage from checkout popup/redirect
window.addEventListener('message', (e) => {
    if (e.data?.type === 'checkout-result') {
        if (e.data.status === 'success') {
            showToast('Ödeme başarılı! Premium aktif ✨', 5000);
            playSound('success');
            if (typeof launchCelebration === 'function') launchCelebration();
        }
        closeCheckout();
    }
});

// ═══════════════════════════════════════
// DAILY HOROSCOPE — AI POWERED
// ═══════════════════════════════════════
async function showDailyHoroscope() {
    const birthDate = document.getElementById('daily-birth-date').value;
    const birthTime = document.getElementById('daily-birth-time').value;
    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }

    const sunSign = getSunSignFromDate(birthDate);
    const signSymbols = { 'Koç':'♈','Boğa':'♉','İkizler':'♊','Yengeç':'♋','Aslan':'♌','Başak':'♍','Terazi':'♎','Akrep':'♏','Yay':'♐','Oğlak':'♑','Kova':'♒','Balık':'♓' };
    const signEmoji = signSymbols[sunSign] || '✦';

    const el = document.getElementById('daily-result');
    el.classList.remove('hidden');
    document.getElementById('daily-form').style.display = 'none';

    // Zodiac wheel loading animation
    el.innerHTML = `
        <div class="zodiac-loading">
            <div class="zodiac-wheel">
                <div class="zodiac-ring">
                    ${Object.values(signSymbols).map((s, i) => `<span class="zodiac-sym" style="--i:${i}">${s}</span>`).join('')}
                </div>
                <div class="zodiac-center">${signEmoji}</div>
            </div>
            <p class="zodiac-loading-msg">Yıldızlar okunuyor...</p>
            <div class="zodiac-dots"><span>✦</span><span>✦</span><span>✦</span></div>
        </div>
    `;

    try {
        const data = await callAI('daily-horoscope', { birthDate, birthTime, sunSign });
        SoundFX.play('reveal');
        const h = data;
        const scores = h.scores || {};

        el.innerHTML = `
            <div class="daily-reveal">
                <div class="daily-card stagger-1">
                    <div class="daily-sign-header">
                        <div class="daily-sign-aura"></div>
                        <span class="daily-sign-icon">${signEmoji}</span>
                        <div class="daily-sign-name">${sunSign}</div>
                        <div class="daily-date">${new Date().toLocaleDateString('tr-TR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
                    </div>
                    <div class="daily-scores">
                        ${[['Aşk','love','💕'],['Kariyer','career','💼'],['Sağlık','health','💚'],['Şans','luck','🍀'],['Enerji','energy','⚡'],['Ruh Hali','mood','🧘‍♀️']].map(([label, key, icon]) => {
                            const val = scores[key] || 75;
                            return `<div class="daily-score-item">
                                <span class="score-label">${icon} ${label}</span>
                                <div class="score-ring" style="--pct:${val}%" data-score="${val}"><span class="ring-num" data-target="${val}">0</span></div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="daily-sections stagger-2">
                    <div class="daily-msg-card"><div class="daily-msg-icon">🌟</div><div class="daily-msg-body"><strong>Genel</strong><p>${h.general || ''}</p></div></div>
                    <div class="daily-msg-card"><div class="daily-msg-icon">💕</div><div class="daily-msg-body"><strong>Aşk</strong><p>${h.love || ''}</p></div></div>
                    <div class="daily-msg-card"><div class="daily-msg-icon">💼</div><div class="daily-msg-body"><strong>Kariyer</strong><p>${h.career || ''}</p></div></div>
                    <div class="daily-msg-card"><div class="daily-msg-icon">💚</div><div class="daily-msg-body"><strong>Sağlık</strong><p>${h.health || ''}</p></div></div>
                </div>

                <div class="daily-advice-card stagger-3">
                    <span class="daily-advice-star">💫</span>
                    <p>${h.advice || ''}</p>
                </div>

                <div class="daily-lucky stagger-4">
                    <div class="daily-lucky-item"><span class="lucky-label">Şans Rengi</span><span class="lucky-val">🎨 ${h.luckyColor || ''}</span></div>
                    <div class="daily-lucky-item"><span class="lucky-label">Şans Sayısı</span><span class="lucky-val">🔢 ${h.luckyNumber || ''}</span></div>
                    <div class="daily-lucky-item"><span class="lucky-label">Şans Taşı</span><span class="lucky-val">💎 ${h.luckyStone || ''}</span></div>
                    <div class="daily-lucky-item"><span class="lucky-label">Şanslı Saat</span><span class="lucky-val">🕐 ${h.luckyHour || ''}</span></div>
                </div>

                <div class="daily-tarot-card stagger-5">
                    <div class="daily-tarot-icon">🃏</div>
                    <div class="daily-tarot-name">${h.tarotCard || ''}</div>
                    <p class="daily-tarot-meaning">${h.tarotMeaning || ''}</p>
                </div>

                <div class="daily-affirmation stagger-6">"${h.affirmation || ''}"</div>
                <button class="btn-ghost reset-btn stagger-6" onclick="resetAIPage('daily-form','daily-result')">🌟 Tekrar Sor</button>
            </div>
        `;

        // Animate score numbers
        animateScoreNumbers(el);

    } catch (err) {
        showAIError(el, err.message);
        document.getElementById('daily-form').style.display = '';
    }
}

function animateScoreNumbers(container) {
    container.querySelectorAll('.ring-num').forEach(numEl => {
        const target = parseInt(numEl.dataset.target) || 0;
        let current = 0;
        const step = Math.ceil(target / 30);
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            numEl.textContent = current;
        }, 30);
    });
}

// ═══════════════════════════════════════
// COMPATIBILITY — AI POWERED
// ═══════════════════════════════════════
async function showCompatibility() {
    const p1 = { birthDate: document.getElementById('compat-date-1').value, birthTime: document.getElementById('compat-time-1').value };
    const p2 = { birthDate: document.getElementById('compat-date-2').value, birthTime: document.getElementById('compat-time-2').value };
    if (!p1.birthDate || !p2.birthDate) { showToast('Lütfen her iki kişinin doğum tarihini gir'); return; }

    p1.sunSign = getSunSignFromDate(p1.birthDate);
    p2.sunSign = getSunSignFromDate(p2.birthDate);

    const el = document.getElementById('compat-result');
    el.classList.remove('hidden');
    document.getElementById('compat-form').style.display = 'none';

    // Heart beating loading
    el.innerHTML = `
        <div class="compat-loading">
            <div class="compat-loading-hearts">
                <span class="compat-load-heart h1">💜</span>
                <span class="compat-load-merge">✦</span>
                <span class="compat-load-heart h2">💗</span>
            </div>
            <div class="compat-loading-pulse"></div>
            <p class="compat-loading-msg">Kozmik uyum hesaplanıyor...</p>
            <div class="zodiac-dots"><span>✦</span><span>✦</span><span>✦</span></div>
        </div>
    `;

    try {
        const data = await callAI('compatibility', { person1: p1, person2: p2 });
        SoundFX.play('reveal');
        const c = data;
        const catColors = { romance: '#ff6b9d', communication: '#6ee7c8', passion: '#ff4444', longTerm: '#c9a0ff', trust: '#ffd76e' };
        const catLabels = { romance: '💕 Romantizm', communication: '🗣️ İletişim', passion: '🔥 Tutku', longTerm: '🏡 Uzun Vade', trust: '🤝 Güven' };

        el.innerHTML = `
            <div class="compat-reveal">
                <div class="compat-overall stagger-1">
                    <div class="compat-overall-aura"></div>
                    <div class="compat-score-wrap">
                        <svg class="compat-ring-svg" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
                            <circle class="compat-ring-fill" cx="60" cy="60" r="54" fill="none" stroke="url(#compatGrad)" stroke-width="8" stroke-linecap="round"
                                stroke-dasharray="${2 * Math.PI * 54}" stroke-dashoffset="${2 * Math.PI * 54}" transform="rotate(-90 60 60)"/>
                            <defs><linearGradient id="compatGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c9a0ff"/><stop offset="100%" stop-color="#ff6b9d"/></linearGradient></defs>
                        </svg>
                        <div class="compat-overall-score"><span class="ring-num" data-target="${c.overall || 75}">0</span>%</div>
                    </div>
                    <div class="compat-overall-label">Kozmik Uyum</div>
                    <div class="compat-signs-row">
                        <span class="compat-sign">${c.sign1 || p1.sunSign}</span>
                        <span class="compat-heart-icon">💕</span>
                        <span class="compat-sign">${c.sign2 || p2.sunSign}</span>
                    </div>
                    <div class="compat-summary">${c.summary || ''}</div>
                    <div class="compat-element-compat">${c.elementCompat || ''}</div>
                </div>

                <div class="compat-categories stagger-2">
                    ${['romance','communication','passion','longTerm','trust'].map(key => {
                        const val = c[key] || 70;
                        return `<div class="compat-cat">
                            <span class="compat-cat-label">${catLabels[key] || key}</span>
                            <div class="compat-cat-score" style="color:${catColors[key]}"><span class="ring-num" data-target="${val}">0</span>%</div>
                            <div class="compat-cat-bar"><div class="compat-cat-fill" style="width:0%;background:${catColors[key]}" data-width="${val}%"></div></div>
                        </div>`;
                    }).join('')}
                </div>

                <div class="compat-details-grid stagger-3">
                    <div class="compat-detail-card strengths">
                        <h4>💪 Güçlü Yanlar</h4>
                        <ul>${(c.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                    <div class="compat-detail-card challenges">
                        <h4>⚡ Zorluklar</h4>
                        <ul>${(c.challenges || []).map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                </div>

                <div class="compat-soul stagger-4">
                    <span class="compat-soul-icon">🔮</span>
                    <h3>Ruhsal Bağ</h3>
                    <p>${c.soulConnection || ''}</p>
                </div>

                <div class="compat-advice-card stagger-5">
                    <h3>💌 İlişki Tavsiyesi</h3>
                    <p>${c.advice || ''}</p>
                    <div class="compat-best-dates">🎯 ${c.bestDates || ''}</div>
                </div>

                <button class="btn-ghost reset-btn stagger-6" onclick="resetAIPage('compat-form','compat-result')">💕 Tekrar Dene</button>
            </div>
        `;

        // Animate score ring
        setTimeout(() => {
            const ring = el.querySelector('.compat-ring-fill');
            if (ring) {
                const target = c.overall || 75;
                const circumference = 2 * Math.PI * 54;
                ring.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
                ring.style.strokeDashoffset = circumference - (circumference * target / 100);
            }
            // Animate bar fills
            el.querySelectorAll('.compat-cat-fill').forEach(fill => {
                setTimeout(() => { fill.style.transition = 'width 1.2s ease'; fill.style.width = fill.dataset.width; }, 200);
            });
            // Animate numbers
            animateScoreNumbers(el);
        }, 300);

    } catch (err) {
        showAIError(el, err.message);
        document.getElementById('compat-form').style.display = '';
    }
}

// ═══════════════════════════════════════
// MOON CALENDAR
// ═══════════════════════════════════════
function loadMoonCalendar() {
    const moon = AstroEngine.calculateMoonPhase(new Date());
    const el = document.getElementById('moon-content');
    if (!el) return;

    el.innerHTML = `
        <div class="moon-main">
            <span class="moon-emoji">${moon.phaseEmoji}</span>
            <div class="moon-phase-name">${moon.phaseName}</div>
            <div class="moon-illumination">%${moon.illumination} aydınlık</div>
            <div class="moon-sign">${moon.moonSignSymbol} Ay ${moon.moonSign} burcunda</div>
            <div class="moon-desc">${moon.phaseDesc}</div>
            <div class="moon-dates">
                <div class="moon-date-item"><small>Sonraki Dolunay</small><span>🌕 ${moon.nextFull}</span></div>
                <div class="moon-date-item"><small>Sonraki Yeni Ay</small><span>🌑 ${moon.nextNew}</span></div>
            </div>
        </div>
        <div class="moon-rituals">
            <h3>✨ ${moon.phaseName} Ritüelleri</h3>
            <div class="moon-ritual-list">
                ${moon.rituals.map(r => `<div class="moon-ritual">${r}</div>`).join('')}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════
// BIRTH CITY SEARCH
// ═══════════════════════════════════════
function filterBirthCities(query) {
    const select = document.getElementById('birth-city');
    const q = (query || '').toLowerCase().trim();
    // Use full city database — Turkey first, then world
    const allCities = CITY_DATABASE.ALL_CITIES;
    const filtered = q
        ? allCities.filter(c => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
        : allCities;
    // Show max 50 to keep dropdown fast
    const toShow = filtered.slice(0, 50);
    select.innerHTML = '';
    toShow.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.city.toLowerCase().replace(/\s+/g, '');
        opt.textContent = `${c.city}, ${c.country}`;
        opt.dataset.lat = c.lat;
        opt.dataset.lon = c.lon;
        select.appendChild(opt);
    });
    if (toShow.length > 0) select.value = toShow[0].value;
    if (filtered.length > 50) {
        const more = document.createElement('option');
        more.disabled = true;
        more.textContent = `... ${filtered.length - 50} şehir daha (arama ile daralt)`;
        select.appendChild(more);
    }
}

function initBirthCityDropdown() {
    filterBirthCities('');
    const searchInput = document.getElementById('birth-city-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterBirthCities(e.target.value));
    }
}

// ═══════════════════════════════════════
// PREFERENCE & LIFESTYLE
// ═══════════════════════════════════════
function togglePref(el) {
    el.classList.toggle('selected');
    const pref = el.dataset.pref;
    if (selectedPreferences.includes(pref)) {
        selectedPreferences = selectedPreferences.filter(p => p !== pref);
    } else {
        selectedPreferences.push(pref);
    }
}

function selectOption(el) {
    const group = el.dataset.group;
    document.querySelectorAll(`.option-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    lifestyleChoices[group] = el.dataset.value;
}

// ═══════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════
function switchTab(btn) {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ═══════════════════════════════════════
// CALCULATE
// ═══════════════════════════════════════
function calculateResults() {
    const birthDate = document.getElementById('birth-date').value;
    const birthTime = document.getElementById('birth-time').value;
    const birthCity = document.getElementById('birth-city').value;

    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }

    document.getElementById('loading-overlay').classList.remove('hidden');
    const bar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    const loadingSub = document.getElementById('loading-sub');

    bar.style.width = '10%';
    loadingText.textContent = 'Gezegen pozisyonları hesaplanıyor...';
    loadingSub.textContent = `${CITY_DATABASE.ALL_CITIES.length} şehir analiz ediliyor`;

    setTimeout(() => { bar.style.width = '35%'; loadingText.textContent = 'Astrokartografi çizgileri çiziliyor...'; }, 400);
    setTimeout(() => { bar.style.width = '65%'; loadingText.textContent = 'Şehirler puanlanıyor...'; }, 800);
    setTimeout(() => { bar.style.width = '85%'; loadingText.textContent = 'Transit analizleri yapılıyor...'; }, 1200);

    setTimeout(() => {
        results = AstroEngine.calculate(birthDate, birthTime, birthCity, selectedPreferences, lifestyleChoices);
        allRenderedCities = results.recommendations;

        bar.style.width = '100%';
        loadingText.textContent = 'Hazır! ✦';

        setTimeout(() => {
            renderResults();
            renderNatalSummary();
            renderLineToggles();
            renderTimingAnalysis();
            document.getElementById('loading-overlay').classList.add('hidden');
            navigateToStep('step-results');
            setTimeout(() => initMap(), 150);
        }, 400);
    }, 1600);
}

// ═══════════════════════════════════════
// RENDER RESULTS
// ═══════════════════════════════════════
function renderResults() {
    const sunSign = results.natalChart.sun.sign;
    const moonSign = results.natalChart.moon.sign;
    document.getElementById('results-intro').textContent =
        `${sunSign} güneşi ve ${moonSign} ayı ile ${CITY_DATABASE.ALL_CITIES.length} şehri analiz ettik:`;
    renderCityList(allRenderedCities);
}

function renderCityList(cities) {
    const listEl = document.getElementById('results-list');
    listEl.innerHTML = '';

    let filtered = [...cities];
    if (currentFilter !== 'all') filtered = filtered.filter(c => c.region === currentFilter);
    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(c => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
    }

    // Sort
    const sort = currentSort || 'score-desc';
    if (sort === 'score-desc') filtered.sort((a, b) => b.score - a.score);
    else if (sort === 'score-asc') filtered.sort((a, b) => a.score - b.score);
    else if (sort === 'name-asc') filtered.sort((a, b) => a.city.localeCompare(b.city, 'tr'));
    else if (sort === 'name-desc') filtered.sort((a, b) => b.city.localeCompare(a.city, 'tr'));

    document.getElementById('results-count').textContent = `${filtered.length} şehir gösteriliyor`;

    // Stats bar
    const statsEl = document.getElementById('results-stats');
    if (statsEl && filtered.length > 0) {
        const avg = Math.round(filtered.reduce((s, c) => s + c.score, 0) / filtered.length);
        const top = filtered.reduce((m, c) => c.score > m.score ? c : m, filtered[0]);
        const high = filtered.filter(c => c.score >= 75).length;
        statsEl.innerHTML = `
            <span class="results-stat">⌀ Ort: <strong>${avg}%</strong></span>
            <span class="results-stat">🏆 En iyi: <strong>${top.city} ${top.score}%</strong></span>
            <span class="results-stat">⭐ ${high} şehir 75%+</span>
        `;
    }

    const toShow = filtered.slice(0, 50);

    toShow.forEach((city, idx) => {
        const globalRank = allRenderedCities.indexOf(city) + 1;
        const card = document.createElement('div');
        card.className = 'result-card';
        card.dataset.cityIndex = allRenderedCities.indexOf(city);
        card.onclick = () => focusCity(city, allRenderedCities.indexOf(city));
        card.ondblclick = () => addToComparison(city);

        // Better color gradient: green for high, yellow for mid, red for low
        const hue = Math.min(120, (city.score / 100) * 140);
        const sat = city.score >= 80 ? 75 : city.score >= 60 ? 65 : 55;
        const gradient = `linear-gradient(90deg, hsl(${hue}, ${sat}%, 50%), hsl(${hue + 20}, ${sat + 10}%, 55%))`;

        const tagMap = {
            love: { label: '♀ Aşk', cls: 'love' }, career: { label: '☉ Kariyer', cls: 'career' },
            peace: { label: '☽ Huzur', cls: 'peace' }, luck: { label: '♃ Şans', cls: 'luck' },
            creativity: { label: '♆ Yaratıcılık', cls: 'creativity' }, adventure: { label: '♂ Macera', cls: 'energy' },
            growth: { label: '♇ Dönüşüm', cls: 'creativity' }, learning: { label: '☿ Öğrenme', cls: 'career' }
        };

        const tags = city.influences.slice(0, 3).map(inf => {
            const prefForPlanet = findPreferenceForPlanet(inf.planetKey);
            return prefForPlanet && tagMap[prefForPlanet]
                ? `<span class="result-tag ${tagMap[prefForPlanet].cls}">${tagMap[prefForPlanet].label}</span>`
                : `<span class="result-tag">${inf.symbol} ${inf.planet}</span>`;
        }).join('');

        const regionFlag = { tr: '🇹🇷', europe: '🇪🇺', asia: '🌏', americas: '🌎', africa: '🌍', oceania: '🌊' };
        const flag = regionFlag[city.region] || '';

        // Medal for top 3 within current view
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
        const rankDisplay = medal ? `${medal} #${globalRank}` : `#${globalRank}`;
        
        // Score tier styling
        const scoreTier = city.score >= 85 ? 'score-excellent' : city.score >= 70 ? 'score-good' : city.score >= 55 ? 'score-medium' : 'score-low';

        card.innerHTML = `
            <span class="result-rank">${rankDisplay}</span>
            <div class="result-city">${flag} ${city.city}</div>
            <div class="result-country">${city.country}</div>
            <div class="result-score">
                <div class="score-bar"><div class="score-fill" style="width:${city.score}%;background:${gradient};"></div></div>
                <span class="score-value ${scoreTier}">${city.score}%</span>
            </div>
            <div class="result-tags">${tags}</div>
            <div class="result-reason">${city.reason}</div>
        `;
        listEl.appendChild(card);
    });

    if (filtered.length > 50) {
        const more = document.createElement('div');
        more.style.cssText = 'text-align:center;padding:16px;color:var(--text-muted);font-size:12px;';
        more.textContent = `+ ${filtered.length - 50} şehir daha... (Arama veya filtre ile daralt)`;
        listEl.appendChild(more);
    }
}

function findPreferenceForPlanet(planetKey) {
    for (const pref of selectedPreferences) {
        const weights = AstroEngine.PREFERENCE_PLANET_WEIGHTS[pref] || {};
        if (weights[planetKey] > 0.5) return pref;
    }
    return null;
}

// ═══════════════════════════════════════
// FILTER & SEARCH
// ═══════════════════════════════════════
function filterResults() {
    currentSearch = document.getElementById('search-results').value;
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.toggle('hidden', !currentSearch);
    renderCityList(allRenderedCities);
}

function clearSearch() {
    const input = document.getElementById('search-results');
    input.value = '';
    currentSearch = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    input.focus();
    renderCityList(allRenderedCities);
}

function filterByRegion(chip) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.region;
    renderCityList(allRenderedCities);
}

let currentSort = 'score-desc';
function sortResults(sortBy) {
    currentSort = sortBy;
    renderCityList(allRenderedCities);
}

// ═══════════════════════════════════════
// NATAL SUMMARY
// ═══════════════════════════════════════
function renderNatalSummary() {
    const natal = results.natalChart;
    const el = document.getElementById('natal-summary');
    const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    let rows = '';
    for (const key of planetOrder) {
        const pos = natal[key];
        const planet = AstroEngine.PLANETS[key];
        rows += `<div class="natal-row"><span class="natal-planet">${planet.symbol} ${planet.name}</span><span class="natal-sign">${pos.sign} ${pos.degree.toFixed(1)}°</span></div>`;
    }
    el.innerHTML = `<h3>Gezegen Pozisyonların</h3>${rows}`;
}

// ═══════════════════════════════════════
// LINE TOGGLES
// ═══════════════════════════════════════
function renderLineToggles() {
    const el = document.getElementById('line-toggles');
    el.innerHTML = '';
    visiblePlanets.clear();
    for (const pref of selectedPreferences) {
        const weights = AstroEngine.PREFERENCE_PLANET_WEIGHTS[pref] || {};
        for (const [planet, weight] of Object.entries(weights)) {
            if (weight >= 0.5) visiblePlanets.add(planet);
        }
    }
    if (visiblePlanets.size === 0) ['sun', 'moon', 'venus', 'mars', 'jupiter'].forEach(p => visiblePlanets.add(p));

    const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    for (const key of planetOrder) {
        const p = AstroEngine.PLANETS[key];
        const checked = visiblePlanets.has(key) ? 'checked' : '';
        const toggle = document.createElement('label');
        toggle.className = 'line-toggle';
        toggle.innerHTML = `
            <input type="checkbox" ${checked} onchange="togglePlanetLine('${key}', this.checked)">
            <span class="line-toggle-color" style="background:${p.color}"></span>
            <span class="line-toggle-name">${p.symbol} ${p.name}</span>
            <span class="line-toggle-extra">${results.natalChart[key].sign}</span>
        `;
        el.appendChild(toggle);
    }
}

function togglePlanetLine(planetKey, show) {
    if (show) visiblePlanets.add(planetKey); else visiblePlanets.delete(planetKey);
    mapLines.forEach(l => map.removeLayer(l));
    mapLines = [];
    drawPlanetaryLines();
}

// ═══════════════════════════════════════
// TIMING
// ═══════════════════════════════════════
function renderTimingAnalysis() {
    const el = document.getElementById('timing-analysis');
    const transits = results.transits;
    if (!transits || transits.length === 0) {
        el.innerHTML = '<p style="color:var(--text-muted)">Şu an aktif önemli transit bulunamadı.</p>';
        return;
    }
    el.innerHTML = transits.map(t => {
        const qualityLabel = { good: 'Uygun', neutral: 'Nötr', challenging: 'Zorlayıcı', powerful: 'Güçlü' };
        const qualityClass = t.quality === 'good' ? 'good' : t.quality === 'challenging' ? 'challenging' : 'neutral';
        const advice = getMoveAdvice(t);
        return `
            <div class="timing-card">
                <div class="timing-header">
                    <span class="timing-icon">${t.transitPlanet.symbol}</span>
                    <span class="timing-title">${t.transitPlanet.name} ${t.aspect} ${t.natalPlanet.symbol} ${t.natalPlanet.name}</span>
                    <span class="timing-quality ${qualityClass}">${qualityLabel[t.quality] || t.quality}</span>
                </div>
                <div class="timing-desc">${t.description}. ${advice}</div>
                <div class="timing-date">Orb: ${t.exactness.toFixed(1)}°</div>
            </div>
        `;
    }).join('');
}

function getMoveAdvice(transit) {
    if (transit.transitKey === 'jupiter' && transit.quality === 'good') return 'Jüpiter transitin olumlu — yeni bir yere taşınmak için güzel bir dönem!';
    if (transit.transitKey === 'saturn' && transit.quality === 'challenging') return 'Satürn sabır istiyor. Büyük kararları aceleye getirme.';
    if (transit.transitKey === 'uranus') return 'Uranüs beklenmedik değişimler getirir. Sürprizlere hazır ol!';
    if (transit.transitKey === 'neptune') return 'Neptün hayalleri ve sezgileri güçlendirir.';
    if (transit.transitKey === 'pluto') return 'Plüton derin dönüşüm demek. Köklü değişimler kapıda.';
    if (transit.quality === 'good') return 'Bu transit taşınma kararlarını destekliyor.';
    return 'Bu transit farkındalık ve planlama dönemi.';
}

// ═══════════════════════════════════════
// COMPARISON
// ═══════════════════════════════════════
function addToComparison(city) {
    const compareBtn = document.querySelector('[data-tab="compare-tab"]');
    switchTab(compareBtn);
    if (!compareSlots[0]) compareSlots[0] = city;
    else if (!compareSlots[1]) compareSlots[1] = city;
    else { compareSlots[0] = compareSlots[1]; compareSlots[1] = city; }
    renderComparison();
    showToast(`${city.city} karşılaştırmaya eklendi`);
}

function clearComparison() {
    compareSlots = [null, null];
    renderComparison();
}

function renderComparison() {
    for (let i = 0; i < 2; i++) {
        const slot = document.getElementById(`compare-slot-${i}`);
        const city = compareSlots[i];
        if (city) {
            slot.className = 'compare-slot filled';
            slot.innerHTML = `<div class="slot-city">${city.city}</div><div class="slot-country">${city.country}</div><div class="slot-score">${city.score}%</div>`;
        } else {
            slot.className = 'compare-slot empty';
            slot.innerHTML = '<span>+ Şehir Ekle</span><small>Sonuç kartına çift tıkla</small>';
        }
    }

    const resultEl = document.getElementById('compare-result');
    if (compareSlots[0] && compareSlots[1]) {
        const a = compareSlots[0], b = compareSlots[1];
        const categories = [
            { label: 'Genel Uyum', aVal: a.score, bVal: b.score },
            { label: 'Astro Etki', aVal: Math.min(99, a.influences.length * 22), bVal: Math.min(99, b.influences.length * 22) },
            { label: 'Yaşam Tarzı', aVal: a.lifestyleMatch ? 88 : 45, bVal: b.lifestyleMatch ? 88 : 45 },
            { label: 'Vibe Uyumu', aVal: a.vibeMatch ? 85 : 40, bVal: b.vibeMatch ? 85 : 40 }
        ];
        const climateEmoji = { warm: '☀️ Sıcak', moderate: '🌤️ Ilıman', cold: '❄️ Soğuk' };
        const sizeEmoji = { mega: '🏙️ Metropol', medium: '🌆 Orta', small: '🏘️ Küçük' };

        resultEl.innerHTML = categories.map(c => `
            <div class="compare-row">
                <span class="compare-label">${c.label}</span>
                <div class="compare-bar-wrap">
                    <span class="compare-val" style="color:var(--accent)">${c.aVal}</span>
                    <div class="compare-bar left" style="width:${c.aVal}%"></div>
                    <div class="compare-bar right" style="width:${c.bVal}%"></div>
                    <span class="compare-val" style="color:var(--rose)">${c.bVal}</span>
                </div>
            </div>
        `).join('') + `
            <div class="compare-row">
                <span class="compare-label">İklim</span>
                <div class="compare-bar-wrap">
                    <span class="compare-val" style="font-size:11px">${climateEmoji[a.climate] || a.climate}</span>
                    <span style="flex:1"></span>
                    <span class="compare-val" style="font-size:11px">${climateEmoji[b.climate] || b.climate}</span>
                </div>
            </div>
            <div class="compare-row">
                <span class="compare-label">Boyut</span>
                <div class="compare-bar-wrap">
                    <span class="compare-val" style="font-size:11px">${sizeEmoji[a.size] || a.size}</span>
                    <span style="flex:1"></span>
                    <span class="compare-val" style="font-size:11px">${sizeEmoji[b.size] || b.size}</span>
                </div>
            </div>
        `;
    } else {
        resultEl.innerHTML = '';
    }
}

// ═══════════════════════════════════════
// SHARE
// ═══════════════════════════════════════
function shareResults() {
    const modal = document.getElementById('share-modal');
    modal.classList.remove('hidden');
    const top3 = allRenderedCities.slice(0, 3);
    document.getElementById('share-top3').innerHTML = top3.map((c, i) => `
        <div class="share-city-row">
            <span class="share-city-rank">${i + 1}</span>
            <div class="share-city-info"><div class="share-city-name">${c.city}</div><div class="share-city-country">${c.country}</div></div>
            <span class="share-city-score">${c.score}%</span>
        </div>
    `).join('');
    const natal = results.natalChart;
    document.getElementById('share-natal').textContent = `${natal.sun.sign} ☉ · ${natal.moon.sign} ☽ · ${natal.venus.sign} ♀`;
}

function downloadShareCard() {
    const el = document.getElementById('share-card-inner');
    if (typeof html2canvas === 'function') {
        html2canvas(el, { backgroundColor: '#0e0e2e', scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'astromap-sonuclarim.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        showToast('Ekran görüntüsü alınamadı.');
    }
}

// ═══════════════════════════════════════
// REPORT DOWNLOAD
// ═══════════════════════════════════════
function downloadReport() {
    if (!results) return;
    const top20 = allRenderedCities.slice(0, 20);
    const natal = results.natalChart;

    let text = '✦ ASTROMAP — KİŞİSEL LOKASYON RAPORU ✦\n';
    text += '═'.repeat(50) + '\n\n';
    text += `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n\n`;
    text += '🌌 DOĞUM HARİTASI\n' + '─'.repeat(30) + '\n';
    for (const key of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
        const p = AstroEngine.PLANETS[key];
        const pos = natal[key];
        text += `${p.symbol} ${p.name.padEnd(10)} ${pos.sign} ${pos.degree.toFixed(1)}°\n`;
    }
    text += '\n🏆 EN UYGUN 20 LOKASYON\n' + '─'.repeat(30) + '\n';
    top20.forEach((c, i) => {
        text += `\n#${(i + 1).toString().padStart(2)} ${c.city}, ${c.country} — %${c.score}\n    ${c.reason}\n`;
    });
    text += '\n⏱️ MEVCUT TRANSİTLER\n' + '─'.repeat(30) + '\n';
    (results.transits || []).forEach(t => {
        text += `${t.transitPlanet.symbol} ${t.transitPlanet.name} ${t.aspect} ${t.natalPlanet.symbol} ${t.natalPlanet.name} (${t.quality})\n`;
    });
    text += '\n\n✦ AstroMap ile oluşturuldu ✦\n';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = 'astromap-rapor.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('Rapor indirildi! 📄');
}

// ═══════════════════════════════════════
// MAP
// ═══════════════════════════════════════
function initMap() {
    if (map) { map.remove(); map = null; }
    map = L.map('map', { center: [30, 20], zoom: 2, minZoom: 2, maxZoom: 10, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);

    drawPlanetaryLines();
    addCityMarkers();

    const topCity = allRenderedCities[0];
    if (topCity) setTimeout(() => map.flyTo([topCity.lat, topCity.lon], 4, { duration: 1.5 }), 500);
}

function drawPlanetaryLines() {
    if (!results) return;
    for (const planetKey of visiblePlanets) {
        const planetLines = results.planetaryLines[planetKey];
        const planetInfo = AstroEngine.PLANETS[planetKey];
        if (!planetLines || !planetInfo) continue;

        const lineStyles = {
            mc: { weight: 2.5, opacity: 0.7, dashArray: null },
            ic: { weight: 2, opacity: 0.4, dashArray: '8,6' },
            asc: { weight: 2.5, opacity: 0.6, dashArray: null },
            dsc: { weight: 2, opacity: 0.4, dashArray: '4,8' }
        };

        for (const [lineType, points] of Object.entries(planetLines)) {
            if (points.length < 2) continue;
            const style = lineStyles[lineType] || { weight: 2, opacity: 0.5 };
            const line = L.polyline(points, {
                color: planetInfo.color, weight: style.weight, opacity: style.opacity,
                dashArray: style.dashArray, smoothFactor: 1.5
            }).addTo(map);
            line.bindTooltip(`${planetInfo.symbol} ${planetInfo.name} ${lineType.toUpperCase()}`, { sticky: true });
            mapLines.push(line);
        }
    }
}

function addCityMarkers() {
    if (!results) return;
    const top30 = allRenderedCities.slice(0, 30);
    top30.forEach((city, index) => {
        const isTop3 = index < 3;
        const markerSize = isTop3 ? 28 : 16;
        const markerClass = isTop3 ? 'astro-marker-top' : 'astro-marker';
        const icon = L.divIcon({
            className: markerClass, iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
            html: isTop3 ? `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;color:#ffd700;">${index + 1}</div>` : ''
        });
        const marker = L.marker([city.lat, city.lon], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(city, index));
        if (index === 0) marker.openPopup();
        marker.on('click', () => highlightCard(allRenderedCities.indexOf(city)));
        mapMarkers.push(marker);
    });
}

function createPopupContent(city, rank) {
    const tagLine = city.influences.slice(0, 2).map(i => `${i.symbol} ${i.planet} ${i.lineType}`).join(' · ');
    return `
        <div class="popup-city">#${rank + 1} ${city.city}</div>
        <div class="popup-score">Uyum: ${city.score}%</div>
        <div style="font-size:11px;color:#c9a0ff;margin-bottom:6px;">${tagLine}</div>
        <div class="popup-reason">${city.reason}</div>
    `;
}

// ═══════════════════════════════════════
// MAP LAYER TOGGLES
// ═══════════════════════════════════════
function toggleMapLayer(layer) {
    if (layer === 'markers') {
        showMarkers = !showMarkers;
        document.getElementById('toggle-markers').classList.toggle('active', showMarkers);
        mapMarkers.forEach(m => { if (showMarkers) m.addTo(map); else map.removeLayer(m); });
    } else if (layer === 'lines') {
        showLines = !showLines;
        document.getElementById('toggle-lines').classList.toggle('active', showLines);
        mapLines.forEach(l => { if (showLines) l.addTo(map); else map.removeLayer(l); });
    } else if (layer === 'heatmap') {
        showHeatmap = !showHeatmap;
        document.getElementById('toggle-heatmap').classList.toggle('active', showHeatmap);
        if (showHeatmap) addHeatmapCircles();
        else { mapHeatCircles.forEach(c => map.removeLayer(c)); mapHeatCircles = []; }
    }
}

function addHeatmapCircles() {
    mapHeatCircles.forEach(c => map.removeLayer(c));
    mapHeatCircles = [];
    allRenderedCities.slice(0, 50).forEach(city => {
        const radius = (city.score / 100) * 80000 + 20000;
        const opacity = (city.score / 100) * 0.3 + 0.05;
        const hue = (city.score / 100) * 120;
        const circle = L.circle([city.lat, city.lon], {
            radius, color: `hsl(${hue}, 70%, 50%)`, fillColor: `hsl(${hue}, 70%, 50%)`,
            fillOpacity: opacity, weight: 0, interactive: false
        }).addTo(map);
        mapHeatCircles.push(circle);
    });
}

// ═══════════════════════════════════════
// INTERACTIONS
// ═══════════════════════════════════════
function focusCity(city, index) {
    if (!map) return;
    map.flyTo([city.lat, city.lon], 6, { duration: 1 });
    for (const marker of mapMarkers) {
        const ll = marker.getLatLng();
        if (Math.abs(ll.lat - city.lat) < 0.01 && Math.abs(ll.lng - city.lon) < 0.01) {
            marker.openPopup(); break;
        }
    }
    highlightCard(index);
}

function highlightCard(index) {
    document.querySelectorAll('.result-card').forEach(card => {
        card.classList.toggle('highlighted', parseInt(card.dataset.cityIndex) === index);
    });
}

// ═══════════════════════════════════════
// AI TAROT — REAL CARD DRAWING CEREMONY
// ═══════════════════════════════════════
async function showTarot() {
    const birthDate = document.getElementById('tarot-birth-date').value;
    const question = document.getElementById('tarot-question').value;
    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }

    const sunSign = getSunSignFromDate(birthDate);
    const resultEl = document.getElementById('tarot-result');
    document.getElementById('tarot-form').style.display = 'none';
    resultEl.classList.remove('hidden');

    // Phase 1: Show the mystical card table with face-down cards
    resultEl.innerHTML = `
        <div class="tarot-ceremony">
            <div class="tarot-particles" id="tarot-particles"></div>
            <div class="tarot-table-title">
                <div class="tarot-glow-text">✦ Kartlar Karılıyor ✦</div>
                <p class="tarot-sub-msg">Enerjini kartlara yönlendir...</p>
            </div>
            <div class="tarot-deck" id="tarot-deck">
                <div class="tarot-card-slot" data-index="0">
                    <div class="tarot-card-3d">
                        <div class="tarot-face tarot-back">
                            <div class="tarot-back-design">
                                <div class="tarot-back-pattern"></div>
                                <span class="tarot-back-symbol">✦</span>
                            </div>
                        </div>
                        <div class="tarot-face tarot-front"></div>
                    </div>
                    <div class="tarot-slot-label">Geçmiş</div>
                </div>
                <div class="tarot-card-slot" data-index="1">
                    <div class="tarot-card-3d">
                        <div class="tarot-face tarot-back">
                            <div class="tarot-back-design">
                                <div class="tarot-back-pattern"></div>
                                <span class="tarot-back-symbol">✦</span>
                            </div>
                        </div>
                        <div class="tarot-face tarot-front"></div>
                    </div>
                    <div class="tarot-slot-label">Şimdi</div>
                </div>
                <div class="tarot-card-slot" data-index="2">
                    <div class="tarot-card-3d">
                        <div class="tarot-face tarot-back">
                            <div class="tarot-back-design">
                                <div class="tarot-back-pattern"></div>
                                <span class="tarot-back-symbol">✦</span>
                            </div>
                        </div>
                        <div class="tarot-face tarot-front"></div>
                    </div>
                    <div class="tarot-slot-label">Gelecek</div>
                </div>
            </div>
            <div class="tarot-ceremony-hint" id="tarot-hint">Kartlar hazırlanıyor...</div>
        </div>
    `;

    // Spawn particles
    spawnTarotParticles('tarot-particles');

    // Phase 2: Animate cards dealing from deck (staggered fly-in)
    const slots = resultEl.querySelectorAll('.tarot-card-slot');
    slots.forEach((slot, i) => {
        setTimeout(() => {
            slot.classList.add('dealt');
        }, 600 + i * 400);
    });

    try {
        const data = await callAI('tarot', { birthDate, sunSign, question });
        const cards = data.cards || [];
        const posEmojis = { 'Geçmiş': '⏳', 'Şimdi': '✨', 'Gelecek': '🔮' };

        // Phase 3: Cards are ready — prompt user to click
        document.getElementById('tarot-hint').textContent = '✦ Kartlarına tıkla ve çevir ✦';
        document.getElementById('tarot-hint').classList.add('hint-ready');

        // Fill card fronts with data
        slots.forEach((slot, i) => {
            const c = cards[i] || {};
            const front = slot.querySelector('.tarot-front');
            front.innerHTML = `
                <div class="tarot-front-content ${c.reversed ? 'reversed' : ''}">
                    <div class="tarot-position">${posEmojis[c.position] || '✦'} ${c.position}</div>
                    <div class="tarot-emoji">${c.emoji || '🃏'}</div>
                    <div class="tarot-name">${c.name || 'Kart'}${c.reversed ? ' ↺' : ''}</div>
                    <div class="tarot-meaning">${c.meaning || ''}</div>
                </div>
            `;

            // Click to flip
            slot.addEventListener('click', function flipHandler() {
                if (slot.classList.contains('flipped')) return;
                slot.classList.add('flipped');
                SoundFX.play('click');
                // Burst particles on flip
                createFlipBurst(slot);
                // Check if all flipped
                const allFlipped = [...slots].every(s => s.classList.contains('flipped'));
                if (allFlipped) {
                    launchCelebration(resultEl);
                    setTimeout(() => showTarotOverall(data, resultEl), 800);
                }
            });
        });

    } catch (err) {
        showAIError(resultEl, err.message);
        document.getElementById('tarot-form').style.display = '';
    }
}

function showTarotOverall(data, resultEl) {
    SoundFX.play('success');
    const overallEl = document.createElement('div');
    overallEl.className = 'tarot-overall animate-in';
    overallEl.innerHTML = `
        <div class="tarot-energy">
            <span class="energy-label">Baskın Enerji</span>
            <span class="energy-value">${data.energy || '✦'}</span>
        </div>
        <h3>Kartların Mesajı</h3>
        <p class="tarot-overall-text"></p>
        <div class="tarot-advice"><strong>💫 Tavsiye:</strong> <span class="tarot-advice-text"></span></div>
    `;
    resultEl.appendChild(overallEl);

    // Typewriter for the overall message
    const msgEl = overallEl.querySelector('.tarot-overall-text');
    const advEl = overallEl.querySelector('.tarot-advice-text');
    typewriterEffect(msgEl, data.overall || '', 20).then(() => {
        typewriterEffect(advEl, data.advice || '', 15);
    });

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn-ghost reset-btn animate-in';
    resetBtn.textContent = '🃏 Yeniden Çek';
    resetBtn.onclick = () => resetAIPage('tarot-form', 'tarot-result');
    resultEl.appendChild(resetBtn);
}

function spawnTarotParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const symbols = ['✦', '⭐', '✧', '◇', '⋆', '☆', '✵', '⊹'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('span');
        p.className = 'tarot-particle';
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 4 + 's';
        p.style.animationDuration = (3 + Math.random() * 4) + 's';
        p.style.fontSize = (8 + Math.random() * 14) + 'px';
        container.appendChild(p);
    }
}

function createFlipBurst(slot) {
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement('span');
        spark.className = 'flip-spark';
        const angle = (i / 12) * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        spark.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
        spark.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
        slot.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
    }
}

// ═══════════════════════════════════════
// AI CRYSTAL GUIDE — MYSTIC ANIMATION
// ═══════════════════════════════════════
async function showCrystalGuide() {
    const birthDate = document.getElementById('crystal-birth-date').value;
    const birthTime = document.getElementById('crystal-birth-time').value;
    const mood = document.getElementById('crystal-mood').value;
    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }

    const sunSign = getSunSignFromDate(birthDate);
    const resultEl = document.getElementById('crystal-result');
    document.getElementById('crystal-form').style.display = 'none';
    resultEl.classList.remove('hidden');

    // Crystal formation loading animation
    resultEl.innerHTML = `
        <div class="crystal-loading-scene">
            <div class="crystal-orbit">
                <div class="crystal-orb orb-1">💎</div>
                <div class="crystal-orb orb-2">🔮</div>
                <div class="crystal-orb orb-3">✨</div>
                <div class="crystal-orb orb-4">💠</div>
                <div class="crystal-orb orb-5">⭐</div>
            </div>
            <div class="crystal-center-gem">
                <span>💎</span>
            </div>
            <div class="crystal-loading-rings">
                <div class="crystal-ring ring-1"></div>
                <div class="crystal-ring ring-2"></div>
                <div class="crystal-ring ring-3"></div>
            </div>
            <p class="crystal-loading-msg">Kristallerin çağırılıyor...</p>
            <div class="crystal-energy-bar">
                <div class="crystal-energy-fill"></div>
            </div>
        </div>
    `;

    try {
        const data = await callAI('crystal-guide', { birthDate, sunSign, mood });
        SoundFX.play('mystic');
        const mc = data.mainCrystal || {};
        const support = data.supportCrystals || [];
        const chakra = data.chakra || {};
        const colors = data.colors || {};
        const med = data.meditation || {};

        // Remove loading, show results with staggered animations
        resultEl.innerHTML = `
            <div class="crystal-reveal">
                <div class="crystal-main-card stagger-1" style="border-color:${mc.color || 'var(--accent)'}">
                    <div class="crystal-main-glow"></div>
                    <div class="crystal-main-emoji">${mc.emoji || '💎'}</div>
                    <h2 class="crystal-main-name">${mc.name || 'Kristal'}</h2>
                    <p class="crystal-main-benefit">${mc.benefit || ''}</p>
                    <p class="crystal-main-use"><strong>Kullanım:</strong> ${mc.howToUse || ''}</p>
                </div>

                <div class="crystal-support-grid stagger-2">
                    ${support.map((s, i) => `
                        <div class="crystal-support-card" style="animation-delay:${0.8 + i * 0.15}s">
                            <span class="crystal-support-emoji">${s.emoji || '💎'}</span>
                            <strong>${s.name}</strong>
                            <p>${s.benefit}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="wellness-grid stagger-3">
                    <div class="wellness-card chakra-card" style="border-left: 4px solid ${chakra.color || 'var(--accent)'}">
                        <h4>🧘‍♀️ Çakra Odağı</h4>
                        <div class="wellness-value">${chakra.name || ''}</div>
                        <p>${chakra.tip || ''}</p>
                    </div>
                    <div class="wellness-card">
                        <h4>🎨 Renk Enerjisi</h4>
                        <div class="color-tips">
                            <span>👗 Giy: <strong>${colors.wear || ''}</strong></span>
                            <span>🏠 Evde: <strong>${colors.home || ''}</strong></span>
                            <span>🚫 Kaçın: <strong>${colors.avoid || ''}</strong></span>
                        </div>
                    </div>
                    <div class="wellness-card">
                        <h4>🧘 Meditasyon</h4>
                        <div class="wellness-value">${med.duration || '10 dk'}</div>
                        <p>${med.focus || ''}</p>
                        <div class="mantra">"${med.mantra || ''}"</div>
                    </div>
                    <div class="wellness-card">
                        <h4>🌿 Doğal Terapi</h4>
                        <p>🍵 ${data.tea || ''}</p>
                        <p>🕯️ ${data.oil || ''}</p>
                    </div>
                </div>

                <div class="crystal-ritual stagger-4">
                    <h3>🌙 Ay Ritüeli</h3>
                    <p>${data.moonRitual || ''}</p>
                </div>

                <div class="crystal-affirmation stagger-5">"${data.affirmation || ''}"</div>
                <button class="btn-ghost reset-btn stagger-6" onclick="resetAIPage('crystal-form','crystal-result')">💎 Tekrar Sor</button>
            </div>
        `;
    } catch (err) {
        showAIError(resultEl, err.message);
        document.getElementById('crystal-form').style.display = '';
    }
}

// ═══════════════════════════════════════
// AI DREAM INTERPRETATION — DREAMY ANIMATION
// ═══════════════════════════════════════
async function showDreamInterpretation() {
    const birthDate = document.getElementById('dream-birth-date').value;
    const dream = document.getElementById('dream-text').value;
    if (!dream || dream.trim().length < 10) { showToast('Lütfen rüyanı en az birkaç cümle anlat'); return; }

    const sunSign = getSunSignFromDate(birthDate);
    const resultEl = document.getElementById('dream-result');
    document.getElementById('dream-form').style.display = 'none';
    resultEl.classList.remove('hidden');

    // Dreamy loading
    resultEl.innerHTML = `
        <div class="dream-loading-scene">
            <div class="dream-clouds">
                <div class="dream-cloud c1">☁️</div>
                <div class="dream-cloud c2">✨</div>
                <div class="dream-cloud c3">☁️</div>
                <div class="dream-cloud c4">🌙</div>
                <div class="dream-cloud c5">⭐</div>
            </div>
            <div class="dream-eye">
                <div class="dream-eye-iris"></div>
            </div>
            <p class="dream-loading-msg">Rüyan yorumlanıyor...</p>
            <div class="dream-loading-dots"><span>.</span><span>.</span><span>.</span></div>
        </div>
    `;

    try {
        const data = await callAI('dream', { dream, sunSign });
        SoundFX.play('mystic');
        const symbols = data.symbols || [];
        resultEl.innerHTML = `
            <div class="dream-reveal">
                <div class="dream-header stagger-1">
                    <div class="dream-emotion">${data.emotion || '✨'}</div>
                    <h2 class="dream-title">${data.title || 'Rüya Yorumun'}</h2>
                </div>

                <div class="dream-interpretation stagger-2">
                    <p>${data.interpretation || ''}</p>
                </div>

                <div class="dream-symbols stagger-3">
                    <h3>🔮 Semboller</h3>
                    <div class="dream-symbols-grid">
                        ${symbols.map((s, i) => `
                            <div class="dream-symbol-card" style="animation-delay:${0.6 + i * 0.1}s">
                                <strong>${s.symbol}</strong>
                                <p>${s.meaning}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="dream-message stagger-4">
                    <h3>💫 Bilinçaltından Mesaj</h3>
                    <p>${data.message || ''}</p>
                </div>

                <div class="dream-advice stagger-5">
                    <div class="dream-advice-item"><strong>📝 Tavsiye:</strong> ${data.advice || ''}</div>
                    <div class="dream-advice-item"><strong>⚡ Bugün Yap:</strong> ${data.luckyAction || ''}</div>
                </div>

                <button class="btn-ghost reset-btn stagger-6" onclick="resetAIPage('dream-form','dream-result')">💭 Başka Rüya Yorumla</button>
            </div>
        `;
    } catch (err) {
        showAIError(resultEl, err.message);
        document.getElementById('dream-form').style.display = '';
    }
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initBirthCityDropdown();

    // Animate city count on landing
    const countEl = document.getElementById('city-count');
    if (countEl) {
        const total = CITY_DATABASE.ALL_CITIES.length;
        let cur = 0;
        const step = Math.ceil(total / 40);
        const interval = setInterval(() => {
            cur += step;
            if (cur >= total) { cur = total; clearInterval(interval); }
            countEl.textContent = cur;
        }, 30);
    }

    // Load moon calendar if on that page
    loadMoonCalendar();

    // Scroll-reveal animations
    initScrollReveal();

    // Feature card mouse-follow glow
    initFeatureCardGlow();

    // Floating hero particles
    initHeroParticles();

    // Magnetic button effect
    initMagneticButtons();

    // Smooth cursor trail
    initCursorTrail();

    // Navbar scroll progress
    initScrollProgress();

    // Smart navbar hide/show
    initSmartNavbar();

    // Back to top with progress ring
    initBackToTop();

    // Parallax starfield
    initParallaxStars();

    // Hero stats counter animation
    initHeroStatsAnimation();

    // Sound effects toggle
    initSoundToggle();

    // Keyboard shortcuts
    initKeyboardShortcuts();
    
    // Swipe navigation (mobile)
    initSwipeNavigation();
    
    // Theme system
    initThemeSystem();
    
    // Notification system 
    initNotificationBadges();
    
    // Accessibility
    initAccessibility();
    
    // Lazy images
    initLazyImages();
});

// ═══════════════════════════════════════
// MAGNETIC BUTTON EFFECT
// ═══════════════════════════════════════
function initMagneticButtons() {
    document.querySelectorAll('.btn-hero').forEach(btn => {
        btn.addEventListener('mousemove', throttle(e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
        }, 16), { passive: true });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ═══════════════════════════════════════
// CURSOR TRAIL (SUBTLE)
// ═══════════════════════════════════════
function initCursorTrail() {
    // Skip on mobile/touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail-container';
    document.body.appendChild(trail);
    const dots = [];
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('span');
        dot.className = 'cursor-trail-dot';
        dot.style.setProperty('--i', i);
        trail.appendChild(dot);
        dots.push({ el: dot, x: 0, y: 0 });
    }
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    function animate() {
        let x = mouseX, y = mouseY;
        dots.forEach((dot, i) => {
            dot.x += (x - dot.x) * (0.3 - i * 0.04);
            dot.y += (y - dot.y) * (0.3 - i * 0.04);
            dot.el.style.left = dot.x + 'px';
            dot.el.style.top = dot.y + 'px';
            x = dot.x; y = dot.y;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ═══════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    document.body.appendChild(bar);
    const updateProgress = throttle(() => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) : 0;
        bar.style.width = progress + '%';
    }, 16);
    window.addEventListener('scroll', updateProgress, { passive: true });
}

// ═══════════════════════════════════════
// TYPEWRITER EFFECT
// ═══════════════════════════════════════
function typewriterEffect(element, text, speed = 18) {
    return new Promise(resolve => {
        element.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'typewriter-text';
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        element.appendChild(span);
        element.appendChild(cursor);
        let i = 0;
        function type() {
            if (i < text.length) {
                span.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => cursor.remove(), 1500);
                resolve();
            }
        }
        type();
    });
}

// ═══════════════════════════════════════
// SMART NAVBAR (HIDE ON SCROLL DOWN)
// ═══════════════════════════════════════
function initSmartNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let lastScroll = 0;
    const threshold = 80;
    const onScroll = throttle(() => {
        const currentScroll = window.scrollY;
        if (currentScroll > threshold) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
        if (currentScroll > lastScroll && currentScroll > 300) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ═══════════════════════════════════════
// BACK TO TOP WITH PROGRESS RING
// ═══════════════════════════════════════
function initBackToTop() {
    const btn = document.createElement('div');
    btn.className = 'back-to-top';
    btn.innerHTML = `
        <svg class="btt-progress" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24"></circle>
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 19V5M5 12l7-7 7 7" style="stroke:var(--accent)"/>
        </svg>
    `;
    document.body.appendChild(btn);
    const circle = btn.querySelector('.btt-progress circle');
    const circumference = 2 * Math.PI * 24; // ~150.8
    circle.style.strokeDasharray = circumference;

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const updateBTT = throttle(() => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        circle.style.strokeDashoffset = circumference - (progress * circumference);
        btn.classList.toggle('visible', scrollTop > 400);
    }, 16);
    window.addEventListener('scroll', updateBTT, { passive: true });
}

// ═══════════════════════════════════════
// PARALLAX STARFIELD MOUSE TRACKING
// ═══════════════════════════════════════
function initParallaxStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const onMove = throttle((e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        canvas.style.transform = `translate(${x * -15}px, ${y * -10}px) scale(1.05)`;
    }, 16);
    hero.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', () => {
        canvas.style.transform = '';
    });
    canvas.style.transition = 'transform 0.3s ease-out';
}

// ═══════════════════════════════════════
// HERO STATS COUNTER ANIMATION
// ═══════════════════════════════════════
function initHeroStatsAnimation() {
    const stats = document.querySelectorAll('.hero-stat span');
    if (!stats.length) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const spans = entry.target.querySelectorAll('span');
                spans.forEach(span => {
                    const target = parseInt(span.textContent);
                    if (isNaN(target) || span.dataset.animated) return;
                    span.dataset.animated = 'true';
                    const duration = 1500;
                    const start = performance.now();
                    function animCount(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        span.textContent = Math.round(eased * target);
                        if (progress < 1) requestAnimationFrame(animCount);
                    }
                    requestAnimationFrame(animCount);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll('.hero-stats').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════
// SOUND EFFECTS SYSTEM
// ═══════════════════════════════════════
const SoundFX = {
    enabled: false,
    ctx: null,
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    play(type) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch(type) {
            case 'click':
                osc.frequency.setValueAtTime(600, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
                osc.type = 'sine';
                osc.start(); osc.stop(this.ctx.currentTime + 0.12);
                break;
            case 'reveal':
                osc.frequency.setValueAtTime(400, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                osc.type = 'sine';
                osc.start(); osc.stop(this.ctx.currentTime + 0.5);
                break;
            case 'success':
                const notes = [523, 659, 784];
                notes.forEach((freq, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.connect(g); g.connect(this.ctx.destination);
                    o.frequency.value = freq;
                    o.type = 'sine';
                    g.gain.setValueAtTime(0.05, this.ctx.currentTime + i * 0.12);
                    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.3);
                    o.start(this.ctx.currentTime + i * 0.12);
                    o.stop(this.ctx.currentTime + i * 0.12 + 0.3);
                });
                break;
            case 'mystic':
                osc.frequency.setValueAtTime(220, this.ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.6);
                osc.frequency.linearRampToValueAtTime(330, this.ctx.currentTime + 1.0);
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
                osc.type = 'triangle';
                osc.start(); osc.stop(this.ctx.currentTime + 1.2);
                break;
        }
    },
    toggle() {
        if (!this.ctx) this.init();
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

function initSoundToggle() {
    const btn = document.createElement('div');
    btn.className = 'sound-toggle muted';
    btn.innerHTML = '🔇';
    btn.title = 'Ses Efektleri';
    btn.addEventListener('click', () => {
        const on = SoundFX.toggle();
        btn.innerHTML = on ? '🔊' : '🔇';
        btn.classList.toggle('muted', !on);
        if (on) SoundFX.play('click');
        showToast(on ? '🔊 Ses efektleri açıldı' : '🔇 Ses efektleri kapatıldı');
    });
    document.body.appendChild(btn);
}

// ═══════════════════════════════════════
// CELEBRATION CONFETTI
// ═══════════════════════════════════════
function launchCelebration(container) {
    const celebEl = document.createElement('div');
    celebEl.className = 'celebration-container';
    container.appendChild(celebEl);
    const colors = ['#c9a0ff', '#ff6b9d', '#ffd76e', '#6ee7c8', '#4fa0ff', '#ff8fb8'];
    const emojis = ['✦', '⭐', '💫', '✨', '🌟', '⋆'];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('span');
        p.className = 'confetti-piece';
        const isEmoji = Math.random() > 0.6;
        if (isEmoji) {
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.fontSize = (12 + Math.random() * 16) + 'px';
        } else {
            p.style.width = (6 + Math.random() * 6) + 'px';
            p.style.height = (4 + Math.random() * 8) + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
        }
        p.style.left = Math.random() * 100 + '%';
        p.style.setProperty('--fall-delay', Math.random() * 0.8 + 's');
        p.style.setProperty('--fall-duration', (2 + Math.random() * 2) + 's');
        p.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        p.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
        celebEl.appendChild(p);
    }
    setTimeout(() => celebEl.remove(), 4000);
}

// ═══════════════════════════════════════
// SCROLL REVEAL — IntersectionObserver
// ═══════════════════════════════════════
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '.feature-card, .testimonial-card, .pricing-card, .about-step-card, .about-section, .section-title, .home-cta h2, .faq-item'
    );
    revealTargets.forEach(el => el.classList.add('sr-hidden'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('sr-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════
// FEATURE CARD MOUSE-FOLLOW GLOW
// ═══════════════════════════════════════
function initFeatureCardGlow() {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', throttle(e => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width * 100);
            const y = ((e.clientY - rect.top) / rect.height * 100);
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        }, 16), { passive: true });
    });
}

// ═══════════════════════════════════════
// FLOATING HERO PARTICLES
// ═══════════════════════════════════════
function initHeroParticles() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;
    const container = document.createElement('div');
    container.className = 'hero-float-particles';
    hero.parentElement.appendChild(container);

    const symbols = ['✦', '⭐', '✧', '◇', '⋆', '☆'];
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('span');
        p.className = 'hero-particle';
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 6 + 's';
        p.style.animationDuration = (4 + Math.random() * 6) + 's';
        p.style.fontSize = (8 + Math.random() * 12) + 'px';
        container.appendChild(p);
    }
}

// ═══════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════
function initKeyboardShortcuts() {
    KeyboardShortcuts.register('1', 'Ana Sayfa', () => navigateTo('home'));
    KeyboardShortcuts.register('2', 'Günlük Yorum', () => navigateTo('daily'));
    KeyboardShortcuts.register('3', 'Uyum Testi', () => navigateTo('compatibility'));
    KeyboardShortcuts.register('4', 'Ay Takvimi', () => navigateTo('moon'));
    KeyboardShortcuts.register('5', 'AI Tarot', () => navigateTo('tarot'));
    KeyboardShortcuts.register('6', 'Kristal Rehberi', () => navigateTo('crystal'));
    KeyboardShortcuts.register('7', 'Rüya Yorumu', () => navigateTo('dream'));
    KeyboardShortcuts.register('escape', 'Modalları Kapat', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    });
    KeyboardShortcuts.register('/', 'Kısayolları Göster', () => showShortcutsPanel());
    KeyboardShortcuts.register('s', 'Ses Aç/Kapa', () => {
        const btn = document.querySelector('.sound-toggle');
        if (btn) btn.click();
    });
    KeyboardShortcuts.register('t', 'Tema Değiştir', () => cycleTheme());
    KeyboardShortcuts.init();
}

function showShortcutsPanel() {
    const existing = document.getElementById('shortcuts-panel');
    if (existing) { existing.remove(); return; }
    
    const panel = document.createElement('div');
    panel.id = 'shortcuts-panel';
    panel.className = 'shortcuts-panel';
    
    const shortcuts = KeyboardShortcuts.getAll();
    let html = '<div class="shortcuts-inner"><h3>⌨️ Klavye Kısayolları</h3><div class="shortcuts-grid">';
    for (const [key, { description }] of Object.entries(shortcuts)) {
        html += `<div class="shortcut-item"><kbd>${key.toUpperCase()}</kbd><span>${description}</span></div>`;
    }
    html += '</div><p class="shortcuts-hint">Kapatmak için <kbd>/</kbd> veya <kbd>ESC</kbd></p></div>';
    panel.innerHTML = html;
    panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
    document.body.appendChild(panel);
}

// ═══════════════════════════════════════
// SWIPE NAVIGATION (MOBILE)
// ═══════════════════════════════════════
function initSwipeNavigation() {
    if (!('ontouchstart' in window)) return;
    
    const pages = ['home', 'daily', 'compatibility', 'moon', 'tarot', 'crystal', 'dream', 'about', 'pricing'];
    let startX = 0, startY = 0, startTime = 0;
    
    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const dt = Date.now() - startTime;
        
        // Fast horizontal swipe (>80px, <300ms, more horizontal than vertical)
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 300) {
            const currentIdx = pages.indexOf(currentPage);
            if (dx < 0 && currentIdx < pages.length - 1) {
                // Swipe left → next page
                navigateTo(pages[currentIdx + 1]);
                if (navigator.vibrate) navigator.vibrate(15);
            } else if (dx > 0 && currentIdx > 0) {
                // Swipe right → previous page
                navigateTo(pages[currentIdx - 1]);
                if (navigator.vibrate) navigator.vibrate(15);
            }
        }
    }, { passive: true });
}

// ═══════════════════════════════════════
// THEME SYSTEM (3 COSMIC THEMES)
// ═══════════════════════════════════════
const themes = {
    cosmic: {
        name: 'Kozmik Gece',
        icon: '🌌',
        vars: {
            '--bg': '#07071a',
            '--bg-card': 'rgba(255,255,255,0.03)',
            '--surface': 'rgba(255,255,255,0.04)',
            '--border': 'rgba(255,255,255,0.06)',
            '--accent': '#c9a0ff',
            '--accent-light': '#dfc4ff',
            '--accent-dark': '#8b5fbf',
            '--rose': '#ff6b9d',
            '--gold': '#ffd76e',
            '--teal': '#6ee7c8',
            '--text': '#e8e0f0',
            '--text-muted': 'rgba(232,224,240,0.6)'
        }
    },
    aurora: {
        name: 'Kuzey Işıkları',
        icon: '🌌',
        vars: {
            '--bg': '#050d1a',
            '--bg-card': 'rgba(100,255,218,0.03)',
            '--surface': 'rgba(100,255,218,0.05)',
            '--border': 'rgba(100,255,218,0.08)',
            '--accent': '#64ffda',
            '--accent-light': '#a8ffec',
            '--accent-dark': '#3db89e',
            '--rose': '#ff6b9d',
            '--gold': '#ffd76e',
            '--teal': '#64ffda',
            '--text': '#e0f5f0',
            '--text-muted': 'rgba(224,245,240,0.6)'
        }
    },
    nebula: {
        name: 'Nebula Pembesi',
        icon: '🌸',
        vars: {
            '--bg': '#110718',
            '--bg-card': 'rgba(255,107,157,0.03)',
            '--surface': 'rgba(255,107,157,0.05)',
            '--border': 'rgba(255,107,157,0.08)',
            '--accent': '#ff6b9d',
            '--accent-light': '#ffa0c0',
            '--accent-dark': '#c44d78',
            '--rose': '#ff6b9d',
            '--gold': '#ffc857',
            '--teal': '#c9a0ff',
            '--text': '#f0e0ea',
            '--text-muted': 'rgba(240,224,234,0.6)'
        }
    }
};

let currentTheme = localStorage.getItem('astromap_theme') || 'cosmic';

function initThemeSystem() {
    applyTheme(currentTheme);
    
    // Theme toggle button
    const btn = document.createElement('div');
    btn.className = 'theme-toggle';
    btn.title = 'Tema Değiştir';
    btn.innerHTML = themes[currentTheme].icon;
    btn.addEventListener('click', () => cycleTheme());
    document.body.appendChild(btn);
}

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    const root = document.documentElement;
    for (const [prop, val] of Object.entries(theme.vars)) {
        root.style.setProperty(prop, val);
    }
    document.body.dataset.theme = themeName;
    currentTheme = themeName;
    localStorage.setItem('astromap_theme', themeName);
}

function cycleTheme() {
    const keys = Object.keys(themes);
    const idx = keys.indexOf(currentTheme);
    const next = keys[(idx + 1) % keys.length];
    applyTheme(next);
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.innerHTML = themes[next].icon;
        btn.style.transform = 'scale(1.3) rotate(360deg)';
        setTimeout(() => btn.style.transform = '', 500);
    }
    showToast(`${themes[next].icon} ${themes[next].name} teması aktif`);
    SoundFX.play('click');
}

// ═══════════════════════════════════════
// NOTIFICATION BADGES
// ═══════════════════════════════════════
function initNotificationBadges() {
    // Show "Yeni" badge on features not yet visited
    const visited = JSON.parse(localStorage.getItem('astromap_visited') || '[]');
    const newPages = ['tarot', 'crystal', 'dream'].filter(p => !visited.includes(p));
    
    newPages.forEach(pageId => {
        const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (link && !link.querySelector('.nav-new-badge')) {
            const badge = document.createElement('span');
            badge.className = 'nav-new-badge';
            badge.textContent = 'Yeni';
            link.appendChild(badge);
        }
    });
}

// ═══════════════════════════════════════
// ACCESSIBILITY IMPROVEMENTS
// ═══════════════════════════════════════
function initAccessibility() {
    // Add ARIA roles
    document.querySelector('.navbar')?.setAttribute('role', 'navigation');
    document.querySelector('.nav-links')?.setAttribute('role', 'menubar');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.setAttribute('role', 'menuitem');
        link.setAttribute('tabindex', '0');
        link.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });
    });
    
    // Announce page changes to screen readers
    let liveRegion = document.getElementById('sr-announcer');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-announcer';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    // Focus management on modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    });
    
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = '#page-home';
    skipLink.textContent = 'İçeriğe Atla';
    document.body.prepend(skipLink);
    
    // Reduce motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduced-motion');
    }
}

// ═══════════════════════════════════════
// LAZY IMAGE LOADING
// ═══════════════════════════════════════
function initLazyImages() {
    if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imgObserver.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });
        document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    }
}

// ═══════════════════════════════════════
// ENHANCED TOAST QUEUE SYSTEM
// ═══════════════════════════════════════
const toastQueue = [];
let toastActive = false;

const _originalShowToast = typeof showToast === 'function' ? showToast : null;

function showQueuedToast(msg, duration = 3000) {
    toastQueue.push({ msg, duration });
    if (!toastActive) processToastQueue();
}

function processToastQueue() {
    if (toastQueue.length === 0) { toastActive = false; return; }
    toastActive = true;
    const { msg, duration } = toastQueue.shift();
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => processToastQueue(), 300);
        }, duration);
    }
}
