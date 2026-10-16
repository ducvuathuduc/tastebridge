# Contributing to TasteBridge

Thanks for your interest. TasteBridge is an early-stage project built for the Qloo Agentic Hackathon by VTech Studio; issues and pull requests are welcome.

## Ground rules

1. **No invented data shown as real.** Analyses must come from real Qloo responses. If data is missing, show that it is missing. Illustrative content must be labelled demo or sample.
2. **No secrets in the repo.** Keys live in Cloudflare Worker secrets or your local `worker/.dev.vars` (git-ignored). Never paste them in issues, PRs, code, docs or screenshots.
3. **Bilingual by default.** Every UI string needs an English and a Vietnamese entry in `src/lib/i18n.jsx`.
4. **Be kind.** See the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

```bash
git clone https://github.com/ducvuathuduc/tastebridge.git
cd tastebridge
npm install
cp .env.example .env.local
npm run dev
```

To run the backend locally: `cd worker && npm install`, put `QLOO_API_KEY` and an LLM key (`GROQ_API_KEY`, `GEMINI_API_KEY` or `OPENAI_API_KEY`) in `worker/.dev.vars`, then `npx wrangler dev`. Run `npm test` in `worker/` before opening a PR. See the [README](README.md#getting-started) and [worker/README.md](worker/README.md).

## Where code lives

| Path | What | Notes |
|---|---|---|
| `src/` | React frontend | Discuss larger UI changes in an issue first; every string needs EN and VI |
| `worker/` | API, agents, MCP, data model | Changes to agents, prompt or schema must update `docs/AGENTS.md`, `docs/API.md` and `docs/DATA_ARCHITECTURE.md`; keep `npm test` green |
| `docs/` | Architecture, agents, API, Qloo, roadmap, business | |
| `.github/` | CI and templates | |

## Workflow

1. Open or pick an issue and say you are working on it.
2. Branch from `main`: `feat/<short-name>`, `fix/<short-name>` or `docs/<short-name>`.
3. Keep commits focused; use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).
4. Before pushing:
   ```bash
   npm run lint
   npm run build
   ```
5. Open a pull request using the template. CI must pass.
6. Add a line under *Unreleased* in [CHANGELOG.md](CHANGELOG.md).

## Adding an agent

See [docs/AGENTS.md](docs/AGENTS.md#adding-an-agent-today).

## Adding a market

Markets are planned as Market Packs (query terms, cities and districts with coordinates, locale, currency, partner roles, regulatory notes). Open a feature request with the market and the data sources first; see [docs/ROADMAP.md](docs/ROADMAP.md).
