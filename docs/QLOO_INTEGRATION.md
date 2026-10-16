# Qloo integration

TasteBridge's verdicts are grounded in **Qloo Taste AI**: Qloo's cross-domain graph of what people's tastes connect to. This document describes exactly how the app uses it today, read from [`base44/functions/analyzeMarketEntry/entry.ts`](../base44/functions/analyzeMarketEntry/entry.ts).

## Connection

| | |
|---|---|
| Base URL | `https://hackathon.api.qloo.com` (Qloo hackathon API) |
| Auth header | `X-Api-Key: <QLOO_API_KEY>` |
| Accept | `application/json` |
| Timeout | 15 seconds per request (`AbortSignal.timeout(15000)`) |
| Where | Server-side only, inside the Base44 Deno function. The key is a Base44 secret and is never sent to the browser or committed. |

All calls go through one helper, `qlooGet(path, params)`:

- `2xx` with a JSON body → returned.
- `2xx` with an unreadable body → `QlooError` (abort).
- `404` → `null`, treated as a legitimate *empty* result ("no results" is not a failure).
- any other status, network error or timeout → `QlooError`, which the handler turns into `502 { code: "qloo_unavailable" }`. **No analysis is produced from partial or invented data.**

## Calls per analysis

Four Qloo requests, in this order.

### 1. Brand entity: `GET /search`

```
query = <brandName>
types = urn:entity:brand
take  = 5
```

The first result is taken as the brand's Qloo entity. From it the app reads `entity_id`, `name`, `popularity` and up to 14 `tags` (strings, or objects with `name` / `tag` / `label`).

### 2. Category signals: `GET /search`

```
query = <category brand term>
types = urn:entity:brand
take  = 5
```

Category terms:

| Category id | Brand term | Place term |
|---|---|---|
| `food_beverage` | restaurant chain | restaurant |
| `coffee_tea` | specialty coffee | specialty coffee |
| `fashion` | fashion apparel brand | fashion boutique |
| `beauty` | skincare brand | beauty salon |
| `electronics` | consumer electronics brand | electronics store |
| `wellness` | fitness brand | gym |
| `home_living` | home furnishing brand | furniture store |

The top 3 entities are kept as fallback signals. If the brand had no entity **and** there are no category entities, the function stops with `502 "No taste data available for this brand or category."`

### 3. Related brands with affinity: `GET /v2/insights`

```
signal.interests.entities = <brand entity id>            (if found)
                          | <top-3 category entity ids>  (fallback, comma-separated)
filter.type               = urn:entity:brand
take                      = 12
```

From `results.entities`, entries with a name are mapped to `{ name, affinity }`, where `affinity = round(query.affinity, 2)` or `null`. The top 8 are kept. These are the measured numbers the Taste Affinity and Competitor Scan agents interpret.

### 4. Popular places in the target city: `GET /search`

```
query           = <category place term>
types           = urn:entity:place
filter.location = <lat,long of city centre>
filter.radius   = 10
take            = 10
sort_by         = popularity
```

| City | `filter.location` |
|---|---|
| Ho Chi Minh City (`hcmc`) | `10.776,106.703` |
| Hanoi (`hanoi`) | `21.028,105.852` |
| Da Nang (`danang`) | `16.047,108.218` |

Up to 8 place names are kept and used by City Scout and Competitor Scan.

## From evidence to reasoning

The four results are condensed into an evidence block that is placed verbatim in the agent prompt under the heading *"QLOO TASTE AI EVIDENCE — real measured data. Ground your reasoning in it and never contradict it"*:

```
- Brand match: "<name>" (Qloo entity, popularity <0.00>)
    or: No Qloo brand entity found for "<brand>" — category-level taste signals were used instead.
- Taste tags: <tags> | none available
- Related brands with measured Qloo affinity (0-1): <name affinity, …> | none available
- Popular <place term>s in <city> per Qloo: <places> | none available
```

Rules tied to evidence quality:

- If the brand had no direct Qloo entity, **confidence must stay below 70**.
- The opportunity index must be consistent with the verdict and affinity scores.
- The model must not fabricate statistics, market-share numbers or ratings.

The same evidence object is returned to the client (`evidence` in the [API response](API.md)) and shown in the UI's evidence card and memo, so every verdict can be traced back to what Qloo actually returned.

## Why Qloo

Market reports describe *who* consumers are. Qloo describes *what their tastes connect to* across brands, places, food and culture. For a brand asking "will people here like us?", measured affinity to brands people already love is the most direct signal available, and it is what separates a TasteBridge verdict from a generic LLM opinion.

## Planned

- Use Qloo audience and location-scoped signals per district to replace model-estimated district scores with measured heat.
- Use `/v2/tags` for richer cultural mapping.
- Per-market query strings and coverage tiers in each Market Pack (see [ROADMAP.md](ROADMAP.md)).
