"""
Yad2 rental listing scraper — Playwright edition.

Strategy:
  - Yad2 is a Next.js app. Each page load SSR-renders listings into __NEXT_DATA__.
  - Headless browsers are blocked by Imperva/perfdrive.com.
  - headless=False (real visible Chromium) bypasses this detection.
  - Navigate ?city={code}&page={n}, extract feed.private + feed.agency per page.

For GitHub Actions cron: wrap with Xvfb (apt-get install xvfb, Xvfb :99 &, DISPLAY=:99).

City URL codes (verified 2026-04-12):
  tel_aviv=5000, jerusalem=3000, haifa=4000, beer_sheva=9000
"""

import json
import time
import statistics
from datetime import datetime, timezone
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

CITIES = {
    "tel_aviv":   5000,   # ← updated (old API used 1300)
    "jerusalem":  3000,
    "haifa":      4000,
    "beer_sheva": 9000,
}

YAD2_RENT_URL = "https://www.yad2.co.il/realestate/rent"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

PAGE_DELAY = 2.5   # seconds between page navigations
MAX_PAGES  = 25    # safety cap per city (~20-40 listings/page → 500-1000 max)

AMENITY_DELAY = 0.8        # seconds between individual listing page loads
AMENITY_TIMEOUT = 10_000   # ms timeout per listing page
AMENITY_SCRAPE_CAP = 400   # max apartments to enrich per city per run


# ─────────────────────────────────────────────────────────────────────────────
# Extract listings from a loaded Playwright page
# ─────────────────────────────────────────────────────────────────────────────

def _read_next_data(page) -> Optional[dict]:
    raw = page.evaluate("() => document.getElementById('__NEXT_DATA__')?.textContent")
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _extract_raw_listings(next_data: dict) -> list:
    """Pull private + agency listings from pageProps.feed."""
    feed = next_data.get("props", {}).get("pageProps", {}).get("feed", {})
    items = []
    for bucket in ("private", "agency", "platinum"):
        for item in feed.get(bucket, []):
            if isinstance(item, dict) and item.get("price"):
                items.append(item)
    return items


# ─────────────────────────────────────────────────────────────────────────────
# Listing-type detection (roommate ads + parking spots)
# ─────────────────────────────────────────────────────────────────────────────

ROOMMATE_KEYWORDS = [
    "שותף", "שותפים", "שותפות", "חדר פרטי", "חדר בשיתוף",
    "roommate", "room only", "shared room",
]
PARKING_KEYWORDS = [
    "חניה", "חנייה", "מקום חנייה", "parking spot", "parking space",
]

# Authoritative property type strings from additionalDetails.property.text
PROPERTY_TEXT_NON_APARTMENT = {
    "חניה", "חנייה", "מחסן", "מגרש", "משרד", "מסחרי", "תעשיה", "מרתף",
}
PROPERTY_TEXT_APARTMENT = {
    "דירה", "דירת גן", "פנטהאוז", "גג", "קוטג'", "קוטג", "דו משפחתי",
    "בית פרטי", "בית", "מיני פנטהאוז", "דירת נופש",
}


def _detect_listing_type(title: str, price: int, rooms: float, sqm: int,
                         property_text: str = "") -> str:
    # 1. Use authoritative property.text if present
    pt = property_text.strip()
    if any(k in pt for k in PROPERTY_TEXT_NON_APARTMENT):
        return "parking"
    if any(k in pt for k in PROPERTY_TEXT_APARTMENT):
        # Confirmed apartment — only roommate check remains
        t = title.lower()
        if any(k in t for k in ROOMMATE_KEYWORDS):
            return "roommate"
        return "apartment"

    # 2. Fall back to keyword + heuristic detection when property.text is absent
    t = title.lower()
    if any(k in t for k in ROOMMATE_KEYWORDS):
        return "roommate"
    if any(k in t for k in PARKING_KEYWORDS):
        return "parking"
    if 0 < sqm < 15:
        return "parking"
    if price < 1500:
        return "parking"
    if rooms == 1.0 and 0 < sqm < 25:
        return "parking"
    return "apartment"


# ─────────────────────────────────────────────────────────────────────────────
# Floor & feature premium helpers
# ─────────────────────────────────────────────────────────────────────────────

def _floor_premium(floor: int) -> float:
    if floor <= 0:  return -0.04
    if floor == 1:  return -0.02
    if floor <= 3:  return 0.0
    if floor <= 6:  return 0.02
    if floor <= 9:  return 0.03
    if floor <= 14: return 0.04
    if floor <= 24: return 0.05
    return 0.07


