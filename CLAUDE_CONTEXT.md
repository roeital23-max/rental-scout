# 🏠 Israel Rental Scout — Project Bible
> Paste this file at the start of EVERY Claude Code or Cowork session.
> Update the "Current Status" section at the end of every session.

---

## 📌 What This Is

An AI-powered rental affordability platform for the Israeli housing market.
Built solo using Claude. Zero external developers. Bootstrap budget.

**Core value proposition:**
> "Before you sign a lease — know if the price is fair."

**Three core features:**
1. **Underpriced Listing Finder** — scrapes Yad2, scores each listing vs CBS neighborhood median
2. **Neighborhood Trend Predictor** — 12-month rent trend charts + 3-month AI forecast
3. **Government Benefits Matcher** — matches users to Israeli housing assistance programs

---

## 🗓️ Current Status
> ⚠️ UPDATE THIS SECTION AT THE END OF EVERY SESSION

```
Date of last update  : 2026-04-15
Current phase        : Phase 2 MVP — scoring model + listing detail page complete
Last completed task  : (1) Scoring model upgraded: price-per-sqm primary metric, floor premiums,
                           feature premiums, roommate/parking detection (property.text + heuristics)
                       (2) Listing detail page: app/listing/[id]/page.tsx — all listing fields,
                           price analysis card (deviation%, ₪/sqm), Yad2 CTA, trend chart
                       (3) Amenity scraping: Phase 2 in scrape_city() — loads each apartment's
                           individual Yad2 page, scans __NEXT_DATA__ for Hebrew amenity keywords.
                           Cap: 400 apartments/city (~2h full run for all 4 cities)
Currently building   : —
Next task queued     : Auth (NextAuth.js) OR Nadlan.gov.il fetcher for sale comps
Blockers / notes     : Madlan deferred — PerimeterX blocks all scraping at ₪0 budget
                       Yad2 headed mode (headless=False) required — opens visible Chrome window
                       Only tel_aviv tested so far; other 3 cities untested
                       Amenity scraping unverified on real run — __NEXT_DATA__ path on listing
                         pages is inferred; first real run will confirm or need path fix
                       Python runtime is 3.9.6 — use Optional[X] not X | None syntax
                       Node.js via nvm v24.14.1 (PATH: ~/.nvm/versions/node/v24.14.1/bin)
                       Backend runs on :8000, frontend on :3000 (Turbopack)
                       Trend data: partially real (258 price_history rows in Supabase);
                         older months filled synthetically using hardcoded CBS district drift rates
```

---

## 🗺️ Phase Roadmap

### 🚧 Phase 1 — Data Foundation (Weeks 1–4) | Budget: ₪0
- [x] Yad2 scraper (`scraper/yad2_scraper.py`) — ✅ 1,388 real listings collected, scoring + amenity enrichment working
- [~] CBS housing index data pipeline (`scraper/cbs_pipeline.py`) — ⛔ dropped; not needed because:
       (1) CBS data is district-level only, not neighborhood-level — too coarse for listing scores
       (2) CBS publishes with a 6–8 week lag — our own scraped price_history is more current
       (3) trends.py already uses hardcoded CBS district drift rates (Tel Aviv +4%/yr etc.) as baseline
       (4) price_history in Supabase (258 rows) is already accumulating real per-neighborhood data
       → The trend chart self-improves with each scraper run; no CBS pipeline ever needed
- [ ] Nadlan.gov.il API fetcher (`scraper/nadlan_fetcher.py`) — ❌ not built; nadlan_comps.json is empty stub
- [ ] Madlan.co.il cross-check scraper (`scraper/madlan_scraper.py`) — ⚠️ deferred (PerimeterX blocks all approaches, cross-check layer not blocking)
- [ ] Price fairness scoring model (`model/train_model.py`, scikit-learn) — ❌ model/ dir doesn't exist; scoring is rule-based in yad2_scraper.py
- [x] Government benefits JSON database (`data/benefits.json` — 6 programs with eligibility rules)

### 🚧 Phase 2 — MVP Product (Weeks 5–10) | Budget: ₪0 (all free tiers)

