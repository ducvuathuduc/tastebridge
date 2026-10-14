# Contributing to TasteBridge

Thanks for helping foreign F&B brands find their way into Vietnam (and Vietnamese brands find their way out).

## Ground rules
1. **Never invent numbers.** Any figure shown in the UI must come from a Qloo API response (recorded in the evidence ledger) or from the user's own input. LLMs reason and write; code computes.
2. **Never commit Qloo response data or keys.** The hackathon terms allow private server-side caching only. `.env*` files are git-ignored.
3. **Bilingual by default.** User-facing strings go into `src/lib/i18n.tsx` in both `en` and `vi`.
4. **Accessible by default.** Keyboard reachable, visible focus, labelled controls, `prefers-reduced-motion` respected.

## Local setup
```bash
cp .env.example .env.local   # add QLOO_API_KEY and GROQ_API_KEY (or GEMINI_API_KEY)
npm install
npm run dev                  # http://localhost:3000
npm test                     # unit tests (scoring, ROI, JSON parsing, market packs)
npm run lint                 # TypeScript strict type-check
npx tsx --conditions=react-server scripts/smoke.ts "Blue Bottle Coffee" hcmc,hanoi,danang   # live end-to-end run
```

## Extending
| You want to… | Do this |
|---|---|
| Add a market (e.g. Thailand) | Create `src/lib/markets/packs/thailand.ts` implementing `MarketPack`, register it in `src/lib/markets/index.ts`. No other code changes. |
| Add an agent (e.g. Supplier, Legal, Hiring) | Add an entry to `AGENTS` in `src/lib/agents/registry.ts` (role prompt, tools, tier, output contract), call it from `src/lib/pipeline.ts`, add display metadata in `src/components/agentMeta.ts`. |
| Add a Qloo tool | Add it to `TOOLS` in `src/lib/tools.ts`: call Qloo, push figures into the evidence ledger, return a compact summary. |
| Change the score | Edit `src/lib/scoring.ts` and update `tests/scoring.test.ts` + the README formula. |

## Pull requests
- One topic per PR, with a short description and screenshots for UI changes.
- CI must pass (`npm run lint`, `npm test`, `npm run build`).
- By contributing you agree your contribution is licensed under the MIT License.
