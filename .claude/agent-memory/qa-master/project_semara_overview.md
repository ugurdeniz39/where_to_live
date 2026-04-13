---
name: Semara Project Overview
description: AI astrology/tarot platform - Node/Express backend, vanilla JS frontend, Supabase/Neon DB, Capacitor mobile, iyzipay payments
type: project
---

Semara v4 is an AI-powered astrology platform with:
- Node.js/Express backend (server.js) + serverless API routes (api/*.js for Vercel)
- Vanilla JS SPA frontend (app.js ~5000+ lines, index.html, style.css)
- Supabase + Neon PostgreSQL with JSON file fallback
- Capacitor for Android/iOS (com.semara.app)
- Payment via iyzipay (Turkish payment gateway)
- OpenAI GPT-4o-mini for AI features
- PWA with service worker

**Why:** Understanding the full stack is essential for targeted QA reviews.
**How to apply:** Review both server.js (local dev) and api/*.js (Vercel serverless) paths for any changes.
