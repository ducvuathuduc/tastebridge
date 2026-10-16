# API: `analyzeMarketEntry`

The single backend function behind every analysis. Source: [`base44/functions/analyzeMarketEntry/entry.ts`](../base44/functions/analyzeMarketEntry/entry.ts).

| | |
|---|---|
| Runtime | Base44 serverless function (Deno) |
| Auth | Required. The caller must be a signed-in Base44 user (`base44.auth.me()`); otherwise `401`. |
| Method | Invoked through the Base44 SDK: `base44.functions.invoke("analyzeMarketEntry", body)` |
| Secrets | `QLOO_API_KEY` (read with `secrets.get`), never returned to the client |
| External calls | Qloo `/search` ×3, `/v2/insights` ×1, Base44 `Core.InvokeLLM` ×1 |

## Request

```json
{
  "brandName": "Blue Bottle Coffee",
  "city": "hcmc",
  "category": "coffee_tea",
  "lang": "en",
  "neighborhoods": ["District 1", "District 3", "Binh Thanh"]
}
```

| Field | Type | Rules |
|---|---|---|
| `brandName` | string | Required. Trimmed, truncated to 80 chars. |
| `city` | enum | Required. `hcmc` · `hanoi` · `danang` |
| `category` | enum | Required. `food_beverage` · `coffee_tea` · `fashion` · `beauty` · `electronics` · `wellness` · `home_living` |
| `lang` | enum | `vi` for Vietnamese output; anything else means `en`. |
| `neighborhoods` | string[] | Required, at least 1. Strings of 1–60 chars; first 15 kept. The web client sends the district list for the chosen city from `src/lib/analyzeData.js`. |

## Success response `200`

```json
{
  "ok": true,
  "result": {
    "verdict": "GO | PILOT | NO-GO",
    "confidence": 0,
    "opportunityIndex": 0,
    "headline": "string (≤300)",
    "verdictRationale": "string (≤1200)",
    "memoIntro": "string (≤1500)",
    "agents": [
      { "id": "brandProfiler", "summary": "string (≤400)", "findings": ["string (≤300)"] }
    ],
    "affinity": { "overall": 0, "cultural": 0, "audience": 0, "competition": 0, "price": 0 },
    "segments":    [{ "name": "string", "appeal": 0, "why": "string" }],
    "competitors": [{ "name": "string", "positioning": "string", "threat": "low | medium | high" }],
    "risks":       [{ "risk": "string", "severity": "low | medium | high", "mitigation": "string" }],
    "channels":    ["string"],
    "partners":    [{ "name": "string", "role": "string", "fit": 0, "why": "string" }],
    "neighborhoods": [{ "name": "District 1", "score": 0, "note": "string" }]
  },
  "evidence": {
    "brandFound": true,
    "matchedName": "string | null",
    "brandTags": ["string"],
    "relatedBrands": [{ "name": "string", "affinity": 0.0 }],
    "cityPlaces": ["string"]
  },
  "inputs": { "brandName": "string", "city": "hcmc", "category": "Coffee & Tea", "lang": "en" }
}
```

The values above are type placeholders, not real output.

### Server-side guarantees

The LLM output is never passed through raw. Before responding, the function:

- rejects any output whose `verdict` is not `GO`, `PILOT` or `NO-GO` (`502`);
- clamps every score (`confidence`, `opportunityIndex`, affinity, `appeal`, `fit`, district `score`) to an integer 0–100;
- forces `threat` / `severity` into `low | medium | high` (default `medium`);
- keeps only agents whose `id` is one of the 11 known ids, with at most 3 findings each; returns `502` if none remain;
- caps list sizes: segments 5, competitors 6, risks 5, channels 4, partners 4;
- keeps only districts whose name was in the request's `neighborhoods`;
- truncates every string to the lengths shown.

Agent ids: `brandProfiler`, `audienceMapper`, `cityScout`, `tasteAffinity`, `competitorScan`, `culturalFit`, `priceSensitivity`, `channelPlanner`, `riskAnalyst`, `localizationWriter`, `verdictSynthesizer`.

`evidence.relatedBrands[].affinity` is Qloo's `query.affinity` rounded to 2 decimals, or `null` if Qloo did not return one. `inputs.category` is the human label, not the id.

## Errors

| Status | Body | When |
|---|---|---|
| `401` | `{ "error": "Unauthorized" }` | No signed-in user |
| `400` | `{ "error": "Invalid analysis request" }` | Missing brand, or unknown `city` / `category` |
| `400` | `{ "error": "Missing neighborhood list" }` | `neighborhoods` empty or invalid |
| `502` | `{ "error": "No taste data available for this brand or category.", "code": "qloo_unavailable" }` | Qloo found neither the brand nor any category entity |
| `502` | `{ "error": "Taste AI data is unavailable. No analysis was produced.", "code": "qloo_unavailable" }` | Qloo network error, timeout (15 s), unreadable body or non-404 error status |
| `502` | `{ "error": "Agent reasoning failed to produce a verdict." }` | LLM output missing a valid verdict |
| `502` | `{ "error": "Agent reasoning returned no agent outputs." }` | No valid agent entries after filtering |
| `500` | `{ "error": "<message>" }` | Any other failure |

The web client maps `code: "qloo_unavailable"` to a dedicated "taste data unavailable" message and everything else to a generic error, both with a retry button.

## Example (browser)

```js
import { base44 } from "@/api/base44Client";

const res = await base44.functions.invoke("analyzeMarketEntry", {
  brandName: "Blue Bottle Coffee",
  city: "hcmc",
  category: "coffee_tea",
  lang: "vi",
  neighborhoods: ["District 1", "District 3", "Thu Duc"],
});
const { result, evidence } = res.data;
```

## Planned public API

A versioned REST API for partners (agencies, landlords, funds) is on the [roadmap](ROADMAP.md). The Platform page in the app previews it; it is not live.
