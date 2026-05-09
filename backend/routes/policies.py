from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.legiscan import get_master_list, get_bill, get_bill_text, status_label
from services.claude_ai import summarize_bill, personalized_impact, what_can_i_do

router = APIRouter()

_summary_cache: dict = {}
_action_cache: dict = {}


class ProfilePayload(BaseModel):
    profession: str = ""
    county: str = ""
    is_renter: bool = False
    is_student: bool = False
    is_parent: bool = False
    interests: list[str] = []


def _default_ai(bill: dict) -> dict:
    return {
        "summary": bill.get("description", ""),
        "eli15": "This bill proposes changes to California law. Click 'Ask AI' below to get a plain-language explanation.",
        "affected_groups": ["California residents"],
        "why_it_matters": "This bill is currently active in the California legislature.",
        "supporters_argue": "Supporters believe this will benefit Californians.",
        "opponents_argue": "Opponents have raised concerns about implementation or costs.",
    }


@router.get("/policies")
async def list_policies():
    bills = await get_master_list()
    feed = []
    for b in bills[:20]:
        feed.append({
            "bill_id": b.get("bill_id"),
            "number": b.get("number"),
            "title": b.get("title", ""),
            "description": b.get("description", ""),
            "status": status_label(b.get("status", 0)),
            "status_date": b.get("status_date", ""),
            "url": b.get("url", ""),
        })
    return {"policies": feed}


@router.get("/policy/{bill_id}")
async def get_policy(bill_id: int):
    bill = await get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    cache_key = f"summary_{bill_id}"
    if cache_key not in _summary_cache:
        try:
            _summary_cache[cache_key] = await summarize_bill(bill, "")
        except Exception:
            _summary_cache[cache_key] = _default_ai(bill)
    ai = _summary_cache[cache_key]

    sponsors = [
        {"name": s.get("name"), "party": s.get("party", "")}
        for s in bill.get("sponsors", [])[:5]
    ]
    history = [
        {"date": h.get("date"), "action": h.get("action")}
        for h in bill.get("history", [])[-5:]
    ]

    return {
        "bill_id": bill_id,
        "number": bill.get("bill_number", bill.get("number", "")),
        "title": bill.get("title", ""),
        "description": bill.get("description", ""),
        "status": status_label(bill.get("status", 0)),
        "status_date": bill.get("status_date", ""),
        "url": bill.get("url", ""),
        "sponsors": sponsors,
        "history": history,
        "ai": ai,
    }


@router.post("/policy/{bill_id}/impact")
async def get_impact(bill_id: int, profile: ProfilePayload):
    bill = await get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    try:
        impact = await personalized_impact(bill, profile.model_dump())
    except Exception:
        impact = "AI analysis is temporarily unavailable. Try again in a moment."
    return {"impact": impact}


@router.post("/policy/{bill_id}/action")
async def get_action(bill_id: int, profile: ProfilePayload):
    bill = await get_bill(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    try:
        actions = await what_can_i_do(bill, profile.model_dump())
    except Exception:
        actions = []
    return {"actions": actions}
