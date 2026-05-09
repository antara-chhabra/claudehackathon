import google.generativeai as genai
import os
import json
import asyncio
from functools import partial

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-flash-lite-latest"

CIVIC_SYSTEM = """You are BillMe's nonpartisan AI civic assistant. You help everyday Californians understand legislation and democratic processes.

Rules:
- Never tell users how to vote or which party/candidate is better
- Present balanced perspectives when issues are contested
- Use plain, accessible language — avoid legal jargon
- Be factual and cite the bill text/description when reasoning
- Acknowledge genuine factual uncertainty where it exists
- For contested empirical claims, say so rather than picking a side
- Keep responses concise and focused on civic understanding"""


def _gemini_model(extra_instruction: str = "") -> genai.GenerativeModel:
    instruction = CIVIC_SYSTEM
    if extra_instruction:
        instruction += f"\n\n{extra_instruction}"
    return genai.GenerativeModel(model_name=MODEL, system_instruction=instruction)


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


def _bill_context(bill: dict) -> str:
    title = bill.get("title", "")
    number = bill.get("bill_number", bill.get("number", ""))
    description = bill.get("description", "")
    sponsors = bill.get("sponsors", [])
    sponsor_names = ", ".join(s.get("name", "") for s in sponsors[:3]) if sponsors else "Unknown"
    return f"Bill: {number} — {title}\nDescription: {description}\nSponsors: {sponsor_names}"


async def _gen(model: genai.GenerativeModel, prompt: str) -> str:
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, partial(model.generate_content, prompt))
    return response.text


async def _chat_gen(chat_session, message: str) -> str:
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, partial(chat_session.send_message, message))
    return response.text


async def summarize_bill(bill: dict, bill_text: str = "") -> dict:
    context = _bill_context(bill)
    if bill_text:
        context += f"\n\nBill text excerpt:\n{bill_text[:4000]}"

    prompt = f"""Analyze this California bill and return a JSON object with these exact keys:
- "summary": 2-3 sentence plain English summary of what the bill does
- "eli15": 1-2 sentence explanation a 15-year-old would understand
- "affected_groups": array of 3-5 strings naming groups most affected (e.g. "renters", "teachers", "small business owners")
- "why_it_matters": one sentence on why this matters right now
- "supporters_argue": 1-2 sentences on the main argument supporters make
- "opponents_argue": 1-2 sentences on the main argument opponents make

Return only valid JSON, no markdown fences.

{context}"""

    try:
        text = _strip_fences(await _gen(_gemini_model(), prompt))
        return json.loads(text)
    except Exception:
        return {
            "summary": bill.get("description", "No summary available."),
            "eli15": "This bill changes how California handles a specific policy area.",
            "affected_groups": ["California residents"],
            "why_it_matters": "This bill is currently being debated in the California legislature.",
            "supporters_argue": "Supporters believe this will improve outcomes for Californians.",
            "opponents_argue": "Opponents raise concerns about implementation and unintended effects.",
        }


async def personalized_impact(bill: dict, profile: dict, bill_text: str = "") -> str:
    context = _bill_context(bill)
    profile_str = json.dumps(profile, indent=2)

    # Build a human-readable profile description
    parts = []
    if profile.get("profession"):
        parts.append(f"a {profile['profession']}")
    if profile.get("county"):
        parts.append(f"living in {profile['county']} County")
    if profile.get("is_renter"):
        parts.append("who rents their home")
    if profile.get("is_student"):
        parts.append("who is a student")
    if profile.get("is_parent"):
        parts.append("who has children")
    if profile.get("interests"):
        parts.append(f"interested in {', '.join(profile['interests'][:3])}")
    profile_desc = ", ".join(parts) or "a California resident"

    prompt = f"""The user is {profile_desc}.

Given this California bill, write 3-4 sentences explaining how this bill could personally affect someone with this background. Be specific and concrete. If the connection is indirect, still explain it. Do not tell them how to vote.

{context}"""

    try:
        return (await _gen(_gemini_model(), prompt)).strip()
    except Exception:
        return f"This bill could affect you as {profile_desc}. Review the full bill text at the link above for details specific to your situation."


async def what_can_i_do(bill: dict, profile: dict) -> list[dict]:
    context = _bill_context(bill)
    bill_number = bill.get("bill_number", bill.get("number", ""))
    county = profile.get("county", "your county")

    prompt = f"""The user wants to take civic action on this California bill. Return a JSON array of 4 specific actions they can take. Each action must have:
- "icon": an emoji
- "title": short action title (5 words max)
- "description": one sentence describing the specific action, mentioning {county} County or California where relevant
- "link": a real URL (use leginfo.legislature.ca.gov, findyourrep.legislature.ca.gov, sos.ca.gov, or registertovote.ca.gov)
- "link_text": short button label like "Find My Rep →"

Return only valid JSON array, no markdown.

{context}"""

    try:
        text = _strip_fences(await _gen(_gemini_model(), prompt))
        return json.loads(text)
    except Exception:
        return [
            {
                "icon": "✉️",
                "title": "Contact Your Representative",
                "description": f"Find and message your {county} County assembly member about this bill.",
                "link": "https://findyourrep.legislature.ca.gov",
                "link_text": "Find My Rep →",
            },
            {
                "icon": "📋",
                "title": "Read the Full Bill",
                "description": f"Review the official text of {bill_number} on the CA Legislature website.",
                "link": bill.get("url", "https://leginfo.legislature.ca.gov"),
                "link_text": "View Bill →",
            },
            {
                "icon": "🗳️",
                "title": "Register to Vote",
                "description": "Make sure you're registered so your voice counts in the next election.",
                "link": "https://registertovote.ca.gov",
                "link_text": "Register →",
            },
            {
                "icon": "📢",
                "title": "Share This Bill",
                "description": "Spread awareness about this issue in your community.",
                "link": "https://leginfo.legislature.ca.gov",
                "link_text": "Share Info →",
            },
        ]


