import json
import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter()

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "yad2_listings_raw.json"


class Listing(BaseModel):
    id: str
    url: str
    city: str
    neighborhood: str
    rooms: float
    sqm: int
    sqm_built: int = 0
    floor: int
    price_nis: int
    deal_score: float
    deal_label: str
    listing_type: str = "apartment"
    listed_at: str
    scraped_at: str = ""
    features: List[str] = Field(default_factory=list)
    flagged: bool = False
    flag_reasons: List[str] = Field(default_factory=list)


def _load_from_json() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


@router.get("/listings", response_model=list[Listing])
def get_listings(
    city: Optional[str] = Query(None),
    rooms: Optional[float] = Query(None),
    max_price: Optional[int] = Query(None),
    sort: str = Query("deal_score"),
):
    from api.db import get_supabase, has_supabase

    if has_supabase():
        sb = get_supabase()
        query = sb.table("listings").select("*").eq("flagged", False)
        if city:
            query = query.eq("city", city)
        if rooms is not None:
            query = query.eq("rooms", rooms)
        if max_price is not None:
            query = query.lte("price_nis", max_price)
        query = query.order("deal_score", desc=False).limit(5000)
        result = query.execute()
        return result.data

    # JSON fallback
    listings = _load_from_json()
    listings = [l for l in listings if not l.get("flagged", False)]
    if city:
        listings = [l for l in listings if l.get("city") == city]
    if rooms is not None:
        listings = [l for l in listings if l.get("rooms") == rooms]
    if max_price is not None:
        listings = [l for l in listings if l.get("price_nis", 0) <= max_price]
    listings.sort(key=lambda l: l.get("deal_score", 0))
    return listings


@router.get("/listing/{listing_id}", response_model=Listing)
def get_listing(listing_id: str):
    from api.db import get_supabase, has_supabase

    listing = None

    if has_supabase():
        sb = get_supabase()
        result = sb.table("listings").select("*").eq("id", listing_id).single().execute()
        listing = result.data
    else:
        listings = _load_from_json()
        listing = next((l for l in listings if l["id"] == listing_id), None)

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    return listing
