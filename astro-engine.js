/**
 * ============================================
 * AstroEngine v3 — Premium Astrocartography Engine
 * Natal Chart, Daily Horoscope, Compatibility,
 * Moon Phase, Crystal Rx, Transit Timing
 * ============================================
 */
const AstroEngine = (function () {

    // ── PLANETS ──
    const PLANETS = {
        sun:     { name: 'Güneş',   symbol: '☉', color: '#FFD700', element: 'fire' },
        moon:    { name: 'Ay',      symbol: '☽', color: '#C0C0C0', element: 'water' },
        mercury: { name: 'Merkür',  symbol: '☿', color: '#87CEEB', element: 'air' },
        venus:   { name: 'Venüs',   symbol: '♀', color: '#FF69B4', element: 'earth' },
        mars:    { name: 'Mars',    symbol: '♂', color: '#FF4444', element: 'fire' },
        jupiter: { name: 'Jüpiter', symbol: '♃', color: '#9B59B6', element: 'fire' },
        saturn:  { name: 'Satürn',  symbol: '♄', color: '#8B7355', element: 'earth' },
        uranus:  { name: 'Uranüs',  symbol: '♅', color: '#00CED1', element: 'air' },
        neptune: { name: 'Neptün',  symbol: '♆', color: '#4169E1', element: 'water' },
        pluto:   { name: 'Plüton',  symbol: '♇', color: '#800020', element: 'water' }
    };

    const SIGNS = [
        { name: 'Koç',     symbol: '♈', element: 'fire',  quality: 'cardinal', ruler: 'mars' },
        { name: 'Boğa',    symbol: '♉', element: 'earth', quality: 'fixed',    ruler: 'venus' },
        { name: 'İkizler', symbol: '♊', element: 'air',   quality: 'mutable',  ruler: 'mercury' },
        { name: 'Yengeç',  symbol: '♋', element: 'water', quality: 'cardinal', ruler: 'moon' },
        { name: 'Aslan',   symbol: '♌', element: 'fire',  quality: 'fixed',    ruler: 'sun' },
        { name: 'Başak',   symbol: '♍', element: 'earth', quality: 'mutable',  ruler: 'mercury' },
        { name: 'Terazi',  symbol: '♎', element: 'air',   quality: 'cardinal', ruler: 'venus' },
        { name: 'Akrep',   symbol: '♏', element: 'water', quality: 'fixed',    ruler: 'pluto' },
        { name: 'Yay',     symbol: '♐', element: 'fire',  quality: 'mutable',  ruler: 'jupiter' },
        { name: 'Oğlak',   symbol: '♑', element: 'earth', quality: 'cardinal', ruler: 'saturn' },
        { name: 'Kova',    symbol: '♒', element: 'air',   quality: 'fixed',    ruler: 'uranus' },
        { name: 'Balık',   symbol: '♓', element: 'water', quality: 'mutable',  ruler: 'neptune' }
    ];

    // ── PREFERENCE → PLANET WEIGHTS ──
    const PREFERENCE_PLANET_WEIGHTS = {
        love:       { venus: 1.0, moon: 0.7, neptune: 0.5, sun: 0.3, mars: 0.4 },
        career:     { sun: 1.0, saturn: 0.8, jupiter: 0.7, mars: 0.5, mercury: 0.4 },
        peace:      { moon: 1.0, neptune: 0.6, venus: 0.5, jupiter: 0.4 },
        luck:       { jupiter: 1.0, sun: 0.6, venus: 0.5, uranus: 0.3 },
        creativity: { neptune: 1.0, venus: 0.7, uranus: 0.6, moon: 0.5, pluto: 0.3 },
        growth:     { pluto: 1.0, saturn: 0.7, jupiter: 0.6, uranus: 0.5 },
        adventure:  { mars: 1.0, uranus: 0.8, jupiter: 0.6, sun: 0.4 },
        learning:   { mercury: 1.0, jupiter: 0.7, uranus: 0.5, saturn: 0.3 }
    };

    const LINE_TYPE_WEIGHTS = { mc: 1.0, ic: 0.8, asc: 0.9, dsc: 0.7 };

    // ── ZODIAC SIGN RECOMMENDATIONS ──
    // Returns recommended lifestyle preferences based on sun sign
    function getSignRecommendations(sunSign) {
        const map = {
            'Koç':      { climate: 'warm',     size: 'mega',   nature: 'urban',    prefs: ['adventure', 'career'] },
            'Boğa':     { climate: 'moderate',  size: 'medium', nature: 'mountain', prefs: ['peace', 'love'] },
            'İkizler':  { climate: 'moderate',  size: 'mega',   nature: 'urban',    prefs: ['learning', 'creativity'] },
            'Yengeç':   { climate: 'moderate',  size: 'medium', nature: 'coastal',  prefs: ['peace', 'love'] },
            'Aslan':    { climate: 'warm',      size: 'mega',   nature: 'urban',    prefs: ['career', 'creativity'] },
            'Başak':    { climate: 'moderate',  size: 'medium', nature: 'mountain', prefs: ['learning', 'growth'] },
            'Terazi':   { climate: 'moderate',  size: 'mega',   nature: 'coastal',  prefs: ['love', 'creativity'] },
            'Akrep':    { climate: 'cold',      size: 'medium', nature: 'mountain', prefs: ['growth', 'adventure'] },
            'Yay':      { climate: 'warm',      size: 'mega',   nature: 'coastal',  prefs: ['adventure', 'luck'] },
            'Oğlak':    { climate: 'cold',      size: 'mega',   nature: 'urban',    prefs: ['career', 'growth'] },
            'Kova':     { climate: 'cold',      size: 'medium', nature: 'urban',    prefs: ['creativity', 'learning'] },
            'Balık':    { climate: 'moderate',  size: 'small',  nature: 'coastal',  prefs: ['peace', 'creativity'] }
        };
        return map[sunSign] || { climate: 'any', size: 'any', nature: 'any', prefs: ['love', 'career'] };
    }

    // ── BIRTH LOCATIONS (expanded — 100+ cities) ──
    const BIRTH_LOCATIONS = {
        // Turkey
        istanbul: { lat: 41.01, lon: 28.98, tz: 3 }, ankara: { lat: 39.93, lon: 32.86, tz: 3 },
        izmir: { lat: 38.42, lon: 27.14, tz: 3 }, antalya: { lat: 36.90, lon: 30.70, tz: 3 },
        bursa: { lat: 40.19, lon: 29.06, tz: 3 }, adana: { lat: 37.00, lon: 35.32, tz: 3 },
        gaziantep: { lat: 37.07, lon: 37.38, tz: 3 }, konya: { lat: 37.87, lon: 32.48, tz: 3 },
        mersin: { lat: 36.80, lon: 34.63, tz: 3 }, diyarbakir: { lat: 37.92, lon: 40.23, tz: 3 },
        kayseri: { lat: 38.73, lon: 35.49, tz: 3 }, eskisehir: { lat: 39.78, lon: 30.52, tz: 3 },
        trabzon: { lat: 41.00, lon: 39.72, tz: 3 }, samsun: { lat: 41.29, lon: 36.33, tz: 3 },
        denizli: { lat: 37.77, lon: 29.09, tz: 3 }, mugla: { lat: 37.22, lon: 28.36, tz: 3 },
        erzurum: { lat: 39.90, lon: 41.27, tz: 3 }, malatya: { lat: 38.35, lon: 38.31, tz: 3 },
        bodrum: { lat: 37.04, lon: 27.43, tz: 3 },
        // Europe
        london: { lat: 51.51, lon: -0.13, tz: 0 }, berlin: { lat: 52.52, lon: 13.41, tz: 1 },
        paris: { lat: 48.86, lon: 2.35, tz: 1 }, amsterdam: { lat: 52.37, lon: 4.90, tz: 1 },
        barcelona: { lat: 41.39, lon: 2.17, tz: 1 }, roma: { lat: 41.90, lon: 12.50, tz: 1 },
        madrid: { lat: 40.42, lon: -3.70, tz: 1 }, vienna: { lat: 48.21, lon: 16.37, tz: 1 },
        prague: { lat: 50.08, lon: 14.44, tz: 1 }, budapest: { lat: 47.50, lon: 19.04, tz: 1 },
        zurich: { lat: 47.38, lon: 8.54, tz: 1 }, munich: { lat: 48.14, lon: 11.58, tz: 1 },
        brussels: { lat: 50.85, lon: 4.35, tz: 1 }, copenhagen: { lat: 55.68, lon: 12.57, tz: 1 },
        oslo: { lat: 59.91, lon: 10.75, tz: 1 }, stockholm: { lat: 59.33, lon: 18.07, tz: 1 },
        helsinki: { lat: 60.17, lon: 24.94, tz: 2 }, athens: { lat: 37.98, lon: 23.73, tz: 2 },
        bucharest: { lat: 44.43, lon: 26.10, tz: 2 }, warsaw: { lat: 52.23, lon: 21.01, tz: 1 },
        lisbon: { lat: 38.72, lon: -9.14, tz: 0 }, dublin: { lat: 53.35, lon: -6.26, tz: 0 },
        edinburgh: { lat: 55.95, lon: -3.19, tz: 0 }, milan: { lat: 45.46, lon: 9.19, tz: 1 },
        hamburg: { lat: 53.55, lon: 10.00, tz: 1 }, lyon: { lat: 45.76, lon: 4.84, tz: 1 },
        moscow: { lat: 55.76, lon: 37.62, tz: 3 }, stpetersburg: { lat: 59.93, lon: 30.32, tz: 3 },
        kyiv: { lat: 50.45, lon: 30.52, tz: 2 }, sofia: { lat: 42.70, lon: 23.32, tz: 2 },
        belgrade: { lat: 44.79, lon: 20.47, tz: 1 }, zagreb: { lat: 45.81, lon: 15.98, tz: 1 },
        // Americas
        newyork: { lat: 40.71, lon: -74.01, tz: -5 }, losangeles: { lat: 34.05, lon: -118.24, tz: -8 },
        chicago: { lat: 41.88, lon: -87.63, tz: -6 }, houston: { lat: 29.76, lon: -95.37, tz: -6 },
        miami: { lat: 25.76, lon: -80.19, tz: -5 }, sanfrancisco: { lat: 37.77, lon: -122.42, tz: -8 },
        seattle: { lat: 47.61, lon: -122.33, tz: -8 }, boston: { lat: 42.36, lon: -71.06, tz: -5 },
        washington: { lat: 38.91, lon: -77.04, tz: -5 }, toronto: { lat: 43.65, lon: -79.38, tz: -5 },
        vancouver: { lat: 49.28, lon: -123.12, tz: -8 }, montreal: { lat: 45.50, lon: -73.57, tz: -5 },
        mexicocity: { lat: 19.43, lon: -99.13, tz: -6 }, buenosaires: { lat: -34.60, lon: -58.38, tz: -3 },
        saopaulo: { lat: -23.55, lon: -46.63, tz: -3 }, bogota: { lat: 4.71, lon: -74.07, tz: -5 },
        lima: { lat: -12.05, lon: -77.04, tz: -5 }, santiago: { lat: -33.45, lon: -70.67, tz: -4 },
        // Asia & Middle East
        tokyo: { lat: 35.68, lon: 139.69, tz: 9 }, beijing: { lat: 39.90, lon: 116.40, tz: 8 },
        shanghai: { lat: 31.23, lon: 121.47, tz: 8 }, seoul: { lat: 37.57, lon: 126.98, tz: 9 },
        mumbai: { lat: 19.08, lon: 72.88, tz: 5.5 }, delhi: { lat: 28.61, lon: 77.21, tz: 5.5 },
        bangalore: { lat: 12.97, lon: 77.59, tz: 5.5 }, dubai: { lat: 25.20, lon: 55.27, tz: 4 },
        abudhabi: { lat: 24.45, lon: 54.65, tz: 4 }, riyadh: { lat: 24.69, lon: 46.72, tz: 3 },
        tehran: { lat: 35.69, lon: 51.39, tz: 3.5 }, baghdad: { lat: 33.31, lon: 44.37, tz: 3 },
        singapore: { lat: 1.35, lon: 103.82, tz: 8 }, bangkok: { lat: 13.76, lon: 100.50, tz: 7 },
        jakarta: { lat: -6.21, lon: 106.85, tz: 7 }, kualalumpur: { lat: 3.14, lon: 101.69, tz: 8 },
        hongkong: { lat: 22.32, lon: 114.17, tz: 8 }, taipei: { lat: 25.03, lon: 121.57, tz: 8 },
        osaka: { lat: 34.69, lon: 135.50, tz: 9 }, manila: { lat: 14.60, lon: 120.98, tz: 8 },
        hanoi: { lat: 21.03, lon: 105.85, tz: 7 }, baku: { lat: 40.41, lon: 49.87, tz: 4 },
        tbilisi: { lat: 41.72, lon: 44.79, tz: 4 }, yerevan: { lat: 40.18, lon: 44.51, tz: 4 },
        // Africa
        cairo: { lat: 30.04, lon: 31.24, tz: 2 }, lagos: { lat: 6.52, lon: 3.38, tz: 1 },
        nairobi: { lat: -1.29, lon: 36.82, tz: 3 }, capetown: { lat: -33.93, lon: 18.42, tz: 2 },
        johannesburg: { lat: -26.20, lon: 28.05, tz: 2 }, casablanca: { lat: 33.57, lon: -7.59, tz: 1 },
        tunis: { lat: 36.81, lon: 10.17, tz: 1 }, algiers: { lat: 36.75, lon: 3.04, tz: 1 },
        addisababa: { lat: 9.02, lon: 38.75, tz: 3 }, accra: { lat: 5.56, lon: -0.20, tz: 0 },
        // Oceania
        sydney: { lat: -33.87, lon: 151.21, tz: 10 }, melbourne: { lat: -37.81, lon: 144.96, tz: 10 },
        auckland: { lat: -36.85, lon: 174.76, tz: 12 }, brisbane: { lat: -27.47, lon: 153.03, tz: 10 },
        perth: { lat: -31.95, lon: 115.86, tz: 8 }
    };

    // ────────────────────────────────────────
    // CORE: Julian Day & Planet Positions
    // ────────────────────────────────────────
    function toJulianDay(date, time) {
        const [y, m, d] = date.split('-').map(Number);
        const [h, min] = time.split(':').map(Number);
        const decimalDay = d + (h + min / 60) / 24;
        let jy = y, jm = m;
        if (jm <= 2) { jy--; jm += 12; }
        const A = Math.floor(jy / 100);
        const B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + decimalDay + B - 1524.5;
    }

    function calculatePlanetPositions(jd) {
        const T = (jd - 2451545.0) / 36525;
        const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
        const deg2rad = Math.PI / 180;
        const rad2deg = 180 / Math.PI;
        function normDeg(d) { return ((d % 360) + 360) % 360; }

        // Solve Kepler's equation: M = E - e*sin(E) via Newton-Raphson
        function solveKepler(M_deg, e) {
            let M = normDeg(M_deg) * deg2rad;
            let E = M;
            for (let i = 0; i < 20; i++) {
                const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E));
                E += dE;
                if (Math.abs(dE) < 1e-12) break;
            }
            return E;
        }

        // Get heliocentric ecliptic cartesian coordinates from orbital elements
        function getHeliocentricXYZ(L_deg, wbar_deg, e, a, I_deg, Omega_deg) {
            const M = normDeg(L_deg - wbar_deg);
            const E = solveKepler(M, e);
            const sinE = Math.sin(E), cosE = Math.cos(E);
            const denom = 1 - e * cosE;
            const sinv = Math.sqrt(1 - e * e) * sinE / denom;
            const cosv = (cosE - e) / denom;
            const v = Math.atan2(sinv, cosv);
            const r = a * denom; // distance from Sun
            const omega = (wbar_deg - Omega_deg) * deg2rad;
            const I = I_deg * deg2rad;
            const Omega = Omega_deg * deg2rad;
            const cosO = Math.cos(Omega), sinO = Math.sin(Omega);
            const cosI = Math.cos(I);
            const cos_vw = Math.cos(v + omega), sin_vw = Math.sin(v + omega);
            const x = r * (cosO * cos_vw - sinO * sin_vw * cosI);
            const y = r * (sinO * cos_vw + cosO * sin_vw * cosI);
            return { x, y, r };
        }

        // ── Nutation in longitude (Meeus Ch.22, IAU 1980 — dominant terms) ──
        function calcNutation(T2) {
            const Om = normDeg(125.04452 - 1934.136261 * T2) * deg2rad;
            const Ls = normDeg(280.4665 + 36000.7698 * T2) * deg2rad;
            const Lm = normDeg(218.3165 + 481267.8813 * T2) * deg2rad;
            // Nutation in longitude (arcseconds)
            const dpsi = -17.20 * Math.sin(Om) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * Om);
            return dpsi / 3600; // convert to degrees
        }

        // ── Aberration correction (~20.5" constant of aberration) ──
        function calcAberration(sunLon_deg) {
            return -20.4898 / 3600; // constant aberration in degrees (simplified)
        }

        // NASA/JPL Keplerian orbital elements at J2000 + rates per Julian century
        const orbitalElements = {
            mercury: { a: 0.38709927, e0: 0.20563593, eR: 0.00001906, I0: 7.00497902, IR: -0.00594749, L0: 252.25032350, LR: 149472.67411175, w0: 77.45779628, wR: 0.16047689, O0: 48.33076593, OR: -0.12534081 },
            venus:   { a: 0.72333566, e0: 0.00677672, eR: -0.00004107, I0: 3.39467605, IR: -0.00078890, L0: 181.97909950, LR: 58517.81538729, w0: 131.60246718, wR: 0.00268329, O0: 76.67984255, OR: -0.27769418 },
            earth:   { a: 1.00000261, e0: 0.01671123, eR: -0.00004392, I0: 0, IR: 0, L0: 100.46457166, LR: 35999.37244981, w0: 102.93768193, wR: 0.32327364, O0: 0, OR: 0 },
            mars:    { a: 1.52371034, e0: 0.09339410, eR: 0.00007882, I0: 1.84969142, IR: -0.00813131, L0: 355.45332267, LR: 19140.30268499, w0: 336.05637041, wR: 0.44441088, O0: 49.55953891, OR: -0.29257343 },
            jupiter: { a: 5.20288700, e0: 0.04838624, eR: -0.00013253, I0: 1.30439695, IR: -0.00183714, L0: 34.39644051, LR: 3034.74612775, w0: 14.72847983, wR: 0.21252668, O0: 100.47390909, OR: 0.20469106 },
            saturn:  { a: 9.53667594, e0: 0.05386179, eR: -0.00050991, I0: 2.48599187, IR: 0.00193609, L0: 49.95424423, LR: 1222.49362201, w0: 92.59887831, wR: -0.41897216, O0: 113.66242448, OR: -0.28867794 },
            uranus:  { a: 19.18916464, e0: 0.04725744, eR: -0.00004397, I0: 0.77263783, IR: -0.00242939, L0: 313.23810451, LR: 428.48202785, w0: 170.95427630, wR: 0.40805281, O0: 74.01692503, OR: 0.04240589 },
            neptune: { a: 30.06992276, e0: 0.00859048, eR: 0.00005105, I0: 1.77004347, IR: 0.00035372, L0: 304.87997031, LR: 218.45945325, w0: 44.96476227, wR: -0.32241464, O0: 131.78422574, OR: -0.00508664 },
            pluto:   { a: 39.48211675, e0: 0.24882730, eR: 0.00005170, I0: 17.14001206, IR: 0.00004818, L0: 238.92903833, LR: 145.20780515, w0: 224.06891629, wR: -0.04062942, O0: 110.30393684, OR: -0.01183482 }
        };

        // ── NASA/JPL perturbation corrections for outer planets ──
        function applyPerturbations(key, L, T2) {
            if (key === 'jupiter') {
                return L - 0.00012452 * T2 * T2 + 0.06064060 * Math.cos(38.35125000 * deg2rad * T2)
                    + -0.35635438 * Math.sin(38.35125000 * deg2rad * T2);
            } else if (key === 'saturn') {
                return L + 0.00025899 * T2 * T2 + -0.13434469 * Math.cos(38.35125000 * deg2rad * T2)
                    + 0.87320147 * Math.sin(38.35125000 * deg2rad * T2);
            } else if (key === 'uranus') {
                return L + 0.00058331 * T2 * T2 + -0.97731848 * Math.cos(7.67025000 * deg2rad * T2)
                    + 0.17689245 * Math.sin(7.67025000 * deg2rad * T2);
            } else if (key === 'neptune') {
                return L + -0.00041348 * T2 * T2 + 0.68346318 * Math.cos(7.67025000 * deg2rad * T2)
                    + -0.10162547 * Math.sin(7.67025000 * deg2rad * T2);
            } else if (key === 'pluto') {
                return L + -0.01262724 * T2 * T2;
            }
            return L;
        }

        // ── Earth's heliocentric position (needed for geocentric conversion) ──
        const eE = orbitalElements.earth;
        const earthXYZ = getHeliocentricXYZ(
            eE.L0 + eE.LR * T, eE.w0 + eE.wR * T,
            eE.e0 + eE.eR * T, eE.a, 0, 0
        );

        // ── Nutation & Aberration corrections ──
        const nutationDeg = calcNutation(T);

        // ── General precession: J2000 → mean equinox of date (for planets) ──
        const precessionDeg = (5029.0966 * T + 1.1120 * T * T) / 3600;

        // ── Sun — Meeus Ch.25 high-accuracy formula (tropical, ~0.01° precision) ──
        const L0_sun = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
        const M_sun = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
        const M_sun_rad = M_sun * deg2rad;
        const C_sun = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_sun_rad)
                    + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun_rad)
                    + 0.000289 * Math.sin(3 * M_sun_rad);
        const sunTrueLon = normDeg(L0_sun + C_sun);
        // Apparent longitude: add nutation + aberration (Meeus eq.25.8)
        const omega_nut = normDeg(125.04 - 1934.136 * T) * deg2rad;
        const sunLon = normDeg(sunTrueLon - 0.00569 - 0.00478 * Math.sin(omega_nut));

        // ── Moon — Meeus Ch.47 full ELP2000 computation (~0.01° accuracy) ──
        // Fundamental arguments with full polynomial terms (Meeus Ch.47)
        const Lp = normDeg(218.3164477 + 481267.88123421*T - 0.0015786*T2 + T3/538841 - T4/65194000);
        const D  = normDeg(297.8501921 + 445267.1114034*T - 0.0018819*T2 + T3/545868 - T4/113065000);
        const Ms = normDeg(357.5291092 + 35999.0502909*T - 0.0001536*T2 + T3/24490000);
        const Mp = normDeg(134.9633964 + 477198.8675055*T + 0.0087414*T2 + T3/69699 - T4/14712000);
        const F  = normDeg(93.272095 + 483202.0175233*T - 0.0036539*T2 - T3/3526000 + T4/863310000);
        // E factor for terms involving Sun's mean anomaly M (Meeus p.338)
        const Efac = 1 - 0.002516*T - 0.0000074*T2;
        const Efac2 = Efac * Efac;
        // Additional Venus & Jupiter perturbation arguments
        const A1 = normDeg(119.75 + 131.849*T);
        const A2 = normDeg(53.09 + 479264.290*T);
        const A3 = normDeg(313.45 + 481266.484*T);
        // Table 47.A — 60 periodic terms for Moon longitude [D, M, M', F, Σl×10⁻⁶°]
        const LT = [
            [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],
            [0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],
            [2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],
            [0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],
            [4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
            [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],
            [2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],
            [2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],
            [0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],
            [2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
            [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],
            [2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],
            [4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],
            [1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],
            [0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294],[2,0,-1,-2,0]
        ];
        let sumL = 0;
        for (const [cD, cM, cMp, cF, lC] of LT) {
            if (lC === 0) continue;
            const arg = cD*D + cM*Ms + cMp*Mp + cF*F;
            let c = lC;
            if (Math.abs(cM) === 1) c *= Efac;
            else if (Math.abs(cM) === 2) c *= Efac2;
            sumL += c * Math.sin(arg * deg2rad);
        }
        // Additional corrections for Venus, Jupiter & flattening (Meeus p.338)
        sumL += 3958*Math.sin(A1*deg2rad) + 1962*Math.sin((Lp - F)*deg2rad) + 318*Math.sin(A2*deg2rad);
        const moonLon = normDeg(Lp + sumL / 1000000);

        // ── Build positions ──
        // Helper: convert decimal degrees to { deg, min, sec } with proper carry
        function toDMS(decimalDeg) {
            let totalSec = Math.round(Math.abs(decimalDeg) * 3600);
            let s = totalSec % 60;
            totalSec = Math.floor(totalSec / 60);
            let m = totalSec % 60;
            let d = Math.floor(totalSec / 60);
            return { deg: d, min: m, sec: s };
        }

        function formatDMS(decimalDeg) {
            const { deg, min, sec } = toDMS(decimalDeg);
            return `${deg}°${String(min).padStart(2,'0')}'${String(sec).padStart(2,'0')}"`;
        }

        const positions = {};
        const sunSign = SIGNS[Math.floor(sunLon / 30)];
        const sunDeg = sunLon % 30;
        positions.sun = { longitude: sunLon, sign: sunSign.name, signSymbol: sunSign.symbol, degree: sunDeg, dms: toDMS(sunDeg), dmsStr: formatDMS(sunDeg), element: sunSign.element };

        // Apply nutation to Moon
        const moonLonCorrected = normDeg(moonLon + nutationDeg);
        const moonSign = SIGNS[Math.floor(moonLonCorrected / 30)];
        const moonDeg = moonLonCorrected % 30;
        positions.moon = { longitude: moonLonCorrected, sign: moonSign.name, signSymbol: moonSign.symbol, degree: moonDeg, dms: toDMS(moonDeg), dmsStr: formatDMS(moonDeg), element: moonSign.element };

        // ── Planets: heliocentric → geocentric conversion with corrections ──
        const planetKeys = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        for (const key of planetKeys) {
            const el = orbitalElements[key];
            let L = el.L0 + el.LR * T;
            // Apply NASA/JPL perturbation corrections for outer planets
            L = applyPerturbations(key, L, T);
            const e = el.e0 + el.eR * T;
            const I = el.I0 + el.IR * T;
            const wbar = el.w0 + el.wR * T;
            const Om = el.O0 + el.OR * T;
            const helio = getHeliocentricXYZ(L, wbar, e, el.a, I, Om);
            // Geocentric = planet heliocentric - Earth heliocentric
            const xGeo = helio.x - earthXYZ.x;
            const yGeo = helio.y - earthXYZ.y;
            // Apply precession (J2000→tropical) + nutation + annual aberration
            const rawLon = Math.atan2(yGeo, xGeo) * rad2deg + precessionDeg + nutationDeg;
            // Annual aberration: Δλ ≈ -20.4898" × cos(λ_sun - λ) (Meeus Ch.23)
            const aberrDeg = -20.4898 / 3600 * Math.cos((sunLon - rawLon) * deg2rad);
            const geoLon = normDeg(rawLon + aberrDeg);
            const sign = SIGNS[Math.floor(geoLon / 30)];
            const pDeg = geoLon % 30;
            positions[key] = { longitude: geoLon, sign: sign.name, signSymbol: sign.symbol, degree: pDeg, dms: toDMS(pDeg), dmsStr: formatDMS(pDeg), element: sign.element };
        }
        return positions;
    }

    // ────────────────────────────────────────
    // CORE: Planetary Lines
    // ────────────────────────────────────────
    function calculatePlanetaryLines(positions, birthLat) {
        const lines = {};
        for (const [planetKey, pos] of Object.entries(positions)) {
            const lon = pos.longitude;
            lines[planetKey] = {
                mc: [], ic: [], asc: [], dsc: []
            };
            for (let lat = -70; lat <= 70; lat += 2) {
                const mcLon = normDeg360(lon - 180);
                const icLon = normDeg360(lon);
                const latRad = lat * Math.PI / 180;
                const obliquity = 23.4393;
                const oblRad = obliquity * Math.PI / 180;
                const decl = Math.asin(Math.sin(oblRad) * Math.sin(lon * Math.PI / 180));
                const ascShift = Math.atan2(Math.sin(decl) * Math.cos(latRad), Math.cos(decl)) * 180 / Math.PI;
                const ascLon = normDeg360(mcLon - 90 + ascShift);
                const dscLon = normDeg360(ascLon + 180);

                lines[planetKey].mc.push([lat, normToMapLon(mcLon)]);
                lines[planetKey].ic.push([lat, normToMapLon(icLon)]);
                lines[planetKey].asc.push([lat, normToMapLon(ascLon)]);
                lines[planetKey].dsc.push([lat, normToMapLon(dscLon)]);
            }
        }
        return lines;
    }

    function normDeg360(d) { return ((d % 360) + 360) % 360; }
    function normToMapLon(lon) { return lon > 180 ? lon - 360 : lon; }

    // ────────────────────────────────────────
    // CORE: Score Cities
    // ────────────────────────────────────────
    function scoreCity(city, planetaryLines, positions, preferences, lifestyle) {
        let totalScore = 0;
        let maxPossible = 0;
        const influences = [];
        let strongLineCount = 0; // track how many lines are close

        // Track closest line distance per planet for uniqueness
        const planetMinDists = {};

        for (const [planetKey, lines] of Object.entries(planetaryLines)) {
            let bestPlanetDist = Infinity;
            for (const [lineType, points] of Object.entries(lines)) {
                let minDist = Infinity;
                for (const [pLat, pLon] of points) {
                    const dLat = city.lat - pLat;
                    // Weight longitude difference by cos(latitude) for more accurate distance
                    const dLon = (city.lon - pLon) * Math.cos(city.lat * Math.PI / 180);
                    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
                    if (dist < minDist) minDist = dist;
                }
                if (minDist < bestPlanetDist) bestPlanetDist = minDist;
                
                // Gaussian proximity — sigma=15 for tighter differentiation
                const proximity = Math.exp(-Math.pow(minDist, 2) / (2 * Math.pow(15, 2)));

                let prefWeight = 0;
                for (const pref of preferences) {
                    prefWeight += (PREFERENCE_PLANET_WEIGHTS[pref] || {})[planetKey] || 0;
                }
                if (prefWeight === 0) prefWeight = 0.25;

                const lineWeight = LINE_TYPE_WEIGHTS[lineType] || 0.5;
                const contribution = proximity * prefWeight * lineWeight;
                totalScore += contribution;
                maxPossible += prefWeight * lineWeight;

                // Track strong influences
                if (proximity > 0.5) strongLineCount++;

                if (proximity > 0.2) {
                    influences.push({
                        planet: PLANETS[planetKey].name, planetKey, symbol: PLANETS[planetKey].symbol,
                        lineType: lineType.toUpperCase(), proximity: proximity.toFixed(2),
                        color: PLANETS[planetKey].color
                    });
                }
            }
            planetMinDists[planetKey] = bestPlanetDist;
        }

        // Multiple strong lines bonus (convergence) — key astro differentiator
        const convergenceBonus = Math.min(20, strongLineCount * 3);

        // Lifestyle bonus — gentle nudge, not a dominator
        let lifestyleBonus = 0;
        if (lifestyle.climate && lifestyle.climate !== 'any' && city.climate === lifestyle.climate) lifestyleBonus += 3;
        if (lifestyle.size && lifestyle.size !== 'any' && city.size === lifestyle.size) lifestyleBonus += 2;
        if (lifestyle.nature && lifestyle.nature !== 'any' && city.nature === lifestyle.nature) lifestyleBonus += 3;

        // Lifestyle PENALTY for mismatches (filter effect)
        let lifestylePenalty = 0;
        if (lifestyle.climate && lifestyle.climate !== 'any' && city.climate !== lifestyle.climate) lifestylePenalty += 6;
        if (lifestyle.size && lifestyle.size !== 'any' && city.size !== lifestyle.size) lifestylePenalty += 3;
        if (lifestyle.nature && lifestyle.nature !== 'any' && city.nature !== lifestyle.nature) lifestylePenalty += 5;

        // Region preference bonus
        let regionBonus = 0;
        if (lifestyle.region && lifestyle.region !== 'any') {
            if (lifestyle.region === 'tr' && city.region === 'tr') regionBonus = 4;
            else if (city.region === lifestyle.region) regionBonus = 3;
            else regionBonus = -3;
        }

        // Vibe match — minimal, just a tiebreaker (not a major factor)
        let vibeMatch = false;
        if (city.vibe && preferences.length > 0) {
            for (const pref of preferences) {
                if (city.vibe.includes(pref)) { vibeMatch = true; break; }
            }
        }
        const vibeBonus = vibeMatch ? 2 : 0; // Tiny tiebreaker only

        // Natal element match — stronger astro tie
        const cityElementMap = { warm: 'fire', cold: 'water', moderate: 'earth' };
        const cityElement = cityElementMap[city.climate] || 'air';
        const dominantElement = getDominantElement(positions);
        const elementBonus = cityElement === dominantElement ? 6 : 0;

        // Harmonic resonance bonus — based on how well the top influences align
        const topInfluences = influences.filter(inf => parseFloat(inf.proximity) > 0.4);
        const harmonicBonus = Math.min(14, topInfluences.length * 3);

        // Uniqueness jitter — wider range for more variety in results
        const coordHash = Math.sin(city.lat * 12.9898 + city.lon * 78.233) * 43758.5453;
        const uniqueJitter = (coordHash - Math.floor(coordHash)) * 10 - 5; // -5 to +5

        // Size modifier — NO mega bonus (prevents Liverpool/Hamburg bias)
        let sizeMod = 0;
        if (city.size === 'small') sizeMod = -2;
        // medium and mega both get 0

        // Calculate final score — astro DOMINATES (90 base), bonuses capped
        const astroBase = maxPossible > 0 ? (totalScore / maxPossible) * 90 : 0;
        const raw = astroBase + lifestyleBonus - lifestylePenalty + regionBonus + convergenceBonus + harmonicBonus + vibeBonus + elementBonus + sizeMod + uniqueJitter;
        
        // Floor of 12 — distant/unmatched cities should clearly score low
        const score = Math.min(98, Math.max(12, Math.round(raw)));

        influences.sort((a, b) => parseFloat(b.proximity) - parseFloat(a.proximity));

        return { score, influences: influences.slice(0, 5), lifestyleMatch: lifestyleBonus > 6, vibeMatch };
    }

    function getDominantElement(positions) {
        const counts = { fire: 0, earth: 0, air: 0, water: 0 };
        for (const pos of Object.values(positions)) { counts[pos.element] = (counts[pos.element] || 0) + 1; }
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    // ────────────────────────────────────────
    // CORE: Transit Analysis
    // ────────────────────────────────────────
    function calculateTransits(natalPositions) {
        const now = new Date();
        const jdNow = toJulianDay(
            `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`,
            `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        );
        const currentPositions = calculatePlanetPositions(jdNow);
        const transits = [];

        const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        const aspects = [
            { name: 'Kavuşum', angle: 0, orb: 8, quality: 'powerful' },
            { name: 'Trigon', angle: 120, orb: 6, quality: 'good' },
            { name: 'Sekstil', angle: 60, orb: 5, quality: 'good' },
            { name: 'Kare', angle: 90, orb: 6, quality: 'challenging' },
            { name: 'Karşıt', angle: 180, orb: 7, quality: 'challenging' }
        ];

        for (const transitKey of outerPlanets) {
            const transitPos = currentPositions[transitKey];
            for (const [natalKey, natalPos] of Object.entries(natalPositions)) {
                let diff = Math.abs(transitPos.longitude - natalPos.longitude);
                if (diff > 180) diff = 360 - diff;

                for (const aspect of aspects) {
                    const orbDiff = Math.abs(diff - aspect.angle);
                    if (orbDiff <= aspect.orb) {
                        transits.push({
                            transitKey, natalKey,
                            transitPlanet: PLANETS[transitKey], natalPlanet: PLANETS[natalKey],
                            aspect: aspect.name, quality: aspect.quality,
                            exactness: orbDiff,
                            description: `Transit ${PLANETS[transitKey].name} natal ${PLANETS[natalKey].name} ile ${aspect.name} açısında`
                        });
                    }
                }
            }
        }
        transits.sort((a, b) => a.exactness - b.exactness);
        return transits.slice(0, 10);
    }

    // ────────────────────────────────────────
    // NEW: Daily Horoscope Generator
    // ────────────────────────────────────────
    function generateDailyHoroscope(birthDate, birthTime) {
        const jdBirth = toJulianDay(birthDate, birthTime);
        const natal = calculatePlanetPositions(jdBirth);
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const jdToday = toJulianDay(todayStr, '12:00');
        const todayPos = calculatePlanetPositions(jdToday);

        const sunSign = natal.sun.sign;
        const moonSign = natal.moon.sign;
        const risingElement = natal.sun.element;

        // Seed daily variation
        const daySeed = Math.floor(jdToday) + Math.floor(natal.sun.longitude);

        // Generate scores
        const love = seededScore(daySeed, 1);
        const career = seededScore(daySeed, 2);
        const health = seededScore(daySeed, 3);
        const luck = seededScore(daySeed, 4);
        const energy = seededScore(daySeed, 5);
        const mood = seededScore(daySeed, 6);

        // Pick daily messages based on seed
        const generalMsgs = [
            `Bugün ${sunSign} enerjisi güçlü. İçsel sesini dinle ve cesur adımlar at.`,
            `${moonSign} Ay'ın bugün duygusal derinlik katıyor. Hislerini bastırma, akışına bırak.`,
            `Venüs etkisi altında bugün güzellik ve sevgi ön planda. Kendine güzel bir şey yap.`,
            `Mars enerjisi bugün yüksek — motivasyonun zirved. Bu enerjiyi iyi kullan.`,
            `Jüpiter'in desteğiyle bugün şans kapıları açılabilir. Yeni fırsatlara açık ol.`,
            `Merkür iletişimi güçlendiriyor. Önemli konuşmaları bugüne planla.`,
            `Bugün iç huzuruna odaklan. Meditasyon ve doğa yürüyüşleri iyi gelecek.`,
            `Satürn disiplin istiyor. Bugün yapman gereken ama ertelediğin işlere odaklan.`,
            `Yaratıcılığın bugün parlıyor. Sanatsal aktiviteler seni besleyecek.`,
            `Dönüşüm enerjisi güçlü. Eski kalıplarını kırmak için ideal bir gün.`
        ];
        const loveMsgs = [
            `Aşk hayatında bugün sürprizler olabilir. Gözlerini aç! 💕`,
            `Partnerinle derin bir bağ kurabilirsin bugün. Kalbini aç.`,
            `Venüs sana gülümsüyor — çekiciliğin dorukta! ✨`,
            `Bugün duygusal olarak hassassın. Sevdiklerinle nazik ol.`,
            `Romantik bir jest veya beklenmedik bir mesaj yolda olabilir.`,
            `Kendi kendini sevmeyi unutma. Self-care günü yap! 🌸`,
            `İlişkinde denge arayışı öne çıkıyor. Verdiğin kadar al.`,
            `Bugün flört enerjisi yüksek. Yeni tanışmalar kapıda!`
        ];
        const careerMsgs = [
            `Kariyer konusunda büyük adımlar atabilirsin. Özgüvenin tam!`,
            `Bugün yaratıcı projeler ön plana çıkıyor. Fikirlerini paylaş.`,
            `İş arkadaşlarınla uyum güçlü. Takım çalışması verimli olacak.`,
            `Finansal konularda dikkatli ol. İmpulsif harcamalardan kaçın.`,
            `Yeni fırsatlar kapıda — network'ünü genişletmenin tam zamanı.`,
            `Bugün detaylara odaklan. Küçük şeyler büyük fark yaratır.`
        ];

        const general = generalMsgs[daySeed % generalMsgs.length];
        const loveMsg = loveMsgs[(daySeed + 3) % loveMsgs.length];
        const careerMsg = careerMsgs[(daySeed + 7) % careerMsgs.length];

        // Lucky items
        const colors = ['Lavanta', 'Rose Gold', 'Okyanus Mavisi', 'Zümrüt Yeşili', 'Altın', 'Mercan', 'Mor', 'Gümüş', 'Bej', 'Turkuaz'];
        const numbers = [3, 7, 9, 11, 13, 17, 21, 22, 27, 33];
        const crystals = ['Ametist', 'Roze Kuvars', 'Aytaşı', 'Sitrin', 'Labradorit', 'Akuamarin', 'Lapis Lazuli', 'Yeşim', 'Turkuaz', 'Obsidyen'];

        return {
            sunSign, moonSign,
            date: todayStr,
            scores: { love, career, health, luck, energy, mood },
            general, loveMsg, careerMsg,
            luckyColor: colors[daySeed % colors.length],
            luckyNumber: numbers[(daySeed + 2) % numbers.length],
            luckyStone: crystals[(daySeed + 4) % crystals.length],
            element: risingElement,
            affirmation: generateAffirmation(daySeed, sunSign)
        };
    }

    function seededScore(seed, offset) {
        const x = Math.sin(seed * 9301 + offset * 49297) * 0.5 + 0.5;
        return Math.floor(x * 40 + 60); // 60-100 range
    }

    function generateAffirmation(seed, sign) {
        const affirmations = [
            `Ben ${sign} gücüyle parlayan, eşsiz bir varlığım.`,
            `Evren benim için en güzel yolları hazırlıyor.`,
            `Bugün sevgiyi hem vermeye hem almaya açığım.`,
            `İçimdeki ışık her geçen gün daha parlak yanıyor.`,
            `Hayatıma giren her şey en yüksek iyiliğim için.`,
            `Ben bolluk ve bereket çekmeye hazırım.`,
            `Bugün sezgilerime güveniyorum, doğru yoldayım.`,
            `Kendi hikayemin yazarıyım ve bugün güzel bir sayfa başlıyor.`,
            `Evrenin sonsuz desteğini hissediyorum.`,
            `Ben tam olarak olmam gereken yerdeyim — ve daha da güzel yerlere gidiyorum.`
        ];
        return affirmations[seed % affirmations.length];
    }

    // ────────────────────────────────────────
    // NEW: Compatibility / Synastry Engine
    // ────────────────────────────────────────
    function calculateCompatibility(person1, person2) {
        const jd1 = toJulianDay(person1.date, person1.time || '12:00');
        const jd2 = toJulianDay(person2.date, person2.time || '12:00');
        const natal1 = calculatePlanetPositions(jd1);
        const natal2 = calculatePlanetPositions(jd2);

        const aspects = [];
        let totalHarmony = 0;
        let totalTension = 0;
        let count = 0;

        const importantPairs = [
            ['sun', 'sun'], ['sun', 'moon'], ['moon', 'moon'], ['venus', 'mars'],
            ['sun', 'venus'], ['moon', 'venus'], ['venus', 'venus'], ['mars', 'mars'],
            ['sun', 'mars'], ['moon', 'mars'], ['jupiter', 'sun'], ['saturn', 'venus']
        ];

        for (const [p1Key, p2Key] of importantPairs) {
            const pos1 = natal1[p1Key];
            const pos2 = natal2[p2Key];
            let diff = Math.abs(pos1.longitude - pos2.longitude);
            if (diff > 180) diff = 360 - diff;

            const aspectTypes = [
                { name: 'Kavuşum ☌', angle: 0, orb: 10, type: 'conjunction', weight: 1.2 },
                { name: 'Trigon △', angle: 120, orb: 8, type: 'harmony', weight: 1.0 },
                { name: 'Sekstil ⚹', angle: 60, orb: 6, type: 'harmony', weight: 0.8 },
                { name: 'Kare □', angle: 90, orb: 8, type: 'tension', weight: -0.6 },
                { name: 'Karşıt ☍', angle: 180, orb: 8, type: 'opposition', weight: 0.3 }
            ];

            for (const asp of aspectTypes) {
                const orbDiff = Math.abs(diff - asp.angle);
                if (orbDiff <= asp.orb) {
                    const strength = 1 - (orbDiff / asp.orb);
                    if (asp.type === 'harmony' || asp.type === 'conjunction') {
                        totalHarmony += strength * asp.weight;
                    } else if (asp.type === 'tension') {
                        totalTension += strength * Math.abs(asp.weight);
                    } else {
                        totalHarmony += strength * asp.weight * 0.5;
                        totalTension += strength * 0.3;
                    }
                    count++;
                    aspects.push({
                        planet1: `${PLANETS[p1Key].symbol} ${PLANETS[p1Key].name}`,
                        planet2: `${PLANETS[p2Key].symbol} ${PLANETS[p2Key].name}`,
                        aspect: asp.name, type: asp.type, strength: (strength * 100).toFixed(0),
                        description: getSynastryDescription(p1Key, p2Key, asp.type)
                    });
                    break;
                }
            }
        }

        // Element compatibility
        const elem1 = getDominantElement(natal1);
        const elem2 = getDominantElement(natal2);
        const elementCompat = {
            'fire-fire': 0.8, 'fire-air': 0.9, 'fire-earth': 0.4, 'fire-water': 0.3,
            'earth-earth': 0.7, 'earth-water': 0.8, 'earth-air': 0.5, 'air-air': 0.7,
            'air-water': 0.4, 'water-water': 0.8
        };
        const elemKey = [elem1, elem2].sort().join('-');
        const elemScore = elementCompat[elemKey] || 0.5;

        // Category scores
        const romance = Math.min(98, Math.floor((totalHarmony / Math.max(count, 1)) * 60 + elemScore * 30 + 15));
        const communication = Math.min(98, Math.floor(seededScore(Math.floor(jd1 + jd2), 1) * 0.6 + elemScore * 25 + 10));
        const passion = Math.min(98, Math.floor((totalHarmony + totalTension * 0.5) / Math.max(count, 1) * 50 + 30));
        const longTerm = Math.min(98, Math.floor((totalHarmony - totalTension * 0.3) / Math.max(count, 1) * 55 + elemScore * 25 + 15));
        const overall = Math.min(98, Math.round((romance * 0.3 + communication * 0.2 + passion * 0.2 + longTerm * 0.3)));

        return {
            overall, romance, communication, passion, longTerm,
            aspects: aspects.slice(0, 8),
            element1: elem1, element2: elem2, elementMatch: elemScore,
            sign1: natal1.sun.sign, sign2: natal2.sun.sign,
            moon1: natal1.moon.sign, moon2: natal2.moon.sign,
            venus1: natal1.venus.sign, venus2: natal2.venus.sign,
            summary: getCompatibilitySummary(overall, natal1.sun.sign, natal2.sun.sign)
        };
    }

    function getSynastryDescription(p1, p2, type) {
        const descs = {
            'sun-sun-harmony': 'Temel kişilikleriniz uyumlu — birbirinizi doğal olarak anlıyorsunuz.',
            'sun-sun-tension': 'Farklı kişilikler çatışabilir ama birbirinizden çok şey öğrenebilirsiniz.',
            'sun-moon-harmony': 'Duygusal bir bağ çok güçlü — birbirinizi derinden hissediyorsunuz.',
            'sun-moon-conjunction': 'Ruh eşi bağlantısı! Birbirinizin aynasısınız.',
            'venus-mars-harmony': 'Fiziksel ve romantik çekim çok güçlü! 🔥',
            'venus-mars-conjunction': 'Karşı konulmaz bir çekim var aranızda.',
            'venus-mars-tension': 'Tutku yüksek ama ego çatışmaları olabilir.',
            'moon-moon-harmony': 'Duygusal dünyalarınız uyumlu — evde huzur bulursunuz.',
            'venus-venus-harmony': 'Aşk dilleriniz aynı — birbirinizi mutlu etmeyi biliyorsunuz.',
            'sun-venus-harmony': 'Birbirinize hayranlık duyuyorsunuz. Romantik bir bağ güçlü.',
        };
        const key = `${p1}-${p2}-${type}`;
        return descs[key] || `${PLANETS[p1].name} ve ${PLANETS[p2].name} arasında ${type === 'harmony' ? 'uyumlu' : 'zorlayıcı'} bir enerji var.`;
    }

    function getCompatibilitySummary(score, sign1, sign2) {
        if (score >= 85) return `${sign1} ve ${sign2} — Muhteşem bir uyum! Yıldızlar bu bağlantıyı destekliyor. Birlikte olağanüstü şeyler başarabilirsiniz. ✨`;
        if (score >= 70) return `${sign1} ve ${sign2} — Güçlü bir bağ var aranızda. Bazı farklılıklar olsa da birbirinizi güzel tamamlıyorsunuz. 💫`;
        if (score >= 55) return `${sign1} ve ${sign2} — Orta düzeyde bir uyum. Birlikte çalışmanız ve anlayış göstermeniz gerekebilir. 🌙`;
        return `${sign1} ve ${sign2} — Zorlayıcı ama dönüştürücü bir bağ. Birbirinize çok şey öğretebilirsiniz. 🔥`;
    }

    // ────────────────────────────────────────
    // NEW: Moon Phase Calculator
    // ────────────────────────────────────────
    function calculateMoonPhase(date) {
        const d = date || new Date();
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();

        // Metonic cycle approximation
        let c = 0, e = 0;
        if (month < 3) { c = year - 1; e = month + 12; } else { c = year; e = month; }
        const jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
        const daysSinceNew = (jd - 2451550.1) % 29.530588853;
        const phase = ((daysSinceNew < 0 ? daysSinceNew + 29.53 : daysSinceNew) / 29.53);
        const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100;

        let phaseName, phaseEmoji, phaseDesc;
        if (phase < 0.03 || phase >= 0.97) { phaseName = 'Yeni Ay'; phaseEmoji = '🌑'; phaseDesc = 'Yeni başlangıçlar, niyet koyma ve içe dönme zamanı. Tohumlarını ek.'; }
        else if (phase < 0.22) { phaseName = 'Hilal (Büyüyen)'; phaseEmoji = '🌒'; phaseDesc = 'Niyetlerin filizleniyor. Harekete geç, cesur ol.'; }
        else if (phase < 0.28) { phaseName = 'İlk Dördün'; phaseEmoji = '🌓'; phaseDesc = 'Karar zamanı. Engellerle yüzleş ve yoluna devam et.'; }
        else if (phase < 0.47) { phaseName = 'Şişkin Ay (Büyüyen)'; phaseEmoji = '🌔'; phaseDesc = 'Sabırlı ol, meyveler olgunlaşıyor. Detayları düzelt.'; }
        else if (phase < 0.53) { phaseName = 'Dolunay'; phaseEmoji = '🌕'; phaseDesc = 'Tamamlanma ve aydınlanma! Duygular yoğun, gerçekler ortaya çıkar. Kutla! ✨'; }
        else if (phase < 0.72) { phaseName = 'Şişkin Ay (Küçülen)'; phaseEmoji = '🌖'; phaseDesc = 'Şükret ve paylaş. Fazlalıkları bırakma zamanı.'; }
        else if (phase < 0.78) { phaseName = 'Son Dördün'; phaseEmoji = '🌗'; phaseDesc = 'Eski kalıpları kır. Bırakman gerekeni bırak.'; }
        else { phaseName = 'Hilal (Küçülen)'; phaseEmoji = '🌘'; phaseDesc = 'Dinlen, arın, hazırlan. Yeni döngü yaklaşıyor.'; }

        // Calculate next full/new moon (approx)
        const daysToFull = ((0.5 - phase + 1) % 1) * 29.53;
        const daysToNew = ((1 - phase) % 1) * 29.53;
        const nextFull = new Date(d.getTime() + daysToFull * 86400000);
        const nextNew = new Date(d.getTime() + daysToNew * 86400000);

        // Moon sign
        const jdNow = toJulianDay(
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, '12:00'
        );
        const positions = calculatePlanetPositions(jdNow);
        const moonSign = SIGNS[Math.floor(positions.moon.longitude / 30)];

        // Rituals
        const rituals = getMoonRituals(phaseName);

        return {
            phase, phaseName, phaseEmoji, phaseDesc, illumination: illumination.toFixed(1),
            moonSign: moonSign.name, moonSignSymbol: moonSign.symbol, moonElement: moonSign.element,
            nextFull: nextFull.toLocaleDateString('tr-TR'),
            nextNew: nextNew.toLocaleDateString('tr-TR'),
            rituals
        };
    }

    function getMoonRituals(phaseName) {
        const rituals = {
            'Yeni Ay': ['🕯️ Niyet mumu yakma ritüeli', '📝 Niyet listeni yaz', '🧘‍♀️ Sessiz meditasyon', '🌱 Yeni bir bitki dik'],
            'Hilal (Büyüyen)': ['✍️ Hedeflerini gözden geçir', '🏃‍♀️ Yeni bir egzersiz başla', '📚 İlham veren bir kitap aç'],
            'İlk Dördün': ['💪 Zorluklarla yüzleş', '🗣️ Ertelediğin konuşmayı yap', '🧹 Fiziksel alanını temizle'],
            'Şişkin Ay (Büyüyen)': ['🎨 Yaratıcı bir proje üzerinde çalış', '💆‍♀️ Vücut bakımı ritüeli', '🌿 Doğada zaman geçir'],
            'Dolunay': ['🔮 Kristallerini ay ışığında şarj et', '🛁 Tuzlu su banyosu', '📓 Dolunay günlüğü tut', '🎉 Başarılarını kutla'],
            'Şişkin Ay (Küçülen)': ['🙏 Şükran listeni yaz', '🧘‍♀️ Bırakma meditasyonu', '📦 Eşyalarını azalt'],
            'Son Dördün': ['✂️ Eski alışkanlıkları bırak', '🧹 Dijital detoks yap', '💌 Affetme mektubu yaz'],
            'Hilal (Küçülen)': ['😴 Erken uyu, bol dinlen', '🍵 Bitkisel çay ritüeli', '🌊 Su elementi meditasyonu']
        };
        return rituals[phaseName] || ['🧘‍♀️ Meditasyon yap'];
    }

    // ────────────────────────────────────────
    // NEW: Crystal & Color Recommendations
    // ────────────────────────────────────────
    function getCrystalRecommendations(birthDate, birthTime) {
        const jd = toJulianDay(birthDate, birthTime);
        const natal = calculatePlanetPositions(jd);
        const sunSign = natal.sun.sign;
        const moonSign = natal.moon.sign;
        const dominantElem = getDominantElement(natal);

        const signCrystals = {
            'Koç': { primary: 'Kırmızı Jasper', secondary: 'Karneol', color: '#FF4444', benefit: 'Cesaret ve liderlik enerjisi' },
            'Boğa': { primary: 'Roze Kuvars', secondary: 'Zümrüt', color: '#FF69B4', benefit: 'Sevgi ve bolluk' },
            'İkizler': { primary: 'Sitrin', secondary: 'Akik', color: '#FFD700', benefit: 'İletişim ve zihinsel netlik' },
            'Yengeç': { primary: 'Aytaşı', secondary: 'İnci', color: '#C0C0C0', benefit: 'Duygusal denge ve koruma' },
            'Aslan': { primary: 'Kaplan Gözü', secondary: 'Sitrin', color: '#FF8C00', benefit: 'Özgüven ve yaratıcılık' },
            'Başak': { primary: 'Amazonit', secondary: 'Yeşim', color: '#00CED1', benefit: 'Berraklık ve sağlık' },
            'Terazi': { primary: 'Lapis Lazuli', secondary: 'Opal', color: '#4169E1', benefit: 'Denge ve uyum' },
            'Akrep': { primary: 'Obsidyen', secondary: 'Granat', color: '#800020', benefit: 'Dönüşüm ve koruma' },
            'Yay': { primary: 'Turkuaz', secondary: 'Ametist', color: '#40E0D0', benefit: 'Macera ve bilgelik' },
            'Oğlak': { primary: 'Granat', secondary: 'Oniks', color: '#8B0000', benefit: 'Disiplin ve başarı' },
            'Kova': { primary: 'Akuamarin', secondary: 'Fluorit', color: '#00BFFF', benefit: 'Vizyon ve özgürlük' },
            'Balık': { primary: 'Ametist', secondary: 'Aytaşı', color: '#9370DB', benefit: 'Sezgi ve şifa' }
        };

        const elementColors = {
            fire: { palette: ['Kırmızı', 'Turuncu', 'Altın', 'Mercan'], hex: ['#FF4444', '#FF8C00', '#FFD700', '#FF6B6B'] },
            earth: { palette: ['Yeşil', 'Kahve', 'Bej', 'Terrakota'], hex: ['#2ECC71', '#8B4513', '#F5DEB3', '#CC5533'] },
            air: { palette: ['Turkuaz', 'Lavanta', 'Açık Mavi', 'Gümüş'], hex: ['#40E0D0', '#B57EDC', '#87CEEB', '#C0C0C0'] },
            water: { palette: ['Mavi', 'Mor', 'Deniz Yeşili', 'İnci'], hex: ['#4169E1', '#9370DB', '#20B2AA', '#F0EAD6'] }
        };

        const chakraMap = {
            'Koç': { name: 'Kök Çakra', color: '#FF0000', area: 'Güvenlik & Hayatta kalma' },
            'Boğa': { name: 'Sakral Çakra', color: '#FF8C00', area: 'Yaratıcılık & Cinsellik' },
            'İkizler': { name: 'Boğaz Çakra', color: '#00BFFF', area: 'İletişim & İfade' },
            'Yengeç': { name: 'Kalp Çakra', color: '#00FF00', area: 'Sevgi & Şefkat' },
            'Aslan': { name: 'Solar Pleksus', color: '#FFD700', area: 'Güç & Özgüven' },
            'Başak': { name: 'Boğaz Çakra', color: '#00BFFF', area: 'Analiz & Düzen' },
            'Terazi': { name: 'Kalp Çakra', color: '#00FF00', area: 'Denge & İlişkiler' },
            'Akrep': { name: 'Sakral Çakra', color: '#FF8C00', area: 'Dönüşüm & Tutku' },
            'Yay': { name: 'Üçüncü Göz', color: '#4B0082', area: 'Bilgelik & Vizyon' },
            'Oğlak': { name: 'Kök Çakra', color: '#FF0000', area: 'Yapı & Disiplin' },
            'Kova': { name: 'Taç Çakra', color: '#9400D3', area: 'Bilinç & Birlik' },
            'Balık': { name: 'Üçüncü Göz', color: '#4B0082', area: 'Sezgi & Maneviyat' }
        };

        return {
            sunSign,
            moonSign,
            dominantElement: dominantElem,
            crystal: signCrystals[sunSign],
            moonCrystal: signCrystals[moonSign],
            colors: elementColors[dominantElem],
            chakra: chakraMap[sunSign],
            essentialOil: getEssentialOil(sunSign),
            mantra: getMantra(sunSign)
        };
    }

    function getEssentialOil(sign) {
        const oils = {
            'Koç': 'Biberiye — enerji ve odak', 'Boğa': 'Gül — sevgi ve rahatlama',
            'İkizler': 'Nane — zihinsel berraklık', 'Yengeç': 'Papatya — huzur ve şifa',
            'Aslan': 'Portakal — neşe ve özgüven', 'Başak': 'Lavanta — denge ve arınma',
            'Terazi': 'Ylang Ylang — uyum ve çekicilik', 'Akrep': 'Patchouli — dönüşüm ve topraklama',
            'Yay': 'Okaliptüs — özgürlük ve ferahlık', 'Oğlak': 'Sedir ağacı — güç ve kararlılık',
            'Kova': 'Tea tree — yenilenme ve arınma', 'Balık': 'Sandal ağacı — meditasyon ve sezgi'
        };
        return oils[sign] || 'Lavanta — evrensel şifa';
    }

    function getMantra(sign) {
        const mantras = {
            'Koç': 'Ben cesaretimi kucaklıyorum.', 'Boğa': 'Ben bolluğu hak ediyorum.',
            'İkizler': 'Zihnim açık, kalbim meraklı.', 'Yengeç': 'Duygularım benim süper gücüm.',
            'Aslan': 'Ben tam olarak parlamaya hazırım.', 'Başak': 'Kusursuzluk değil, ilerleme arayışındayım.',
            'Terazi': 'Hayatımda denge ve güzellik yaratıyorum.', 'Akrep': 'Dönüşüm beni güçlendiriyor.',
            'Yay': 'Her deneyim beni genişletiyor.', 'Oğlak': 'Adım adım zirveye yürüyorum.',
            'Kova': 'Farklılığım benim gücüm.', 'Balık': 'Sezgilerime güveniyorum.'
        };
        return mantras[sign] || 'Ben evrenin bir parçasıyım.';
    }

    // ────────────────────────────────────────
    // HOUSE CALCULATION — Placidus System
    // ────────────────────────────────────────
    function calculateHouses(jd, lat, lon) {
        const T = (jd - 2451545.0) / 36525;
        const deg2rad = Math.PI / 180;
        const rad2deg = 180 / Math.PI;
        function normDeg(d) { return ((d % 360) + 360) % 360; }

        // Obliquity of ecliptic (Meeus eq. 22.2)
        const eps = (23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T) * deg2rad;

        // Greenwich Mean Sidereal Time (Meeus eq. 12.4)
        const jd0 = Math.floor(jd - 0.5) + 0.5;
        const T0 = (jd0 - 2451545.0) / 36525;
        const theta0 = normDeg(280.46061837 + 360.98564736629 * (jd - 2451545.0)
            + 0.000387933 * T * T - T * T * T / 38710000.0);

        // Local Sidereal Time
        const LST = normDeg(theta0 + lon);
        const RAMC = LST * deg2rad; // in radians

        // MC (Medium Coeli) - Meeus
        const MC = normDeg(Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(eps)) * rad2deg);

        // ASC (Ascendant)
        const latRad = lat * deg2rad;
        const ASC = normDeg(Math.atan2(-Math.cos(RAMC),
            Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(RAMC)) * rad2deg);

        // Placidus house cusps — iterative method
        function placidusCusp(F, latR, epsR) {
            // F = fraction for semi-arc division
            // cusp2: F=1/3 above horizon, cusp3: F=2/3 above
            // cusp11: F=2/3 below horizon, cusp12: F=1/3 below
            let RA = RAMC + F * Math.PI;
            for (let i = 0; i < 20; i++) {
                const tanD = Math.sin(RA) * Math.tan(epsR);
                const D = Math.atan(tanD);
                const AD = Math.asin(Math.tan(latR) * Math.tan(D));
                const RAn = RAMC + F * (Math.PI / 2 + AD) * 2;
                if (Math.abs(RAn - RA) < 1e-8) { RA = RAn; break; }
                RA = RAn;
            }
            return normDeg(Math.atan2(Math.sin(RA), Math.cos(RA) * Math.cos(epsR)) * rad2deg);
        }

        // Calculate intermediate cusps using Placidus
        const cusps = new Array(13); // cusps[1]-cusps[12]
        cusps[1] = ASC;
        cusps[10] = MC;
        cusps[7] = normDeg(ASC + 180);
        cusps[4] = normDeg(MC + 180);

        // Check if Placidus is possible at this latitude
        const absLat = Math.abs(lat);
        if (absLat < 66.5) {
            // Placidus cusps
            cusps[11] = placidusCusp(1/3, latRad, eps);
            cusps[12] = placidusCusp(2/3, latRad, eps);
            cusps[2] = placidusCusp(4/3, latRad, eps);
            cusps[3] = placidusCusp(5/3, latRad, eps);
        } else {
            // Equal house fallback for extreme latitudes
            cusps[11] = normDeg(MC + 30);
            cusps[12] = normDeg(MC + 60);
            cusps[2] = normDeg(ASC + 30);
            cusps[3] = normDeg(ASC + 60);
        }

        // Opposite cusps
        cusps[5] = normDeg(cusps[11] + 180);
        cusps[6] = normDeg(cusps[12] + 180);
        cusps[8] = normDeg(cusps[2] + 180);
        cusps[9] = normDeg(cusps[3] + 180);

        return {
            cusps: cusps.slice(1), // cusps[0..11] for houses 1-12
            ascendant: ASC,
            midheaven: MC,
            descendant: normDeg(ASC + 180),
            ic: normDeg(MC + 180)
        };
    }

    // ────────────────────────────────────────
    // NATAL ASPECTS — between planet pairs
    // ────────────────────────────────────────
    function calculateNatalAspects(positions) {
        const ASPECT_TYPES = [
            { name: 'Kavuşum',  symbol: '☌', angle: 0,   orb: 8, color: '#C9A0FF', harmony: 'neutral' },
            { name: 'Sekstil',  symbol: '⚹', angle: 60,  orb: 5, color: '#4ade80', harmony: 'harmonious' },
            { name: 'Kare',     symbol: '□', angle: 90,  orb: 7, color: '#FF4444', harmony: 'tense' },
            { name: 'Trigon',   symbol: '△', angle: 120, orb: 7, color: '#4ade80', harmony: 'harmonious' },
            { name: 'Karşıt',  symbol: '☍', angle: 180, orb: 8, color: '#FF4444', harmony: 'tense' }
        ];

        const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        const aspects = [];

        for (let i = 0; i < planetKeys.length; i++) {
            for (let j = i + 1; j < planetKeys.length; j++) {
                const key1 = planetKeys[i], key2 = planetKeys[j];
                const lon1 = positions[key1].longitude;
                const lon2 = positions[key2].longitude;
                let diff = Math.abs(lon1 - lon2);
                if (diff > 180) diff = 360 - diff;

                for (const asp of ASPECT_TYPES) {
                    const orbDiff = Math.abs(diff - asp.angle);
                    if (orbDiff <= asp.orb) {
                        aspects.push({
                            planet1: key1, planet2: key2,
                            type: asp.name, symbol: asp.symbol,
                            angle: asp.angle, orb: orbDiff,
                            color: asp.color, harmony: asp.harmony
                        });
                        break; // Only one aspect per pair
                    }
                }
            }
        }

        aspects.sort((a, b) => a.orb - b.orb);
        return aspects;
    }

    // ────────────────────────────────────────
    // CORE: Main Calculate (Astrocartography)
    // ────────────────────────────────────────
    function calculate(birthDate, birthTime, birthCity, preferences, lifestyle) {
        // Look up birth location first for timezone conversion (local → UT)
        const birthLocation = BIRTH_LOCATIONS[birthCity] || BIRTH_LOCATIONS.istanbul;
        const tzOffset = birthLocation.tz !== undefined ? birthLocation.tz : Math.round(birthLocation.lon / 15);
        const jd = toJulianDay(birthDate, birthTime) - tzOffset / 24;
        const natalChart = calculatePlanetPositions(jd);

        const allPlanetaryLines = calculatePlanetaryLines(natalChart, birthLocation.lat);

        // Calculate houses & aspects for natal chart display
        const houses = calculateHouses(jd, birthLocation.lat, birthLocation.lon);
        const natalAspects = calculateNatalAspects(natalChart);

        const cities = CITY_DATABASE.ALL_CITIES;

        function generateReason(city, result, prefs) {
            const prefLabels = {
                love: 'aşk', career: 'kariyer', peace: 'huzur', luck: 'şans',
                creativity: 'yaratıcılık', growth: 'dönüşüm', adventure: 'macera', learning: 'öğrenme'
            };
            const lineLabels = { MC: 'Gökyüzü Tepesi', IC: 'Ev & Kök', ASC: 'Yükselen', DSC: 'İlişkiler' };
            const lineContext = {
                MC: 'kariyer ve toplumsal kimlik', IC: 'iç huzur ve aile',
                ASC: 'kişisel enerji ve ilk izlenim', DSC: 'ilişkiler ve ortaklıklar'
            };
            const parts = [];

            // 1. Top 2 planetary influences with context
            const top2 = result.influences.slice(0, 2);
            for (const inf of top2) {
                const lineCtx = lineContext[inf.lineType] || inf.lineType;
                const proxPct = Math.round(parseFloat(inf.proximity) * 100);
                if (proxPct >= 60) {
                    parts.push(`${inf.symbol} ${inf.planet} ${lineLabels[inf.lineType] || inf.lineType} çizgisinde çok güçlü (%${proxPct}) — ${lineCtx} alanını aydınlatıyor`);
                } else if (proxPct >= 35) {
                    parts.push(`${inf.symbol} ${inf.planet} ${inf.lineType} çizgisine yakın (%${proxPct}) — ${lineCtx} enerjisi hissediliyor`);
                }
            }

            // 2. Preference match summary
            if (prefs.length > 0) {
                const prefStr = prefs.map(p => prefLabels[p]).filter(Boolean).join(', ');
                const matchingPlanets = [];
                for (const inf of result.influences.slice(0, 4)) {
                    for (const pref of prefs) {
                        const w = (PREFERENCE_PLANET_WEIGHTS[pref] || {})[inf.planetKey] || 0;
                        if (w >= 0.6) { matchingPlanets.push(inf.planet); break; }
                    }
                }
                if (matchingPlanets.length >= 2) {
                    parts.push(`${prefStr} için ${matchingPlanets.join(' & ')} desteği aktif`);
                } else if (parts.length === 0) {
                    parts.push(`${prefStr.charAt(0).toUpperCase() + prefStr.slice(1)} enerjisi dolaylı yoldan hissediliyor`);
                }
            }

            // 3. Lifestyle / vibe / element resonance
            if (result.lifestyleMatch && result.vibeMatch) {
                parts.push('Yaşam tarzı ve şehir atmosferi haritanla örtüşüyor ✨');
            } else if (result.lifestyleMatch) {
                parts.push('İklim ve şehir büyüklüğü tercihlerinle uyumlu');
            } else if (result.vibeMatch) {
                parts.push('Şehrin enerjisi seçtiğin temalarla rezonans halinde');
            }

            // Fallback if still empty
            if (parts.length === 0) {
                const topInf = result.influences[0];
                if (topInf) {
                    return `${topInf.symbol} ${topInf.planet} etkisi mevcut — genel uyum potansiyeli taşıyor.`;
                }
                return 'Bu bölgede dolaylı gezegen etkisi hissediliyor.';
            }

            return parts.join('. ') + '.';
        }

        const scoredCities = cities.map(city => {
            const result = scoreCity(city, allPlanetaryLines, natalChart, preferences, lifestyle);
            return { ...city, ...result, reason: generateReason(city, result, preferences) };
        }).sort((a, b) => b.score - a.score);

        // ── Geographic Diversity Post-processing ──
        // Ensure top results have geographic AND country diversity
        const diversified = [];
        const remaining = [...scoredCities];
        const GEO_MIN_DIST = 6; // minimum degrees apart for top results
        const TOP_N = 25; // apply diversity to top 25
        const MAX_PER_COUNTRY = 2; // max 2 cities from same country in top 10

        while (diversified.length < TOP_N && remaining.length > 0) {
            const candidate = remaining.shift();

            // Geographic proximity check
            const tooClose = diversified.some(sel => {
                const dLat = candidate.lat - sel.lat;
                const dLon = (candidate.lon - sel.lon) * Math.cos(candidate.lat * Math.PI / 180);
                return Math.sqrt(dLat * dLat + dLon * dLon) < GEO_MIN_DIST;
            });

            // Country diversity check (only for top 10)
            const countryCount = diversified.filter(c => c.country === candidate.country).length;
            const tooManyFromCountry = diversified.length < 10 && countryCount >= MAX_PER_COUNTRY;

            if (diversified.length < 1) {
                // Always allow #1
                diversified.push(candidate);
            } else if (!tooClose && !tooManyFromCountry) {
                diversified.push(candidate);
            } else {
                remaining.push(candidate);
                if (remaining.length <= scoredCities.length - TOP_N) {
                    diversified.push(candidate); // Avoid infinite loop
                }
            }
        }
        // Append rest
        const finalCities = [...diversified, ...remaining];

        const transits = calculateTransits(natalChart);

        return {
            natalChart,
            planetaryLines: allPlanetaryLines,
            recommendations: finalCities,
            birthLocation,
            transits,
            houses,
            natalAspects
        };
    }

    // ── PUBLIC API ──
    return {
        calculate,
        PLANETS,
        SIGNS,
        PREFERENCE_PLANET_WEIGHTS,
        LINE_TYPE_WEIGHTS,
        calculatePlanetPositions,
        calculatePlanetaryLines,
        calculateTransits,
        toJulianDay,
        calculateHouses,
        calculateNatalAspects,
        // v3 new features
        generateDailyHoroscope,
        calculateCompatibility,
        calculateMoonPhase,
        getCrystalRecommendations,
        getDominantElement,
        getSignRecommendations
    };
})();
