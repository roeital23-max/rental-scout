-- Migration 002: price_history table
-- Run in Supabase SQL Editor → New Query → Run
-- Stores one median-price snapshot per (city, neighborhood, rooms, date) per scrape run.
-- After a few weeks of daily scraping, trends.py will use this real data
-- instead of the synthetic fallback.

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