**Frontend — Next.js 15 → Vercel**
- [x] Home page — search form (city, rooms, max price)
- [x] Results page — ListingCard grid + DealBadge
- [x] Hebrew RTL + English LTR toggle (localStorage, html dir/lang)
- [x] **Mobile-first layout — 390px primary breakpoint**
- [x] Navigation / header component (sticky, Home · Benefits · Pricing + He/En toggle)
- [x] Trends page (`app/trends/`) + TrendChart (Recharts area chart, neighborhood link from card)
- [x] Benefits matcher page (`app/benefits/`) + BenefitsCard component
- [x] Pricing page (`app/pricing/`) — 3-tier static (Free / ₪39 / ₪2,500)
- [x] Wire frontend to backend (`NEXT_PUBLIC_API_URL` in `.env.local`)
- [x] Listing detail page (`app/listing/[id]/page.tsx`) — price analysis, features, Yad2 link, trend chart

**Backend — FastAPI → Render.com**
- [x] `GET /api/listings` — filter by city/rooms/price, sort by deal_score
- [x] `GET /api/score/{id}` — deviation %, He+En explanation
- [x] `GET /api/listing/{id}` — single listing detail endpoint
- [x] `GET /api/benefits` — eligibility filtering from benefits.json
- [x] **Supabase PostgreSQL setup** — ✅ live, 1,388 listings + 258 price_history rows in DB
- [x] Wire backend to Supabase — ✅ api/.env has SUPABASE_URL + ANON_KEY
- [x] `GET /api/trends/{city}/{neighborhood}` — partially real data (258 price_history rows); synthetic fill for older months

**Auth, Rate Limiting, Alerts**
- [ ] NextAuth.js — Google OAuth + email magic link
- [ ] Upstash Redis — rate limiting (5 searches/day free tier cap)
- [ ] WhatsApp alert bot → Twilio $15 free signup credit (~300 messages)

### 🔲 Phase 3 — Growth & Revenue (Weeks 11–20) | Budget: ~₪2,000/mo
- [ ] Freemium subscription (Stripe)
- [ ] B2B HR relocation package
- [ ] Auto-generated monthly PDF market report
- [ ] Olim (immigrant) onboarding flow

---

## ⚙️ Tech Stack — Phase 2 (All Free Tiers)

| Layer       | Tool                        | Hosting / Cost           | Free Tier Limit                        | Notes                                      |
|-------------|-----------------------------|--------------------------|----------------------------------------|--------------------------------------------|
| Frontend    | Next.js 14 + Tailwind CSS   | Vercel — free            | 100GB bandwidth/mo                     | RTL Hebrew via `dir="rtl"`, bilingual      |
| Backend     | FastAPI (Python 3.11)       | Render.com — free        | Always-on (slow 30s cold start)        | ✅ Replaced Railway — no 21-day sleep limit |
| Database    | Supabase PostgreSQL         | Supabase — free          | 500MB storage, 50,000 rows             | ✅ Supabase from day one — skip SQLite     |
| Scraper     | Python + BeautifulSoup      | GitHub Actions — free    | 2,000 min/month                        | Yad2.co.il + CBS + Nadlan + Madlan, cron every 6h |
| Data: Yad2  | Yad2.co.il scraper          | Free to scrape           | ~30,000 active listings                | Primary rental ground truth — 90-day rolling median per neighborhood |
| Data: Nadlan| Nadlan.gov.il API           | Free government API      | Rate-limited — use sleep between calls | Actual sale transaction comps by neighborhood + street. OSS fetcher on GitHub |
| Data: CBS   | CBS housing index + CPI     | Free public data         | 6–8 week publish lag                   | Macro trend baseline only — district level, not neighborhood |
| Data: Madlan| Madlan.co.il scraper        | Free to scrape           | Cross-check layer                      | Neighborhood price-per-sqm validation, especially for peripheral cities |
| ML Model    | scikit-learn + joblib       | Bundled with backend     | Free                                   | Trained on Yad2 medians + Nadlan comps + CBS trend — 3-source scoring |
| Auth        | NextAuth.js                 | Bundled with frontend    | Free / open source                     | ✅ Added Phase 2 — Google OAuth + magic link|
| Rate Limit  | Redis (Upstash)             | Upstash — free           | 10,000 commands/day                    | ✅ Added Phase 2 — free-tier search cap    |
| Alerts      | Twilio WhatsApp Business    | $15 free signup credit   | ~300 messages free to start            | Primary channel — 90%+ penetration in IL   |
| Payments    | Stripe                      | Free until first txn     | 2.9% + ₪1.10/txn after                | Phase 3 only — not needed in Phase 2       |
| CI/CD       | GitHub Actions              | Free tier                | 2,000 min/month                        | Auto-deploy on push to main                |

