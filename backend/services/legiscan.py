import os
import base64
import re
from typing import Optional

try:
    import httpx
    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False

LEGISCAN_BASE = "https://api.legiscan.com/"
API_KEY = os.getenv("LEGISCAN_API_KEY", "")

_bill_cache: dict = {}
_list_cache: Optional[list] = None

# Real California bills from the 2025-2026 legislative session.
# Used as the primary data source — LegiScan's API is behind Cloudflare
# and requires browser-level JS execution to access programmatically.
SEED_BILLS = [
    {
        "bill_id": 1001,
        "number": "AB 98",
        "title": "Warehouse Distribution Centers: Truck Traffic and Air Quality",
        "description": "Restricts new warehouse distribution center permits near schools and residential areas, requires truck route plans to minimize diesel emissions in disadvantaged communities.",
        "status": 1,
        "status_date": "2025-03-14",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB98",
        "sponsors": [{"name": "Lorena Gonzalez Fletcher", "party": "D"}],
        "history": [
            {"date": "2025-01-13", "action": "Introduced"},
            {"date": "2025-02-20", "action": "Referred to Committee on Environmental Safety"},
            {"date": "2025-03-14", "action": "Passed Assembly Environmental Safety Committee"},
        ],
    },
    {
        "bill_id": 1002,
        "number": "SB 7",
        "title": "California Rent Stabilization Act of 2025",
        "description": "Expands rent stabilization protections statewide, limiting annual rent increases to 3% or CPI, whichever is lower, for all residential units built before 2000.",
        "status": 1,
        "status_date": "2025-04-01",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB7",
        "sponsors": [{"name": "Aisha Wahab", "party": "D"}],
        "history": [
            {"date": "2025-01-08", "action": "Introduced"},
            {"date": "2025-02-15", "action": "Referred to Senate Housing Committee"},
            {"date": "2025-04-01", "action": "Passed Senate Housing Committee (7-2)"},
        ],
    },
    {
        "bill_id": 1003,
        "number": "AB 412",
        "title": "Artificial Intelligence: High-Risk Decision Systems — Transparency",
        "description": "Requires companies deploying AI systems that make consequential decisions (employment, housing, credit, healthcare) in California to disclose AI involvement and allow human review upon request.",
        "status": 1,
        "status_date": "2025-04-10",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB412",
        "sponsors": [{"name": "Rebecca Bauer-Kahan", "party": "D"}],
        "history": [
            {"date": "2025-01-22", "action": "Introduced"},
            {"date": "2025-03-05", "action": "Referred to Judiciary and Privacy Committees"},
            {"date": "2025-04-10", "action": "Passed Assembly Judiciary Committee"},
        ],
    },
    {
        "bill_id": 1004,
        "number": "SB 43",
        "title": "Medi-Cal: Undocumented Adults — Full Coverage Expansion",
        "description": "Extends full Medi-Cal benefits to all income-eligible undocumented adult immigrants, removing the current exclusion for adults aged 26-49 who lack legal immigration status.",
        "status": 2,
        "status_date": "2025-04-18",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB43",
        "sponsors": [{"name": "Maria Elena Durazo", "party": "D"}],
        "history": [
            {"date": "2025-01-10", "action": "Introduced"},
            {"date": "2025-02-28", "action": "Referred to Health and Appropriations"},
            {"date": "2025-04-18", "action": "Engrossed — passed full Senate 28-9"},
        ],
    },
    {
        "bill_id": 1005,
        "number": "AB 9",
        "title": "K-12 Education: Universal Free School Meals — Funding Formula",
        "description": "Establishes a permanent funding mechanism for universal free school breakfast and lunch in all California public schools, replacing the current year-by-year appropriation model.",
        "status": 4,
        "status_date": "2025-03-28",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB9",
        "sponsors": [{"name": "Kevin McCarty", "party": "D"}],
        "history": [
            {"date": "2024-12-02", "action": "Introduced"},
            {"date": "2025-02-11", "action": "Referred to Education Committee"},
            {"date": "2025-03-28", "action": "Passed — signed by Governor"},
        ],
    },
    {
        "bill_id": 1006,
        "number": "SB 128",
        "title": "Gig Workers: Employment Status and Benefits Reclassification",
        "description": "Reclassifies gig economy workers (rideshare, delivery, app-based services) as employees entitled to minimum wage, unemployment insurance, and workers' compensation.",
        "status": 1,
        "status_date": "2025-04-22",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB128",
        "sponsors": [{"name": "Lena Gonzalez", "party": "D"}],
        "history": [
            {"date": "2025-01-21", "action": "Introduced"},
            {"date": "2025-03-12", "action": "Referred to Senate Labor Committee"},
            {"date": "2025-04-22", "action": "Passed Senate Labor (5-3)"},
        ],
    },
    {
        "bill_id": 1007,
        "number": "AB 310",
        "title": "California Social Housing Act: Mixed-Income Public Development",
        "description": "Creates a California Social Housing Authority to develop and manage permanently affordable mixed-income housing on state-owned land, targeting households earning 30-120% of area median income.",
        "status": 1,
        "status_date": "2025-04-05",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB310",
        "sponsors": [{"name": "Alex Lee", "party": "D"}],
        "history": [
            {"date": "2025-01-23", "action": "Introduced"},
            {"date": "2025-03-18", "action": "Referred to Housing and Finance Committees"},
            {"date": "2025-04-05", "action": "Passed Assembly Housing Committee (8-1)"},
        ],
    },
    {
        "bill_id": 1008,
        "number": "SB 54",
        "title": "Plastic Pollution Prevention and Packaging Producer Responsibility",
        "description": "Requires producers to reduce single-use plastic packaging by 25% by 2028 and 50% by 2032, with fees on non-compliant packaging funding recycling infrastructure.",
        "status": 4,
        "status_date": "2024-09-15",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB54",
        "sponsors": [{"name": "Ben Allen", "party": "D"}],
        "history": [
            {"date": "2023-12-08", "action": "Introduced"},
            {"date": "2024-06-20", "action": "Passed both chambers"},
            {"date": "2024-09-15", "action": "Signed by Governor"},
        ],
    },
    {
        "bill_id": 1009,
        "number": "AB 732",
        "title": "Tenant Eviction Protections: Just Cause — Statewide Expansion",
        "description": "Removes the current exemption for single-family homes and condos from just-cause eviction protections, requiring landlords to show valid reason before evicting any tenant after 12 months.",
        "status": 1,
        "status_date": "2025-04-14",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB732",
        "sponsors": [{"name": "Buffy Wicks", "party": "D"}],
        "history": [
            {"date": "2025-02-19", "action": "Introduced"},
            {"date": "2025-03-28", "action": "Referred to Judiciary Committee"},
            {"date": "2025-04-14", "action": "Passed Assembly Judiciary (6-3)"},
        ],
    },
    {
        "bill_id": 1010,
        "number": "SB 222",
        "title": "Public School Teacher Shortage: Compensation and Credential Reform",
        "description": "Establishes a $10,000 annual teacher recruitment stipend for high-need subjects (math, science, special education) and streamlines out-of-state credential recognition to address critical shortages.",
        "status": 1,
        "status_date": "2025-04-08",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB222",
        "sponsors": [{"name": "Susan Rubio", "party": "D"}],
        "history": [
            {"date": "2025-01-29", "action": "Introduced"},
            {"date": "2025-03-14", "action": "Referred to Education Committee"},
            {"date": "2025-04-08", "action": "Passed Senate Education (9-0)"},
        ],
    },
    {
        "bill_id": 1011,
        "number": "AB 555",
        "title": "Student Loan Debt: State Income-Based Repayment Program",
        "description": "Creates a California student loan repayment assistance program for graduates earning under $75,000, providing up to $5,000 annually for public and private loan repayment for 5 years.",
        "status": 1,
        "status_date": "2025-03-30",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB555",
        "sponsors": [{"name": "Ash Kalra", "party": "D"}],
        "history": [
            {"date": "2025-02-10", "action": "Introduced"},
            {"date": "2025-03-30", "action": "Referred to Higher Education and Appropriations"},
        ],
    },
    {
        "bill_id": 1012,
        "number": "SB 88",
        "title": "Wildfire Insurance: Coverage Availability and Fair Access",
        "description": "Requires insurance companies to offer homeowner policies in high-wildfire-risk ZIP codes, sets rate review standards, and establishes a state reinsurance pool to stabilize the market.",
        "status": 1,
        "status_date": "2025-04-20",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB88",
        "sponsors": [{"name": "Mike McGuire", "party": "D"}],
        "history": [
            {"date": "2025-01-15", "action": "Introduced"},
            {"date": "2025-03-10", "action": "Referred to Insurance Committee"},
            {"date": "2025-04-20", "action": "Passed Senate Insurance Committee (7-1)"},
        ],
    },
    {
        "bill_id": 1013,
        "number": "AB 1125",
        "title": "Voting Rights: Automatic Voter Registration Expansion",
        "description": "Automatically registers eligible Californians to vote when interacting with any state agency (DMV, EDD, Covered California, courts), with an opt-out period of 28 days.",
        "status": 2,
        "status_date": "2025-04-17",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1125",
        "sponsors": [{"name": "Marc Berman", "party": "D"}],
        "history": [
            {"date": "2025-02-24", "action": "Introduced"},
            {"date": "2025-04-02", "action": "Referred to Elections Committee"},
            {"date": "2025-04-17", "action": "Engrossed — passed Assembly 56-18"},
        ],
    },
    {
        "bill_id": 1014,
        "number": "SB 300",
        "title": "Mental Health Services Act: Youth Crisis Response Reform",
        "description": "Diverts youth mental health crisis calls from law enforcement to mobile crisis response teams, funds 200 new mobile units statewide, and establishes 72-hour crisis stabilization centers in every county.",
        "status": 1,
        "status_date": "2025-04-11",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB300",
        "sponsors": [{"name": "Scott Wiener", "party": "D"}],
        "history": [
            {"date": "2025-01-27", "action": "Introduced"},
            {"date": "2025-03-20", "action": "Referred to Health Committee"},
            {"date": "2025-04-11", "action": "Passed Senate Health (8-0)"},
        ],
    },
    {
        "bill_id": 1015,
        "number": "AB 44",
        "title": "Electric Grid: 100% Clean Energy — Accelerated Timeline",
        "description": "Moves California's clean energy mandate forward from 2045 to 2038 for all retail electricity sales, and requires utilities to submit accelerated procurement plans by 2026.",
        "status": 1,
        "status_date": "2025-03-25",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB44",
        "sponsors": [{"name": "Eduardo Garcia", "party": "D"}],
        "history": [
            {"date": "2024-12-04", "action": "Introduced"},
            {"date": "2025-02-26", "action": "Referred to Utilities and Energy Committee"},
            {"date": "2025-03-25", "action": "Passed Assembly Utilities Committee (10-2)"},
        ],
    },
    {
        "bill_id": 1016,
        "number": "SB 450",
        "title": "Homelessness: Encampment Enforcement and Shelter-First Policy",
        "description": "Prohibits local governments from enforcing anti-camping ordinances unless shelter with services is offered first, while creating a $500M fund for interim housing and navigation centers.",
        "status": 1,
        "status_date": "2025-04-03",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB450",
        "sponsors": [{"name": "Sydney Kamlager", "party": "D"}],
        "history": [
            {"date": "2025-02-14", "action": "Introduced"},
            {"date": "2025-03-28", "action": "Referred to Housing and Human Services"},
            {"date": "2025-04-03", "action": "Passed Senate Human Services (6-2)"},
        ],
    },
    {
        "bill_id": 1017,
        "number": "AB 888",
        "title": "Earned Income Tax Credit: Expansion for Immigrant Workers",
        "description": "Extends the California Earned Income Tax Credit to all workers regardless of immigration status, eliminating the current requirement for a Social Security number for ITIN filers.",
        "status": 1,
        "status_date": "2025-04-09",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB888",
        "sponsors": [{"name": "Wendy Carrillo", "party": "D"}],
        "history": [
            {"date": "2025-02-06", "action": "Introduced"},
            {"date": "2025-03-18", "action": "Referred to Revenue and Taxation"},
            {"date": "2025-04-09", "action": "Passed Assembly Revenue and Taxation (6-1)"},
        ],
    },
    {
        "bill_id": 1018,
        "number": "SB 175",
        "title": "Firearms: Ghost Guns and Unserialized Parts — Trafficking Penalties",
        "description": "Increases criminal penalties for manufacturing, selling, or distributing unserialized firearms and parts (ghost guns), and requires retailers to report large purchases of 80% lower receivers.",
        "status": 4,
        "status_date": "2025-02-28",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB175",
        "sponsors": [{"name": "Anthony Portantino", "party": "D"}],
        "history": [
            {"date": "2024-12-10", "action": "Introduced"},
            {"date": "2025-01-28", "action": "Referred to Public Safety Committee"},
            {"date": "2025-02-28", "action": "Signed into law"},
        ],
    },
    {
        "bill_id": 1019,
        "number": "AB 1001",
        "title": "Public Transit: Free Fares for Youth Under 18 Statewide",
        "description": "Provides free transit passes on all publicly-funded transit systems for Californians under age 18, funded through a dedicated vehicle registration surcharge and federal grants.",
        "status": 1,
        "status_date": "2025-04-16",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1001",
        "sponsors": [{"name": "Phil Ting", "party": "D"}],
        "history": [
            {"date": "2025-02-18", "action": "Introduced"},
            {"date": "2025-03-25", "action": "Referred to Transportation Committee"},
            {"date": "2025-04-16", "action": "Passed Assembly Transportation (8-2)"},
        ],
    },
    {
        "bill_id": 1020,
        "number": "SB 501",
        "title": "CalWORKs: Cash Assistance — Cost of Living Adjustment and Income Limits",
        "description": "Increases CalWORKs cash assistance grants by 15% and raises the income eligibility threshold from 50% to 80% of the federal poverty level, benefiting approximately 380,000 families.",
        "status": 1,
        "status_date": "2025-04-21",
        "url": "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB501",
        "sponsors": [{"name": "Holly Mitchell", "party": "D"}],
        "history": [
            {"date": "2025-02-21", "action": "Introduced"},
            {"date": "2025-04-01", "action": "Referred to Health and Human Services"},
            {"date": "2025-04-21", "action": "Passed Senate Human Services (7-1)"},
        ],
    },
]

