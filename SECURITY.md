# Security policy

## Supported versions

| Version | Supported |
|---|---|
| 0.2.x (Base44 app, `main`) | Yes |
| 0.1.x (Next.js prototype, `nextjs-prototype` branch) | No |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub's **[Report a vulnerability](https://github.com/ducvuathuduc/tastebridge/security/advisories/new)** (Security → Advisories), or email **huynhthanh@vtechstudio.tech** with the subject `TasteBridge security`.

Include what you found, how to reproduce it and the impact you expect. Do not include real user data. We aim to acknowledge reports within 3 working days and will keep you updated until a fix ships. We are happy to credit you if you wish.

## Scope

- The live app at https://taste-bridge-vietnam.base44.app
- The `analyzeMarketEntry` backend function
- This repository (including CI)

Out of scope: denial-of-service and volume testing, social engineering, and issues in third-party platforms (Base44, Qloo) that should be reported to those vendors.

## How secrets are handled

- The Qloo API key is stored as a Base44 secret and read server-side only (`secrets.get('QLOO_API_KEY')`). It is never sent to the browser.
- `.env` and `.env.*` files are git-ignored; `.env.example` holds placeholders only.
- CI builds with placeholder values and needs no secrets.
- The analysis function requires an authenticated user and validates and bounds all input and output.

If you believe a secret was committed, report it as above so it can be rotated.
