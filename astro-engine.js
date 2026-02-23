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

    // ── BIRTH LOCATIONS ──
    const BIRTH_LOCATIONS = {
        istanbul: { lat: 41.01, lon: 28.98 }, ankara: { lat: 39.93, lon: 32.86 },
        izmir: { lat: 38.42, lon: 27.14 }, antalya: { lat: 36.90, lon: 30.70 },
        bursa: { lat: 40.19, lon: 29.06 }, london: { lat: 51.51, lon: -0.13 },
        newyork: { lat: 40.71, lon: -74.01 }, berlin: { lat: 52.52, lon: 13.41 },
        tokyo: { lat: 35.68, lon: 139.69 }, paris: { lat: 48.86, lon: 2.35 },
        moscow: { lat: 55.76, lon: 37.62 }, dubai: { lat: 25.20, lon: 55.27 },
        amsterdam: { lat: 52.37, lon: 4.90 }, barcelona: { lat: 41.39, lon: 2.17 },
        roma: { lat: 41.90, lon: 12.50 }, mumbai: { lat: 19.08, lon: 72.88 },
        beijing: { lat: 39.90, lon: 116.40 }, sydney: { lat: -33.87, lon: 151.21 },
        cairo: { lat: 30.04, lon: 31.24 }, buenosaires: { lat: -34.60, lon: -58.38 }
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
        function normDeg(d) { return ((d % 360) + 360) % 360; }

        // Sun
        const M_sun = normDeg(357.5291 + 35999.0503 * T);
        const Mrad = M_sun * Math.PI / 180;
        const C = 1.9146 * Math.sin(Mrad) + 0.02 * Math.sin(2 * Mrad);
        const sunLon = normDeg(280.4665 + 36000.7698 * T + C);

        // Mean motions for other planets (simplified)
        const meanMotions = {
            moon: { L0: 218.3165, rate: 481267.8813, offset: 0 },
            mercury: { L0: 252.2509, rate: 149472.6746, offset: 0 },
            venus: { L0: 181.9798, rate: 58517.8157, offset: 0 },
            mars: { L0: 355.4330, rate: 19140.2993, offset: 0 },
            jupiter: { L0: 34.3515, rate: 3034.9057, offset: 0 },
            saturn: { L0: 50.0774, rate: 1222.1138, offset: 0 },
            uranus: { L0: 314.0550, rate: 428.4677, offset: 0 },
            neptune: { L0: 304.8800, rate: 218.4862, offset: 0 },
            pluto: { L0: 238.9290, rate: 145.2078, offset: 0 }
        };

        const positions = {};
        const sunDeg = normDeg(sunLon);
        const sunSign = SIGNS[Math.floor(sunDeg / 30)];
        positions.sun = { longitude: sunDeg, sign: sunSign.name, signSymbol: sunSign.symbol, degree: sunDeg % 30, element: sunSign.element };

        for (const [planet, mm] of Object.entries(meanMotions)) {
            const lon = normDeg(mm.L0 + mm.rate * T + mm.offset);
            const sign = SIGNS[Math.floor(lon / 30)];
            positions[planet] = { longitude: lon, sign: sign.name, signSymbol: sign.symbol, degree: lon % 30, element: sign.element };
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

        for (const [planetKey, lines] of Object.entries(planetaryLines)) {
            for (const [lineType, points] of Object.entries(lines)) {
                let minDist = Infinity;
                for (const [pLat, pLon] of points) {
                    const dLat = city.lat - pLat;
                    // Weight longitude difference by cos(latitude) for more accurate distance
                    const dLon = (city.lon - pLon) * Math.cos(city.lat * Math.PI / 180);
                    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
                    if (dist < minDist) minDist = dist;
                }
                // Wider Gaussian (sigma=28) so cities within ~30° get meaningful scores
                const proximity = Math.exp(-Math.pow(minDist, 2) / (2 * Math.pow(28, 2)));

                let prefWeight = 0;
                for (const pref of preferences) {
                    prefWeight += (PREFERENCE_PLANET_WEIGHTS[pref] || {})[planetKey] || 0;
                }
                if (prefWeight === 0) prefWeight = 0.35;

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
        }

        // Multiple strong lines bonus (convergence)
        const convergenceBonus = Math.min(15, strongLineCount * 1.5);

        // Lifestyle bonus (increased values)
        let lifestyleBonus = 0;
        if (lifestyle.climate && lifestyle.climate !== 'any' && city.climate === lifestyle.climate) lifestyleBonus += 12;
        if (lifestyle['city-size'] && lifestyle['city-size'] !== 'any' && city.size === lifestyle['city-size']) lifestyleBonus += 8;
        if (lifestyle.nature && lifestyle.nature !== 'any' && city.nature === lifestyle.nature) lifestyleBonus += 7;

        // Region preference bonus (stronger)
        let regionBonus = 0;
        if (lifestyle.region === 'tr' && city.region === 'tr') regionBonus = 14;
        else if (lifestyle.region === 'europe' && city.region === 'europe') regionBonus = 10;
        else if (lifestyle.region === 'asia' && city.region === 'asia') regionBonus = 10;
        else if (lifestyle.region === 'americas' && city.region === 'americas') regionBonus = 10;

        // Vibe match (stronger)
        const vibeKeywords = {
            love: ['romantic', 'artistic', 'cultural'], career: ['business', 'innovative', 'cosmopolitan'],
            peace: ['peaceful', 'spiritual', 'traditional'], luck: ['vibrant', 'cosmopolitan', 'diverse'],
            creativity: ['artistic', 'bohemian', 'cultural'], adventure: ['adventurous', 'vibrant', 'diverse'],
            growth: ['spiritual', 'historic', 'innovative'], learning: ['academic', 'cultural', 'historic']
        };
        let vibeMatch = false;
        let vibeCount = 0;
        for (const pref of preferences) {
            const kws = vibeKeywords[pref] || [];
            if (city.vibe && city.vibe.some(v => kws.includes(v))) { vibeMatch = true; vibeCount++; }
        }
        if (vibeMatch) lifestyleBonus += 8 + vibeCount * 2;

        // Natal element match
        const cityElementMap = { warm: 'fire', cold: 'water', moderate: 'earth' };
        const cityElement = cityElementMap[city.climate] || 'air';
        const dominantElement = getDominantElement(positions);
        if (cityElement === dominantElement) lifestyleBonus += 6;

        // Harmonic resonance bonus — based on how well the top influences align
        const topInfluences = influences.filter(inf => parseFloat(inf.proximity) > 0.4);
        const harmonicBonus = Math.min(10, topInfluences.length * 2);

        // Calculate final score with higher base multiplier (92 instead of 80)
        const astroBase = maxPossible > 0 ? (totalScore / maxPossible) * 92 : 0;
        const raw = astroBase + lifestyleBonus + regionBonus + convergenceBonus + harmonicBonus;
        
        // Minimum floor of 35 for any city (they all have some astrological connection)
        const score = Math.min(98, Math.max(35, Math.round(raw)));

        influences.sort((a, b) => parseFloat(b.proximity) - parseFloat(a.proximity));

        return { score, influences: influences.slice(0, 5), lifestyleMatch: lifestyleBonus > 12, vibeMatch };
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
    // CORE: Main Calculate (Astrocartography)
    // ────────────────────────────────────────
    function calculate(birthDate, birthTime, birthCity, preferences, lifestyle) {
        const jd = toJulianDay(birthDate, birthTime);
        const natalChart = calculatePlanetPositions(jd);

        const birthLocation = BIRTH_LOCATIONS[birthCity] || BIRTH_LOCATIONS.istanbul;
        const allPlanetaryLines = calculatePlanetaryLines(natalChart, birthLocation.lat);

        const cities = CITY_DATABASE.ALL_CITIES;

        function generateReason(city, result, prefs) {
            const topInf = result.influences[0];
            const prefLabels = {
                love: 'aşk', career: 'kariyer', peace: 'huzur', luck: 'şans',
                creativity: 'yaratıcılık', growth: 'dönüşüm', adventure: 'macera', learning: 'öğrenme'
            };
            const prefStr = prefs.map(p => prefLabels[p]).filter(Boolean).join(', ');
            if (topInf) {
                return `${topInf.symbol} ${topInf.planet} ${topInf.lineType} çizgisine yakın — ${prefStr || 'genel uyum'} için güçlü.`;
            }
            return `${prefStr ? prefStr.charAt(0).toUpperCase() + prefStr.slice(1) : 'Genel uyum'} enerjisi hissediliyor.`;
        }

        const scoredCities = cities.map(city => {
            const result = scoreCity(city, allPlanetaryLines, natalChart, preferences, lifestyle);
            return { ...city, ...result, reason: generateReason(city, result, preferences) };
        }).sort((a, b) => b.score - a.score);

        const transits = calculateTransits(natalChart);

        return {
            natalChart,
            planetaryLines: allPlanetaryLines,
            recommendations: scoredCities,
            birthLocation,
            transits
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
        // v3 new features
        generateDailyHoroscope,
        calculateCompatibility,
        calculateMoonPhase,
        getCrystalRecommendations,
        getDominantElement
    };
})();
