# Development notes

Practical notes for working on TasteBridge as a Base44 app.

## Commands

| Command | Use |
|---|---|
| `npm run dev` | Frontend only, against the hosted Base44 backend |
| `npx base44 dev` | Local Base44 backend and frontend together (uses `site.serveCommand` from `base44/config.jsonc`) |
| `npm run lint` | ESLint |
| `npm run build` | Production build to `dist/` |
| `npx base44 deploy` | Deploy site and functions |

## Key files

- `src/api/base44Client.js`: the one Base44 SDK client; reuse it rather than creating new clients.
- `vite.config.js`: Vite config with the Base44 Vite plugin.
- `base44/config.jsonc`: install, build, serve commands and output directory for Base44.
- `base44/functions/analyzeMarketEntry/entry.ts`: the analysis backend.
- `.env.local`: local-only values; never commit secrets.

## Conventions

- Prefer the Base44 CLI workflow over new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new integration paths.
- `src/` and `base44/` are synced with the Base44 editor; repo-level material (docs, CI, templates) is maintained here.
- Run `npm run lint` and `npm run build` before finishing a change.

## References

- Base44 CLI: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Base44 agent skills: https://docs.base44.com/developers/backend/overview/skills.md
