# Development

Practical notes for working on TasteBridge v1 (own stack: Cloudflare Worker + Pages).

| Command | What it does |
|---|---|
| `npm run dev` | Web app on http://localhost:5173 (calls the API at http://localhost:8787 when on localhost) |
| `cd worker && npx wrangler dev` | API + MCP locally; secrets from `worker/.dev.vars` |
| `cd worker && npm test` | Vitest: API handlers with Qloo/LLM mocked, store tests on `node:sqlite` |
| `cd worker && npm run typecheck` | TypeScript check |
| `npm run build` / `npm run lint` | Web build / lint |
| `cd worker && npx wrangler deploy` | Deploy the Worker (`tastebridge-api`) |
| `npx --prefix worker wrangler pages deploy dist --project-name tastebridge` | Deploy the web app to Cloudflare Pages |
| `scripts/deploy-pages.sh` | Fallback Pages deploy (single request, `_worker.js`) when the asset-upload API can't be used |

## Key files

- `src/api/client.js`: the only API client. Sends `X-Owner-Id` (per-browser demo account).
- `src/lib/i18n.jsx` + `src/lib/i18n-os.js`: every user-facing string in EN and VI.
- `worker/src/index.ts`: routes. `analyze.ts`/`qloo.ts`/`llm.ts`: the agent pipeline. `mcp.ts`: MCP server.
- `worker/migrations/0001_init.sql`: schema; run `npm run schema` in `worker/` after editing to regenerate `src/schema.ts`.

## Rules

- Real Qloo data only; on failure return an error, never invented evidence.
- Seeded/illustrative data must be labelled DEMO DATA.
- No secrets in the repo; use `wrangler secret put`.
