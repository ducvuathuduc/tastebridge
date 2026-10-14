"use client";
import { useCallback, useReducer, useRef } from "react";
import type { AgentId, BrandProfile, CityData, Evidence, RunEvent, RunInput, ScoreBreakdown } from "./types";

export interface ToolTrace { callId: string; tool: string; args: Record<string, unknown>; summary?: string; ok?: boolean }
export interface AgentState { status: "queued" | "running" | "done" | "error"; model?: string; ms?: number; tools: ToolTrace[]; thought?: string; output?: any; error?: string; startedAt?: number }
export interface RunState {
  status: "idle" | "running" | "done" | "error";
  input?: RunInput;
  order: { id: AgentId; name: string }[];
  agents: Partial<Record<AgentId, AgentState>>;
  profile?: BrandProfile;
  cities: Record<string, CityData>;
  scores?: Record<string, ScoreBreakdown>;
  evidence: Evidence[];
  error?: string;
  ms?: number;
}

const initial: RunState = { status: "idle", order: [], agents: {}, cities: {}, evidence: [] };

function reducer(s: RunState, e: RunEvent | { type: "reset"; input: RunInput } | { type: "client_error"; error: string }): RunState {
  switch (e.type) {
    case "reset": return { ...initial, status: "running", input: e.input };
    case "client_error": return { ...s, status: "error", error: e.error };
    case "run_start": {
      const agents: RunState["agents"] = {};
      e.agents.forEach((a) => (agents[a.id] = { status: "queued", tools: [] }));
      return { ...s, order: e.agents, agents };
    }
    case "agent_start": return upd(s, e.agent, { status: "running", startedAt: Date.now() });
    case "tool_call": {
      const a = s.agents[e.agent];
      return upd(s, e.agent, { tools: [...(a?.tools || []), { callId: e.callId, tool: e.tool, args: e.args }] });
    }
    case "tool_result": {
      const a = s.agents[e.agent];
      return upd(s, e.agent, { tools: (a?.tools || []).map((t) => (t.callId === e.callId ? { ...t, summary: e.summary, ok: e.ok } : t)) });
    }
    case "agent_thought": return upd(s, e.agent, { thought: e.text });
    case "agent_done": return upd(s, e.agent, { status: s.agents[e.agent]?.status === "error" && !e.output?.text ? "error" : "done", model: e.model, ms: e.ms, output: e.output });
    case "agent_error": return upd(s, e.agent, { status: "error", error: e.error });
    case "profile": return { ...s, profile: e.profile };
    case "city_data": return { ...s, cities: { ...s.cities, [e.data.cityId]: e.data } };
    case "scores": return { ...s, scores: e.scores };
    case "evidence": return { ...s, evidence: e.items };
    case "done": return { ...s, status: "done", ms: e.ms };
    case "fatal": return { ...s, status: "error", error: e.error };
    default: return s;
  }
}
function upd(s: RunState, id: AgentId, patch: Partial<AgentState>): RunState {
  return { ...s, agents: { ...s.agents, [id]: { ...(s.agents[id] || { status: "queued", tools: [] }), ...patch } } };
}

export function useRun() {
  const [state, dispatch] = useReducer(reducer, initial);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (input: RunInput) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    dispatch({ type: "reset", input });
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input), signal: ac.signal });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        dispatch({ type: "client_error", error: j.error || `Request failed (${res.status})` });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let finished = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const ev = JSON.parse(line) as RunEvent;
            if (ev.type === "done" || ev.type === "fatal") finished = true;
            dispatch(ev);
          } catch { /* ignore partial */ }
        }
      }
      if (!finished) dispatch({ type: "client_error", error: "The connection closed before the committee finished." });
    } catch (e) {
      if ((e as Error).name !== "AbortError") dispatch({ type: "client_error", error: (e as Error).message });
    }
  }, []);

  return { state, start };
}
