// Builds dist/_worker.js: a Pages "advanced mode" worker that serves the built SPA from memory.
// Used by scripts/deploy-pages.sh when the asset-upload API is unavailable (e.g. behind a credential proxy).
// Normal deploys can simply run `wrangler pages deploy dist --project-name tastebridge`.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain', '.woff2': 'font/woff2' };
const files = {};
const walk = (dir) => {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (!['_worker.js', '_redirects'].includes(f)) {
      const rel = '/' + path.relative(root, full).split(path.sep).join('/');
      files[rel] = { t: types[path.extname(f)] || 'application/octet-stream', b: fs.readFileSync(full).toString('base64') };
    }
  }
};
walk(root);
const src = `const FILES = ${JSON.stringify(files)};
const cache = new Map();
function body(p) { if (!cache.has(p)) { const bin = atob(FILES[p].b); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); cache.set(p, u); } return cache.get(p); }
export default {
  async fetch(request) {
    const url = new URL(request.url);
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith('/')) p += 'index.html';
    const hit = FILES[p] ? p : '/index.html';
    const immutable = hit.startsWith('/assets/');
    return new Response(body(hit), { headers: { 'content-type': FILES[hit].t, 'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache', 'x-content-type-options': 'nosniff' } });
  }
};
`;
fs.writeFileSync(path.join(root, '_worker.js'), src);
console.log(`_worker.js written with ${Object.keys(files).length} files (${(src.length / 1024).toFixed(0)} KiB)`);
