<div align="center">

# TasteBridge

### Will your brand land in Vietnam? Find out before you sign the lease.

**TasteBridge is an AI market-entry analyst for foreign consumer brands entering Vietnam.**
Eleven specialist agents reason over **Qloo Taste AI** evidence and return a **GO / PILOT / NO-GO** verdict, with confidence, affinity scores, audience segments, competitors, risks, launch partners, a neighborhood heat map and a market-entry memo, in English or Vietnamese.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Qloo Taste AI](https://img.shields.io/badge/Powered%20by-Qloo%20Taste%20AI-6C3CE1)](https://www.qloo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Base44](https://img.shields.io/badge/Built%20on-Base44-111111)](https://base44.com/)
[![Deno](https://img.shields.io/badge/Backend-Deno-000000?logo=deno&logoColor=white)](https://deno.com/)
[![EN/VI](https://img.shields.io/badge/i18n-EN%20%7C%20VI-DA251D)](#)
[![CI](https://github.com/ducvuathuduc/tastebridge/actions/workflows/ci.yml/badge.svg)](https://github.com/ducvuathuduc/tastebridge/actions/workflows/ci.yml)

**[Live demo](https://taste-bridge-vietnam.base44.app)** · **[Devpost](https://devpost.com/software/tastebridge-t2ygxn)** · **[Architecture](docs/ARCHITECTURE.md)** · **[Agents](docs/AGENTS.md)** · **[API](docs/API.md)** · **[Tiếng Việt](README.vi.md)**

*Entry for the Qloo Agentic Hackathon.*

</div>

---

## Contents

- [Screenshots](#screenshots)
- [The problem](#the-problem)
- [What TasteBridge does](#what-tastebridge-does)
- [The 11 agents](#the-11-agents)
- [Architecture](#architecture)
- [Qloo integration](#qloo-integration)
- [Data honesty policy](#data-honesty-policy)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Roadmap](#roadmap)
- [Business model](#business-model)
- [Team](#team)
- [License](#license)

## Screenshots

> These captures come from the v0.1 prototype (Oct 14, 2026). The live Base44 app at [taste-bridge-vietnam.base44.app](https://taste-bridge-vietnam.base44.app) runs the same analysis flow with a redesigned interface.

| Landing | Agents at work |
|---|---|
| ![Landing page: one question, one click to analyse a brand](docs/screenshots/landing.png) | ![Agent timeline while the eleven agents run](docs/screenshots/analyze-live.png) |
| **Landing:** one question, one click to start an analysis. | **Agent run:** each specialist agent reports as the pipeline progresses. |

| Verdict and evidence | Opportunity index | Mobile |
|---|---|---|
| ![Verdict, affinity scores, heat map and evidence](docs/screenshots/analyze-result.png) | ![City-level opportunity index](docs/screenshots/opportunity-index.png) | ![Mobile landing](docs/screenshots/mobile-landing.png) |
| **Result:** verdict, affinity, neighborhood heat map, risks and the Qloo evidence behind them. | **Opportunity index:** one number per city, consistent with the verdict. | **Mobile:** the full flow works on a phone. |

## The problem

Foreign food, beverage and consumer brands look at Vietnam (100M people, a young urban middle class, fast-growing cafe and retail culture) and ask the same question: *will people here actually like us?*

Today the answer costs weeks of consultant time and a five-figure invoice, or it is a guess made after a lease is signed. The data that matters most, **what local consumers' tastes connect to**, is rarely in a market report. Brands that guess wrong pay for it with a closed store in year one.

## What TasteBridge does

TasteBridge turns that question into a structured, evidence-backed decision in about a minute, and then helps the brand act on it.

### 1. Analysis (live)
Pick a city (Ho Chi Minh City, Hanoi, Da Nang) and a category (F&B, coffee & tea, fashion, beauty, electronics, wellness, home & living), type the brand name. The backend pulls taste evidence from Qloo, then runs eleven specialist agents over it.

### 2. Verdict (live)
A **GO / PILOT / NO-GO** call with confidence (0–100), an opportunity index, affinity scores (overall, cultural, audience, competition, price), top consumer segments, named competitors with threat level, risks with mitigations, launch channels, partner suggestions, a first-store score for every district on a map, and a market-entry memo you can copy, download or print. Every result shows the Qloo evidence it was grounded in.

### 3. Market-Entry OS *(rolling out)*
A verdict is where the work starts. The Market-Entry OS is being built now and turns a GO or PILOT into an executed launch:

| Module | What it does | Status |
|---|---|---|
| **Brand Workspace** | One workspace per brand and market, holding every analysis, decision and document. | Rolling out |
| **Playbook: Discover → Validate → Setup → Launch → Scale** | A staged entry plan with tasks, owners and gates for each phase. | Rolling out |
| **Compliance docs tracker** | Tracks the licences, registrations and filings a launch needs, and where each one stands. | Rolling out |
| **Partner pipeline** | Kanban of distributors, landlords, agencies and operators from first contact to signed. | Rolling out |
| **Sites** | Candidate locations scored against the neighborhood heat map. | Rolling out |
| **KPIs** | Launch and post-opening metrics the brand defines and tracks. | Rolling out |
| **Entry Copilot agents** | Agents that draft, chase and summarise work inside the playbook. | Rolling out |
| **Ecosystem marketplace** | Service providers, local operators and investors meet brands with a validated thesis. | Rolling out |

The current app already shows Markets, Platform (Market Packs, Agent Registry, API), Partners and Investors pages; partner and pipeline content there carries a **DEMO DATA** badge until real partners onboard.

## The 11 agents

All eleven run in one structured reasoning pass over the Qloo evidence; the Verdict Synthesizer weighs the other ten. Full spec: [docs/AGENTS.md](docs/AGENTS.md).

| # | Agent | Question it answers | Inputs | Output |
|---|---|---|---|---|
| 01 | **Brand Profiler** | How will Vietnamese consumers read this brand's positioning, price tier and cultural signals? | Brand name, category, Qloo brand match and taste tags | Summary + 2 findings |
| 02 | **Audience Mapper** | Which Vietnamese segments are most likely to engage, and why? | Brand profile, Qloo tags and related brands | Summary, findings, up to 5 segments with appeal 0–100 |
| 03 | **City Scout** | Where do demand and retail gravity sit in the target city for this category? | City, category, Qloo popular places in the city | Summary + findings |
| 04 | **Taste Affinity** | How strong is the measured taste match? | Qloo related brands with affinity (0–1), tags | Affinity scores: overall, cultural, audience, competition, price (0–100) |
| 05 | **Competitor Scan** | Who is already in market, and how threatening are they? | Qloo related brands, city places, market knowledge | Up to 6 competitors with positioning and threat (low/medium/high) |
| 06 | **Cultural Fit** | Does the brand fit local norms, gifting culture, family structure and social habits? | Brand profile, category, city | Summary + findings |
| 07 | **Price Sensitivity** | What will people pay versus local incomes, and how much pricing headroom is there? | Price tier, category, city | Summary + findings |
| 08 | **Channel Planner** | Which 3–4 channels should the launch use? | City, category, segments | Up to 4 launch channels |
| 09 | **Risk Analyst** | What could go wrong, and how do we reduce it? | All upstream outputs | 3–5 risks with severity and mitigation |
| 10 | **Localization Writer** | What one line would land with Vietnamese consumers? | Brand profile, segments, language | Positioning line in the summary |
| 11 | **Verdict Synthesizer** | GO, PILOT or NO-GO, and how sure are we? | Every agent's output + evidence quality | Verdict, confidence, opportunity index, headline, rationale, memo intro |

The same pass also produces 3–4 launch partners (name, role, fit 0–100) and a 0–100 first-store score for each district the client sends.

## Architecture

```mermaid
flowchart LR
  subgraph Client["Browser: React + Vite (EN/VI)"]
    UI["Analyze wizard<br/>city · category · brand"]
    RV["Result views<br/>verdict · map · partners · memo"]
  end

  subgraph Base44["Base44 platform"]
    AUTH["Auth (base44.auth.me)"]
    FN["analyzeMarketEntry<br/>Deno serverless function"]
    LLM["Core.InvokeLLM<br/>JSON-schema output"]
    SEC[("Secrets<br/>QLOO_API_KEY")]
  end

  subgraph Qloo["Qloo Taste AI (hackathon API)"]
    S1["GET /search<br/>brand entity"]
    S2["GET /search<br/>category brands"]
    S3["GET /search<br/>city places"]
    INS["GET /v2/insights<br/>related brands + affinity"]
  end

  UI -- "functions.invoke()" --> FN
  FN --> AUTH
  SEC -.-> FN
  FN --> S1
  FN --> S2
  S1 --> INS
  S2 --> INS
  FN --> S3
  INS --> EV["Evidence block<br/>match · tags · affinities · places"]
  S3 --> EV
  EV --> AP["11-agent pipeline<br/>01 Brand Profiler … 10 Localization Writer"]
  AP --> VS["11 Verdict Synthesizer"]
  LLM -.-> AP
  VS --> VAL["Validate + clamp<br/>enums · 0–100 · lengths"]
  VAL -- "ok · result · evidence · inputs" --> RV
```

### One analysis run

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web app (React)
  participant F as analyzeMarketEntry (Deno)
  participant Q as Qloo API
  participant L as Base44 InvokeLLM

  U->>W: City, category, brand name
  W->>F: invoke(brandName, city, category, lang, neighborhoods)
  F->>F: auth.me() and validate input (400 if invalid)
  F->>Q: GET /search query=brand, types=urn:entity:brand, take=5
  F->>Q: GET /search query=category term, types=urn:entity:brand, take=5
  alt brand entity found
    F->>Q: GET /v2/insights signal = brand entity
  else no brand entity
    F->>Q: GET /v2/insights signal = top 3 category entities
  end
  F->>Q: GET /search place term near city centre, radius 10, by popularity
  Note over F: Build evidence block (match, tags, affinities, places)
  F->>L: Prompt (brief + evidence + 11 agent roles) + JSON schema
  L-->>F: Structured verdict
  F->>F: Validate verdict, clamp scores, drop unknown agents and districts
  F-->>W: ok, result, evidence, inputs
  W-->>U: Verdict, affinity, segments, heat map, partners, memo
  Note over F,W: Any Qloo failure returns 502 qloo_unavailable and no analysis
```

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Qloo integration

Qloo is called **server-side only**, from `base44/functions/analyzeMarketEntry/entry.ts`, against `https://hackathon.api.qloo.com` with the `X-Api-Key` header (15 s timeout per call). The key lives in Base44 secrets and never reaches the browser.

| Step | Endpoint | Parameters | Used for |
|---|---|---|---|
| 1 | `GET /search` | `query=<brand name>`, `types=urn:entity:brand`, `take=5` | Resolve the brand to a Qloo entity (top hit), its popularity and taste tags |
| 2 | `GET /search` | `query=<category brand term>` (e.g. `specialty coffee`), `types=urn:entity:brand`, `take=5` | Category-level fallback signals (top 3) when the brand itself is unknown to Qloo |
| 3 | `GET /v2/insights` | `signal.interests.entities=<entity ids>`, `filter.type=urn:entity:brand`, `take=12` | Related brands with measured affinity (kept: top 8, affinity rounded to 2 dp) |
| 4 | `GET /search` | `query=<category place term>`, `types=urn:entity:place`, `filter.location=<lat,long>`, `filter.radius=10`, `take=10`, `sort_by=popularity` | Popular local places in the target city (top 8) |

City centres: HCMC `10.776,106.703`, Hanoi `21.028,105.852`, Da Nang `16.047,108.218`.
A `404` is treated as an honest empty result; any other error or timeout aborts the run. Full detail: [docs/QLOO_INTEGRATION.md](docs/QLOO_INTEGRATION.md).

## Data honesty policy

- **No invented data.** If Qloo is unreachable or returns nothing usable for the brand or category, the function returns `502 qloo_unavailable` and the UI shows an error. It never falls back to made-up evidence.
- **Evidence is shown.** Every result carries the evidence block (brand match, tags, related brands with affinity, city places) and the UI renders it next to the verdict.
- **Confidence follows evidence.** When Qloo has no direct entity for the brand, the prompt caps confidence below 70 and says category-level signals were used.
- **The model is told not to fabricate** statistics, market-share numbers or ratings; scores are clamped to 0–100 and enums are enforced server-side.
- **Illustrative content is labelled.** The Partners page (directory, match flow, pipeline board) carries a **DEMO DATA** badge, the Outcome Data Vault rows carry a **SAMPLE** badge, the landing-page product demo says it is simulated, and the Pricing page states payments are not enabled.
- **Advisory, not a guarantee.** A verdict is decision support for a human team.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, React Router 6, Tailwind CSS 3, shadcn/ui (Radix), Framer Motion, Recharts, React Leaflet |
| State / data | TanStack Query, Base44 JS SDK (`@base44/sdk`) |
| Backend | Base44 serverless function on Deno (`analyzeMarketEntry`) |
| AI | Base44 `Core.InvokeLLM` with a strict JSON response schema |
| Taste data | Qloo Taste AI: `/search`, `/v2/insights` |
| i18n | In-house EN/VI dictionary (`src/lib/i18n.jsx`) |
| Hosting | Base44 |
| CI | GitHub Actions: lint + production build on Node 20 |

## Project structure

```
tastebridge/
├── base44/
│   ├── config.jsonc                     # Base44 project config (build/serve commands)
│   ├── entities/User.jsonc              # Data schema
│   └── functions/
│       └── analyzeMarketEntry/entry.ts  # Qloo evidence + 11-agent pipeline + validation
├── src/
│   ├── api/base44Client.js              # Base44 SDK client
│   ├── pages/                           # Landing, Analyze, Markets, Platform, Partners, Pricing, Investors, About, auth pages
│   ├── components/
│   │   ├── analyze/                     # Wizard steps, agent timeline, verdict, cards, heat map, memo
│   │   ├── landing/ markets/ partners/ platform/ investors/
│   │   └── ui/                          # shadcn/ui primitives
│   └── lib/
│       ├── agentsData.js                # The 11 agents (EN/VI names and roles)
│       ├── analyzeData.js               # Cities, categories, districts with coordinates
│       ├── marketsData.js platformData.js partnersData.js
│       └── i18n.jsx                     # EN/VI strings
├── docs/
│   ├── ARCHITECTURE.md  AGENTS.md  API.md  QLOO_INTEGRATION.md
│   ├── ROADMAP.md  DEVELOPMENT.md  BUSINESS_ARCHITECTURE(.vi).md
│   └── screenshots/
├── .github/                             # CI workflow, issue and PR templates
├── index.html  vite.config.js  tailwind.config.js  eslint.config.js
└── package.json
```

## Getting started

**Prerequisites:** Node.js 20+ and npm. A Base44 account and a Qloo API key to run the backend.

```bash
git clone https://github.com/ducvuathuduc/tastebridge.git
cd tastebridge
npm install
cp .env.example .env.local   # fill in your Base44 app id / URL
npm run dev                  # frontend on http://localhost:5173
```

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

**Environment (frontend, `.env.local`):** `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, optional `VITE_BASE44_FUNCTIONS_VERSION`. See [.env.example](.env.example).

**Secrets (backend, set in Base44, never in the repo):** `QLOO_API_KEY`. The LLM call uses the Base44 Core integration, so no separate LLM key is needed in code.

**Deploy with the Base44 CLI:**

```bash
npx base44 login
npx base44 link        # link this folder to your Base44 app
npx base44 dev         # optional: local backend + frontend together
npx base44 deploy      # deploy site and functions
```

## Roadmap

| Horizon | Milestone |
|---|---|
| Now | Vietnam pack live: HCMC, Hanoi, Da Nang · 7 categories · 11 agents · EN/VI |
| Next | Market-Entry OS: Brand Workspace, playbook, compliance tracker, partner pipeline, sites, KPIs, Entry Copilot |
| Then | Market Packs for **Thailand, Malaysia, Indonesia, Philippines** |
| Platform | Agent Registry (Supplier Match, Legal Analyst, Hiring Planner), public API, white-label for trade agencies, banks and funds |

Full roadmap: [docs/ROADMAP.md](docs/ROADMAP.md).

## Business model

"Start free. Pay when it works." The planned model, as shown on the app's Pricing page (**payments are not enabled yet**):

| Tier | Planned price | Includes |
|---|---|---|
| Free scan | $0 | 1 analysis per month, one Vietnamese city at a time, memo export and share |
| Pro | $149 / month | Unlimited analyses, all 3 cities, partner match and deal pipeline, API access |
| Enterprise | Custom | White-label and multi-tenant, first access to new Market Packs, Outcome Data Vault, dedicated support |
| Success fee | Per deal | Launch on a GO verdict and a small share of first-year Vietnam revenue is due; no launch, no fee |

On top of this, the Market-Entry OS adds a marketplace take rate on deals between brands, service providers and operators. See [docs/BUSINESS_ARCHITECTURE.md](docs/BUSINESS_ARCHITECTURE.md).

## Team

**Huỳnh Diệu Thành** (Thanh Huynh Dieu): founder and engineer, [VTech Studio](https://vtechstudio.tech). Software engineering student at FPT University, Ho Chi Minh City.
[LinkedIn](https://www.linkedin.com/in/thanh-huynh-ai)

## License

[MIT](LICENSE) © 2026 Huỳnh Diệu Thành (VTech Studio).

Qloo is a trademark of Qloo, Inc. TasteBridge is an independent hackathon project and is not affiliated with or endorsed by Qloo.
