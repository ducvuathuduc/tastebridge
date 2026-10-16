# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### In progress
- Market-Entry OS: Brand Workspace, Discover/Validate/Setup/Launch/Scale playbook, compliance docs tracker, partner pipeline, sites, KPIs, Entry Copilot agents, ecosystem marketplace.

## [0.2.0] - 2026-10-16

Base44 app, live at https://taste-bridge-vietnam.base44.app.

### Added
- React + Vite frontend on Base44 with EN/VI interface.
- `analyzeMarketEntry` Deno function: Qloo `/search` (brand, category, city places) and `/v2/insights` (related brands with affinity), server-side only.
- Eleven specialist agents (Brand Profiler, Audience Mapper, City Scout, Taste Affinity, Competitor Scan, Cultural Fit, Price Sensitivity, Channel Planner, Risk Analyst, Localization Writer, Verdict Synthesizer) in one schema-constrained reasoning pass.
- GO / PILOT / NO-GO verdict with confidence, opportunity index, affinity scores, segments, competitors, risks, channels and partner suggestions.
- Neighborhood heat map for Ho Chi Minh City, Hanoi and Da Nang.
- Market-entry memo: copy, download, print.
- Six-step Analyze flow; Markets, Platform, Partners (demo data), Pricing (planned model), Investors and About pages.
- Data honesty: Qloo failures return `qloo_unavailable` with no analysis; server-side clamping and validation of model output.
- Repository documentation: README (EN/VI), `docs/ARCHITECTURE.md`, `docs/AGENTS.md`, `docs/API.md`, `docs/QLOO_INTEGRATION.md`, `docs/ROADMAP.md`, `docs/DEVELOPMENT.md`, and `docs/BUSINESS_ARCHITECTURE(.vi).md` updated for the Base44 product.
- GitHub Actions CI (lint + build on Node 20), issue and PR templates, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.env.example`.

### Removed
- Base44 editor boilerplate `CLAUDE.md` and root `AGENTS.md`; the useful notes moved to `docs/DEVELOPMENT.md`.

## [0.1.0] - 2026-10-14

Next.js prototype (branch `nextjs-prototype`).

### Added
- First end-to-end Qloo-grounded market-entry verdict for F&B brands entering Vietnam.
- City comparison, neighborhood heat map, partner matching and investor memo.
- Business architecture document (EN/VI).

[Unreleased]: https://github.com/ducvuathuduc/tastebridge/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ducvuathuduc/tastebridge/releases/tag/v0.2.0
[0.1.0]: https://github.com/ducvuathuduc/tastebridge/tree/nextjs-prototype
