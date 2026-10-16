# TasteBridge

**Will your brand land in Vietnam?** TasteBridge is an AI market-entry analyst for foreign F&B and consumer brands. Eleven specialist agents, powered by **Qloo Taste AI**, return a GO / PILOT / NO-GO verdict with confidence, affinity scores, audience segments, competitors, risks, a neighborhood heat map and a market-entry memo. EN/VI interface.

- **Live demo:** https://taste-bridge-vietnam.base44.app
- **Built for:** Qloo Agentic Hackathon (Devpost)
- **License:** MIT

## How it is Qloo-powered
The backend function `base44/functions/analyzeMarketEntry/entry.ts` calls Qloo's hackathon API server-side (`https://hackathon.api.qloo.com`):
- `GET /search` resolves the brand and city-scoped local places into Qloo entity IDs.
- `GET /v2/insights` returns cross-domain affinities scoped to the target city.

The eleven agents (Brand Profiler, Audience Mapper, City Scout, Taste Affinity, Competitor Scan, Cultural Fit, Price Sensitivity, Channel Planner, Risk Analyst, Localization Writer, Verdict Synthesizer) reason over that evidence. If Qloo fails, the app shows an error rather than inventing data.

## Pages
Landing (with a self-running "See it in action" demo), Analyze (6-step flow: market & city → brand → agent run → verdict → partner match → memo), Markets (Vietnam live; Thailand, Malaysia, Indonesia, Philippines on the roadmap), Platform (API-first, multi-tenant core, Market Packs, Agent Registry), Partners (demo data), Pricing, Investors, About.

## Repository layout
```
src/                         React (Vite) frontend: pages, components, i18n (EN/VI)
base44/functions/            Serverless backend (analyzeMarketEntry: Qloo + agent pipeline)
base44/entities/             Data schemas
base44/config.jsonc          Base44 project config
```

## Run locally
```bash
npm install
npm run dev
```
The backend function runs on Base44 (Deno). Set the secret `QLOO_API_KEY` (plus the LLM integration) in the Base44 app to run the analysis. With the Base44 CLI you can link and deploy: `npx base44 login && npx base44 link && npx base44 deploy`.

## Earlier prototype
The first Next.js prototype lives on the `nextjs-prototype` branch.
