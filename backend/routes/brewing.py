import os
import html
import xml.etree.ElementTree as ET
from datetime import datetime
import httpx
from fastapi import APIRouter, HTTPException
from services.claude_ai import summarize_news_articles, analyze_brewing_story

router = APIRouter()

_news_cache: list | None = None
_bills_cache: list | None = None

# ─── Bill stories (seed data) ─────────────────────────────────────────────────

BILL_STORIES = [
    {
        "headline": "California Rent Stabilization Act Would Cap Rent Hikes Statewide",
        "source": "CA Legislature",
        "published_date": "2025-03-01",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB7",
        "insight_summary": "SB 7 would establish statewide rent stabilization limits, preventing landlords from raising rents beyond a set annual cap. This is one of the most significant tenant-protection measures in California in decades and is moving quickly through committee.",
        "why_it_matters": [
            "Directly affects California's 17 million renters, especially in high-cost urban areas",
            "Relates to housing affordability and anti-displacement policy",
            "Could reduce tenant evictions and displacement in major cities",
            "Major issue heading into the 2026 state elections with broad voter interest",
        ],
        "category": "Housing",
        "bill_number": "SB 7",
        "bill_id": 1002,
    },
    {
        "headline": "AI Transparency Bill Would Require Companies to Disclose Algorithmic Decisions",
        "source": "CA Legislature",
        "published_date": "2025-03-05",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB412",
        "insight_summary": "AB 412 would require companies using automated decision-making tools to disclose when an algorithm affected a consequential decision about a California resident. This includes hiring, credit, insurance, and housing decisions.",
        "why_it_matters": [
            "Affects workers, job seekers, renters, and anyone subject to automated screening",
            "Addresses technology governance and AI accountability policy",
            "Would give Californians a right to request human review of algorithmic decisions",
            "Part of a growing wave of AI regulation bills ahead of federal inaction",
        ],
        "category": "Technology",
        "bill_number": "AB 412",
        "bill_id": 1003,
    },
    {
        "headline": "Medi-Cal Expansion Bill Aims to Cover All Low-Income Residents Regardless of Status",
        "source": "CA Legislature",
        "published_date": "2025-03-10",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB43",
        "insight_summary": "SB 43 would expand Medi-Cal eligibility to all qualifying low-income Californians regardless of immigration status, cementing protections in state law amid federal Medicaid uncertainty.",
        "why_it_matters": [
            "Affects an estimated 700,000 uninsured Californians currently excluded from Medi-Cal",
            "Relates to healthcare access, Medicaid policy, and immigration",
            "Would shift significant state budget resources toward universal healthcare coverage",
            "Gaining urgency as federal Medicaid funding faces potential cuts",
        ],
        "category": "Healthcare",
        "bill_number": "SB 43",
        "bill_id": 1004,
    },
    {
        "headline": "California's Plastic Pollution Reduction Act Faces Industry Pushback",
        "source": "CA Legislature",
        "published_date": "2025-03-12",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB54",
        "insight_summary": "SB 54 would hold plastic producers financially responsible for recycling infrastructure costs, shifting the burden from municipalities and consumers. Industry groups are mounting significant opposition.",
        "why_it_matters": [
            "Affects consumers, businesses, and municipalities across California",
            "Addresses environmental policy, plastics recycling, and producer responsibility",
            "Could raise costs for packaged goods while reducing taxpayer recycling burden",
            "A key environmental battleground ahead of California's 2026 ballot cycle",
        ],
        "category": "Environment",
        "bill_number": "SB 54",
        "bill_id": 1009,
    },
    {
        "headline": "Teacher Shortage Bill Would Forgive Student Loans for Educators in High-Need Schools",
        "source": "CA Legislature",
        "published_date": "2025-03-15",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB222",
        "insight_summary": "SB 222 would create a California student loan forgiveness program for teachers who commit to five years in underserved schools. With over 3,000 vacancies, the teacher shortage is most severe in rural and low-income districts.",
        "why_it_matters": [
            "Affects aspiring teachers, current educators, and students in high-need schools",
            "Addresses education workforce policy and student debt relief",
            "Could incentivize thousands of new teachers to enter underserved communities",
            "Education workforce is a priority issue in upcoming state budget negotiations",
        ],
        "category": "Education",
        "bill_number": "SB 222",
        "bill_id": 1010,
    },
]


