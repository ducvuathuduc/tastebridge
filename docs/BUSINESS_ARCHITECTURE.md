# TasteBridge: Business Architecture

> 🇻🇳 Bản tiếng Việt: [BUSINESS_ARCHITECTURE.vi.md](BUSINESS_ARCHITECTURE.vi.md)

**Positioning:** *Decide with evidence, then execute the entry.* TasteBridge is an AI market-entry analyst and Market-Entry OS that helps **foreign consumer brands enter Vietnam** (primary) and, later, **Vietnamese brands expand abroad**, grounded in Qloo's cultural taste graph.

**Where the product is today (v0.2.0).** The analysis and verdict are live in the Base44 app: eleven agents over Qloo evidence, GO / PILOT / NO-GO, opportunity index, district heat map, partner suggestions and memo for HCMC, Hanoi and Da Nang. The Market-Entry OS described below is **rolling out**; marketplace and pricing are **planned**. Nothing here claims customers, revenue or outcomes that do not exist.

**Standards alignment.** The design is *aligned with*, not certified against, these frameworks. No certification has been sought or granted.

| Framework | What we borrow |
|---|---|
| ISO 56001 / 56002 (innovation management) | Staged entry (discover → validate → launch), portfolio review, learning from outcomes |
| ISO 9001 (quality management) | Documented core processes, owners, KPIs, corrective action loop |
| ISO 31000 (risk management) | Risk register with likelihood, impact, treatment and owner |
| ISO/IEC 27001 + 27701 (security and privacy) | Secrets server-side only, least privilege, data minimisation, privacy by design |
| ISO 37301 (compliance management) | Compliance obligations register (business and franchise registration, food safety, labelling, data protection) |
| Vietnam Personal Data Protection Law | Consent, purpose limitation, data subject rights, cross-border transfer assessment for any consumer data |

---

## 1. Value streams

The Market-Entry OS playbook has five stages. The live analysis covers Discover and the decision at its end.

```
Discover ──▶ Validate ──▶ Setup ──▶ Launch ──▶ Scale
```

| Stage | Customer question | TasteBridge capability | Status |
|---|---|---|---|
| **Discover** | "Is there a taste match for us here, and where?" | 11-agent analysis over Qloo evidence; verdict, confidence, opportunity index, segments, competitors, risks, district heat map, memo | **Live** |
| **Validate** | "Will real people want this before we commit?" | Pilot design from the verdict, demand tests, refined analysis per city | Rolling out |
| **Setup** | "What do we need to be allowed and able to open?" | Compliance docs tracker, partner pipeline (distributors, legal, landlords), sites shortlist | Rolling out |
| **Launch** | "Get us open without hiring a consultancy for every step." | Playbook tasks and gates, Entry Copilot agents, channel plan from the analysis | Rolling out |
| **Scale** | "Keep us ahead after opening." | KPIs, outcome tracking, next-city and next-market analysis | Rolling out |

## 2. Capability map

| Level-1 capability | Level-2 capabilities | Status |
|---|---|---|
| Taste intelligence | Brand entity resolution (Qloo `/search`), category fallback signals, related brands with affinity (`/v2/insights`), popular places per city | Live |
| Agent reasoning | 11 role-specific agents in one schema-constrained pass; verdict rules tied to evidence quality; server-side validation and clamping | Live |
| Localisation | EN/VI interface and agent output; Localization Writer positioning line | Live |
| Market-Entry OS | Brand Workspace, playbook, compliance tracker, partner pipeline, sites, KPIs, Entry Copilot | Rolling out |
| Market Packs | Per-country query terms, cities and districts, locale and currency, partner roles, regulatory notes | Planned (Vietnam is the first pack) |
| Ecosystem marketplace | Service providers, local operators and investors; matching; take-rate billing | Planned |
| Learning loop | Outcome store comparing verdicts with what happened | Planned |
| Trust and compliance | Advisory framing, evidence shown with every verdict, secrets management, demo/sample labelling | Live, extending with the OS |

## 3. Stakeholders and value exchange

| Stakeholder | Gives | Gets |
|---|---|---|
| Foreign consumer brands | Subscription and success fees | Evidence-backed verdict, entry playbook, vetted partners |
| Local operators and master franchisees | Interest in concepts they want to run | Qualified brand deal flow |
| Service providers (legal, logistics, site brokers, agencies, KOLs) | Services through the marketplace | Matched, pre-qualified projects |
| Investors | Capital for pilots and roll-outs | Evidence-backed theses and deal access |
| Trade-promotion agencies, banks, funds | Programmes, distribution, licences | White-label analysis for their members and clients |
| Vietnamese consumers | Feedback and demand signals | Brands they want, adapted to local taste |

## 4. Revenue model (planned; payments not enabled)

Matches the in-app Pricing page.

