import "server-only";
import { chat, extractJson, type ChatMessage } from "../llm";
import { TOOLS, toolSpecs, type RunState } from "../tools";
import type { AgentId, RunEvent, RunInput } from "../types";
import { AGENTS } from "./registry";

export type Emit = (e: RunEvent) => void;

let callSeq = 0;

/** Runs one agent: native tool-calling loop until it answers or hits maxSteps. */
export async function runAgent(id: AgentId, s: RunState, input: RunInput, emit: Emit, ctx: Record<string, any> = {}) {
  const def = AGENTS[id];
  const t0 = Date.now();
  emit({ type: "agent_start", agent: id });
  const sys = def.system(s, input) + (def.output ? `\nOutput JSON shape: ${def.output}` : "");
  const messages: ChatMessage[] = [
    { role: "system", content: sys },
    { role: "user", content: def.user(s, input, ctx) },
  ];
  const tools = def.tools.length ? toolSpecs(def.tools) : undefined;
  let model = "";
  let final: string | null = null;

  for (let step = 0; step < def.maxSteps; step++) {
    const isLast = step === def.maxSteps - 1;
    if (isLast && tools) messages.push({ role: "user", content: "Tool budget exhausted. Do not call tools. Give your final answer now." });
    let res;
    try {
      res = await chat({ tier: def.tier, messages, tools: isLast ? undefined : tools, json: !tools || isLast ? !!def.output : false, maxTokens: def.output ? 2400 : 1200 });
    } catch (e) {
      if (step === 0 && id === "profiler") throw e;
      emit({ type: "agent_error", agent: id, error: (e as Error).message.slice(0, 200) });
      break;
    }
    const { message, model: m } = res;
    model = m;
    if (message.tool_calls?.length && !isLast) {
      messages.push({ role: "assistant", content: message.content ?? "", tool_calls: message.tool_calls });
      const results = await Promise.all(
        message.tool_calls.map(async (tc) => {
          const callId = `c${++callSeq}`;
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* keep empty */ }
          emit({ type: "tool_call", agent: id, tool: tc.function.name, args, callId });
          const tool = TOOLS[tc.function.name];
          let out: string;
          let ok = true;
          if (!tool || !def.tools.includes(tc.function.name)) { out = `Tool ${tc.function.name} is not available to you.`; ok = false; }
          else {
            try { out = await tool.exec(s, args); }
            catch (e) { out = `Error: ${(e as Error).message}`; ok = false; }
          }
          emit({ type: "tool_result", agent: id, callId, summary: out.slice(0, 400), ok });
          return { tc, out };
        }),
      );
      for (const { tc, out } of results) messages.push({ role: "tool", tool_call_id: tc.id, name: tc.function.name, content: out.slice(0, 900) });
      continue;
    }
    final = message.content;
    break;
  }

  let output = def.output || id === "culture" || id === "localize" ? extractJson(final) ?? { text: final } : { text: final };
  // Coverage gate: per-city agents must answer for every city they were asked about (one corrective retry).
  if (def.perCity && final) {
    const expected = id === "launch" ? (ctx.goCities as string[] | undefined) ?? s.cityIds : s.cityIds;
    const got = new Set(((output?.cities as any[]) || []).map((c) => c?.city_id));
    const missing = expected.filter((c) => !got.has(c));
    if (missing.length) {
      try {
        messages.push({ role: "assistant", content: final });
        messages.push({ role: "user", content: `Your JSON is missing these city_id values: ${missing.join(", ")}. Return the COMPLETE JSON again with one entry for each of: ${expected.join(", ")}.` });
        const { message, model: m } = await chat({ tier: def.tier, messages, json: true, maxTokens: 2600 });
        const fixed = extractJson(message.content);
        if (fixed?.cities?.length) {
          const merged = new Map<string, any>(((output?.cities as any[]) || []).map((c) => [c.city_id, c]));
          for (const c of fixed.cities) if (c?.city_id) merged.set(c.city_id, c);
          output = { ...output, ...fixed, cities: [...merged.values()] };
          model = m;
        }
      } catch { /* keep partial output */ }
    }
  }
  if (final && !def.output && typeof output?.text === "string") emit({ type: "agent_thought", agent: id, text: final.slice(0, 600) });
  const ms = Date.now() - t0;
  emit({ type: "agent_done", agent: id, output, model, ms });
  return output;
}

/** Deterministic safety net: if an agent skipped a city, run the tool directly and log it. */
export async function ensureTool(id: AgentId, tool: string, args: Record<string, unknown>, s: RunState, emit: Emit) {
  const callId = `c${++callSeq}`;
  emit({ type: "tool_call", agent: id, tool, args: { ...args, auto: true }, callId });
  try {
    const out = await TOOLS[tool].exec(s, args);
    emit({ type: "tool_result", agent: id, callId, summary: out.slice(0, 400), ok: true });
  } catch (e) {
    emit({ type: "tool_result", agent: id, callId, summary: `Error: ${(e as Error).message}`, ok: false });
  }
}
