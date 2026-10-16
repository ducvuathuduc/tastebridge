# Roadmap

Status as of 2026-10-16. Items are plans, not commitments.

## Shipped

- **v0.1.0 (2026-10-14):** Next.js prototype (branch `nextjs-prototype`): first end-to-end Qloo-grounded verdict, city comparison, investor memo.
- **v0.2.0 (2026-10-16):** Base44 app: 11 agents, Qloo `/search` + `/v2/insights` evidence, GO/PILOT/NO-GO with confidence and opportunity index, district heat map for HCMC, Hanoi and Da Nang, partner suggestions, memo, EN/VI, Markets, Platform, Partners, Pricing and Investors pages.

## Now: Market-Entry OS (rolling out)

| Module | Goal |
|---|---|
| Brand Workspace | Persist analyses, decisions and documents per brand and market |
| Playbook | Discover → Validate → Setup → Launch → Scale, with tasks, owners and stage gates |
| Compliance docs tracker | Track the registrations, licences and filings a launch needs |
| Partner pipeline | Kanban from first contact to signed, linked to suggested partners |
| Sites | Candidate locations scored against the district heat map |
| KPIs | Launch and post-opening metrics |
| Entry Copilot | Agents that act inside the playbook |
| Ecosystem marketplace | Service providers, local operators and investors meet brands with a validated thesis |

## Next: deeper evidence

- Measured district heat from Qloo location-scoped signals instead of model-estimated district scores.
- Qloo audience and demographic signals for segments.
- Saved runs and side-by-side comparison of cities.

## Then: Southeast Asia Market Packs

Each new country is a Market Pack (query terms, cities and districts, locale and currency, partner roles, regulatory notes), not a code fork.

| Market | Cities in scoping | Languages |
|---|---|---|
| Vietnam | HCMC · Hanoi · Da Nang | Live |
| Thailand | Bangkok · Chiang Mai · Phuket | Thai · English |
| Malaysia | Kuala Lumpur · Penang · Johor Bahru | Malay · English · Chinese |
| Indonesia | Jakarta · Surabaya · Bali | Indonesian · English |
| Philippines | Manila · Cebu · Davao | Filipino · English |

Also planned: the reverse direction, helping Vietnamese brands expand abroad.

## Platform

- **Agent Registry:** pluggable agents with their own tools and contracts (Supplier Match, Legal Analyst, Hiring Planner first).
- **Public API:** versioned REST access to analyses and workspaces for partners.
- **White-label:** branded deployments for trade agencies, banks and funds.
- **Outcome store:** record what happened after each verdict and compare it with the prediction.