| Product | Model | Planned price |
|---|---|---|
| Free scan | Lead generation | $0, 1 analysis per month, one city at a time |
| Pro | Subscription | $149 / month: unlimited analyses, all 3 cities, partner match and pipeline, API access |
| Enterprise | Licence | Custom: white-label, multi-tenant, early Market Packs, Outcome Data Vault, dedicated support |
| Success fee | Revenue share on launched deals | Small share of first-year Vietnam revenue after a launch on a GO verdict, priced per deal at signing; no launch, no fee |
| Marketplace | Take rate on provider and operator deals | To be set when the marketplace opens |

## 5. Core processes, owners and KPIs

Roles are target roles for the operating company; today the founder holds them.

| # | Process | Owner (role) | KPIs |
|---|---|---|---|
| P1 | Lead → free scan | Growth | Scans per week; scan → Pro conversion |
| P2 | Verdict production | Insights | Turnaround time; share of runs with a direct Qloo brand match; Qloo error rate |
| P3 | Human review before external sharing | Reviewer | Share of memos reviewed before going to an investor or partner |
| P4 | Partner onboarding and vetting | Marketplace ops | Vetted partners per city and role; time to match |
| P5 | Entry execution (playbook) | Launch manager | Days per stage versus plan; blocked compliance items |
| P6 | Outcome capture | Data | Share of launches with a recorded outcome; verdict versus outcome gap |
| P7 | Compliance and data protection | Compliance | Open obligations; data-flow assessments completed |

## 6. Governance

1. **Advisory verdicts.** Every GO / PILOT / NO-GO is decision support. The app says so ("Directional analysis, not financial advice") and lists its limitations on the About page.
2. **Evidence gate.** Analyses run only on real Qloo responses. Any Qloo failure stops the run (`qloo_unavailable`); the evidence used is returned and shown with the verdict.
3. **AI output gate.** The model is instructed not to fabricate statistics, market share or ratings; confidence is capped below 70 without a direct brand match; the server enforces enums, 0–100 ranges and lengths.
4. **Labelling.** Anything illustrative in the product (partner directory, pipeline, outcome vault rows, landing demo, investor page) is labelled as demo, sample, simulated or illustrative.
5. **Change control.** Changes to agent roles, verdict rules or the response schema go through a pull request that updates [AGENTS.md](AGENTS.md) and [API.md](API.md).

## 7. Risk register

| ID | Risk | Likelihood | Impact | Treatment | Owner |
|---|---|---|---|---|---|
| R1 | Thin Qloo coverage for a brand or city produces weak evidence | Medium | High | Category fallback stated in the evidence; confidence cap; evidence shown | Insights |
| R2 | LLM states figures not in the evidence | Medium | High | Prompt prohibition, clamping, evidence displayed, human review before sharing | Insights |
| R3 | Users treat a verdict as a guarantee | Low | High | Advisory framing, limitations page, memo disclaimer | Reviewer |
| R4 | Consumer data collected during validation | Medium | High | Consent, purpose limitation, retention limits under Vietnam's PDP law | Compliance |
| R5 | API key leakage | Low | High | Base44 secrets only; never in repo or bundle; `.env*` ignored; rotation | Engineering |
| R6 | Partner misconduct | Medium | Medium | Vetting criteria, reviews, staged payments (planned) | Marketplace ops |
| R7 | Brand non-compliance (registration, food safety, labelling) | Medium | High | Compliance docs tracker in the playbook; legal partner role prioritised | Compliance |
| R8 | Dependence on one taste-data provider and one platform | Medium | Medium | Market Pack data-adapter design; backend logic kept portable (single function) | Engineering |
| R9 | LLM or Qloo latency during demos | Medium | Low | 15 s Qloo timeout, single LLM pass, clear retry path | Engineering |

## 8. Scalability architecture

- **Market Packs:** each new country is configuration (query terms, cities and districts, locale, currency, partner roles, regulatory notes), not a code fork. Thailand, Malaysia, Indonesia and the Philippines are next.
- **API-first, multi-tenant core:** brands, operators, providers and agencies become tenants of the same API; the web app is one client.
- **Agent Registry:** new agents (Supplier Match, Legal Analyst, Hiring Planner) plug in with a role, tools and an output contract.
- **Outcome store:** every verdict and later outcome recorded, feeding calibration and an audit trail.

## 9. Investor view

- **Flywheel:** more operators and investors → more brands → more deals → more outcome data → better predictions → more trust.
- **Growth doors:** more countries, reverse direction (Vietnam → abroad), more verticals, API and white-label, success fees.
- **Roadmap:** Vietnam (HCMC, Hanoi, Da Nang) → Southeast Asia (Thailand, Malaysia, Indonesia, Philippines). See [ROADMAP.md](ROADMAP.md).
