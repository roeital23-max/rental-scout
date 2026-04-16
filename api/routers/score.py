import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "yad2_listings_raw.json"


class ScoreResponse(BaseModel):
    id: str
    price_nis: int
    median_nis: int
    deviation_pct: float
    label: str
    explanation_he: str
    explanation_en: str


def _build_explanation(
    neighborhood: str,
    rooms: float,
    price: int,
    median: int,
    deviation: float,
    label: str,
    sqm: int = 0,
) -> tuple[str, str]:
    rooms_str_he = str(rooms).replace(".0", "")
    rooms_str_en = str(rooms).replace(".0", "")
    diff = abs(round(deviation))

    # Optional per-sqm suffix when sqm is available
    if sqm and sqm > 5:
        ppsqm = round(price / sqm)
        median_ppsqm = round(median / sqm) if median else 0
        sqm_suffix_he = f" (₪{ppsqm:,}/מ\"ר מול ₪{median_ppsqm:,}/מ\"ר מדיית האזור)"
        sqm_suffix_en = f" (₪{ppsqm:,}/sqm vs. ₪{median_ppsqm:,}/sqm area median)"
    else:
        sqm_suffix_he = f" (₪{median:,}/חודש)"
        sqm_suffix_en = f" (₪{median:,}/month)"

    if label == "great_deal":
        he = f"הדירה ב{neighborhood} זולה ב-{diff}% ממדיית {rooms_str_he} חדרים באזור{sqm_suffix_he}."
        en = f"This {rooms_str_en}-room apartment in {neighborhood} is {diff}% below the area median{sqm_suffix_en}."
    elif label == "overpriced":
        he = f"הדירה ב{neighborhood} יקרה ב-{diff}% ממדיית {rooms_str_he} חדרים באזור{sqm_suffix_he}."
        en = f"This {rooms_str_en}-room apartment in {neighborhood} is {diff}% above the area median{sqm_suffix_en}."
    else:
        he = f"הדירה ב{neighborhood} במחיר הוגן — קרוב למדיית {rooms_str_he} חדרים באזור (₪{median:,}/חודש)."
        en = f"This {rooms_str_en}-room apartment in {neighborhood} is fairly priced — near the area median of ₪{median:,}/month."

    return he, en


@router.get("/score/{listing_id}", response_model=ScoreResponse)
def get_score(listing_id: str):
    from api.db import get_supabase, has_supabase

    listing = None

    if has_supabase():
        sb = get_supabase()
        result = sb.table("listings").select("*").eq("id", listing_id).single().execute()
        listing = result.data
    else:
        if DATA_FILE.exists():
            with open(DATA_FILE, encoding="utf-8") as f:
                all_listings = json.load(f)
            listing = next((l for l in all_listings if l["id"] == listing_id), None)

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    price = listing["price_nis"]
    deviation = listing["deal_score"]
    # Reverse-compute median from deviation: median = price / (1 + deviation/100)
    median = round(price / (1 + deviation / 100))

    explanation_he, explanation_en = _build_explanation(
        neighborhood=listing["neighborhood"],
        rooms=listing["rooms"],
        price=price,
        median=median,
        deviation=deviation,
        label=listing["deal_label"],
        sqm=listing.get("sqm", 0),
    )

    return ScoreResponse(
        id=listing_id,
        price_nis=price,
        median_nis=median,
        deviation_pct=deviation,
        label=listing["deal_label"],
        explanation_he=explanation_he,
        explanation_en=explanation_en,
    )
