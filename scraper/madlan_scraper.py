"""
Madlan.co.il neighborhood price-per-sqm scraper.

Madlan is a Next.js app — neighborhood aggregate data is SSR'd into a
<script id="__NEXT_DATA__"> tag. We parse it with BeautifulSoup.

If requests is blocked, set use_playwright=True to load pages via headless Chromium.

Output: data/madlan_comps.json
{
  "updated_at": "2026-04-12",
  "neighborhoods": {
    "tel_aviv": {
      "פלורנטין": { "price_per_sqm": 38500, "source_url": "..." }
    }
  }
}

Usage:
    python3 scraper/madlan_scraper.py
    python3 scraper/madlan_scraper.py --playwright
"""

import json
import time
import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

# ─────────────────────────────────────────────────────────────────────────────
# Neighborhood URL map
# Each entry: (madlan_city_slug, madlan_neighborhood_slug, hebrew_name)
# Slugs use Hebrew text — Madlan URLs encode them as UTF-8 percent-encoding.
# ─────────────────────────────────────────────────────────────────────────────

NEIGHBORHOODS = {
    "tel_aviv": [
        ("תל-אביב-יפו", "פלורנטין",   "פלורנטין"),
        ("תל-אביב-יפו", "רמת-אביב",   "רמת אביב"),
        ("תל-אביב-יפו", "נווה-צדק",   "נווה צדק"),
    ],
    "jerusalem": [
        ("ירושלים", "נחלאות",  "נחלאות"),
        ("ירושלים", "בקעה",    "בקעה"),
        ("ירושלים", "רחביה",   "רחביה"),
    ],
    "haifa": [
        ("חיפה", "כרמל",       "כרמל"),
        ("חיפה", "נווה-שאנן",  "נווה שאנן"),
    ],
    "beer_sheva": [
        ("באר-שבע", "נאות-לון", "נאות לון"),
    ],
}

BASE_URL     = "https://www.madlan.co.il"
PAGE_DELAY   = 2.0   # seconds between requests

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "he-IL,he;q=0.9",
}


# ─────────────────────────────────────────────────────────────────────────────
# Parse __NEXT_DATA__ from HTML
# ─────────────────────────────────────────────────────────────────────────────

def _extract_next_data(html: str) -> Optional[dict]:
    """Extract and parse the __NEXT_DATA__ JSON from a Next.js page."""
    soup = BeautifulSoup(html, "html.parser")
    tag  = soup.find("script", {"id": "__NEXT_DATA__"})
    if not tag or not tag.string:
        return None
    try:
        return json.loads(tag.string)
    except json.JSONDecodeError:
        return None


def _extract_price_per_sqm(next_data: dict) -> Optional[int]:
    """
    Navigate the Next.js data tree to find the neighborhood median price/sqm.
    Madlan's pageProps structure can vary — try multiple known paths.
    """
    props = next_data.get("props", {}).get("pageProps", {})

    # Primary path
    nb_data = props.get("neighborhoodData") or props.get("neighborhood") or {}
    candidates = [
        nb_data.get("averagePricePerMeter"),
        nb_data.get("medianPricePerMeter"),
        nb_data.get("avgPricePerSqm"),
        props.get("averagePricePerMeter"),
        props.get("medianPricePerMeter"),
    ]
    for val in candidates:
        if val and isinstance(val, (int, float)) and val > 0:
            return int(val)

    # Fallback: search recursively for a plausible price/sqm value
    def _search(obj: object, depth: int = 0) -> Optional[int]:
        if depth > 6:
            return None
        if isinstance(obj, dict):
            for key, val in obj.items():
                if any(k in key.lower() for k in ("pricepermeter", "pricepersqm", "avgprice")):
                    if isinstance(val, (int, float)) and 5_000 < val < 200_000:
                        return int(val)
                result = _search(val, depth + 1)
                if result:
                    return result
        elif isinstance(obj, list):
            for item in obj[:5]:
                result = _search(item, depth + 1)
                if result:
                    return result
        return None

    return _search(props)


# ─────────────────────────────────────────────────────────────────────────────
# Fetch page HTML
# ─────────────────────────────────────────────────────────────────────────────

def _build_url(city_slug: str, hood_slug: str) -> str:
    return f"{BASE_URL}/neighborhood/{city_slug}/{hood_slug}"


def fetch_html_requests(url: str) -> Optional[str]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"    ⚠ Request failed: {e}")
        return None


def fetch_html_playwright(url: str) -> Optional[str]:
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print("  ⚠ playwright not installed. Run: pip3 install playwright && python3 -m playwright install chromium")
        return None

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx     = browser.new_context(user_agent=USER_AGENT)
            page    = ctx.new_page()
            page.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}", lambda r: r.abort())
            page.goto(url, wait_until="networkidle", timeout=30_000)
            html = page.content()
            browser.close()
            return html
    except Exception as e:
        print(f"    ⚠ Playwright error: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Main scrape loop
# ─────────────────────────────────────────────────────────────────────────────

def run(use_playwright: bool = False) -> dict:
    """
    Scrape all neighborhoods.
    Returns the comps dict (also saves data/madlan_comps.json).
    """
    fetch = fetch_html_playwright if use_playwright else fetch_html_requests
    mode  = "Playwright" if use_playwright else "requests"
    print(f"\nMadlan scraper starting ({mode})...")

    result: dict = {}

    for city_key, hood_list in NEIGHBORHOODS.items():
        city_display = city_key.replace("_", " ").title()
        result[city_key] = {}

        for city_slug, hood_slug, hood_he in hood_list:
            url  = _build_url(city_slug, hood_slug)
            print(f"  [{city_display}] {hood_he} → {url}")

            html = fetch(url)
            if not html:
                print(f"    ✗ No HTML received")
                time.sleep(PAGE_DELAY)
                continue

            next_data = _extract_next_data(html)
            if not next_data:
                print(f"    ✗ No __NEXT_DATA__ found — page may require JS rendering (try --playwright)")
                time.sleep(PAGE_DELAY)
                continue

            price_per_sqm = _extract_price_per_sqm(next_data)
            if price_per_sqm:
                result[city_key][hood_he] = {
                    "price_per_sqm": price_per_sqm,
                    "source_url":    url,
                }
                print(f"    ✓ ₪{price_per_sqm:,}/sqm")
            else:
                print(f"    ✗ price_per_sqm not found in __NEXT_DATA__ (structure may have changed)")

            time.sleep(PAGE_DELAY)

    # Save output
    output = {
        "updated_at":    datetime.now(timezone.utc).isoformat()[:10],
        "neighborhoods": result,
    }

    data_dir  = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    out_path  = data_dir / "madlan_comps.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in result.values())
    print(f"\nSaved {total} neighborhood comps → {out_path}")
    return output


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).parent.parent))

    parser = argparse.ArgumentParser(description="Madlan neighborhood price scraper")
    parser.add_argument("--playwright", action="store_true", help="Use headless Chromium instead of requests")
    args = parser.parse_args()

    run(use_playwright=args.playwright)
