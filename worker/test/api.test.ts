import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';
import { normalizeCategory, normalizeCity } from '../src/catalog';
import { buildPlaybook } from '../src/playbook';

const ENV = { QLOO_API_KEY: 'test-qloo', GROQ_API_KEY: 'test-groq', QLOO_BASE: 'https://hackathon.api.qloo.com' };

const LLM_VERDICT = {
  verdict: 'PILOT',
  confidence: 64,
  opportunityIndex: 61,
  headline: 'Promising but premium-sensitive',
  verdictRationale: 'Measured affinity is solid; price headroom is limited.',
  memoIntro: 'Memo intro',
  agents: [
    { id: 'brandProfiler', summary: 'Premium third-wave brand.', findings: ['a', 'b'] },
    { id: 'verdictSynthesizer', summary: 'Pilot first.', findings: ['c', 'd'] },
    { id: 'notAnAgent', summary: 'dropped', findings: [] }
  ],
  affinity: { overall: 70, cultural: 66, audience: 72, competition: 40, price: 45 },
  segments: [{ name: 'Young professionals', appeal: 80, why: 'Café culture' }],
  competitors: [{ name: 'The Coffee House', positioning: 'Mass premium', threat: 'high' }],
  risks: [{ risk: 'Price', severity: 'severe', mitigation: 'Smaller sizes' }],
  channels: ['GrabFood'],
  partners: [{ name: 'GrabFood', role: 'Delivery', fit: 77, why: 'Reach' }],
  neighborhoods: [{ name: 'District 1', score: 88, note: 'CBD' }, { name: 'Atlantis', score: 99, note: 'fake' }]
};

function mockFetch(opts: { qlooStatus?: number; brandFound?: boolean; llm?: unknown } = {}) {
  const calls: string[] = [];
  const fn = vi.fn(async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push(url);
    if (url.startsWith('https://hackathon.api.qloo.com')) {
      expect(init?.headers?.['X-Api-Key']).toBe('test-qloo');
      if (opts.qlooStatus && opts.qlooStatus !== 200) return new Response('err', { status: opts.qlooStatus });
      const u = new URL(url);
      if (u.pathname === '/search' && u.searchParams.get('types') === 'urn:entity:brand') {
        const q = u.searchParams.get('query');
        if (q === 'specialty coffee') return Response.json({ results: [{ entity_id: 'CAT1', name: 'Cat brand' }] });
        return Response.json({ results: opts.brandFound === false ? [] : [{ entity_id: 'B1', name: 'Blue Bottle Coffee', popularity: 0.91, tags: [{ name: 'Coffee' }, 'Minimalist'] }] });
      }
      if (u.pathname === '/v2/insights') return Response.json({ results: { entities: [{ name: 'Stumptown', query: { affinity: 0.873 } }] } });
      if (u.pathname === '/search') return Response.json({ results: [{ name: 'Workshop Coffee' }, { name: 'Shin Coffee' }] });
    }
    if (url.startsWith('https://api.groq.com')) {
      expect(init?.headers?.Authorization).toBe('Bearer test-groq');
      return Response.json({ choices: [{ message: { content: JSON.stringify(opts.llm ?? LLM_VERDICT) } }] });
    }
    throw new Error(`unexpected fetch ${url}`);
  });
  vi.stubGlobal('fetch', fn);
  return { fn, calls };
}

