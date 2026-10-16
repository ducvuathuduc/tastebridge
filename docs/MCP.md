# TasteBridge MCP server

TasteBridge exposes its market-entry agents as a **remote MCP server**, so Claude, ChatGPT or any MCP client can call
them directly.

| | |
|---|---|
| **URL** | `https://tastebridge-api.huynhthanh.workers.dev/mcp` |
| **Transport** | Streamable HTTP (MCP spec 2025-06-18; also negotiates 2025-03-26 and 2024-11-05) |
| **Mode** | Stateless — every `POST` carries one JSON-RPC message or batch and gets an `application/json` reply; notifications get `202 Accepted`; `GET` returns `405` (no server-initiated stream) |
| **Auth** | None for v1 (public demo). Qloo and LLM keys stay server-side as Worker secrets |
| **Code** | [`worker/src/mcp.ts`](../worker/src/mcp.ts), served by the same Cloudflare Worker as the REST API |

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `analyze_market_entry` | `brand`, `city`, `category`, `lang?` | The 11-agent analysis grounded in live Qloo Taste AI data: GO / PILOT / NO-GO verdict, Opportunity Index, confidence, affinity scores, segments, competitors, risks, channels, partners, district heat map, plus the raw Qloo evidence. ~20–40 s |
| `localize_business_plan` | `plan_text`, `city`, `category`, `brand?`, `lang?` | What to change for Vietnamese consumers: VND pricing (labelled as estimates), product/menu localisation, channels (GrabFood, ShopeeFood, TikTok Shop, Zalo OA…), regulatory steps with authority and roadmap phase, cultural risks, next steps, with Qloo evidence for the city |
| `get_project` | `project_id` | A Brand Workspace project: stage, latest verdict, roadmap, compliance documents, sites, partner deals, KPIs, activity |
| `list_milestones` | `project_id` | The Vietnam roadmap (Discover → Validate → Setup → Launch → Scale) with department, authority, status and due date |
| `search_partners` | `city?`, `type?` | Partner directory: operators, franchisees, delivery apps, e-commerce, CRM. Entries with `is_demo: true` are demo data |

`city` accepts `hcmc`, `hanoi`, `danang` or names such as "Ho Chi Minh City" / "Hà Nội". `category` accepts
`food_beverage`, `coffee_tea`, `fashion`, `beauty`, `electronics`, `wellness`, `home_living` or loose names like "Coffee".

Tool failures (for example Qloo being unavailable) come back as a normal result with `isError: true` and a message, so
the model can explain the problem instead of inventing data.

## Connect Claude

Custom connectors are available on Claude Free (one connector), Pro, Max, Team and Enterprise.

1. Open **Claude → Settings → Connectors**.
2. Click **Add custom connector**. Name: `TasteBridge`. URL: `https://tastebridge-api.huynhthanh.workers.dev/mcp`.
3. Leave OAuth fields empty and click **Add**.
4. In a chat, open the tools menu, enable **TasteBridge**, and ask for example:
   *"Use TasteBridge to analyze Blue Bottle Coffee entering Ho Chi Minh City in Coffee & Tea."*

Claude Desktop / Claude Code users can also add it from the command line:

```bash
claude mcp add --transport http tastebridge https://tastebridge-api.huynhthanh.workers.dev/mcp
```

## Connect ChatGPT

Custom MCP connectors with arbitrary tools need **Developer mode** (Plus, Pro, Business, Enterprise, Edu — subject
to OpenAI's current plan rules).

1. Open **ChatGPT → Settings → Apps & Connectors → Advanced settings** and switch on **Developer mode**.
2. Back in **Apps & Connectors**, click **Create**. Name: `TasteBridge`. MCP server URL:
   `https://tastebridge-api.huynhthanh.workers.dev/mcp`. Authentication: **No authentication**. Confirm you trust the server.
3. Start a new chat, choose **Developer mode** from the **+** menu, enable the TasteBridge connector, and ask:
   *"Analyze Blue Bottle Coffee entering Ho Chi Minh City."*

Menu names in both products change from time to time; the URL and transport above are what matter.

## Test with curl

```bash
MCP=https://tastebridge-api.huynhthanh.workers.dev/mcp

# Handshake
curl -s -X POST $MCP -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'

# List tools
curl -s -X POST $MCP -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Call a tool
curl -s -X POST $MCP -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"analyze_market_entry","arguments":{"brand":"Blue Bottle Coffee","city":"hcmc","category":"coffee_tea"}}}'
```

Or use the official inspector: `npx @modelcontextprotocol/inspector` → transport *Streamable HTTP* → the URL above.

## Implementation notes

- The server is a small, dependency-free implementation of the Streamable HTTP transport (JSON responses only), which
  runs natively on Workers without Node HTTP shims. It implements `initialize`, `ping`, `tools/list`, `tools/call`,
  empty `resources/list` and `prompts/list`, batches, and CORS for browser-based clients.
- Tool handlers call the exact same functions as the REST API (`runAnalysis`, `runLocalize`, project store), so MCP
  and web results are identical.
- Covered by `worker/test/api.test.ts` and `worker/test/projects.test.ts` (initialize, notifications, tools/list,
  tools/call with Qloo mocked, in-band errors, 405 on GET).
