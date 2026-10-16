import type { Env } from './env';
import { HttpError, now, uid } from './env';
import { buildPlaybook, PHASES } from './playbook';
import { CITY_NAMES, NEIGHBORHOODS, normalizeCategory, normalizeCity } from './catalog';
import { durableObjectDb, type SqlDb, type Stmt } from './store';

export function maybeDb(env: Env): SqlDb | null {
  if (env.DB) return env.DB as unknown as SqlDb;
  if (env.STORE) return durableObjectDb(env.STORE);
  return null;
}

export function db(env: Env): SqlDb {
  const d = maybeDb(env);
  if (!d) throw new HttpError(503, 'Database is not configured (STORE Durable Object or D1 binding DB missing).', 'db_unconfigured');
  return d;
}

/** Project sub-collections exposed through the generic CRUD API, with their writable columns. */
export const COLLECTIONS: Record<string, { table: string; fields: string[]; order: string; stamp?: string }> = {
  milestones: { table: 'milestones', fields: ['phase', 'department', 'title', 'title_vi', 'detail', 'detail_vi', 'authority', 'status', 'due_date', 'sort'], order: 'sort ASC' },
  documents: { table: 'documents', fields: ['kind', 'title', 'issuer', 'number', 'issued_at', 'expires_at', 'status'], order: 'expires_at ASC', stamp: 'created_at' },
  licenses: { table: 'licenses', fields: ['document_id', 'license_type', 'authority', 'status', 'applied_at', 'granted_at', 'expires_at'], order: 'rowid ASC' },
  trademarks: { table: 'trademarks', fields: ['mark', 'nice_classes', 'office', 'application_no', 'status', 'filed_at'], order: 'rowid ASC' },
  sites: { table: 'sites', fields: ['city', 'district', 'address', 'lat', 'lng', 'score', 'rent_vnd_month', 'status', 'source', 'note'], order: 'score DESC', stamp: 'created_at' },
  matches: { table: 'matches', fields: ['partner_id', 'partner_name', 'role', 'fit', 'why', 'source'], order: 'fit DESC', stamp: 'created_at' },
  deals: { table: 'deals', fields: ['partner_id', 'partner_name', 'stage', 'value_vnd', 'note'], order: 'updated_at DESC', stamp: 'updated_at' },
  channels: { table: 'channels', fields: ['name', 'kind', 'status'], order: 'rowid ASC' },
  campaigns: { table: 'campaigns', fields: ['channel_id', 'name', 'budget_vnd', 'start_date', 'end_date', 'status'], order: 'start_date ASC' },
  kols: { table: 'kols', fields: ['campaign_id', 'handle', 'platform', 'tier', 'status'], order: 'rowid ASC' },
  suppliers: { table: 'suppliers', fields: ['name', 'kind', 'city', 'status'], order: 'rowid ASC' },
  import_items: { table: 'import_items', fields: ['supplier_id', 'sku', 'hs_code', 'permit_required', 'status'], order: 'rowid ASC' },
  budgets: { table: 'budgets', fields: ['department', 'month', 'planned_vnd', 'actual_vnd'], order: 'month ASC' },
  kpis: { table: 'kpis', fields: ['month', 'metric', 'value', 'target'], order: 'month ASC' },
  activity: { table: 'activity', fields: ['actor', 'action', 'detail'], order: 'created_at DESC', stamp: 'created_at' },
  verdicts: { table: 'verdicts', fields: [], order: 'created_at DESC' },
  agent_runs: { table: 'agent_runs', fields: [], order: 'started_at DESC' }
};

export async function logActivity(env: Env, projectId: string, actor: string, action: string, detail?: string) {
  const d = maybeDb(env);
  if (!d) return;
  await d.prepare('INSERT INTO activity (id, project_id, actor, action, detail, created_at) VALUES (?,?,?,?,?,?)')
    .bind(uid(), projectId, actor, action, detail ?? null, now()).run();
}

export async function getProjectRow(env: Env, id: string, ownerId?: string | null) {
  const row: any = await db(env).prepare('SELECT * FROM brand_projects WHERE id = ?').bind(id).first();
  if (!row) throw new HttpError(404, 'Project not found');
  if (ownerId !== undefined && !row.is_demo && row.owner_id !== ownerId) throw new HttpError(404, 'Project not found');
  return row;
}

