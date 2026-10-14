"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, CircleAlert, Wrench } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { RunState } from "@/lib/useRun";
import { agentMeta, AGENT_META } from "../agentMeta";
import { cn } from "@/lib/cn";

const TOOL_LABEL: Record<string, string> = {
  search_brand_locations: "qloo /search",
  search_taste_tags: "qloo /v2/tags",
  set_brand_profile: "commit profile",
  brand_demographics: "qloo urn:demographics",
  city_audience_fit: "qloo insights · place",
  city_heatmap: "qloo urn:heatmap",
  category_analogs: "qloo insights · filter.tags",
  local_taste_profile: "aggregate venue tags",
  cross_domain_tastes: "qloo insights · cross-domain",
};

export function AgentTimeline({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const order = run.order.length ? run.order : AGENT_META.map((a) => ({ id: a.id, name: a.name[lang] }));
  const doneCount = order.filter((o) => run.agents[o.id]?.status === "done").length;
  return (
    <div aria-live="polite" aria-busy={run.status === "running"}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t.run.timeline}</h2>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", run.status === "running" ? "bg-saffron-100 text-saffron-600" : run.status === "done" ? "bg-go-soft text-go" : "bg-ink-100 text-ink-500")}>
          {run.status === "running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {run.status === "running" ? t.run.live : run.status === "done" ? `${t.run.done} · ${((run.ms || 0) / 1000).toFixed(0)}s` : `${doneCount}/${order.length}`}
        </span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-ink-100">
        <motion.div className="h-full bg-saffron-500" animate={{ width: `${(doneCount / order.length) * 100}%` }} transition={{ ease: "easeOut" }} />
      </div>
      <ol className="relative space-y-1">
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-line" aria-hidden />
        {order.map((o) => <AgentRow key={o.id} id={o.id} run={run} />)}
      </ol>
    </div>
  );
}

function AgentRow({ id, run }: { id: any; run: RunState }) {
  const { lang } = useI18n();
  const meta = agentMeta(id);
  const a = run.agents[id as keyof typeof run.agents];
  const status = a?.status || "queued";
  const [open, setOpen] = useState(false);
  const expanded = open || status === "running";
  return (
    <li className="relative pl-10">
      <span className={cn("absolute left-0 top-1.5 grid h-[31px] w-[31px] place-items-center rounded-full border-2 bg-white transition",
        status === "done" ? "border-go text-go" : status === "running" ? "border-saffron-500 text-saffron-600" : status === "error" ? "border-nogo text-nogo" : "border-line text-ink-300")}>
        {status === "done" ? <Check className="h-4 w-4" /> : status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "error" ? <CircleAlert className="h-4 w-4" /> : <meta.icon className="h-3.5 w-3.5" />}
      </span>
      <button onClick={() => setOpen(!open)} className="flex w-full items-start justify-between gap-2 rounded-xl px-2 py-2 text-left hover:bg-paper-2" aria-expanded={expanded}>
        <span>
          <span className={cn("block text-sm font-semibold", status === "queued" ? "text-ink-400" : "text-ink-900")}>{meta.name[lang]}</span>
          <span className="block text-[11px] text-ink-500">{meta.role[lang]}</span>
        </span>
        <span className="shrink-0 text-right font-mono text-[10px] text-ink-400">
          {a?.ms ? `${(a.ms / 1000).toFixed(1)}s` : ""}
          {a?.model ? <span className="block">{a.model.replace("openai/", "")}</span> : null}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (a?.tools.length || a?.thought || a?.error) ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ul className="mb-2 ml-2 space-y-1.5 border-l-2 border-saffron-100 pl-3">
              {a?.tools.map((tc) => (
                <motion.li key={tc.callId} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] leading-snug">
                  <span className="inline-flex items-center gap-1 font-mono text-ink-700">
                    <Wrench className="h-3 w-3 text-saffron-600" /> {TOOL_LABEL[tc.tool] || tc.tool}
                    {Object.keys(tc.args || {}).filter((k) => k !== "auto").length > 0 && <span className="text-ink-400">({Object.entries(tc.args).filter(([k]) => k !== "auto").map(([, v]) => (Array.isArray(v) ? `${v.length} ids` : String(v).replace("urn:tag:", ""))).join(", ").slice(0, 48)})</span>}
                    {tc.args?.auto ? <span className="rounded bg-ink-100 px-1 text-[9px] text-ink-500">auto</span> : null}
                  </span>
                  {tc.summary ? <span className={cn("mt-0.5 block line-clamp-2", tc.ok === false ? "text-nogo" : "text-ink-500")}>{tc.summary}</span> : <span className="mt-0.5 block text-ink-300">…</span>}
                </motion.li>
              ))}
              {a?.thought && <li className="text-[11px] italic leading-snug text-ink-600 line-clamp-4">“{a.thought}”</li>}
              {a?.error && <li className="text-[11px] text-nogo">{a.error}</li>}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
