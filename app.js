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
// ANALYTICS SCAFFOLD
// ═══════════════════════════════════════
const Analytics = {
    events: [],
    track(event, data = {}) {
        const entry = {
            event,
            data,
            ts: Date.now(),
            page: window.location.hash || 'home',
            session: this._sessionId
        };
        this.events.push(entry);
        // Keep max 500 events in memory
        if (this.events.length > 500) this.events.shift();
        // Debug mode
        if (localStorage.getItem('astromap_debug')) {
            console.log(`📊 Analytics: ${event}`, data);
        }
        // Send to analytics backend (fire-and-forget)
        const _ab = (window.__ASTROMAP_CONFIG?.isNative && window.__ASTROMAP_CONFIG?.apiBase) || '';
        fetch(_ab + '/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        }).catch(() => {}); // Silent fail
    },
    _sessionId: 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    getSummary() {
        const counts = {};
        this.events.forEach(e => { counts[e.event] = (counts[e.event] || 0) + 1; });
        return { total: this.events.length, counts, session: this._sessionId };
    }
};

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
    
    get(endpoint, body, ignoreExpiry = false) {
        try {
            const key = this._key(endpoint, body);
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (!ignoreExpiry && Date.now() - ts > this.ttl) {
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
// XSS SANITIZATION (DOMPurify)
// ═══════════════════════════════════════
function sanitize(html) {
    if (typeof DOMPurify !== 'undefined') return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b','i','em','strong','br','p','span','div','ul','ol','li','h1','h2','h3','h4','small','a'], ALLOWED_ATTR: ['style','class','href'] });
    // Fallback: strip all HTML tags
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Safe innerHTML setter - always sanitizes AI content
function safeHTML(el, html) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    el.innerHTML = sanitize(html);
}

// Recursively sanitize all string fields in an AI response object
function sanitizeData(obj) {
    if (!obj) return obj;
    if (typeof obj === 'string') return sanitize(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeData);
    if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = sanitizeData(v);
        return out;
    }
    return obj;
}

// ═══════════════════════════════════════
// REDUCED MOTION SUPPORT (JS)
// ═══════════════════════════════════════
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = prefersReducedMotion.matches;
prefersReducedMotion.addEventListener('change', (e) => {
    reducedMotion = e.matches;
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
});

// ═══════════════════════════════════════
// LOCAL STORAGE AUTH SYSTEM
// ═══════════════════════════════════════
const AuthSystem = {
    _key: 'astromap_user',
    _historyKey: 'astromap_history',
    _favKey: 'astromap_favorites',

    getUser() {
        try { return JSON.parse(localStorage.getItem(this._key)); } catch { return null; }
    },

    isLoggedIn() { return !!this.getUser(); },

    async login(email, password) {
        const users = this._getAllUsers();
        const user = users.find(u => u.email === email);
        if (!user) throw new Error('Bu e-posta ile kayıtlı hesap bulunamadı');
        const hashed = await this._hash(password);
        if (user.password !== hashed) throw new Error('Yanlış şifre');
        const session = { ...user, password: undefined, loginAt: Date.now() };
        localStorage.setItem(this._key, JSON.stringify(session));
        return session;
    },

    async signup(name, email, password, birthDate) {
        const users = this._getAllUsers();
        if (users.find(u => u.email === email)) throw new Error('Bu e-posta zaten kayıtlı');
        const hashed = await this._hash(password);
        const user = { id: 'u_' + Date.now(), name, email, password: hashed, birthDate, createdAt: Date.now(), plan: 'free' };
        users.push(user);
        localStorage.setItem('astromap_users', JSON.stringify(users));
        const session = { ...user, password: undefined, loginAt: Date.now() };
        localStorage.setItem(this._key, JSON.stringify(session));
        return session;
    },

    logout() {
        localStorage.removeItem(this._key);
        this.updateUI();
    },

    updateUI() {
        const user = this.getUser();
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;
        if (user) {
            navActions.innerHTML = `
                <span class="nav-user-name" title="${user.email}">✦ ${user.name?.split(' ')[0] || 'Kullanıcı'}</span>
                <button class="btn-ghost" onclick="navigateTo('dashboard')" type="button">📊 Dashboard</button>
                <button class="btn-ghost" onclick="AuthSystem.logout();showToast('\u00c7ıkış yapıldı')" type="button">Çıkış</button>
            `;
        } else {
            navActions.innerHTML = `
                <button class="btn-ghost" data-modal="login-modal" type="button">Giriş Yap</button>
                <button class="btn-nav-primary" data-modal="signup-modal" type="button">Ücretsiz Başla</button>
            `;
        }
    },

    // AI history tracking
    addToHistory(type, data) {
        try {
            const history = JSON.parse(localStorage.getItem(this._historyKey) || '[]');
            history.unshift({ type, data: typeof data === 'string' ? data : JSON.stringify(data).slice(0, 200), date: new Date().toISOString() });
            if (history.length > 50) history.length = 50;  // Keep last 50
            localStorage.setItem(this._historyKey, JSON.stringify(history));
        } catch { /* quota */ }
    },

    getHistory() {
        try { return JSON.parse(localStorage.getItem(this._historyKey) || '[]'); } catch { return []; }
    },

    // Favorite cities
    toggleFavorite(city) {
        try {
            const favs = JSON.parse(localStorage.getItem(this._favKey) || '[]');
            const idx = favs.findIndex(f => f.city === city.city && f.country === city.country);
            if (idx >= 0) { favs.splice(idx, 1); } else { favs.push({ city: city.city, country: city.country, score: city.score, region: city.region }); }
            localStorage.setItem(this._favKey, JSON.stringify(favs));
            return idx < 0;  // true = added, false = removed
        } catch { return false; }
    },

    getFavorites() {
        try { return JSON.parse(localStorage.getItem(this._favKey) || '[]'); } catch { return []; }
    },

    isFavorite(cityName) {
        return this.getFavorites().some(f => f.city === cityName);
    },

    _getAllUsers() {
        try { return JSON.parse(localStorage.getItem('astromap_users') || '[]'); } catch { return []; }
    },

    async _hash(str) {
        // SHA-256 via SubtleCrypto — much stronger than simple checksum
        // NOTE: For production, use server-side bcrypt/argon2 with proper salting
        try {
            const encoder = new TextEncoder();
            const salt = 'astromap_v4_salt_'; // Static salt — use per-user salt in production
            const data = encoder.encode(salt + str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return 'h2_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
        } catch {
            // Fallback for environments without SubtleCrypto
            let hash = 0;
            const salted = 'astromap_v4_' + str;
            for (let i = 0; i < salted.length; i++) {
                const char = salted.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return 'h_' + Math.abs(hash).toString(36);
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
let lifestyleChoices = { climate: 'moderate', size: 'medium', nature: 'urban', region: 'any' };
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
    Analytics.track('page_view', { page: pageId });
    SoundFX.play('click');
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show target with animation
    const target = document.getElementById('page-' + pageId) || document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile nav
    closeMobileNav();

    currentPage = pageId;
    window.scrollTo(0, 0);

    // Load page data
    if (pageId === 'moon') loadMoonCalendar();
    if (pageId === 'retrograde') loadRetrogradeCalendar();
    if (pageId === 'dashboard') loadDashboard();
    
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
// FREEMIUM USAGE LIMITER
// ═══════════════════════════════════════
const UsageLimiter = {
    _key: 'astromap_daily_usage',
    FREE_DAILY_LIMIT: 3,

    _getToday() {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    },

    _getData() {
        try {
            const raw = JSON.parse(localStorage.getItem(this._key) || '{}');
            if (raw.date !== this._getToday()) return { date: this._getToday(), count: 0 };
            return raw;
        } catch { return { date: this._getToday(), count: 0 }; }
    },

    getRemaining() {
        const user = AuthSystem.getUser();
        if (user && (user.plan === 'premium' || user.plan === 'vip')) return Infinity;
        return Math.max(0, this.FREE_DAILY_LIMIT - this._getData().count);
    },

    consume() {
        const user = AuthSystem.getUser();
        if (user && (user.plan === 'premium' || user.plan === 'vip')) return true;
        const data = this._getData();
        if (data.count >= this.FREE_DAILY_LIMIT) return false;
        data.count++;
        localStorage.setItem(this._key, JSON.stringify(data));
        return true;
    },

    canUse() {
        return this.getRemaining() > 0;
    }
};

// ═══════════════════════════════════════
// PREMIUM CHECK
// ═══════════════════════════════════════
// ═══════════════════════════════════════
// DARK/LIGHT MODE TOGGLE
// ═══════════════════════════════════════
function toggleDarkLight() {
    const btn = document.getElementById('dark-toggle');
    if (currentTheme === 'moonlight') {
        // Switch back to previous theme or cosmic
        const prev = localStorage.getItem('astromap_theme_prev') || 'cosmic';
        applyTheme(prev);
        currentTheme = prev;
        localStorage.setItem('astromap_theme', prev);
        if (btn) btn.textContent = '🌙';
    } else {
        // Save current and switch to moonlight
        localStorage.setItem('astromap_theme_prev', currentTheme);
        applyTheme('moonlight');
        currentTheme = 'moonlight';
        localStorage.setItem('astromap_theme', 'moonlight');
        if (btn) btn.textContent = '☀️';
    }
    // Update theme panel if open
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === currentTheme);
    });
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) toggleBtn.innerHTML = themes[currentTheme]?.icon || '';
}

function isPremiumUser() {
    const user = AuthSystem.getUser();
    return user && (user.plan === 'premium' || user.plan === 'vip');
}

// ═══════════════════════════════════════
// AI API HELPER
// ═══════════════════════════════════════
async function callAI(endpoint, body, useCache = true) {
    Analytics.track('ai_request', { endpoint });
    // Check cache first
    if (useCache) {
        const cached = AICache.get(endpoint, body);
        if (cached) {
            console.log(`✦ AI Cache hit: ${endpoint}`);
            return cached;
        }
    }

    // Freemium limit check (cache hits don't count)
    if (!UsageLimiter.canUse()) {
        throw new Error(`Günlük ücretsiz AI hakkın doldu (${UsageLimiter.FREE_DAILY_LIMIT}/${UsageLimiter.FREE_DAILY_LIMIT}). Premium'a geç veya yarın tekrar dene!`);
    }
    UsageLimiter.consume();
    
    let res;
    const apiBase = (window.__ASTROMAP_CONFIG?.isNative && window.__ASTROMAP_CONFIG?.apiBase) || '';
    try {
        res = await fetch(apiBase + '/api/' + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (networkErr) {
        // Offline fallback: try to serve stale cache
        const staleCache = AICache.get(endpoint, body, true); // true = ignore TTL
        if (staleCache) {
            console.log(`✦ Offline fallback: ${endpoint} (stale cache)`);
            staleCache._offline = true;
            return staleCache;
        }
        throw new Error('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.');
    }

    // Check content type before parsing
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error('AI özellikleri için uygulamayı localhost:3000 üzerinden açın. (GitHub Pages sadece statik içerik sunar)');
    }

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'AI isteği başarısız');
    
    // Sanitize all string fields in AI response to prevent XSS
    const sanitized = sanitizeData(data.data);
    
    // Cache the response
    if (useCache) AICache.set(endpoint, body, sanitized);

    // Track in history
    AuthSystem.addToHistory(endpoint, body);
    
    return sanitized;
}

function showAILoading(container, message) {
    container.classList.remove('hidden');
    const remaining = UsageLimiter.getRemaining();
    const limitText = remaining === Infinity ? '' : `<p class="ai-loading-sub" style="opacity:0.6;font-size:12px">Kalan hak: ${remaining}/${UsageLimiter.FREE_DAILY_LIMIT}</p>`;
    container.innerHTML = `
        <div class="ai-loading">
            <div class="ai-loading-spinner"></div>
            <p class="ai-loading-text">${message || 'AI yanıt hazırlıyor...'}</p>
            <p class="ai-loading-sub">Bu birkaç saniye sürebilir</p>
            ${limitText}
        </div>
    `;
}

function showAIError(container, msg) {
    const isLimitError = msg && msg.includes('hakkın doldu');
    container.innerHTML = `
        <div class="ai-error">
            <span class="ai-error-icon">${isLimitError ? '🔒' : '⚠️'}</span>
            <p>${msg || 'Bir hata oluştu. Lütfen tekrar dene.'}</p>
            ${isLimitError ? `<button class="btn-primary" onclick="navigateTo('pricing')" style="margin-top:12px">Premium'a Gec</button>` : ''}
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
    // Parse YYYY-MM-DD directly to avoid timezone issues
    const parts = dateStr.split('-');
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!month || !day) return null;
    const signs = [
        [1, 20, 'Kova'],    [2, 19, 'Balık'],   [3, 21, 'Koç'],
        [4, 20, 'Boğa'],    [5, 21, 'İkizler'], [6, 21, 'Yengeç'],
        [7, 23, 'Aslan'],   [8, 23, 'Başak'],    [9, 23, 'Terazi'],
        [10, 23, 'Akrep'],  [11, 22, 'Yay'],     [12, 22, 'Oğlak']
    ];
    // Each entry: [startMonth, startDay, signName]
    // e.g. Kova starts Jan 20, Balık starts Feb 19, etc.
    for (let i = signs.length - 1; i >= 0; i--) {
        const [sm, sd] = signs[i];
        if (month > sm || (month === sm && day >= sd)) return signs[i][2];
    }
    return 'Oğlak'; // Dec 22 - Jan 19
}

function toggleMobileNav() {
    const navLinks = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.nav-hamburger');
    const overlay = document.getElementById('nav-overlay');
    const isOpen = navLinks.classList.toggle('open');

    if (isOpen) {
        navbar.classList.add('menu-open');
        hamburger.textContent = '✕';
        hamburger.classList.add('is-active');
        if (overlay) overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        // Lift navbar above overlay so drawer is visible
        navbar.style.zIndex = '10001';
        // Force drawer visibility (belt-and-suspenders for mobile)
        navLinks.style.cssText = `
            transform: translateX(0) !important;
            display: flex !important;
            flex-direction: column !important;
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 300px !important;
            max-width: 85vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            z-index: 10002 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: rgba(7,7,26,0.98) !important;
            border-left: 1px solid rgba(255,255,255,0.08) !important;
            box-shadow: -8px 0 32px rgba(0,0,0,0.4) !important;
            padding: 0 !important;
            gap: 0 !important;
            flex-wrap: nowrap !important;
        `;
        // Show drawer header & actions
        const header = navLinks.querySelector('.nav-drawer-header');
        if (header) header.style.display = 'flex';
        const actions = navLinks.querySelector('.nav-drawer-actions');
        if (actions) actions.style.display = 'flex';
        // Make links visible
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.style.display = 'flex';
            link.style.padding = '14px 20px';
            link.style.fontSize = '15px';
            link.style.minHeight = '48px';
            link.style.overflow = 'visible';
            link.style.whiteSpace = 'normal';
            link.style.flexShrink = '0';
        });
        if (overlay) overlay.onclick = closeMobileNav;
    } else {
        closeMobileNav();
    }
}

function closeMobileNav() {
    const navLinks = document.getElementById('nav-links');
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.nav-hamburger');
    const overlay = document.getElementById('nav-overlay');

    if (navLinks) {
        navLinks.classList.remove('open');
        // Clear forced inline styles — let CSS take over
        navLinks.style.cssText = '';
        const header = navLinks.querySelector('.nav-drawer-header');
        if (header) header.style.display = '';
        const actions = navLinks.querySelector('.nav-drawer-actions');
        if (actions) actions.style.display = '';
        navLinks.querySelectorAll('.nav-link').forEach(link => { link.style.cssText = ''; });
    }
    if (navbar) { navbar.classList.remove('menu-open'); navbar.style.zIndex = ''; }
    if (hamburger) {
        hamburger.textContent = '☰';
        hamburger.classList.remove('is-active');
    }
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

function closeMobileNavOutside(e) {
    const navLinks = document.getElementById('nav-links');
    const hamburger = document.querySelector('.nav-hamburger');
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileNav();
    }
}

// Astro app step navigation
function startApp() { navigateToStep('step-birth'); }

// ═══════════════════════════════════════
// SIGN-BASED RECOMMENDATIONS
// ═══════════════════════════════════════
const PREF_LABELS = {
    love: 'Aşk & İlişki', career: 'Kariyer & Başarı', peace: 'Huzur & Yuva',
    luck: 'Şans & Bolluk', creativity: 'Yaratıcılık & Sanat', growth: 'Dönüşüm & Güç',
    adventure: 'Macera & Enerji', learning: 'Öğrenme & İletişim'
};

const SIGN_SYMBOLS = {
    'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
    'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
    'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

function showSignRecommendation() {
    const birthDate = document.getElementById('birth-date')?.value;
    if (!birthDate) return;
    const sunSign = getSunSignFromDate(birthDate);
    if (!sunSign) return;

    const rec = AstroEngine.getSignRecommendations(sunSign);
    if (!rec) return;

    const banner = document.getElementById('sign-recommendation-banner');
    if (!banner) return;

    document.getElementById('sign-rec-icon').textContent = SIGN_SYMBOLS[sunSign] || '✦';
    document.getElementById('sign-rec-title').textContent = `${sunSign} burcuna göre önerilen:`;
    document.getElementById('sign-rec-prefs').textContent = rec.prefs.map(p => PREF_LABELS[p] || p).join(' & ');
    banner.classList.remove('hidden');

    // Store for later use
    banner.dataset.recPrefs = JSON.stringify(rec.prefs);
    banner.dataset.recClimate = rec.climate;
    banner.dataset.recSize = rec.size;
    banner.dataset.recNature = rec.nature;
}

function applySignRecommendation() {
    const banner = document.getElementById('sign-recommendation-banner');
    if (!banner) return;

    const recPrefs = JSON.parse(banner.dataset.recPrefs || '[]');
    const recClimate = banner.dataset.recClimate || 'any';
    const recSize = banner.dataset.recSize || 'any';
    const recNature = banner.dataset.recNature || 'any';

    // Apply preference selections
    selectedPreferences = [...recPrefs];
    document.querySelectorAll('.pref-card').forEach(card => {
        card.classList.toggle('selected', recPrefs.includes(card.dataset.pref));
    });

    // Apply lifestyle choices
    lifestyleChoices = { climate: recClimate, size: recSize, nature: recNature, region: 'any' };

    // Pre-select lifestyle buttons for when user sees that step
    setTimeout(() => {
        document.querySelectorAll('.option-btn').forEach(btn => {
            const group = btn.dataset.group;
            const value = btn.dataset.value;
            if (group && lifestyleChoices[group] === value) {
                document.querySelectorAll(`.option-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            }
        });
    }, 100);

    banner.classList.add('hidden');
    showToast('Burca göre tercihler uygulandı ✦');

    // Skip to lifestyle step (preferences already set)
    goToStep('step-lifestyle');
}

function dismissSignRecommendation() {
    const banner = document.getElementById('sign-recommendation-banner');
    if (banner) banner.classList.add('hidden');
}

function goToStep(stepId) {
    navigateToStep(stepId);
    if (stepId === 'step-preferences') showSignRecommendation();
}

function navigateToStep(stepId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(stepId);
    if (el) el.classList.add('active');
    // Clear nav active state
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Hide floating toggles on results page (they overlap sidebar actions)
    document.body.classList.toggle('results-active', stepId === 'step-results');
    window.scrollTo(0, 0);
}

// Mobile list/map view toggle
function toggleMobileView(view) {
    const sidebar = document.querySelector('.results-sidebar');
    const mapWrap = document.querySelector('.results-map-wrap');
    const btns = document.querySelectorAll('.view-toggle-btn');
    btns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'map') {
        sidebar.style.display = 'none';
        mapWrap.style.display = 'block';
        if (map) setTimeout(() => map.invalidateSize(), 100);
    } else {
        sidebar.style.display = '';
        mapWrap.style.display = '';
    }
}

function resetApp() {
    selectedPreferences = [];
    lifestyleChoices = { climate: 'moderate', size: 'medium', nature: 'urban', region: 'any' };
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
    document.body.classList.remove('results-active');
    navigateTo('home');
}

// ═══════════════════════════════════════
// STARS ANIMATION
// ═══════════════════════════════════════
function initStars() {
    if (reducedMotion) return;  // Respect prefers-reduced-motion
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
    let shootingStarIntervalId = setInterval(createShootingStar, 6000);

    // Pause animations when page is not visible
    let starsAnimId = null;
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
        starsAnimId = requestAnimationFrame(animate);
    }
    starsAnimId = requestAnimationFrame(animate);

    // Pause when tab is hidden to save CPU/battery
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (starsAnimId) { cancelAnimationFrame(starsAnimId); starsAnimId = null; }
            clearInterval(shootingStarIntervalId);
            shootingStarIntervalId = null;
        } else {
            if (!starsAnimId) starsAnimId = requestAnimationFrame(animate);
            if (!shootingStarIntervalId) shootingStarIntervalId = setInterval(createShootingStar, 6000);
        }
    });
    window.addEventListener('resize', resize);
}

// ═══════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════
window.addEventListener('scroll', throttle(() => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
}, 100), { passive: true });

// ═══════════════════════════════════════
// NAVBAR EVENT DELEGATION (robust click handling)
// ═══════════════════════════════════════
// Uses event delegation on the navbar — catches clicks on all nav children regardless of inline onclick
(function initNavbarDelegation() {
    let navbarInitialized = false; // Guard against double-init

    function setupNavbar() {
        if (navbarInitialized) return; // Prevent duplicate handlers
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        navbarInitialized = true;

        let lastTouchTime = 0;
        let touchStartY = 0;
        let touchStartX = 0;
        const SCROLL_THRESHOLD = 10; // px — finger moved more than this = scroll, not tap

        // Track touch start position to distinguish scroll from tap
        navbar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (touch) { touchStartY = touch.clientY; touchStartX = touch.clientX; }
        }, { passive: true, capture: true });

        function handleNavAction(e) {
            const now = Date.now();
            if (now - lastTouchTime < 300 && e.type === 'click') return;

            // For touchend: check if finger moved (scroll) — if so, ignore
            if (e.type === 'touchend') {
                lastTouchTime = now;
                const touch = e.changedTouches?.[0];
                if (touch) {
                    const dx = Math.abs(touch.clientX - touchStartX);
                    const dy = Math.abs(touch.clientY - touchStartY);
                    if (dx > SCROLL_THRESHOLD || dy > SCROLL_THRESHOLD) return; // Was a scroll, not a tap
                }
            }

            const target = e.target.closest('[data-nav]');
            const modalBtn = e.target.closest('[data-modal]');
            const hamburger = e.target.closest('.nav-hamburger, #nav-hamburger');

            if (hamburger) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof toggleMobileNav === 'function') toggleMobileNav();
                return;
            }

            if (target) {
                e.preventDefault();
                e.stopPropagation();
                const pageId = target.getAttribute('data-nav');
                if (pageId && typeof navigateTo === 'function') navigateTo(pageId);
                return;
            }

            if (modalBtn) {
                e.preventDefault();
                e.stopPropagation();
                const modalId = modalBtn.getAttribute('data-modal');
                if (modalId && typeof openModal === 'function') openModal(modalId);
                return;
            }
        }

        // Capture phase click handler — maximum reliability
        navbar.addEventListener('click', handleNavAction, true);

        // Touch handler for mobile — prevent 300ms delay
        navbar.addEventListener('touchend', handleNavAction, { passive: false, capture: true });
    }

    // Try immediately (scripts at bottom of body, DOM likely ready)
    if (document.getElementById('navbar')) {
        setupNavbar();
    }
    // Also try after DOMContentLoaded as safety net
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavbar);
    }
})();

// ═══════════════════════════════════════
// MODALS
// ═══════════════════════════════════════
function openModal(id) { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }

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
// AUTH (Real localStorage auth)
// ═══════════════════════════════════════
async function handleLogin(e) {
    e.preventDefault();
    try {
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value;
        if (!email || !password) { showToast('Lütfen tüm alanları doldurun'); return; }
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Giriş yapılıyor...'; }
        const user = await AuthSystem.login(email, password);
        showToast(`Hoş geldin, ${user.name}! ✨`);
        closeModal('login-modal');
        AuthSystem.updateUI();
        SoundFX.play('success');
    } catch (err) {
        showToast(err.message);
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = false; btn.textContent = 'Giriş Yap'; }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    try {
        const form = e.target;
        const inputs = form.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const birthDate = inputs[1].value;
        const email = inputs[2].value.trim();
        const password = inputs[3].value;
        if (!name || !email || !password) { showToast('Lütfen tüm alanları doldurun'); return; }
        if (password.length < 6) { showToast('Şifre en az 6 karakter olmalı'); return; }
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Hesap oluşturuluyor...'; }
        const user = await AuthSystem.signup(name, email, password, birthDate);
        showToast(`Hesabın oluşturuldu! Hoş geldin, ${user.name} ✨`);
        closeModal('signup-modal');
        AuthSystem.updateUI();
        SoundFX.play('success');
    } catch (err) {
        showToast(err.message);
    } finally {
        const btn = e.target.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = false; btn.textContent = 'Ücretsiz Başla'; }
    }
}

function socialLogin(provider) {
    showToast(`${provider === 'google' ? 'Google' : 'Apple'} ile giriş yakında aktif olacak ✨`);
}

// ═══════════════════════════════════════
// PRICING
// ═══════════════════════════════════════
function toggleBilling() {
    const toggle = document.getElementById('billing-toggle');
    if (!toggle) return;
    const isYearly = toggle.checked;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const cls = (id, cls, on) => { const el = document.getElementById(id); if (el) el.classList.toggle(cls, on); };
    cls('lbl-monthly', 'active', !isYearly);
    cls('lbl-yearly', 'active', isYearly);
    set('price-premium', isYearly ? '₺490' : '₺49');
    set('period-premium', isYearly ? '/yıl' : '/ay');
    set('price-vip', isYearly ? '₺990' : '₺99');
    set('period-vip', isYearly ? '/yıl' : '/ay');
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
    SoundFX.play('click');
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
        const apiBase = (window.__ASTROMAP_CONFIG?.isNative && window.__ASTROMAP_CONFIG?.apiBase) || '';
        const response = await fetch(apiBase + '/api/checkout/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: currentCheckoutPlan,
                billing: { name, email, phone }
            })
        });

        const ct = response.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            throw new Error('Ödeme sistemi şu an kullanılamıyor. localhost:3000 üzerinden açın.');
        }
        const data = await response.json();

        if (data.success && data.checkoutFormContent) {
            // Render iyzico checkout form
            const container = document.getElementById('iyzico-checkout-form');
            container.innerHTML = '';

            // Create a div and inject iyzico's checkout form HTML+JS
            const formDiv = document.createElement('div');
            formDiv.innerHTML = data.checkoutFormContent;
            container.appendChild(formDiv);

            // Execute any scripts in the injected content (validate iyzico domain)
            const trustedDomains = ['iyzipay.com', 'iyzico.com'];
            const scripts = formDiv.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    try {
                        const srcHost = new URL(oldScript.src).hostname;
                        if (!trustedDomains.some(d => srcHost === d || srcHost.endsWith('.' + d))) {
                            console.warn('Blocked untrusted checkout script:', oldScript.src);
                            return;
                        }
                    } catch { return; }
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });

            SoundFX.play('success');
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
        const plan = params.get('plan') || 'premium';
        showToast(`Ödeme başarılı! ${amount ? '₺' + amount + ' alındı.' : ''} ${plan === 'vip' ? 'VIP' : 'Premium'} aktif ✨`, 5000);
        SoundFX.play('success');

        // Activate premium in local session
        const user = AuthSystem.getUser();
        if (user) {
            user.plan = plan;
            user.planActivatedAt = new Date().toISOString();
            localStorage.setItem(AuthSystem._key, JSON.stringify(user));
            AuthSystem.updateUI();
        }

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
            SoundFX.play('success');
            if (typeof launchCelebration === 'function') launchCelebration();
        }
        closeCheckout();
    }
});

// ═══════════════════════════════════════
// QUICK COSMIC ENERGY DISPLAY
// ═══════════════════════════════════════
function showQuickEnergy() {
    const now = new Date();
    const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`;
    const timeStr = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
    const positions = AstroEngine.calculatePlanetPositions(
        AstroEngine.toJulianDay(dateStr, timeStr)
    );

    // Calculate cosmic energy score from planetary aspects
    const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn'];
    let harmonyScore = 50;
    const aspects = [];
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            let diff = Math.abs(positions[planets[i]].degree - positions[planets[j]].degree);
            if (diff > 180) diff = 360 - diff;
            if (Math.abs(diff - 120) < 8) { harmonyScore += 8; aspects.push({ p1: planets[i], p2: planets[j], type: 'Trigon ✦', good: true }); }
            else if (Math.abs(diff - 60) < 6) { harmonyScore += 5; aspects.push({ p1: planets[i], p2: planets[j], type: 'Sekstil ✧', good: true }); }
            else if (Math.abs(diff) < 8) { harmonyScore += 3; aspects.push({ p1: planets[i], p2: planets[j], type: 'Kavuşum ●', good: true }); }
            else if (Math.abs(diff - 90) < 6) { harmonyScore -= 4; aspects.push({ p1: planets[i], p2: planets[j], type: 'Kare ■', good: false }); }
            else if (Math.abs(diff - 180) < 7) { harmonyScore -= 3; aspects.push({ p1: planets[i], p2: planets[j], type: 'Karşıt ◆', good: false }); }
        }
    }
    harmonyScore = Math.max(10, Math.min(100, harmonyScore));

    const moonSign = positions.moon.sign;
    const moonDms = positions.moon.dmsStr || positions.moon.degree.toFixed(1) + '°';
    const energyLevel = harmonyScore > 75 ? 'Yüksek ⚡⚡⚡' : harmonyScore > 50 ? 'Orta ⚡⚡' : 'Düşük ⚡';
    const energyColor = harmonyScore > 75 ? '#6ee7c8' : harmonyScore > 50 ? '#ffd76e' : '#ff6b9d';
    const goodAspects = aspects.filter(a => a.good).slice(0, 3);
    const badAspects = aspects.filter(a => !a.good).slice(0, 2);

    const popup = document.createElement('div');
    popup.className = 'popup-overlay energy-popup';
    popup.innerHTML = `
        <div class="popup-content energy-content" style="max-width:440px">
            <button class="popup-close" onclick="this.closest('.popup-overlay').remove()">✕</button>
            <h2 style="text-align:center;margin-bottom:8px">⚡ Günün Kozmik Enerjisi</h2>
            <p style="text-align:center;color:var(--text-muted);font-size:13px;margin-bottom:20px">
                ${now.toLocaleDateString('tr-TR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:48px;font-weight:800;color:${energyColor}">${harmonyScore}</div>
                <div style="font-size:16px;color:${energyColor};font-weight:600">${energyLevel}</div>
            </div>
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px">
                <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">🌙 Ay Pozisyonu</div>
                <div style="font-size:15px;font-weight:600">${positions.moon.signSymbol} ${moonSign} ${moonDms}</div>
            </div>
            ${goodAspects.length ? `
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px">
                <div style="font-size:13px;color:var(--teal,#6ee7c8);margin-bottom:8px">✦ Uyumlu Açılar</div>
                ${goodAspects.map(a => `<div style="font-size:13px;padding:3px 0">${AstroEngine.PLANETS[a.p1].symbol} ${AstroEngine.PLANETS[a.p1].name} — ${AstroEngine.PLANETS[a.p2].symbol} ${AstroEngine.PLANETS[a.p2].name} <span style="color:var(--teal,#6ee7c8)">${a.type}</span></div>`).join('')}
            </div>` : ''}
            ${badAspects.length ? `
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:14px">
                <div style="font-size:13px;color:var(--rose,#ff6b9d);margin-bottom:8px">⚠️ Gerilimli Açılar</div>
                ${badAspects.map(a => `<div style="font-size:13px;padding:3px 0">${AstroEngine.PLANETS[a.p1].symbol} ${AstroEngine.PLANETS[a.p1].name} — ${AstroEngine.PLANETS[a.p2].symbol} ${AstroEngine.PLANETS[a.p2].name} <span style="color:var(--rose,#ff6b9d)">${a.type}</span></div>`).join('')}
            </div>` : ''}
            <button class="btn-primary" style="width:100%" onclick="this.closest('.popup-overlay').remove();navigateTo('daily')">🌟 Detaylı Günlük Yorum</button>
        </div>
    `;
    popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
    document.body.appendChild(popup);
    SoundFX.play('reveal');
}

// Initialize energy badge on home page
function updateQuickEnergyBadge() {
    const badge = document.getElementById('quick-energy-badge');
    if (!badge || typeof AstroEngine === 'undefined') return;
    try {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const positions = AstroEngine.calculatePlanetPositions(AstroEngine.toJulianDay(dateStr, '12:00'));
        const moonPhaseIcon = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][Math.floor((positions.moon.degree / 360) * 8) % 8];
        badge.textContent = `${moonPhaseIcon} ${positions.moon.signSymbol} ${positions.moon.sign}`;
        badge.style.display = 'block';
    } catch(e) { /* silent */ }
}
document.addEventListener('DOMContentLoaded', () => setTimeout(updateQuickEnergyBadge, 500));

// ═══════════════════════════════════════
// DAILY HOROSCOPE — AI POWERED (daily / weekly / monthly)
// ═══════════════════════════════════════
let selectedHoroscopePeriod = 'daily';

function selectPeriod(btn) {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedHoroscopePeriod = btn.dataset.period || 'daily';
}

async function showDailyHoroscope() {
    const name = document.getElementById('daily-name').value;
    const gender = document.getElementById('daily-gender').value;
    const birthDate = document.getElementById('daily-birth-date').value;
    const birthTime = document.getElementById('daily-birth-time').value;
    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }
    if (!name) { showToast('Lütfen adını gir'); return; }
    if (!gender) { showToast('Lütfen cinsiyetini seç'); return; }

    const period = selectedHoroscopePeriod || 'daily';
    const periodLabel = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık' }[period] || 'Günlük';
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
        const data = await callAI('daily-horoscope', { name, gender, birthDate, birthTime, sunSign, period });
        SoundFX.play('reveal');
        const h = data;
        const scores = h.scores || {};

        el.innerHTML = `
            <div class="daily-reveal">
                <div class="daily-card stagger-1">
                    <div class="daily-sign-header">
                        <div class="daily-sign-aura"></div>
                        <span class="daily-sign-icon">${signEmoji}</span>
                        <div class="daily-sign-name">${name} • ${sunSign}</div>
                        <div class="daily-period-badge">${periodLabel} Yorum</div>
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
                <div class="ai-result-actions stagger-6">
                    <button class="btn-ghost reset-btn" onclick="resetAIPage('daily-form','daily-result')">🌟 Tekrar Sor</button>
                    <button class="btn-ghost share-btn" onclick="shareAIResult('daily-result','Günlük Burç')">📸 Paylaş</button>
                </div>
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

                <div class="ai-result-actions stagger-6">
                    <button class="btn-ghost reset-btn" onclick="resetAIPage('compat-form','compat-result')">💕 Tekrar Dene</button>
                    <button class="btn-ghost share-btn" onclick="shareAIResult('compat-result','Uyumluluk')">📸 Paylaş</button>
                </div>
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

    // Generate monthly calendar with moon phases
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const mondayFirst = firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday-first

    const monthName = today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    const phaseEmojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];

    let calendarDays = '';
    // Empty cells before first day
    for (let i = 0; i < mondayFirst; i++) calendarDays += '<div class="moon-cal-day empty"></div>';
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayMoon = AstroEngine.calculateMoonPhase(date);
        const isToday = d === today.getDate();
        calendarDays += `
            <div class="moon-cal-day${isToday ? ' today' : ''}">
                <span class="moon-cal-num">${d}</span>
                <span class="moon-cal-icon">${dayMoon.phaseEmoji}</span>
            </div>`;
    }

    // Phase cycle strip
    const phaseCycle = [
        { emoji: '🌑', name: 'Yeni Ay', desc: 'Niyet koy, tohum ek' },
        { emoji: '🌒', name: 'Hilal', desc: 'Planlara başla' },
        { emoji: '🌓', name: 'İlk Dördün', desc: 'Harekete geç' },
        { emoji: '🌔', name: 'Dolunay\u0027a Doğru', desc: 'İvme kazan' },
        { emoji: '🌕', name: 'Dolunay', desc: 'Hasat zamanı' },
        { emoji: '🌖', name: 'Azalan Ay', desc: 'Paylaş, minnetle' },
        { emoji: '🌗', name: 'Son Dördün', desc: 'Bırak, affet' },
        { emoji: '🌘', name: 'Balsamic Ay', desc: 'Dinlen, huzur bul' }
    ];
    const currentPhaseIdx = phaseEmojis.indexOf(moon.phaseEmoji);

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

        <div class="moon-phase-cycle">
            <h3>🔄 Ay Fazı Döngüsü</h3>
            <div class="moon-cycle-strip">
                ${phaseCycle.map((p, i) => `
                    <div class="moon-cycle-item${i === currentPhaseIdx ? ' active' : ''}">
                        <span class="moon-cycle-emoji">${p.emoji}</span>
                        <span class="moon-cycle-name">${p.name}</span>
                        <span class="moon-cycle-desc">${p.desc}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="moon-calendar-section">
            <h3>📅 ${monthName}</h3>
            <div class="moon-cal-grid">
                <div class="moon-cal-header">Pzt</div>
                <div class="moon-cal-header">Sal</div>
                <div class="moon-cal-header">Çar</div>
                <div class="moon-cal-header">Per</div>
                <div class="moon-cal-header">Cum</div>
                <div class="moon-cal-header">Cmt</div>
                <div class="moon-cal-header">Paz</div>
                ${calendarDays}
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
    const select = document.getElementById('birth-city');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterBirthCities(e.target.value));
    }
    if (select && searchInput) {
        const syncInput = () => {
            const opt = select.options[select.selectedIndex];
            if (opt && !opt.disabled) searchInput.value = opt.textContent;
        };
        select.addEventListener('change', syncInput);
        select.addEventListener('click', syncInput);
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
    if (!btn) return;
    const tabId = btn.dataset.tab;
    if (!tabId) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.add('active');
}

// ═══════════════════════════════════════
// CALCULATE
// ═══════════════════════════════════════
// Wizard user info (shared across wizard)
let wizardName = '';
let wizardGender = 'other';

function calculateResults() {
    const birthDate = document.getElementById('birth-date').value;
    const birthTime = document.getElementById('birth-time').value;
    const birthCity = document.getElementById('birth-city').value;
    wizardName = document.getElementById('wizard-name')?.value?.trim() || '';
    wizardGender = document.getElementById('wizard-gender')?.value || 'other';

    if (!birthDate) { showToast('Lütfen doğum tarihini gir'); return; }

    const displayName = wizardName || 'Sevgili Gezgin';

    document.getElementById('loading-overlay').classList.remove('hidden');
    const bar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    const loadingSub = document.getElementById('loading-sub');

    bar.style.width = '10%';
    loadingText.textContent = `${displayName}, gezegen pozisyonların hesaplanıyor...`;
    loadingSub.textContent = `${CITY_DATABASE.ALL_CITIES.length} şehir analiz ediliyor`;

    setTimeout(() => { bar.style.width = '35%'; loadingText.textContent = 'Astrokartografi çizgileri çiziliyor...'; }, 400);
    setTimeout(() => { bar.style.width = '65%'; loadingText.textContent = `${displayName}, şehirler puanlanıyor...`; }, 800);
    setTimeout(() => { bar.style.width = '85%'; loadingText.textContent = 'Transit analizleri yapılıyor...'; }, 1200);

    setTimeout(() => {
        results = AstroEngine.calculate(birthDate, birthTime, birthCity, selectedPreferences, lifestyleChoices);
        results.wizardName = wizardName;
        results.wizardGender = wizardGender;
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
    const name = results.wizardName || '';
    const intro = name
        ? `${name}, ${sunSign} güneşin ve ${moonSign} ayın ile ${CITY_DATABASE.ALL_CITIES.length} şehri analiz ettik:`
        : `${sunSign} güneşi ve ${moonSign} ayı ile ${CITY_DATABASE.ALL_CITIES.length} şehri analiz ettik:`;
    document.getElementById('results-intro').textContent = intro;
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

    const isMobile = window.innerWidth <= 768;
    const initialBatch = isMobile ? 15 : 50;
    const toShow = filtered.slice(0, initialBatch);

    // Use DocumentFragment for batch DOM insertion (prevents reflow per card)
    const fragment = document.createDocumentFragment();

    toShow.forEach((city, idx) => {
        const globalRank = allRenderedCities.indexOf(city) + 1;
        const card = createCityCard(city, idx, globalRank);
        fragment.appendChild(card);
    });

    listEl.appendChild(fragment);

    // Lazy-load more cards on scroll (mobile optimization)
    if (filtered.length > initialBatch) {
        const loadMore = document.createElement('button');
        loadMore.className = 'btn-ghost load-more-btn';
        loadMore.style.cssText = 'width:100%;margin:12px 0;padding:12px;font-size:13px;';
        loadMore.textContent = `+ ${filtered.length - initialBatch} şehir daha göster`;
        loadMore.onclick = function() {
            loadMore.textContent = 'Yükleniyor...';
            // Render remaining in small batches to prevent freeze
            const remaining = filtered.slice(initialBatch);
            let batchIdx = 0;
            const batchSize = isMobile ? 10 : 30;
            function renderBatch() {
                const batch = remaining.slice(batchIdx, batchIdx + batchSize);
                if (batch.length === 0) { loadMore.remove(); return; }
                const frag = document.createDocumentFragment();
                batch.forEach((city, i) => {
                    const idx = initialBatch + batchIdx + i;
                    const globalRank = allRenderedCities.indexOf(city) + 1;
                    const card = createCityCard(city, idx, globalRank);
                    frag.appendChild(card);
                });
                listEl.insertBefore(frag, loadMore);
                batchIdx += batchSize;
                if (batchIdx >= remaining.length) { loadMore.remove(); }
                else {
                    loadMore.textContent = `+ ${remaining.length - batchIdx} şehir daha göster`;
                    if (!isMobile) requestAnimationFrame(renderBatch);
                }
            }
            renderBatch();
        };
        listEl.appendChild(loadMore);
    }
}

const _tagMap = {
    love: { label: '♀ Aşk', cls: 'love' }, career: { label: '☉ Kariyer', cls: 'career' },
    peace: { label: '☽ Huzur', cls: 'peace' }, luck: { label: '♃ Şans', cls: 'luck' },
    creativity: { label: '♆ Yaratıcılık', cls: 'creativity' }, adventure: { label: '♂ Macera', cls: 'energy' },
    growth: { label: '♇ Dönüşüm', cls: 'creativity' }, learning: { label: '☿ Öğrenme', cls: 'career' }
};
const _regionFlag = { tr: '🇹🇷', europe: '🇪🇺', asia: '🌏', americas: '🌎', africa: '🌍', oceania: '🌊' };

function createCityCard(city, idx, globalRank) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.dataset.cityIndex = allRenderedCities.indexOf(city);
    card.onclick = () => focusCity(city, allRenderedCities.indexOf(city));
    card.ondblclick = () => addToComparison(city);

    const hue = Math.min(120, (city.score / 100) * 140);
    const sat = city.score >= 80 ? 75 : city.score >= 60 ? 65 : 55;
    const gradient = `linear-gradient(90deg, hsl(${hue}, ${sat}%, 50%), hsl(${hue + 20}, ${sat + 10}%, 55%))`;

    const tags = city.influences.slice(0, 3).map(inf => {
        const prefForPlanet = findPreferenceForPlanet(inf.planetKey);
        return prefForPlanet && _tagMap[prefForPlanet]
            ? `<span class="result-tag ${_tagMap[prefForPlanet].cls}">${_tagMap[prefForPlanet].label}</span>`
            : `<span class="result-tag">${inf.symbol} ${inf.planet}</span>`;
    }).join('');

    const flag = _regionFlag[city.region] || '';
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
    const rankDisplay = medal ? `${medal} #${globalRank}` : `#${globalRank}`;
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
        <button class="btn-city-detail" onclick="event.stopPropagation();showCityDetail('${city.city.replace(/'/g,"\\'")}','${city.country.replace(/'/g,"\\'")}',${city.score},'${(city.influences||[]).map(i=>i.planet).join(", ")}')">✨ AI Detay</button>
    `;
    return card;
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
// NATAL SUMMARY — Zodiac Wheel (astro.com style)
// ═══════════════════════════════════════
function renderNatalSummary() {
    const natal = results.natalChart;
    const houses = results.houses;
    const aspects = results.natalAspects || [];
    const el = document.getElementById('natal-summary');
    const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    // ── Build SVG Zodiac Wheel ──
    const svgHtml = buildZodiacWheel(natal, houses, aspects, planetOrder);

    // ── Build planet positions table ──
    let rows = '';
    for (const key of planetOrder) {
        const pos = natal[key];
        const planet = AstroEngine.PLANETS[key];
        const dmsStr = pos.dmsStr || pos.degree.toFixed(1) + '°';
        rows += `<div class="natal-row">
            <span class="natal-planet"><span style="color:${planet.color}">${planet.symbol}</span> ${planet.name}</span>
            <span class="natal-sign">${pos.signSymbol} ${pos.sign} ${dmsStr}</span>
        </div>`;
    }

    // House cusps table
    let houseRows = '';
    if (houses && houses.cusps) {
        const romanNums = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
        for (let i = 0; i < 12; i++) {
            const lon = houses.cusps[i];
            const signIdx = Math.floor(lon / 30);
            const deg = lon % 30;
            const sign = AstroEngine.SIGNS[signIdx];
            const totalSec = Math.round(deg * 3600);
            const s = totalSec % 60;
            const m = Math.floor(totalSec / 60) % 60;
            const d = Math.floor(totalSec / 3600);
            const dmsStr = `${d}°${String(m).padStart(2,'0')}'${String(s).padStart(2,'0')}"`;
            houseRows += `<div class="natal-row natal-house-row">
                <span class="natal-planet">${romanNums[i]}. Ev</span>
                <span class="natal-sign">${sign.symbol} ${sign.name} ${dmsStr}</span>
            </div>`;
        }
    }

    // Aspects table
    let aspectRows = '';
    for (const asp of aspects.slice(0, 12)) {
        const p1 = AstroEngine.PLANETS[asp.planet1];
        const p2 = AstroEngine.PLANETS[asp.planet2];
        const orbStr = asp.orb.toFixed(1) + '°';
        aspectRows += `<div class="natal-row natal-aspect-row">
            <span class="natal-planet">
                <span style="color:${p1.color}">${p1.symbol}</span>
                <span style="color:${asp.color};margin:0 4px">${asp.symbol}</span>
                <span style="color:${p2.color}">${p2.symbol}</span>
            </span>
            <span class="natal-sign" style="color:${asp.color}">${asp.type} ${orbStr}</span>
        </div>`;
    }

    // Dominant element
    const domElem = AstroEngine.getDominantElement(natal);
    const elemEmoji = { fire: '🔥', earth: '🌍', air: '💨', water: '💧' };
    const elemName = { fire: 'Ateş', earth: 'Toprak', air: 'Hava', water: 'Su' };

    el.innerHTML = `
        <div class="natal-wheel-wrap">${svgHtml}</div>
        <div class="natal-dominant">Baskın Element: ${elemEmoji[domElem] || ''} ${elemName[domElem] || domElem}</div>
        <div class="natal-section">
            <h4 class="natal-section-title">☉ Gezegen Pozisyonları</h4>
            <div class="natal-grid">${rows}</div>
        </div>
        ${houseRows ? `<div class="natal-section">
            <h4 class="natal-section-title">🏠 Ev Başlangıçları</h4>
            <div class="natal-grid">${houseRows}</div>
        </div>` : ''}
        ${aspectRows ? `<div class="natal-section">
            <h4 class="natal-section-title">✦ Açılar (Aspektler)</h4>
            <div class="natal-grid">${aspectRows}</div>
        </div>` : ''}
    `;
}

