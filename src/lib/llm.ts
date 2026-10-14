/**
 * Provider-agnostic chat client (OpenAI-compatible wire format) with native tool calling.
 * Providers are tried in order; on rate limits we wait briefly or fall through to the next one.
 */
import "server-only";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
  name?: string;
}
export interface ToolSpec { type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> } }

interface Provider { id: string; url: string; key?: string; model: string; extra?: Record<string, unknown> }

export type Tier = "large" | "small";

function providers(tier: Tier): Provider[] {
  const groq = process.env.GROQ_API_KEY;
  const gem = process.env.GEMINI_API_KEY;
  const g = (model: string): Provider => ({ id: `groq:${model}`, url: "https://api.groq.com/openai/v1/chat/completions", key: groq, model, extra: { reasoning_effort: "low" } });
  const m = (model: string): Provider => ({ id: `gemini:${model}`, url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key: gem, model });
  const list = tier === "large"
    ? [g("openai/gpt-oss-120b"), m("gemini-2.5-flash"), g("openai/gpt-oss-20b"), m("gemini-2.5-flash-lite")]
    : [g("openai/gpt-oss-20b"), m("gemini-2.5-flash-lite"), g("openai/gpt-oss-120b"), m("gemini-2.5-flash")];
  return list.filter((p) => !!p.key);
}

export class LLMError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseRetry(res: Response): number {
  const ra = res.headers.get("retry-after");
  if (ra && !isNaN(Number(ra))) return Number(ra) * 1000;
  const reset = res.headers.get("x-ratelimit-reset-tokens");
  if (reset) {
    const mm = /(?:(\d+)m)?([\d.]+)s/.exec(reset);
    if (mm) return (Number(mm[1] || 0) * 60 + Number(mm[2])) * 1000;
  }
  return 4000;
}

export async function chat(opts: { tier: Tier; messages: ChatMessage[]; tools?: ToolSpec[]; json?: boolean; maxTokens?: number; temperature?: number }): Promise<{ message: ChatMessage; model: string }> {
  const list = providers(opts.tier);
  if (!list.length) throw new LLMError("No LLM provider configured (set GROQ_API_KEY or GEMINI_API_KEY)");
  let lastErr = "";
  for (let round = 0; round < 3; round++) {
  if (round > 0) await sleep(6000 * round);
  for (const p of list) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const body: Record<string, unknown> = {
        model: p.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 1800,
        ...(p.id.startsWith("groq") ? p.extra : {}),
      };
      if (opts.tools?.length) { body.tools = opts.tools; body.tool_choice = "auto"; }
      if (opts.json && !opts.tools?.length) body.response_format = { type: "json_object" };
      let res: Response;
      try {
        res = await fetch(p.url, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${p.key}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(60_000) });
      } catch (e) {
        lastErr = `${p.id}: ${(e as Error).message}`;
        continue;
      }
      if (res.status === 429) {
        const wait = parseRetry(res);
        lastErr = `${p.id}: rate limited`;
        if (wait <= 15_000 && attempt < 2) { await sleep(wait + 250); continue; }
        break; // next provider
      }
      if (!res.ok) {
        const t = await res.text();
        lastErr = `${p.id}: ${res.status} ${t.slice(0, 240)}`;
        // tool-call generation glitches are retryable once
        if (res.status === 400 && /tool|json/i.test(t) && attempt < 1) continue;
        break;
      }
      const data = await res.json();
      const msg = data?.choices?.[0]?.message;
      if (!msg) { lastErr = `${p.id}: empty response`; continue; }
      return { message: { role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls }, model: p.model };
    }
  }
  if (!/rate limited|fetch failed|timeout|empty/i.test(lastErr)) break;
  }
  throw new LLMError(lastErr || "All LLM providers failed");
}

/** Tolerant JSON extraction from a model reply. */
export function extractJson<T = any>(text: string | null | undefined): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(cleaned); } catch { /* fallthrough */ }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
}