export async function listProjects(env: Env, ownerId: string) {
  const { results } = await db(env)
    .prepare(`SELECT p.*, (SELECT verdict FROM verdicts v WHERE v.project_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_verdict,
      (SELECT opportunity_index FROM verdicts v WHERE v.project_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_index
      FROM brand_projects p WHERE p.owner_id = ? ORDER BY p.updated_at DESC`)
    .bind(ownerId).all();
  return results;
}

export async function createProject(env: Env, ownerId: string, body: any, opts: { demo?: boolean } = {}) {
  const brand = typeof body?.brand === 'string' ? body.brand.trim().slice(0, 80) : '';
  const city = normalizeCity(body?.city);
  const category = normalizeCategory(body?.category);
  if (!brand || !city || !category) throw new HttpError(400, 'brand, city and category are required');
  const id = typeof body?.id === 'string' && opts.demo ? body.id : uid();
  const ts = now();
  const d = db(env);
  const stmts: Stmt[] = [
    d.prepare('INSERT INTO brand_projects (id, owner_id, brand, city, category, stage, description, is_demo, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(id, ownerId, brand, city, category, 'discover', body?.description ?? null, opts.demo ? 1 : 0, ts, ts)
  ];
  for (const m of buildPlaybook(city, category)) {
    stmts.push(
      d.prepare('INSERT INTO milestones (id, project_id, phase, department, title, title_vi, detail, detail_vi, authority, status, due_date, sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(uid(), id, m.phase, m.department, m.title, m.title_vi, m.detail, m.detail_vi, m.authority ?? null, 'todo', m.due_date, m.sort)
    );
  }
  stmts.push(d.prepare('INSERT INTO activity (id, project_id, actor, action, detail, created_at) VALUES (?,?,?,?,?,?)')
    .bind(uid(), id, 'system', 'project.created', `Vietnam playbook generated for ${CITY_NAMES[city]}`, ts));
  await d.batch(stmts);
  return getProjectFull(env, id);
}

export async function updateProject(env: Env, id: string, ownerId: string | null, body: any) {
  await getProjectRow(env, id, ownerId);
  const sets: string[] = [];
  const vals: any[] = [];
  if (typeof body?.brand === 'string' && body.brand.trim()) { sets.push('brand = ?'); vals.push(body.brand.trim().slice(0, 80)); }
  if (typeof body?.description === 'string') { sets.push('description = ?'); vals.push(body.description.slice(0, 2000)); }
  if (PHASES.includes(body?.stage)) { sets.push('stage = ?'); vals.push(body.stage); }
  if (body?.city && normalizeCity(body.city)) { sets.push('city = ?'); vals.push(normalizeCity(body.city)); }
  if (body?.category && normalizeCategory(body.category)) { sets.push('category = ?'); vals.push(normalizeCategory(body.category)); }
  if (sets.length === 0) throw new HttpError(400, 'Nothing to update');
  sets.push('updated_at = ?');
  vals.push(now(), id);
  await db(env).prepare(`UPDATE brand_projects SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  await logActivity(env, id, 'user', 'project.updated', sets.filter((s) => !s.startsWith('updated_at')).map((s) => s.split(' ')[0]).join(', '));
  return getProjectFull(env, id);
}

export async function deleteProject(env: Env, id: string, ownerId: string | null) {
  const row = await getProjectRow(env, id, ownerId);
  if (row.owner_id !== ownerId) throw new HttpError(403, 'Demo projects of other users cannot be deleted');
  const d = db(env);
  // D1 enforces foreign keys, but delete children explicitly for safety.
  const stmts = Object.values(COLLECTIONS)
    .filter((c) => c.table !== 'agent_runs')
    .map((c) => d.prepare(`DELETE FROM ${c.table} WHERE project_id = ?`).bind(id));
  stmts.push(d.prepare('DELETE FROM opportunity_index WHERE project_id = ?').bind(id));
  stmts.push(d.prepare('DELETE FROM agent_outputs WHERE run_id IN (SELECT id FROM agent_runs WHERE project_id = ?)').bind(id));
  stmts.push(d.prepare('DELETE FROM agent_runs WHERE project_id = ?').bind(id));
  stmts.push(d.prepare('DELETE FROM brand_projects WHERE id = ?').bind(id));
  await d.batch(stmts);
  return { ok: true };
}

export async function listCollection(env: Env, projectId: string, name: string) {
  const c = COLLECTIONS[name];
  if (!c) throw new HttpError(404, 'Unknown collection');
  const { results } = await db(env).prepare(`SELECT * FROM ${c.table} WHERE project_id = ? ORDER BY ${c.order} LIMIT 500`).bind(projectId).all();
  return results;
}

export async function getProjectFull(env: Env, id: string, ownerId?: string | null) {
  const project = await getProjectRow(env, id, ownerId);
  const out: any = { ...project, is_demo: Boolean(project.is_demo) };
  for (const name of Object.keys(COLLECTIONS)) {
    if (name === 'agent_runs') continue;
    const rows: any[] = await listCollection(env, id, name);
    if (name === 'verdicts') {
      out.verdicts = rows.slice(0, 5).map((v) => ({ ...v, result: safeJson(v.result_json), evidence: safeJson(v.evidence_json), result_json: undefined, evidence_json: undefined }));
    } else if (name === 'activity') {
      out.activity = rows.slice(0, 100);
    } else {
      out[name] = rows;
    }
  }
  out.latestVerdict = out.verdicts?.[0] || null;
  return out;
}

const pick = (body: any, fields: string[]) => {
  const cols: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (body && Object.prototype.hasOwnProperty.call(body, f)) {
      const v = body[f];
      cols.push(f);
      vals.push(v === undefined ? null : typeof v === 'string' ? v.slice(0, 2000) : v);
    }
  }
  return { cols, vals };
};

export async function createItem(env: Env, projectId: string, name: string, body: any) {
  const c = COLLECTIONS[name];
  if (!c || c.fields.length === 0) throw new HttpError(404, 'Unknown or read-only collection');
  const { cols, vals } = pick(body, c.fields);
  const id = uid();
  const allCols = ['id', 'project_id', ...cols];
  const allVals: any[] = [id, projectId, ...vals];
  if (c.stamp) { allCols.push(c.stamp); allVals.push(now()); }
  try {
    await db(env).prepare(`INSERT INTO ${c.table} (${allCols.join(',')}) VALUES (${allCols.map(() => '?').join(',')})`).bind(...allVals).run();
  } catch (err: any) {
    throw new HttpError(400, `Could not create ${name}: ${String(err?.message || err).slice(0, 160)}`);
  }
  if (name !== 'activity') await logActivity(env, projectId, 'user', `${name}.created`, String(body?.title || body?.name || body?.partner_name || body?.district || body?.metric || body?.mark || ''));
  await touch(env, projectId);
  return db(env).prepare(`SELECT * FROM ${c.table} WHERE id = ?`).bind(id).first();
}

export async function updateItem(env: Env, projectId: string, name: string, itemId: string, body: any) {
  const c = COLLECTIONS[name];
  if (!c || c.fields.length === 0) throw new HttpError(404, 'Unknown or read-only collection');
  const { cols, vals } = pick(body, c.fields);
  if (c.stamp === 'updated_at') { cols.push('updated_at'); vals.push(now()); }
  if (cols.length === 0) throw new HttpError(400, 'Nothing to update');
  const res = await db(env).prepare(`UPDATE ${c.table} SET ${cols.map((x) => `${x} = ?`).join(', ')} WHERE id = ? AND project_id = ?`).bind(...vals, itemId, projectId).run();
  if (!res.meta?.changes) throw new HttpError(404, 'Item not found');
  await logActivity(env, projectId, 'user', `${name}.updated`, cols.filter((x) => x !== 'updated_at').map((x) => `${x}=${String(body[x]).slice(0, 40)}`).join(', '));
  await touch(env, projectId);
  return db(env).prepare(`SELECT * FROM ${c.table} WHERE id = ?`).bind(itemId).first();
}

export async function deleteItem(env: Env, projectId: string, name: string, itemId: string) {
  const c = COLLECTIONS[name];
  if (!c || c.fields.length === 0) throw new HttpError(404, 'Unknown or read-only collection');
  const res = await db(env).prepare(`DELETE FROM ${c.table} WHERE id = ? AND project_id = ?`).bind(itemId, projectId).run();
  if (!res.meta?.changes) throw new HttpError(404, 'Item not found');
  await logActivity(env, projectId, 'user', `${name}.deleted`, itemId);
  return { ok: true };
}

async function touch(env: Env, projectId: string) {
  await db(env).prepare('UPDATE brand_projects SET updated_at = ? WHERE id = ?').bind(now(), projectId).run();
}

export function safeJson(s: unknown) {
  if (typeof s !== 'string') return null;
  try { return JSON.parse(s); } catch { return null; }
}

// ───────── Agent audit log ─────────
export async function startRun(env: Env, kind: string, projectId: string | null, input: unknown) {
  const d = maybeDb(env);
  if (!d) return null;
  const id = uid();
  await d.prepare('INSERT INTO agent_runs (id, project_id, kind, status, input_json, started_at) VALUES (?,?,?,?,?,?)')
    .bind(id, projectId, kind, 'running', JSON.stringify(input).slice(0, 4000), now()).run();
  return id;
}

export async function finishRun(env: Env, runId: string | null, ok: boolean, info: { provider?: string; model?: string; error?: string; agents?: { id: string; summary: string; findings: string[] }[] }) {
  const d = maybeDb(env);
  if (!d || !runId) return;
  const stmts = [
    d.prepare('UPDATE agent_runs SET status = ?, provider = ?, model = ?, error = ?, finished_at = ? WHERE id = ?')
      .bind(ok ? 'ok' : 'error', info.provider ?? null, info.model ?? null, info.error ?? null, now(), runId)
  ];
  for (const a of info.agents || []) {
    stmts.push(d.prepare('INSERT INTO agent_outputs (id, run_id, agent_id, summary, findings_json) VALUES (?,?,?,?,?)')
      .bind(uid(), runId, a.id, a.summary, JSON.stringify(a.findings)));
  }
  await d.batch(stmts);
}

/** Persist an analysis onto a project: verdict, opportunity index, agent matches and heat-map sites. */
export async function saveAnalysis(env: Env, projectId: string, runId: string | null, out: any) {
  const d = db(env);
  const project = await getProjectRow(env, projectId);
  const vid = uid();
  const ts = now();
  const r = out.result;
  const stmts: Stmt[] = [
    d.prepare('INSERT INTO verdicts (id, project_id, agent_run_id, verdict, confidence, opportunity_index, headline, rationale, result_json, evidence_json, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(vid, projectId, runId, r.verdict, r.confidence, r.opportunityIndex, r.headline, r.verdictRationale, JSON.stringify(r), JSON.stringify(out.evidence), ts),
    d.prepare('INSERT INTO opportunity_index (id, project_id, verdict_id, city, category, value, as_of) VALUES (?,?,?,?,?,?,?)')
      .bind(uid(), projectId, vid, project.city, project.category, r.opportunityIndex, ts),
    d.prepare("DELETE FROM matches WHERE project_id = ? AND source = 'agent'").bind(projectId)
  ];
  for (const p of r.partners || []) {
    stmts.push(d.prepare('INSERT INTO matches (id, project_id, partner_name, role, fit, why, source, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uid(), projectId, p.name, p.role, p.fit, p.why, 'agent', ts));
  }
  stmts.push(d.prepare('INSERT INTO activity (id, project_id, actor, action, detail, created_at) VALUES (?,?,?,?,?,?)')
    .bind(uid(), projectId, 'agent:verdictSynthesizer', 'analysis.completed', `${r.verdict} · Opportunity Index ${r.opportunityIndex}`, ts));
  stmts.push(d.prepare('UPDATE brand_projects SET updated_at = ? WHERE id = ?').bind(ts, projectId));
  await d.batch(stmts);
  return vid;
}

// ───────── Partner directory (DEMO DATA + public platforms) ─────────
const PARTNER_SEED = [
  ['p-mechan', 'Mechan Coffee Group', 'operator', 'hcmc,hanoi', 'coffee_tea,food_beverage', 'DEMO DATA — multi-brand premium café operator.', 'DỮ LIỆU MẪU — đơn vị vận hành chuỗi cà phê cao cấp đa thương hiệu.', 1],
  ['p-saigon-retail', 'Saigon Retail Partners', 'operator', 'hcmc', 'fashion,beauty', 'DEMO DATA — anchor-tenant relationships in premium malls.', 'DỮ LIỆU MẪU — quan hệ thuê trụ đỡ tại TTTM cao cấp.', 1],
  ['p-hanoi-fb', 'Hanoi F&B Holdings', 'operator', 'hanoi', 'food_beverage', 'DEMO DATA — family-dining specialist with distribution in the north.', 'DỮ LIỆU MẪU — chuyên ẩm thực gia đình, có phân phối miền Bắc.', 1],
  ['p-vina-franchise', 'Vina Franchise Group', 'franchisee', 'danang,hanoi', 'food_beverage,wellness', 'DEMO DATA — signs master-franchise rights for mid-size brands.', 'DỮ LIỆU MẪU — nhận nhượng quyền chính cho thương hiệu vừa.', 1],
  ['p-central-coast', 'Central Coast Operators', 'operator', 'danang', 'home_living', 'DEMO DATA — boutique retail in tourism districts.', 'DỮ LIỆU MẪU — bán lẻ boutique tại khu du lịch.', 1],
  ['p-rosewood', 'Rosewood F&B Collective', 'franchisee', 'hcmc,danang', 'coffee_tea', 'DEMO DATA — founder-led collective opening brands each year.', 'DỮ LIỆU MẪU — nhóm sáng lập mở thương hiệu mới mỗi năm.', 1],
  ['p-grabfood', 'GrabFood', 'delivery', 'hcmc,hanoi,danang', 'food_beverage,coffee_tea', 'Food delivery app (Grab).', 'Ứng dụng giao đồ ăn (Grab).', 0],
  ['p-shopeefood', 'ShopeeFood', 'delivery', 'hcmc,hanoi,danang', 'food_beverage,coffee_tea', 'Food delivery app (Shopee).', 'Ứng dụng giao đồ ăn (Shopee).', 0],
  ['p-tiktokshop', 'TikTok Shop', 'ecommerce', 'hcmc,hanoi,danang', 'fashion,beauty,electronics,home_living,food_beverage', 'Social commerce marketplace.', 'Sàn thương mại xã hội.', 0],
  ['p-shopee', 'Shopee', 'ecommerce', 'hcmc,hanoi,danang', 'fashion,beauty,electronics,home_living,wellness', 'E-commerce marketplace.', 'Sàn thương mại điện tử.', 0],
  ['p-zalo', 'Zalo Official Account', 'crm', 'hcmc,hanoi,danang', 'food_beverage,coffee_tea,fashion,beauty,electronics,wellness,home_living', 'Messaging-based CRM channel.', 'Kênh CRM qua nhắn tin.', 0]
];

export async function ensurePartnerSeed(env: Env) {
  const d = db(env);
  const row: any = await d.prepare('SELECT COUNT(*) AS n FROM partners').first();
  if (row && row.n > 0) return;
  await d.batch(PARTNER_SEED.map((p) => d.prepare('INSERT OR IGNORE INTO partners (id, name, type, cities, categories, note, note_vi, is_demo) VALUES (?,?,?,?,?,?,?,?)').bind(...p)));
}

export async function searchPartners(env: Env, city?: string | null, type?: string | null) {
  await ensurePartnerSeed(env);
  const where: string[] = [];
  const vals: any[] = [];
  const c = city ? normalizeCity(city) : null;
  if (city && !c) throw new HttpError(400, 'Unknown city');
  if (c) { where.push("(',' || cities || ',') LIKE ?"); vals.push(`%,${c},%`); }
  if (type) { where.push('type = ?'); vals.push(String(type).toLowerCase()); }
  const { results } = await d1All(env, `SELECT * FROM partners ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY is_demo ASC, name ASC`, vals);
  return results.map((p: any) => ({ ...p, is_demo: Boolean(p.is_demo) }));
}

async function d1All(env: Env, sql: string, vals: any[]) {
  return db(env).prepare(sql).bind(...vals).all();
}

/** Seeds one DEMO project for an owner (idempotent per owner). All rows are labelled DEMO DATA. */
export async function seedDemoProject(env: Env, ownerId: string) {
  const d = db(env);
  const existing: any = await d.prepare('SELECT id FROM brand_projects WHERE owner_id = ? AND is_demo = 1 LIMIT 1').bind(ownerId).first();
  if (existing) return getProjectFull(env, existing.id);
  const project = await createProject(env, ownerId, {
    brand: 'Harbor & Pine Coffee (DEMO)',
    city: 'hcmc',
    category: 'coffee_tea',
    description: 'DEMO DATA — fictional specialty-coffee brand used to show the workspace. Replace with your own project.'
  }, { demo: true });
  const id = project.id;
  const ts = now();
  const months = lastMonths(6);
  const stmts: Stmt[] = [
    d.prepare('UPDATE brand_projects SET stage = ? WHERE id = ?').bind('setup', id),
    d.prepare("UPDATE milestones SET status = 'done' WHERE project_id = ? AND phase IN ('discover','validate') AND sort > 0").bind(id),
    d.prepare("UPDATE milestones SET status = 'doing' WHERE project_id = ? AND phase = 'setup' AND sort IN (SELECT sort FROM milestones WHERE project_id = ? AND phase = 'setup' ORDER BY sort LIMIT 2)").bind(id, id)
  ];
  const doc = (kind: string, title: string, issuer: string, expires: string | null, status: string) =>
    d.prepare('INSERT INTO documents (id, project_id, kind, title, issuer, number, issued_at, expires_at, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(uid(), id, kind, `${title} (DEMO)`, issuer, 'DEMO-0000', null, expires, status, ts);
  stmts.push(
    doc('trademark', 'Trademark application — classes 30, 43', 'IP Vietnam', null, 'pending'),
    doc('erc', 'Enterprise Registration Certificate', 'HCMC Department of Finance', null, 'active'),
    doc('food_safety', 'Food safety eligibility certificate', 'HCMC Food Safety Management Board', addDays(25), 'active'),
    doc('lease', 'Lease — District 1 site', 'Landlord', addDays(-3), 'expired'),
    doc('import_permit', 'Import product declaration — roasted beans', 'Customs', addDays(200), 'active'),
    d.prepare('INSERT INTO trademarks (id, project_id, mark, nice_classes, office, application_no, status, filed_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uid(), id, 'HARBOR & PINE (DEMO)', '30,43', 'IP Vietnam', 'DEMO', 'filed', ts.slice(0, 10))
  );
  for (const n of NEIGHBORHOODS.hcmc.slice(0, 3)) {
    stmts.push(d.prepare('INSERT INTO sites (id, project_id, city, district, address, lat, lng, score, rent_vnd_month, status, source, note, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(uid(), id, 'hcmc', n.name, null, n.lat, n.lng, null, null, 'shortlist', 'demo', 'DEMO DATA — run an analysis to score districts', ts));
  }
  const deal = (name: string, pid: string, stage: string) =>
    d.prepare('INSERT INTO deals (id, project_id, partner_id, partner_name, stage, value_vnd, note, updated_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uid(), id, pid, name, stage, null, 'DEMO DATA', ts);
  await ensurePartnerSeed(env);
  stmts.push(deal('Mechan Coffee Group', 'p-mechan', 'intro'), deal('Rosewood F&B Collective', 'p-rosewood', 'termsheet'), deal('GrabFood', 'p-grabfood', 'signed'));
  for (const [name, kind] of [['GrabFood', 'delivery'], ['ShopeeFood', 'delivery'], ['TikTok Shop', 'social'], ['Zalo OA', 'crm']]) {
    stmts.push(d.prepare('INSERT INTO channels (id, project_id, name, kind, status) VALUES (?,?,?,?,?)').bind(uid(), id, name, kind, 'planned'));
  }
  stmts.push(d.prepare('INSERT INTO kols (id, project_id, handle, platform, tier, status) VALUES (?,?,?,?,?,?)').bind(uid(), id, '@demo_creator', 'TikTok', 'micro', 'prospect'));
  stmts.push(d.prepare('INSERT INTO suppliers (id, project_id, name, kind, city, status) VALUES (?,?,?,?,?,?)').bind(uid(), id, 'DEMO Local Roaster', 'local_roaster', 'hcmc', 'prospect'));
  // Illustrative KPI series — clearly DEMO DATA, not real results.
  const demoOrders = [0, 0, 120, 340, 610, 820];
  const demoRevenue = [0, 0, 9_000_000, 26_000_000, 47_000_000, 63_000_000];
  months.forEach((m, i) => {
    stmts.push(d.prepare('INSERT INTO kpis (id, project_id, month, metric, value, target) VALUES (?,?,?,?,?,?)').bind(uid(), id, m, 'orders', demoOrders[i], 150 * i));
    stmts.push(d.prepare('INSERT INTO kpis (id, project_id, month, metric, value, target) VALUES (?,?,?,?,?,?)').bind(uid(), id, m, 'revenue_vnd', demoRevenue[i], 12_000_000 * i));
    stmts.push(d.prepare('INSERT INTO budgets (id, project_id, department, month, planned_vnd, actual_vnd) VALUES (?,?,?,?,?,?)').bind(uid(), id, 'marketing', m, 20_000_000, i < 2 ? 5_000_000 : 18_000_000));
  });
  stmts.push(d.prepare('INSERT INTO activity (id, project_id, actor, action, detail, created_at) VALUES (?,?,?,?,?,?)').bind(uid(), id, 'system', 'demo.seeded', 'DEMO DATA loaded — fictional brand and illustrative numbers', ts));
  await d.batch(stmts);
  return getProjectFull(env, id);
}

function addDays(n: number) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}
function lastMonths(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(x.toISOString().slice(0, 7));
  }
  return out;
}