const post = (path: string, body: unknown, env: any = ENV, headers: Record<string, string> = {}) =>
  app.request(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }, env);

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('catalog', () => {
  it('normalises cities and categories', () => {
    expect(normalizeCity('Ho Chi Minh City')).toBe('hcmc');
    expect(normalizeCity('Hà Nội')).toBe('hanoi');
    expect(normalizeCity('danang')).toBe('danang');
    expect(normalizeCity('Paris')).toBeNull();
    expect(normalizeCategory('Coffee')).toBe('coffee_tea');
    expect(normalizeCategory('skincare')).toBe('beauty');
  });
  it('builds a dated playbook covering all five phases', () => {
    const steps = buildPlaybook('hcmc', 'coffee_tea', new Date('2026-01-01T00:00:00Z'));
    expect(new Set(steps.map((s) => s.phase))).toEqual(new Set(['discover', 'validate', 'setup', 'launch', 'scale']));
    expect(steps.some((s) => /IP Vietnam/.test(s.authority || ''))).toBe(true);
    expect(steps.some((s) => /Food safety/i.test(s.title))).toBe(true);
    expect(buildPlaybook('hcmc', 'fashion').some((s) => /Food safety/i.test(s.title))).toBe(false);
  });
});

describe('POST /api/analyze', () => {
  it('rejects invalid input with 400', async () => {
    mockFetch();
    const res = await post('/api/analyze', { brandName: '', city: 'hcmc', category: 'coffee_tea' });
    expect(res.status).toBe(400);
  });

  it('returns a verdict grounded in Qloo evidence (sanitised)', async () => {
    const { calls } = mockFetch();
    const res = await post('/api/analyze', { brandName: 'Blue Bottle Coffee', city: 'Ho Chi Minh City', category: 'Coffee' });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.result.verdict).toBe('PILOT');
    expect(data.result.agents.map((a: any) => a.id)).toEqual(['brandProfiler', 'verdictSynthesizer']);
    expect(data.result.risks[0].severity).toBe('medium');
    expect(data.result.neighborhoods).toEqual([{ name: 'District 1', score: 88, note: 'CBD' }]);
    expect(data.evidence.matchedName).toBe('Blue Bottle Coffee');
    expect(data.evidence.brandTags).toEqual(['Coffee', 'Minimalist']);
    expect(data.evidence.relatedBrands[0]).toEqual({ name: 'Stumptown', affinity: 0.87 });
    expect(data.evidence.cityPlaces).toContain('Workshop Coffee');
    const insights = calls.find((u) => u.includes('/v2/insights'))!;
    expect(new URL(insights).searchParams.get('signal.interests.entities')).toBe('B1');
  });

  it('falls back to category signals when the brand is unknown', async () => {
    const { calls } = mockFetch({ brandFound: false });
    const res = await post('/api/analyze', { brandName: 'Unknown Brand', city: 'hanoi', category: 'coffee_tea' });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.evidence.brandFound).toBe(false);
    const insights = calls.find((u) => u.includes('/v2/insights'))!;
    expect(new URL(insights).searchParams.get('signal.interests.entities')).toBe('CAT1');
  });

  it('errors (502) instead of inventing data when Qloo fails', async () => {
    mockFetch({ qlooStatus: 500 });
    const res = await post('/api/analyze', { brandName: 'Blue Bottle Coffee', city: 'hcmc', category: 'coffee_tea' });
    expect(res.status).toBe(502);
    expect(((await res.json()) as any).code).toBe('qloo_unavailable');
  });

  it('errors when the Qloo key is missing', async () => {
    mockFetch();
    const res = await post('/api/analyze', { brandName: 'X', city: 'hcmc', category: 'coffee_tea' }, { GROQ_API_KEY: 'k' });
    expect(res.status).toBe(502);
  });

  it('errors when the LLM returns no verdict', async () => {
    mockFetch({ llm: { nope: true } });
    const res = await post('/api/analyze', { brandName: 'Blue Bottle Coffee', city: 'hcmc', category: 'coffee_tea' });
    expect(res.status).toBe(502);
  });

  it('errors 503 when no LLM key is configured', async () => {
    mockFetch();
    const res = await post('/api/analyze', { brandName: 'Blue Bottle Coffee', city: 'hcmc', category: 'coffee_tea' }, { QLOO_API_KEY: 'test-qloo' });
    expect(res.status).toBe(503);
  });
});

