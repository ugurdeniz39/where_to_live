const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    PageBreak, LevelFormat, TableOfContents } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: { fill: "1a0a35", type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
    });
}

function cell(text, width) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
    });
}

const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 36, bold: true, font: "Arial", color: "1a0a35" },
                paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, font: "Arial", color: "7c3aed" },
                paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, bold: true, font: "Arial", color: "333333" },
                paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
        ]
    },
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        ]
    },
    sections: [
        // Title Page
        {
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            children: [
                new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AstroMap v4", font: "Arial", size: 72, bold: true, color: "7c3aed" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "Uygulama Dokumantasyonu", font: "Arial", size: 36, color: "666666" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "AI Destekli Astrokartografi & Mistisizm Platformu", font: "Arial", size: 24, color: "999999", italics: true })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2000 }, children: [new TextRun({ text: "Mart 2026", font: "Arial", size: 22, color: "999999" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Versiyon 4.0.0", font: "Arial", size: 22, color: "999999" })] }),
                new Paragraph({ children: [new PageBreak()] }),
            ]
        },
        // TOC
        {
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            children: [
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Icerik")] }),
                new TableOfContents("Icerik", { hyperlink: true, headingStyleRange: "1-3" }),
                new Paragraph({ children: [new PageBreak()] }),
            ]
        },
        // Section 1: Architecture
        {
            properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            children: [
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Teknik Mimari")] }),
                new Paragraph({ spacing: { after: 200 }, children: [new TextRun("AstroMap, Vanilla JavaScript ile yazilmis tek sayfalik bir web uygulamasidir (SPA). Backend Express.js + OpenAI API, frontend ise HTML/CSS/JS ile calisir. Capacitor ile Android/iOS native uygulamaya donusturulur.")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Frontend Mimarisi")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Tek index.html dosyasinda tum sayfalar section olarak yer alir")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("navigateTo(pageId) fonksiyonu sayfa gecislerini yonetir")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AuthSystem: localStorage tabanli kullanici yonetimi")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("AICache: API yanitlarini 1 saat onbellege alir (max 30 kayit)")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("6 tema: Cosmic, Moonlight, Aurora, Nebula, Ocean, Solar")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Backend Mimarisi")] }),
                new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Cift calisma modu: Lokal (Express.js) ve Vercel (Serverless Functions).")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Onbellek Stratejisi")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 2080, 4160],
                    rows: [
                        new TableRow({ children: [headerCell("Endpoint", 3120), headerCell("TTL", 2080), headerCell("Neden", 4160)] }),
                        new TableRow({ children: [cell("daily-horoscope", 3120), cell("1 saat", 2080), cell("Gunluk degisir", 4160)] }),
                        new TableRow({ children: [cell("compatibility", 3120), cell("30 dakika", 2080), cell("Ayni girisler = ayni sonuc", 4160)] }),
                        new TableRow({ children: [cell("crystal-guide", 3120), cell("30 dakika", 2080), cell("Ruh haline bagli", 4160)] }),
                        new TableRow({ children: [cell("city-insight", 3120), cell("2 saat", 2080), cell("Sabit bilgi", 4160)] }),
                        new TableRow({ children: [cell("tarot / dream / fortune", 3120), cell("Yok", 2080), cell("Her istek benzersiz", 4160)] }),
                    ]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 Astroloji Motoru")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("NASA/JPL orbital elementleri ile gezegen pozisyonlari")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Kepler denklemi (Newton-Raphson cozumu)")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Quadrant ev sistemi, aspekt hesaplamalari")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("IAU 1980 nutasyon ve aberasyon duzetmeleri")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("558 sehir skorlama: AstroBase(90) + bonuslar")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.4 Maliyet Analizi")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [4680, 4680],
                    rows: [
                        new TableRow({ children: [headerCell("Metrik", 4680), headerCell("Deger", 4680)] }),
                        new TableRow({ children: [cell("Model", 4680), cell("GPT-4o-mini", 4680)] }),
                        new TableRow({ children: [cell("Maliyet / istek", 4680), cell("~$0.0003 (0.03 sent)", 4680)] }),
                        new TableRow({ children: [cell("1000 kullanici/gun", 4680), cell("~$0.90/gun = $27/ay", 4680)] }),
                        new TableRow({ children: [cell("Cache ile (%40 hit)", 4680), cell("~$16/ay", 4680)] }),
                        new TableRow({ children: [cell("100 Premium abone geliri", 4680), cell("~$165/ay (pozitif kar)", 4680)] }),
                    ]
                }),

                new Paragraph({ children: [new PageBreak()] }),

                // Section 2: Security
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Guvenlik")] }),
                new Paragraph({ spacing: { after: 200 }, children: [new TextRun("AstroMap, katmanli bir guvenlik yaklasimi kullanir. Bu bolum mevcut onlemleri, riskleri ve onerileri kapsar.")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Mevcut Onlemler")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 6240],
                    rows: [
                        new TableRow({ children: [headerCell("Onlem", 3120), headerCell("Detay", 6240)] }),
                        new TableRow({ children: [cell("Rate Limiting", 3120), cell("20 istek/dakika/IP, bellek icinde Map ile takip", 6240)] }),
                        new TableRow({ children: [cell("Input Validasyon", 3120), cell("Max 2000 karakter/alan, ic ice nesne kontrolu", 6240)] }),
                        new TableRow({ children: [cell("XSS Korumasi", 3120), cell("DOMPurify ile tum AI yanitlari temizlenir", 6240)] }),
                        new TableRow({ children: [cell("CORS", 3120), cell("Whitelist: localhost, *.vercel.app, Capacitor", 6240)] }),
                        new TableRow({ children: [cell("CSP", 3120), cell("script/style/img kaynak kontrolu, frame-src iyzipay", 6240)] }),
                        new TableRow({ children: [cell("Guvenlik Basliklari", 3120), cell("X-Content-Type-Options, X-Frame-Options, X-XSS-Protection", 6240)] }),
                        new TableRow({ children: [cell("Admin Korumasi", 3120), cell("Analytics/push istatistik endpointleri token ile korunuyor", 6240)] }),
                        new TableRow({ children: [cell("Odeme Guvenligi", 3120), cell("iyzico iframe, conversationId dogrulamasi, env var anahtarlar", 6240)] }),
                    ]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Bilinen Riskler")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("CSP unsafe-inline: SPA yapisi nedeniyle gerekli")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("localStorage auth: Bankacilk seviyesi degil ama yeterli")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("In-memory rate limit: Sunucu restart ile sifirlanir")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("JSON dosya depolama: Production icin veritabani onerilir")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Deployment Oncesi Kontrol Listesi")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("GitHub reposu private yapildi mi?")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("ADMIN_TOKEN varsayilan degerden degistirildi mi?")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("iyzico production anahtarlari set edildi mi?")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("ALLOWED_ORIGINS production domain iceriyor mu?")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("Keystore dosyasi guvenli yedeklendi mi?")] }),

                new Paragraph({ children: [new PageBreak()] }),

                // Section 3: User Guide
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Kullanici Rehberi")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Ozellikler")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 6240],
                    rows: [
                        new TableRow({ children: [headerCell("Ozellik", 3120), headerCell("Aciklama", 6240)] }),
                        new TableRow({ children: [cell("Astrokartografi", 3120), cell("558 sehir, 10 gezegen cizgisi, Leaflet harita", 6240)] }),
                        new TableRow({ children: [cell("Burc Yorumu", 3120), cell("Gunluk/haftalik/aylik/yillik, 6 kategori skoru", 6240)] }),
                        new TableRow({ children: [cell("AI Tarot", 3120), cell("4 acilim: Uc Kart, Evet/Hayir, Iliski, Kelt Haci", 6240)] }),
                        new TableRow({ children: [cell("Kristal Rehberi", 3120), cell("Cakra, meditasyon, bitki cayi, esansiyel yag", 6240)] }),
                        new TableRow({ children: [cell("Kahve Fali", 3120), cell("GPT Vision, max 6 fotograf, sembol analizi", 6240)] }),
                        new TableRow({ children: [cell("Ruya Yorumu", 3120), cell("Jungcu arketipler, bilincalti katmani", 6240)] }),
                        new TableRow({ children: [cell("Dogum Haritasi", 3120), cell("SVG zodiac wheel, evler, aspektler", 6240)] }),
                        new TableRow({ children: [cell("Ay Takvimi", 3120), cell("Aylik grid, faz dongusu, ritueller", 6240)] }),
                        new TableRow({ children: [cell("Retrograt", 3120), cell("2025-2026 gezegen retrograt tarihleri", 6240)] }),
                    ]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Abonelik Planlari")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 2080, 2080, 2080],
                    rows: [
                        new TableRow({ children: [headerCell("Ozellik", 3120), headerCell("Ucretsiz", 2080), headerCell("Premium 49TL", 2080), headerCell("VIP 99TL", 2080)] }),
                        new TableRow({ children: [cell("AI istek limiti", 3120), cell("3/gun", 2080), cell("Sinirsiz", 2080), cell("Sinirsiz", 2080)] }),
                        new TableRow({ children: [cell("Astrokartografi", 3120), cell("10 sehir", 2080), cell("558 sehir", 2080), cell("558 sehir", 2080)] }),
                        new TableRow({ children: [cell("Tarot", 3120), cell("Uc Kart", 2080), cell("+Evet/Hayir, Iliski", 2080), cell("+Kelt Haci", 2080)] }),
                        new TableRow({ children: [cell("Kahve Fali", 3120), cell("2/gun, 1 foto", 2080), cell("10/gun, 6 foto", 2080), cell("Sinirsiz, 6 foto", 2080)] }),
                        new TableRow({ children: [cell("Kristal / Ruya", 3120), cell("-", 2080), cell("Tam", 2080), cell("Tam", 2080)] }),
                        new TableRow({ children: [cell("Premium Temalar", 3120), cell("-", 2080), cell("4 tema", 2080), cell("4 tema", 2080)] }),
                        new TableRow({ children: [cell("PDF Rapor", 3120), cell("-", 2080), cell("-", 2080), cell("Tam", 2080)] }),
                    ]
                }),

                new Paragraph({ children: [new PageBreak()] }),

                // Section 4: Deployment
                new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Deployment Rehberi")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Ortam Degiskenleri")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 3120, 3120],
                    rows: [
                        new TableRow({ children: [headerCell("Degisken", 3120), headerCell("Aciklama", 3120), headerCell("Zorunlu", 3120)] }),
                        new TableRow({ children: [cell("OPENAI_API_KEY", 3120), cell("OpenAI API anahtari", 3120), cell("Evet", 3120)] }),
                        new TableRow({ children: [cell("IYZICO_API_KEY", 3120), cell("iyzico API anahtari", 3120), cell("Odeme icin", 3120)] }),
                        new TableRow({ children: [cell("IYZICO_SECRET_KEY", 3120), cell("iyzico gizli anahtar", 3120), cell("Odeme icin", 3120)] }),
                        new TableRow({ children: [cell("ADMIN_TOKEN", 3120), cell("Admin endpoint erisim tokeni", 3120), cell("Onerilir", 3120)] }),
                        new TableRow({ children: [cell("ALLOWED_ORIGINS", 3120), cell("CORS izinli kaynaklar", 3120), cell("Onerilir", 3120)] }),
                    ]
                }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Build Komutlari")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("npm run build:web — Web assets olustur + minify")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("npx cap sync android — Capacitor sync")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("./gradlew assembleDebug — Debug APK olustur")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("./gradlew bundleRelease — Release AAB (Play Store)")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("vercel --prod — Vercel production deploy")] }),
                new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun("npm test — API testleri calistir")] }),

                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Teknoloji Stack")] }),
                new Table({
                    width: { size: 9360, type: WidthType.DXA },
                    columnWidths: [3120, 6240],
                    rows: [
                        new TableRow({ children: [headerCell("Katman", 3120), headerCell("Teknoloji", 6240)] }),
                        new TableRow({ children: [cell("Frontend", 3120), cell("Vanilla JS, Leaflet.js, DOMPurify, html2canvas", 6240)] }),
                        new TableRow({ children: [cell("Backend", 3120), cell("Node.js 18+, Express.js", 6240)] }),
                        new TableRow({ children: [cell("AI", 3120), cell("OpenAI GPT-4o-mini (text + vision)", 6240)] }),
                        new TableRow({ children: [cell("Odeme", 3120), cell("iyzico (Turkiye)", 6240)] }),
                        new TableRow({ children: [cell("Mobil", 3120), cell("Capacitor 8.3 (Android + iOS)", 6240)] }),
                        new TableRow({ children: [cell("Deploy", 3120), cell("Vercel (serverless)", 6240)] }),
                        new TableRow({ children: [cell("PWA", 3120), cell("Service Worker v8, Web App Manifest", 6240)] }),
                    ]
                }),
            ]
        }
    ]
});

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("C:/Users/ugurd/Downloads/where_to_live/docs/AstroMap_App_Overview.docx", buffer);
    console.log("DOCX olusturuldu: docs/AstroMap_App_Overview.docx");
});
