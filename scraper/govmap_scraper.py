"""Fetch sold apartment price-per-sqm from GovMap (data.gov.il Tax Authority)."""
import json
import statistics
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

GOVMAP_BASE = "https://www.govmap.gov.il/api"
HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://www.govmap.gov.il",
    "Referer": "https://www.govmap.gov.il/",
}
DATA_FILE = Path(__file__).parent.parent / "data" / "govmap_comps.json"

CITY_HEB = {
    "tel_aviv":   "תל אביב יפו",
    "jerusalem":  "ירושלים",
    "haifa":      "חיפה",
    "beer_sheva": "באר שבע",
}


def _autocomplete(street: str, city_heb: str) -> tuple[float, float] | None:
    """Return (lon, lat) in ITM coordinates for the given street+city, or None."""
    payload = {
        "searchText": f"{street} {city_heb}",
        "language": "he",
        "isAccurate": False,
        "maxResults": 3,
    }
    r = requests.post(
        f"{GOVMAP_BASE}/search-service/autocomplete",
        json=payload,
        headers=HEADERS,
        timeout=10,
    )
    r.raise_for_status()
    for res in r.json().get("results", []):
        shape = res.get("shape", "")
        if shape.startswith("POINT("):
            coords = shape[6:-1].split()
            if len(coords) == 2:
                return float(coords[0]), float(coords[1])
    return None


def _fetch_deals_for_street(lon: float, lat: float, street_heb: str, radius: int = 400) -> list[int]:
    """
    Fetch polygon_ids near point, pull apartment deals from polygons on matching street,
    and return a list of price_per_sqm values from the last 3 years.
    """
    r = requests.get(
        f"{GOVMAP_BASE}/real-estate/deals/{lon},{lat}/{radius}",
        headers=HEADERS,
        timeout=10,
    )
    r.raise_for_status()
    polygons = r.json()

    cutoff = datetime.now(timezone.utc) - timedelta(days=3 * 365)
    ppsqm_values: list[int] = []
    seen: set[str] = set()

    for poly in polygons:
        pid = str(poly.get("polygon_id") or "")
        poly_street = (poly.get("streetNameHeb") or "").strip()
        if not pid or pid in seen or poly_street != street_heb.strip():
            continue
        seen.add(pid)

        time.sleep(0.3)
        r2 = requests.get(
            f"{GOVMAP_BASE}/real-estate/street-deals/{pid}",
            params={"limit": 100, "dealType": 2},
            headers=HEADERS,
            timeout=15,
        )
        if not r2.ok:
            continue

        for deal in r2.json().get("data", []):
            sqm = deal.get("assetArea") or 0
            price = deal.get("dealAmount") or 0
            prop_type = deal.get("propertyTypeDescription") or ""
            date_str = deal.get("dealDate") or ""
            if prop_type != "דירה" or sqm <= 20 or price <= 300_000 or not date_str:
                continue
            try:
                deal_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                if deal_date >= cutoff:
                    ppsqm_values.append(round(price / sqm))
            except ValueError:
                pass

    return ppsqm_values


def run_govmap(listings_json_path: Path | None = None) -> dict:
    """
    Build govmap_comps.json keyed {city_key: {street_heb: {price_per_sqm, sample_size}}}.
    Reads unique (city, street) combos from yad2_listings_raw.json.
    Returns the comps dict (city_key → street → data).
    """
    src = listings_json_path or (Path(__file__).parent.parent / "data" / "yad2_listings_raw.json")
    if not src.exists():
        print(f"  govmap: source file not found: {src}")
        return {}

    with open(src, encoding="utf-8") as f:
        listings = json.load(f)

    streets_by_city: dict[str, set[str]] = {}
    for l in listings:
        city = l.get("city", "")
        street = (l.get("street") or "").strip()
        if city in CITY_HEB and street:
            streets_by_city.setdefault(city, set()).add(street)

    total_streets = sum(len(s) for s in streets_by_city.values())
    print(f"  govmap: {total_streets} unique streets across {len(streets_by_city)} cities")

    comps: dict[str, dict] = {}
    for city_key, streets in streets_by_city.items():
        city_heb = CITY_HEB[city_key]
        comps[city_key] = {}
        for street in streets:
            try:
                coords = _autocomplete(street, city_heb)
                if not coords:
                    continue
                time.sleep(0.4)
                ppsqm_values = _fetch_deals_for_street(coords[0], coords[1], street)
                if len(ppsqm_values) >= 3:
                    comps[city_key][street] = {
                        "price_per_sqm": int(statistics.median(ppsqm_values)),
                        "sample_size": len(ppsqm_values),
                    }
            except Exception as exc:
                print(f"  govmap: skipped {street} ({city_key}): {exc}")
                continue
            time.sleep(0.5)

    result = {
        "updated_at": datetime.now(timezone.utc).isoformat()[:10],
        "neighborhoods": comps,
    }
    DATA_FILE.parent.mkdir(exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    covered = sum(len(v) for v in comps.values())
    print(f"  govmap: {covered}/{total_streets} streets have ≥3 sale comps")
    return comps