FEATURE_PREMIUMS = {
    "parking":          0.04,
    "elevator":         0.02,
    "balcony":          0.015,
    "storage":          0.01,
    "air_conditioning": 0.01,
    "renovated":        0.03,
    "new_building":     0.02,
    "accessibility":    0.01,
}


# ─────────────────────────────────────────────────────────────────────────────
# Parse a single listing item into our schema
# ─────────────────────────────────────────────────────────────────────────────

def parse_listing(item: dict, city_key: str) -> Optional[dict]:
    try:
        token = item.get("token") or str(item.get("orderId") or "")
        if not token:
            return None

        price = item.get("price")
        if not price or not isinstance(price, (int, float)):
            return None
        price = int(price)

        addr    = item.get("address", {})
        details = item.get("additionalDetails", {})

        neighborhood = addr.get("neighborhood", {}).get("text") or "unknown"
        floor        = addr.get("house", {}).get("floor", 0)
        rooms_raw    = details.get("roomsCount")
        sqm          = int(details.get("squareMeter") or 0)

        if rooms_raw is None:
            return None
        rooms = float(rooms_raw)

        title         = str(item.get("title") or item.get("info_text") or "")
        property_text = details.get("property", {}).get("text", "")

        url          = f"https://www.yad2.co.il/item/{token}"
        listed_at    = datetime.now(timezone.utc).isoformat()[:10]
        listing_type = _detect_listing_type(title, price, rooms, sqm, property_text)

        return {
            "id":           f"yad2-{token}",
            "url":          url,
            "city":         city_key,
            "neighborhood": neighborhood,
            "rooms":        rooms,
            "sqm":          sqm,
            "floor":        int(floor),
            "price_nis":    price,
            "listing_type": listing_type,
            "features":     [],   # populated later by amenity enrichment phase
            "listed_at":    listed_at,
            "scraped_at":   listed_at,
        }
    except (KeyError, ValueError, TypeError):
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Amenity extraction from individual listing pages
# ─────────────────────────────────────────────────────────────────────────────

# Hebrew keyword → feature key. Scanned against the full __NEXT_DATA__ JSON string
# of the individual listing page, so structural changes don't break it.
AMENITY_KEYWORDS = {
    "מרפסת":          "balcony",
    'ממ"ד':           "mamad",
    "ממד":            "mamad",          # alternate spelling without quotes
    "חניה":           "parking",
    "חנייה":          "parking",
    "גינה":           "garden",
    "מחסן":           "storage",
    "מעלית":          "elevator",
    "מיזוג":          "air_conditioning",
    "שיפוץ":          "renovated",
    "בנייה חדשה":     "new_building",
    "גישה לנכים":     "accessibility",
    "מקלט ציבורי":    "public_shelter",
    "מקלט דיירים":    "building_shelter",
    "מרחב מוגן":      "mamad",          # generic safe room
}


def _extract_amenities_from_nd(nd: dict) -> list:
    """
    Scan a single listing page's __NEXT_DATA__ for amenity keywords.
    Returns a deduplicated list of feature key strings (e.g. ["balcony", "parking"]).
    Using string search is resilient to Yad2 restructuring their data model.
    """
    nd_str = json.dumps(nd, ensure_ascii=False)
    seen: set = set()
    found: list = []
    for heb_key, feature_key in AMENITY_KEYWORDS.items():
        if heb_key in nd_str and feature_key not in seen:
            seen.add(feature_key)
            found.append(feature_key)
    return found


# ─────────────────────────────────────────────────────────────────────────────
# Scrape one city (Playwright headed mode)
# ─────────────────────────────────────────────────────────────────────────────

