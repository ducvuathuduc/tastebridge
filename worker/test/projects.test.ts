// End-to-end tests for the Brand Workspace API against the real TasteStore Durable Object class,
// backed by an in-memory SQLite database (node:sqlite) that mimics ctx.storage.sql.
import { beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import app from '../src/index';
import { TasteStore } from '../src/store';

// Loaded via require: Vite's resolver does not know the node:sqlite builtin yet.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');

function fakeNamespace() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  const ctx: any = {
    blockConcurrencyWhile: (fn: () => any) => fn(),
    storage: {
      transactionSync: (fn: () => any) => {
        db.exec('BEGIN');
        try {
          const r = fn();
          db.exec('COMMIT');
          return r;
        } catch (e) {
          db.exec('ROLLBACK');
          throw e;
        }
      },
      sql: {
        exec: (sql: string, ...params: any[]) => {
          const stmt = db.prepare(sql);
          const isRead = /^\s*(SELECT|PRAGMA|WITH)/i.test(sql);
          if (isRead) {
            const rows = stmt.all(...params);
            return { toArray: () => rows, rowsWritten: 0 };
          }
          const info = stmt.run(...params);
          return { toArray: () => [], rowsWritten: Number(info.changes) };
        }
      }
    }
  };
  const store = new TasteStore(ctx, {});
  const stub = { query: async (q: any) => store.query(q), batch: async (qs: any[]) => store.batch(qs) };
  return { idFromName: () => 'main', get: () => stub } as any;
}

let ENV: any;
const H = { 'Content-Type': 'application/json', 'X-Owner-Id': 'owner_test_123456' };
const req = (path: string, init: RequestInit = {}) => app.request(path, { ...init, headers: { ...H, ...(init.headers || {}) } }, ENV);

beforeEach(() => {
  ENV = { STORE: fakeNamespace() };
});

describe('Brand Workspace API (Durable Object SQLite store)', () => {
  it('creates a project with an auto-generated Vietnam playbook', async () => {
    const res = await req('/api/projects', { method: 'POST', body: JSON.stringify({ brand: 'Test Coffee', city: 'Ho Chi Minh City', category: 'coffee_tea' }) });
    expect(res.status).toBe(201);
    const p: any = await res.json();
    expect(p.city).toBe('hcmc');
    expect(p.stage).toBe('discover');
    expect(p.milestones.length).toBeGreaterThanOrEqual(15);
    expect(p.milestones.some((m: any) => m.authority?.includes('IP Vietnam'))).toBe(true);
    expect(p.activity[0].action).toBe('project.created');

    const list: any = await (await req('/api/projects')).json();
    expect(list.projects).toHaveLength(1);
  });

  it('scopes projects to the owner id', async () => {
    const p: any = await (await req('/api/projects', { method: 'POST', body: JSON.stringify({ brand: 'A', city: 'hanoi', category: 'fashion' }) })).json();
    const other = await app.request(`/api/projects/${p.id}`, { headers: { 'X-Owner-Id': 'someone_else_999' } }, ENV);
    expect(other.status).toBe(404);
  });

  it('supports CRUD on sub-collections and logs activity', async () => {
    const p: any = await (await req('/api/projects', { method: 'POST', body: JSON.stringify({ brand: 'B', city: 'danang', category: 'food_beverage' }) })).json();
    const doc: any = await (await req(`/api/projects/${p.id}/documents`, { method: 'POST', body: JSON.stringify({ kind: 'food_safety', title: 'ATTP', expires_at: '2027-01-01' }) })).json();
    expect(doc.title).toBe('ATTP');
    const upd: any = await (await req(`/api/projects/${p.id}/documents/${doc.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'expired' }) })).json();
    expect(upd.status).toBe('expired');
    const m = p.milestones[0];
    await req(`/api/projects/${p.id}/milestones/${m.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'done' }) });
    const full: any = await (await req(`/api/projects/${p.id}`)).json();
    expect(full.milestones.find((x: any) => x.id === m.id).status).toBe('done');
    expect(full.activity.map((a: any) => a.action)).toEqual(expect.arrayContaining(['documents.created', 'documents.updated', 'milestones.updated']));
    expect((await req(`/api/projects/${p.id}/documents/${doc.id}`, { method: 'DELETE' })).status).toBe(200);
    expect((await req(`/api/projects/${p.id}/nope`)).status).toBe(404);
  });

  it('updates stage and deletes a project with all children', async () => {
    const p: any = await (await req('/api/projects', { method: 'POST', body: JSON.stringify({ brand: 'C', city: 'hcmc', category: 'beauty' }) })).json();
    const upd: any = await (await req(`/api/projects/${p.id}`, { method: 'PATCH', body: JSON.stringify({ stage: 'launch' }) })).json();
    expect(upd.stage).toBe('launch');
    expect((await req(`/api/projects/${p.id}`, { method: 'DELETE' })).status).toBe(200);
    expect((await req(`/api/projects/${p.id}`)).status).toBe(404);
  });

  it('seeds a DEMO project with labelled demo data', async () => {
    const list: any = await (await req('/api/projects?seed=1')).json();
    expect(list.projects).toHaveLength(1);
    const p: any = await (await req(`/api/projects/${list.projects[0].id}`)).json();
    expect(p.is_demo).toBe(true);
    expect(p.brand).toContain('DEMO');
    expect(p.documents.every((d: any) => d.title.includes('(DEMO)'))).toBe(true);
    expect(p.kpis.length).toBeGreaterThan(0);
    expect(p.deals.length).toBe(3);
  });

  it('serves the partner directory and MCP project tools', async () => {
    const partners: any = await (await app.request('/api/partners?city=hcmc&type=delivery', {}, ENV)).json();
    expect(partners.partners.map((x: any) => x.name)).toEqual(expect.arrayContaining(['GrabFood', 'ShopeeFood']));
    const p: any = await (await req('/api/projects', { method: 'POST', body: JSON.stringify({ brand: 'D', city: 'hcmc', category: 'coffee_tea' }) })).json();
    const rpc = async (name: string, args: any) =>
      (await (await app.request('/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }) }, ENV)).json()) as any;
    const ms = await rpc('list_milestones', { project_id: p.id });
    expect(ms.result.structuredContent.milestones.length).toBeGreaterThan(10);
    const gp = await rpc('get_project', { project_id: p.id });
    expect(gp.result.structuredContent.brand).toBe('D');
    const sp = await rpc('search_partners', { city: 'danang' });
    expect(sp.result.structuredContent.partners.length).toBeGreaterThan(0);
  });
});
