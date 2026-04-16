import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()

BENEFITS_FILE = Path(__file__).parent.parent.parent / "data" / "benefits.json"


class BenefitProgram(BaseModel):
    id: str
    name_he: str
    name_en: str
    description_he: str
    description_en: str
    monthly_amount_nis: Optional[int] = None
    one_time_amount_nis: Optional[int] = None
    link: str


def _matches(program: dict, income: int, family_size: int, owns_home: bool, is_oleh: bool) -> bool:
    e = program.get("eligibility", {})

    if e.get("requires_oleh") and not is_oleh:
        return False
    if e.get("requires_no_home") and owns_home:
        return False
    if "max_income" in e and income > e["max_income"]:
        return False
    if "min_family_size" in e and family_size < e["min_family_size"]:
        return False

    return True


@router.get("/benefits", response_model=list[BenefitProgram])
def get_benefits(
    income: int = Query(..., description="Monthly household income in NIS"),
    family_size: int = Query(..., description="Number of people in household"),
    owns_home: bool = Query(False),
    is_oleh: bool = Query(False),
):
    if not BENEFITS_FILE.exists():
        return []

    with open(BENEFITS_FILE, encoding="utf-8") as f:
        all_programs = json.load(f)

    matching = [p for p in all_programs if _matches(p, income, family_size, owns_home, is_oleh)]
    return matching
