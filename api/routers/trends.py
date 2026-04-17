"""
GET /api/trends/{city}/{neighborhood}

Returns 12 months of price-trend data for a neighborhood.

Data priority:
  1. Real scraped data from price_history (Supabase) — used for months where
     a scrape run has already been stored.
  2. Synthetic fill using CBS-calibrated per-city drift rates for months with
     no real data yet. Noise is deterministic (seeded from city+neighborhood)
     so the chart doesn't jitter between requests.

Once the scraper has been running for several weeks the chart will be mostly
real data. After ~12 weeks it will be entirely real.
"""

import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "yad2_listings_raw.json"

# ─────────────────────────────────────────────────────────────────────────────
# Option 2 — CBS-calibrated annual rental drift rates by Israeli district
# Source: CBS Rental CPI (Statistical Abstract of Israel, Table 8.5)
# Tel Aviv (Gush Dan) ~4 %/yr, Jerusalem ~2.5 %, Haifa ~1.5 %, South ~1 %
# ─────────────────────────────────────────────────────────────────────────────
CBS_DISTRICT_DRIFT: dict[str, float] = {
    "tel_aviv":   0.040,
    "jerusalem":  0.025,
    "haifa":      0.015,
    "beer_sheva": 0.010,
}
DEFAULT_DRIFT = 0.020  # fallback for cities not in the table

_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


class TrendPoint(BaseModel):
    month: str
    median_price: int


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _drift(city: str) -> float:
    return CBS_DISTRICT_DRIFT.get(city, DEFAULT_DRIFT)


def _seed(city: str, neighborhood: str) -> int:
    return sum(ord(c) for c in city + neighborhood)


def _trailing_12_months() -> list[tuple[int, int]]:
    """Return [(year, month), ...] for the 12 months ending this month."""
    now = datetime.now(timezone.utc)
    result = []
    for i in range(11, -1, -1):
        month = now.month - i
        year = now.year
        while month <= 0:
            month += 12
            year -= 1
        result.append((year, month))
    return result


def _current_median(city: str, neighborhood: str) -> Optional[int]:
    """Median price from Supabase (preferred) or local JSON fallback."""
    # Try Supabase first
    try:
        from api.db import get_supabase, has_supabase
        if has_supabase():
            sb = get_supabase()
            resp = (
                sb.table("listings")
                .select("price_nis")
                .eq("city", city)
                .eq("neighborhood", neighborhood)
                .eq("listing_type", "apartment")
                .execute()
            )
            prices = sorted(r["price_nis"] for r in (resp.data or []))
            if prices:
                mid = len(prices) // 2
                return prices[mid] if len(prices) % 2 else (prices[mid - 1] + prices[mid]) // 2
    except Exception:
        pass

    # JSON fallback (local dev)
    if not DATA_FILE.exists():
        return None
    with open(DATA_FILE, encoding="utf-8") as f:
        listings = json.load(f)
    prices = sorted(
        l["price_nis"]
        for l in listings
        if l.get("city") == city and l.get("neighborhood") == neighborhood
    )
    if not prices:
        return None
    mid = len(prices) // 2
    return prices[mid] if len(prices) % 2 else (prices[mid - 1] + prices[mid]) // 2


def _real_history(city: str, neighborhood: str) -> dict[tuple[int, int], int]:
    """
    Option 3 — query price_history from Supabase.
    Returns {(year, month): avg_median_price_across_room_types}.
    Returns {} if Supabase is unavailable or the table is empty.
    """
    try:
        from api.db import get_supabase, has_supabase
        if not has_supabase():
            return {}
        sb = get_supabase()
        resp = (
            sb.table("price_history")
            .select("median_price,scraped_at")
            .eq("city", city)
            .eq("neighborhood", neighborhood)
            .order("scraped_at", desc=False)
            .execute()
        )
        rows = resp.data or []
        monthly: dict[tuple[int, int], list[int]] = defaultdict(list)
        for row in rows:
            ym = row["scraped_at"][:7]  # "YYYY-MM"
            y, m = ym.split("-")
            monthly[(int(y), int(m))].append(row["median_price"])
        return {k: int(sum(v) / len(v)) for k, v in monthly.items()}
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/trends/{city}/{neighborhood}", response_model=list[TrendPoint])
def get_trends(city: str, neighborhood: str):
    anchor = _current_median(city, neighborhood)
    if anchor is None:
        raise HTTPException(
            status_code=404,
            detail=f"No listings found for city={city!r} neighborhood={neighborhood!r}",
        )

    annual_drift = _drift(city)
    months = _trailing_12_months()        # [(year, month), …] oldest → newest
    real = _real_history(city, neighborhood)  # {(year, month): price}
    seed = _seed(city, neighborhood)

    points: list[TrendPoint] = []

    for i, (year, month) in enumerate(months):
        if (year, month) in real:
            # Real scraped data — use it directly
            price = real[(year, month)]
        else:
            # Synthetic fill: project anchor backwards using CBS drift rate.
            # i=0 → 11 months ago; i=11 → this month (months_offset = 0).
            months_offset = i - 11  # negative = past, 0 = now
            base = anchor * (1 + annual_drift * (months_offset / 12))
            noise = base * 0.03 * math.sin((seed + i * 37) % 360 * math.pi / 180)
            price = int(round((base + noise) / 100) * 100)

        points.append(TrendPoint(
            month=_MONTH_LABELS[month - 1],
            median_price=max(price, 1000),
        ))

    return points