# ─── RSS news fetching ─────────────────────────────────────────────────────────

RSS_SOURCES = [
    {
        "url": "https://news.google.com/rss/search?q=california+governor+election+2026&hl=en-US&gl=US&ceid=US:en",
        "is_google": True,
    },
    {
        "url": "https://news.google.com/rss/search?q=california+legislature+bill+2026&hl=en-US&gl=US&ceid=US:en",
        "is_google": True,
    },
    {
        "url": "https://calmatters.org/feed/",
        "is_google": False,
        "default_source": "CalMatters",
    },
]


def _parse_date(raw: str) -> str:
    for fmt in ("%a, %d %b %Y %H:%M:%S %Z", "%a, %d %b %Y %H:%M:%S %z"):
        try:
            return datetime.strptime(raw.strip(), fmt).strftime("%Y-%m-%d")
        except Exception:
            pass
    return raw[:10] if raw else ""


def _parse_rss(xml_text: str, is_google: bool, default_source: str = "") -> list[dict]:
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []
    articles = []
    for item in root.findall(".//item"):
        title_raw = html.unescape(item.findtext("title", ""))
        link = item.findtext("link", "") or ""
        pub_date = _parse_date(item.findtext("pubDate", ""))
        desc_raw = html.unescape(item.findtext("description", ""))

        if is_google:
            # Google format: "Title - Source Name"
            parts = title_raw.rsplit(" - ", 1)
            title = parts[0].strip() if len(parts) > 1 else title_raw
            source = parts[1].strip() if len(parts) > 1 else "Google News"
        else:
            title = title_raw
            source = default_source

        # Strip HTML tags from description
        import re
        clean_desc = re.sub(r"<[^>]+>", "", desc_raw)[:400]

        if title:
            articles.append({
                "title": title,
                "url": link,
                "source": source,
                "published_date": pub_date,
                "body": clean_desc,
            })
    return articles


async def _fetch_rss_news() -> list[dict]:
    all_articles: list[dict] = []
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        for src in RSS_SOURCES:
            try:
                resp = await client.get(
                    src["url"],
                    headers={"User-Agent": "Mozilla/5.0 (compatible; BillMe/1.0)"},
                )
                parsed = _parse_rss(
                    resp.text,
                    is_google=src.get("is_google", False),
                    default_source=src.get("default_source", ""),
                )
                all_articles.extend(parsed)
            except Exception as e:
                print(f"[brewing] RSS fetch failed: {src['url'][:60]} — {e}")

    # Deduplicate by title
    seen: set[str] = set()
    unique = []
    for a in all_articles:
        key = a["title"].lower()[:60]
        if key not in seen:
            seen.add(key)
            unique.append(a)

    return unique[:15]


# ─── Story caches ──────────────────────────────────────────────────────────────

async def _get_bills() -> list[dict]:
    global _bills_cache
    if _bills_cache:
        return _bills_cache
    _bills_cache = [{**s, "id": i} for i, s in enumerate(BILL_STORIES)]
    return _bills_cache


async def _get_news() -> list[dict]:
    global _news_cache
    if _news_cache:
        return _news_cache

    try:
        articles = await _fetch_rss_news()
        stories = await summarize_news_articles(articles) if articles else []
    except Exception as e:
        print(f"[brewing] news processing failed: {e}")
        stories = []

    # Give news items IDs starting at 100 to avoid collision with bill IDs
    _news_cache = [{**s, "id": 100 + i} for i, s in enumerate(stories)]
    return _news_cache


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.get("/brewing")
async def get_brewing():
    bills, news = await _get_bills(), await _get_news()
    return {"bills": bills, "news": news}


@router.post("/brewing/{story_id}/analyze")
async def analyze_story(story_id: int):
    bills, news = await _get_bills(), await _get_news()
    story = next((s for s in bills + news if s.get("id") == story_id), None)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    analysis = await analyze_brewing_story(story)
    return {"analysis": analysis}