> 💡 **Phase 2 total cost: ₪0/month** until ~500 active users or 300 WhatsApp alerts.

---

## 📁 File & Folder Structure

```
israel-rental-scout/
│
├── CLAUDE_CONTEXT.md          ← THIS FILE. Always paste first.
│
├── scraper/                   ← ✅ exists
│   ├── yad2_scraper.py        ← ✅ Playwright headless — intercepts XHR to bypass hCaptcha
│   ├── madlan_scraper.py      ← ✅ built but blocked — PerimeterX returns 403/520 (deferred)
│   ├── run.py                 ← ✅ CLI: --playwright, --madlan, --all flags
│   ├── requirements.txt       ← ✅ requests, playwright, beautifulsoup4
│   ├── nadlan_fetcher.py      ← 🔲 not built yet
│   ├── cbs_pipeline.py        ← 🔲 not built yet
│   └── scheduler.py           ← 🔲 not built yet (GitHub Actions cron)
│
├── model/                     ← 🔲 not built yet
│   ├── train_model.py
│   ├── score.py
│   └── model.joblib
│
├── api/                       ← ✅ exists, running on :8000
│   ├── main.py                ← ✅ FastAPI app, CORS, health check
│   ├── db.py                  ← ✅ Supabase singleton (graceful fallback to JSON)
│   ├── requirements.txt       ← ✅
│   ├── .env.example           ← ✅
│   └── routers/
│       ├── listings.py        ← ✅ GET /api/listings
│       ├── score.py           ← ✅ GET /api/score/{listing_id}
│       ├── benefits.py        ← ✅ GET /api/benefits
│       └── trends.py          ← ✅ GET /api/trends/{city}/{neighborhood}
│
├── frontend/                  ← ✅ exists, running on :3000 (Next.js 16.2.3 + Turbopack)
│   ├── app/
│   │   ├── page.tsx           ← ✅ Home: search form + feature cards (He + En)
│   │   ├── results/page.tsx   ← ✅ Listing grid with deal scores + feature chips
│   │   ├── listing/[id]/page.tsx ← ✅ Listing detail: price analysis, features, Yad2 link, trends
│   │   ├── trends/page.tsx    ← ✅ Recharts area chart, stats row, neighborhood link
│   │   ├── benefits/page.tsx  ← ✅ Government assistance matcher
│   │   ├── pricing/page.tsx   ← ✅ 3-tier pricing (Free / ₪39 / ₪2,500)
│   │   └── not-found.tsx      ← ✅ required by Next.js 16
│   ├── components/
│   │   ├── Header.tsx         ← ✅ sticky nav: Home · Benefits · Pricing + toggle
│   │   ├── ListingCard.tsx    ← ✅ card with features chips, neighborhood → trends link
│   │   ├── DealBadge.tsx      ← ✅ green/orange/red pill badge
│   │   ├── ResultsView.tsx    ← ✅ client wrapper for results grid
│   │   ├── LanguageProvider.tsx ← ✅ He/En context + localStorage
│   │   ├── LanguageToggle.tsx ← ✅ עב/EN toggle button (inside Header)
│   │   ├── TrendChart.tsx     ← ✅ Recharts area chart with custom tooltip
│   │   ├── BackButton.tsx     ← ✅ "use client" component — window.history.back()
│   │   ├── BenefitsCard.tsx   ← ✅ monthly/one-time benefit display
│   │   └── BenefitsView.tsx   ← ✅ eligibility form + results
│   └── lib/
│       ├── api.ts             ← ✅ getListings() — IS_DEV flag, real API via NEXT_PUBLIC_API_URL
│       ├── trendsApi.ts       ← ✅ getTrends() — 4s timeout, mock fallback
│       ├── benefitsApi.ts     ← ✅ getBenefits() — eligibility filter
│       ├── mockData.ts        ← ✅ 10 mock listings + Feature type
│       └── i18n.ts            ← ✅ all UI strings in he + en (features, nav, benefits, pricing)
│
├── data/                      ← ✅ exists
│   ├── benefits.json          ← ✅ 6 Israeli housing programs with eligibility rules
│   ├── yad2_listings_raw.json ← ✅ 1,388 real Yad2 listings with deal_score, listing_type, features
│   ├── yad2_medians.json      ← ✅ generated — neighborhood medians by room count
│   ├── cbs_medians.json       ← 🔲 not generated yet
│   └── nadlan_comps.json      ← 🔲 not generated yet
│
├── supabase/
│   └── schema.sql             ← ✅ ready to run — listings, neighborhoods, users tables
│
└── docs/
    ├── decisions.md           ← 🔲 not created yet
    └── marketing.md           ← 🔲 not created yet
```

