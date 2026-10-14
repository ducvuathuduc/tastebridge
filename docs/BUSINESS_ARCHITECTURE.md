# TasteBridge — Business Architecture

> 🇻🇳 Bản tiếng Việt: [BUSINESS_ARCHITECTURE.vi.md](BUSINESS_ARCHITECTURE.vi.md)

**Positioning:** *Decide in one click. We run the rest, A–Z.* TasteBridge is a multi-agent market-entry advisor and partner marketplace that helps **foreign F&B brands enter Vietnam** (primary) and **Vietnamese brands expand abroad** (secondary), grounded in Qloo's cultural taste graph.

**Standards alignment.** This architecture is designed to be *aligned with* — not certified against — the following frameworks. No certification has been sought or granted.

| Framework | What we borrow |
|---|---|
| ISO 56001 / 56002 (innovation management) | Opportunity → concept → validation → deployment stages; portfolio review; learning from outcomes |
| ISO 9001 (quality management) | Documented core processes, owners, KPIs, corrective action loop |
| ISO 31000 (risk management) | Risk register with likelihood/impact, treatment and owner |
| ISO/IEC 27001 + 27701 (information security & privacy) | Secrets server-side only, least privilege, data minimisation, privacy by design |
| ISO 37301 (compliance management) | Compliance obligations register (franchise registration, food safety, data protection), periodic review |
| Vietnam Personal Data Protection Law | Consent for consumer data in Demand Validation, purpose limitation, data subject rights, cross-border transfer assessment |

---

## 1. Value streams

```
Discover ──▶ Decide ──▶ Validate ──▶ Launch ──▶ Grow
```

| Stage | Customer outcome | TasteBridge capability | Agents |
|---|---|---|---|
| **Discover** | "Is there a taste match for us in Vietnam?" | Taste-Fit Scan, Vietnam F&B Opportunity Index | Brand Profiler, Market Scout, Analog Hunter |
| **Decide** | "Should we invest, where, and how much risk?" | Investment committee, deterministic Taste-Fit Score, budget band, investor memo | Bull, Bear, Committee Chair |
| **Validate** | "Will real people pre-order before we sign a lease?" | Localized pre-order page + ads to the taste-matched audience | Demand Validator, Localization Chef |
| **Launch** | "Get us open without hiring a consultancy for every step." | A–Z launch plan, partner marketplace (sites, legal, supply, KOLs) | A–Z Launch Planner, Partner Matchmaker, Culture Mapper |
| **Grow** | "Keep us ahead after opening." | Taste Monitoring (affinity, heat, analog drift), franchise & capital match | Monitoring loop (roadmap) |

## 2. Capability map

| Level-1 capability | Level-2 capabilities |
|---|---|
| Taste intelligence | Entity resolution (Qloo `/search`), tag mapping (`/v2/tags`), audience affinity, neighborhood heatmaps, demographics, cross-domain culture mapping |
| Decision science | Deterministic Taste-Fit model, confidence rules, budget bands from user budget, scenario ROI from user assumptions |
| Agent orchestration | Agent registry, native tool calling, evidence ledger, auto-completion of skipped tool calls, provider fallback |
| Market packs | City catalogue + Qloo query strings, locale & currency, partner roles, regulatory notes |
| Marketplace | Operator demand posts, partner profiles & vetting, matching, take-rate billing (roadmap) |
| Validation | Landing page & ad generation, pre-order capture with consent (roadmap) |
| Learning loop | Event-sourced outcome store; outcomes label past predictions; periodic model recalibration (roadmap) |
| Trust & compliance | Human sign-off, data protection, secrets management, audit trail |

## 3. Stakeholders and value exchange (six-sided marketplace)

| Stakeholder | Gives | Gets |
|---|---|---|
| Foreign F&B brands | Fees (memo, subscription, success, revenue share) | Verdicts, A–Z launch, vetted partners |
| Local operators / master franchisees | Demand posts: concepts they want to run | Qualified brand deal flow |
| Investors | Capital for pilots / roll-outs | Evidence-backed memos, deal access |
| Service partners (site brokers, logistics, legal, agencies, KOLs) | Services through the marketplace | Matched, pre-qualified projects |
| Trade-promotion agencies (e.g. VIETRADE, JETRO, KOTRA) | Programs, delegations, co-funding | White-label scans for their members |
| Target-market consumers | Pre-orders and feedback | Brands they want, adapted to local taste |

## 4. Revenue streams (all pricing **proposed**, not live)

| Product | Model | Proposed price |
|---|---|---|
| Taste-Fit Scan | Free, lead generation | $0 |
| Investment Memo | Per market | $490 |
| Demand Validation ("test before you invest") | Per campaign | $1,500 + ad spend |
| Launch OS | Subscription + marketplace take rate | $2,000 / month + 8–12% |
| Franchise & Capital Match | Success fee | 3–5% of deal |
| Bridge | Revenue share ("we win only if you win") | 1–2% of outlet revenue, years 1–3 |
| Taste Monitoring | Subscription | $199 / month |
| Insights API | Enterprise licence (malls, landlords, exporters, agencies) | Custom |

