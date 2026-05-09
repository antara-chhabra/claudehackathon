# BillMe

**AI-Powered Civic Intelligence Platform for California Voters**

> Built for the **Claude Builders Club Hackathon — Track 2: Governance & Collaboration**
> *"How can you help people participate in democracy, work together across differences, or make collective decisions better?"*

---

## The Problem

Most people have no idea what their state government is actually doing.

California passes hundreds of bills each session. Local news has largely collapsed. Legislation is written in dense legal language that takes a law degree to parse. Political media is polarized and tells you what to think rather than helping you understand. The result: a massive civic participation gap where only the loudest, most resourced voices shape policy — while everyone else sits it out.

**BillMe fixes this.** It is an AI civic copilot that translates California government activity into plain English, personalizes it to your life, and gives you the tools to actually participate.

We never tell you how to vote. We help you understand.

---

## What BillMe Does

| Feature | Description |
|---|---|
| **Personalized Policy Feed** | California bills filtered and sorted by relevance to your profession, renter/student/parent status, and selected interests |
| **Bill Detail Pages** | Full AI summary, "Explain Like I'm 15," who's affected, why it matters now |
| **How Does This Affect Me?** | AI analysis of personal impact based on your profile (teacher in San Diego, renter, parent, etc.) |
| **What Can I Do?** | Concrete civic actions you can take — contact your rep, attend a hearing, register to vote — with real links |
| **Multiple Perspectives** | Supporters and opponents, both explained fairly. No editorial spin. |
| **AI Chat** | Ask anything about a bill or civic topic. Pre-loaded with bill context. |
| **What's Brewing — Current News** | Real-time California political news from CalMatters, NYT, LA Times and more — with AI-generated civic interpretation |
| **What's Brewing — Current Bills** | Key bills this session analyzed in depth with stakeholder breakdown and impact assessment |
| **Full News Analysis** | Deep AI dive on any news story: policy context, stakeholder positions, short/long-term impact, uncertainty note |
| **Key Dates Timeline** | California 2026 election calendar with urgency indicators |
| **Civic Profile** | One-time onboarding stored entirely in your browser — never sent to a server |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A **Gemini API key** — free at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### API Keys

Only **one API key** is required: **Gemini**.

Open `backend/.env` and set it:

```env
GEMINI_API_KEY=your_gemini_api_key_here
LEGISCAN_API_KEY=81090f2533f45eebf29960d658828325
```

> The LegiScan key is included above as a placeholder — the app uses a hardcoded seed dataset of 20 real CA 2025–2026 bills, so this key is not actively used. The What's Brewing news feed uses free RSS feeds (Google News, CalMatters) and requires no API key.

### Run the Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

Verify it's running: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

