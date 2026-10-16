// Regenerates src/schema.ts from migrations/0001_init.sql (the single source of truth for the schema).
import fs from 'node:fs';
const sql = fs.readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8');
fs.writeFileSync(
  new URL('../src/schema.ts', import.meta.url),
  `// Generated from migrations/0001_init.sql by scripts/gen-schema.mjs — do not edit by hand.\nexport const SCHEMA_SQL = ${JSON.stringify(sql)};\n`
);
