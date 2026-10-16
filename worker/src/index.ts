import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { HttpError } from './env';
import { parseAnalyzeInput, runAnalysis } from './analyze';
import { extractUploadText, parseLocalizeInput, runLocalize } from './localize';
import { runCopilot } from './copilot';
import { handleMcp, TOOLS, SERVER_INFO } from './mcp';
import { QlooError } from './qloo';
import { pickProvider } from './llm';
import {
  COLLECTIONS, createItem, createProject, deleteItem, deleteProject, finishRun, getProjectFull, getProjectRow,
  listCollection, listProjects, saveAnalysis, searchPartners, seedDemoProject, startRun, updateItem, updateProject
} from './db';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', async (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (allowed.includes(origin) || /^https:\/\/[a-z0-9-]+\.tastebridge\.pages\.dev$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) return origin;
      return allowed[0] || '*';
    },
    allowHeaders: ['Content-Type', 'X-Owner-Id'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400
  })(c, next);
});

app.onError((err, c) => {
  if (err instanceof QlooError) {
    return c.json({ error: 'Taste AI data is unavailable. No analysis was produced.', detail: err.message, code: 'qloo_unavailable' }, 502);
  }
  if (err instanceof HttpError) return c.json({ error: err.message, code: err.code }, err.status as any);
  console.error(err);
  return c.json({ error: (err as Error)?.message || 'Internal error' }, 500);
});

/** Per-browser demo identity: the web app generates a random id and sends it as X-Owner-Id. */
const owner = (c: any): string => {
  const id = c.req.header('X-Owner-Id') || '';
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(id)) throw new HttpError(401, 'Missing or invalid X-Owner-Id header');
  return id;
};

app.get('/', (c) => c.json({ name: 'TasteBridge API', version: SERVER_INFO.version, docs: '/api/health', mcp: '/mcp' }));

app.get('/api/health', (c) => {
  let llm: string | null = null;
  try { llm = pickProvider(c.env).provider; } catch { llm = null; }
  return c.json({ ok: true, version: SERVER_INFO.version, qloo: Boolean(c.env.QLOO_API_KEY), llm, db: c.env.DB ? "d1" : c.env.STORE ? "durable-object-sqlite" : null, mcpTools: TOOLS.map((t) => t.name) });
});

// ───────── Agents ─────────
app.post('/api/analyze', async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseAnalyzeInput(body);
  const projectId = typeof body?.project_id === 'string' ? body.project_id : null;
  let ownerId: string | null = null;
  if (projectId) { ownerId = owner(c); await getProjectRow(c.env, projectId, ownerId); }
  const runId = await startRun(c.env, 'analyze', projectId, input).catch(() => null);
  try {
    const out = await runAnalysis(c.env, input);
    await finishRun(c.env, runId, true, { provider: out.meta.provider, model: out.meta.model, agents: out.result.agents }).catch(() => {});
    let verdictId: string | null = null;
    if (projectId) verdictId = await saveAnalysis(c.env, projectId, runId, out);
    return c.json({ ...out, runId, verdictId });
  } catch (err: any) {
    await finishRun(c.env, runId, false, { error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    throw err;
  }
});

app.post('/api/localize-plan', async (c) => {
  const ct = c.req.header('Content-Type') || '';
  let body: any;
  if (ct.includes('multipart/form-data')) {
    const form = await c.req.formData();
    const file = form.get('file');
    let text = String(form.get('plan_text') || '');
    if (file && typeof file !== 'string') text = (await extractUploadText(file as File)) + (text ? `\n\n${text}` : '');
    body = { plan_text: text, city: form.get('city'), category: form.get('category'), brand: form.get('brand'), lang: form.get('lang'), project_id: form.get('project_id') };
  } else {
    body = await c.req.json().catch(() => null);
  }
  const input = parseLocalizeInput(body);
  const projectId = typeof body?.project_id === 'string' && body.project_id ? body.project_id : null;
  if (projectId) await getProjectRow(c.env, projectId, owner(c));
  const runId = await startRun(c.env, 'localize', projectId, { ...input, planText: `${input.planText.slice(0, 200)}…` }).catch(() => null);
  try {
    const out = await runLocalize(c.env, input);
    await finishRun(c.env, runId, true, { provider: out.meta.provider, model: out.meta.model }).catch(() => {});
    return c.json({ ...out, runId });
  } catch (err: any) {
    await finishRun(c.env, runId, false, { error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    throw err;
  }
});

app.post('/api/projects/:id/copilot', async (c) => {
  const project = await getProjectFull(c.env, c.req.param('id'), owner(c));
  const body = await c.req.json().catch(() => null);
  const runId = await startRun(c.env, 'copilot', project.id, { message: String(body?.message || '').slice(0, 300) }).catch(() => null);
  try {
    const out = await runCopilot(c.env, project, body);
    await finishRun(c.env, runId, true, { provider: out.meta.provider, model: out.meta.model }).catch(() => {});
    return c.json(out);
  } catch (err: any) {
    await finishRun(c.env, runId, false, { error: String(err?.message || err).slice(0, 500) }).catch(() => {});
    throw err;
  }
});

// ───────── Projects (Brand Workspace) ─────────
app.get('/api/projects', async (c) => {
  const ownerId = owner(c);
  let projects = await listProjects(c.env, ownerId);
  if (projects.length === 0 && c.req.query('seed') === '1') {
    await seedDemoProject(c.env, ownerId);
    projects = await listProjects(c.env, ownerId);
  }
  return c.json({ projects });
});
app.post('/api/projects', async (c) => c.json(await createProject(c.env, owner(c), await c.req.json().catch(() => null)), 201));
app.post('/api/projects/demo', async (c) => c.json(await seedDemoProject(c.env, owner(c)), 201));
app.get('/api/projects/:id', async (c) => c.json(await getProjectFull(c.env, c.req.param('id'), owner(c))));
app.patch('/api/projects/:id', async (c) => c.json(await updateProject(c.env, c.req.param('id'), owner(c), await c.req.json().catch(() => null))));
app.delete('/api/projects/:id', async (c) => c.json(await deleteProject(c.env, c.req.param('id'), owner(c))));

app.get('/api/projects/:id/:collection', async (c) => {
  const p = await getProjectRow(c.env, c.req.param('id'), owner(c));
  if (!COLLECTIONS[c.req.param('collection')]) throw new HttpError(404, 'Unknown collection');
  return c.json({ items: await listCollection(c.env, p.id, c.req.param('collection')) });
});
app.post('/api/projects/:id/:collection', async (c) => {
  const p = await getProjectRow(c.env, c.req.param('id'), owner(c));
  return c.json(await createItem(c.env, p.id, c.req.param('collection'), await c.req.json().catch(() => null)), 201);
});
app.patch('/api/projects/:id/:collection/:itemId', async (c) => {
  const p = await getProjectRow(c.env, c.req.param('id'), owner(c));
  return c.json(await updateItem(c.env, p.id, c.req.param('collection'), c.req.param('itemId'), await c.req.json().catch(() => null)));
});
app.delete('/api/projects/:id/:collection/:itemId', async (c) => {
  const p = await getProjectRow(c.env, c.req.param('id'), owner(c));
  return c.json(await deleteItem(c.env, p.id, c.req.param('collection'), c.req.param('itemId')));
});

app.get('/api/partners', async (c) => c.json({ partners: await searchPartners(c.env, c.req.query('city'), c.req.query('type')) }));

// ───────── MCP ─────────
app.all('/mcp', (c) => handleMcp(c.req.raw, c.env));

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export { TasteStore } from "./store";
export default app;