---

## 🗃️ Database Schema

### `listings` table
```sql
CREATE TABLE listings (
  id            TEXT PRIMARY KEY,   -- Yad2 listing ID
  url           TEXT,
  city          TEXT,               -- e.g. "tel_aviv", "jerusalem"
  neighborhood  TEXT,               -- e.g. "florentin", "nachlaot"
  rooms         REAL,               -- e.g. 3.0, 3.5
  sqm           INTEGER,
  floor         INTEGER,
  price_nis     INTEGER,            -- monthly rent in NIS
  deal_score    REAL,               -- % vs median (negative = below = good deal)
  deal_label    TEXT,               -- "great_deal" | "fair" | "overpriced" | "roommate" | "parking"
  listing_type  TEXT DEFAULT 'apartment', -- "apartment" | "roommate" | "parking"
  features      JSONB DEFAULT '[]', -- ["balcony", "parking", "mamad", ...]
  listed_at     TEXT,               -- ISO date string
  scraped_at    TEXT                -- ISO date string
);
```

### `neighborhoods` table
```sql
CREATE TABLE neighborhoods (
  id            TEXT PRIMARY KEY,   -- e.g. "tel_aviv_florentin"
  city          TEXT,
  name          TEXT,
  median_1room  INTEGER,            -- NIS
  median_2room  INTEGER,
  median_3room  INTEGER,
  median_4room  INTEGER,
  trend_3mo     REAL,               -- % change last 3 months
  trend_12mo    REAL,               -- % change last 12 months
  updated_at    TEXT
);
```

### `users` table
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE,
  plan          TEXT DEFAULT 'free', -- "free" | "renter" | "b2b"
  city_alerts   TEXT,               -- JSON array of cities to watch
  whatsapp      TEXT,               -- phone number for alerts
  created_at    TEXT
);
```

---

## 🔌 API Endpoints

```
GET  /api/listings
     ?city=tel_aviv&rooms=3&max_price=6000&sort=deal_score
     → Returns listings array with deal scores, sorted best deals first

GET  /api/listing/{id}
     → Returns single full listing object (used by listing detail page)

GET  /api/score/{listing_id}
     → Returns { price_nis, median_nis, deviation_pct, label, explanation }

GET  /api/benefits
     ?income=15000&family_size=3&owns_home=false&is_oleh=true
     → Returns matching government housing programs with eligibility + links

GET  /api/trends/{city}/{neighborhood}
     → Returns 12-month rent history array + 3-month forecast
```

---

## 🎨 Design System

```
Primary color   : #00E5A0  (green — deals, CTAs)
Warning color   : #FFA040  (orange — fair price)
Danger color    : #FF5252  (red — overpriced)
Background      : #0A0E1A  (dark navy)
Surface         : #0D1421  (slightly lighter)
Text primary    : #E8EDF5
Text secondary  : #8899AA