describe('POST /api/localize-plan', () => {
  const plan = 'We sell a 16oz cold brew at $6.50 and pastries at $4 in Portland. Plan: open 3 stores in year one, loyalty app, catering.';
  it('validates plan length and city', async () => {
    mockFetch();
    expect((await post('/api/localize-plan', { plan_text: 'short', city: 'hcmc', category: 'coffee_tea' })).status).toBe(400);
    expect((await post('/api/localize-plan', { plan_text: plan, city: 'Paris', category: 'coffee_tea' })).status).toBe(400);
  });
  it('returns localisation with Qloo evidence', async () => {
    mockFetch({
      llm: {
        summary: 'Adapt sizes and prices.',
        readiness: 55,
        pricing: [{ item: 'Cold brew 16oz', planPrice: '$6.50', suggestedVnd: '55,000–65,000 VND', rationale: 'Local premium band' }],
        productChanges: [{ area: 'Sweetness', current: 'Unsweetened', change: 'Offer condensed-milk option', why: 'Local taste' }],
        channels: [{ name: 'GrabFood', role: 'Delivery', action: 'Launch week 1' }],
        regulations: [{ item: 'Trademark', authority: 'IP Vietnam', action: 'File classes 30/43', phase: 'nonsense' }],
        culturalRisks: [{ risk: 'Price', severity: 'high', mitigation: 'Smaller size' }],
        nextSteps: ['File trademark']
      }
    });
    const res = await post('/api/localize-plan', { plan_text: plan, city: 'hcmc', category: 'coffee_tea', brand: 'Blue Bottle Coffee' });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.result.pricing[0].suggestedVnd).toContain('VND');
    expect(data.result.regulations[0].phase).toBe('setup');
    expect(data.evidence.cityPlaces.length).toBeGreaterThan(0);
  });
});

describe('MCP /mcp', () => {
  const rpc = (body: unknown) => app.request('/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify(body) }, ENV);

  it('initializes and negotiates protocol version', async () => {
    const res = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 't', version: '1' } } });
    const data: any = await res.json();
    expect(data.result.protocolVersion).toBe('2025-03-26');
    expect(data.result.capabilities.tools).toBeDefined();
    expect(data.result.serverInfo.name).toBe('tastebridge');
  });

  it('accepts notifications with 202', async () => {
    const res = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(res.status).toBe(202);
  });

  it('lists the five tools', async () => {
    const res = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const data: any = await res.json();
    expect(data.result.tools.map((t: any) => t.name)).toEqual(['analyze_market_entry', 'localize_business_plan', 'get_project', 'list_milestones', 'search_partners']);
  });

  it('calls analyze_market_entry', async () => {
    mockFetch();
    const res = await rpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'analyze_market_entry', arguments: { brand: 'Blue Bottle Coffee', city: 'hcmc', category: 'coffee_tea' } } });
    const data: any = await res.json();
    expect(data.result.isError).toBeUndefined();
    expect(data.result.structuredContent.verdict).toBe('PILOT');
  });

  it('reports tool errors in-band', async () => {
    const res = await rpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_project', arguments: { project_id: 'x' } } });
    const data: any = await res.json();
    expect(data.result.isError).toBe(true);
  });

  it('rejects GET with 405 and unknown methods with -32601', async () => {
    expect((await app.request('/mcp', { method: 'GET' }, ENV)).status).toBe(405);
    const data: any = await (await rpc({ jsonrpc: '2.0', id: 5, method: 'nope' })).json();
    expect(data.error.code).toBe(-32601);
  });
});

describe('projects API', () => {
  it('requires an owner id', async () => {
    const res = await app.request('/api/projects', {}, ENV);
    expect(res.status).toBe(401);
  });
  it('reports a missing database cleanly', async () => {
    const res = await app.request('/api/projects', { headers: { 'X-Owner-Id': 'owner_12345678' } }, ENV);
    expect(res.status).toBe(503);
  });
});