function buildZodiacWheel(natal, houses, aspects, planetOrder) {
    const CX = 250, CY = 250; // Center
    const R_OUTER = 240;       // Outer zodiac ring
    const R_SIGN_IN = 200;     // Inner edge of zodiac signs
    const R_HOUSE = 195;       // House cusp lines outer
    const R_PLANET = 165;      // Planet placement radius
    const R_ASPECT = 130;      // Aspect line area
    const R_INNER = 60;        // Inner circle

    const SIGN_COLORS = [
        '#FF4444', '#8B7355', '#87CEEB', '#C0C0C0', '#FFD700', '#8B7355',
        '#FF69B4', '#800020', '#9B59B6', '#8B7355', '#00CED1', '#4169E1'
    ];
    const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

    // ASC is placed at 9 o'clock (180° in SVG angle)
    // In astrology, ASC is at the left — zodiac goes counterclockwise
    const ascLon = houses ? houses.ascendant : 0;

    function lonToAngle(lon) {
        // Convert ecliptic longitude to SVG angle
        // ASC should be at 180° (left/9 o'clock), zodiac runs counterclockwise
        return (180 - (lon - ascLon)) * Math.PI / 180;
    }

    function polarToXY(angle, r) {
        return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
    }

    let svg = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" class="natal-wheel-svg">`;

    // ── Background ──
    svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="rgba(7,7,26,0.9)" stroke="rgba(201,160,255,0.2)" stroke-width="1"/>`;

    // ── Zodiac sign segments ──
    for (let i = 0; i < 12; i++) {
        const startLon = i * 30;
        const endLon = (i + 1) * 30;
        const a1 = lonToAngle(startLon);
        const a2 = lonToAngle(endLon);

        // Draw sign arc segment
        const p1o = polarToXY(a1, R_OUTER);
        const p2o = polarToXY(a2, R_OUTER);
        const p1i = polarToXY(a1, R_SIGN_IN);
        const p2i = polarToXY(a2, R_SIGN_IN);

        // Alternating subtle background
        const fillOpacity = i % 2 === 0 ? 0.06 : 0.03;
        svg += `<path d="M${p1o.x},${p1o.y} A${R_OUTER},${R_OUTER} 0 0,1 ${p2o.x},${p2o.y} L${p2i.x},${p2i.y} A${R_SIGN_IN},${R_SIGN_IN} 0 0,0 ${p1i.x},${p1i.y} Z" fill="${SIGN_COLORS[i]}" fill-opacity="${fillOpacity}" stroke="rgba(201,160,255,0.15)" stroke-width="0.5"/>`;

        // Sign divider line
        svg += `<line x1="${p1o.x}" y1="${p1o.y}" x2="${p1i.x}" y2="${p1i.y}" stroke="rgba(201,160,255,0.25)" stroke-width="0.8"/>`;

        // Sign symbol in middle of segment
        const midAngle = lonToAngle(startLon + 15);
        const midR = (R_OUTER + R_SIGN_IN) / 2;
        const midPt = polarToXY(midAngle, midR);
        svg += `<text x="${midPt.x}" y="${midPt.y}" text-anchor="middle" dominant-baseline="central" font-size="16" fill="${SIGN_COLORS[i]}" opacity="0.85">${SIGN_SYMBOLS[i]}</text>`;

        // Degree ticks every 10°
        for (let d = 0; d < 30; d += 10) {
            if (d === 0) continue;
            const tickAngle = lonToAngle(startLon + d);
            const t1 = polarToXY(tickAngle, R_OUTER);
            const t2 = polarToXY(tickAngle, R_OUTER - 5);
            svg += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="rgba(201,160,255,0.2)" stroke-width="0.5"/>`;
        }
    }

    // ── Inner zodiac ring ──
    svg += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="none" stroke="rgba(201,160,255,0.25)" stroke-width="0.8"/>`;

    // ── House cusps ──
    if (houses && houses.cusps) {
        const houseNums = ['1','2','3','4','5','6','7','8','9','10','11','12'];
        for (let i = 0; i < 12; i++) {
            const cuspLon = houses.cusps[i];
            const angle = lonToAngle(cuspLon);
            const pOuter = polarToXY(angle, R_HOUSE);
            const pInner = polarToXY(angle, R_INNER);

            // Cusp line (angular cusps thicker)
            const isAngular = (i === 0 || i === 3 || i === 6 || i === 9);
            const strokeW = isAngular ? 1.5 : 0.6;
            const strokeColor = isAngular ? 'rgba(201,160,255,0.6)' : 'rgba(201,160,255,0.15)';
            svg += `<line x1="${pOuter.x}" y1="${pOuter.y}" x2="${pInner.x}" y2="${pInner.y}" stroke="${strokeColor}" stroke-width="${strokeW}"/>`;

            // House number
            const nextCusp = houses.cusps[(i + 1) % 12];
            let midHouseLon = cuspLon + ((nextCusp - cuspLon + 360) % 360) / 2;
            const hNumAngle = lonToAngle(midHouseLon);
            const hNumPt = polarToXY(hNumAngle, R_INNER + 22);
            svg += `<text x="${hNumPt.x}" y="${hNumPt.y}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="rgba(201,160,255,0.4)" font-weight="500">${houseNums[i]}</text>`;
        }

        // Angular labels (ASC, MC, DSC, IC)
        const angLabels = [
            { lon: houses.ascendant, label: 'ASC', color: '#FF4444' },
            { lon: houses.midheaven, label: 'MC', color: '#FFD700' },
            { lon: houses.descendant, label: 'DSC', color: '#4169E1' },
            { lon: houses.ic, label: 'IC', color: '#4ade80' }
        ];
        for (const al of angLabels) {
            const a = lonToAngle(al.lon);
            const pt = polarToXY(a, R_OUTER + 2);
            // Arrow head at outer ring
            const ptIn = polarToXY(a, R_HOUSE);
            svg += `<circle cx="${ptIn.x}" cy="${ptIn.y}" r="3" fill="${al.color}"/>`;
            // Label outside
            const labelPt = polarToXY(a, R_OUTER + 16);
            svg += `<text x="${labelPt.x}" y="${labelPt.y}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="${al.color}" font-weight="700">${al.label}</text>`;
        }
    }

    // ── Inner circle ──
    svg += `<circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="rgba(7,7,26,0.95)" stroke="rgba(201,160,255,0.2)" stroke-width="0.8"/>`;

    // ── Aspect lines between planets ──
    for (const asp of aspects) {
        const lon1 = natal[asp.planet1].longitude;
        const lon2 = natal[asp.planet2].longitude;
        const a1 = lonToAngle(lon1);
        const a2 = lonToAngle(lon2);
        const p1 = polarToXY(a1, R_ASPECT);
        const p2 = polarToXY(a2, R_ASPECT);

        const dashArray = asp.harmony === 'harmonious' ? '' : asp.harmony === 'tense' ? '4,3' : '2,2';
        const opacity = Math.max(0.15, 0.5 - asp.orb * 0.05);
        svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${asp.color}" stroke-width="0.8" stroke-dasharray="${dashArray}" opacity="${opacity}"/>`;
    }

    // ── Planets ──
    // Avoid overlapping — nudge planets that are too close
    const planetAngles = planetOrder.map(key => ({
        key, lon: natal[key].longitude, angle: lonToAngle(natal[key].longitude)
    }));
    // Sort by angle for overlap detection
    const sortedPlanets = [...planetAngles].sort((a, b) => a.lon - b.lon);
    const MIN_ANGLE_SEP = 0.14; // ~8° minimum visual separation
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < sortedPlanets.length; i++) {
            for (let j = i + 1; j < sortedPlanets.length; j++) {
                let diff = Math.abs(sortedPlanets[i].angle - sortedPlanets[j].angle);
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                if (diff < MIN_ANGLE_SEP) {
                    sortedPlanets[i].angle -= MIN_ANGLE_SEP * 0.3;
                    sortedPlanets[j].angle += MIN_ANGLE_SEP * 0.3;
                }
            }
        }
    }

    for (const sp of sortedPlanets) {
        const planet = AstroEngine.PLANETS[sp.key];
        const pos = natal[sp.key];
        const pt = polarToXY(sp.angle, R_PLANET);

        // Connector line from exact position to displayed position
        const exactAngle = lonToAngle(pos.longitude);
        const exactPt = polarToXY(exactAngle, R_SIGN_IN - 4);
        svg += `<line x1="${exactPt.x}" y1="${exactPt.y}" x2="${pt.x}" y2="${pt.y}" stroke="${planet.color}" stroke-width="0.5" opacity="0.4"/>`;
        // Tick on inner zodiac ring
        const tickOut = polarToXY(exactAngle, R_SIGN_IN + 3);
        const tickIn = polarToXY(exactAngle, R_SIGN_IN - 3);
        svg += `<line x1="${tickOut.x}" y1="${tickOut.y}" x2="${tickIn.x}" y2="${tickIn.y}" stroke="${planet.color}" stroke-width="1.2"/>`;

        // Planet circle + symbol
        svg += `<circle cx="${pt.x}" cy="${pt.y}" r="14" fill="rgba(7,7,26,0.85)" stroke="${planet.color}" stroke-width="1.5"/>`;
        svg += `<text x="${pt.x}" y="${pt.y}" text-anchor="middle" dominant-baseline="central" font-size="14" fill="${planet.color}" font-weight="600">${planet.symbol}</text>`;
    }

    // ── Center label ──
    svg += `<text x="${CX}" y="${CY - 8}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="rgba(201,160,255,0.5)" font-weight="600">DOĞUM</text>`;
    svg += `<text x="${CX}" y="${CY + 8}" text-anchor="middle" dominant-baseline="central" font-size="10" fill="rgba(201,160,255,0.5)" font-weight="600">HARİTASI</text>`;

    svg += `</svg>`;
    return svg;
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
    if (compareBtn) switchTab(compareBtn);
    if (!compareSlots[0]) compareSlots[0] = city;
    else if (!compareSlots[1]) compareSlots[1] = city;
    else { compareSlots[0] = compareSlots[1]; compareSlots[1] = city; }
    renderComparison();
    showToast(`${city.city} karşılaştırmaya eklendi ⚖️`);
}

