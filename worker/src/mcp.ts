// Remote MCP server (Streamable HTTP transport, stateless JSON responses).
// Spec: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http
// POST /mcp accepts a JSON-RPC request, notification or batch. Requests get an application/json
// response; notification-only posts get 202 Accepted. GET returns 405 (no server-initiated stream).

import type { Env } from './env';
import { HttpError } from './env';
import { parseAnalyzeInput, runAnalysis } from './analyze';
import { parseLocalizeInput, runLocalize } from './localize';
import { getProjectFull, listCollection, getProjectRow, searchPartners } from './db';

export const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const SERVER_INFO = { name: 'tastebridge', title: 'TasteBridge Market-Entry OS', version: '1.0.0' };

const CITY_DESC = 'Vietnamese city: "hcmc" (Ho Chi Minh City), "hanoi" or "danang". Full names are accepted.';
const CATEGORY_DESC = 'Category id: food_beverage, coffee_tea, fashion, beauty, electronics, wellness, home_living. Loose names like "Coffee" are accepted.';

export const TOOLS = [
  {
    name: 'analyze_market_entry',
    title: 'Analyze market entry',
    description: 'Run TasteBridge\'s 11-agent market-entry analysis for a brand in a Vietnamese city, grounded in live Qloo Taste AI data. Returns a GO / PILOT / NO-GO verdict, Opportunity Index, affinity scores, segments, competitors, risks, channels, partners and a district heat map. Takes ~20-40s.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'Brand name, e.g. "Blue Bottle Coffee"' },
        city: { type: 'string', description: CITY_DESC },
        category: { type: 'string', description: CATEGORY_DESC },
        lang: { type: 'string', enum: ['en', 'vi'], description: 'Output language (default en)' }
      },
      required: ['brand', 'city', 'category']
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  {
    name: 'localize_business_plan',
    title: 'Localize a business plan for Vietnam',
    description: 'Rewrite a foreign brand\'s business plan for Vietnamese consumers: VND pricing, product/menu localisation, channels (GrabFood, ShopeeFood, TikTok Shop, Zalo), regulatory steps and cultural risks, with Qloo taste evidence for the target city.',
    inputSchema: {
      type: 'object',
      properties: {
        plan_text: { type: 'string', description: 'Business plan text (min 80 characters; up to ~24k used)' },
        city: { type: 'string', description: CITY_DESC },
        category: { type: 'string', description: CATEGORY_DESC },
        brand: { type: 'string', description: 'Optional brand name' },
        lang: { type: 'string', enum: ['en', 'vi'] }
      },
      required: ['plan_text', 'city', 'category']
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  {
    name: 'get_project',
    title: 'Get a Brand Workspace project',
    description: 'Fetch a TasteBridge Brand Workspace project by id: stage, latest verdict, roadmap, compliance documents, sites, partner deals, KPIs and activity.',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' } }, required: ['project_id'] },
    annotations: { readOnlyHint: true }
  },
  {
    name: 'list_milestones',
    title: 'List roadmap milestones',
    description: 'List the Vietnam market-entry roadmap (Discover → Validate → Setup → Launch → Scale) for a project, with department, authority, status and due date.',
    inputSchema: { type: 'object', properties: { project_id: { type: 'string' } }, required: ['project_id'] },
    annotations: { readOnlyHint: true }
  },
  {
    name: 'search_partners',
    title: 'Search launch partners',
    description: 'Search the TasteBridge partner directory (operators, franchisees, delivery apps, e-commerce, CRM channels) by city and type. Entries flagged is_demo are DEMO DATA.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: CITY_DESC },
        type: { type: 'string', description: 'operator | franchisee | delivery | ecommerce | crm' }
      }
    },
    annotations: { readOnlyHint: true }
  }
];