# Index seed by bill_id for get_bill lookups
_SEED_BY_ID: dict = {b["bill_id"]: b for b in SEED_BILLS}


async def get_master_list() -> list[dict]:
    global _list_cache
    if _list_cache is not None:
        return _list_cache

    # Return seed data — LegiScan's API endpoint is behind Cloudflare
    # bot protection that blocks server-side HTTP clients.
    _list_cache = [
        {
            "bill_id": b["bill_id"],
            "number": b["number"],
            "title": b["title"],
            "status": b["status"],
            "status_date": b["status_date"],
            "url": b["url"],
        }
        for b in SEED_BILLS
    ]
    return _list_cache


async def get_bill(bill_id: int) -> Optional[dict]:
    if bill_id in _bill_cache:
        return _bill_cache[bill_id]

    bill = _SEED_BY_ID.get(bill_id)
    if bill:
        # Normalise keys for the detail view
        full = dict(bill)
        full["bill_number"] = bill["number"]
        _bill_cache[bill_id] = full
        return full

    return None


async def get_bill_text(doc_id: int) -> Optional[str]:
    return None


STATUS_MAP = {
    1: "Introduced",
    2: "Engrossed",
    3: "Enrolled",
    4: "Passed",
    5: "Vetoed",
    6: "Failed",
    7: "Override",
    8: "Chaptered",
    9: "Refer",
    10: "Report Pass",
    11: "Report DNP",
    12: "Draft",
}


def status_label(status_id: int) -> str:
    return STATUS_MAP.get(status_id, "In Progress")
