-- Israel Rental Scout — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query → Run

-- ─────────────────────────────────────────────────────────────────────────────
-- listings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            TEXT PRIMARY KEY,       -- Yad2 listing ID
  url           TEXT,
  city          TEXT NOT NULL,          -- e.g. "tel_aviv", "jerusalem"
  neighborhood  TEXT,                   -- e.g. "florentin", "nachlaot"
  rooms         REAL,                   -- e.g. 3.0, 3.5
  sqm           INTEGER,
  sqm_built     INTEGER,                -- מ״ר בנוי from metaData.squareMeterBuild
  floor         INTEGER,
  price_nis     INTEGER NOT NULL,       -- monthly rent in NIS
  deal_score    REAL,                   -- % vs median (negative = below = good deal)
  deal_label    TEXT,                   -- "great_deal" | "fair" | "overpriced"
  listing_type  TEXT DEFAULT 'apartment', -- "apartment" | "roommate" | "parking"
  features      JSONB DEFAULT '[]',     -- ["balcony", "parking", "mamad", ...]
  listed_at     TEXT,                   -- ISO date string
  scraped_at    TEXT,                   -- ISO date string
  flagged       BOOLEAN DEFAULT FALSE,  -- true if sanity check flagged this listing
  flag_reasons  JSONB DEFAULT '[]'      -- list of check strings that fired
);

CREATE INDEX IF NOT EXISTS idx_listings_city       ON listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_rooms      ON listings (rooms);
CREATE INDEX IF NOT EXISTS idx_listings_deal_score ON listings (deal_score);
CREATE INDEX IF NOT EXISTS idx_listings_price      ON listings (price_nis);

-- ─────────────────────────────────────────────────────────────────────────────
-- neighborhoods
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS neighborhoods (
  id            TEXT PRIMARY KEY,       -- e.g. "tel_aviv_florentin"
  city          TEXT NOT NULL,
  name          TEXT NOT NULL,
  median_1room  INTEGER,                -- NIS
  median_2room  INTEGER,
  median_3room  INTEGER,
  median_4room  INTEGER,
  trend_3mo     REAL,                   -- % change last 3 months
  trend_12mo    REAL,                   -- % change last 12 months
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods (city);

-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',  -- "free" | "renter" | "b2b"
  city_alerts   TEXT,                           -- JSON array of city keys
  whatsapp      TEXT,                           -- e.g. "+972501234567"
  created_at    TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_plan  ON users (plan);

-- ─────────────────────────────────────────────────────────────────────────────
-- price_history  (Option 3 — accumulate real trend data per scrape run)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  id            TEXT PRIMARY KEY,   -- "{city}_{neighborhood}_{rooms}_{YYYY-MM-DD}"
  city          TEXT NOT NULL,
  neighborhood  TEXT NOT NULL,
  rooms         REAL NOT NULL,      -- 1 | 2 | 3 | 4
  median_price  INTEGER NOT NULL,   -- NIS
  scraped_at    TEXT NOT NULL       -- ISO timestamp of the scrape run
);

CREATE INDEX IF NOT EXISTS idx_price_history_city_hood
  ON price_history (city, neighborhood);

CREATE INDEX IF NOT EXISTS idx_price_history_scraped_at
  ON price_history (scraped_at);