type Json = any;
const rpcError = (id: Json, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
const rpcResult = (id: Json, result: Json) => ({ jsonrpc: '2.0', id, result });

function toolText(data: unknown, isError = false) {
  return {
    content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
    ...(typeof data === 'object' && data !== null && !isError ? { structuredContent: data } : {}),
    ...(isError ? { isError: true } : {})
  };
}

export async function callTool(env: Env, name: string, args: any) {
  switch (name) {
    case 'analyze_market_entry': {
      const out = await runAnalysis(env, parseAnalyzeInput({ ...args, brandName: args?.brand }));
      return { verdict: out.result.verdict, opportunityIndex: out.result.opportunityIndex, confidence: out.result.confidence, headline: out.result.headline, ...out };
    }
    case 'localize_business_plan':
      return runLocalize(env, parseLocalizeInput(args));
    case 'get_project': {
      if (!args?.project_id) throw new HttpError(400, 'project_id is required');
      const p = await getProjectFull(env, String(args.project_id));
      return { ...p, agent_runs: undefined };
    }
    case 'list_milestones': {
      if (!args?.project_id) throw new HttpError(400, 'project_id is required');
      const p = await getProjectRow(env, String(args.project_id));
      const milestones = await listCollection(env, p.id, 'milestones');
      return { project_id: p.id, brand: p.brand, stage: p.stage, milestones };
    }
    case 'search_partners':
      return { partners: await searchPartners(env, args?.city || null, args?.type || null) };
    default:
      throw new HttpError(404, `Unknown tool: ${name}`);
  }
}

async function handleMessage(env: Env, msg: any): Promise<Json | null> {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    if (msg && msg.jsonrpc === '2.0' && ('result' in msg || 'error' in msg)) return null; // client response — ignore
    return rpcError(msg?.id, -32600, 'Invalid Request');
  }
  const isNotification = !('id' in msg) || msg.id === null || msg.id === undefined;
  const { method, params, id } = msg;

  if (isNotification) return null; // notifications/initialized, notifications/cancelled, ...

  switch (method) {
    case 'initialize': {
      const requested = params?.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: 'TasteBridge helps foreign consumer brands enter Vietnam. Use analyze_market_entry for a GO/PILOT/NO-GO verdict grounded in Qloo Taste AI, localize_business_plan to adapt a plan for Vietnamese consumers, and the project tools to read a Brand Workspace.'
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'tools/call': {
      const name = params?.name;
      if (!TOOLS.some((t) => t.name === name)) return rpcError(id, -32602, `Unknown tool: ${name}`);
      try {
        const data = await callTool(env, name, params?.arguments || {});
        return rpcResult(id, toolText(data));
      } catch (err: any) {
        // Tool execution errors are reported in-band so the model can see and recover.
        return rpcResult(id, toolText(`Error: ${err?.message || String(err)}`, true));
      }
    }
    case 'resources/list':
      return rpcResult(id, { resources: [] });
    case 'prompts/list':
      return rpcResult(id, { prompts: [] });
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

const MCP_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version'
};

export async function handleMcp(req: Request, env: Env): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: MCP_HEADERS });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify(rpcError(null, -32000, 'Method not allowed: this server uses stateless POST (Streamable HTTP) only.')), {
      status: 405,
      headers: { ...MCP_HEADERS, Allow: 'POST, OPTIONS', 'Content-Type': 'application/json' }
    });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json(rpcError(null, -32700, 'Parse error'), { status: 400, headers: MCP_HEADERS });
  }
  const batch = Array.isArray(body);
  const msgs = batch ? body : [body];
  if (msgs.length === 0) return Response.json(rpcError(null, -32600, 'Empty batch'), { status: 400, headers: MCP_HEADERS });
  const replies = (await Promise.all(msgs.map((m: any) => handleMessage(env, m)))).filter((r) => r !== null);
  if (replies.length === 0) return new Response(null, { status: 202, headers: MCP_HEADERS });
  return Response.json(batch ? replies : replies[0], { status: 200, headers: MCP_HEADERS });
}
