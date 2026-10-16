# TasteBridge API (Cloudflare Worker)

Hono on Cloudflare Workers. Serves the REST API used by the web app and the remote MCP server.

- Live: `https://tastebridge-api.huynhthanh.workers.dev` (`/api/health`, `/mcp`)
- Storage: SQLite-backed Durable Object `TasteStore` (binding `STORE`), schema in `migrations/0001_init.sql`.
  Optional D1 binding `DB` uses the same schema. See [`../docs/DATA_ARCHITECTURE.md`](../docs/DATA_ARCHITECTURE.md).
- MCP: see [`../docs/MCP.md`](../docs/MCP.md).

## Secrets

Never commit keys. Set them as Worker secrets:

```bash
npx wrangler secret put QLOO_API_KEY      # Qloo Hackathon API key (required)
npx wrangler secret put GROQ_API_KEY      # one LLM key is required: GROQ_API_KEY,
npx wrangler secret put GEMINI_API_KEY    # GEMINI_API_KEY or OPENAI_API_KEY
```

Provider order is Groq → Gemini → OpenAI (override with the `LLM_PROVIDER` var). `GET /api/health` reports which are set.

## Develop

```bash
npm install
npm test          # vitest — Qloo and the LLM are mocked; store tests run on node:sqlite
npm run typecheck
npx wrangler dev  # local API on http://localhost:8787 (put secrets in .dev.vars)
npx wrangler deploy
```

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Which keys and storage are configured |
| POST | `/api/analyze` | `{ brandName, city, category, lang?, neighborhoods?, project_id? }` — Qloo `/search` + `/v2/insights` + LLM, 11 agents. With `project_id` the verdict, matches and Opportunity Index are saved to the project |
| POST | `/api/localize-plan` | JSON `{ plan_text, city, category, brand?, lang? }` or multipart with `file` (PDF/TXT/MD, ≤8 MB) |
| GET / POST | `/api/projects` | List (add `?seed=1` to create the demo project for a new owner) / create (auto-generates the Vietnam playbook) |
| POST | `/api/projects/demo` | Seed the DEMO project |
| GET / PATCH / DELETE | `/api/projects/:id` | Full project with all departments |
| GET / POST | `/api/projects/:id/:collection` | `milestones, documents, licenses, trademarks, sites, matches, deals, channels, campaigns, kols, suppliers, import_items, budgets, kpis, activity` |
| PATCH / DELETE | `/api/projects/:id/:collection/:itemId` | |
| POST | `/api/projects/:id/copilot` | `{ message, history?, lang? }` — Entry Copilot with project context |
| GET | `/api/partners` | `?city=&type=` |
| POST | `/mcp` | MCP Streamable HTTP |

Project routes require an `X-Owner-Id` header (8–64 chars, `[A-Za-z0-9_-]`); the web app generates one per browser.