App is live at: [http://localhost:3000](http://localhost:3000)

### Two-Terminal Quick Start

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with file-based routing, SSR, and streaming |
| **TypeScript** | Type safety across all components and API calls |
| **Tailwind CSS** | Utility-first styling with CSS custom properties for theming |
| **React Hooks** | `useState`, `useEffect`, `useRef` for all state and side effects |

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework for all API routes |
| **Google Gemini Flash Lite** (`gemini-flash-lite-latest`) | Powers all AI tasks — bill summarization, impact analysis, civic action generation, news interpretation, deep story analysis |
| **`google-generativeai` SDK** | Google's Python SDK for Gemini — version `0.8.3` |
| **`asyncio` + `run_in_executor`** | Wraps Gemini's blocking `generate_content()` calls for async-safe FastAPI compatibility |
| **httpx** | Async HTTP client for RSS feed fetching |
| **Python `xml.etree`** | Standard library RSS/XML parser — no extra dependencies |
| **python-dotenv** | Loads `GEMINI_API_KEY` from `.env` |
| **Pydantic** | Request/response validation and serialization |

### Data Sources

| Source | What it provides |
|---|---|
| **Hardcoded seed dataset** | 20 real California 2025–2026 bills (AB 98, SB 7, AB 412, SB 43, AB 9, SB 128, AB 310, SB 54, AB 732, SB 222, and more) |
| **Google News RSS** | Free, real-time California election and politics news — no API key required |
| **CalMatters RSS** | California-focused political journalism RSS feed — no API key required |
| **CA Legislature** | Bill text URLs link to `leginfo.legislature.ca.gov` |
| **Browser localStorage** | User's civic profile — never leaves their device |

> **Why not the LegiScan live API?** LegiScan's API is protected by Cloudflare and returns a 403 for all server-side HTTP clients. The seed dataset covers the 20 most policy-significant CA bills of the 2025–2026 session.

> **Why not NewsAPI.ai?** The key-based API returned irrelevant articles (its keyword search matches body text, not titles). Google News RSS and CalMatters RSS are free, reliable, and return genuinely relevant California political news.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Next.js Frontend (port 3000)            │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  Dashboard │  │ Bill Detail  │  │  What's Brewing  │  │   │
│  │  │  /dashboard│  │ /policy/[id] │  │  /brewing        │  │   │
│  │  └────────────┘  └──────────────┘  └─────────────────┘  │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  Ask AI    │  │  Key Dates   │  │  Onboarding     │  │   │
│  │  │  /chat     │  │  /timeline   │  │  /onboarding    │  │   │
│  │  └────────────┘  └──────────────┘  └─────────────────┘  │   │
│  │                                                          │   │
│  │  localStorage ──► CivicProfile (profession, county,     │   │
│  │                                 interests, renter, etc) │   │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │ fetch() REST calls               │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (port 8000)                     │
│                                                                 │
│  Routes:                                                        │
│  GET  /api/policies          ──► Seed dataset (20 CA bills)     │
│  GET  /api/policy/{id}       ──► Bill detail + AI summary       │
│  POST /api/policy/{id}/impact ─► Gemini: personalized impact    │
│  POST /api/policy/{id}/action ─► Gemini: civic action items     │
│  POST /api/chat              ──► Gemini: conversational chat     │
│  GET  /api/brewing           ──► RSS news + bill stories        │
│  POST /api/brewing/{id}/analyze ► Gemini: deep story analysis   │
│  GET  /api/timeline          ──► CA 2026 election dates         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               services/claude_ai.py                      │   │
│  │  (all Gemini calls live here)                            │   │
│  │                                                          │   │
│  │  summarize_bill()          → summary, ELI15, groups      │   │
│  │  personalize_impact()      → profile-aware analysis      │   │
│  │  what_can_i_do()           → 4 civic action items        │   │
│  │  chat()                    → multi-turn conversation      │   │
│  │  summarize_news_articles() → insight_summary + bullets   │   │
│  │  analyze_brewing_story()   → structured deep analysis    │   │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌────────────────────────────────────────────────┐
│         Google Gemini Flash Lite API           │
│         (gemini-flash-lite-latest)             │
│                                                │
│  All prompts include nonpartisan system        │
│  instruction — never tells users how to vote  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              Free RSS Sources                  │
│                                                │
│  Google News RSS (California politics/gov)     │
│  CalMatters RSS  (CA political journalism)     │
│                                                │
│  Fetched by backend on first load, cached      │
│  for the session. No API key required.         │
└────────────────────────────────────────────────┘
```

---

## File Structure

```
claudehackathon/
│
├── backend/
│   ├── main.py                    # FastAPI app entrypoint, CORS, route registration
│   ├── .env                       # API keys (GEMINI_API_KEY) — git-ignored
│   ├── requirements.txt           # Python dependencies
│   │
│   ├── routes/
│   │   ├── policies.py            # Bill list, detail, /impact, /action endpoints
│   │   ├── chat.py                # /chat endpoint — routes to Gemini
│   │   ├── brewing.py             # /brewing — RSS fetching, bill stories, /analyze
│   │   └── timeline.py            # /timeline — CA 2026 election dates
│   │
│   └── services/
│       ├── claude_ai.py           # All Gemini AI functions (async wrappers)
│       └── legiscan.py            # 20-bill CA seed dataset (replaces live API)
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   │
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root layout with NavBar
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Personalized bill feed with relevance tags
│   │   ├── policy/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Bill detail: AI summary, CTAs, chat, history
│   │   ├── brewing/
│   │   │   ├── page.tsx           # What's Brewing: Current News + Current Bills tabs
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Story detail: full analysis + AI chat
│   │   ├── chat/
│   │   │   └── page.tsx           # Standalone civic AI chat
│   │   ├── timeline/
│   │   │   └── page.tsx           # CA 2026 election key dates
│   │   └── onboarding/
│   │       └── page.tsx           # Civic profile creation
│   │
│   ├── components/
│   │   ├── NavBar.tsx             # Top navigation
│   │   ├── PolicyCard.tsx         # Bill card with relevance tags
│   │   ├── ChatInterface.tsx      # Reusable chat — used on bill pages, news detail, /chat
│   │   └── PerspectivesPanel.tsx  # Supporters vs opponents panel
│   │
│   └── lib/
│       ├── api.ts                 # All fetch() calls to FastAPI backend
│       ├── types.ts               # TypeScript interfaces (shared across app)
│       └── profile.ts             # localStorage read/write helpers
│
└── README.md
```

---

## API Reference

### Policies

| Endpoint | Method | Description |
|---|---|---|
| `/api/policies` | `GET` | Returns all 20 CA bills with status, date, sponsor |
| `/api/policy/{id}` | `GET` | Full bill detail + Gemini AI summary |
| `/api/policy/{id}/impact` | `POST` | Personalized impact analysis. Body: `CivicProfile` |
| `/api/policy/{id}/action` | `POST` | 4 civic action items. Body: `CivicProfile` |

### Chat

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | `POST` | AI chat. Body: `{ messages, bill_id?, profile? }` |

### What's Brewing

| Endpoint | Method | Description |
|---|---|---|
| `/api/brewing` | `GET` | Returns `{ bills: [...], news: [...] }` |
| `/api/brewing/{id}/analyze` | `POST` | Deep structured analysis of a story |

### Other

| Endpoint | Method | Description |
|---|---|---|
| `/api/timeline` | `GET` | CA 2026 election dates |
| `/api/health` | `GET` | Health check |

### CivicProfile body shape

```json
{
  "profession": "teacher",
  "county": "San Diego",
  "is_renter": true,
  "is_student": false,
  "is_parent": true,
  "interests": ["Education", "Housing & Rent", "Healthcare"]
}
```

---

## How Personalization Works

The policy feed is filtered (not just sorted) to only show bills matching your profile:

1. **Interest areas** — you select from 10 categories (Housing & Rent, Education, Healthcare, Environment & Climate, Public Safety, Economy & Jobs, Immigration, Transportation, Technology & Privacy, Voting Rights). Each maps to a keyword set matched against bill titles and descriptions.

2. **Profession** — common professions (teacher, nurse, engineer, lawyer, social worker, etc.) each have keyword lists. Bills mentioning relevant terms surface with a "For teachers" tag.

3. **Life situation** — renter, student, and parent flags each match against their relevant bill language.

Bills are sorted by number of matching tags. If a user has no profile, all 20 bills are shown. The "Update interests" link appears when results are filtered.

---

## How What's Brewing Works

**Current News tab:**
1. Backend fetches from two free RSS feeds: Google News RSS (California politics/election 2026 queries) and CalMatters RSS
2. Articles are deduplicated by title
3. Top 15 are sent to Gemini Flash Lite with a prompt to: select the 5–8 most civic-relevant, generate a 2–4 sentence civic insight summary (not a headline rewrite), and produce 4 "Why This Matters" bullets (who's affected, policy domain, civic impact, election relevance)
4. Gemini returns structured JSON; server merges back the original title, source, URL, and date
5. Results cached for the session

**Current Bills tab:**
5 pre-analyzed bills from the seed dataset with detailed civic context — used as a stable reference regardless of news cycle.

**Full Analysis (detail page):**
Gemini produces a structured 5-section deep dive: Summary, Policy & Civic Context, Stakeholder Breakdown (supporters vs opponents with colored panels), Potential Impact (short-term and long-term), and an Uncertainty Note.

---

## Ethical Design

BillMe was built with the hackathon's ethical considerations at its core:

**Nonpartisan by design.** Every Gemini prompt includes a system instruction: *"Never tell users how to vote or which party/candidate is better."* The Perspectives panel always shows both sides. No editorial weighting.

**Centering underrepresented voices.** The personalization layer specifically surfaces how policies affect renters, gig workers, students, parents, and immigrants — groups often excluded from civic discourse even though they're most affected by legislation.

**Factual humility.** Where empirical claims are contested, the AI is instructed to acknowledge uncertainty. Every "Full Analysis" includes an explicit Uncertainty Note.

**Privacy first.** The civic profile lives entirely in the user's `localStorage`. Nothing is stored server-side. Only the current query is sent to Gemini — no profile data is retained.

**Transparent sourcing.** Every bill links to the official CA Legislature text. Every news story links to the original article. AI-generated content is always labeled as such.

---

## Demo Flow

Walk through this sequence to show the full system:

1. **Homepage** — see the civic pitch and feature overview
2. **Create Profile** → `/onboarding` — enter "Teacher, San Diego County, Renter, Parent" + select Education and Housing
3. **Dashboard** → `/dashboard` — bills tagged "Relevant to teachers", "Affects renters", "Affects parents" appear first; unrelated bills are filtered out
4. **Open a bill** → e.g., SB 222 (Teacher Shortage) — AI summary, ELI15, who's affected
5. **"How does this affect me?"** — personalized impact analysis for a teacher in San Diego
6. **"What can I do?"** — civic action items with real links (Find My Rep, View Bill, Register to Vote)
7. **Ask AI** — type *"What does this mean for public school teachers in San Diego?"*
8. **What's Brewing → Current News** — real articles from NYT, LA Times, CalMatters with AI civic context
9. **Read Full Analysis** on a news story — 5-section deep dive + AI chat pre-loaded with article context
10. **What's Brewing → Current Bills** — SB 7 rent stabilization, AB 412 AI transparency, etc. with full analysis
11. **Key Dates** → `/timeline` — countdown to CA 2026 primary and general elections

---

## Local Development Notes

- The frontend defaults to `http://localhost:8000` for the API. Override with `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
- On first load, the What's Brewing news tab fetches RSS and runs Gemini — this takes ~5–10 seconds. Subsequent loads are instant (cached for the session).
- Bill AI summaries are generated on first access to each bill detail page. Subsequent visits use the route-level cache.
- Gemini calls use `asyncio.get_event_loop().run_in_executor()` to avoid blocking FastAPI's event loop — Gemini's `generate_content()` is synchronous.
- The confirmed working model is `gemini-flash-lite-latest`. `gemini-1.5-flash` and `gemini-2.0-flash` are not available on the free tier at the tested quota level.

---

Built by **Antara and Mohammad**
