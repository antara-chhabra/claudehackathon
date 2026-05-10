# BillMe

**AI-Powered Civic Intelligence Platform for California Voters**

> Built for the **Claude Builders Club Hackathon — Track 2: Governance & Collaboration**

---

## Demo

[BillMe Demo](https://youtu.be/HwfJybChDaw?si=TgqW1AckR_d9QsUI)

---

## The Problem

California passes hundreds of bills each session — and most of them go unread by the people they affect.

Legislation is written in technical legal language that's hard to parse without a background in law or policy. Most people don't have the time to track what's moving through the legislature, what it means for their daily lives, or what they can do about it.

**BillMe makes that easier.** It uses AI to translate California bills and political news into plain English, surfaces the ones most relevant to your life, and shows you concrete ways to engage.

---

## Features

| Feature | Description |
|---|---|
| **Personalized Policy Feed** | California bills filtered and sorted by relevance to your profession, life situation, and interests |
| **Bill Detail Pages** | AI summary, plain-language explanation, stakeholder breakdown, and civic actions |
| **How Does This Affect Me?** | Personalized impact analysis based on your profile |
| **What Can I Do?** | Concrete civic actions with real links — contact your rep, view the bill, register to vote |
| **Multiple Perspectives** | Supporters and opponents presented fairly |
| **AI Chat** | Ask anything about a bill or civic topic |
| **What's Brewing** | California political news and key bills, with AI-generated civic context |
| **Key Dates Timeline** | California 2026 election calendar |
| **Civic Profile** | One-time onboarding stored in your browser — never sent to a server |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Gemini API key — [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Setup

**1. Add your API key**

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**2. Start the backend**

```bash
cd backend
source venv/bin/activate        # Mac/Linux
uvicorn main:app --reload --port 8000
```

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). The backend health check is at [http://localhost:8000/api/health](http://localhost:8000/api/health).

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with file-based routing and route groups |
| **TypeScript** | Type safety across all components and API calls |
| **Tailwind CSS** | Utility-first styling with CSS custom properties for theming |
| **Lucide React** | Icon library |
| **Instrument Serif** | Google Font for editorial headings |

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **Google Gemini Flash Lite** (`gemini-flash-lite-latest`) | All AI tasks — summarization, impact analysis, chat, news interpretation |
| **`google-generativeai`** | Google's Python SDK for Gemini |
| **httpx** | Async HTTP client for RSS feed fetching |
| **python-dotenv** | Environment variable loading |
| **Pydantic** | Request/response validation |

### Data Sources

| Source | What it provides |
|---|---|
| **Bill seed dataset** | 20 real California 2025–2026 bills |
| **Google News RSS** | Real-time California politics and election news |
| **CalMatters RSS** | California political journalism |
| **CA Legislature** | Official bill text via `leginfo.legislature.ca.gov` |

---

## File Structure

```
claudehackathon/
│
├── backend/
│   ├── main.py                    # FastAPI app entrypoint, CORS, route registration
│   ├── .env                       # GEMINI_API_KEY — git-ignored
│   ├── requirements.txt
│   ├── venv/
│   │
│   ├── routes/
│   │   ├── policies.py            # Bill list, detail, /impact, /action endpoints
│   │   ├── chat.py                # /chat endpoint
│   │   ├── brewing.py             # /brewing — RSS fetching, bill stories, /analyze
│   │   └── timeline.py            # /timeline — CA 2026 election dates
│   │
│   └── services/
│       ├── claude_ai.py           # All Gemini AI functions
│       └── legiscan.py            # CA bill seed dataset
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # CSS custom properties and theming
│   │   │
│   │   └── (platform)/            # Route group — shared NavBar layout
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── policy/[id]/page.tsx
│   │       ├── brewing/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── chat/page.tsx
│   │       ├── timeline/page.tsx
│   │       └── onboarding/page.tsx
│   │
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── PolicyCard.tsx
│   │   ├── ChatInterface.tsx
│   │   └── PerspectivesPanel.tsx
│   │
│   └── lib/
│       ├── api.ts                 # Fetch calls to the backend
│       ├── types.ts               # Shared TypeScript interfaces
│       └── profile.ts             # localStorage helpers for CivicProfile
│
└── README.md
```

The `(platform)` folder is a Next.js [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — it applies a shared layout (NavBar + content wrapper) to all platform pages without affecting their URLs.

---

## API Reference

### Policies

| Endpoint | Method | Description |
|---|---|---|
| `/api/policies` | `GET` | All CA bills |
| `/api/policy/{id}` | `GET` | Bill detail with AI summary |
| `/api/policy/{id}/impact` | `POST` | Personalized impact. Body: `CivicProfile` |
| `/api/policy/{id}/action` | `POST` | Civic action items. Body: `CivicProfile` |

### Chat

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | `POST` | AI chat. Body: `{ messages, bill_id?, profile? }` |

### What's Brewing

| Endpoint | Method | Description |
|---|---|---|
| `/api/brewing` | `GET` | `{ bills: [...], news: [...] }` |
| `/api/brewing/{id}/analyze` | `POST` | Deep analysis of a story |

### Other

| Endpoint | Method | Description |
|---|---|---|
| `/api/timeline` | `GET` | CA 2026 election dates |
| `/api/health` | `GET` | Health check |

### CivicProfile shape

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

## Design System

BillMe uses a California Heritage Modernism palette — warm and editorial, inspired by mission architecture and print design.

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FDFBF7` | Page background |
| `--foreground` | `#3D2B1F` | Body text |
| `--accent` | `#D4AF37` | Gold highlights |
| `--card-border` | `#E0D4C0` | Dividers and card outlines |
| `--muted` | `#7A6352` | Secondary text |
| Heritage Maroon | `#631212` | Headings, buttons, logo |

Typography: **Instrument Serif** (italic headings) + **Inter** (body).

---

## Ethical Design

**Nonpartisan.** Every AI prompt instructs the model never to tell users how to vote or favor any party. The Perspectives panel always presents both sides.

**Privacy first.** The civic profile is stored in `localStorage` only. Nothing is retained server-side between requests.

**Transparent sourcing.** Every bill links to the official CA Legislature text. Every news story links to the original article. AI output is always labeled.

---

## Demo Flow

1. **Landing page** — scroll through feature sections
2. **Build Your Profile** → `/onboarding` — e.g. Teacher, San Diego, Renter, Parent
3. **Dashboard** → `/dashboard` — bills filtered and tagged to your profile
4. **Open a bill** — AI summary, ELI15, who's affected
5. **"How does this affect me?"** — personalized impact for your profile
6. **"What can I do?"** — civic action items with real links
7. **Ask AI** — conversational follow-up on any bill
8. **What's Brewing → News** — California political news with AI civic context
9. **Full Analysis** — deep dive on a story with stakeholder breakdown
10. **What's Brewing → Bills** — key session bills with structured analysis
11. **Key Dates** → `/timeline` — CA 2026 election calendar

---

Built by **Antara and Mohammad**
