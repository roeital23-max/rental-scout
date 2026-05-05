"""
Post-scrape sanity check agent.

Flags listings with structural impossibilities (CRITICAL) or statistical
outliers (WARNING). Flagged listings are still upserted to Supabase but
marked flagged=True so they are hidden from search results until reviewed.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

# Per-listing thresholds
SQM_MAX          = 1000   # above this: physically impossible apartment
SQM_ENTRY_ERROR  = 1      # sqm == 1: data entry error, corrupts ppsqm median
FLOOR_MAX        = 50     # no residential building in Israel has 50+ floors
FLOOR_MIN        = -3     # basement deeper than -3 is unusual
ROOMS_MAX        = 8      # more than 8 rooms is almost certainly a parse error
PPSQM_MAX        = 500    # ₪500/sqm extreme — likely sqm is wrong
PPSQM_MIN        = 15     # ₪15/sqm impossibly cheap (applies only when sqm > 20)
PRICE_MAX        = 80_000 # above any realistic Israeli rental
SQM_WARN         = 750    # above 750sqm: may be villa or commercial
SCORE_MAX        = 150    # deal_score above this: median computation suspect
SCORE_MIN        = -85    # deal_score below this: corrupting neighborhood median

# Aggregate thresholds
MIN_APARTMENTS   = 30     # fewer than this per city: scrape likely failed
MAX_PCT_SQM_MISS = 70     # % listings with sqm==0 above this: data quality issue
MAX_PCT_GREAT    = 50     # % great_deal above this: median suspect
MAX_PCT_OVER     = 50     # % overpriced above this: median suspect


def _check_listing(listing: dict) -> list[tuple[str, str]]:
    """Return list of (severity, reason) tuples for a single listing."""
    checks: list[tuple[str, str]] = []

    sqm   = listing.get("sqm", 0) or 0
    price = listing.get("price_nis", 0) or 0
    floor = listing.get("floor", 0) or 0
    rooms = listing.get("rooms", 0) or 0
    score = listing.get("deal_score", 0) or 0
    ppsqm = round(price / sqm, 1) if sqm > 0 else None

    # CRITICAL — structural impossibilities
    if sqm > SQM_MAX:
        checks.append(("CRITICAL", f"sqm={sqm} > {SQM_MAX}"))
    if sqm == SQM_ENTRY_ERROR:
        checks.append(("CRITICAL", f"sqm=1 (data entry error)"))
    if floor > FLOOR_MAX:
        checks.append(("CRITICAL", f"floor={floor} > {FLOOR_MAX}"))
    if rooms > ROOMS_MAX:
        checks.append(("CRITICAL", f"rooms={rooms} > {ROOMS_MAX}"))

    # WARNING — statistical outliers
    if sqm > SQM_WARN:
        checks.append(("WARNING", f"sqm={sqm} > {SQM_WARN}"))
    if ppsqm is not None and ppsqm > PPSQM_MAX:
        checks.append(("WARNING", f"ppsqm=₪{ppsqm} > {PPSQM_MAX}"))
    if ppsqm is not None and ppsqm < PPSQM_MIN and sqm > 20:
        checks.append(("WARNING", f"ppsqm=₪{ppsqm} < {PPSQM_MIN} (sqm={sqm})"))
    if price > PRICE_MAX:
        checks.append(("WARNING", f"price=₪{price} > {PRICE_MAX:,}"))
    if floor < FLOOR_MIN:
        checks.append(("WARNING", f"floor={floor} < {FLOOR_MIN}"))
    if score > SCORE_MAX or score < SCORE_MIN:
        checks.append(("WARNING", f"deal_score={score} (extreme)"))

    return checks


def run_sanity_check(listings: list, city: str) -> list:
    """
    Inspect every listing, attach flagged + flag_reasons, print report,
    write data/sanity_report_{city}.json. Returns the annotated listings.
    """
    apartments = [l for l in listings if l.get("listing_type") == "apartment"]
    flagged_listings: list[dict] = []

    for listing in listings:
        checks = _check_listing(listing)
        if checks:
            severity = "CRITICAL" if any(c[0] == "CRITICAL" for c in checks) else "WARNING"
            listing["flagged"]      = True
            listing["flag_reasons"] = [c[1] for c in checks]
            flagged_listings.append({
                "id":           listing["id"],
                "severity":     severity,
                "neighborhood": listing.get("neighborhood", "unknown"),
                "rooms":        listing.get("rooms"),
                "sqm":          listing.get("sqm"),
                "floor":        listing.get("floor"),
                "price_nis":    listing.get("price_nis"),
                "deal_score":   listing.get("deal_score"),
                "deal_label":   listing.get("deal_label"),
                "listing_type": listing.get("listing_type"),
                "checks":       checks,
                "url":          listing.get("url", ""),
            })
        else:
            listing["flagged"]      = False
            listing["flag_reasons"] = []

    criticals = [f for f in flagged_listings if f["severity"] == "CRITICAL"]
    warnings  = [f for f in flagged_listings if f["severity"] == "WARNING"]

    # Aggregate stats
    total = len(listings)
    n_apt = len(apartments)
    pct_sqm_miss    = sum(1 for l in listings if not l.get("sqm")) / total * 100 if total else 0
    pct_feat_empty  = sum(1 for l in listings if not l.get("features")) / total * 100 if total else 0
    pct_great       = sum(1 for l in apartments if l.get("deal_label") == "great_deal") / n_apt * 100 if n_apt else 0
    pct_over        = sum(1 for l in apartments if l.get("deal_label") == "overpriced")  / n_apt * 100 if n_apt else 0

    aggregate_warnings: list[str] = []
    if n_apt < MIN_APARTMENTS:
        aggregate_warnings.append(f"Only {n_apt} apartments — scrape may have failed")
    if pct_sqm_miss > MAX_PCT_SQM_MISS:
        aggregate_warnings.append(f"sqm missing in {pct_sqm_miss:.1f}% of listings")
    if pct_great > MAX_PCT_GREAT:
        aggregate_warnings.append(f"{pct_great:.1f}% labeled great_deal — median suspect")
    if pct_over > MAX_PCT_OVER:
        aggregate_warnings.append(f"{pct_over:.1f}% labeled overpriced — median suspect")

    # Console output
    w = 60
    print(f"\n{'═' * w}")
    print(f"  SANITY CHECK · {city}")
    print(f"{'═' * w}")
    print(f"  Total listings   : {total}")
    print(f"  Apartments       : {n_apt}  (non-apt: {total - n_apt})")
    crit_label = f"{len(criticals)}  ← REVIEW REQUIRED" if criticals else str(len(criticals))
    print(f"  Critical flags   : {crit_label}")
    print(f"  Warning flags    : {len(warnings)}")
    print(f"  sqm missing      : {pct_sqm_miss:.1f}%")
    print(f"  features empty   : {pct_feat_empty:.1f}%")
    print(f"  great_deal       : {pct_great:.1f}%  |  overpriced: {pct_over:.1f}%")

    if aggregate_warnings:
        print(f"\n  AGGREGATE WARNINGS:")
        for w_msg in aggregate_warnings:
            print(f"    ⚠  {w_msg}")

    if criticals:
        print(f"\n  CRITICAL ({len(criticals)}):")
        for f in criticals:
            reasons = " | ".join(c[1] for c in f["checks"])
            print(f"    {f['id']}  [{f['neighborhood']}]  {f['rooms']}r {f['sqm']}sqm ₪{f['price_nis']}")
            print(f"      → {reasons}")
            print(f"      → {f['url']}")

    if warnings:
        print(f"\n  WARNING ({len(warnings)}):")
        for f in warnings:
            reasons = " | ".join(c[1] for c in f["checks"])
            print(f"    {f['id']:32s}  {str(f['neighborhood']):25s}  {reasons}")

    # Write JSON report
    report = {
        "city":              city,
        "scraped_at":        datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "total_listings":    total,
        "apartment_listings": n_apt,
        "critical_count":    len(criticals),
        "warning_count":     len(warnings),
        "aggregate": {
            "pct_sqm_missing":   round(pct_sqm_miss, 1),
            "pct_features_empty": round(pct_feat_empty, 1),
            "pct_great_deal":    round(pct_great, 1),
            "pct_overpriced":    round(pct_over, 1),
            "warnings":          aggregate_warnings,
        },
        "flagged": flagged_listings,
    }

    DATA_DIR.mkdir(exist_ok=True)
    report_path = DATA_DIR / f"sanity_report_{city}.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n  Report → {report_path}")
    print(f"{'═' * 60}\n")

    return listings
