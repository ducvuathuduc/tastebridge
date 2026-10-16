# Agent specification

TasteBridge runs eleven specialist agents. Names and roles come from [`src/lib/agentsData.js`](../src/lib/agentsData.js); their instructions and output contracts come from the prompt and schema in [`base44/functions/analyzeMarketEntry/entry.ts`](../base44/functions/analyzeMarketEntry/entry.ts).

## How agents run

- All eleven are executed in **one** schema-constrained LLM pass (Base44 `Core.InvokeLLM`), in the order below, over the same Qloo evidence block. See [ARCHITECTURE.md](ARCHITECTURE.md#why-one-structured-pass).
- Every agent returns `{ id, summary, findings[] }`: a one-sentence summary (≈220 chars) and two short findings (≈140 chars each). The server keeps at most 3 findings, truncates text, and drops any unknown `id`.
- Some agents also own a structured section of the result (affinity, segments, competitors, risks, channels, verdict).
- All human-readable text is written in the language of the request (`en` or `vi`).
- Shared rules: be specific to the city and category; no generic filler; **never fabricate statistics, market-share numbers or ratings**; never contradict the Qloo evidence.

## Shared inputs

| Input | Source |
|---|---|
| Brand name, category, city | User |
| Brand match + popularity, taste tags | Qloo `/search` (brand) |
| Category fallback signals | Qloo `/search` (category term) |
| Related brands with affinity 0–1 | Qloo `/v2/insights` |
| Popular places in the city | Qloo `/search` (places, by popularity, 10 km radius) |
| District list | Client (`src/lib/analyzeData.js`) |

## The agents

### 01 · Brand Profiler · *Hồ sơ thương hiệu* · `brandProfiler`
- **Question:** How will Vietnamese consumers read this brand's positioning, price tier and cultural signals?
- **Inputs:** brand name, category, Qloo brand match, popularity and tags.
- **Output:** summary + findings.

### 02 · Audience Mapper · *Định vị khách hàng* · `audienceMapper`
- **Question:** Which Vietnamese consumer segments are most likely to engage, and why?
- **Inputs:** brand profile, tags, related brands.
- **Output:** summary + findings; segments (≤5) of `{ name, appeal 0–100, why }`.

### 03 · City Scout · *Trinh sát thành phố* · `cityScout`
- **Question:** Where do demand and retail gravity sit in the target city for this category?
- **Inputs:** city, category, Qloo popular places.
- **Output:** summary + findings; informs district scores.

### 04 · Taste Affinity · *Đo độ hợp gu* · `tasteAffinity`
- **Question:** How strong is the measured taste match?
- **Inputs:** related brands with Qloo affinity, tags.
- **Output:** summary + findings; `affinity { overall, cultural, audience, competition, price }`, each 0–100.

### 05 · Competitor Scan · *Quét đối thủ* · `competitorScan`
- **Question:** Who is already in market, and how threatening are they?
- **Inputs:** related-brands evidence, city places, market knowledge. Instructed to name **real** competitors.
- **Output:** summary + findings; competitors (≤6) of `{ name, positioning, threat: low|medium|high }`.

### 06 · Cultural Fit · *Độ phù hợp văn hóa* · `culturalFit`
- **Question:** Does the brand fit local norms, gifting culture, family structure and social-media habits?
- **Inputs:** brand profile, category, city.
- **Output:** summary + findings.

### 07 · Price Sensitivity · *Độ nhạy giá* · `priceSensitivity`
- **Question:** What is willingness to pay versus local incomes, and how much pricing headroom is there?
- **Inputs:** price tier, category, city.
- **Output:** summary + findings.

### 08 · Channel Planner · *Lập kế hoạch kênh* · `channelPlanner`
- **Question:** Which 3–4 concrete launch channels fit this city (e.g. Shopee, Lazada, TikTok Shop, retail districts, partnerships)?
- **Inputs:** city, category, segments.
- **Output:** summary + findings; channels (≤4).

### 09 · Risk Analyst · *Phân tích rủi ro* · `riskAnalyst`
- **Question:** What regulatory, reputational and market-entry risks exist, and how are they mitigated?
- **Inputs:** all upstream outputs.
- **Output:** summary + findings; risks (3–5) of `{ risk, severity: low|medium|high, mitigation }`.

### 10 · Localization Writer · *Chấp bút bản địa hóa* · `localizationWriter`
- **Question:** What one positioning line would land with Vietnamese consumers?
- **Inputs:** brand profile, segments, language.
- **Output:** the positioning line in its `summary`, plus findings.

### 11 · Verdict Synthesizer · *Tổng hợp kết luận* · `verdictSynthesizer`
- **Question:** GO, PILOT or NO-GO, and how confident are we?
- **Inputs:** every other agent's output and the quality of the evidence.
- **Output:** `verdict`, `confidence` 0–100, `opportunityIndex` 0–100, `headline`, `verdictRationale`, `memoIntro`.
- **Rules:**
  - **GO:** strong measured affinity, clear demand, manageable competition and risk.
  - **PILOT:** promising signals with meaningful uncertainty; run a limited pilot first.
  - **NO-GO:** weak affinity or a fundamental category, cultural or price mismatch.
  - Confidence must reflect evidence quality; **below 70 when the brand had no direct Qloo entity**.
  - Opportunity index consistent with verdict and affinity (GO typically 70+, PILOT 40–75, NO-GO below 45).

## Sections produced alongside the agents

| Section | Contract |
|---|---|
| `partners[]` | 3–4 launch partners (distributors, retail chains, e-commerce platforms, delivery apps, mall operators, co-branding). Real companies where credible, otherwise the partner type. `{ name, role, fit 0–100, why }` |
| `neighborhoods[]` | One first-store score 0–100 and a one-line note for each district sent by the client. Names not in the request are dropped. |

## Upcoming agents (Agent Registry)

From `src/lib/platformData.js`; not live.

| Agent | Role |
|---|---|
| Supplier Match | Maps suppliers, distributors and co-packers for launch |
| Legal Analyst | Screens licensing, labelling and import rules for the category |
| Hiring Planner | Profiles the local roles a first store or office needs |

Entry Copilot agents for the Market-Entry OS (playbook drafting, compliance chasing, partner follow-ups) are being designed alongside the OS.

## Adding an agent (today)

1. Add the id to `AGENT_IDS` and its role line to the prompt in `entry.ts` (Base44 side).
2. Add `{ id, name: {en, vi}, desc: {en, vi} }` to `src/lib/agentsData.js`.
3. If it owns a new result section, extend `RESPONSE_SCHEMA`, the validation block and a result card.
4. Update this document and the README table.
