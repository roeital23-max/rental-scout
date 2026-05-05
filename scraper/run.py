#!/usr/bin/env python3
"""
Rental Scout data pipeline CLI.

Usage:
    python scraper/run.py                            # Yad2 (headed Chromium, all cities)
    python scraper/run.py --city tel_aviv            # Single city
    python scraper/run.py --madlan                   # Madlan neighborhood comps only
    python scraper/run.py --all                      # Yad2 + Madlan
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Allow imports from project root (scraper.*, api.*)
sys.path.insert(0, str(Path(__file__).parent.parent))

from scraper.yad2_scraper import run as run_yad2, debug_fields as debug_yad2_fields
from scraper.madlan_scraper import run as run_madlan
from scraper.sanity_check import run_sanity_check

DATA_DIR      = Path(__file__).parent.parent / "data"
LISTINGS_FILE = DATA_DIR / "yad2_listings_raw.json"
MEDIANS_FILE  = DATA_DIR / "yad2_medians.json"

UPSERT_BATCH = 500  # Supabase row limit per request


# ─────────────────────────────────────────────────────────────────────────────
# Supabase writer
# ─────────────────────────────────────────────────────────────────────────────

def _upsert_listings(sb, listings: list) -> None:
    """Batch-upsert listings into Supabase. Skips fields not in DB schema."""
    DB_FIELDS = {
        "id", "url", "city", "neighborhood", "rooms", "sqm", "sqm_built",
        "floor", "price_nis", "deal_score", "deal_label", "listing_type",
        "features", "listed_at", "scraped_at", "flagged", "flag_reasons",
    }
    rows = [{k: v for k, v in l.items() if k in DB_FIELDS} for l in listings]

    for i in range(0, len(rows), UPSERT_BATCH):
        batch = rows[i : i + UPSERT_BATCH]
        sb.table("listings").upsert(batch, on_conflict="id").execute()
        print(f"  Supabase: upserted rows {i + 1}–{i + len(batch)}")


def _upsert_price_history(sb, medians: dict, updated_at: str) -> None:
    """Write one median-price snapshot per (city, neighborhood, rooms) per run."""
    date_key = updated_at[:10]  # YYYY-MM-DD — one row per day even if run twice
    rows = []
    for city, hoods in medians.items():
        if city == "updated_at":
            continue
        for hood_name, room_map in hoods.items():
            for rooms_str, median_price in room_map.items():
                rows.append({
                    "id":           f"{city}_{hood_name}_{rooms_str}_{date_key}",
                    "city":         city,
                    "neighborhood": hood_name,
                    "rooms":        float(rooms_str),
                    "median_price": median_price,
                    "scraped_at":   updated_at,
                })
    if rows:
        for i in range(0, len(rows), UPSERT_BATCH):
            batch = rows[i : i + UPSERT_BATCH]
            sb.table("price_history").upsert(batch, on_conflict="id").execute()
        print(f"  Supabase: wrote {len(rows)} price_history rows")


def _upsert_neighborhoods(sb, medians: dict, updated_at: str) -> None:
    """Upsert neighborhood median rows from the medians dict."""
    ROOM_COLS = {"1": "median_1room", "2": "median_2room",
                 "3": "median_3room", "4": "median_4room"}
    rows = []
    for city, hoods in medians.items():
        if city == "updated_at":
            continue
        for hood_name, room_map in hoods.items():
            row: dict = {
                "id":         f"{city}_{hood_name}",
                "city":       city,
                "name":       hood_name,
                "updated_at": updated_at,
            }
            for rooms_str, col in ROOM_COLS.items():
                if rooms_str in room_map:
                    row[col] = room_map[rooms_str]
            rows.append(row)

    if rows:
        sb.table("neighborhoods").upsert(rows, on_conflict="id").execute()
        print(f"  Supabase: upserted {len(rows)} neighborhood rows")


def write_to_supabase(listings: list, medians: dict) -> None:
    from api.db import get_supabase, has_supabase
    if not has_supabase():
        print("  Supabase: no credentials — skipping DB write (JSON saved)")
        return

    sb = get_supabase()
    updated_at = datetime.now(timezone.utc).isoformat()

    print(f"\nWriting to Supabase ({len(listings)} listings)...")
    _upsert_listings(sb, listings)
    _upsert_neighborhoods(sb, medians, updated_at)
    _upsert_price_history(sb, medians, updated_at)
    print("  Supabase: done")


# ─────────────────────────────────────────────────────────────────────────────
# Commands
# ─────────────────────────────────────────────────────────────────────────────

def cmd_yad2(city_keys, use_playwright: bool):
    print("=" * 60)
    print("Rental Scout — Yad2 Scraper")
    print(f"Mode    : {'headed Chromium (bypasses Imperva)' if use_playwright else 'requests'}")
    print(f"Started : {datetime.now(timezone.utc).isoformat()}")
    if not use_playwright:
        print("  ⚠  requests mode may be blocked — use --playwright if you get no results")
    print("=" * 60)

    listings, medians = run_yad2(city_keys=city_keys, use_playwright=use_playwright)

    if not listings:
        print("\n⚠ No listings collected.")
        if not use_playwright:
            print("  Try again with --playwright to bypass hCaptcha.")
        return False

    # Run sanity check — attaches flagged + flag_reasons to each listing
    city_key = city_keys[0] if city_keys and len(city_keys) == 1 else "all"
    listings = run_sanity_check(listings, city_key)

    medians["updated_at"] = datetime.now(timezone.utc).isoformat()

    DATA_DIR.mkdir(exist_ok=True)
    with open(LISTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(listings, f, ensure_ascii=False, indent=2)
    with open(MEDIANS_FILE, "w", encoding="utf-8") as f:
        json.dump(medians, f, ensure_ascii=False, indent=2)

    # Write to Supabase if credentials are configured
    write_to_supabase(listings, medians)

    print("\n" + "=" * 60)
    print("Yad2 done!")
    print(f"  Listings : {LISTINGS_FILE}  ({len(listings)} entries)")
    print(f"  Medians  : {MEDIANS_FILE}")

    city_counts: dict = {}
    for l in listings:
        city_counts[l["city"]] = city_counts.get(l["city"], 0) + 1

    print("\nBreakdown by city:")
    for city, count in sorted(city_counts.items()):
        print(f"  {city:<20} {count} listings")

    deal_counts: dict = {}
    for l in listings:
        deal_counts[l["deal_label"]] = deal_counts.get(l["deal_label"], 0) + 1

    print("\nBreakdown by deal label:")
    for label, count in sorted(deal_counts.items()):
        print(f"  {label:<20} {count}")

    print("=" * 60)
    return True


def cmd_sanity_backfill():
    from api.db import get_supabase, has_supabase
    from scraper.sanity_check import _check_listing
    from collections import defaultdict

    if not has_supabase():
        print("No Supabase credentials — cannot run sanity check.")
        return

    sb = get_supabase()
    print("Fetching all listings from Supabase...")

    all_listings = []
    page_size = 1000
    offset = 0
    while True:
        result = sb.table("listings").select("*").range(offset, offset + page_size - 1).execute()
        batch = result.data
        all_listings.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    print(f"Fetched {len(all_listings)} listings across all cities.")

    to_update = []
    for listing in all_listings:
        checks = _check_listing(listing)
        should_flag = bool(checks)
        flag_reasons = [reason for _, reason in checks]
        if listing.get("flagged") != should_flag:
            to_update.append({
                "id": listing["id"],
                "flagged": should_flag,
                "flag_reasons": flag_reasons,
            })

    print(f"Listings needing update: {len(to_update)}")

    for i, row in enumerate(to_update, 1):
        sb.table("listings").update({
            "flagged": row["flagged"],
            "flag_reasons": row["flag_reasons"],
        }).eq("id", row["id"]).execute()
        if i % 50 == 0 or i == len(to_update):
            print(f"  Updated {i}/{len(to_update)}")

    id_to_city = {l["id"]: l.get("city", "unknown") for l in all_listings}
    by_city: dict = defaultdict(lambda: {"total": 0, "flagged": 0, "cleared": 0})
    for listing in all_listings:
        by_city[listing.get("city", "unknown")]["total"] += 1
    for row in to_update:
        city = id_to_city.get(row["id"], "unknown")
        key = "flagged" if row["flagged"] else "cleared"
        by_city[city][key] += 1

    print("\n" + "=" * 60)
    print("SANITY CHECK COMPLETE")
    print("=" * 60)
    for city, stats in sorted(by_city.items()):
        print(f"  {city:<20}  total={stats['total']}  newly flagged={stats['flagged']}  cleared={stats['cleared']}")
    print("=" * 60)


def cmd_madlan(use_playwright: bool):
    print("=" * 60)
    print("Rental Scout — Madlan Scraper")
    print(f"Mode    : {'Playwright (headless Chromium)' if use_playwright else 'requests'}")
    print(f"Started : {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    result = run_madlan(use_playwright=use_playwright)

    total = sum(len(v) for v in result.get("neighborhoods", {}).values())
    print("\nMadlan done!")
    print(f"  Scraped : {total} neighborhoods")
    print("=" * 60)


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Rental Scout data pipeline")
    parser.add_argument("--city",         nargs="+",        help="City key(s) for Yad2. Default: all.")
    parser.add_argument("--playwright",   action="store_true", help="Use headed Chromium (bypasses Imperva)")
    parser.add_argument("--madlan",       action="store_true", help="Run Madlan neighborhood comps scraper")
    parser.add_argument("--all",          action="store_true", help="Run Yad2 + Madlan")
    parser.add_argument("--debug-fields",  action="store_true", help="Dump raw Yad2 item JSON for 3 listings (1 page, tel_aviv) to inspect available fields")
    parser.add_argument("--sanity-check",  action="store_true", help="Run sanity check against all Supabase listings and update flagged status")
    args = parser.parse_args()

    if args.sanity_check:
        cmd_sanity_backfill()
        return

    if args.debug_fields:
        debug_yad2_fields(city_key="tel_aviv", n=3)
        return

    ran_anything = False

    if args.all:
        cmd_yad2(args.city, use_playwright=True)
        cmd_madlan(use_playwright=args.playwright)
        ran_anything = True
    else:
        if args.madlan:
            cmd_madlan(use_playwright=args.playwright)
            ran_anything = True

        if not args.madlan or args.city:
            if not args.madlan:
                cmd_yad2(args.city, use_playwright=args.playwright)
                ran_anything = True

    if not ran_anything:
        parser.print_help()


if __name__ == "__main__":
    main()
