/**
 * ============================================
 * AstroMap – Mega City Database
 * 81 Türkiye İli + Dünya Ülkeleri
 * 4 ondalık koordinat → DMS saniye seviyesinde doğru
 * ============================================
 */

const CITY_DATABASE = (() => {

    // =============================================
    // TÜRKİYE – 81 İl + Turistik Yerler
    // =============================================
    const TURKEY = [
        { city: 'Adana', country: 'Türkiye', region: 'tr', lat: 36.9914, lon: 35.3308, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Adıyaman', country: 'Türkiye', region: 'tr', lat: 37.7648, lon: 38.2786, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Afyonkarahisar', country: 'Türkiye', region: 'tr', lat: 38.7507, lon: 30.5567, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Ağrı', country: 'Türkiye', region: 'tr', lat: 39.7191, lon: 43.0503, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Aksaray', country: 'Türkiye', region: 'tr', lat: 38.3687, lon: 34.0370, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Amasya', country: 'Türkiye', region: 'tr', lat: 40.6499, lon: 35.8353, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Ankara', country: 'Türkiye', region: 'tr', lat: 39.9334, lon: 32.8597, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Antalya', country: 'Türkiye', region: 'tr', lat: 36.8969, lon: 30.7133, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Ardahan', country: 'Türkiye', region: 'tr', lat: 41.1105, lon: 42.7022, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Artvin', country: 'Türkiye', region: 'tr', lat: 41.1828, lon: 41.8183, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Aydın', country: 'Türkiye', region: 'tr', lat: 37.8560, lon: 27.8416, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Balıkesir', country: 'Türkiye', region: 'tr', lat: 39.6484, lon: 27.8826, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Bartın', country: 'Türkiye', region: 'tr', lat: 41.6344, lon: 32.3375, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace'] },
        { city: 'Batman', country: 'Türkiye', region: 'tr', lat: 37.8812, lon: 41.1351, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth'] },
        { city: 'Bayburt', country: 'Türkiye', region: 'tr', lat: 40.2552, lon: 40.2249, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bilecik', country: 'Türkiye', region: 'tr', lat: 40.0567, lon: 30.0067, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Bingöl', country: 'Türkiye', region: 'tr', lat: 38.8855, lon: 40.4966, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bitlis', country: 'Türkiye', region: 'tr', lat: 38.4010, lon: 42.1095, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Bolu', country: 'Türkiye', region: 'tr', lat: 40.7360, lon: 31.6061, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Burdur', country: 'Türkiye', region: 'tr', lat: 37.7165, lon: 30.2884, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Bursa', country: 'Türkiye', region: 'tr', lat: 40.1885, lon: 29.0610, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'peace', 'creativity'] },
        { city: 'Çanakkale', country: 'Türkiye', region: 'tr', lat: 40.1553, lon: 26.4142, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning'] },
        { city: 'Çankırı', country: 'Türkiye', region: 'tr', lat: 40.6013, lon: 33.6134, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Çorum', country: 'Türkiye', region: 'tr', lat: 40.5506, lon: 34.9556, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Denizli', country: 'Türkiye', region: 'tr', lat: 37.7765, lon: 29.0864, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Diyarbakır', country: 'Türkiye', region: 'tr', lat: 37.9144, lon: 40.2306, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Düzce', country: 'Türkiye', region: 'tr', lat: 40.8438, lon: 31.1565, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Edirne', country: 'Türkiye', region: 'tr', lat: 41.6818, lon: 26.5623, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Elazığ', country: 'Türkiye', region: 'tr', lat: 38.6810, lon: 39.2264, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['learning', 'peace'] },
        { city: 'Erzincan', country: 'Türkiye', region: 'tr', lat: 39.7514, lon: 39.4882, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Erzurum', country: 'Türkiye', region: 'tr', lat: 39.9055, lon: 41.2658, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Eskişehir', country: 'Türkiye', region: 'tr', lat: 39.7767, lon: 30.5206, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'peace'] },
        { city: 'Gaziantep', country: 'Türkiye', region: 'tr', lat: 37.0662, lon: 37.3833, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Giresun', country: 'Türkiye', region: 'tr', lat: 40.9128, lon: 38.3895, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace'] },
        { city: 'Gümüşhane', country: 'Türkiye', region: 'tr', lat: 40.4386, lon: 39.5086, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Hakkari', country: 'Türkiye', region: 'tr', lat: 37.5833, lon: 43.7409, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Hatay', country: 'Türkiye', region: 'tr', lat: 36.4018, lon: 36.3498, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Iğdır', country: 'Türkiye', region: 'tr', lat: 39.9167, lon: 44.0489, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['growth'] },
        { city: 'Isparta', country: 'Türkiye', region: 'tr', lat: 37.7648, lon: 30.5566, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'İstanbul', country: 'Türkiye', region: 'tr', lat: 41.0082, lon: 28.9784, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'love', 'creativity', 'adventure'] },
        { city: 'İzmir', country: 'Türkiye', region: 'tr', lat: 38.4192, lon: 27.1287, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'career', 'peace'] },
        { city: 'Kahramanmaraş', country: 'Türkiye', region: 'tr', lat: 37.5858, lon: 36.9371, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Karabük', country: 'Türkiye', region: 'tr', lat: 41.2061, lon: 32.6204, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Karaman', country: 'Türkiye', region: 'tr', lat: 37.1815, lon: 33.2150, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kars', country: 'Türkiye', region: 'tr', lat: 40.6013, lon: 43.0975, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Kastamonu', country: 'Türkiye', region: 'tr', lat: 41.3887, lon: 33.7827, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Kayseri', country: 'Türkiye', region: 'tr', lat: 38.7312, lon: 35.4787, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Kilis', country: 'Türkiye', region: 'tr', lat: 36.7184, lon: 37.1212, climate: 'warm', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kırıkkale', country: 'Türkiye', region: 'tr', lat: 39.8468, lon: 33.5153, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career'] },
        { city: 'Kırklareli', country: 'Türkiye', region: 'tr', lat: 41.7353, lon: 27.2253, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Kırşehir', country: 'Türkiye', region: 'tr', lat: 39.1425, lon: 34.1709, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace', 'creativity'] },
        { city: 'Kocaeli', country: 'Türkiye', region: 'tr', lat: 40.7654, lon: 29.9408, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career'] },
        { city: 'Konya', country: 'Türkiye', region: 'tr', lat: 37.8746, lon: 32.4932, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['peace', 'growth', 'creativity'] },
        { city: 'Kütahya', country: 'Türkiye', region: 'tr', lat: 39.4168, lon: 29.9833, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Malatya', country: 'Türkiye', region: 'tr', lat: 38.3552, lon: 38.3095, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Manisa', country: 'Türkiye', region: 'tr', lat: 38.6191, lon: 27.4289, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Mardin', country: 'Türkiye', region: 'tr', lat: 37.3212, lon: 40.7245, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Mersin', country: 'Türkiye', region: 'tr', lat: 36.8121, lon: 34.6415, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Muğla', country: 'Türkiye', region: 'tr', lat: 37.2153, lon: 28.3636, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Muş', country: 'Türkiye', region: 'tr', lat: 38.9462, lon: 41.7539, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Nevşehir', country: 'Türkiye', region: 'tr', lat: 38.6939, lon: 34.6857, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Niğde', country: 'Türkiye', region: 'tr', lat: 37.9667, lon: 34.6833, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace'] },
        { city: 'Ordu', country: 'Türkiye', region: 'tr', lat: 40.9839, lon: 37.8764, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Osmaniye', country: 'Türkiye', region: 'tr', lat: 37.0746, lon: 36.2464, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace'] },
        { city: 'Rize', country: 'Türkiye', region: 'tr', lat: 41.0201, lon: 40.5234, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Sakarya', country: 'Türkiye', region: 'tr', lat: 40.6940, lon: 30.4358, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace'] },
        { city: 'Samsun', country: 'Türkiye', region: 'tr', lat: 41.2867, lon: 36.3304, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'peace'] },
        { city: 'Şanlıurfa', country: 'Türkiye', region: 'tr', lat: 37.1591, lon: 38.7969, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Siirt', country: 'Türkiye', region: 'tr', lat: 37.9273, lon: 41.9420, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Sinop', country: 'Türkiye', region: 'tr', lat: 42.0231, lon: 35.1531, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Sivas', country: 'Türkiye', region: 'tr', lat: 39.7477, lon: 37.0179, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Şırnak', country: 'Türkiye', region: 'tr', lat: 37.4187, lon: 42.4918, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth'] },
        { city: 'Tekirdağ', country: 'Türkiye', region: 'tr', lat: 40.9781, lon: 27.5115, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace'] },
        { city: 'Tokat', country: 'Türkiye', region: 'tr', lat: 40.3167, lon: 36.5544, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace'] },
        { city: 'Trabzon', country: 'Türkiye', region: 'tr', lat: 41.0027, lon: 39.7168, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'adventure'] },
        { city: 'Tunceli', country: 'Türkiye', region: 'tr', lat: 39.1079, lon: 39.5401, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Uşak', country: 'Türkiye', region: 'tr', lat: 38.6823, lon: 29.4082, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Van', country: 'Türkiye', region: 'tr', lat: 38.4891, lon: 43.3802, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'growth', 'peace'] },
        { city: 'Yalova', country: 'Türkiye', region: 'tr', lat: 40.6550, lon: 29.2769, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Yozgat', country: 'Türkiye', region: 'tr', lat: 39.8181, lon: 34.8147, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['peace'] },
        { city: 'Zonguldak', country: 'Türkiye', region: 'tr', lat: 41.4564, lon: 31.7987, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'peace'] },
        // Turistik yerler
        { city: 'Bodrum', country: 'Türkiye', region: 'tr', lat: 37.0344, lon: 27.4305, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Fethiye', country: 'Türkiye', region: 'tr', lat: 36.6538, lon: 29.1153, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Kapadokya', country: 'Türkiye', region: 'tr', lat: 38.6431, lon: 34.8283, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth', 'love'] },
        { city: 'Kuşadası', country: 'Türkiye', region: 'tr', lat: 37.8579, lon: 27.2610, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace', 'adventure'] },
        { city: 'Alanya', country: 'Türkiye', region: 'tr', lat: 36.5441, lon: 31.9956, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace', 'adventure'] },
        { city: 'Marmaris', country: 'Türkiye', region: 'tr', lat: 36.8510, lon: 28.2742, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Çeşme', country: 'Türkiye', region: 'tr', lat: 38.3234, lon: 26.3030, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Datça', country: 'Türkiye', region: 'tr', lat: 36.7267, lon: 27.6877, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Safranbolu', country: 'Türkiye', region: 'tr', lat: 41.2539, lon: 32.6918, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
    ];

    // =============================================
    // AVRUPA
    // =============================================
    const EUROPE = [
        // İngiltere & İskoçya & İrlanda & Galler
        { city: 'Londra', country: 'İngiltere', region: 'europe', lat: 51.5074, lon: -0.1278, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity', 'learning'] },
        { city: 'Manchester', country: 'İngiltere', region: 'europe', lat: 53.4808, lon: -2.2426, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Birmingham', country: 'İngiltere', region: 'europe', lat: 52.4862, lon: -1.8904, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Liverpool', country: 'İngiltere', region: 'europe', lat: 53.4084, lon: -2.9916, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Leeds', country: 'İngiltere', region: 'europe', lat: 53.8008, lon: -1.5491, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Bristol', country: 'İngiltere', region: 'europe', lat: 51.4545, lon: -2.5879, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'adventure'] },
        { city: 'Brighton', country: 'İngiltere', region: 'europe', lat: 50.8225, lon: -0.1372, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Cambridge', country: 'İngiltere', region: 'europe', lat: 52.2053, lon: 0.1218, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Oxford', country: 'İngiltere', region: 'europe', lat: 51.7520, lon: -1.2577, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Cardiff', country: 'Galler', region: 'europe', lat: 51.4816, lon: -3.1791, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Belfast', country: 'K. İrlanda', region: 'europe', lat: 54.5973, lon: -5.9301, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Edinburgh', country: 'İskoçya', region: 'europe', lat: 55.9533, lon: -3.1883, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Glasgow', country: 'İskoçya', region: 'europe', lat: 55.8642, lon: -4.2518, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Dublin', country: 'İrlanda', region: 'europe', lat: 53.3498, lon: -6.2603, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'learning'] },
        { city: 'Cork', country: 'İrlanda', region: 'europe', lat: 51.8969, lon: -8.4863, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },

        // Fransa
        { city: 'Paris', country: 'Fransa', region: 'europe', lat: 48.8566, lon: 2.3522, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['love', 'creativity', 'career'] },
        { city: 'Lyon', country: 'Fransa', region: 'europe', lat: 45.7640, lon: 4.8357, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Marsilya', country: 'Fransa', region: 'europe', lat: 43.2965, lon: 5.3698, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Nice', country: 'Fransa', region: 'europe', lat: 43.7102, lon: 7.2620, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Bordeaux', country: 'Fransa', region: 'europe', lat: 44.8378, lon: -0.5792, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Toulouse', country: 'Fransa', region: 'europe', lat: 43.6047, lon: 1.4442, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Strasbourg', country: 'Fransa', region: 'europe', lat: 48.5734, lon: 7.7521, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Nantes', country: 'Fransa', region: 'europe', lat: 47.2184, lon: -1.5536, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Montpellier', country: 'Fransa', region: 'europe', lat: 43.6108, lon: 3.8767, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['learning', 'love'] },
        { city: 'Lille', country: 'Fransa', region: 'europe', lat: 50.6292, lon: 3.0573, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },

        // Almanya
        { city: 'Berlin', country: 'Almanya', region: 'europe', lat: 52.5186, lon: 13.4049, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'learning', 'adventure'] },
        { city: 'Münih', country: 'Almanya', region: 'europe', lat: 48.1351, lon: 11.5820, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Hamburg', country: 'Almanya', region: 'europe', lat: 53.5511, lon: 9.9937, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Frankfurt', country: 'Almanya', region: 'europe', lat: 50.1109, lon: 8.6821, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Köln', country: 'Almanya', region: 'europe', lat: 50.9375, lon: 6.9603, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Düsseldorf', country: 'Almanya', region: 'europe', lat: 51.2277, lon: 6.7735, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Stuttgart', country: 'Almanya', region: 'europe', lat: 48.7758, lon: 9.1829, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career'] },
        { city: 'Hannover', country: 'Almanya', region: 'europe', lat: 52.3759, lon: 9.7320, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Nürnberg', country: 'Almanya', region: 'europe', lat: 49.4521, lon: 11.0767, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Leipzig', country: 'Almanya', region: 'europe', lat: 51.3397, lon: 12.3731, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Dresden', country: 'Almanya', region: 'europe', lat: 51.0504, lon: 13.7373, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Bremen', country: 'Almanya', region: 'europe', lat: 53.0793, lon: 8.8017, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Dortmund', country: 'Almanya', region: 'europe', lat: 51.5136, lon: 7.4653, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Freiburg', country: 'Almanya', region: 'europe', lat: 47.9990, lon: 7.8421, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Heidelberg', country: 'Almanya', region: 'europe', lat: 49.3988, lon: 8.6724, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['learning', 'love'] },

        // Hollanda & Belçika & Lüksemburg
        { city: 'Amsterdam', country: 'Hollanda', region: 'europe', lat: 52.3676, lon: 4.9041, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Rotterdam', country: 'Hollanda', region: 'europe', lat: 51.9225, lon: 4.4792, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Den Haag', country: 'Hollanda', region: 'europe', lat: 52.0705, lon: 4.3007, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['career', 'peace'] },
        { city: 'Utrecht', country: 'Hollanda', region: 'europe', lat: 52.0907, lon: 5.1214, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Brüksel', country: 'Belçika', region: 'europe', lat: 50.8503, lon: 4.3517, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Brugge', country: 'Belçika', region: 'europe', lat: 51.2093, lon: 3.2247, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Antwerp', country: 'Belçika', region: 'europe', lat: 51.2194, lon: 4.4025, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Lüksemburg', country: 'Lüksemburg', region: 'europe', lat: 49.6116, lon: 6.1319, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['career', 'luck'] },

        // İtalya
        { city: 'Roma', country: 'İtalya', region: 'europe', lat: 41.9028, lon: 12.4964, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Milano', country: 'İtalya', region: 'europe', lat: 45.4642, lon: 9.1895, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Floransa', country: 'İtalya', region: 'europe', lat: 43.7696, lon: 11.2558, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Napoli', country: 'İtalya', region: 'europe', lat: 40.8518, lon: 14.2681, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'Venedik', country: 'İtalya', region: 'europe', lat: 45.4408, lon: 12.3155, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Torino', country: 'İtalya', region: 'europe', lat: 45.0703, lon: 7.6869, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Bologna', country: 'İtalya', region: 'europe', lat: 44.4949, lon: 11.3426, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Palermo', country: 'İtalya', region: 'europe', lat: 38.1157, lon: 13.3615, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Genova', country: 'İtalya', region: 'europe', lat: 44.4056, lon: 8.9463, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Verona', country: 'İtalya', region: 'europe', lat: 45.4384, lon: 10.9916, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Bari', country: 'İtalya', region: 'europe', lat: 41.1171, lon: 16.8719, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Catania', country: 'İtalya', region: 'europe', lat: 37.5079, lon: 15.0830, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Siena', country: 'İtalya', region: 'europe', lat: 43.3188, lon: 11.3308, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['love', 'creativity'] },
        { city: 'Amalfi', country: 'İtalya', region: 'europe', lat: 40.6340, lon: 14.6027, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },

        // İspanya
        { city: 'Madrid', country: 'İspanya', region: 'europe', lat: 40.4168, lon: -3.7038, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'love', 'adventure'] },
        { city: 'Barcelona', country: 'İspanya', region: 'europe', lat: 41.3874, lon: 2.1686, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Sevilla', country: 'İspanya', region: 'europe', lat: 37.3891, lon: -5.9845, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['love', 'creativity'] },
        { city: 'Valencia', country: 'İspanya', region: 'europe', lat: 39.4699, lon: -0.3763, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity', 'peace'] },
        { city: 'Malaga', country: 'İspanya', region: 'europe', lat: 36.7213, lon: -4.4217, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Granada', country: 'İspanya', region: 'europe', lat: 37.1773, lon: -3.5986, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Bilbao', country: 'İspanya', region: 'europe', lat: 43.2630, lon: -2.9350, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Zaragoza', country: 'İspanya', region: 'europe', lat: 41.6488, lon: -0.8891, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['career', 'peace'] },
        { city: 'Palma de Mallorca', country: 'İspanya', region: 'europe', lat: 39.5696, lon: 2.6502, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Las Palmas', country: 'İspanya', region: 'europe', lat: 28.1235, lon: -15.4363, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'Ibiza', country: 'İspanya', region: 'europe', lat: 38.9067, lon: 1.4206, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'love', 'creativity'] },
        { city: 'San Sebastián', country: 'İspanya', region: 'europe', lat: 43.3183, lon: -1.9812, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },

        // Portekiz
        { city: 'Lizbon', country: 'Portekiz', region: 'europe', lat: 38.7223, lon: -9.1393, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace', 'love'] },
        { city: 'Porto', country: 'Portekiz', region: 'europe', lat: 41.1579, lon: -8.6291, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Faro', country: 'Portekiz', region: 'europe', lat: 37.0194, lon: -7.9322, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // İskandinav
        { city: 'Stockholm', country: 'İsveç', region: 'europe', lat: 59.3293, lon: 18.0686, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace', 'career'] },
        { city: 'Göteborg', country: 'İsveç', region: 'europe', lat: 57.7089, lon: 11.9746, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Malmö', country: 'İsveç', region: 'europe', lat: 55.6050, lon: 13.0038, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Kopenhag', country: 'Danimarka', region: 'europe', lat: 55.6761, lon: 12.5683, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'learning', 'creativity'] },
        { city: 'Aarhus', country: 'Danimarka', region: 'europe', lat: 56.1629, lon: 10.2039, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'creativity'] },
        { city: 'Oslo', country: 'Norveç', region: 'europe', lat: 59.9139, lon: 10.7522, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Bergen', country: 'Norveç', region: 'europe', lat: 60.3913, lon: 5.3221, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Tromsø', country: 'Norveç', region: 'europe', lat: 69.6492, lon: 18.9553, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Helsinki', country: 'Finlandiya', region: 'europe', lat: 60.1699, lon: 24.9384, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['learning', 'peace'] },
        { city: 'Tampere', country: 'Finlandiya', region: 'europe', lat: 61.4978, lon: 23.7610, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Reykjavik', country: 'İzlanda', region: 'europe', lat: 64.1466, lon: -21.9426, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['peace', 'growth', 'adventure'] },

        // Orta Avrupa
        { city: 'Viyana', country: 'Avusturya', region: 'europe', lat: 48.2082, lon: 16.3738, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'career', 'learning'] },
        { city: 'Salzburg', country: 'Avusturya', region: 'europe', lat: 47.8095, lon: 13.0550, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Innsbruck', country: 'Avusturya', region: 'europe', lat: 47.2692, lon: 11.4041, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Graz', country: 'Avusturya', region: 'europe', lat: 47.0707, lon: 15.4395, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Zürih', country: 'İsviçre', region: 'europe', lat: 47.3769, lon: 8.5417, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace', 'luck'] },
        { city: 'Cenevre', country: 'İsviçre', region: 'europe', lat: 46.2044, lon: 6.1432, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['career', 'peace'] },
        { city: 'Bern', country: 'İsviçre', region: 'europe', lat: 46.9480, lon: 7.4474, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Basel', country: 'İsviçre', region: 'europe', lat: 47.5596, lon: 7.5886, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Prag', country: 'Çekya', region: 'europe', lat: 50.0755, lon: 14.4378, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Brno', country: 'Çekya', region: 'europe', lat: 49.1951, lon: 16.6068, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Budapeşte', country: 'Macaristan', region: 'europe', lat: 47.4979, lon: 19.0402, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Bratislava', country: 'Slovakya', region: 'europe', lat: 48.1486, lon: 17.1077, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'learning'] },

        // Polonya
        { city: 'Varşova', country: 'Polonya', region: 'europe', lat: 52.2297, lon: 21.0122, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Krakov', country: 'Polonya', region: 'europe', lat: 50.0647, lon: 19.9450, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Gdansk', country: 'Polonya', region: 'europe', lat: 54.3520, lon: 18.6466, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Wrocław', country: 'Polonya', region: 'europe', lat: 51.1079, lon: 17.0385, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Poznań', country: 'Polonya', region: 'europe', lat: 52.4064, lon: 16.9252, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['career', 'learning'] },

        // Balkanlar
        { city: 'Atina', country: 'Yunanistan', region: 'europe', lat: 37.9838, lon: 23.7275, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'learning'] },
        { city: 'Selanik', country: 'Yunanistan', region: 'europe', lat: 40.6401, lon: 22.9444, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Santorini', country: 'Yunanistan', region: 'europe', lat: 36.3932, lon: 25.4615, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Girit', country: 'Yunanistan', region: 'europe', lat: 35.2401, lon: 24.4709, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Rodos', country: 'Yunanistan', region: 'europe', lat: 36.4341, lon: 28.2176, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Korfu', country: 'Yunanistan', region: 'europe', lat: 39.6243, lon: 19.9217, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Mykonos', country: 'Yunanistan', region: 'europe', lat: 37.4467, lon: 25.3289, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Dubrovnik', country: 'Hırvatistan', region: 'europe', lat: 42.6507, lon: 18.0944, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Zagreb', country: 'Hırvatistan', region: 'europe', lat: 45.8150, lon: 15.9819, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Split', country: 'Hırvatistan', region: 'europe', lat: 43.5081, lon: 16.4402, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Belgrad', country: 'Sırbistan', region: 'europe', lat: 44.7866, lon: 20.4489, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity'] },
        { city: 'Novi Sad', country: 'Sırbistan', region: 'europe', lat: 45.2671, lon: 19.8335, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Bükreş', country: 'Romanya', region: 'europe', lat: 44.4268, lon: 26.1025, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Cluj-Napoca', country: 'Romanya', region: 'europe', lat: 46.7712, lon: 23.6236, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Sofya', country: 'Bulgaristan', region: 'europe', lat: 42.6977, lon: 23.3219, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Varna', country: 'Bulgaristan', region: 'europe', lat: 43.2141, lon: 27.9147, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Ljubljana', country: 'Slovenya', region: 'europe', lat: 46.0569, lon: 14.5058, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Podgorica', country: 'Karadağ', region: 'europe', lat: 42.4304, lon: 19.2594, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Tiran', country: 'Arnavutluk', region: 'europe', lat: 41.3275, lon: 19.8187, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Saraybosna', country: 'Bosna-Hersek', region: 'europe', lat: 43.8563, lon: 18.4131, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Üsküp', country: 'K. Makedonya', region: 'europe', lat: 41.9981, lon: 21.4254, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Priştine', country: 'Kosova', region: 'europe', lat: 42.6629, lon: 21.1655, climate: 'moderate', size: 'small', nature: 'urban', vibe: ['growth', 'adventure'] },

        // Baltık
        { city: 'Tallinn', country: 'Estonya', region: 'europe', lat: 59.4370, lon: 24.7536, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['learning', 'career'] },
        { city: 'Riga', country: 'Letonya', region: 'europe', lat: 56.9496, lon: 24.1052, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Vilnius', country: 'Litvanya', region: 'europe', lat: 54.6872, lon: 25.2797, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'peace'] },

        // Doğu Avrupa
        { city: 'Moskova', country: 'Rusya', region: 'europe', lat: 55.7558, lon: 37.6173, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth', 'adventure'] },
        { city: 'St. Petersburg', country: 'Rusya', region: 'europe', lat: 59.9343, lon: 30.3351, climate: 'cold', size: 'mega', nature: 'coastal', vibe: ['creativity', 'learning'] },
        { city: 'Kazan', country: 'Rusya', region: 'europe', lat: 55.7964, lon: 49.1089, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Soçi', country: 'Rusya', region: 'europe', lat: 43.6028, lon: 39.7342, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Novosibirsk', country: 'Rusya', region: 'europe', lat: 55.0084, lon: 82.9357, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Kyiv', country: 'Ukrayna', region: 'europe', lat: 50.4501, lon: 30.5234, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Lviv', country: 'Ukrayna', region: 'europe', lat: 49.8397, lon: 24.0297, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Odessa', country: 'Ukrayna', region: 'europe', lat: 46.4825, lon: 30.7233, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Minsk', country: 'Belarus', region: 'europe', lat: 53.9006, lon: 27.5590, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Chișinău', country: 'Moldova', region: 'europe', lat: 47.0105, lon: 28.8638, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['growth', 'peace'] },

        // Mikro
        { city: 'Monako', country: 'Monako', region: 'europe', lat: 43.7384, lon: 7.4246, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['luck', 'career'] },
        { city: 'Andorra la Vella', country: 'Andorra', region: 'europe', lat: 42.5063, lon: 1.5218, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'San Marino', country: 'San Marino', region: 'europe', lat: 43.9424, lon: 12.4578, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Malta', country: 'Malta', region: 'europe', lat: 35.8989, lon: 14.5146, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Lefkoşa', country: 'Kıbrıs', region: 'europe', lat: 35.1856, lon: 33.3823, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Girne', country: 'Kıbrıs', region: 'europe', lat: 35.3406, lon: 33.3193, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
    ];

    // =============================================
    // ASYA
    // =============================================
    const ASIA = [
        // Japonya
        { city: 'Tokyo', country: 'Japonya', region: 'asia', lat: 35.6762, lon: 139.6503, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'adventure', 'learning', 'creativity'] },
        { city: 'Kyoto', country: 'Japonya', region: 'asia', lat: 35.0116, lon: 135.7681, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['peace', 'creativity', 'growth'] },
        { city: 'Osaka', country: 'Japonya', region: 'asia', lat: 34.6937, lon: 135.5023, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Nagoya', country: 'Japonya', region: 'asia', lat: 35.1815, lon: 136.9066, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning'] },
        { city: 'Sapporo', country: 'Japonya', region: 'asia', lat: 43.0618, lon: 141.3545, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Fukuoka', country: 'Japonya', region: 'asia', lat: 33.5904, lon: 130.4017, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Hiroshima', country: 'Japonya', region: 'asia', lat: 34.3853, lon: 132.4553, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Nara', country: 'Japonya', region: 'asia', lat: 34.6851, lon: 135.8048, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Okinawa', country: 'Japonya', region: 'asia', lat: 26.3344, lon: 127.8056, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },

        // Güney Kore
        { city: 'Seul', country: 'Güney Kore', region: 'asia', lat: 37.5665, lon: 126.9780, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Busan', country: 'Güney Kore', region: 'asia', lat: 35.1796, lon: 129.0756, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Incheon', country: 'Güney Kore', region: 'asia', lat: 37.4563, lon: 126.7052, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Jeju', country: 'Güney Kore', region: 'asia', lat: 33.4996, lon: 126.5312, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Çin
        { city: 'Pekin', country: 'Çin', region: 'asia', lat: 39.9042, lon: 116.4074, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'growth'] },
        { city: 'Şanghay', country: 'Çin', region: 'asia', lat: 31.2304, lon: 121.4737, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'luck'] },
        { city: 'Hong Kong', country: 'Çin', region: 'asia', lat: 22.3193, lon: 114.1694, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Shenzhen', country: 'Çin', region: 'asia', lat: 22.5431, lon: 114.0579, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Guangzhou', country: 'Çin', region: 'asia', lat: 23.1291, lon: 113.2644, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Chengdu', country: 'Çin', region: 'asia', lat: 30.5728, lon: 104.0668, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: "Xi'an", country: 'Çin', region: 'asia', lat: 34.2658, lon: 108.9541, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'growth'] },
        { city: 'Hangzhou', country: 'Çin', region: 'asia', lat: 30.2741, lon: 120.1551, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Lhasa', country: 'Çin', region: 'asia', lat: 29.6525, lon: 91.1009, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Makao', country: 'Çin', region: 'asia', lat: 22.1987, lon: 113.5439, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['luck', 'adventure'] },

        // Tayvan
        { city: 'Taipei', country: 'Tayvan', region: 'asia', lat: 25.0330, lon: 121.5654, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'adventure', 'creativity'] },

        // Güneydoğu Asya
        { city: 'Singapur', country: 'Singapur', region: 'asia', lat: 1.3521, lon: 103.8198, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Bangkok', country: 'Tayland', region: 'asia', lat: 13.7563, lon: 100.5018, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'creativity', 'love'] },
        { city: 'Chiang Mai', country: 'Tayland', region: 'asia', lat: 18.7883, lon: 98.9853, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Phuket', country: 'Tayland', region: 'asia', lat: 7.8804, lon: 98.3923, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Bali', country: 'Endonezya', region: 'asia', lat: -8.3405, lon: 115.0920, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Jakarta', country: 'Endonezya', region: 'asia', lat: -6.2088, lon: 106.8456, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Yogyakarta', country: 'Endonezya', region: 'asia', lat: -7.7956, lon: 110.3695, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Kuala Lumpur', country: 'Malezya', region: 'asia', lat: 3.1390, lon: 101.6869, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'adventure'] },
        { city: 'Penang', country: 'Malezya', region: 'asia', lat: 5.4164, lon: 100.3327, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Ho Chi Minh', country: 'Vietnam', region: 'asia', lat: 10.8231, lon: 106.6297, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'creativity'] },
        { city: 'Hanoi', country: 'Vietnam', region: 'asia', lat: 21.0278, lon: 105.8342, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Da Nang', country: 'Vietnam', region: 'asia', lat: 16.0544, lon: 108.2022, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Manila', country: 'Filipinler', region: 'asia', lat: 14.5995, lon: 120.9842, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Cebu', country: 'Filipinler', region: 'asia', lat: 10.3157, lon: 123.8854, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Phnom Penh', country: 'Kamboçya', region: 'asia', lat: 11.5564, lon: 104.9282, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Siem Reap', country: 'Kamboçya', region: 'asia', lat: 13.3633, lon: 103.8560, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Vientiane', country: 'Laos', region: 'asia', lat: 17.9757, lon: 102.6331, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Yangon', country: 'Myanmar', region: 'asia', lat: 16.8661, lon: 96.1951, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Dili', country: 'Doğu Timor', region: 'asia', lat: -8.5569, lon: 125.5603, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },

        // Güney Asya
        { city: 'Mumbai', country: 'Hindistan', region: 'asia', lat: 19.0760, lon: 72.8777, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Delhi', country: 'Hindistan', region: 'asia', lat: 28.7041, lon: 77.1025, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Bangalore', country: 'Hindistan', region: 'asia', lat: 12.9716, lon: 77.5946, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Chennai', country: 'Hindistan', region: 'asia', lat: 13.0827, lon: 80.2707, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Kolkata', country: 'Hindistan', region: 'asia', lat: 22.5726, lon: 88.3639, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Jaipur', country: 'Hindistan', region: 'asia', lat: 26.9124, lon: 75.7873, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Varanasi', country: 'Hindistan', region: 'asia', lat: 25.3176, lon: 82.9739, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'peace', 'creativity'] },
        { city: 'Goa', country: 'Hindistan', region: 'asia', lat: 15.2993, lon: 74.1240, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity', 'love'] },
        { city: 'Kerala', country: 'Hindistan', region: 'asia', lat: 10.8505, lon: 76.2711, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },
        { city: 'Kolombo', country: 'Sri Lanka', region: 'asia', lat: 6.9271, lon: 79.8612, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Katmandu', country: 'Nepal', region: 'asia', lat: 27.7172, lon: 85.3240, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },
        { city: 'Thimphu', country: 'Bhutan', region: 'asia', lat: 27.4728, lon: 89.6390, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Dakka', country: 'Bangladeş', region: 'asia', lat: 23.8103, lon: 90.4125, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Karaçi', country: 'Pakistan', region: 'asia', lat: 24.8607, lon: 67.0011, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Lahor', country: 'Pakistan', region: 'asia', lat: 31.5497, lon: 74.3436, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'İslamabad', country: 'Pakistan', region: 'asia', lat: 33.6844, lon: 73.0479, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'learning'] },
        { city: 'Maldivler', country: 'Maldivler', region: 'asia', lat: 4.1755, lon: 73.5093, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },

        // Orta Doğu
        { city: 'Dubai', country: 'BAE', region: 'asia', lat: 25.2048, lon: 55.2708, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck', 'adventure'] },
        { city: 'Abu Dabi', country: 'BAE', region: 'asia', lat: 24.4539, lon: 54.3773, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Tel Aviv', country: 'İsrail', region: 'asia', lat: 32.0853, lon: 34.7818, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'learning', 'adventure'] },
        { city: 'Kudüs', country: 'İsrail', region: 'asia', lat: 31.7683, lon: 35.2137, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace', 'learning'] },
        { city: 'Amman', country: 'Ürdün', region: 'asia', lat: 31.9454, lon: 35.9284, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Beyrut', country: 'Lübnan', region: 'asia', lat: 33.8938, lon: 35.5018, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Doha', country: 'Katar', region: 'asia', lat: 25.2854, lon: 51.5310, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Muscat', country: 'Umman', region: 'asia', lat: 23.5880, lon: 58.3829, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Küveyt', country: 'Küveyt', region: 'asia', lat: 29.3759, lon: 47.9774, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Riyad', country: 'Suudi Arabistan', region: 'asia', lat: 24.7136, lon: 46.6753, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'Cidde', country: 'Suudi Arabistan', region: 'asia', lat: 21.4858, lon: 39.1925, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Manama', country: 'Bahreyn', region: 'asia', lat: 26.2285, lon: 50.5860, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Sana', country: 'Yemen', region: 'asia', lat: 15.3694, lon: 44.1910, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Tahran', country: 'İran', region: 'asia', lat: 35.6892, lon: 51.3890, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'İsfahan', country: 'İran', region: 'asia', lat: 32.6546, lon: 51.6680, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Şiraz', country: 'İran', region: 'asia', lat: 29.5918, lon: 52.5837, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'love'] },
        { city: 'Bağdat', country: 'Irak', region: 'asia', lat: 33.3128, lon: 44.3615, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Erbil', country: 'Irak', region: 'asia', lat: 36.1912, lon: 44.0119, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Şam', country: 'Suriye', region: 'asia', lat: 33.5138, lon: 36.2765, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },

        // Kafkasya
        { city: 'Bakü', country: 'Azerbaycan', region: 'asia', lat: 40.4093, lon: 49.8671, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },
        { city: 'Tiflis', country: 'Gürcistan', region: 'asia', lat: 41.7151, lon: 44.8271, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'peace'] },
        { city: 'Batum', country: 'Gürcistan', region: 'asia', lat: 41.6168, lon: 41.6367, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Erivan', country: 'Ermenistan', region: 'asia', lat: 40.1792, lon: 44.4991, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },

        // Orta Asya
        { city: 'Almatı', country: 'Kazakistan', region: 'asia', lat: 43.2220, lon: 76.8512, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Astana', country: 'Kazakistan', region: 'asia', lat: 51.1694, lon: 71.4491, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Taşkent', country: 'Özbekistan', region: 'asia', lat: 41.2995, lon: 69.2401, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Semerkant', country: 'Özbekistan', region: 'asia', lat: 39.6542, lon: 66.9597, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['learning', 'creativity', 'growth'] },
        { city: 'Bişkek', country: 'Kırgızistan', region: 'asia', lat: 42.8746, lon: 74.5698, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Aşkabat', country: 'Türkmenistan', region: 'asia', lat: 37.9601, lon: 58.3261, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Duşanbe', country: 'Tacikistan', region: 'asia', lat: 38.5598, lon: 68.7740, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Ulan Batur', country: 'Moğolistan', region: 'asia', lat: 47.8864, lon: 106.9057, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },

        // Ek Asya
        { city: 'Kobe', country: 'Japonya', region: 'asia', lat: 34.6901, lon: 135.1956, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Yokohama', country: 'Japonya', region: 'asia', lat: 35.4437, lon: 139.6380, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Daegu', country: 'Güney Kore', region: 'asia', lat: 35.8714, lon: 128.6014, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Gwangju', country: 'Güney Kore', region: 'asia', lat: 35.1595, lon: 126.8526, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'learning'] },
        { city: 'Nanjing', country: 'Çin', region: 'asia', lat: 32.0603, lon: 118.7969, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'growth'] },
        { city: 'Wuhan', country: 'Çin', region: 'asia', lat: 30.5928, lon: 114.3055, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Chongqing', country: 'Çin', region: 'asia', lat: 29.4316, lon: 106.9123, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['adventure', 'career'] },
        { city: 'Suzhou', country: 'Çin', region: 'asia', lat: 31.2990, lon: 120.5853, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Guilin', country: 'Çin', region: 'asia', lat: 25.2736, lon: 110.2907, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Hyderabad', country: 'Hindistan', region: 'asia', lat: 17.3850, lon: 78.4867, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Pune', country: 'Hindistan', region: 'asia', lat: 18.5204, lon: 73.8567, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Ahmedabad', country: 'Hindistan', region: 'asia', lat: 23.0225, lon: 72.5714, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Udaipur', country: 'Hindistan', region: 'asia', lat: 24.5854, lon: 73.7125, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['love', 'creativity'] },
        { city: 'Agra', country: 'Hindistan', region: 'asia', lat: 27.1767, lon: 78.0081, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['love', 'learning'] },
        { city: 'Rishikesh', country: 'Hindistan', region: 'asia', lat: 30.0869, lon: 78.2676, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'peace'] },
        { city: 'Darjeeling', country: 'Hindistan', region: 'asia', lat: 27.0360, lon: 88.2627, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Kaohsiung', country: 'Tayvan', region: 'asia', lat: 22.6273, lon: 120.3014, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Taichung', country: 'Tayvan', region: 'asia', lat: 24.1477, lon: 120.6736, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'peace'] },
        { city: 'Kota Kinabalu', country: 'Malezya', region: 'asia', lat: 5.9804, lon: 116.0735, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Langkawi', country: 'Malezya', region: 'asia', lat: 6.3503, lon: 99.7968, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Hội An', country: 'Vietnam', region: 'asia', lat: 15.8801, lon: 108.3380, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Luang Prabang', country: 'Laos', region: 'asia', lat: 19.8856, lon: 102.1348, climate: 'warm', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Brunei', country: 'Brunei', region: 'asia', lat: 4.9031, lon: 114.9398, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Colombo', country: 'Sri Lanka', region: 'asia', lat: 6.9271, lon: 79.8612, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Galle', country: 'Sri Lanka', region: 'asia', lat: 6.0535, lon: 80.2210, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Pokhara', country: 'Nepal', region: 'asia', lat: 28.2096, lon: 83.9856, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Kabul', country: 'Afganistan', region: 'asia', lat: 34.5553, lon: 69.2075, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Sharjah', country: 'BAE', region: 'asia', lat: 25.3463, lon: 55.4209, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'learning'] },
        { city: 'Al Ain', country: 'BAE', region: 'asia', lat: 24.1917, lon: 55.7606, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Tebriz', country: 'İran', region: 'asia', lat: 38.0962, lon: 46.2738, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'creativity'] },
        { city: 'Mashhad', country: 'İran', region: 'asia', lat: 36.2605, lon: 59.6168, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['growth', 'peace'] },
        { city: 'Basra', country: 'Irak', region: 'asia', lat: 30.5085, lon: 47.7804, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'career'] },
    ];

    // =============================================
    // AMERİKA
    // =============================================
    const AMERICAS = [
        // ABD
        { city: 'New York', country: 'ABD', region: 'americas', lat: 40.7128, lon: -74.0060, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity', 'adventure'] },
        { city: 'Los Angeles', country: 'ABD', region: 'americas', lat: 34.0522, lon: -118.2437, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Chicago', country: 'ABD', region: 'americas', lat: 41.8781, lon: -87.6298, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Houston', country: 'ABD', region: 'americas', lat: 29.7604, lon: -95.3698, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Dallas', country: 'ABD', region: 'americas', lat: 32.7767, lon: -96.7970, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'luck'] },
        { city: 'San Francisco', country: 'ABD', region: 'americas', lat: 37.7749, lon: -122.4194, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning', 'growth'] },
        { city: 'Miami', country: 'ABD', region: 'americas', lat: 25.7617, lon: -80.1918, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Seattle', country: 'ABD', region: 'americas', lat: 47.6062, lon: -122.3321, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Austin', country: 'ABD', region: 'americas', lat: 30.2672, lon: -97.7431, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'adventure', 'career'] },
        { city: 'Denver', country: 'ABD', region: 'americas', lat: 39.7392, lon: -104.9903, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['adventure', 'career'] },
        { city: 'Boston', country: 'ABD', region: 'americas', lat: 42.3601, lon: -71.0589, climate: 'cold', size: 'mega', nature: 'coastal', vibe: ['learning', 'career'] },
        { city: 'Nashville', country: 'ABD', region: 'americas', lat: 36.1627, lon: -86.7816, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['creativity', 'adventure'] },
        { city: 'Portland', country: 'ABD', region: 'americas', lat: 45.5152, lon: -122.6784, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'San Diego', country: 'ABD', region: 'americas', lat: 32.7157, lon: -117.1611, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Honolulu', country: 'ABD', region: 'americas', lat: 21.3069, lon: -157.8583, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love', 'creativity'] },
        { city: 'New Orleans', country: 'ABD', region: 'americas', lat: 29.9511, lon: -90.0715, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Washington DC', country: 'ABD', region: 'americas', lat: 38.9072, lon: -77.0369, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Las Vegas', country: 'ABD', region: 'americas', lat: 36.1699, lon: -115.1398, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['luck', 'adventure'] },
        { city: 'Philadelphia', country: 'ABD', region: 'americas', lat: 39.9526, lon: -75.1652, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'creativity'] },
        { city: 'Atlanta', country: 'ABD', region: 'americas', lat: 33.7490, lon: -84.3880, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Phoenix', country: 'ABD', region: 'americas', lat: 33.4484, lon: -112.0740, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Minneapolis', country: 'ABD', region: 'americas', lat: 44.9778, lon: -93.2650, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Detroit', country: 'ABD', region: 'americas', lat: 42.3314, lon: -83.0458, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Salt Lake City', country: 'ABD', region: 'americas', lat: 40.7608, lon: -111.8910, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Savannah', country: 'ABD', region: 'americas', lat: 32.0809, lon: -81.0912, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Santa Fe', country: 'ABD', region: 'americas', lat: 35.6870, lon: -105.9378, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'peace', 'growth'] },
        { city: 'Anchorage', country: 'ABD', region: 'americas', lat: 61.2181, lon: -149.9003, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['adventure', 'peace'] },

        // Kanada
        { city: 'Toronto', country: 'Kanada', region: 'americas', lat: 43.6532, lon: -79.3832, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'learning', 'creativity'] },
        { city: 'Vancouver', country: 'Kanada', region: 'americas', lat: 49.2827, lon: -123.1207, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'career'] },
        { city: 'Montreal', country: 'Kanada', region: 'americas', lat: 45.5017, lon: -73.5673, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Calgary', country: 'Kanada', region: 'americas', lat: 51.0447, lon: -114.0719, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['career', 'adventure'] },
        { city: 'Ottawa', country: 'Kanada', region: 'americas', lat: 45.4215, lon: -75.6972, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Edmonton', country: 'Kanada', region: 'americas', lat: 53.5461, lon: -113.4938, climate: 'cold', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Quebec City', country: 'Kanada', region: 'americas', lat: 46.8139, lon: -71.2080, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['creativity', 'love'] },
        { city: 'Victoria', country: 'Kanada', region: 'americas', lat: 48.4284, lon: -123.3656, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Meksika
        { city: 'Mexico City', country: 'Meksika', region: 'americas', lat: 19.4326, lon: -99.1332, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure', 'love'] },
        { city: 'Cancún', country: 'Meksika', region: 'americas', lat: 21.1619, lon: -86.8515, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Guadalajara', country: 'Meksika', region: 'americas', lat: 20.6597, lon: -103.3496, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'career'] },
        { city: 'Monterrey', country: 'Meksika', region: 'americas', lat: 25.6866, lon: -100.3161, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Oaxaca', country: 'Meksika', region: 'americas', lat: 17.0732, lon: -96.7266, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'peace'] },
        { city: 'Tulum', country: 'Meksika', region: 'americas', lat: 20.2115, lon: -87.4290, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'growth'] },

        // Orta Amerika & Karayipler
        { city: 'Guatemala City', country: 'Guatemala', region: 'americas', lat: 14.6349, lon: -90.5069, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'San Salvador', country: 'El Salvador', region: 'americas', lat: 13.6929, lon: -89.2182, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'career'] },
        { city: 'Tegucigalpa', country: 'Honduras', region: 'americas', lat: 14.0723, lon: -87.1921, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Managua', country: 'Nikaragua', region: 'americas', lat: 12.1150, lon: -86.2362, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'San José', country: 'Kosta Rika', region: 'americas', lat: 9.9281, lon: -84.0907, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Panama City', country: 'Panama', region: 'americas', lat: 8.9824, lon: -79.5199, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'luck'] },
        { city: 'Belize City', country: 'Belize', region: 'americas', lat: 17.5046, lon: -88.1962, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Havana', country: 'Küba', region: 'americas', lat: 23.1136, lon: -82.3666, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love', 'adventure'] },
        { city: 'Kingston', country: 'Jamaika', region: 'americas', lat: 18.0179, lon: -76.8099, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Santo Domingo', country: 'Dominik Cum.', region: 'americas', lat: 18.4861, lon: -69.9312, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'San Juan', country: 'Porto Riko', region: 'americas', lat: 18.4655, lon: -66.1057, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Nassau', country: 'Bahamalar', region: 'americas', lat: 25.0480, lon: -77.3554, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'luck'] },

        // Güney Amerika
        { city: 'Buenos Aires', country: 'Arjantin', region: 'americas', lat: -34.6037, lon: -58.3816, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['love', 'creativity', 'adventure'] },
        { city: 'Córdoba', country: 'Arjantin', region: 'americas', lat: -31.4201, lon: -64.1888, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Mendoza', country: 'Arjantin', region: 'americas', lat: -32.8895, lon: -68.8458, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'adventure'] },
        { city: 'Bariloche', country: 'Arjantin', region: 'americas', lat: -41.1335, lon: -71.3103, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['peace', 'adventure', 'love'] },
        { city: 'Ushuaia', country: 'Arjantin', region: 'americas', lat: -54.8019, lon: -68.3030, climate: 'cold', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace', 'growth'] },
        { city: 'São Paulo', country: 'Brezilya', region: 'americas', lat: -23.5505, lon: -46.6333, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'creativity'] },
        { city: 'Rio de Janeiro', country: 'Brezilya', region: 'americas', lat: -22.9068, lon: -43.1729, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['love', 'adventure', 'creativity'] },
        { city: 'Brasília', country: 'Brezilya', region: 'americas', lat: -15.7975, lon: -47.8919, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Salvador', country: 'Brezilya', region: 'americas', lat: -12.9714, lon: -38.5124, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Florianópolis', country: 'Brezilya', region: 'americas', lat: -27.5954, lon: -48.5480, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Bogota', country: 'Kolombiya', region: 'americas', lat: 4.7110, lon: -74.0721, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'growth'] },
        { city: 'Medellín', country: 'Kolombiya', region: 'americas', lat: 6.2476, lon: -75.5658, climate: 'warm', size: 'medium', nature: 'mountain', vibe: ['creativity', 'growth', 'peace'] },
        { city: 'Cartagena', country: 'Kolombiya', region: 'americas', lat: 10.3910, lon: -75.5143, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure'] },
        { city: 'Caracas', country: 'Venezuela', region: 'americas', lat: 10.4806, lon: -66.9036, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Lima', country: 'Peru', region: 'americas', lat: -12.0464, lon: -77.0428, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'growth'] },
        { city: 'Cusco', country: 'Peru', region: 'americas', lat: -13.5319, lon: -71.9675, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['growth', 'peace', 'adventure'] },
        { city: 'Santiago', country: 'Şili', region: 'americas', lat: -33.4489, lon: -70.6693, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['career', 'growth'] },
        { city: 'Valparaíso', country: 'Şili', region: 'americas', lat: -33.0472, lon: -71.6127, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Montevideo', country: 'Uruguay', region: 'americas', lat: -34.9011, lon: -56.1645, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Quito', country: 'Ekvador', region: 'americas', lat: -0.1807, lon: -78.4678, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'La Paz', country: 'Bolivya', region: 'americas', lat: -16.4897, lon: -68.1193, climate: 'cold', size: 'mega', nature: 'mountain', vibe: ['growth', 'adventure'] },
        { city: 'Asunción', country: 'Paraguay', region: 'americas', lat: -25.2637, lon: -57.5759, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Georgetown', country: 'Guyana', region: 'americas', lat: 6.8013, lon: -58.1551, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Paramaribo', country: 'Surinam', region: 'americas', lat: 5.8520, lon: -55.2038, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'growth'] },

        // Ek Amerika
        { city: 'Charlotte', country: 'ABD', region: 'americas', lat: 35.2271, lon: -80.8431, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'San Antonio', country: 'ABD', region: 'americas', lat: 29.4241, lon: -98.4936, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'peace'] },
        { city: 'Tampa', country: 'ABD', region: 'americas', lat: 27.9506, lon: -82.4572, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Orlando', country: 'ABD', region: 'americas', lat: 28.5383, lon: -81.3792, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['adventure', 'love'] },
        { city: 'Raleigh', country: 'ABD', region: 'americas', lat: 35.7796, lon: -78.6382, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['learning', 'career'] },
        { city: 'Pittsburgh', country: 'ABD', region: 'americas', lat: 40.4406, lon: -79.9959, climate: 'cold', size: 'medium', nature: 'mountain', vibe: ['learning', 'creativity'] },
        { city: 'Milwaukee', country: 'ABD', region: 'americas', lat: 43.0389, lon: -87.9065, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Charleston', country: 'ABD', region: 'americas', lat: 32.7765, lon: -79.9311, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'creativity'] },
        { city: 'Winnipeg', country: 'Kanada', region: 'americas', lat: 49.8951, lon: -97.1384, climate: 'cold', size: 'medium', nature: 'urban', vibe: ['peace', 'learning'] },
        { city: 'Halifax', country: 'Kanada', region: 'americas', lat: 44.6488, lon: -63.5752, climate: 'cold', size: 'medium', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Puebla', country: 'Meksika', region: 'americas', lat: 19.0414, lon: -98.2063, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['creativity', 'learning'] },
        { city: 'Mérida', country: 'Meksika', region: 'americas', lat: 20.9674, lon: -89.5926, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['peace', 'creativity'] },
        { city: 'San Miguel de Allende', country: 'Meksika', region: 'americas', lat: 20.9144, lon: -100.7452, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['creativity', 'love', 'peace'] },
        { city: 'Port-au-Prince', country: 'Haiti', region: 'americas', lat: 18.5944, lon: -72.3074, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Barbados', country: 'Barbados', region: 'americas', lat: 13.1939, lon: -59.5432, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Trinidad', country: 'Trinidad ve Tobago', region: 'americas', lat: 10.6918, lon: -61.2225, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Galápagos', country: 'Ekvador', region: 'americas', lat: -0.9538, lon: -90.9656, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Sucre', country: 'Bolivya', region: 'americas', lat: -19.0196, lon: -65.2619, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'learning'] },
        { city: 'Punta del Este', country: 'Uruguay', region: 'americas', lat: -34.9667, lon: -54.9511, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Recife', country: 'Brezilya', region: 'americas', lat: -8.0476, lon: -34.8770, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'love'] },
        { city: 'Fortaleza', country: 'Brezilya', region: 'americas', lat: -3.7319, lon: -38.5267, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Manaus', country: 'Brezilya', region: 'americas', lat: -3.1190, lon: -60.0217, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['adventure', 'growth'] },
        { city: 'Cali', country: 'Kolombiya', region: 'americas', lat: 3.4516, lon: -76.5320, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['creativity', 'adventure'] },
        { city: 'Arequipa', country: 'Peru', region: 'americas', lat: -16.4090, lon: -71.5375, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
    ];

    // =============================================
    // AFRİKA
    // =============================================
    const AFRICA = [
        // Kuzey Afrika
        { city: 'Kahire', country: 'Mısır', region: 'africa', lat: 30.0444, lon: 31.2357, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'learning', 'career'] },
        { city: 'İskenderiye', country: 'Mısır', region: 'africa', lat: 31.2001, lon: 29.9187, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['learning', 'creativity'] },
        { city: 'Luxor', country: 'Mısır', region: 'africa', lat: 25.6872, lon: 32.6396, climate: 'warm', size: 'small', nature: 'urban', vibe: ['growth', 'learning'] },
        { city: 'Marakeş', country: 'Fas', region: 'africa', lat: 31.6295, lon: -7.9811, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Kazablanka', country: 'Fas', region: 'africa', lat: 33.5731, lon: -7.5898, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'creativity'] },
        { city: 'Fes', country: 'Fas', region: 'africa', lat: 34.0181, lon: -5.0078, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Şefşauen', country: 'Fas', region: 'africa', lat: 35.1688, lon: -5.2636, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'creativity'] },
        { city: 'Tunus', country: 'Tunus', region: 'africa', lat: 36.8065, lon: 10.1815, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Cezayir', country: 'Cezayir', region: 'africa', lat: 36.7538, lon: 3.0588, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'career'] },
        { city: 'Trablus', country: 'Libya', region: 'africa', lat: 32.8872, lon: 13.1913, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'career'] },

        // Doğu Afrika
        { city: 'Nairobi', country: 'Kenya', region: 'africa', lat: -1.2921, lon: 36.8219, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'career', 'growth'] },
        { city: 'Mombasa', country: 'Kenya', region: 'africa', lat: -4.0435, lon: 39.6682, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Addis Ababa', country: 'Etiyopya', region: 'africa', lat: 9.0250, lon: 38.7469, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'Dar es Salaam', country: 'Tanzanya', region: 'africa', lat: -6.7924, lon: 39.2083, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Zanzibar', country: 'Tanzanya', region: 'africa', lat: -6.1659, lon: 39.2026, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love', 'adventure'] },
        { city: 'Kampala', country: 'Uganda', region: 'africa', lat: 0.3476, lon: 32.5825, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['adventure', 'growth'] },
        { city: 'Kigali', country: 'Ruanda', region: 'africa', lat: -1.9403, lon: 29.8739, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['growth', 'career'] },
        { city: 'Mogadişu', country: 'Somali', region: 'africa', lat: 2.0469, lon: 45.3182, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Cibuti', country: 'Cibuti', region: 'africa', lat: 11.5721, lon: 43.1456, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['growth', 'career'] },
        { city: 'Asmara', country: 'Eritre', region: 'africa', lat: 15.3229, lon: 38.9251, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Hartum', country: 'Sudan', region: 'africa', lat: 15.5007, lon: 32.5599, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'career'] },
        { city: 'Antananarivo', country: 'Madagaskar', region: 'africa', lat: -18.8792, lon: 47.5079, climate: 'moderate', size: 'mega', nature: 'mountain', vibe: ['adventure', 'peace'] },

        // Batı Afrika
        { city: 'Lagos', country: 'Nijerya', region: 'africa', lat: 6.5244, lon: 3.3792, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure', 'creativity'] },
        { city: 'Abuja', country: 'Nijerya', region: 'africa', lat: 9.0765, lon: 7.3986, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Accra', country: 'Gana', region: 'africa', lat: 5.6037, lon: -0.1870, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Dakar', country: 'Senegal', region: 'africa', lat: 14.7167, lon: -17.4677, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Abidjan', country: 'Fildişi Sahili', region: 'africa', lat: 5.3599, lon: -4.0083, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Bamako', country: 'Mali', region: 'africa', lat: 12.6392, lon: -8.0029, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['creativity', 'growth'] },
        { city: 'Ouagadougou', country: 'Burkina Faso', region: 'africa', lat: 12.3714, lon: -1.5197, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Conakry', country: 'Gine', region: 'africa', lat: 9.6412, lon: -13.5784, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Nouakchott', country: 'Moritanya', region: 'africa', lat: 18.0735, lon: -15.9582, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'growth'] },

        // Orta Afrika
        { city: 'Kinşasa', country: 'Demokratik Kongo', region: 'africa', lat: -4.4419, lon: 15.2663, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'creativity'] },
        { city: 'Brazzaville', country: 'Kongo', region: 'africa', lat: -4.2634, lon: 15.2429, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Yaoundé', country: 'Kamerun', region: 'africa', lat: 3.8480, lon: 11.5021, climate: 'warm', size: 'mega', nature: 'mountain', vibe: ['growth', 'learning'] },
        { city: 'Luanda', country: 'Angola', region: 'africa', lat: -8.8390, lon: 13.2894, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'growth'] },

        // Güney Afrika
        { city: 'Cape Town', country: 'Güney Afrika', region: 'africa', lat: -33.9249, lon: 18.4241, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'creativity'] },
        { city: 'Johannesburg', country: 'Güney Afrika', region: 'africa', lat: -26.2041, lon: 28.0473, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'growth'] },
        { city: 'Durban', country: 'Güney Afrika', region: 'africa', lat: -29.8587, lon: 30.2254, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'love'] },
        { city: 'Pretoria', country: 'Güney Afrika', region: 'africa', lat: -25.7479, lon: 28.2293, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['career', 'learning'] },
        { city: 'Maputo', country: 'Mozambik', region: 'africa', lat: -25.9692, lon: 32.5732, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Harare', country: 'Zimbabve', region: 'africa', lat: -17.8252, lon: 31.0335, climate: 'moderate', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Lusaka', country: 'Zambiya', region: 'africa', lat: -15.3875, lon: 28.3228, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Gaborone', country: 'Botsvana', region: 'africa', lat: -24.6282, lon: 25.9231, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },
        { city: 'Windhoek', country: 'Namibya', region: 'africa', lat: -22.5609, lon: 17.0658, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['adventure', 'peace'] },
        { city: 'Lilongwe', country: 'Malavi', region: 'africa', lat: -13.9626, lon: 33.7741, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['peace', 'growth'] },

        // Ada
        { city: 'Mauritius', country: 'Mauritius', region: 'africa', lat: -20.3484, lon: 57.5522, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Seychelles', country: 'Seyşeller', region: 'africa', lat: -4.6796, lon: 55.4920, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },

        // Ek Afrika
        { city: 'Marsa Alam', country: 'Mısır', region: 'africa', lat: 25.0693, lon: 34.8988, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Hurghada', country: 'Mısır', region: 'africa', lat: 27.2579, lon: 33.8116, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Tanger', country: 'Fas', region: 'africa', lat: 35.7595, lon: -5.8340, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'adventure'] },
        { city: 'Essaouira', country: 'Fas', region: 'africa', lat: 31.5085, lon: -9.7595, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Port Louis', country: 'Mauritius', region: 'africa', lat: -20.1609, lon: 57.5012, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'career'] },
        { city: 'Freetown', country: 'Sierra Leone', region: 'africa', lat: 8.4657, lon: -13.2317, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Monrovia', country: 'Liberya', region: 'africa', lat: 6.3156, lon: -10.8074, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'adventure'] },
        { city: 'Lomé', country: 'Togo', region: 'africa', lat: 6.1256, lon: 1.2254, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Cotonou', country: 'Benin', region: 'africa', lat: 6.3703, lon: 2.3912, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['growth', 'creativity'] },
        { city: 'Niamey', country: 'Nijer', region: 'africa', lat: 13.5127, lon: 2.1128, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'peace'] },
        { city: "N'Djamena", country: 'Çad', region: 'africa', lat: 12.1348, lon: 15.0557, climate: 'warm', size: 'mega', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Libreville', country: 'Gabon', region: 'africa', lat: 0.4162, lon: 9.4673, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Malabo', country: 'Ekvator Ginesi', region: 'africa', lat: 3.7504, lon: 8.7371, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Bangui', country: 'Orta Afrika Cum.', region: 'africa', lat: 4.3947, lon: 18.5582, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Bujumbura', country: 'Burundi', region: 'africa', lat: -3.3731, lon: 29.3644, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['growth', 'peace'] },
        { city: 'Juba', country: 'Güney Sudan', region: 'africa', lat: 4.8594, lon: 31.5713, climate: 'warm', size: 'medium', nature: 'urban', vibe: ['growth', 'adventure'] },
        { city: 'Moroni', country: 'Komorlar', region: 'africa', lat: -11.7172, lon: 43.2473, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Praia', country: 'Cape Verde', region: 'africa', lat: 14.9330, lon: -23.5133, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'São Tomé', country: 'São Tomé ve Príncipe', region: 'africa', lat: 0.1864, lon: 6.6131, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Mbabane', country: 'Esvatin', region: 'africa', lat: -26.3054, lon: 31.1367, climate: 'moderate', size: 'small', nature: 'mountain', vibe: ['peace', 'growth'] },
        { city: 'Maseru', country: 'Lesotho', region: 'africa', lat: -29.3167, lon: 27.4833, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },
    ];

    // =============================================
    // OKYANUSYA
    // =============================================
    const OCEANIA = [
        // Avustralya
        { city: 'Sydney', country: 'Avustralya', region: 'oceania', lat: -33.8688, lon: 151.2093, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['career', 'adventure'] },
        { city: 'Melbourne', country: 'Avustralya', region: 'oceania', lat: -37.8136, lon: 144.9631, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['creativity', 'career'] },
        { city: 'Brisbane', country: 'Avustralya', region: 'oceania', lat: -27.4705, lon: 153.0260, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Perth', country: 'Avustralya', region: 'oceania', lat: -31.9505, lon: 115.8605, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Adelaide', country: 'Avustralya', region: 'oceania', lat: -34.9285, lon: 138.6007, climate: 'warm', size: 'mega', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Gold Coast', country: 'Avustralya', region: 'oceania', lat: -28.0167, lon: 153.3991, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['love', 'adventure', 'peace'] },
        { city: 'Cairns', country: 'Avustralya', region: 'oceania', lat: -16.9186, lon: 145.7781, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'peace'] },
        { city: 'Hobart', country: 'Avustralya', region: 'oceania', lat: -42.8821, lon: 147.3272, climate: 'moderate', size: 'small', nature: 'coastal', vibe: ['peace', 'creativity'] },
        { city: 'Darwin', country: 'Avustralya', region: 'oceania', lat: -12.4634, lon: 130.8456, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Canberra', country: 'Avustralya', region: 'oceania', lat: -35.2809, lon: 149.1302, climate: 'moderate', size: 'medium', nature: 'urban', vibe: ['learning', 'career'] },

        // Yeni Zelanda
        { city: 'Auckland', country: 'Yeni Zelanda', region: 'oceania', lat: -36.8485, lon: 174.7633, climate: 'moderate', size: 'mega', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Wellington', country: 'Yeni Zelanda', region: 'oceania', lat: -41.2865, lon: 174.7762, climate: 'moderate', size: 'medium', nature: 'coastal', vibe: ['creativity', 'peace'] },
        { city: 'Queenstown', country: 'Yeni Zelanda', region: 'oceania', lat: -45.0312, lon: 168.6626, climate: 'cold', size: 'small', nature: 'mountain', vibe: ['adventure', 'peace'] },
        { city: 'Christchurch', country: 'Yeni Zelanda', region: 'oceania', lat: -43.5321, lon: 172.6362, climate: 'moderate', size: 'medium', nature: 'mountain', vibe: ['peace', 'growth'] },

        // Pasifik
        { city: 'Fiji', country: 'Fiji', region: 'oceania', lat: -17.7134, lon: 178.0650, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Bora Bora', country: 'Fransız Polinezyası', region: 'oceania', lat: -16.5004, lon: -151.7415, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace'] },
        { city: 'Tahiti', country: 'Fransız Polinezyası', region: 'oceania', lat: -17.5516, lon: -149.5585, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['love', 'peace', 'creativity'] },
        { city: 'Port Moresby', country: 'Papua Yeni Gine', region: 'oceania', lat: -9.4438, lon: 147.1803, climate: 'warm', size: 'medium', nature: 'coastal', vibe: ['adventure', 'growth'] },
        { city: 'Apia', country: 'Samoa', region: 'oceania', lat: -13.8333, lon: -171.7518, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: "Nuku'alofa", country: 'Tonga', region: 'oceania', lat: -21.2087, lon: -175.1982, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },
        { city: 'Port Vila', country: 'Vanuatu', region: 'oceania', lat: -17.7334, lon: 168.3273, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Nouméa', country: 'Yeni Kaledonya', region: 'oceania', lat: -22.2758, lon: 166.4580, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'love'] },

        // Ek Okyanusya
        { city: 'Suva', country: 'Fiji', region: 'oceania', lat: -18.1416, lon: 178.4419, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Honiara', country: 'Solomon Adaları', region: 'oceania', lat: -9.4456, lon: 159.9729, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Tarawa', country: 'Kiribati', region: 'oceania', lat: 1.4518, lon: 172.9717, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Funafuti', country: 'Tuvalu', region: 'oceania', lat: -8.5211, lon: 179.1983, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Majuro', country: 'Marshall Adaları', region: 'oceania', lat: 7.1164, lon: 171.1857, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Palau', country: 'Palau', region: 'oceania', lat: 7.5149, lon: 134.5825, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'adventure'] },
        { city: 'Nauru', country: 'Nauru', region: 'oceania', lat: -0.5228, lon: 166.9315, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
        { city: 'Palikir', country: 'Mikronezya', region: 'oceania', lat: 6.9248, lon: 158.1610, climate: 'warm', size: 'small', nature: 'coastal', vibe: ['peace', 'growth'] },
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