def scrape_city(city_key: str) -> list:
    """
    Scrape all rental listings for a city using headless=False Playwright.
    Returns list of parsed listing dicts.
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print("  ⚠ playwright not installed. Run: pip3 install playwright && python3 -m playwright install chromium")
        return []

    city_code    = CITIES[city_key]
    city_display = city_key.replace("_", " ").title()
    all_listings: list = []
    seen_ids: set      = set()

    print(f"\n[{city_display}] Starting scrape (headed Chromium)...")

    try:
        with sync_playwright() as pw:
            # headless=False bypasses Imperva bot detection
            browser = pw.chromium.launch(headless=False)
            ctx     = browser.new_context(user_agent=USER_AGENT)
            page    = ctx.new_page()

            # Block images/fonts to speed up loads
            page.route(
                "**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,ico}",
                lambda r: r.abort()
            )

            for page_num in range(1, MAX_PAGES + 1):
                url = f"{YAD2_RENT_URL}?city={city_code}&page={page_num}"
                try:
                    page.goto(url, wait_until="networkidle", timeout=30_000)
                except PWTimeout:
                    print(f"  Page {page_num}: timeout — stopping")
                    break

                nd = _read_next_data(page)
                if not nd:
                    print(f"  Page {page_num}: no __NEXT_DATA__ — stopping")
                    break

                raw = _extract_raw_listings(nd)
                if not raw:
                    print(f"  Page {page_num}: empty feed — stopping")
                    break

                new_count = 0
                for item in raw:
                    listing = parse_listing(item, city_key)
                    if listing and listing["id"] not in seen_ids:
                        seen_ids.add(listing["id"])
                        all_listings.append(listing)
                        new_count += 1

                print(f"  Page {page_num}: {new_count} new listings (total: {len(all_listings)})")

                if new_count == 0:
                    print(f"  Page {page_num}: no new listings — stopping (reached end)")
                    break

                time.sleep(PAGE_DELAY)

            # ── Phase 2: Amenity enrichment ──────────────────────────────────
            apartments = [l for l in all_listings if l.get("listing_type") == "apartment"]
            to_enrich  = apartments[:AMENITY_SCRAPE_CAP]
            print(f"\n  [{city_display}] Enriching amenities for "
                  f"{len(to_enrich)}/{len(apartments)} apartments...")

            ok_count = 0
            for i, listing in enumerate(to_enrich):
                token = listing["id"].replace("yad2-", "")
                item_url = f"https://www.yad2.co.il/item/{token}"
                try:
                    page.goto(item_url, wait_until="networkidle",
                              timeout=AMENITY_TIMEOUT)
                    nd = _read_next_data(page)
                    if nd:
                        listing["features"] = _extract_amenities_from_nd(nd)
                        ok_count += 1
                except Exception:
                    pass  # timeout or error — leave features as []

                if (i + 1) % 50 == 0:
                    print(f"    {i + 1}/{len(to_enrich)} enriched "
                          f"({ok_count} with data)...")

                time.sleep(AMENITY_DELAY)

            print(f"  [{city_display}] Amenity enrichment done "
                  f"({ok_count}/{len(to_enrich)} had data)")

            browser.close()

    except Exception as e:
        print(f"  ⚠ Playwright error for {city_display}: {e}")

    print(f"  [{city_display}] Collected {len(all_listings)} listings")
    return all_listings


# ─────────────────────────────────────────────────────────────────────────────
# Debug: inspect raw field structure from Yad2 feed
# ─────────────────────────────────────────────────────────────────────────────

def debug_fields(city_key: str = "tel_aviv", n: int = 3) -> None:
    """
    Scrape page 1 of city_key and pretty-print the raw dict for the first n items.
    Use this to discover what fields Yad2 returns (e.g. to find amenities).
    Run with: python scraper/run.py --debug-fields
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError:
        print("playwright not installed")
        return

    city_code = CITIES[city_key]
    url       = f"{YAD2_RENT_URL}?city={city_code}&page=1"

    print(f"\nDebug: fetching {url}")
    print("=" * 60)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=False)
            ctx     = browser.new_context(user_agent=USER_AGENT)
            page    = ctx.new_page()
            page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,ico}", lambda r: r.abort())

            try:
                page.goto(url, wait_until="networkidle", timeout=30_000)
            except PWTimeout:
                print("Timeout loading page")
                browser.close()
                return

            nd = _read_next_data(page)
            browser.close()

        if not nd:
            print("No __NEXT_DATA__ found")
            return

        raw = _extract_raw_listings(nd)
        if not raw:
            print("No listings in feed")
            return

        print(f"Feed returned {len(raw)} items. Showing first {min(n, len(raw))}:\n")

        for i, item in enumerate(raw[:n]):
            print(f"─── Item {i + 1} ───────────────────────────────────")
            print(json.dumps(item, ensure_ascii=False, indent=2))
            print()

    except Exception as e:
        print(f"Error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Compute medians + deal scores
# ─────────────────────────────────────────────────────────────────────────────

def compute_medians(listings: list) -> tuple:
    """
    Returns:
      medians       — {city: {neighborhood: {rooms_str: median_nis}}}
      ppsqm_medians — {city: {neighborhood: {rooms_str: median_nis_per_sqm}}}
    Only includes apartment listings (listing_type == "apartment").
    """
    price_groups: dict = {}
    ppsqm_groups: dict = {}

    for l in listings:
        if l.get("listing_type", "apartment") != "apartment":
            continue
        city  = l["city"]
        hood  = l["neighborhood"]
        rooms = str(l["rooms"]).replace(".0", "")
        price = l["price_nis"]
        sqm   = l.get("sqm", 0)

        price_groups.setdefault(city, {}).setdefault(hood, {}).setdefault(rooms, []).append(price)

        if sqm and sqm > 5:
            ppsqm_groups.setdefault(city, {}).setdefault(hood, {}).setdefault(rooms, []).append(price / sqm)

    medians: dict = {}
    for city, hoods in price_groups.items():
        medians[city] = {}
        for hood, room_map in hoods.items():
            medians[city][hood] = {}
            for rooms, prices in room_map.items():
                if len(prices) >= 2:
                    medians[city][hood][rooms] = int(statistics.median(prices))

    ppsqm_medians: dict = {}
    for city, hoods in ppsqm_groups.items():
        ppsqm_medians[city] = {}
        for hood, room_map in hoods.items():
            ppsqm_medians[city][hood] = {}
            for rooms, values in room_map.items():
                if len(values) >= 2:
                    ppsqm_medians[city][hood][rooms] = round(statistics.median(values), 2)

    return medians, ppsqm_medians


def score_listings(listings: list, medians: dict, ppsqm_medians: dict) -> list:
    scored = []
    for l in listings:
        listing_type = l.get("listing_type", "apartment")

        # Non-apartments get a neutral score with their type as the label
        if listing_type != "apartment":
            l["deal_score"] = 0.0
            l["deal_label"] = listing_type
            scored.append(l)
            continue

        city     = l["city"]
        hood     = l["neighborhood"]
        rooms    = str(l["rooms"]).replace(".0", "")
        price    = l["price_nis"]
        sqm      = l.get("sqm", 0)
        floor    = l.get("floor", 2)
        features = l.get("features") or []

        median_ppsqm = ppsqm_medians.get(city, {}).get(hood, {}).get(rooms)

        if sqm and sqm > 5 and median_ppsqm:
            # Primary path: price-per-sqm with floor + feature adjustments
            listing_ppsqm = price / sqm
            fp = _floor_premium(floor)
            feat_adj = sum(
                FEATURE_PREMIUMS[k]
                for f in features
                for k in FEATURE_PREMIUMS
                if k in f.lower()
            )
            expected_ppsqm = median_ppsqm * (1 + fp + feat_adj)
            deviation = round((listing_ppsqm - expected_ppsqm) / expected_ppsqm * 100, 1)
        else:
            # Fallback: absolute price vs median
            median = medians.get(city, {}).get(hood, {}).get(rooms)
            if median is None or median == 0:
                l["deal_score"] = 0.0
                l["deal_label"] = "fair"
                scored.append(l)
                continue
            deviation = round((price - median) / median * 100, 1)

        l["deal_score"] = deviation
        l["deal_label"] = (
            "great_deal" if deviation < -10
            else "overpriced" if deviation > 10
            else "fair"
        )
        scored.append(l)
    return scored


# ─────────────────────────────────────────────────────────────────────────────
# Main entrypoint
# ─────────────────────────────────────────────────────────────────────────────

def run(city_keys: Optional[list] = None, use_playwright: bool = True) -> tuple:
    """
    Scrape one or more cities.
    use_playwright is accepted for API compatibility but always True now —
    requests mode is blocked by Imperva.
    Returns (scored_listings, medians_dict).
    """
    if city_keys is None:
        city_keys = list(CITIES.keys())

    all_listings: list = []
    for city_key in city_keys:
        if city_key not in CITIES:
            print(f"Unknown city '{city_key}' — skipping. Valid: {list(CITIES.keys())}")
            continue
        listings = scrape_city(city_key)
        all_listings.extend(listings)

    print(f"\nTotal raw listings collected: {len(all_listings)}")
    medians, ppsqm_medians = compute_medians(all_listings)
    scored = score_listings(all_listings, medians, ppsqm_medians)
    return scored, medians