function clearComparison() {
    compareSlots = [null, null];
    renderComparison();
}

function renderComparison() {
    for (let i = 0; i < 2; i++) {
        const slot = document.getElementById(`compare-slot-${i}`);
        if (!slot) continue;
        const city = compareSlots[i];
        if (city) {
            slot.className = 'compare-slot filled';
            slot.innerHTML = `<div class="slot-city">${sanitize(city.city)}</div><div class="slot-country">${sanitize(city.country)}</div><div class="slot-score">${city.score}%</div>`;
        } else {
            slot.className = 'compare-slot empty';
            slot.innerHTML = '<span>+ Şehir Ekle</span><small>Sonuç kartına çift tıkla</small>';
        }
    }

    const resultEl = document.getElementById('compare-result');
    if (!resultEl) return;
    if (compareSlots[0] && compareSlots[1]) {
        const a = compareSlots[0], b = compareSlots[1];
        const categories = [
            { label: 'Genel Uyum', aVal: a.score || 0, bVal: b.score || 0 },
            { label: 'Astro Etki', aVal: Math.min(99, (a.influences?.length || 0) * 22), bVal: Math.min(99, (b.influences?.length || 0) * 22) },
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

async function downloadShareCard() {
    const el = document.getElementById('share-card-inner');
    if (typeof html2canvas !== 'function') {
        showToast('Ekran goruntsu alinamadi.');
        return;
    }
    try {
        const canvas = await html2canvas(el, { backgroundColor: '#0e0e2e', scale: 2 });
        const dataUrl = canvas.toDataURL();

        // Native share if available
        if (window.Capacitor?.Plugins?.Share) {
            try {
                await window.Capacitor.Plugins.Share.share({
                    title: 'AstroMap Sonuclarim',
                    text: 'AstroMap ile yildizlarimin beni nereye cagirdigini kesfettim!',
                    url: 'https://astromap.app',
                    dialogTitle: 'Sonuclarini Paylas'
                });
                return;
            } catch {}
        }

        // Web fallback: download
        const link = document.createElement('a');
        link.download = 'astromap-sonuclarim.png';
        link.href = dataUrl;
        link.click();
    } catch {
        showToast('Ekran goruntsu alinamadi.');
    }
}

// ═══════════════════════════════════════
// AI RESULT SHARE (Canvas-based)
// ═══════════════════════════════════════
async function shareAIResult(resultElementId, title) {
    const el = document.getElementById(resultElementId);
    if (!el) { showToast('Paylaşılacak sonuç bulunamadı'); return; }

    try {
        if (typeof html2canvas !== 'function') {
            // Fallback: Web Share API with text
            if (navigator.share) {
                const text = el.innerText.slice(0, 500);
                await navigator.share({ title: `AstroMap — ${title}`, text, url: 'https://astromap.app' });
                return;
            }
            showToast('Paylaşma özelliği kullanılamıyor');
            return;
        }

        showToast('Kart oluşturuluyor...');
        const canvas = await html2canvas(el, {
            backgroundColor: '#0e0e2e',
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Add watermark
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = 'rgba(201,160,255,0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('astromap.app', canvas.width - 20, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/png');

        // Native share (Capacitor)
        if (window.Capacitor?.Plugins?.Share) {
            try {
                await window.Capacitor.Plugins.Share.share({
                    title: `AstroMap — ${title}`,
                    text: 'AstroMap ile kozmik rehberliğimi keşfettim!',
                    url: 'https://astromap.app'
                });
                return;
            } catch {}
        }

        // Web Share API with file
        if (navigator.canShare) {
            try {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'astromap-sonuc.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({ title: `AstroMap — ${title}`, files: [file] });
                    return;
                }
            } catch {}
        }

        // Fallback: download
        const link = document.createElement('a');
        link.download = `astromap-${resultElementId}.png`;
        link.href = dataUrl;
        link.click();
        showToast('Kart indirildi!');
    } catch (err) {
        console.error('Share error:', err);
        showToast('Paylaşma başarısız oldu');
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
    const isMobileMap = window.innerWidth <= 768;
    map = L.map('map', {
        center: [30, 20], zoom: isMobileMap ? 1 : 2, minZoom: 2, maxZoom: 12,
        zoomControl: false, attributionControl: false,
        worldCopyJump: true,
        tap: true,
        dragging: true,
        touchZoom: true,
        bounceAtZoomLimits: false
    });
    // Zoom control — bottom-right on mobile, top-right on desktop
    L.control.zoom({ position: isMobileMap ? 'bottomright' : 'topright' }).addTo(map);
    // Theme-aware tile layer
    const tileUrl = (themes[currentTheme] && themes[currentTheme].tileUrl) || 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);

    drawPlanetaryLines();
    addCityMarkers();

    // Fit bounds to top 5 cities for a better initial view
    const topCities = allRenderedCities.slice(0, 5);
    const fitPad = isMobileMap ? [20, 20] : [50, 50];
    if (topCities.length > 1) {
        const bounds = L.latLngBounds(topCities.map(c => [c.lat, c.lon]));
        setTimeout(() => map.fitBounds(bounds, { padding: fitPad, maxZoom: 5, duration: 1.5 }), 500);
    } else if (topCities.length === 1) {
        setTimeout(() => map.flyTo([topCities[0].lat, topCities[0].lon], 4, { duration: 1.5 }), 500);
    }
    // Force resize after layout settles
    setTimeout(() => map.invalidateSize(), 300);
    setTimeout(() => map.invalidateSize(), 800);
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
        const isTop10 = index < 10;
        const markerSize = isTop3 ? 32 : isTop10 ? 20 : 14;
        const markerClass = isTop3 ? 'astro-marker-top' : isTop10 ? 'astro-marker-mid' : 'astro-marker';
        const icon = L.divIcon({
            className: markerClass, iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
            html: isTop3 ? `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#ffd700;text-shadow:0 1px 3px rgba(0,0,0,0.5);">${index + 1}</div>` : ''
        });
        const marker = L.marker([city.lat, city.lon], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(city, index), { 
                autoClose: false, closeOnClick: false,
                maxWidth: 260, className: 'astro-popup'
            });
        if (index === 0) marker.openPopup();
        marker.on('click', () => {
            highlightCard(allRenderedCities.indexOf(city));
            showCityPeek(city);
        });
        marker.on('mouseover', () => showCityPeek(city));
        mapMarkers.push(marker);
    });
    renderMapLegend();
}

function createPopupContent(city, rank) {
    const tagLine = city.influences.slice(0, 2).map(i => `${i.symbol} ${i.planet} ${i.lineType}`).join(' · ');
    const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '';
    const scoreColor = city.score >= 85 ? '#4ade80' : city.score >= 70 ? 'var(--accent-light)' : city.score >= 55 ? 'var(--gold)' : 'var(--text-muted)';
    const hue = Math.min(120, (city.score / 100) * 140);
    const gradient = `linear-gradient(90deg, hsl(${hue}, 70%, 50%), hsl(${hue + 20}, 80%, 55%))`;
    return `
        <div class="popup-header">
            <span class="popup-rank">${medal} #${rank + 1}</span>
            <span class="popup-flag">${_regionFlag[city.region] || ''}</span>
        </div>
        <div class="popup-city">${city.city}</div>
        <div class="popup-country">${city.country}</div>
        <div class="popup-score-bar">
            <div class="popup-score-fill" style="width:${city.score}%;background:${gradient}"></div>
            <span class="popup-score-val" style="color:${scoreColor}">${city.score}%</span>
        </div>
        <div class="popup-tags">${tagLine}</div>
        <div class="popup-reason">${city.reason}</div>
    `;
}

function resetMapView() {
    if (!map) return;
    const topCities = allRenderedCities.slice(0, 5);
    if (topCities.length > 1) {
        const bounds = L.latLngBounds(topCities.map(c => [c.lat, c.lon]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, duration: 1.5 });
    }
}

function renderMapLegend() {
    const legendBody = document.getElementById('map-legend-body');
    if (!legendBody || !results) return;
    const legendItems = [];
    for (const planetKey of visiblePlanets) {
        const planetInfo = AstroEngine.PLANETS[planetKey];
        if (!planetInfo) continue;
        legendItems.push(`<div class="legend-item"><span class="legend-line" style="background:${planetInfo.color}"></span><span>${planetInfo.symbol} ${planetInfo.name}</span></div>`);
    }
    legendItems.push('<div class="legend-sep"></div>');
    legendItems.push('<div class="legend-item"><span class="legend-dot top"></span><span>Top 3 Şehir</span></div>');
    legendItems.push('<div class="legend-item"><span class="legend-dot normal"></span><span>Diğer Şehirler</span></div>');
    legendBody.innerHTML = legendItems.join('');
}

function showCityPeek(city) {
    const peek = document.getElementById('map-city-peek');
    if (!peek) return;
    const scoreColor = city.score >= 85 ? '#4ade80' : city.score >= 70 ? 'var(--accent-light)' : 'var(--gold)';
    peek.innerHTML = `
        <div class="peek-name">${_regionFlag[city.region] || ''} ${city.city}</div>
        <div class="peek-score" style="color:${scoreColor}">${city.score}%</div>
    `;
    peek.classList.add('visible');
    clearTimeout(peek._hideTimer);
    peek._hideTimer = setTimeout(() => peek.classList.remove('visible'), 3000);
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

async function showCityDetail(city, country, score, influences) {
    // Create or reuse modal
    let modal = document.getElementById('city-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'city-detail-modal';
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
        document.body.appendChild(modal);
    }

    const natal = results?.natalChart;
    const sunSign = natal?.sun?.sign || '';
    const moonSign = natal?.moon?.sign || '';

    modal.classList.remove('hidden');
    modal.innerHTML = `
        <div class="modal-content city-detail-content">
            <button class="modal-close" onclick="document.getElementById('city-detail-modal').classList.add('hidden')">✕</button>
            <h2>${city}, ${country}</h2>
            <p style="color:var(--text-muted);margin-bottom:16px">Skor: <strong>${score}%</strong> · ${influences}</p>
            <div class="city-detail-loading">
                <div class="dream-loading-dots"><span>.</span><span>.</span><span>.</span></div>
                <p>AI analiz ediliyor...</p>
            </div>
        </div>
    `;

    try {
        const cityApiBase = (window.__ASTROMAP_CONFIG?.isNative && window.__ASTROMAP_CONFIG?.apiBase) || '';
        const resp = await fetch(cityApiBase + '/api/city-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, country, score, influences, sunSign, moonSign, preferences: selectedPreferences })
        });
        const json = await resp.json();
        if (!json.success) throw new Error(json.error || 'AI yanıt vermedi');
        const d = json.data;

        modal.querySelector('.city-detail-content').innerHTML = `
            <button class="modal-close" onclick="document.getElementById('city-detail-modal').classList.add('hidden')">✕</button>
            <h2>${city}, ${country}</h2>
            <p class="city-detail-headline">${sanitize(d.headline || '')}</p>
            <div class="city-detail-sections">
                <div class="city-detail-section">
                    <h4>🌟 Neden Bu Şehir?</h4>
                    <p>${sanitize(d.whyThisCity || '')}</p>
                </div>
                <div class="city-detail-section">
                    <h4>⚡ Enerji</h4>
                    <p>${sanitize(d.energy || '')}</p>
                </div>
                ${d.bestFor ? `<div class="city-detail-section">
                    <h4>🎯 En İyi</h4>
                    <div class="city-detail-tags">${d.bestFor.map(b => `<span class="city-detail-tag">${sanitize(b)}</span>`).join('')}</div>
                </div>` : ''}
                <div class="city-detail-section">
                    <h4>🏠 Yaşam Tarzı</h4>
                    <p>${sanitize(d.lifestyle || '')}</p>
                </div>
                <div class="city-detail-section">
                    <h4>📅 En İyi Sezon</h4>
                    <p>${sanitize(d.bestSeason || '')}</p>
                </div>
                <div class="city-detail-section">
                    <h4>💡 İpucu</h4>
                    <p>${sanitize(d.tip || '')}</p>
                </div>
            </div>
            <div class="city-detail-vibe">${sanitize(d.vibe || '')}</div>
        `;
    } catch (err) {
        modal.querySelector('.city-detail-content').innerHTML = `
            <button class="modal-close" onclick="document.getElementById('city-detail-modal').classList.add('hidden')">✕</button>
            <h2>${city}, ${country}</h2>
            <div class="ai-error"><p>AI analizi yüklenemedi: ${err.message}</p></div>
        `;
    }
}

function highlightCard(index) {
    document.querySelectorAll('.result-card').forEach(card => {
        card.classList.toggle('highlighted', parseInt(card.dataset.cityIndex) === index);
    });
}

// ═══════════════════════════════════════
// AI TAROT — REAL CARD DRAWING CEREMONY
// ═══════════════════════════════════════
let selectedSpread = 'three-card';

function selectSpread(btn) {
    // Premium check for celtic-cross
    if (btn.dataset.spread === 'celtic-cross' && !isPremiumUser()) {
        showToast('Kelt Haçı açılımı Premium kullanıcılara özel');
        navigateTo('pricing');
        return;
    }
    selectedSpread = btn.dataset.spread;
    document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

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
        const data = await callAI('tarot', { birthDate, sunSign, question, spread: selectedSpread, _t: Date.now() }, false);
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
        const data = await callAI('crystal-guide', { birthDate, sunSign, mood, _t: Date.now() }, false);
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
                <div class="ai-result-actions stagger-6">
                    <button class="btn-ghost reset-btn" onclick="resetAIPage('crystal-form','crystal-result')">💎 Tekrar Sor</button>
                    <button class="btn-ghost share-btn" onclick="shareAIResult('crystal-result','Kristal Rehberi')">📸 Paylaş</button>
                </div>
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
// ═══════════════════════════════════════
// KAHVE FALI — IMAGE UPLOAD
// ═══════════════════════════════════════
let fortuneImages = [];

// Native camera via Capacitor (used in mobile apps)
async function nativePickPhoto(source) {
    if (!window.Capacitor?.Plugins?.Camera) return false;
    try {
        const { Camera, CameraResultType, CameraSource } = window.Capacitor.Plugins;
        const photo = await Camera.getPhoto({
            quality: 85,
            allowEditing: false,
            resultType: CameraResultType?.DataUrl || 'dataUrl',
            source: source === 'camera' ? (CameraSource?.Camera || 'CAMERA') : (CameraSource?.Photos || 'PHOTOS'),
            width: 1024,
            height: 1024
        });
        if (photo?.dataUrl) {
            if (fortuneImages.length >= 3) { showToast('En fazla 3 fotoğraf yükleyebilirsin'); return false; }
            fortuneImages.push(photo.dataUrl);
            renderFortunePreview();
            document.getElementById('fortune-submit-btn').disabled = false;
            return true;
        }
    } catch (err) {
        if (err.message !== 'User cancelled photos app') {
            console.error('Native camera error:', err);
        }
    }
    return false;
}

// Fortune image picker — tries native first, falls back to web file input
async function pickFortuneImage(source) {
    if (window.__ASTROMAP_CONFIG?.isNative) {
        const success = await nativePickPhoto(source);
        if (success) return;
    }
    // Web fallback
    const inputId = source === 'camera' ? 'fortune-camera' : 'fortune-file';
    document.getElementById(inputId)?.click();
}

function handleFortuneImage(input) {
    const file = input.files[0];
    if (!file) return;
    if (fortuneImages.length >= 3) { showToast('En fazla 3 fotoğraf yükleyebilirsin'); input.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Dosya 5MB'den büyük olamaz"); input.value = ''; return; }
    if (!file.type.startsWith('image/')) { showToast('Sadece resim dosyası yükleyebilirsin'); input.value = ''; return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Resize image to max 1024px to reduce payload
        const img = new Image();
        img.onload = () => {
            const maxDim = 1024;
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            fortuneImages.push(canvas.toDataURL('image/jpeg', 0.85));

            // Show preview
            renderFortunePreview();
            document.getElementById('fortune-submit-btn').disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderFortunePreview() {
    const preview = document.getElementById('fortune-preview');
    if (fortuneImages.length === 0) {
        preview.innerHTML = `
            <div class="fortune-drop-icon">📸</div>
            <p class="fortune-drop-text">Fincanin fotografini yukle</p>
            <div class="fortune-upload-buttons">
                <button type="button" class="btn-fortune-upload" onclick="pickFortuneImage('gallery')">Galeriden Sec</button>
                <button type="button" class="btn-fortune-upload btn-fortune-camera" onclick="pickFortuneImage('camera')">Fotograf Cek</button>
            </div>
            <small>JPG, PNG — max 5MB — en fazla 3 fotoğraf</small>
        `;
        document.getElementById('fortune-submit-btn').disabled = true;
        return;
    }
    preview.innerHTML = `
        <div class="fortune-thumbs-grid">
            ${fortuneImages.map((img, i) => `
                <div class="fortune-thumb">
                    <img src="${img}" alt="Fincan ${i + 1}" class="fortune-thumb-img">
                    <button type="button" class="fortune-thumb-remove" onclick="removeFortuneImageAt(${i})">✕</button>
                </div>
            `).join('')}
            ${fortuneImages.length < 3 ? `
                <div class="fortune-thumb fortune-thumb-add" onclick="pickFortuneImage('gallery')">
                    <span>+</span>
                    <small>${3 - fortuneImages.length} kaldı</small>
                </div>
            ` : ''}
        </div>
    `;
}

function removeFortuneImageAt(index) {
    fortuneImages.splice(index, 1);
    renderFortunePreview();
    document.getElementById('fortune-file').value = '';
    const cam = document.getElementById('fortune-camera');
    if (cam) cam.value = '';
}

function removeFortuneImage(e) {
    if (e) e.stopPropagation();
    fortuneImages = [];
    document.getElementById('fortune-file').value = '';
    const cam = document.getElementById('fortune-camera');
    if (cam) cam.value = '';
    renderFortunePreview();
}

// Drag & drop support for fortune image
(function initFortuneDragDrop() {
    document.addEventListener('DOMContentLoaded', () => {
        const dropzone = document.getElementById('fortune-dropzone');
        if (!dropzone) return;

        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
        });

        dropzone.addEventListener('drop', (e) => {
            const file = e.dataTransfer?.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;
            const input = document.getElementById('fortune-file');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFortuneImage(input);
        });
    });
})();

async function showFortune() {
    const birthDate = document.getElementById('fortune-birth-date').value;
    const status = document.getElementById('fortune-status').value;
    const cup = document.getElementById('fortune-cup').value;
    if (fortuneImages.length === 0) { showToast('Lütfen fincanın fotoğrafını yükle 📸'); return; }

    const sunSign = getSunSignFromDate(birthDate);
    const resultEl = document.getElementById('fortune-result');
    document.getElementById('fortune-form').style.display = 'none';
    resultEl.classList.remove('hidden');

    resultEl.innerHTML = `
        <div class="fortune-loading-scene">
            <div class="fortune-cup-anim">☕</div>
            <p class="fortune-loading-msg">Fincanın okunuyor...</p>
            <div class="dream-loading-dots"><span>.</span><span>.</span><span>.</span></div>
        </div>
    `;

    try {
        const data = await callAI('fortune', { images: fortuneImages, cup, sunSign, status }, false);
        SoundFX.play('mystic');
        const symbols = data.symbols || [];
        resultEl.innerHTML = `
            <div class="fortune-reveal">
                <div class="fortune-header stagger-1">
                    <div class="fortune-cup-icon">☕</div>
                    <h2 class="fortune-title">${data.title || 'Fincan Yorumun'}</h2>
                    <span class="fortune-mood">${data.mood || ''}</span>
                </div>

                <div class="fortune-general stagger-2">
                    <h3>🔮 Genel Yorum</h3>
                    <p>${data.general || ''}</p>
                </div>

                <div class="fortune-symbols stagger-3">
                    <h3>☕ Fincandaki Semboller</h3>
                    <div class="dream-symbols-grid">
                        ${symbols.map((s, i) => `
                            <div class="dream-symbol-card" style="animation-delay:${0.6 + i * 0.1}s">
                                <strong>${s.symbol}</strong>
                                <p>${s.meaning}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="fortune-sections stagger-4">
                    ${data.love ? `<div class="fortune-section"><h4>💕 Aşk & İlişki</h4><p>${data.love}</p></div>` : ''}
                    ${data.career ? `<div class="fortune-section"><h4>💼 Kariyer & Para</h4><p>${data.career}</p></div>` : ''}
                    ${data.health ? `<div class="fortune-section"><h4>🌿 Sağlık & Enerji</h4><p>${data.health}</p></div>` : ''}
                </div>

                ${data.answer ? `
                <div class="fortune-answer stagger-5">
                    <h3>❓ Sorunun Yanıtı</h3>
                    <p>${data.answer}</p>
                </div>` : ''}

                <div class="fortune-advice stagger-5">
                    <div class="dream-advice-item"><strong>🍀 Şans İpucu:</strong> ${data.luckyTip || ''}</div>
                    <div class="dream-advice-item"><strong>⏰ Zamanlama:</strong> ${data.timing || ''}</div>
                </div>

                <div class="ai-result-actions stagger-6">
                    <button class="btn-ghost reset-btn" onclick="resetFortunePage()">☕ Yeni Fal Baktır</button>
                    <button class="btn-ghost share-btn" onclick="shareAIResult('fortune-result','Kahve Falı')">📸 Paylaş</button>
                </div>
            </div>
        `;
    } catch (err) {
        showAIError(resultEl, err.message);
        document.getElementById('fortune-form').style.display = '';
    }
}

function resetFortunePage() {
    fortuneImages = [];
    document.getElementById('fortune-file').value = '';
    const cam = document.getElementById('fortune-camera');
    if (cam) cam.value = '';
    renderFortunePreview();
    document.getElementById('fortune-submit-btn').disabled = true;
    document.getElementById('fortune-cup').value = '';
    resetAIPage('fortune-form', 'fortune-result');
}

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

                <div class="ai-result-actions stagger-6">
                    <button class="btn-ghost reset-btn" onclick="resetAIPage('dream-form','dream-result')">💭 Başka Rüya Yorumla</button>
                    <button class="btn-ghost share-btn" onclick="shareAIResult('dream-result','Rüya Yorumu')">📸 Paylaş</button>
                </div>
            </div>
        `;
    } catch (err) {
        showAIError(resultEl, err.message);
        document.getElementById('dream-form').style.display = '';
    }
}

// ═══════════════════════════════════════
// RETROGRADE CALENDAR
// ═══════════════════════════════════════
function loadRetrogradeCalendar() {
    const el = document.getElementById('retrograde-content');
    if (!el) return;

    // 2025-2026 retrograde periods (pre-calculated for accuracy)
    const retrogrades = [
        { planet: 'Merkür ☿', periods: [
            { start: '2025-03-15', end: '2025-04-07', sign: 'Balık ♓' },
            { start: '2025-07-18', end: '2025-08-11', sign: 'Aslan ♌' },
            { start: '2025-11-09', end: '2025-11-29', sign: 'Yay ♐' },
            { start: '2026-03-03', end: '2026-03-26', sign: 'Balık ♓' },
            { start: '2026-07-02', end: '2026-07-26', sign: 'Aslan ♌' },
            { start: '2026-10-24', end: '2026-11-13', sign: 'Akrep ♏' }
        ], effect: 'İletişim, teknoloji, seyahat aksaklıkları. Sözleşme imzalamayın.', color: '#87CEEB' },
        { planet: 'Venüs ♀', periods: [
            { start: '2025-03-02', end: '2025-04-13', sign: 'Koç ♈ → Balık ♓' }
        ], effect: 'Aşk ve ilişkilerde yeniden değerlendirme. Eski aşklar geri dönebilir.', color: '#ff6b9d' },
        { planet: 'Mars ♂', periods: [
            { start: '2025-01-06', end: '2025-02-24', sign: 'Yengeç ♋ → İkizler ♊' },
            { start: '2026-10-30', end: '2027-01-12', sign: 'Aslan ♌' }
        ], effect: 'Enerji düşüklüğü, motivasyon kaybı. Büyük eylemleri erteleyin.', color: '#ff4444' },
        { planet: 'Jüpiter ♃', periods: [
            { start: '2025-11-11', end: '2026-03-10', sign: 'Yengeç ♋' }
        ], effect: 'Büyüme ve fırsatların yavaşlaması. İçsel genişleme dönemi.', color: '#ffd76e' },
        { planet: 'Satürn ♄', periods: [
            { start: '2025-07-13', end: '2025-11-28', sign: 'Balık ♓' },
            { start: '2026-07-27', end: '2026-12-11', sign: 'Koç ♈' }
        ], effect: 'Sorumluluklar ve yapı yeniden sorgulanıyor. Sabır gerekli.', color: '#c9a0ff' },
        { planet: 'Uranüs ♅', periods: [
            { start: '2025-09-06', end: '2026-02-04', sign: 'Boğa ♉' },
            { start: '2026-09-10', end: '2027-02-07', sign: 'İkizler ♊' }
        ], effect: 'Beklenmedik değişimler yavaşlıyor. İç devrim zamanı.', color: '#00CED1' },
        { planet: 'Neptün ♆', periods: [
            { start: '2025-07-04', end: '2025-12-10', sign: 'Balık ♓ → Kova ♒' },
            { start: '2026-07-07', end: '2026-12-13', sign: 'Kova ♒' }
        ], effect: 'Hayaller ve illüzyonlar netleşiyor. Gerçeklerle yüzleşme.', color: '#4169E1' },
        { planet: 'Plüton ♇', periods: [
            { start: '2025-05-04', end: '2025-10-13', sign: 'Kova ♒' },
            { start: '2026-05-07', end: '2026-10-16', sign: 'Kova ♒' }
        ], effect: 'Derin dönüşümler yavaşlıyor. İç gücü keşfetme zamanı.', color: '#800020' }
    ];

    const today = new Date().toISOString().slice(0, 10);

    // Check which planets are currently retrograde
    const activeRetros = [];
    retrogrades.forEach(r => {
        r.periods.forEach(p => {
            if (today >= p.start && today <= p.end) {
                activeRetros.push({ planet: r.planet, sign: p.sign, end: p.end, color: r.color });
            }
        });
    });

    el.innerHTML = `
        <div class="retro-dashboard">
            <div class="retro-status ${activeRetros.length > 0 ? 'retro-active' : 'retro-clear'}">
                <div class="retro-status-icon">${activeRetros.length > 0 ? '⚠️' : '✅'}</div>
                <h3>${activeRetros.length > 0 ? `${activeRetros.length} Gezegen Retroda!` : 'Şu an aktif retro yok'}</h3>
                ${activeRetros.map(a => `
                    <div class="retro-active-item" style="border-left: 3px solid ${a.color}">
                        <strong>${a.planet}</strong> ${a.sign} burcunda
                        <small>Bitiş: ${new Date(a.end).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</small>
                    </div>
                `).join('')}
            </div>

            <h3 class="retro-section-title">📅 ${new Date().getFullYear()} Retro Takvimi</h3>
            <div class="retro-timeline">
                ${retrogrades.map(r => `
                    <div class="retro-planet-row">
                        <div class="retro-planet-name" style="color:${r.color}">${r.planet}</div>
                        <div class="retro-periods">
                            ${r.periods.map(p => {
                                const isActive = today >= p.start && today <= p.end;
                                const isPast = today > p.end;
                                return `<div class="retro-period ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}" style="border-color:${r.color}">
                                    <span class="retro-dates">${formatRetroDate(p.start)} — ${formatRetroDate(p.end)}</span>
                                    <span class="retro-sign">${p.sign}</span>
                                </div>`;
                            }).join('')}
                        </div>
                        <div class="retro-effect">${r.effect}</div>
                    </div>
                `).join('')}
            </div>

            <div class="retro-tips">
                <h3>💡 Retro Döneminde Ne Yapmalı?</h3>
                <div class="retro-tips-grid">
                    <div class="retro-tip">✅ Eski projeleri tamamla</div>
                    <div class="retro-tip">✅ Yedekleme yap</div>
                    <div class="retro-tip">✅ Eski dostlarla iletişime geç</div>
                    <div class="retro-tip">✅ İç gözlem & meditasyon</div>
                    <div class="retro-tip">❌ Yeni sözleşme imzalama</div>
                    <div class="retro-tip">❌ Büyük satın alım yapma</div>
                    <div class="retro-tip">❌ Yeni ilişki başlatma</div>
                    <div class="retro-tip">❌ Teknoloji yatırımı</div>
                </div>
            </div>
        </div>
    `;
}

function formatRetroDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

// ═══════════════════════════════════════
// SHAREABLE BIRTH CHART LINK
// ═══════════════════════════════════════
function generateShareLink() {
    const birthDate = document.getElementById('birth-date')?.value;
    const birthTime = document.getElementById('birth-time')?.value || '12:00';
    const birthCity = document.getElementById('birth-city')?.value || '';
    if (!birthDate) { showToast('Önce doğum bilgileri gir'); return; }

    const payload = btoa(JSON.stringify({ d: birthDate, t: birthTime, c: birthCity }));
    const url = `${window.location.origin}${window.location.pathname}?chart=${payload}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast('Doğum haritası linki kopyalandı! 🔗');
    }).catch(() => {
        // Fallback
        prompt('Linki kopyala:', url);
    });
}

/**
 * Universal share function using Web Share API with clipboard fallback
 * Usage: shareContent('Tarot Yorumum', 'Geçmiş: Kupa Ası...');
 */
function shareContent(title, text) {
    const shareData = {
        title: `AstroMap — ${title}`,
        text: text,
        url: window.location.origin
    };
    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        navigator.clipboard.writeText(`${shareData.title}\n\n${text}\n\n${shareData.url}`).then(() => {
            showToast('Sonuç panoya kopyalandı! 📋');
        }).catch(() => {
            showToast('Paylaşım desteklenmiyor');
        });
    }
}

function handleShareLink() {
    const params = new URLSearchParams(window.location.search);
    const chartParam = params.get('chart');
    if (!chartParam) return;

    try {
        const decoded = JSON.parse(atob(chartParam));
        const d = typeof decoded.d === 'string' ? decoded.d : null;
        const t = typeof decoded.t === 'string' ? decoded.t : '';
        const c = typeof decoded.c === 'string' ? decoded.c : '';
        if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const dateEl = document.getElementById('birth-date');
            const timeEl = document.getElementById('birth-time');
            const cityEl = document.getElementById('birth-city');
            if (dateEl) dateEl.value = d;
            if (timeEl && /^\d{2}:\d{2}$/.test(t)) timeEl.value = t;
            if (cityEl) cityEl.value = c.slice(0, 100);
            showToast('Paylaşılan doğum haritası yüklendi ✨');
            navigateTo('chart');
        }
    } catch { /* invalid link */ }
}

// ═══════════════════════════════════════
// DASHBOARD — HISTORY & FAVORITES
// ═══════════════════════════════════════
function loadDashboard() {
    const el = document.getElementById('dashboard-content');
    if (!el) return;

    const user = AuthSystem.getUser();
    const history = AuthSystem.getHistory();
    const favorites = AuthSystem.getFavorites();

    const typeLabels = {
        'daily-horoscope': '🌟 Günlük Yorum',
        'compatibility': '💕 Uyum Testi',
        'tarot': '🃏 Tarot',
        'crystal-guide': '💎 Kristal',
        'dream': '💭 Rüya',
        'fortune': '☕ Kahve Falı',
        'city-insight': '🏙️ Şehir',
        'health': '🩺 Sağlık'
    };

    el.innerHTML = `
        <div class="dashboard-wrap">
            ${user ? `
                <div class="dash-user-card">
                    <div class="dash-avatar">✦</div>
                    <div class="dash-user-info">
                        <h3>${sanitize(user.name || 'Kullanıcı')}</h3>
                        <span>${sanitize(user.email || '')}</span>
                        ${user.birthDate ? `<span>🎂 ${new Date(user.birthDate).toLocaleDateString('tr-TR')}</span>` : ''}
                    </div>
                </div>
            ` : `
                <div class="dash-login-prompt">
                    <p>Geçmişini ve favorilerini görmek için giriş yap.</p>
                    <button class="btn-hero" data-modal="login-modal" type="button">Giriş Yap</button>
                </div>
            `}

            <div class="dash-stats">
                <div class="dash-stat"><span class="dash-stat-num">${history.length}</span><span class="dash-stat-label">AI Sorgu</span></div>
                <div class="dash-stat"><span class="dash-stat-num">${favorites.length}</span><span class="dash-stat-label">Favori Şehir</span></div>
                <div class="dash-stat"><span class="dash-stat-num">${new Set(history.map(h => h.type)).size}</span><span class="dash-stat-label">Kullanılan Özellik</span></div>
            </div>

            ${favorites.length > 0 ? `
                <div class="dash-section">
                    <h3>⭐ Favori Şehirler</h3>
                    <div class="dash-favorites">
                        ${favorites.map(f => `
                            <div class="dash-fav-card">
                                <strong>${sanitize(f.city)}</strong>
                                <span>${sanitize(f.country)}</span>
                                ${f.score ? `<span class="dash-fav-score">${f.score}%</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${history.length > 0 ? `
                <div class="dash-section">
                    <h3>📜 Son Sorgular</h3>
                    <div class="dash-history">
                        ${history.slice(0, 20).map(h => `
                            <div class="dash-history-item">
                                <span class="dash-history-type">${typeLabels[h.type] || h.type}</span>
                                <span class="dash-history-date">${new Date(h.date).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="dash-empty">
                    <p>Henüz sorgu geçmişin yok. AI özelliklerini kullanmaya başla! ✨</p>
                </div>
            `}
        </div>
    `;
}

// ═══════════════════════════════════════
// PUSH NOTIFICATIONS (Native only)
// ═══════════════════════════════════════
async function initPushNotifications() {
    if (!window.Capacitor?.Plugins?.PushNotifications) return;
    const PushNotifications = window.Capacitor.Plugins.PushNotifications;

    try {
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') return;

        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
            console.log('Push token:', token.value);
            localStorage.setItem('astromap_push_token', token.value);
            // Send token to backend
            fetch('/api/push/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token.value,
                    platform: 'native',
                    user: AuthSystem.getUser()?.email || 'anonymous'
                })
            }).catch(() => {});
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            showToast(notification.title || notification.body || 'Yeni bildirim');
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            const data = action.notification?.data;
            if (data?.page) navigateTo(data.page);
        });
    } catch (err) {
        console.warn('Push init failed:', err);
    }
}

// ═══════════════════════════════════════
// WEB PUSH NOTIFICATIONS (Browser)
// ═══════════════════════════════════════
async function initWebPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (window.Capacitor?.isNativePlatform?.()) return; // Skip on native, handled above

    try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return; // Already subscribed

        // Check if user wants notifications
        if (Notification.permission === 'denied') return;
        if (Notification.permission === 'default') {
            // Ask after some engagement (not on first load)
            const pageViews = parseInt(localStorage.getItem('astromap_pv') || '0');
            if (pageViews < 3) return; // Wait for 3 page views
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: localStorage.getItem('astromap_vapid_public') || undefined
        });

        // Send to backend
        fetch('/api/push/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                platform: 'web',
                user: AuthSystem.getUser()?.email || 'anonymous'
            })
        }).catch(() => {});
    } catch (err) {
        console.warn('Web push init failed:', err);
    }
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Remove loading state — wait for fonts, then reveal
    const reveal = () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
    };
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => requestAnimationFrame(reveal));
    } else {
        requestAnimationFrame(() => requestAnimationFrame(reveal));
    }

    // Set footer year dynamically
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    initStars();
    initBirthCityDropdown();

    // Auth: restore session UI
    AuthSystem.updateUI();

    // Init push notifications (native + web)
    initPushNotifications();
    initWebPush();

    // Track page view for push notification timing
    const pv = parseInt(localStorage.getItem('astromap_pv') || '0') + 1;
    localStorage.setItem('astromap_pv', String(pv));

    // Share link: check URL for shared chart
    handleShareLink();

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

    // Scroll-reveal animations — delay to avoid competing with body reveal
    setTimeout(initScrollReveal, 400);

    // Feature card mouse-follow glow
    initFeatureCardGlow();

    // Floating hero particles
    if (!reducedMotion) initHeroParticles();

    // Magnetic button effect
    if (!reducedMotion) initMagneticButtons();

    // Smooth cursor trail
    if (!reducedMotion) initCursorTrail();

    // Navbar scroll progress
    initScrollProgress();

    // Smart navbar hide/show
    initSmartNavbar();

    // Back to top with progress ring
    initBackToTop();

    // Parallax starfield
    initParallaxStars();

    // Hero stats counter animation — delay to avoid flicker
    setTimeout(initHeroStatsAnimation, 500);

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

    // Haptic feedback for mobile
    initHapticFeedback();

    // First-time onboarding
    showOnboardingIfNeeded();
});

// ═══════════════════════════════════════
// HAPTIC FEEDBACK (Native feel)
// ═══════════════════════════════════════
function initHapticFeedback() {
    const Haptics = window.Capacitor?.Plugins?.Haptics;
    if (!Haptics) return;

    // Light haptic on button taps
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-primary, .btn-ghost, .btn-nav-primary, .pref-card, .spread-btn, .nav-link');
        if (target) Haptics.impact({ style: 'Light' }).catch(() => {});
    });

    // Medium haptic on form submissions
    document.addEventListener('click', (e) => {
        const submit = e.target.closest('[onclick*="show"], [onclick*="calculate"]');
        if (submit) Haptics.impact({ style: 'Medium' }).catch(() => {});
    });
}

// ═══════════════════════════════════════
// ONBOARDING (First-time users)
// ═══════════════════════════════════════
function showOnboardingIfNeeded() {
    if (localStorage.getItem('astromap_onboarded')) return;

    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
        <div class="onboarding-card">
            <div class="onboarding-emoji">✦</div>
            <h2>AstroMap'e Hos Geldin!</h2>
            <p>Yildizlarin seni nereye cagirdigini kesfetmeye hazir misin?</p>
            <div class="onboarding-features">
                <div class="onboarding-feature">🌍 558 sehir astrokartografi haritasi</div>
                <div class="onboarding-feature">🃏 AI Tarot — 4 farkli acilim</div>
                <div class="onboarding-feature">🌟 Gunluk burc yorumu</div>
                <div class="onboarding-feature">☕ Kahve fali — fotograf yukle</div>
            </div>
            <button class="btn-primary" onclick="closeOnboarding()" style="width:100%;margin-top:20px">Kesfetmeye Basla</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeOnboarding() {
    localStorage.setItem('astromap_onboarded', 'true');
    const overlay = document.querySelector('.onboarding-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

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
    let animId = null;
    let idleTimer = null;
    function animate() {
        let x = mouseX, y = mouseY;
        dots.forEach((dot, i) => {
            dot.x += (x - dot.x) * (0.3 - i * 0.04);
            dot.y += (y - dot.y) * (0.3 - i * 0.04);
            dot.el.style.left = dot.x + 'px';
            dot.el.style.top = dot.y + 'px';
            x = dot.x; y = dot.y;
        });
        animId = requestAnimationFrame(animate);
    }
    function stopTrail() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
    }
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (!animId) animate();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(stopTrail, 2000);
    }, { passive: true });
}

// ═══════════════════════════════════════
// SHOOTING STAR CURSOR EFFECT (TOGGLEABLE)
// ═══════════════════════════════════════
let shootingStarCursorEnabled = false;
let shootingStarCanvas = null;
let shootingStarCtx = null;
let shootingStarParticles = [];
let shootingStarMouseX = 0, shootingStarMouseY = 0;
let shootingStarPrevX = 0, shootingStarPrevY = 0;
let shootingStarAnimId = null;

function toggleShootingStarCursor() {
    if (reducedMotion) { showToast('Azaltılmış hareket modu aktif — efekt devre dışı'); return; }
    shootingStarCursorEnabled = !shootingStarCursorEnabled;
    const btn = document.getElementById('shooting-star-toggle');
    if (btn) btn.classList.toggle('active', shootingStarCursorEnabled);
    
    if (shootingStarCursorEnabled) {
        if (!shootingStarCanvas) {
            shootingStarCanvas = document.createElement('canvas');
            shootingStarCanvas.className = 'shooting-star-canvas';
            document.body.appendChild(shootingStarCanvas);
            shootingStarCtx = shootingStarCanvas.getContext('2d');
            function resizeSSCanvas() {
                shootingStarCanvas.width = window.innerWidth;
                shootingStarCanvas.height = window.innerHeight;
            }
            resizeSSCanvas();
            window.addEventListener('resize', resizeSSCanvas);
            document.addEventListener('mousemove', e => {
                shootingStarMouseX = e.clientX;
                shootingStarMouseY = e.clientY;
            }, { passive: true });
        }
        shootingStarCanvas.style.display = 'block';
        shootingStarPrevX = shootingStarMouseX;
        shootingStarPrevY = shootingStarMouseY;
        animateShootingStarCursor();
        showToast('☄️ Kayan yıldız efekti açıldı');
    } else {
        if (shootingStarCanvas) shootingStarCanvas.style.display = 'none';
        if (shootingStarAnimId) { cancelAnimationFrame(shootingStarAnimId); shootingStarAnimId = null; }
        shootingStarParticles = [];
        showToast('☄️ Kayan yıldız efekti kapatıldı');
    }
}

function animateShootingStarCursor() {
    if (!shootingStarCursorEnabled) return;
    const ctx = shootingStarCtx;
    ctx.clearRect(0, 0, shootingStarCanvas.width, shootingStarCanvas.height);
    
    // Generate new particles based on mouse movement speed
    const dx = shootingStarMouseX - shootingStarPrevX;
    const dy = shootingStarMouseY - shootingStarPrevY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    if (speed > 2) {
        const count = Math.min(3, Math.floor(speed / 8) + 1);
        for (let i = 0; i < count; i++) {
            shootingStarParticles.push({
                x: shootingStarMouseX + (Math.random() - 0.5) * 6,
                y: shootingStarMouseY + (Math.random() - 0.5) * 6,
                vx: -dx * 0.05 + (Math.random() - 0.5) * 1.5,
                vy: -dy * 0.05 + (Math.random() - 0.5) * 1.5 + 0.3,
                life: 1.0,
                size: Math.random() * 2.5 + 1,
                hue: 250 + Math.random() * 60 // purple to gold range
            });
        }
    }
    
    // Draw and update particles
    for (let i = shootingStarParticles.length - 1; i >= 0; i--) {
        const p = shootingStarParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        p.size *= 0.97;
        
        if (p.life <= 0) {
            shootingStarParticles.splice(i, 1);
            continue;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const alpha = p.life * 0.8;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${alpha})`;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${alpha * 0.2})`;
        ctx.fill();
    }
    
    // Draw a small bright point at cursor
    if (speed > 1) {
        ctx.beginPath();
        ctx.arc(shootingStarMouseX, shootingStarMouseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(shootingStarMouseX, shootingStarMouseY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,160,255,0.15)';
        ctx.fill();
    }
    
    shootingStarPrevX = shootingStarMouseX;
    shootingStarPrevY = shootingStarMouseY;
    
    // Cap particles for performance
    if (shootingStarParticles.length > 150) {
        shootingStarParticles.splice(0, shootingStarParticles.length - 150);
    }
    
    shootingStarAnimId = requestAnimationFrame(animateShootingStarCursor);
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
        // Don't hide navbar when mobile menu is open
        if (navbar.classList.contains('menu-open')) return;
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
    KeyboardShortcuts.register('8', 'Retro Takvim', () => navigateTo('retrograde'));
    KeyboardShortcuts.register('9', 'Dashboard', () => navigateTo('dashboard'));
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
// THEME SYSTEM (6 CONCEPTUAL THEMES)
// ═══════════════════════════════════════
const themes = {
    cosmic: {
        name: 'Kozmik Mor',
        icon: '🔮',
        desc: 'Klasik kozmik gece',
        premium: false,
        preview: ['#07071a', '#c9a0ff', '#ff6b9d'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#07071a',
            '--bg-card': 'rgba(255,255,255,0.04)',
            '--bg-card-hover': 'rgba(255,255,255,0.08)',
            '--bg-glass': 'rgba(255,255,255,0.06)',
            '--surface': '#0e0e2a',
            '--surface-2': '#151538',
            '--border': 'rgba(255,255,255,0.08)',
            '--border-light': 'rgba(255,255,255,0.12)',
            '--text': '#f0eef6',
            '--text-muted': '#8a84a0',
            '--text-dim': '#5a5475',
            '--accent': '#c9a0ff',
            '--accent-light': '#e0c8ff',
            '--accent-dark': '#7c5cbf',
            '--rose': '#ff6b9d',
            '--rose-light': '#ff8fb8',
            '--gold': '#ffd76e',
            '--gold-dark': '#c8a84e',
            '--teal': '#6ee7c8',
            '--gradient-main': 'linear-gradient(135deg, #c9a0ff, #ff6b9d)',
            '--gradient-gold': 'linear-gradient(135deg, #ffd76e, #ff9a56)',
            '--gradient-cool': 'linear-gradient(135deg, #6ee7c8, #4fa0ff)',
            '--shadow-glow': '0 0 40px rgba(201,160,255,0.15)',
            '--navbar-bg': 'rgba(7,7,26,0.85)',
            '--loading-bg': 'rgba(7,7,26,0.95)'
        }
    },
    moonlight: {
        name: 'Ay Işığı',
        icon: '🌙',
        desc: 'Aydınlık & zarif beyaz tema',
        premium: false,
        preview: ['#f5f3ff', '#7c3aed', '#ec4899'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#f8f6ff',
            '--bg-card': 'rgba(124,58,237,0.04)',
            '--bg-card-hover': 'rgba(124,58,237,0.08)',
            '--bg-glass': 'rgba(124,58,237,0.06)',
            '--surface': '#ede9fe',
            '--surface-2': '#ddd6fe',
            '--border': 'rgba(124,58,237,0.12)',
            '--border-light': 'rgba(124,58,237,0.18)',
            '--text': '#1e1b4b',
            '--text-muted': '#6b6394',
            '--text-dim': '#a5a0c0',
            '--accent': '#7c3aed',
            '--accent-light': '#8b5cf6',
            '--accent-dark': '#5b21b6',
            '--rose': '#ec4899',
            '--rose-light': '#f472b6',
            '--gold': '#d97706',
            '--gold-dark': '#b45309',
            '--teal': '#059669',
            '--gradient-main': 'linear-gradient(135deg, #7c3aed, #ec4899)',
            '--gradient-gold': 'linear-gradient(135deg, #f59e0b, #ef4444)',
            '--gradient-cool': 'linear-gradient(135deg, #059669, #3b82f6)',
            '--shadow-glow': '0 0 40px rgba(124,58,237,0.12)',
            '--navbar-bg': 'rgba(248,246,255,0.88)',
            '--loading-bg': 'rgba(248,246,255,0.95)'
        }
    },
    aurora: {
        name: 'Kuzey Işıkları',
        icon: '🌌',
        desc: 'Aurora borealis yeşil-mavi',
        premium: true,
        preview: ['#020c1b', '#64ffda', '#38bdf8'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#020c1b',
            '--bg-card': 'rgba(100,255,218,0.04)',
            '--bg-card-hover': 'rgba(100,255,218,0.08)',
            '--bg-glass': 'rgba(100,255,218,0.06)',
            '--surface': '#0a192f',
            '--surface-2': '#112240',
            '--border': 'rgba(100,255,218,0.10)',
            '--border-light': 'rgba(100,255,218,0.15)',
            '--text': '#ccd6f6',
            '--text-muted': '#8892b0',
            '--text-dim': '#495670',
            '--accent': '#64ffda',
            '--accent-light': '#a8ffec',
            '--accent-dark': '#3db89e',
            '--rose': '#f472b6',
            '--rose-light': '#fb7ebd',
            '--gold': '#fbbf24',
            '--gold-dark': '#d4980a',
            '--teal': '#64ffda',
            '--gradient-main': 'linear-gradient(135deg, #64ffda, #38bdf8)',
            '--gradient-gold': 'linear-gradient(135deg, #fbbf24, #f97316)',
            '--gradient-cool': 'linear-gradient(135deg, #64ffda, #818cf8)',
            '--shadow-glow': '0 0 40px rgba(100,255,218,0.15)',
            '--navbar-bg': 'rgba(2,12,27,0.88)',
            '--loading-bg': 'rgba(2,12,27,0.95)'
        }
    },
    nebula: {
        name: 'Nebula',
        icon: '🌸',
        desc: 'Pembe-mor nebula galaksisi',
        premium: true,
        preview: ['#1a0520', '#ff6b9d', '#c084fc'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#1a0520',
            '--bg-card': 'rgba(255,107,157,0.05)',
            '--bg-card-hover': 'rgba(255,107,157,0.10)',
            '--bg-glass': 'rgba(255,107,157,0.06)',
            '--surface': '#2a0a35',
            '--surface-2': '#3d1048',
            '--border': 'rgba(255,107,157,0.12)',
            '--border-light': 'rgba(255,107,157,0.18)',
            '--text': '#fce7f3',
            '--text-muted': '#c084a8',
            '--text-dim': '#7a4565',
            '--accent': '#ff6b9d',
            '--accent-light': '#ffa0c0',
            '--accent-dark': '#c44d78',
            '--rose': '#ff6b9d',
            '--rose-light': '#ffa0c0',
            '--gold': '#ffc857',
            '--gold-dark': '#c89e40',
            '--teal': '#c084fc',
            '--gradient-main': 'linear-gradient(135deg, #ff6b9d, #c084fc)',
            '--gradient-gold': 'linear-gradient(135deg, #ffc857, #ff6b9d)',
            '--gradient-cool': 'linear-gradient(135deg, #c084fc, #38bdf8)',
            '--shadow-glow': '0 0 40px rgba(255,107,157,0.18)',
            '--navbar-bg': 'rgba(26,5,32,0.88)',
            '--loading-bg': 'rgba(26,5,32,0.95)'
        }
    },
    ocean: {
        name: 'Okyanus',
        icon: '🌊',
        desc: 'Derin okyanus mavisi',
        premium: true,
        preview: ['#0a1628', '#38bdf8', '#22d3ee'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#0a1628',
            '--bg-card': 'rgba(56,189,248,0.04)',
            '--bg-card-hover': 'rgba(56,189,248,0.08)',
            '--bg-glass': 'rgba(56,189,248,0.06)',
            '--surface': '#0f2440',
            '--surface-2': '#163358',
            '--border': 'rgba(56,189,248,0.10)',
            '--border-light': 'rgba(56,189,248,0.15)',
            '--text': '#e0f2fe',
            '--text-muted': '#7aa8c8',
            '--text-dim': '#4a6d8a',
            '--accent': '#38bdf8',
            '--accent-light': '#7dd3fc',
            '--accent-dark': '#0284c7',
            '--rose': '#f472b6',
            '--rose-light': '#fb7ebd',
            '--gold': '#fbbf24',
            '--gold-dark': '#d4980a',
            '--teal': '#22d3ee',
            '--gradient-main': 'linear-gradient(135deg, #38bdf8, #22d3ee)',
            '--gradient-gold': 'linear-gradient(135deg, #fbbf24, #38bdf8)',
            '--gradient-cool': 'linear-gradient(135deg, #22d3ee, #818cf8)',
            '--shadow-glow': '0 0 40px rgba(56,189,248,0.15)',
            '--navbar-bg': 'rgba(10,22,40,0.88)',
            '--loading-bg': 'rgba(10,22,40,0.95)'
        }
    },
    solar: {
        name: 'Güneş Patlaması',
        icon: '☀️',
        desc: 'Sıcak altın ve ateş',
        premium: true,
        preview: ['#1a0e04', '#fbbf24', '#f97316'],
        tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        vars: {
            '--bg': '#1a0e04',
            '--bg-card': 'rgba(251,191,36,0.04)',
            '--bg-card-hover': 'rgba(251,191,36,0.08)',
            '--bg-glass': 'rgba(251,191,36,0.06)',
            '--surface': '#2a1a08',
            '--surface-2': '#3d2810',
            '--border': 'rgba(251,191,36,0.12)',
            '--border-light': 'rgba(251,191,36,0.18)',
            '--text': '#fef3c7',
            '--text-muted': '#c8a860',
            '--text-dim': '#7a6530',
            '--accent': '#fbbf24',
            '--accent-light': '#fcd34d',
            '--accent-dark': '#d4980a',
            '--rose': '#f97316',
            '--rose-light': '#fb923c',
            '--gold': '#fbbf24',
            '--gold-dark': '#d4980a',
            '--teal': '#34d399',
            '--gradient-main': 'linear-gradient(135deg, #fbbf24, #f97316)',
            '--gradient-gold': 'linear-gradient(135deg, #fbbf24, #ef4444)',
            '--gradient-cool': 'linear-gradient(135deg, #34d399, #fbbf24)',
            '--shadow-glow': '0 0 40px rgba(251,191,36,0.18)',
            '--navbar-bg': 'rgba(26,14,4,0.88)',
            '--loading-bg': 'rgba(26,14,4,0.95)'
        }
    }
};

let currentTheme = localStorage.getItem('astromap_theme') || 'cosmic';

function initThemeSystem() {
    applyTheme(currentTheme);
    createThemeToggleBtn();
    createThemePickerPanel();
    // Set dark/light toggle icon
    const darkBtn = document.getElementById('dark-toggle');
    if (darkBtn) darkBtn.textContent = currentTheme === 'moonlight' ? '☀️' : '🌙';
}

function createThemeToggleBtn() {
    const btn = document.createElement('div');
    btn.className = 'theme-toggle';
    btn.title = 'Tema Değiştir';
    btn.innerHTML = themes[currentTheme].icon;
    btn.addEventListener('click', () => toggleThemePanel());
    document.body.appendChild(btn);
}

function createThemePickerPanel() {
    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'theme-panel';
    
    const themeKeys = Object.keys(themes);
    const cards = themeKeys.map(key => {
        const t = themes[key];
        const isActive = key === currentTheme;
        const lockIcon = t.premium ? '<span class="theme-lock">🔒</span>' : '';
        const activeClass = isActive ? ' active' : '';
        const premiumClass = t.premium ? ' premium' : '';
        return `
            <div class="theme-card${activeClass}${premiumClass}" data-theme="${key}" onclick="selectTheme('${key}')">
                <div class="theme-preview">
                    <div class="theme-preview-bg" style="background:${t.vars['--bg']}">
                        <div class="theme-preview-accent" style="background:${t.vars['--gradient-main']}"></div>
                        <div class="theme-preview-dots">
                            ${t.preview.map(c => `<span style="background:${c}"></span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="theme-card-info">
                    <span class="theme-card-icon">${t.icon}</span>
                    <span class="theme-card-name">${t.name}</span>
                    ${lockIcon}
                </div>
                ${isActive ? '<div class="theme-active-badge">✓ Aktif</div>' : ''}
            </div>
        `;
    }).join('');
    
    panel.innerHTML = `
        <div class="theme-panel-header">
            <h3>✦ Tema Seç</h3>
            <button class="theme-panel-close" onclick="toggleThemePanel()">✕</button>
        </div>
        <div class="theme-panel-grid">${cards}</div>
        <div class="theme-panel-hint">🔒 Premium temalar için <a href="javascript:void(0)" onclick="navigateTo('pricing');toggleThemePanel();">yükselt</a></div>
    `;
    document.body.appendChild(panel);
}

function toggleThemePanel() {
    const panel = document.getElementById('theme-panel');
    if (!panel) return;
    panel.classList.toggle('open');
    SoundFX.play('click');
}

function selectTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    // Premium check
    if (theme.premium && !isPremiumUser()) {
        showToast('Bu tema Premium kullanıcılara özel. Yükseltmek için Fiyatlar sayfasına git.');
        navigateTo('pricing');
        toggleThemePanel();
        return;
    }
    
    applyTheme(themeName);
    
    // Update theme panel UI
    document.querySelectorAll('.theme-card').forEach(card => {
        const isThis = card.dataset.theme === themeName;
        card.classList.toggle('active', isThis);
        const badge = card.querySelector('.theme-active-badge');
        if (badge) badge.remove();
        if (isThis) {
            const b = document.createElement('div');
            b.className = 'theme-active-badge';
            b.textContent = '✓ Aktif';
            card.appendChild(b);
        }
    });
    
    // Update toggle button icon
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.innerHTML = theme.icon;
        btn.style.transform = 'scale(1.3) rotate(360deg)';
        setTimeout(() => btn.style.transform = '', 500);
    }
    
    // Update map tiles if map is active
    updateMapTiles(themeName);
    
    showToast(`${theme.icon} ${theme.name} teması aktif`);
    SoundFX.play('click');
}

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    const root = document.documentElement;
    for (const [prop, val] of Object.entries(theme.vars)) {
        root.style.setProperty(prop, val);
    }
    document.body.dataset.theme = themeName;
    
    // Special class for light themes
    document.body.classList.toggle('light-theme', themeName === 'moonlight');
    
    currentTheme = themeName;
    localStorage.setItem('astromap_theme', themeName);
}

function updateMapTiles(themeName) {
    if (!map) return;
    const theme = themes[themeName];
    if (!theme) return;
    // Remove old tile layers
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    L.tileLayer(theme.tileUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
}

function cycleTheme() {
    const keys = isPremiumUser()
        ? Object.keys(themes)
        : Object.keys(themes).filter(k => !themes[k].premium);
    const idx = keys.indexOf(currentTheme);
    const next = keys[(idx + 1) % keys.length];
    selectTheme(next);
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
    // Keyboard navigation for nav-links (ARIA roles already in HTML)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const pageId = link.getAttribute('data-nav') || link.getAttribute('data-page');
                if (pageId) navigateTo(pageId);
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