async def chat(messages: list[dict], bill_context: str = "", user_profile: dict = None) -> str:
    extra = ""
    if bill_context:
        extra += f"Current bill context:\n{bill_context}\n"
    if user_profile:
        extra += f"User profile for personalization:\n{json.dumps(user_profile)}"

    model = _gemini_model(extra)

    history = []
    for m in messages[:-1]:
        history.append({
            "role": "user" if m["role"] == "user" else "model",
            "parts": [m["content"]],
        })

    chat_session = model.start_chat(history=history)
    last_message = messages[-1]["content"] if messages else ""
    try:
        return (await _chat_gen(chat_session, last_message)).strip()
    except Exception as e:
        raise RuntimeError(f"Gemini chat failed: {e}") from e


async def summarize_news_articles(articles: list[dict]) -> list[dict]:
    if not articles:
        return []

    top = articles[:10]
    lookup = []
    articles_text_parts = []
    for i, a in enumerate(top):
        src = a.get("source", {})
        source_name = src.get("title", "") if isinstance(src, dict) else str(src)
        url = a.get("url", "")
        title = a.get("title", "")
        body = a.get("body", a.get("description", ""))[:400]
        raw_date = a.get("dateTime", a.get("publishedAt", ""))
        published_date = raw_date[:10] if raw_date else ""
        lookup.append({"title": title, "url": url, "source": source_name, "published_date": published_date})
        articles_text_parts.append(
            f"[{i}] Title: {title}\nSource: {source_name}\nDate: {published_date}\nURL: {url}\nContent: {body}"
        )
    articles_text = "\n\n".join(articles_text_parts)

    prompt = f"""These are real California politics news articles. Pick the 5 most civic-relevant and return a JSON array.

For each selected article return an object with:
- "index": integer — the article number from the list
- "insight_summary": string — 2-4 sentences explaining what this means in civic terms. DO NOT copy or rewrite the headline. Focus on WHY it matters for California voters.
- "why_it_matters": array of exactly 4 short strings — one each covering: (1) who is affected, (2) what policy domain it relates to, (3) civic or political impact, (4) connection to upcoming elections or legislation
- "category": one of: "Education", "Housing", "Healthcare", "Environment", "Economy", "Public Safety", "Voting Rights", "Transportation", "Technology", "Other"

Return only valid JSON array, no markdown, no explanation.

Articles:
{articles_text}"""

    try:
        text = _strip_fences(await _gen(_gemini_model(), prompt))
        parsed = json.loads(text)
        result = []
        for item in parsed:
            idx = item.get("index")
            if idx is None or not isinstance(idx, int) or idx >= len(lookup):
                continue
            meta = lookup[idx]
            result.append({
                "headline": meta["title"],
                "url": meta["url"],
                "source": meta["source"],
                "published_date": meta["published_date"],
                "insight_summary": item.get("insight_summary", ""),
                "why_it_matters": item.get("why_it_matters", []),
                "category": item.get("category", "Other"),
                "bill_number": "",
                "bill_id": None,
            })
        return result
    except Exception:
        return []


async def analyze_brewing_story(story: dict) -> dict:
    headline = story.get("headline", "")
    insight_summary = story.get("insight_summary", "")
    why_it_matters = story.get("why_it_matters", [])
    category = story.get("category", "")
    source = story.get("source", "")

    prompt = f"""You are a nonpartisan civic analyst. Write a deep analysis of this California news story and return it as a JSON object.

Story: {headline}
Category: {category}
Source: {source}
Civic context: {insight_summary}
Key points: {', '.join(why_it_matters)}

Return a JSON object with exactly these keys:
- "summary": string — 1 detailed paragraph expanding on what is happening and why it is significant for California right now
- "policy_context": string — 1-2 paragraphs on the policy background: relevant prior legislation, budget history, or political dynamics that explain how California arrived at this moment
- "stakeholders": object with:
    - "supporters": string — 2-3 sentences on who supports this position and their main arguments
    - "opponents": string — 2-3 sentences on who opposes this and their main arguments
- "impact": object with:
    - "short_term": string — concrete changes expected in the next 6-12 months if this advances
    - "long_term": string — broader 3-5 year implications for California residents
- "uncertainty_note": string — 1 sentence acknowledging what is still unclear, contested, or evolving about this issue

Be balanced, factual, and accessible. Do not tell people how to vote or which side is correct.
Return only valid JSON, no markdown fences, no extra text."""

    try:
        text = _strip_fences(await _gen(_gemini_model(), prompt))
        return json.loads(text)
    except Exception:
        return {
            "summary": f"This story covers {category} policy in California. {insight_summary}",
            "policy_context": "Policy background is temporarily unavailable. Review the original article for full context.",
            "stakeholders": {
                "supporters": "Stakeholder analysis is temporarily unavailable.",
                "opponents": "Stakeholder analysis is temporarily unavailable.",
            },
            "impact": {
                "short_term": "Short-term impact analysis is temporarily unavailable.",
                "long_term": "Long-term impact analysis is temporarily unavailable.",
            },
            "uncertainty_note": "This analysis is based on available information and may be incomplete as the story develops.",
        }
