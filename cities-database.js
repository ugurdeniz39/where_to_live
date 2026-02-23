/**
 * ============================================
 * AstroMap - Mega City Database
 * 81 Türkiye İli + 200+ Dünya Şehri
 * ============================================
 */

const CITY_DATABASE = (() => {

    // =============================================
    // TÜRKİYE - Büyük & Orta Şehirler + Önemli Turistik Yerler
    // =============================================
    const TURKEY = [
        { city: 'Adana', country: 'Türkiye', region: 'tr', lat: 37.00, lon: 35.32, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Ankara', country: 'Türkiye', region: 'tr', lat: 39.93, lon: 32.86, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Antalya', country: 'Türkiye', region: 'tr', lat: 36.90, lon: 30.69, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Aydın', country: 'Türkiye', region: 'tr', lat: 37.85, lon: 27.85, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Balıkesir', country: 'Türkiye', region: 'tr', lat: 39.65, lon: 27.89, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Bodrum', country: 'Türkiye', region: 'tr', lat: 37.04, lon: 27.43, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Bolu', country: 'Türkiye', region: 'tr', lat: 40.73, lon: 31.61, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Bursa', country: 'Türkiye', region: 'tr', lat: 40.19, lon: 29.06, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'peace', 'creativity'] },
        { city: 'Çanakkale', country: 'Türkiye', region: 'tr', lat: 40.16, lon: 26.41, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning'] },
        { city: 'Denizli', country: 'Türkiye', region: 'tr', lat: 37.77, lon: 29.09, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Diyarbakır', country: 'Türkiye', region: 'tr', lat: 37.91, lon: 40.24, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Edirne', country: 'Türkiye', region: 'tr', lat: 41.68, lon: 26.56, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Erzurum', country: 'Türkiye', region: 'tr', lat: 39.90, lon: 41.27, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Eskişehir', country: 'Türkiye', region: 'tr', lat: 39.78, lon: 30.52, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'peace'] },
        { city: 'Fethiye', country: 'Türkiye', region: 'tr', lat: 36.65, lon: 29.12, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Gaziantep', country: 'Türkiye', region: 'tr', lat: 37.07, lon: 37.38, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Hatay', country: 'Türkiye', region: 'tr', lat: 36.40, lon: 36.35, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'İstanbul', country: 'Türkiye', region: 'tr', lat: 41.01, lon: 28.98, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'love', 'creativity', 'adventure'] },
        { city: 'İzmir', country: 'Türkiye', region: 'tr', lat: 38.42, lon: 27.14, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'career', 'peace'] },
        { city: 'Kapadokya', country: 'Türkiye', region: 'tr', lat: 38.63, lon: 34.83, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth', 'love'] },
        { city: 'Kayseri', country: 'Türkiye', region: 'tr', lat: 38.73, lon: 35.49, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Kocaeli', country: 'Türkiye', region: 'tr', lat: 40.77, lon: 29.92, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career'] },
        { city: 'Konya', country: 'Türkiye', region: 'tr', lat: 37.87, lon: 32.48, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['peace', 'growth', 'creativity'] },
        { city: 'Kuşadası', country: 'Türkiye', region: 'tr', lat: 37.86, lon: 27.26, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace', 'adventure'] },
        { city: 'Malatya', country: 'Türkiye', region: 'tr', lat: 38.35, lon: 38.31, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Manisa', country: 'Türkiye', region: 'tr', lat: 38.61, lon: 27.43, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Mardin', country: 'Türkiye', region: 'tr', lat: 37.31, lon: 40.74, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Mersin', country: 'Türkiye', region: 'tr', lat: 36.80, lon: 34.63, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Muğla', country: 'Türkiye', region: 'tr', lat: 37.22, lon: 28.36, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Sakarya', country: 'Türkiye', region: 'tr', lat: 40.69, lon: 30.40, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace'] },
        { city: 'Samsun', country: 'Türkiye', region: 'tr', lat: 41.29, lon: 36.33, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'peace'] },
        { city: 'Şanlıurfa', country: 'Türkiye', region: 'tr', lat: 37.17, lon: 38.79, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Sinop', country: 'Türkiye', region: 'tr', lat: 42.03, lon: 35.15, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Tekirdağ', country: 'Türkiye', region: 'tr', lat: 40.98, lon: 27.51, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Trabzon', country: 'Türkiye', region: 'tr', lat: 41.00, lon: 39.72, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'adventure'] },
        { city: 'Van', country: 'Türkiye', region: 'tr', lat: 38.49, lon: 43.38, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth', 'peace'] },
    ];

    // =============================================
    // AVRUPA
    // =============================================
    const EUROPE = [
        // Batı Avrupa
        { city: 'Londra', country: 'İngiltere', region: 'europe', lat: 51.51, lon: -0.13, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity', 'learning'] },
        { city: 'Paris', country: 'Fransa', region: 'europe', lat: 48.86, lon: 2.35, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['love', 'creativity', 'career'] },
        { city: 'Amsterdam', country: 'Hollanda', region: 'europe', lat: 52.37, lon: 4.90, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Brüksel', country: 'Belçika', region: 'europe', lat: 50.85, lon: 4.35, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Dublin', country: 'İrlanda', region: 'europe', lat: 53.35, lon: -6.26, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'learning'] },
        { city: 'Edinburgh', country: 'İskoçya', region: 'europe', lat: 55.95, lon: -3.19, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Manchester', country: 'İngiltere', region: 'europe', lat: 53.48, lon: -2.24, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Lyon', country: 'Fransa', region: 'europe', lat: 45.76, lon: 4.84, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Marsilya', country: 'Fransa', region: 'europe', lat: 43.30, lon: 5.37, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Nice', country: 'Fransa', region: 'europe', lat: 43.71, lon: 7.26, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Rotterdam', country: 'Hollanda', region: 'europe', lat: 51.92, lon: 4.48, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'creativity'] },

        // Almanya
        { city: 'Berlin', country: 'Almanya', region: 'europe', lat: 52.52, lon: 13.41, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'learning', 'adventure'] },
        { city: 'Münih', country: 'Almanya', region: 'europe', lat: 48.14, lon: 11.58, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Hamburg', country: 'Almanya', region: 'europe', lat: 53.55, lon: 9.99, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Frankfurt', country: 'Almanya', region: 'europe', lat: 50.11, lon: 8.68, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Köln', country: 'Almanya', region: 'europe', lat: 50.94, lon: 6.96, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Düsseldorf', country: 'Almanya', region: 'europe', lat: 51.23, lon: 6.78, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Stuttgart', country: 'Almanya', region: 'europe', lat: 48.78, lon: 9.18, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career'] },

        // İtalya
        { city: 'Roma', country: 'İtalya', region: 'europe', lat: 41.90, lon: 12.50, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Milano', country: 'İtalya', region: 'europe', lat: 45.46, lon: 9.19, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Floransa', country: 'İtalya', region: 'europe', lat: 43.77, lon: 11.25, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Napoli', country: 'İtalya', region: 'europe', lat: 40.85, lon: 14.27, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'Venedik', country: 'İtalya', region: 'europe', lat: 45.44, lon: 12.32, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Torino', country: 'İtalya', region: 'europe', lat: 45.07, lon: 7.69, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Bologna', country: 'İtalya', region: 'europe', lat: 44.49, lon: 11.34, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Palermo', country: 'İtalya', region: 'europe', lat: 38.12, lon: 13.36, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },

        // İspanya & Portekiz
        { city: 'Madrid', country: 'İspanya', region: 'europe', lat: 40.42, lon: -3.70, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'love', 'adventure'] },
        { city: 'Barcelona', country: 'İspanya', region: 'europe', lat: 41.39, lon: 2.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Sevilla', country: 'İspanya', region: 'europe', lat: 37.39, lon: -5.98, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Valencia', country: 'İspanya', region: 'europe', lat: 39.47, lon: -0.38, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Malaga', country: 'İspanya', region: 'europe', lat: 36.72, lon: -4.42, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Granada', country: 'İspanya', region: 'europe', lat: 37.18, lon: -3.60, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Lizbon', country: 'Portekiz', region: 'europe', lat: 38.72, lon: -9.14, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'love'] },
        { city: 'Porto', country: 'Portekiz', region: 'europe', lat: 41.15, lon: -8.61, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },

        // İskandinav
        { city: 'Stockholm', country: 'İsveç', region: 'europe', lat: 59.33, lon: 18.07, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace', 'career'] },
        { city: 'Kopenhag', country: 'Danimarka', region: 'europe', lat: 55.68, lon: 12.57, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning', 'creativity'] },
        { city: 'Oslo', country: 'Norveç', region: 'europe', lat: 59.91, lon: 10.75, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Helsinki', country: 'Finlandiya', region: 'europe', lat: 60.17, lon: 24.94, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Reykjavik', country: 'İzlanda', region: 'europe', lat: 64.13, lon: -21.90, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'growth', 'adventure'] },
        { city: 'Göteborg', country: 'İsveç', region: 'europe', lat: 57.71, lon: 11.97, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'creativity'] },

        // Orta Avrupa
        { city: 'Viyana', country: 'Avusturya', region: 'europe', lat: 48.21, lon: 16.37, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career', 'learning'] },
        { city: 'Zürih', country: 'İsviçre', region: 'europe', lat: 47.38, lon: 8.54, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace', 'luck'] },
        { city: 'Cenevre', country: 'İsviçre', region: 'europe', lat: 46.20, lon: 6.14, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Prag', country: 'Çekya', region: 'europe', lat: 50.08, lon: 14.44, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Budapeşte', country: 'Macaristan', region: 'europe', lat: 47.50, lon: 19.04, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Varşova', country: 'Polonya', region: 'europe', lat: 52.23, lon: 21.01, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Krakov', country: 'Polonya', region: 'europe', lat: 50.06, lon: 19.94, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },

        // Balkanlar & Doğu Avrupa
        { city: 'Atina', country: 'Yunanistan', region: 'europe', lat: 37.98, lon: 23.73, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'learning'] },
        { city: 'Selanik', country: 'Yunanistan', region: 'europe', lat: 40.64, lon: 22.94, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Santorini', country: 'Yunanistan', region: 'europe', lat: 36.39, lon: 25.46, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Dubrovnik', country: 'Hırvatistan', region: 'europe', lat: 42.65, lon: 18.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Zagreb', country: 'Hırvatistan', region: 'europe', lat: 45.81, lon: 15.98, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Split', country: 'Hırvatistan', region: 'europe', lat: 43.51, lon: 16.44, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Belgrad', country: 'Sırbistan', region: 'europe', lat: 44.79, lon: 20.47, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity'] },
        { city: 'Bükreş', country: 'Romanya', region: 'europe', lat: 44.43, lon: 26.10, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Sofya', country: 'Bulgaristan', region: 'europe', lat: 42.70, lon: 23.32, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Ljubljana', country: 'Slovenya', region: 'europe', lat: 46.06, lon: 14.51, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Tallinn', country: 'Estonya', region: 'europe', lat: 59.44, lon: 24.75, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['learning', 'career'] },
        { city: 'Riga', country: 'Letonya', region: 'europe', lat: 56.95, lon: 24.11, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Vilnius', country: 'Litvanya', region: 'europe', lat: 54.69, lon: 25.28, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Podgorica', country: 'Karadağ', region: 'europe', lat: 42.44, lon: 19.26, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Tiran', country: 'Arnavutluk', region: 'europe', lat: 41.33, lon: 19.82, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Saraybosna', country: 'Bosna-Hersek', region: 'europe', lat: 43.86, lon: 18.41, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Moskova', country: 'Rusya', region: 'europe', lat: 55.76, lon: 37.62, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth', 'adventure'] },
        { city: 'St. Petersburg', country: 'Rusya', region: 'europe', lat: 59.93, lon: 30.32, climate: 'cold', size: 'mega', nature: 'coastal', vibe: ['creativity', 'learning'] },

        // Ek Avrupa Şehirleri
        { city: 'Bratislava', country: 'Slovakya', region: 'europe', lat: 48.15, lon: 17.11, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'learning'] },
        { city: 'Salzburg', country: 'Avusturya', region: 'europe', lat: 47.80, lon: 13.04, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Innsbruck', country: 'Avusturya', region: 'europe', lat: 47.26, lon: 11.39, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Lüksemburg', country: 'Lüksemburg', region: 'europe', lat: 49.61, lon: 6.13, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Brugge', country: 'Belçika', region: 'europe', lat: 51.21, lon: 3.23, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Malta', country: 'Malta', region: 'europe', lat: 35.90, lon: 14.51, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Lefkoşa', country: 'Kıbrıs', region: 'europe', lat: 35.19, lon: 33.38, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Gdansk', country: 'Polonya', region: 'europe', lat: 54.35, lon: 18.65, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Hannover', country: 'Almanya', region: 'europe', lat: 52.38, lon: 9.73, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Nürnberg', country: 'Almanya', region: 'europe', lat: 49.45, lon: 11.08, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Leipzig', country: 'Almanya', region: 'europe', lat: 51.34, lon: 12.37, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Dresden', country: 'Almanya', region: 'europe', lat: 51.05, lon: 13.74, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Bern', country: 'İsviçre', region: 'europe', lat: 46.95, lon: 7.45, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Bordeaux', country: 'Fransa', region: 'europe', lat: 44.84, lon: -0.58, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Strasbourg', country: 'Fransa', region: 'europe', lat: 48.57, lon: 7.75, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Toulouse', country: 'Fransa', region: 'europe', lat: 43.60, lon: 1.44, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Bilbao', country: 'İspanya', region: 'europe', lat: 43.26, lon: -2.93, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Cordoba', country: 'İspanya', region: 'europe', lat: 37.88, lon: -4.77, climate: 'warm', size: 'small', nature: 'urban', vibe: ['peace', 'creativity'] },
        { city: 'Bristol', country: 'İngiltere', region: 'europe', lat: 51.45, lon: -2.59, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'adventure'] },
        { city: 'Brighton', country: 'İngiltere', region: 'europe', lat: 50.82, lon: -0.14, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Glasgow', country: 'İskoçya', region: 'europe', lat: 55.86, lon: -4.25, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Bergen', country: 'Norveç', region: 'europe', lat: 60.39, lon: 5.32, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Üsküp', country: 'K. Makedonya', region: 'europe', lat: 41.99, lon: 21.43, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Priştine', country: 'Kosova', region: 'europe', lat: 42.66, lon: 21.17, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['growth', 'adventure'] },
    ];

    // =============================================
    // ASYA
    // =============================================
    const ASIA = [
        // Doğu Asya
        { city: 'Tokyo', country: 'Japonya', region: 'asia', lat: 35.68, lon: 139.69, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'adventure', 'learning', 'creativity'] },
        { city: 'Kyoto', country: 'Japonya', region: 'asia', lat: 35.01, lon: 135.77, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'creativity', 'growth'] },
        { city: 'Osaka', country: 'Japonya', region: 'asia', lat: 34.69, lon: 135.50, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Seul', country: 'Güney Kore', region: 'asia', lat: 37.57, lon: 126.98, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Busan', country: 'Güney Kore', region: 'asia', lat: 35.18, lon: 129.08, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Pekin', country: 'Çin', region: 'asia', lat: 39.90, lon: 116.40, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'growth'] },
        { city: 'Şanghay', country: 'Çin', region: 'asia', lat: 31.23, lon: 121.47, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'luck'] },
        { city: 'Hong Kong', country: 'Çin', region: 'asia', lat: 22.32, lon: 114.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Taipei', country: 'Tayvan', region: 'asia', lat: 25.03, lon: 121.57, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'adventure', 'creativity'] },

        // Güneydoğu Asya
        { city: 'Singapur', country: 'Singapur', region: 'asia', lat: 1.35, lon: 103.82, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Bangkok', country: 'Tayland', region: 'asia', lat: 13.76, lon: 100.50, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity', 'love'] },
        { city: 'Chiang Mai', country: 'Tayland', region: 'asia', lat: 18.79, lon: 98.98, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Bali', country: 'Endonezya', region: 'asia', lat: -8.34, lon: 115.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Jakarta', country: 'Endonezya', region: 'asia', lat: -6.21, lon: 106.85, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Kuala Lumpur', country: 'Malezya', region: 'asia', lat: 3.14, lon: 101.69, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Ho Chi Minh', country: 'Vietnam', region: 'asia', lat: 10.82, lon: 106.63, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'creativity'] },
        { city: 'Hanoi', country: 'Vietnam', region: 'asia', lat: 21.03, lon: 105.85, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Manila', country: 'Filipinler', region: 'asia', lat: 14.60, lon: 120.98, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Phnom Penh', country: 'Kamboçya', region: 'asia', lat: 11.56, lon: 104.92, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },

        // Güney Asya
        { city: 'Mumbai', country: 'Hindistan', region: 'asia', lat: 19.08, lon: 72.88, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Delhi', country: 'Hindistan', region: 'asia', lat: 28.61, lon: 77.21, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Bangalore', country: 'Hindistan', region: 'asia', lat: 12.97, lon: 77.59, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Goa', country: 'Hindistan', region: 'asia', lat: 15.30, lon: 74.12, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity', 'love'] },
        { city: 'Kolombo', country: 'Sri Lanka', region: 'asia', lat: 6.93, lon: 79.84, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Katmandu', country: 'Nepal', region: 'asia', lat: 27.72, lon: 85.32, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },

        // Orta Doğu
        { city: 'Dubai', country: 'BAE', region: 'asia', lat: 25.20, lon: 55.27, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Abu Dabi', country: 'BAE', region: 'asia', lat: 24.45, lon: 54.65, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Tel Aviv', country: 'İsrail', region: 'asia', lat: 32.09, lon: 34.78, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'learning', 'adventure'] },
        { city: 'Amman', country: 'Ürdün', region: 'asia', lat: 31.96, lon: 35.95, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Beyrut', country: 'Lübnan', region: 'asia', lat: 33.89, lon: 35.50, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Doha', country: 'Katar', region: 'asia', lat: 25.29, lon: 51.53, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Muscat', country: 'Umman', region: 'asia', lat: 23.59, lon: 58.54, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Bakü', country: 'Azerbaycan', region: 'asia', lat: 40.41, lon: 49.87, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Tiflis', country: 'Gürcistan', region: 'asia', lat: 41.72, lon: 44.79, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'peace'] },
        { city: 'Erivan', country: 'Ermenistan', region: 'asia', lat: 40.18, lon: 44.51, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },

        // Orta Asya
        { city: 'Almatı', country: 'Kazakistan', region: 'asia', lat: 43.24, lon: 76.95, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Taşkent', country: 'Özbekistan', region: 'asia', lat: 41.30, lon: 69.28, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Bişkek', country: 'Kırgızistan', region: 'asia', lat: 42.87, lon: 74.59, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },

        // Ek Asya Şehirleri
        { city: 'Tahran', country: 'İran', region: 'asia', lat: 35.69, lon: 51.39, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'İsfahan', country: 'İran', region: 'asia', lat: 32.65, lon: 51.68, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Şiraz', country: 'İran', region: 'asia', lat: 29.59, lon: 52.58, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Bağdat', country: 'Irak', region: 'asia', lat: 33.31, lon: 44.37, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Erbil', country: 'Irak', region: 'asia', lat: 36.19, lon: 44.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Küveyt', country: 'Küveyt', region: 'asia', lat: 29.38, lon: 47.99, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Riyad', country: 'Suudi Arabistan', region: 'asia', lat: 24.71, lon: 46.67, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Cidde', country: 'Suudi Arabistan', region: 'asia', lat: 21.49, lon: 39.19, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Manama', country: 'Bahreyn', region: 'asia', lat: 26.23, lon: 50.59, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Kudüs', country: 'İsrail', region: 'asia', lat: 31.77, lon: 35.23, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'learning'] },
        { city: 'Şam', country: 'Suriye', region: 'asia', lat: 33.51, lon: 36.29, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Sapporo', country: 'Japonya', region: 'asia', lat: 43.06, lon: 141.35, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Fukuoka', country: 'Japonya', region: 'asia', lat: 33.59, lon: 130.40, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Shenzhen', country: 'Çin', region: 'asia', lat: 22.54, lon: 114.06, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Chengdu', country: 'Çin', region: 'asia', lat: 30.57, lon: 104.07, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Incheon', country: 'Güney Kore', region: 'asia', lat: 37.46, lon: 126.71, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Jeju', country: 'Güney Kore', region: 'asia', lat: 33.50, lon: 126.53, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Phuket', country: 'Tayland', region: 'asia', lat: 7.88, lon: 98.39, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Siem Reap', country: 'Kamboçya', region: 'asia', lat: 13.36, lon: 103.86, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Luang Prabang', country: 'Laos', region: 'asia', lat: 19.89, lon: 102.13, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Yangon', country: 'Myanmar', region: 'asia', lat: 16.87, lon: 96.20, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Jaipur', country: 'Hindistan', region: 'asia', lat: 26.91, lon: 75.79, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Varanasi', country: 'Hindistan', region: 'asia', lat: 25.32, lon: 83.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Kerala', country: 'Hindistan', region: 'asia', lat: 10.85, lon: 76.27, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },
        { city: 'Maldivler', country: 'Maldivler', region: 'asia', lat: 4.18, lon: 73.51, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Nur Sultan', country: 'Kazakistan', region: 'asia', lat: 51.17, lon: 71.43, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Semerkant', country: 'Özbekistan', region: 'asia', lat: 39.65, lon: 66.96, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'growth'] },
        { city: 'Aşkabat', country: 'Türkmenistan', region: 'asia', lat: 37.96, lon: 58.33, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Duşanbe', country: 'Tacikistan', region: 'asia', lat: 38.56, lon: 68.77, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
    ];

    // =============================================
    // AMERİKA
    // =============================================
    const AMERICAS = [
        // ABD - Büyük Şehirler
        { city: 'New York', country: 'ABD', region: 'americas', lat: 40.71, lon: -74.01, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Los Angeles', country: 'ABD', region: 'americas', lat: 34.05, lon: -118.24, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Chicago', country: 'ABD', region: 'americas', lat: 41.88, lon: -87.63, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
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

        // Kanada
        { city: 'Toronto', country: 'Kanada', region: 'americas', lat: 43.65, lon: -79.38, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Vancouver', country: 'Kanada', region: 'americas', lat: 49.28, lon: -123.12, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Montreal', country: 'Kanada', region: 'americas', lat: 45.50, lon: -73.57, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Calgary', country: 'Kanada', region: 'americas', lat: 51.04, lon: -114.07, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['career', 'adventure'] },
        { city: 'Ottawa', country: 'Kanada', region: 'americas', lat: 45.42, lon: -75.70, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },

        // Latin Amerika
        { city: 'Mexico City', country: 'Meksika', region: 'americas', lat: 19.43, lon: -99.13, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'love'] },
        { city: 'Cancún', country: 'Meksika', region: 'americas', lat: 21.16, lon: -86.85, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Guadalajara', country: 'Meksika', region: 'americas', lat: 20.67, lon: -103.35, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Buenos Aires', country: 'Arjantin', region: 'americas', lat: -34.60, lon: -58.38, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'São Paulo', country: 'Brezilya', region: 'americas', lat: -23.55, lon: -46.63, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Rio de Janeiro', country: 'Brezilya', region: 'americas', lat: -22.91, lon: -43.17, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'adventure', 'creativity'] },
        { city: 'Bogota', country: 'Kolombiya', region: 'americas', lat: 4.71, lon: -74.07, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Medellín', country: 'Kolombiya', region: 'americas', lat: 6.25, lon: -75.56, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Cartagena', country: 'Kolombiya', region: 'americas', lat: 10.39, lon: -75.51, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Lima', country: 'Peru', region: 'americas', lat: -12.05, lon: -77.04, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Santiago', country: 'Şili', region: 'americas', lat: -33.45, lon: -70.67, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Montevideo', country: 'Uruguay', region: 'americas', lat: -34.88, lon: -56.18, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Havana', country: 'Küba', region: 'americas', lat: 23.11, lon: -82.37, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'San José', country: 'Kosta Rika', region: 'americas', lat: 9.93, lon: -84.08, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Panama City', country: 'Panama', region: 'americas', lat: 8.98, lon: -79.52, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Quito', country: 'Ekvador', region: 'americas', lat: -0.18, lon: -78.47, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'growth'] },

        // Ek Amerika Şehirleri
        { city: 'Phoenix', country: 'ABD', region: 'americas', lat: 33.45, lon: -112.07, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Minneapolis', country: 'ABD', region: 'americas', lat: 44.98, lon: -93.27, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Detroit', country: 'ABD', region: 'americas', lat: 42.33, lon: -83.05, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Salt Lake City', country: 'ABD', region: 'americas', lat: 40.76, lon: -111.89, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Savannah', country: 'ABD', region: 'americas', lat: 32.08, lon: -81.09, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Charleston', country: 'ABD', region: 'americas', lat: 32.78, lon: -79.93, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Santa Fe', country: 'ABD', region: 'americas', lat: 35.69, lon: -105.94, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Anchorage', country: 'ABD', region: 'americas', lat: 61.22, lon: -149.90, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Victoria', country: 'Kanada', region: 'americas', lat: 48.43, lon: -123.37, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Quebec City', country: 'Kanada', region: 'americas', lat: 46.81, lon: -71.21, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Tulum', country: 'Meksika', region: 'americas', lat: 20.21, lon: -87.43, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },
        { city: 'Valparaíso', country: 'Şili', region: 'americas', lat: -33.05, lon: -71.62, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Cusco', country: 'Peru', region: 'americas', lat: -13.52, lon: -71.97, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },
        { city: 'Florianópolis', country: 'Brezilya', region: 'americas', lat: -27.60, lon: -48.55, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Bariloche', country: 'Arjantin', region: 'americas', lat: -41.13, lon: -71.30, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure', 'love'] },
        { city: 'Punta Cana', country: 'Dominik Cum.', region: 'americas', lat: 18.58, lon: -68.40, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Nassau', country: 'Bahamalar', region: 'americas', lat: 25.06, lon: -77.35, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'luck'] },
        { city: 'Kingston', country: 'Jamaika', region: 'americas', lat: 18.00, lon: -76.79, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
    ];

    // =============================================
    // AFRİKA
    // =============================================
    const AFRICA = [
        { city: 'Cape Town', country: 'Güney Afrika', region: 'africa', lat: -33.93, lon: 18.42, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Johannesburg', country: 'Güney Afrika', region: 'africa', lat: -26.20, lon: 28.05, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Marakeş', country: 'Fas', region: 'africa', lat: 31.63, lon: -8.01, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Kazablanka', country: 'Fas', region: 'africa', lat: 33.57, lon: -7.59, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Kahire', country: 'Mısır', region: 'africa', lat: 30.04, lon: 31.24, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning', 'career'] },
        { city: 'Tunus', country: 'Tunus', region: 'africa', lat: 36.81, lon: 10.18, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Nairobi', country: 'Kenya', region: 'africa', lat: -1.29, lon: 36.82, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'growth'] },
        { city: 'Lagos', country: 'Nijerya', region: 'africa', lat: 6.52, lon: 3.38, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'creativity'] },
        { city: 'Addis Ababa', country: 'Etiyopya', region: 'africa', lat: 9.01, lon: 38.75, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'Dar es Salaam', country: 'Tanzanya', region: 'africa', lat: -6.79, lon: 39.28, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Zanzibar', country: 'Tanzanya', region: 'africa', lat: -6.16, lon: 39.19, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Accra', country: 'Gana', region: 'africa', lat: 5.56, lon: -0.20, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Dakar', country: 'Senegal', region: 'africa', lat: 14.69, lon: -17.44, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Kigali', country: 'Ruanda', region: 'africa', lat: -1.94, lon: 29.87, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'career'] },
        { city: 'Mauritius', country: 'Mauritius', region: 'africa', lat: -20.35, lon: 57.55, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Ek Afrika Şehirleri
        { city: 'Luxor', country: 'Mısır', region: 'africa', lat: 25.69, lon: 32.64, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'İskenderiye', country: 'Mısır', region: 'africa', lat: 31.20, lon: 29.92, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['learning', 'creativity'] },
        { city: 'Fes', country: 'Fas', region: 'africa', lat: 34.03, lon: -5.00, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Şefşauen', country: 'Fas', region: 'africa', lat: 35.17, lon: -5.27, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Kampala', country: 'Uganda', region: 'africa', lat: 0.35, lon: 32.58, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Maputo', country: 'Mozambik', region: 'africa', lat: -25.97, lon: 32.57, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Windhoek', country: 'Namibya', region: 'africa', lat: -22.56, lon: 17.08, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'peace'] },
        { city: 'Durban', country: 'Güney Afrika', region: 'africa', lat: -29.86, lon: 31.02, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Victoria Falls', country: 'Zambiya', region: 'africa', lat: -17.93, lon: 25.86, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Seychelles', country: 'Seyşeller', region: 'africa', lat: -4.68, lon: 55.49, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
    ];

    // =============================================
    // OKYANUSYA
    // =============================================
    const OCEANIA = [
        { city: 'Sydney', country: 'Avustralya', region: 'oceania', lat: -33.87, lon: 151.21, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Melbourne', country: 'Avustralya', region: 'oceania', lat: -37.81, lon: 144.96, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Brisbane', country: 'Avustralya', region: 'oceania', lat: -27.47, lon: 153.03, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Perth', country: 'Avustralya', region: 'oceania', lat: -31.95, lon: 115.86, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Gold Coast', country: 'Avustralya', region: 'oceania', lat: -28.00, lon: 153.43, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure', 'peace'] },
        { city: 'Auckland', country: 'Yeni Zelanda', region: 'oceania', lat: -36.85, lon: 174.76, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Wellington', country: 'Yeni Zelanda', region: 'oceania', lat: -41.29, lon: 174.78, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Queenstown', country: 'Yeni Zelanda', region: 'oceania', lat: -45.03, lon: 168.66, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Fiji', country: 'Fiji', region: 'oceania', lat: -17.77, lon: 177.96, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Ek Okyanusya Şehirleri
        { city: 'Adelaide', country: 'Avustralya', region: 'oceania', lat: -34.93, lon: 138.60, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Cairns', country: 'Avustralya', region: 'oceania', lat: -16.92, lon: 145.77, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Hobart', country: 'Avustralya', region: 'oceania', lat: -42.88, lon: 147.33, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Christchurch', country: 'Yeni Zelanda', region: 'oceania', lat: -43.53, lon: 172.64, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Rotorua', country: 'Yeni Zelanda', region: 'oceania', lat: -38.14, lon: 176.25, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Bora Bora', country: 'Fransız Polinezyası', region: 'oceania', lat: -16.50, lon: -151.74, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Tahiti', country: 'Fransız Polinezyası', region: 'oceania', lat: -17.53, lon: -149.57, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'creativity'] },
    ];

    // =============================================
    // TÜM ŞEHİRLERİ BİRLEŞTİR
    // =============================================
    const ALL_CITIES = [...TURKEY, ...EUROPE, ...ASIA, ...AMERICAS, ...AFRICA, ...OCEANIA];

    // Bölge isimleri
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
