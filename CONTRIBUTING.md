# Contributing to TasteBridge

Thanks for your interest. TasteBridge is an early-stage project built for the Qloo Agentic Hackathon by VTech Studio; issues and pull requests are welcome.

## Ground rules

1. **No invented data shown as real.** Analyses must come from real Qloo responses. If data is missing, show that it is missing. Illustrative content must be labelled demo or sample.
2. **No secrets in the repo.** Keys live in Base44 secrets or your local `.env.local` (git-ignored). Never paste them in issues, PRs, code, docs or screenshots.
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

To run the backend function you need a Base44 app with the `QLOO_API_KEY` secret set (`npx base44 dev` runs backend and frontend together). See the [README](README.md#getting-started) and [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Where code lives

| Path | What | Notes |
|---|---|---|
| `src/` | React frontend | Synced with the Base44 editor; discuss larger UI changes in an issue first |
| `base44/functions/analyzeMarketEntry/entry.ts` | Analysis backend | Changes to agents, prompt or schema must update `docs/AGENTS.md` and `docs/API.md` |
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
