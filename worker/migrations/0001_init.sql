-- TasteBridge v1 schema (Cloudflare D1 / SQLite)
-- Organised by company department. Every project-scoped table carries project_id
-- and cascades on delete. Timestamps are ISO-8601 UTC strings.

-- ───────────── Strategy ─────────────
CREATE TABLE IF NOT EXISTS brand_projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  city TEXT NOT NULL,              -- hcmc | hanoi | danang
  category TEXT NOT NULL,          -- food_beverage | coffee_tea | ...
  stage TEXT NOT NULL DEFAULT 'discover', -- discover | validate | setup | launch | scale
  description TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON brand_projects(owner_id);

CREATE TABLE IF NOT EXISTS verdicts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  agent_run_id TEXT,
  verdict TEXT NOT NULL,           -- GO | PILOT | NO-GO
  confidence INTEGER NOT NULL,
  opportunity_index INTEGER NOT NULL,
  headline TEXT,
  rationale TEXT,
  result_json TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_verdicts_project ON verdicts(project_id);

CREATE TABLE IF NOT EXISTS opportunity_index (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  verdict_id TEXT REFERENCES verdicts(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  value INTEGER NOT NULL,
  as_of TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,             -- discover | validate | setup | launch | scale
  department TEXT NOT NULL,        -- strategy | legal | real_estate | partnerships | marketing | operations | finance
  title TEXT NOT NULL,
  title_vi TEXT,
  detail TEXT,
  detail_vi TEXT,
  authority TEXT,                  -- e.g. IP Vietnam
  status TEXT NOT NULL DEFAULT 'todo', -- todo | doing | done
  due_date TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);

-- ───────────── Legal & Compliance ─────────────
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,              -- erc | food_safety | import_permit | lease | trademark | other
  title TEXT NOT NULL,
  issuer TEXT,
  number TEXT,
  issued_at TEXT,
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | expired
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  license_type TEXT NOT NULL,
  authority TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned | applied | granted | rejected
  applied_at TEXT,
  granted_at TEXT,
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS trademarks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  mark TEXT NOT NULL,
  nice_classes TEXT,               -- e.g. "30,43"
  office TEXT NOT NULL DEFAULT 'IP Vietnam',
  application_no TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned | filed | published | registered | opposed
  filed_at TEXT
);

-- ───────────── Real Estate ─────────────
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  lat REAL,
  lng REAL,
  score INTEGER,                   -- from the agent heat map (0-100)
  rent_vnd_month INTEGER,
  status TEXT NOT NULL DEFAULT 'shortlist', -- shortlist | visit | negotiating | signed | rejected
  source TEXT NOT NULL DEFAULT 'heatmap',
  note TEXT,
  created_at TEXT NOT NULL
);

-- ───────────── Partnerships ─────────────
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- operator | franchisee | delivery | ecommerce | crm
  cities TEXT NOT NULL,            -- comma-separated city ids
  categories TEXT,
  note TEXT,
  note_vi TEXT,
  is_demo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES partners(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL,
  role TEXT,
  fit INTEGER,
  why TEXT,
  source TEXT NOT NULL DEFAULT 'agent',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES partners(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'intro', -- intro | termsheet | signed | lost
  value_vnd INTEGER,
  note TEXT,
  updated_at TEXT NOT NULL
);

-- ───────────── Marketing ─────────────
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- GrabFood | ShopeeFood | TikTok Shop | Zalo OA ...
  kind TEXT NOT NULL,              -- delivery | ecommerce | social | crm | retail
  status TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES channels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  budget_vnd INTEGER,
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS kols (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL,          -- TikTok | Instagram | Facebook | YouTube
  tier TEXT,                       -- nano | micro | macro
  status TEXT NOT NULL DEFAULT 'prospect'
);

-- ───────────── Operations / Supply ─────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT,                       -- importer | local_roaster | packaging | logistics
  city TEXT,
  status TEXT NOT NULL DEFAULT 'prospect'
);

CREATE TABLE IF NOT EXISTS import_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  hs_code TEXT,
  permit_required TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
);

-- ───────────── Finance ─────────────
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  month TEXT NOT NULL,             -- YYYY-MM
  planned_vnd INTEGER NOT NULL DEFAULT 0,
  actual_vnd INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kpis (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  month TEXT NOT NULL,             -- YYYY-MM
  metric TEXT NOT NULL,            -- revenue_vnd | orders | stores ...
  value REAL NOT NULL,
  target REAL
);
CREATE INDEX IF NOT EXISTS idx_kpis_project ON kpis(project_id);

-- ───────────── Agents (audit log) ─────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES brand_projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,              -- analyze | localize | copilot
  provider TEXT,
  model TEXT,
  status TEXT NOT NULL,            -- running | ok | error
  input_json TEXT,
  error TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS agent_outputs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  summary TEXT,
  findings_json TEXT
);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES brand_projects(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,             -- user | agent:<id> | system
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity(project_id);
