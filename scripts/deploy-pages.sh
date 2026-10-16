#!/usr/bin/env bash
# Fallback Pages deploy for environments where the Pages asset-upload JWT cannot be used
# (e.g. a credential-injecting proxy). Bundles dist/ into a Pages "_worker.js" and uploads
# it with a single Direct Upload request. Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
node scripts/build-pages-worker.mjs dist
curl -sS -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/tastebridge/deployments" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -F 'manifest={}' -F branch=main \
  -F "_worker.js=@dist/_worker.js;filename=_worker.js;type=application/javascript+module"
echo
