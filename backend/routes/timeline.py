from fastapi import APIRouter

router = APIRouter()

# California 2026 election dates — publicly known civic info
CA_TIMELINE = [
    {
        "id": 1,
        "date": "2026-02-17",
        "title": "Voter Registration Deadline (Primary)",
        "description": "Last day to register to vote for the June 2026 California Primary Election.",
        "type": "registration",
        "urgent": False,
    },
    {
        "id": 2,
        "date": "2026-05-11",
        "title": "Vote-by-Mail Ballots Mailed",
        "description": "County election offices begin mailing ballots to all registered voters.",
        "type": "mail",
        "urgent": False,
    },
    {
        "id": 3,
        "date": "2026-05-23",
        "title": "Early Voting Begins",
        "description": "In-person early voting opens at vote centers across California counties.",
        "type": "voting",
        "urgent": False,
    },
    {
        "id": 4,
        "date": "2026-06-02",
        "title": "California Primary Election",
        "description": "Primary Election Day for statewide offices including Governor, U.S. Senate, and legislative seats.",
        "type": "election",
        "urgent": True,
    },
    {
        "id": 5,
        "date": "2026-09-22",
        "title": "General Election Registration Deadline",
        "description": "Last day to register for the November 2026 General Election.",
        "type": "registration",
        "urgent": False,
    },
    {
        "id": 6,
        "date": "2026-10-05",
        "title": "Vote-by-Mail Ballots Mailed (General)",
        "description": "County offices mail ballots for the General Election to all registered voters.",
        "type": "mail",
        "urgent": False,
    },
    {
        "id": 7,
        "date": "2026-10-19",
        "title": "Early Voting Begins (General)",
        "description": "In-person early voting opens at vote centers across California.",
        "type": "voting",
        "urgent": False,
    },
    {
        "id": 8,
        "date": "2026-11-03",
        "title": "California General Election",
        "description": "General Election Day. All California statewide and local offices on the ballot.",
        "type": "election",
        "urgent": True,
    },
    {
        "id": 9,
        "date": "2026-12-01",
        "title": "Election Results Certification Deadline",
        "description": "California Secretary of State certifies the official results of the General Election.",
        "type": "results",
        "urgent": False,
    },
]


@router.get("/timeline")
async def get_timeline():
    return {"timeline": CA_TIMELINE}