## 5. Core processes, owners and KPIs

| # | Process | Owner (role) | KPIs |
|---|---|---|---|
| P1 | Lead → Taste-Fit Scan | Growth lead | Scans / week; scan → memo conversion |
| P2 | Investment verdict production | Head of Insights | Verdict turnaround (min); % figures traced to evidence (target 100%); reviewer override rate |
| P3 | Human verdict review & sign-off | Investment reviewer | % verdicts signed off before sharing (target 100%); review SLA |
| P4 | Demand validation campaign | Validation manager | Pre-orders vs founder's target; cost per pre-order |
| P5 | Partner onboarding & vetting | Marketplace ops | Vetted partners per city & role; time-to-match |
| P6 | Launch execution (A–Z) | Launch manager | Days to opening vs plan; partner NPS |
| P7 | Outcome capture & model recalibration | Data lead | % launches with 90-day outcome recorded; calibration error trend |
| P8 | Compliance & data protection | Compliance officer | Open obligations; DPIA completed per new data flow; incidents |

## 6. Governance

1. **Investment-verdict review.** Every GO / PILOT / NO-GO is advisory. A named human reviewer signs off before any verdict or memo is shared with an investor or partner (P3). The UI states this on every result.
2. **AI quality gate.** LLM agents may not produce figures. Scores, budget bands and ROI are computed in code. Agent outputs are checked for (a) cities covered, (b) figures present in the evidence ledger, (c) no invented company names in partner profiles.
3. **Data quality gate.** Each city carries a coverage tier from our Qloo coverage audit and a confidence level (high / medium / low from match counts, analog counts and heat cells). Low confidence can never yield a full GO.
4. **Portfolio review (ISO 56002-style).** Monthly review of scans, memos, validations and launches; compare predicted Taste-Fit vs observed outcomes; decide model and weight changes.
5. **Change control.** Changes to the scoring formula require a PR updating tests and the published formula.

## 7. Risk register (ISO 31000-style)

| ID | Risk | Likelihood | Impact | Treatment | Owner |
|---|---|---|---|---|---|
| R1 | Thin Qloo coverage in secondary Vietnamese cities produces misleading scores | Medium | High | Coverage tiers shown in UI; low confidence caps verdict at PILOT; recommend validation first | Head of Insights |
| R2 | LLM hallucinated figures in narratives | Medium | High | Numbers only from code; prompts forbid invention; evidence ledger; reviewer sign-off | Head of Insights |
| R3 | Investors treat advisory output as a guarantee | Low | High | Advisory disclaimer, human sign-off, memo footnotes | Investment reviewer |
| R4 | Consumer personal data collected in Demand Validation | Medium | High | Consent, purpose limitation, retention limits, DPIA under Vietnam's Personal Data Protection Law | Compliance officer |
| R5 | API key or credential leakage | Low | High | Server-side env vars only; never in repo or client bundle; rotation | Engineering lead |
| R6 | Partner misconduct (broker, operator) | Medium | Medium | Vetting criteria, red flags, reviews, escrow for success fees (roadmap) | Marketplace ops |
| R7 | Franchise registration or food-safety non-compliance by a brand | Medium | High | Compliance checklist in launch plan; legal partner role is priority | Compliance officer |
| R8 | Dependency on a single taste-data provider | Medium | Medium | Market Pack data-adapter interface allows additional sources | Engineering lead |
| R9 | LLM provider rate limits during demos | High | Low | Provider fallback chain, replay cache, deterministic scoring independent of LLM | Engineering lead |

## 8. Scalability architecture

- **Market Packs** — each new country is a plug-in: data adapters (Qloo query strings, coverage tiers), locale and currency, partner-network roles, regulatory notes. No code fork.
- **Multi-tenant, API-first core** — brands, operators, partners and agencies are tenants of the same API; the web app is one client.
- **Agent registry** — new agents (supplier, legal, hiring, real-estate) plug in with a role prompt, tool set and output contract.
- **Event-sourced outcome store** — every scan, verdict, validation and launch outcome is an immutable event, feeding the learning loop and audit trail.

## 9. Investor view

- **Network effects:** more operators → more brands → more deals → more outcome labels → better model → more operators.
- **Expansion vectors:** new countries (Market Packs), new verticals (beauty, retail, fashion), reverse direction (Vietnam → abroad), APIs / white-label for agencies and landlords.
- **Roadmap:** Vietnam (HCMC, Hanoi, Da Nang) → Southeast Asia (Thailand, Indonesia, Philippines) → wider Asia.
