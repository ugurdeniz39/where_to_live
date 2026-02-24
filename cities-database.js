/**
 * ============================================
 * AstroMap – Mega City Database
 * 81 Türkiye İli + Tüm Dünya Ülkeleri
 * 600+ Şehir – Her Kıtadan, Her Ülkeden
 * ============================================
 */

const CITY_DATABASE = (() => {

    // =============================================
    // TÜRKİYE – 81 İl + Önemli Turistik Yerler
    // =============================================
    const TURKEY = [
        { city: 'Adana', country: 'Türkiye', region: 'tr', lat: 37.00, lon: 35.32, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Adıyaman', country: 'Türkiye', region: 'tr', lat: 37.76, lon: 38.28, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Afyonkarahisar', country: 'Türkiye', region: 'tr', lat: 38.74, lon: 30.54, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Ağrı', country: 'Türkiye', region: 'tr', lat: 39.72, lon: 43.05, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Aksaray', country: 'Türkiye', region: 'tr', lat: 38.37, lon: 34.03, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Amasya', country: 'Türkiye', region: 'tr', lat: 40.65, lon: 35.83, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Ankara', country: 'Türkiye', region: 'tr', lat: 39.93, lon: 32.86, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Antalya', country: 'Türkiye', region: 'tr', lat: 36.90, lon: 30.69, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Ardahan', country: 'Türkiye', region: 'tr', lat: 41.11, lon: 42.70, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Artvin', country: 'Türkiye', region: 'tr', lat: 41.18, lon: 41.82, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Aydın', country: 'Türkiye', region: 'tr', lat: 37.85, lon: 27.85, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Balıkesir', country: 'Türkiye', region: 'tr', lat: 39.65, lon: 27.89, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Bartın', country: 'Türkiye', region: 'tr', lat: 41.64, lon: 32.34, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace'] },
        { city: 'Batman', country: 'Türkiye', region: 'tr', lat: 37.89, lon: 41.13, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth'] },
        { city: 'Bayburt', country: 'Türkiye', region: 'tr', lat: 40.26, lon: 40.22, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bilecik', country: 'Türkiye', region: 'tr', lat: 40.05, lon: 30.00, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Bingöl', country: 'Türkiye', region: 'tr', lat: 38.89, lon: 40.50, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bitlis', country: 'Türkiye', region: 'tr', lat: 38.40, lon: 42.11, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bolu', country: 'Türkiye', region: 'tr', lat: 40.73, lon: 31.61, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Burdur', country: 'Türkiye', region: 'tr', lat: 37.72, lon: 30.29, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Bursa', country: 'Türkiye', region: 'tr', lat: 40.19, lon: 29.06, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'peace', 'creativity'] },
        { city: 'Çanakkale', country: 'Türkiye', region: 'tr', lat: 40.16, lon: 26.41, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning'] },
        { city: 'Çankırı', country: 'Türkiye', region: 'tr', lat: 40.60, lon: 33.62, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Çorum', country: 'Türkiye', region: 'tr', lat: 40.55, lon: 34.95, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Denizli', country: 'Türkiye', region: 'tr', lat: 37.77, lon: 29.09, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Diyarbakır', country: 'Türkiye', region: 'tr', lat: 37.91, lon: 40.24, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Düzce', country: 'Türkiye', region: 'tr', lat: 40.84, lon: 31.16, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Edirne', country: 'Türkiye', region: 'tr', lat: 41.68, lon: 26.56, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Elazığ', country: 'Türkiye', region: 'tr', lat: 38.67, lon: 39.22, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['learning', 'peace'] },
        { city: 'Erzincan', country: 'Türkiye', region: 'tr', lat: 39.75, lon: 39.49, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Erzurum', country: 'Türkiye', region: 'tr', lat: 39.90, lon: 41.27, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Eskişehir', country: 'Türkiye', region: 'tr', lat: 39.78, lon: 30.52, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'peace'] },
        { city: 'Gaziantep', country: 'Türkiye', region: 'tr', lat: 37.07, lon: 37.38, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Giresun', country: 'Türkiye', region: 'tr', lat: 40.91, lon: 38.39, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace'] },
        { city: 'Gümüşhane', country: 'Türkiye', region: 'tr', lat: 40.46, lon: 39.48, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Hakkari', country: 'Türkiye', region: 'tr', lat: 37.58, lon: 43.74, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Hatay', country: 'Türkiye', region: 'tr', lat: 36.40, lon: 36.35, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Iğdır', country: 'Türkiye', region: 'tr', lat: 39.92, lon: 44.05, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['growth'] },
        { city: 'Isparta', country: 'Türkiye', region: 'tr', lat: 37.76, lon: 30.55, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'İstanbul', country: 'Türkiye', region: 'tr', lat: 41.01, lon: 28.98, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'love', 'creativity', 'adventure'] },
        { city: 'İzmir', country: 'Türkiye', region: 'tr', lat: 38.42, lon: 27.14, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'career', 'peace'] },
        { city: 'Kahramanmaraş', country: 'Türkiye', region: 'tr', lat: 37.58, lon: 36.93, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Karabük', country: 'Türkiye', region: 'tr', lat: 41.20, lon: 32.63, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Karaman', country: 'Türkiye', region: 'tr', lat: 37.18, lon: 33.23, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kars', country: 'Türkiye', region: 'tr', lat: 40.60, lon: 43.09, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Kastamonu', country: 'Türkiye', region: 'tr', lat: 41.39, lon: 33.78, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Kayseri', country: 'Türkiye', region: 'tr', lat: 38.73, lon: 35.49, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Kilis', country: 'Türkiye', region: 'tr', lat: 36.72, lon: 37.12, climate: 'warm', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kırıkkale', country: 'Türkiye', region: 'tr', lat: 39.85, lon: 33.51, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career'] },
        { city: 'Kırklareli', country: 'Türkiye', region: 'tr', lat: 41.74, lon: 27.23, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kırşehir', country: 'Türkiye', region: 'tr', lat: 39.15, lon: 34.17, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace', 'creativity'] },
        { city: 'Kocaeli', country: 'Türkiye', region: 'tr', lat: 40.77, lon: 29.92, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career'] },
        { city: 'Konya', country: 'Türkiye', region: 'tr', lat: 37.87, lon: 32.48, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['peace', 'growth', 'creativity'] },
        { city: 'Kütahya', country: 'Türkiye', region: 'tr', lat: 39.42, lon: 29.98, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Malatya', country: 'Türkiye', region: 'tr', lat: 38.35, lon: 38.31, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Manisa', country: 'Türkiye', region: 'tr', lat: 38.61, lon: 27.43, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Mardin', country: 'Türkiye', region: 'tr', lat: 37.31, lon: 40.74, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Mersin', country: 'Türkiye', region: 'tr', lat: 36.80, lon: 34.63, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Muğla', country: 'Türkiye', region: 'tr', lat: 37.22, lon: 28.36, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Muş', country: 'Türkiye', region: 'tr', lat: 38.95, lon: 41.50, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Nevşehir', country: 'Türkiye', region: 'tr', lat: 38.63, lon: 34.71, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Niğde', country: 'Türkiye', region: 'tr', lat: 37.97, lon: 34.68, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Ordu', country: 'Türkiye', region: 'tr', lat: 41.00, lon: 37.88, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Osmaniye', country: 'Türkiye', region: 'tr', lat: 37.07, lon: 36.25, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Rize', country: 'Türkiye', region: 'tr', lat: 41.02, lon: 40.52, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Sakarya', country: 'Türkiye', region: 'tr', lat: 40.69, lon: 30.40, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace'] },
        { city: 'Samsun', country: 'Türkiye', region: 'tr', lat: 41.29, lon: 36.33, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'peace'] },
        { city: 'Şanlıurfa', country: 'Türkiye', region: 'tr', lat: 37.17, lon: 38.79, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Siirt', country: 'Türkiye', region: 'tr', lat: 37.93, lon: 41.94, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Sinop', country: 'Türkiye', region: 'tr', lat: 42.03, lon: 35.15, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Sivas', country: 'Türkiye', region: 'tr', lat: 39.75, lon: 37.01, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Şırnak', country: 'Türkiye', region: 'tr', lat: 37.42, lon: 42.49, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth'] },
        { city: 'Tekirdağ', country: 'Türkiye', region: 'tr', lat: 40.98, lon: 27.51, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Tokat', country: 'Türkiye', region: 'tr', lat: 40.31, lon: 36.55, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace'] },
        { city: 'Trabzon', country: 'Türkiye', region: 'tr', lat: 41.00, lon: 39.72, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'adventure'] },
        { city: 'Tunceli', country: 'Türkiye', region: 'tr', lat: 39.11, lon: 39.55, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Uşak', country: 'Türkiye', region: 'tr', lat: 38.68, lon: 29.41, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Van', country: 'Türkiye', region: 'tr', lat: 38.49, lon: 43.38, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth', 'peace'] },
        { city: 'Yalova', country: 'Türkiye', region: 'tr', lat: 40.66, lon: 29.27, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Yozgat', country: 'Türkiye', region: 'tr', lat: 39.82, lon: 34.80, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Zonguldak', country: 'Türkiye', region: 'tr', lat: 41.46, lon: 31.80, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'peace'] },
        // Önemli turistik yerler
        { city: 'Bodrum', country: 'Türkiye', region: 'tr', lat: 37.04, lon: 27.43, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Fethiye', country: 'Türkiye', region: 'tr', lat: 36.65, lon: 29.12, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Kapadokya', country: 'Türkiye', region: 'tr', lat: 38.64, lon: 34.83, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth', 'love'] },
        { city: 'Kuşadası', country: 'Türkiye', region: 'tr', lat: 37.86, lon: 27.26, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace', 'adventure'] },
    ];

    // =============================================
    // AVRUPA
    // =============================================
    const EUROPE = [
        // İngiltere & İskoçya & İrlanda
        { city: 'Londra', country: 'İngiltere', region: 'europe', lat: 51.51, lon: -0.13, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity', 'learning'] },
        { city: 'Manchester', country: 'İngiltere', region: 'europe', lat: 53.48, lon: -2.24, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Birmingham', country: 'İngiltere', region: 'europe', lat: 52.49, lon: -1.90, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Liverpool', country: 'İngiltere', region: 'europe', lat: 53.41, lon: -2.98, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Leeds', country: 'İngiltere', region: 'europe', lat: 53.80, lon: -1.55, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Bristol', country: 'İngiltere', region: 'europe', lat: 51.45, lon: -2.59, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'adventure'] },
        { city: 'Brighton', country: 'İngiltere', region: 'europe', lat: 50.82, lon: -0.14, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Cardiff', country: 'Galler', region: 'europe', lat: 51.48, lon: -3.18, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Belfast', country: 'K. İrlanda', region: 'europe', lat: 54.60, lon: -5.93, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Edinburgh', country: 'İskoçya', region: 'europe', lat: 55.95, lon: -3.19, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Glasgow', country: 'İskoçya', region: 'europe', lat: 55.86, lon: -4.25, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Dublin', country: 'İrlanda', region: 'europe', lat: 53.35, lon: -6.26, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'learning'] },
        { city: 'Cork', country: 'İrlanda', region: 'europe', lat: 51.90, lon: -8.47, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },

        // Fransa
        { city: 'Paris', country: 'Fransa', region: 'europe', lat: 48.86, lon: 2.35, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['love', 'creativity', 'career'] },
        { city: 'Lyon', country: 'Fransa', region: 'europe', lat: 45.76, lon: 4.84, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Marsilya', country: 'Fransa', region: 'europe', lat: 43.30, lon: 5.37, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Nice', country: 'Fransa', region: 'europe', lat: 43.71, lon: 7.26, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Bordeaux', country: 'Fransa', region: 'europe', lat: 44.84, lon: -0.58, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Toulouse', country: 'Fransa', region: 'europe', lat: 43.60, lon: 1.44, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Strasbourg', country: 'Fransa', region: 'europe', lat: 48.57, lon: 7.75, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Nantes', country: 'Fransa', region: 'europe', lat: 47.22, lon: -1.55, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Montpellier', country: 'Fransa', region: 'europe', lat: 43.61, lon: 3.88, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['learning', 'love'] },
        { city: 'Lille', country: 'Fransa', region: 'europe', lat: 50.63, lon: 3.06, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },

        // Almanya
        { city: 'Berlin', country: 'Almanya', region: 'europe', lat: 52.52, lon: 13.41, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'learning', 'adventure'] },
        { city: 'Münih', country: 'Almanya', region: 'europe', lat: 48.14, lon: 11.58, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Hamburg', country: 'Almanya', region: 'europe', lat: 53.55, lon: 9.99, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Frankfurt', country: 'Almanya', region: 'europe', lat: 50.11, lon: 8.68, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Köln', country: 'Almanya', region: 'europe', lat: 50.94, lon: 6.96, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Düsseldorf', country: 'Almanya', region: 'europe', lat: 51.23, lon: 6.78, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Stuttgart', country: 'Almanya', region: 'europe', lat: 48.78, lon: 9.18, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career'] },
        { city: 'Hannover', country: 'Almanya', region: 'europe', lat: 52.38, lon: 9.73, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Nürnberg', country: 'Almanya', region: 'europe', lat: 49.45, lon: 11.08, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Leipzig', country: 'Almanya', region: 'europe', lat: 51.34, lon: 12.37, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Dresden', country: 'Almanya', region: 'europe', lat: 51.05, lon: 13.74, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Bremen', country: 'Almanya', region: 'europe', lat: 53.08, lon: 8.80, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Dortmund', country: 'Almanya', region: 'europe', lat: 51.51, lon: 7.47, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Freiburg', country: 'Almanya', region: 'europe', lat: 47.99, lon: 7.85, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'learning'] },

        // Hollanda & Belçika & Lüksemburg
        { city: 'Amsterdam', country: 'Hollanda', region: 'europe', lat: 52.37, lon: 4.90, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Rotterdam', country: 'Hollanda', region: 'europe', lat: 51.92, lon: 4.48, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Den Haag', country: 'Hollanda', region: 'europe', lat: 52.08, lon: 4.30, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'peace'] },
        { city: 'Brüksel', country: 'Belçika', region: 'europe', lat: 50.85, lon: 4.35, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Brugge', country: 'Belçika', region: 'europe', lat: 51.21, lon: 3.23, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Antwerp', country: 'Belçika', region: 'europe', lat: 51.22, lon: 4.40, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Lüksemburg', country: 'Lüksemburg', region: 'europe', lat: 49.61, lon: 6.13, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['career', 'luck'] },

        // İtalya
        { city: 'Roma', country: 'İtalya', region: 'europe', lat: 41.90, lon: 12.50, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Milano', country: 'İtalya', region: 'europe', lat: 45.46, lon: 9.19, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Floransa', country: 'İtalya', region: 'europe', lat: 43.77, lon: 11.25, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Napoli', country: 'İtalya', region: 'europe', lat: 40.85, lon: 14.27, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'Venedik', country: 'İtalya', region: 'europe', lat: 45.44, lon: 12.32, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Torino', country: 'İtalya', region: 'europe', lat: 45.07, lon: 7.69, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Bologna', country: 'İtalya', region: 'europe', lat: 44.49, lon: 11.34, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Palermo', country: 'İtalya', region: 'europe', lat: 38.12, lon: 13.36, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Genova', country: 'İtalya', region: 'europe', lat: 44.41, lon: 8.93, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Verona', country: 'İtalya', region: 'europe', lat: 45.44, lon: 10.99, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Bari', country: 'İtalya', region: 'europe', lat: 41.12, lon: 16.87, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Catania', country: 'İtalya', region: 'europe', lat: 37.50, lon: 15.09, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'creativity'] },

        // İspanya
        { city: 'Madrid', country: 'İspanya', region: 'europe', lat: 40.42, lon: -3.70, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'love', 'adventure'] },
        { city: 'Barcelona', country: 'İspanya', region: 'europe', lat: 41.39, lon: 2.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Sevilla', country: 'İspanya', region: 'europe', lat: 37.39, lon: -5.98, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Valencia', country: 'İspanya', region: 'europe', lat: 39.47, lon: -0.38, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Malaga', country: 'İspanya', region: 'europe', lat: 36.72, lon: -4.42, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Granada', country: 'İspanya', region: 'europe', lat: 37.18, lon: -3.60, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Bilbao', country: 'İspanya', region: 'europe', lat: 43.26, lon: -2.93, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Zaragoza', country: 'İspanya', region: 'europe', lat: 41.65, lon: -0.88, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['career', 'peace'] },
        { city: 'Palma de Mallorca', country: 'İspanya', region: 'europe', lat: 39.57, lon: 2.65, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Las Palmas', country: 'İspanya', region: 'europe', lat: 28.12, lon: -15.43, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Ibiza', country: 'İspanya', region: 'europe', lat: 38.91, lon: 1.43, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'love', 'creativity'] },
        { city: 'Cordoba', country: 'İspanya', region: 'europe', lat: 37.88, lon: -4.77, climate: 'warm', size: 'small', nature: 'urban', vibe: ['peace', 'creativity'] },

        // Portekiz
        { city: 'Lizbon', country: 'Portekiz', region: 'europe', lat: 38.72, lon: -9.14, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'love'] },
        { city: 'Porto', country: 'Portekiz', region: 'europe', lat: 41.15, lon: -8.61, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Faro', country: 'Portekiz', region: 'europe', lat: 37.02, lon: -7.94, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // İskandinav
        { city: 'Stockholm', country: 'İsveç', region: 'europe', lat: 59.33, lon: 18.07, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace', 'career'] },
        { city: 'Göteborg', country: 'İsveç', region: 'europe', lat: 57.71, lon: 11.97, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Malmö', country: 'İsveç', region: 'europe', lat: 55.60, lon: 13.00, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Kopenhag', country: 'Danimarka', region: 'europe', lat: 55.68, lon: 12.57, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning', 'creativity'] },
        { city: 'Aarhus', country: 'Danimarka', region: 'europe', lat: 56.15, lon: 10.21, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'creativity'] },
        { city: 'Oslo', country: 'Norveç', region: 'europe', lat: 59.91, lon: 10.75, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Bergen', country: 'Norveç', region: 'europe', lat: 60.39, lon: 5.32, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Tromsø', country: 'Norveç', region: 'europe', lat: 69.65, lon: 18.96, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Helsinki', country: 'Finlandiya', region: 'europe', lat: 60.17, lon: 24.94, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Tampere', country: 'Finlandiya', region: 'europe', lat: 61.50, lon: 23.79, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Reykjavik', country: 'İzlanda', region: 'europe', lat: 64.13, lon: -21.90, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'growth', 'adventure'] },

        // Orta Avrupa
        { city: 'Viyana', country: 'Avusturya', region: 'europe', lat: 48.21, lon: 16.37, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career', 'learning'] },
        { city: 'Salzburg', country: 'Avusturya', region: 'europe', lat: 47.80, lon: 13.04, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Innsbruck', country: 'Avusturya', region: 'europe', lat: 47.26, lon: 11.39, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Graz', country: 'Avusturya', region: 'europe', lat: 47.07, lon: 15.44, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Zürih', country: 'İsviçre', region: 'europe', lat: 47.38, lon: 8.54, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace', 'luck'] },
        { city: 'Cenevre', country: 'İsviçre', region: 'europe', lat: 46.20, lon: 6.14, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Bern', country: 'İsviçre', region: 'europe', lat: 46.95, lon: 7.45, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Basel', country: 'İsviçre', region: 'europe', lat: 47.56, lon: 7.59, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Prag', country: 'Çekya', region: 'europe', lat: 50.08, lon: 14.44, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Brno', country: 'Çekya', region: 'europe', lat: 49.20, lon: 16.61, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Budapeşte', country: 'Macaristan', region: 'europe', lat: 47.50, lon: 19.04, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Bratislava', country: 'Slovakya', region: 'europe', lat: 48.15, lon: 17.11, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'learning'] },
        { city: 'Liechtenstein', country: 'Lihtenştayn', region: 'europe', lat: 47.14, lon: 9.52, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'luck'] },

        // Polonya
        { city: 'Varşova', country: 'Polonya', region: 'europe', lat: 52.23, lon: 21.01, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Krakov', country: 'Polonya', region: 'europe', lat: 50.06, lon: 19.94, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Gdansk', country: 'Polonya', region: 'europe', lat: 54.35, lon: 18.65, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Wrocław', country: 'Polonya', region: 'europe', lat: 51.11, lon: 17.04, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Poznań', country: 'Polonya', region: 'europe', lat: 52.41, lon: 16.93, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },

        // Balkanlar & Güneydoğu Avrupa
        { city: 'Atina', country: 'Yunanistan', region: 'europe', lat: 37.98, lon: 23.73, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'learning'] },
        { city: 'Selanik', country: 'Yunanistan', region: 'europe', lat: 40.64, lon: 22.94, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Santorini', country: 'Yunanistan', region: 'europe', lat: 36.39, lon: 25.46, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Girit', country: 'Yunanistan', region: 'europe', lat: 35.34, lon: 25.13, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Rodos', country: 'Yunanistan', region: 'europe', lat: 36.43, lon: 28.22, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Korfu', country: 'Yunanistan', region: 'europe', lat: 39.62, lon: 19.92, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Mykonos', country: 'Yunanistan', region: 'europe', lat: 37.45, lon: 25.33, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Dubrovnik', country: 'Hırvatistan', region: 'europe', lat: 42.65, lon: 18.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Zagreb', country: 'Hırvatistan', region: 'europe', lat: 45.81, lon: 15.98, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Split', country: 'Hırvatistan', region: 'europe', lat: 43.51, lon: 16.44, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Belgrad', country: 'Sırbistan', region: 'europe', lat: 44.79, lon: 20.47, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity'] },
        { city: 'Novi Sad', country: 'Sırbistan', region: 'europe', lat: 45.25, lon: 19.85, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Bükreş', country: 'Romanya', region: 'europe', lat: 44.43, lon: 26.10, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Cluj-Napoca', country: 'Romanya', region: 'europe', lat: 46.77, lon: 23.60, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Sofya', country: 'Bulgaristan', region: 'europe', lat: 42.70, lon: 23.32, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Varna', country: 'Bulgaristan', region: 'europe', lat: 43.21, lon: 27.91, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Ljubljana', country: 'Slovenya', region: 'europe', lat: 46.06, lon: 14.51, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Podgorica', country: 'Karadağ', region: 'europe', lat: 42.44, lon: 19.26, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Tiran', country: 'Arnavutluk', region: 'europe', lat: 41.33, lon: 19.82, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Saraybosna', country: 'Bosna-Hersek', region: 'europe', lat: 43.86, lon: 18.41, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Üsküp', country: 'K. Makedonya', region: 'europe', lat: 41.99, lon: 21.43, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Priştine', country: 'Kosova', region: 'europe', lat: 42.66, lon: 21.17, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['growth', 'adventure'] },

        // Baltık & Kuzey Avrupa
        { city: 'Tallinn', country: 'Estonya', region: 'europe', lat: 59.44, lon: 24.75, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['learning', 'career'] },
        { city: 'Riga', country: 'Letonya', region: 'europe', lat: 56.95, lon: 24.11, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Vilnius', country: 'Litvanya', region: 'europe', lat: 54.69, lon: 25.28, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },

        // Doğu Avrupa
        { city: 'Moskova', country: 'Rusya', region: 'europe', lat: 55.76, lon: 37.62, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth', 'adventure'] },
        { city: 'St. Petersburg', country: 'Rusya', region: 'europe', lat: 59.93, lon: 30.32, climate: 'cold', size: 'mega', nature: 'coastal', vibe: ['creativity', 'learning'] },
        { city: 'Kazan', country: 'Rusya', region: 'europe', lat: 55.80, lon: 49.11, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Soçi', country: 'Rusya', region: 'europe', lat: 43.60, lon: 39.73, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Novosibirsk', country: 'Rusya', region: 'europe', lat: 55.01, lon: 82.93, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Yekaterinburg', country: 'Rusya', region: 'europe', lat: 56.84, lon: 60.60, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Kyiv', country: 'Ukrayna', region: 'europe', lat: 50.45, lon: 30.52, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Lviv', country: 'Ukrayna', region: 'europe', lat: 49.84, lon: 24.03, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Odessa', country: 'Ukrayna', region: 'europe', lat: 46.48, lon: 30.74, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Kharkiv', country: 'Ukrayna', region: 'europe', lat: 49.99, lon: 36.23, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Minsk', country: 'Belarus', region: 'europe', lat: 53.90, lon: 27.57, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Chișinău', country: 'Moldova', region: 'europe', lat: 47.01, lon: 28.86, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['growth', 'peace'] },

        // Mikro Devletler
        { city: 'Monako', country: 'Monako', region: 'europe', lat: 43.74, lon: 7.42, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['luck', 'career'] },
        { city: 'Andorra la Vella', country: 'Andorra', region: 'europe', lat: 42.51, lon: 1.52, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'San Marino', country: 'San Marino', region: 'europe', lat: 43.94, lon: 12.45, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Malta', country: 'Malta', region: 'europe', lat: 35.90, lon: 14.51, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Lefkoşa', country: 'Kıbrıs', region: 'europe', lat: 35.19, lon: 33.38, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Girne', country: 'Kıbrıs', region: 'europe', lat: 35.34, lon: 33.32, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
    ];

    // =============================================
    // ASYA
    // =============================================
    const ASIA = [
        // Japonya
        { city: 'Tokyo', country: 'Japonya', region: 'asia', lat: 35.68, lon: 139.69, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'adventure', 'learning', 'creativity'] },
        { city: 'Kyoto', country: 'Japonya', region: 'asia', lat: 35.01, lon: 135.77, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'creativity', 'growth'] },
        { city: 'Osaka', country: 'Japonya', region: 'asia', lat: 34.69, lon: 135.50, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Nagoya', country: 'Japonya', region: 'asia', lat: 35.18, lon: 136.91, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning'] },
        { city: 'Yokohama', country: 'Japonya', region: 'asia', lat: 35.44, lon: 139.64, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Sapporo', country: 'Japonya', region: 'asia', lat: 43.06, lon: 141.35, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Fukuoka', country: 'Japonya', region: 'asia', lat: 33.59, lon: 130.40, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Hiroshima', country: 'Japonya', region: 'asia', lat: 34.39, lon: 132.46, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Kobe', country: 'Japonya', region: 'asia', lat: 34.69, lon: 135.20, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Nara', country: 'Japonya', region: 'asia', lat: 34.69, lon: 135.80, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Okinawa', country: 'Japonya', region: 'asia', lat: 26.34, lon: 127.77, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },

        // Güney Kore
        { city: 'Seul', country: 'Güney Kore', region: 'asia', lat: 37.57, lon: 126.98, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Busan', country: 'Güney Kore', region: 'asia', lat: 35.18, lon: 129.08, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Incheon', country: 'Güney Kore', region: 'asia', lat: 37.46, lon: 126.71, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Jeju', country: 'Güney Kore', region: 'asia', lat: 33.50, lon: 126.53, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Çin
        { city: 'Pekin', country: 'Çin', region: 'asia', lat: 39.90, lon: 116.40, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'growth'] },
        { city: 'Şanghay', country: 'Çin', region: 'asia', lat: 31.23, lon: 121.47, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'luck'] },
        { city: 'Hong Kong', country: 'Çin', region: 'asia', lat: 22.32, lon: 114.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Shenzhen', country: 'Çin', region: 'asia', lat: 22.54, lon: 114.06, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Guangzhou', country: 'Çin', region: 'asia', lat: 23.13, lon: 113.26, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Chengdu', country: 'Çin', region: 'asia', lat: 30.57, lon: 104.07, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: "Xi'an", country: 'Çin', region: 'asia', lat: 34.26, lon: 108.94, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'growth'] },
        { city: 'Hangzhou', country: 'Çin', region: 'asia', lat: 30.27, lon: 120.15, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Wuhan', country: 'Çin', region: 'asia', lat: 30.59, lon: 114.31, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Nanjing', country: 'Çin', region: 'asia', lat: 32.06, lon: 118.80, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'growth'] },
        { city: 'Kunming', country: 'Çin', region: 'asia', lat: 25.04, lon: 102.68, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Lhasa', country: 'Çin', region: 'asia', lat: 29.65, lon: 91.17, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Makao', country: 'Çin', region: 'asia', lat: 22.20, lon: 113.55, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['luck', 'adventure'] },

        // Tayvan
        { city: 'Taipei', country: 'Tayvan', region: 'asia', lat: 25.03, lon: 121.57, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'adventure', 'creativity'] },

        // Güneydoğu Asya
        { city: 'Singapur', country: 'Singapur', region: 'asia', lat: 1.35, lon: 103.82, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Bangkok', country: 'Tayland', region: 'asia', lat: 13.76, lon: 100.50, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity', 'love'] },
        { city: 'Chiang Mai', country: 'Tayland', region: 'asia', lat: 18.79, lon: 98.98, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Phuket', country: 'Tayland', region: 'asia', lat: 7.88, lon: 98.39, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Bali', country: 'Endonezya', region: 'asia', lat: -8.34, lon: 115.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Jakarta', country: 'Endonezya', region: 'asia', lat: -6.21, lon: 106.85, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Yogyakarta', country: 'Endonezya', region: 'asia', lat: -7.80, lon: 110.36, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Kuala Lumpur', country: 'Malezya', region: 'asia', lat: 3.14, lon: 101.69, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Penang', country: 'Malezya', region: 'asia', lat: 5.42, lon: 100.33, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Ho Chi Minh', country: 'Vietnam', region: 'asia', lat: 10.82, lon: 106.63, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'creativity'] },
        { city: 'Hanoi', country: 'Vietnam', region: 'asia', lat: 21.03, lon: 105.85, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Da Nang', country: 'Vietnam', region: 'asia', lat: 16.05, lon: 108.22, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Manila', country: 'Filipinler', region: 'asia', lat: 14.60, lon: 120.98, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Cebu', country: 'Filipinler', region: 'asia', lat: 10.32, lon: 123.89, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Phnom Penh', country: 'Kamboçya', region: 'asia', lat: 11.56, lon: 104.92, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Siem Reap', country: 'Kamboçya', region: 'asia', lat: 13.36, lon: 103.86, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Vientiane', country: 'Laos', region: 'asia', lat: 17.97, lon: 102.63, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Luang Prabang', country: 'Laos', region: 'asia', lat: 19.89, lon: 102.13, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Yangon', country: 'Myanmar', region: 'asia', lat: 16.87, lon: 96.20, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Bandar Seri Begawan', country: 'Brunei', region: 'asia', lat: 4.94, lon: 114.95, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'luck'] },
        { city: 'Dili', country: 'Doğu Timor', region: 'asia', lat: -8.56, lon: 125.57, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },

        // Güney Asya
        { city: 'Mumbai', country: 'Hindistan', region: 'asia', lat: 19.08, lon: 72.88, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Delhi', country: 'Hindistan', region: 'asia', lat: 28.61, lon: 77.21, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Bangalore', country: 'Hindistan', region: 'asia', lat: 12.97, lon: 77.59, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Chennai', country: 'Hindistan', region: 'asia', lat: 13.08, lon: 80.27, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Hyderabad', country: 'Hindistan', region: 'asia', lat: 17.39, lon: 78.49, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Kolkata', country: 'Hindistan', region: 'asia', lat: 22.57, lon: 88.36, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Pune', country: 'Hindistan', region: 'asia', lat: 18.52, lon: 73.86, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['learning', 'career'] },
        { city: 'Ahmedabad', country: 'Hindistan', region: 'asia', lat: 23.02, lon: 72.57, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Jaipur', country: 'Hindistan', region: 'asia', lat: 26.91, lon: 75.79, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Varanasi', country: 'Hindistan', region: 'asia', lat: 25.32, lon: 83.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Goa', country: 'Hindistan', region: 'asia', lat: 15.30, lon: 74.12, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity', 'love'] },
        { city: 'Udaipur', country: 'Hindistan', region: 'asia', lat: 24.59, lon: 73.69, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['love', 'creativity'] },
        { city: 'Agra', country: 'Hindistan', region: 'asia', lat: 27.18, lon: 78.02, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['love', 'growth'] },
        { city: 'Kerala', country: 'Hindistan', region: 'asia', lat: 10.85, lon: 76.27, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },
        { city: 'Rishikesh', country: 'Hindistan', region: 'asia', lat: 30.09, lon: 78.27, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Kolombo', country: 'Sri Lanka', region: 'asia', lat: 6.93, lon: 79.84, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Katmandu', country: 'Nepal', region: 'asia', lat: 27.72, lon: 85.32, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },
        { city: 'Thimphu', country: 'Bhutan', region: 'asia', lat: 27.47, lon: 89.64, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Dakka', country: 'Bangladeş', region: 'asia', lat: 23.81, lon: 90.41, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Chittagong', country: 'Bangladeş', region: 'asia', lat: 22.36, lon: 91.78, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Karaçi', country: 'Pakistan', region: 'asia', lat: 24.86, lon: 67.01, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Lahor', country: 'Pakistan', region: 'asia', lat: 31.55, lon: 74.35, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'İslamabad', country: 'Pakistan', region: 'asia', lat: 33.69, lon: 73.04, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Kabil', country: 'Afganistan', region: 'asia', lat: 34.53, lon: 69.17, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Maldivler', country: 'Maldivler', region: 'asia', lat: 4.18, lon: 73.51, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },

        // Orta Doğu
        { city: 'Dubai', country: 'BAE', region: 'asia', lat: 25.20, lon: 55.27, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Abu Dabi', country: 'BAE', region: 'asia', lat: 24.45, lon: 54.65, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Tel Aviv', country: 'İsrail', region: 'asia', lat: 32.09, lon: 34.78, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'learning', 'adventure'] },
        { city: 'Kudüs', country: 'İsrail', region: 'asia', lat: 31.77, lon: 35.23, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'learning'] },
        { city: 'Amman', country: 'Ürdün', region: 'asia', lat: 31.96, lon: 35.95, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Beyrut', country: 'Lübnan', region: 'asia', lat: 33.89, lon: 35.50, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Doha', country: 'Katar', region: 'asia', lat: 25.29, lon: 51.53, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Muscat', country: 'Umman', region: 'asia', lat: 23.59, lon: 58.54, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Küveyt', country: 'Küveyt', region: 'asia', lat: 29.38, lon: 47.99, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Riyad', country: 'Suudi Arabistan', region: 'asia', lat: 24.71, lon: 46.67, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Cidde', country: 'Suudi Arabistan', region: 'asia', lat: 21.49, lon: 39.19, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Manama', country: 'Bahreyn', region: 'asia', lat: 26.23, lon: 50.59, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Sana', country: 'Yemen', region: 'asia', lat: 15.35, lon: 44.21, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Ramallah', country: 'Filistin', region: 'asia', lat: 31.90, lon: 35.20, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Tahran', country: 'İran', region: 'asia', lat: 35.69, lon: 51.39, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'İsfahan', country: 'İran', region: 'asia', lat: 32.65, lon: 51.68, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Şiraz', country: 'İran', region: 'asia', lat: 29.59, lon: 52.58, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Bağdat', country: 'Irak', region: 'asia', lat: 33.31, lon: 44.37, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Erbil', country: 'Irak', region: 'asia', lat: 36.19, lon: 44.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Şam', country: 'Suriye', region: 'asia', lat: 33.51, lon: 36.29, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },

        // Kafkasya
        { city: 'Bakü', country: 'Azerbaycan', region: 'asia', lat: 40.41, lon: 49.87, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Tiflis', country: 'Gürcistan', region: 'asia', lat: 41.72, lon: 44.79, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'peace'] },
        { city: 'Batum', country: 'Gürcistan', region: 'asia', lat: 41.65, lon: 41.64, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Erivan', country: 'Ermenistan', region: 'asia', lat: 40.18, lon: 44.51, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },

        // Orta Asya
        { city: 'Almatı', country: 'Kazakistan', region: 'asia', lat: 43.24, lon: 76.95, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Astana', country: 'Kazakistan', region: 'asia', lat: 51.17, lon: 71.43, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Taşkent', country: 'Özbekistan', region: 'asia', lat: 41.30, lon: 69.28, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Semerkant', country: 'Özbekistan', region: 'asia', lat: 39.65, lon: 66.96, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'growth'] },
        { city: 'Bişkek', country: 'Kırgızistan', region: 'asia', lat: 42.87, lon: 74.59, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Aşkabat', country: 'Türkmenistan', region: 'asia', lat: 37.96, lon: 58.33, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Duşanbe', country: 'Tacikistan', region: 'asia', lat: 38.56, lon: 68.77, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },

        // Moğolistan
        { city: 'Ulan Batur', country: 'Moğolistan', region: 'asia', lat: 47.91, lon: 106.91, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
    ];

    // =============================================
    // AMERİKA
    // =============================================
    const AMERICAS = [
        // ABD – Büyük Şehirler
        { city: 'New York', country: 'ABD', region: 'americas', lat: 40.71, lon: -74.01, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Los Angeles', country: 'ABD', region: 'americas', lat: 34.05, lon: -118.24, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Chicago', country: 'ABD', region: 'americas', lat: 41.88, lon: -87.63, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Houston', country: 'ABD', region: 'americas', lat: 29.76, lon: -95.37, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Dallas', country: 'ABD', region: 'americas', lat: 32.78, lon: -96.80, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'San Francisco', country: 'ABD', region: 'americas', lat: 37.77, lon: -122.42, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning', 'growth'] },
        { city: 'Miami', country: 'ABD', region: 'americas', lat: 25.76, lon: -80.19, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Seattle', country: 'ABD', region: 'americas', lat: 47.61, lon: -122.33, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Austin', country: 'ABD', region: 'americas', lat: 30.27, lon: -97.74, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'adventure', 'career'] },
        { city: 'Denver', country: 'ABD', region: 'americas', lat: 39.74, lon: -104.99, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['adventure', 'career'] },
        { city: 'Boston', country: 'ABD', region: 'americas', lat: 42.36, lon: -71.06, climate: 'cold', size: 'mega', nature: 'coastal', vibe: ['learning', 'career'] },
        { city: 'Nashville', country: 'ABD', region: 'americas', lat: 36.16, lon: -86.78, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'adventure'] },
        { city: 'Portland', country: 'ABD', region: 'americas', lat: 45.52, lon: -122.68, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'San Diego', country: 'ABD', region: 'americas', lat: 32.72, lon: -117.16, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Honolulu', country: 'ABD', region: 'americas', lat: 21.31, lon: -157.86, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'New Orleans', country: 'ABD', region: 'americas', lat: 29.95, lon: -90.07, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Washington DC', country: 'ABD', region: 'americas', lat: 38.91, lon: -77.04, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Las Vegas', country: 'ABD', region: 'americas', lat: 36.17, lon: -115.14, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['luck', 'adventure'] },
        { city: 'Philadelphia', country: 'ABD', region: 'americas', lat: 39.95, lon: -75.17, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Atlanta', country: 'ABD', region: 'americas', lat: 33.75, lon: -84.39, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Phoenix', country: 'ABD', region: 'americas', lat: 33.45, lon: -112.07, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Minneapolis', country: 'ABD', region: 'americas', lat: 44.98, lon: -93.27, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Detroit', country: 'ABD', region: 'americas', lat: 42.33, lon: -83.05, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Salt Lake City', country: 'ABD', region: 'americas', lat: 40.76, lon: -111.89, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Orlando', country: 'ABD', region: 'americas', lat: 28.54, lon: -81.38, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'love'] },
        { city: 'Tampa', country: 'ABD', region: 'americas', lat: 27.95, lon: -82.46, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Charlotte', country: 'ABD', region: 'americas', lat: 35.23, lon: -80.84, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Pittsburgh', country: 'ABD', region: 'americas', lat: 40.44, lon: -80.00, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['learning', 'growth'] },
        { city: 'Raleigh', country: 'ABD', region: 'americas', lat: 35.78, lon: -78.64, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Savannah', country: 'ABD', region: 'americas', lat: 32.08, lon: -81.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Charleston', country: 'ABD', region: 'americas', lat: 32.78, lon: -79.93, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Santa Fe', country: 'ABD', region: 'americas', lat: 35.69, lon: -105.94, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Anchorage', country: 'ABD', region: 'americas', lat: 61.22, lon: -149.90, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },

        // Kanada
        { city: 'Toronto', country: 'Kanada', region: 'americas', lat: 43.65, lon: -79.38, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Vancouver', country: 'Kanada', region: 'americas', lat: 49.28, lon: -123.12, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Montreal', country: 'Kanada', region: 'americas', lat: 45.50, lon: -73.57, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Calgary', country: 'Kanada', region: 'americas', lat: 51.04, lon: -114.07, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['career', 'adventure'] },
        { city: 'Ottawa', country: 'Kanada', region: 'americas', lat: 45.42, lon: -75.70, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Edmonton', country: 'Kanada', region: 'americas', lat: 53.55, lon: -113.49, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Winnipeg', country: 'Kanada', region: 'americas', lat: 49.90, lon: -97.14, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['growth', 'peace'] },
        { city: 'Halifax', country: 'Kanada', region: 'americas', lat: 44.65, lon: -63.57, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Quebec City', country: 'Kanada', region: 'americas', lat: 46.81, lon: -71.21, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Victoria', country: 'Kanada', region: 'americas', lat: 48.43, lon: -123.37, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Banff', country: 'Kanada', region: 'americas', lat: 51.18, lon: -115.57, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },

        // Meksika
        { city: 'Mexico City', country: 'Meksika', region: 'americas', lat: 19.43, lon: -99.13, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'love'] },
        { city: 'Cancún', country: 'Meksika', region: 'americas', lat: 21.16, lon: -86.85, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Guadalajara', country: 'Meksika', region: 'americas', lat: 20.67, lon: -103.35, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Monterrey', country: 'Meksika', region: 'americas', lat: 25.69, lon: -100.32, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Oaxaca', country: 'Meksika', region: 'americas', lat: 17.07, lon: -96.72, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Mérida', country: 'Meksika', region: 'americas', lat: 20.97, lon: -89.59, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['peace', 'creativity'] },
        { city: 'Puebla', country: 'Meksika', region: 'americas', lat: 19.04, lon: -98.21, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Playa del Carmen', country: 'Meksika', region: 'americas', lat: 20.63, lon: -87.08, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'adventure'] },
        { city: 'Tulum', country: 'Meksika', region: 'americas', lat: 20.21, lon: -87.43, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },

        // Orta Amerika & Karayipler
        { city: 'Guatemala City', country: 'Guatemala', region: 'americas', lat: 14.63, lon: -90.51, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Antigua', country: 'Guatemala', region: 'americas', lat: 14.56, lon: -90.73, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'San Salvador', country: 'El Salvador', region: 'americas', lat: 13.69, lon: -89.19, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'career'] },
        { city: 'Tegucigalpa', country: 'Honduras', region: 'americas', lat: 14.07, lon: -87.21, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Managua', country: 'Nikaragua', region: 'americas', lat: 12.11, lon: -86.27, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'San José', country: 'Kosta Rika', region: 'americas', lat: 9.93, lon: -84.08, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Panama City', country: 'Panama', region: 'americas', lat: 8.98, lon: -79.52, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Belize City', country: 'Belize', region: 'americas', lat: 17.50, lon: -88.20, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Havana', country: 'Küba', region: 'americas', lat: 23.11, lon: -82.37, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Kingston', country: 'Jamaika', region: 'americas', lat: 18.00, lon: -76.79, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Port-au-Prince', country: 'Haiti', region: 'americas', lat: 18.54, lon: -72.34, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Santo Domingo', country: 'Dominik Cum.', region: 'americas', lat: 18.47, lon: -69.90, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Punta Cana', country: 'Dominik Cum.', region: 'americas', lat: 18.58, lon: -68.40, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'San Juan', country: 'Porto Riko', region: 'americas', lat: 18.47, lon: -66.11, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Port of Spain', country: 'Trinidad ve Tobago', region: 'americas', lat: 10.66, lon: -61.51, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Bridgetown', country: 'Barbados', region: 'americas', lat: 13.10, lon: -59.61, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Nassau', country: 'Bahamalar', region: 'americas', lat: 25.06, lon: -77.35, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'luck'] },

        // Güney Amerika
        { city: 'Buenos Aires', country: 'Arjantin', region: 'americas', lat: -34.60, lon: -58.38, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'Córdoba', country: 'Arjantin', region: 'americas', lat: -31.42, lon: -64.18, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Mendoza', country: 'Arjantin', region: 'americas', lat: -32.89, lon: -68.83, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Bariloche', country: 'Arjantin', region: 'americas', lat: -41.13, lon: -71.30, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure', 'love'] },
        { city: 'Ushuaia', country: 'Arjantin', region: 'americas', lat: -54.80, lon: -68.30, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace', 'growth'] },
        { city: 'São Paulo', country: 'Brezilya', region: 'americas', lat: -23.55, lon: -46.63, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Rio de Janeiro', country: 'Brezilya', region: 'americas', lat: -22.91, lon: -43.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'adventure', 'creativity'] },
        { city: 'Brasília', country: 'Brezilya', region: 'americas', lat: -15.79, lon: -47.88, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Salvador', country: 'Brezilya', region: 'americas', lat: -12.97, lon: -38.51, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Recife', country: 'Brezilya', region: 'americas', lat: -8.05, lon: -34.87, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Belo Horizonte', country: 'Brezilya', region: 'americas', lat: -19.92, lon: -43.94, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Curitiba', country: 'Brezilya', region: 'americas', lat: -25.43, lon: -49.27, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'peace'] },
        { city: 'Fortaleza', country: 'Brezilya', region: 'americas', lat: -3.72, lon: -38.53, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Florianópolis', country: 'Brezilya', region: 'americas', lat: -27.60, lon: -48.55, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Bogota', country: 'Kolombiya', region: 'americas', lat: 4.71, lon: -74.07, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Medellín', country: 'Kolombiya', region: 'americas', lat: 6.25, lon: -75.56, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Cartagena', country: 'Kolombiya', region: 'americas', lat: 10.39, lon: -75.51, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Caracas', country: 'Venezuela', region: 'americas', lat: 10.49, lon: -66.88, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Lima', country: 'Peru', region: 'americas', lat: -12.05, lon: -77.04, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Cusco', country: 'Peru', region: 'americas', lat: -13.52, lon: -71.97, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },
        { city: 'Santiago', country: 'Şili', region: 'americas', lat: -33.45, lon: -70.67, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Valparaíso', country: 'Şili', region: 'americas', lat: -33.05, lon: -71.62, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Punta Arenas', country: 'Şili', region: 'americas', lat: -53.16, lon: -70.91, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Montevideo', country: 'Uruguay', region: 'americas', lat: -34.88, lon: -56.18, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Quito', country: 'Ekvador', region: 'americas', lat: -0.18, lon: -78.47, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Guayaquil', country: 'Ekvador', region: 'americas', lat: -2.17, lon: -79.92, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'La Paz', country: 'Bolivya', region: 'americas', lat: -16.49, lon: -68.12, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Asunción', country: 'Paraguay', region: 'americas', lat: -25.26, lon: -57.58, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Georgetown', country: 'Guyana', region: 'americas', lat: 6.80, lon: -58.16, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Paramaribo', country: 'Surinam', region: 'americas', lat: 5.85, lon: -55.20, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'growth'] },
    ];

    // =============================================
    // AFRİKA
    // =============================================
    const AFRICA = [
        // Kuzey Afrika
        { city: 'Kahire', country: 'Mısır', region: 'africa', lat: 30.04, lon: 31.24, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning', 'career'] },
        { city: 'İskenderiye', country: 'Mısır', region: 'africa', lat: 31.20, lon: 29.92, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['learning', 'creativity'] },
        { city: 'Luxor', country: 'Mısır', region: 'africa', lat: 25.69, lon: 32.64, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Marakeş', country: 'Fas', region: 'africa', lat: 31.63, lon: -8.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Kazablanka', country: 'Fas', region: 'africa', lat: 33.57, lon: -7.59, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Fes', country: 'Fas', region: 'africa', lat: 34.03, lon: -5.00, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Şefşauen', country: 'Fas', region: 'africa', lat: 35.17, lon: -5.27, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Tunus', country: 'Tunus', region: 'africa', lat: 36.81, lon: 10.18, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Cezayir', country: 'Cezayir', region: 'africa', lat: 36.75, lon: 3.04, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'career'] },
        { city: 'Oran', country: 'Cezayir', region: 'africa', lat: 35.70, lon: -0.63, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Trablus', country: 'Libya', region: 'africa', lat: 32.90, lon: 13.18, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'career'] },

        // Doğu Afrika
        { city: 'Nairobi', country: 'Kenya', region: 'africa', lat: -1.29, lon: 36.82, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'growth'] },
        { city: 'Mombasa', country: 'Kenya', region: 'africa', lat: -4.05, lon: 39.67, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Addis Ababa', country: 'Etiyopya', region: 'africa', lat: 9.01, lon: 38.75, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'Dar es Salaam', country: 'Tanzanya', region: 'africa', lat: -6.79, lon: 39.28, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Zanzibar', country: 'Tanzanya', region: 'africa', lat: -6.16, lon: 39.19, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Kampala', country: 'Uganda', region: 'africa', lat: 0.35, lon: 32.58, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Kigali', country: 'Ruanda', region: 'africa', lat: -1.94, lon: 29.87, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'career'] },
        { city: 'Bujumbura', country: 'Burundi', region: 'africa', lat: -3.38, lon: 29.36, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Mogadişu', country: 'Somali', region: 'africa', lat: 2.05, lon: 45.32, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Cibuti', country: 'Cibuti', region: 'africa', lat: 11.59, lon: 43.15, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['growth', 'career'] },
        { city: 'Asmara', country: 'Eritre', region: 'africa', lat: 15.34, lon: 38.93, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Hartum', country: 'Sudan', region: 'africa', lat: 15.59, lon: 32.53, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Juba', country: 'Güney Sudan', region: 'africa', lat: 4.85, lon: 31.60, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Antananarivo', country: 'Madagaskar', region: 'africa', lat: -18.91, lon: 47.52, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Moroni', country: 'Komorlar', region: 'africa', lat: -11.70, lon: 43.26, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Batı Afrika
        { city: 'Lagos', country: 'Nijerya', region: 'africa', lat: 6.52, lon: 3.38, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'creativity'] },
        { city: 'Abuja', country: 'Nijerya', region: 'africa', lat: 9.06, lon: 7.49, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Accra', country: 'Gana', region: 'africa', lat: 5.56, lon: -0.20, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Dakar', country: 'Senegal', region: 'africa', lat: 14.69, lon: -17.44, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Abidjan', country: 'Fildişi Sahili', region: 'africa', lat: 5.32, lon: -4.00, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Bamako', country: 'Mali', region: 'africa', lat: 12.64, lon: -8.00, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Niamey', country: 'Nijer', region: 'africa', lat: 13.51, lon: 2.11, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'peace'] },
        { city: "N'Djamena", country: 'Çad', region: 'africa', lat: 12.13, lon: 15.05, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Ouagadougou', country: 'Burkina Faso', region: 'africa', lat: 12.37, lon: -1.52, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Conakry', country: 'Gine', region: 'africa', lat: 9.64, lon: -13.58, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Freetown', country: 'Sierra Leone', region: 'africa', lat: 8.48, lon: -13.23, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Monrovia', country: 'Liberya', region: 'africa', lat: 6.30, lon: -10.80, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Lomé', country: 'Togo', region: 'africa', lat: 6.17, lon: 1.23, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Cotonou', country: 'Benin', region: 'africa', lat: 6.37, lon: 2.39, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Nouakchott', country: 'Moritanya', region: 'africa', lat: 18.09, lon: -15.98, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Banjul', country: 'Gambiya', region: 'africa', lat: 13.45, lon: -16.58, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Bissau', country: 'Gine-Bissau', region: 'africa', lat: 11.86, lon: -15.60, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Praia', country: 'Yeşil Burun', region: 'africa', lat: 14.93, lon: -23.51, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Orta Afrika
        { city: 'Kinşasa', country: 'Demokratik Kongo', region: 'africa', lat: -4.44, lon: 15.27, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Brazzaville', country: 'Kongo', region: 'africa', lat: -4.27, lon: 15.28, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Yaoundé', country: 'Kamerun', region: 'africa', lat: 3.87, lon: 11.52, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'Douala', country: 'Kamerun', region: 'africa', lat: 4.05, lon: 9.77, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Luanda', country: 'Angola', region: 'africa', lat: -8.84, lon: 13.23, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Libreville', country: 'Gabon', region: 'africa', lat: 0.39, lon: 9.45, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Malabo', country: 'Ekvator Ginesi', region: 'africa', lat: 3.75, lon: 8.78, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Bangui', country: 'Orta Afrika Cum.', region: 'africa', lat: 4.39, lon: 18.56, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },

        // Güney Afrika
        { city: 'Cape Town', country: 'Güney Afrika', region: 'africa', lat: -33.93, lon: 18.42, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Johannesburg', country: 'Güney Afrika', region: 'africa', lat: -26.20, lon: 28.05, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Durban', country: 'Güney Afrika', region: 'africa', lat: -29.86, lon: 31.02, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Pretoria', country: 'Güney Afrika', region: 'africa', lat: -25.75, lon: 28.19, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Maputo', country: 'Mozambik', region: 'africa', lat: -25.97, lon: 32.57, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Harare', country: 'Zimbabve', region: 'africa', lat: -17.83, lon: 31.05, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Lusaka', country: 'Zambiya', region: 'africa', lat: -15.39, lon: 28.32, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Victoria Falls', country: 'Zambiya', region: 'africa', lat: -17.93, lon: 25.86, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Gaborone', country: 'Botsvana', region: 'africa', lat: -24.65, lon: 25.91, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Windhoek', country: 'Namibya', region: 'africa', lat: -22.56, lon: 17.08, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'peace'] },
        { city: 'Lilongwe', country: 'Malavi', region: 'africa', lat: -13.97, lon: 33.79, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Mbabane', country: 'Esvatin', region: 'africa', lat: -26.32, lon: 31.13, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Maseru', country: 'Lesoto', region: 'africa', lat: -29.31, lon: 27.48, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },

        // Ada Ülkeleri
        { city: 'Mauritius', country: 'Mauritius', region: 'africa', lat: -20.35, lon: 57.55, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Seychelles', country: 'Seyşeller', region: 'africa', lat: -4.68, lon: 55.49, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
    ];

    // =============================================
    // OKYANUSYA
    // =============================================
    const OCEANIA = [
        // Avustralya
        { city: 'Sydney', country: 'Avustralya', region: 'oceania', lat: -33.87, lon: 151.21, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Melbourne', country: 'Avustralya', region: 'oceania', lat: -37.81, lon: 144.96, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Brisbane', country: 'Avustralya', region: 'oceania', lat: -27.47, lon: 153.03, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Perth', country: 'Avustralya', region: 'oceania', lat: -31.95, lon: 115.86, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Adelaide', country: 'Avustralya', region: 'oceania', lat: -34.93, lon: 138.60, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Gold Coast', country: 'Avustralya', region: 'oceania', lat: -28.00, lon: 153.43, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure', 'peace'] },
        { city: 'Cairns', country: 'Avustralya', region: 'oceania', lat: -16.92, lon: 145.77, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Hobart', country: 'Avustralya', region: 'oceania', lat: -42.88, lon: 147.33, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Darwin', country: 'Avustralya', region: 'oceania', lat: -12.46, lon: 130.84, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Canberra', country: 'Avustralya', region: 'oceania', lat: -35.28, lon: 149.13, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },

        // Yeni Zelanda
        { city: 'Auckland', country: 'Yeni Zelanda', region: 'oceania', lat: -36.85, lon: 174.76, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Wellington', country: 'Yeni Zelanda', region: 'oceania', lat: -41.29, lon: 174.78, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Queenstown', country: 'Yeni Zelanda', region: 'oceania', lat: -45.03, lon: 168.66, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Christchurch', country: 'Yeni Zelanda', region: 'oceania', lat: -43.53, lon: 172.64, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Rotorua', country: 'Yeni Zelanda', region: 'oceania', lat: -38.14, lon: 176.25, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'adventure'] },

        // Pasifik Adaları
        { city: 'Fiji', country: 'Fiji', region: 'oceania', lat: -17.77, lon: 177.96, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Bora Bora', country: 'Fransız Polinezyası', region: 'oceania', lat: -16.50, lon: -151.74, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Tahiti', country: 'Fransız Polinezyası', region: 'oceania', lat: -17.53, lon: -149.57, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'creativity'] },
        { city: 'Port Moresby', country: 'Papua Yeni Gine', region: 'oceania', lat: -9.44, lon: 147.18, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Apia', country: 'Samoa', region: 'oceania', lat: -13.83, lon: -171.76, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: "Nuku'alofa", country: 'Tonga', region: 'oceania', lat: -21.21, lon: -175.20, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Port Vila', country: 'Vanuatu', region: 'oceania', lat: -17.73, lon: 168.32, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Honiara', country: 'Solomon Adaları', region: 'oceania', lat: -9.43, lon: 159.96, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Nouméa', country: 'Yeni Kaledonya', region: 'oceania', lat: -22.28, lon: 166.46, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
    ];

    // =============================================
    // TÜM ŞEHİRLERİ BİRLEŞTİR
    // =============================================
    const ALL_CITIES = [...TURKEY, ...EUROPE, ...ASIA, ...AMERICAS, ...AFRICA, ...OCEANIA];

    const REGION_NAMES = {
        tr: 'Türkiye',
        europe: 'Avrupa',
        asia: 'Asya',
        americas: 'Amerika',
        africa: 'Afrika',
        oceania: 'Okyanusya'
    };

    return {
        ALL_CITIES,
        TURKEY,
        EUROPE,
        ASIA,
        AMERICAS,
        AFRICA,
        OCEANIA,
        REGION_NAMES,
        getCitiesByRegion(region) {
            if (region === 'all') return ALL_CITIES;
            return ALL_CITIES.filter(c => c.region === region);
        },
        searchCities(query) {
            const q = query.toLowerCase();
            return ALL_CITIES.filter(c =>
                c.city.toLowerCase().includes(q) ||
                c.country.toLowerCase().includes(q)
            );
        }
    };
})();