Font            : DM Sans (body) + Space Mono (data/numbers)
Border radius   : 12px cards, 8px inputs, 99px badges
Language        : Hebrew primary (RTL), English secondary (LTR)
```

---

## 💰 Pricing & Business Model

| Plan     | Price       | Limits                          | Key Feature              |
|----------|-------------|----------------------------------|--------------------------|
| Free     | ₪0          | 5 searches/day (Redis throttle) | Basic deal score         |
| Renter   | ₪39/month   | Unlimited                       | WhatsApp alerts          |
| B2B / HR | ₪2,500/month| Team accounts                   | White-label embed widget |

**Break-even:** 52 paid Renter subscribers OR 1 B2B client.

---

## 🏛️ Israeli Government Benefits Database
> Full list in `/data/benefits.json` — key programs to know:

- **Mechir Lemishtaken** — discounted apartment lottery for non-homeowners
- **Rent Subsidy (Siyua B'Schar Dira)** — monthly cash subsidy for eligible renters
- **Amidar Public Housing** — social housing waiting list
- **Oleh Chadash Housing Grant** — one-time grant for new immigrants (Aliyah)
- **Young Couples Grant** — mortgage assistance for first-time buyers under 35
- **Peripheral Area Benefit** — bonus grants for moving to Beer Sheva, Haifa, North

---

## 🔜 Frontend — What's Missing (Next Steps in Order)

> Work through these in sequence. Each builds on the previous.

| Priority | Task | Notes |
|----------|------|-------|
| 1 | **Mobile-first layout pass** | 390px as primary breakpoint. All pages/components need audit. Touch targets ≥44px. Stack form fields vertically on mobile. |
| 2 | **Navigation / header** | Minimal sticky header: logo left, language toggle right. Needed before adding more pages. |
| 3 | **Wire frontend → backend** | Change `IS_DEV` logic in `lib/api.ts` or set `NEXT_PUBLIC_API_URL` in `.env.local` to point at `:8000`. Test live data flow. |
| 4 | **Trends page** | `app/trends/page.tsx` + `components/TrendChart.tsx` (Recharts). Needs `GET /api/trends/{city}/{neighborhood}` backend endpoint first. |
| 5 | **Benefits matcher page** | `app/benefits/page.tsx` — form (income, family size, owns home, is oleh) + results list with `components/BenefitsCard.tsx`. Backend endpoint already works. |
| 6 | **Pricing page** | `app/pricing/page.tsx` — 3-tier table (Free / Renter ₪39 / B2B ₪2,500). Static page, no backend needed. |
| 7 | **NextAuth.js** | Google OAuth + magic link. Required before Stripe in Phase 3. |

---

## 📐 Key Technical Decisions
> Add new decisions here as you make them. Never remove old ones.

| Date | Decision | Reason |
|------|----------|--------|
| Week 1 | WhatsApp alerts over email | 90%+ WhatsApp penetration in Israel |
| Week 1 | Next.js App Router (not Pages) | Server components = faster, better SEO |
| Week 1 | Hebrew as primary language, RTL layout | Core Israeli user base |
| Week 1 | Deal score = % deviation from CBS median | Objective, data-backed, explainable |
| Week 1 | Yad2 as primary data source | ~30,000 active listings, Israel's #1 platform |
| Phase 2 | Web app (not native iOS/Android) | Link sharing via WhatsApp/Facebook; no App Store friction; Claude builds it faster |
| Phase 2 | Render.com over Railway for backend | Always-on free tier — Railway sleeps after 21 days continuous use |
| Phase 2 | Supabase from day one — no SQLite | User auth + alert preferences need concurrent writes; Supabase free tier handles it |
| Phase 2 | NextAuth.js added in Phase 2 | Needed for user accounts before Stripe subscriptions in Phase 3 |
| Phase 2 | Upstash Redis for rate limiting | Enforces 5 search/day free tier cap; 10K commands/day free — enough for MVP |
| Phase 2 | Twilio $15 free credit for WhatsApp | ~300 free alert messages — enough to validate before paying per message |
| Phase 2 | CBS alone insufficient for neighborhood scoring | CBS only goes to district level, publishes with 6–8 week lag — not granular enough for listing-level deal scores |
| Phase 2 | 3-source data stack for scoring model | CBS (macro trend baseline) + Nadlan.gov.il API (actual sale comps by neighborhood) + Yad2 rolling 90-day median (rental ground truth) |
| Phase 2 | Yad2 scraper = primary neighborhood median | Compute rolling 90-day median rent per neighborhood/room-count from own scraped data — proprietary, gets more accurate over time, competitors can't replicate from CBS alone |
| Phase 2 | Nadlan.gov.il API for sale transaction comps | Free government API, queryable by neighborhood + street, open-source fetcher exists on GitHub — use for price-per-sqm comps to cross-validate rental scores |
| Phase 2 | Madlan.co.il added as cross-check layer | Widely cited by Israeli RE professionals for neighborhood price-per-sqm data — scrape to validate Yad2 medians, especially for less-listed peripheral neighborhoods |
| Phase 2 | Mobile-first, 390px primary breakpoint | Primary users share listings via WhatsApp on mobile. 390px = iPhone 14/15 viewport width. Design for mobile first, scale up to tablet/desktop. |
| Phase 2 | Next.js upgraded from 14 → 16.2.3 + Turbopack | 15.5.15 flagged outdated; 16.2.3 cuts `next dev` cold start from ~8s → 580ms via Turbopack. Requires explicit `not-found.tsx`. |
| Phase 2 | Backend seeded with mock JSON, not Supabase | Supabase not yet created. `api/db.py` falls back to `data/yad2_listings_raw.json` gracefully. Swap when Supabase is ready. |
| Phase 2 | Trend data is synthetic until Supabase + scraper | `api/routers/trends.py` generates 12-month series seeded from current listing median. Replace with real `price_history` table when scraper runs regularly. |
| Phase 2 | Python 3.9 system — `Optional[X]` not `X \| None` | `int \| None` union syntax requires Python 3.10+. System Python is 3.9.6. Always use `from typing import Optional`. |
| Phase 1 | Yad2 Playwright — intercept XHR response | hCaptcha blocks direct API requests. Fix: load yad2.co.il in headless Chromium, intercept the `gw.yad2.co.il/feed-search-legacy` XHR via `page.on("response", ...)`. Keeps all parse/score logic unchanged. |
| Phase 1 | Madlan — parse `__NEXT_DATA__` script tag | Madlan is a Next.js app — neighborhood price-per-sqm is SSR'd into `<script id="__NEXT_DATA__">`. Parse with BeautifulSoup + json.loads. Path: `props.pageProps.neighborhoodData.averagePricePerMeter`. |
| Phase 1 | Madlan deferred indefinitely | PerimeterX + Cloudflare blocks all Playwright approaches (headed, headless, stealth) — all neighborhood URLs return 403/520. Cross-check layer only, not blocking for MVP. Revisit if budget allows residential proxy or paid Madlan API. |
| Phase 2 | Deal score = price-per-sqm deviation, not absolute price | sqm normalizes for apartment size — a 150sqm flat is not "overpriced" just because it costs more than a 60sqm. Floor premium (±2–7%) and feature premiums (parking +4%, renovated +3%, etc.) applied to expected ₪/sqm before deviation computed. Falls back to absolute-price comparison when sqm is 0 or ≤5. |
| Phase 2 | listing_type gate before scoring | Roommate ads (per-room price) and parking spots corrupt neighborhood medians if included. Detected via `additionalDetails.property.text` (authoritative Yad2 field, e.g. "חניה") first, then keyword matching, then heuristics. Excluded from median computation; get deal_label = "roommate"/"parking". |
| Phase 2 | Amenity scraping via per-listing __NEXT_DATA__ string scan | "מה יש בנכס" amenities are NOT in Yad2 search feed — only on individual listing pages. After feed scraping, Phase 2 opens each apartment's URL in the same Playwright browser and scans full __NEXT_DATA__ JSON string for Hebrew keywords. String scan is resilient to Yad2 restructuring. Cap: 400/city. Full run ~2h. |

---

## 🧠 How to Use This File With Claude

### Starting a Claude Code session:
```
"Here is my project context: [paste this file]

I am in Phase [X], working on [task name].
Here is the current code for the file I'm editing:
[paste the file]

Task: [describe exactly what to build/change]"
```

### Starting a Cowork session:
```
"Here is my project context: [paste this file]

I need help with a non-code task: [describe task]
This should be consistent with the stack, naming, and decisions above."
```

### Ending every session — update this block:
```
Date of last update  : [TODAY]
Current phase        : [Phase X — Name]
Last completed task  : [what you just finished]
Currently building   : [what you started but didn't finish]
Next task queued     : [what comes next]
Blockers / notes     : [anything Claude or you got stuck on]
```

---

*Israel Rental Scout · Bootstrap Edition · Built with Claude · 2026*
