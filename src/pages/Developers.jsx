import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { API_BASE, MCP_URL, api } from "@/api/client";
import FadeUp from "@/components/FadeUp";
import { Chip, Section } from "@/components/workspace/shared";

const TOOLS = [
  ["analyze_market_entry", "brand, city, category", "GO / PILOT / NO-GO verdict, Opportunity Index, segments, risks, partners, district heat map."],
  ["localize_business_plan", "plan_text, city, category", "VND pricing, product localisation, channels, regulations, cultural risks."],
  ["get_project", "project_id", "Brand Workspace project with roadmap, documents, deals, KPIs."],
  ["list_milestones", "project_id", "Vietnam roadmap: Discover → Validate → Setup → Launch → Scale."],
  ["search_partners", "city, type", "Operators, franchisees, delivery apps, e-commerce and CRM channels."],
];

const ENDPOINTS = [
  ["POST", "/api/analyze", "{ brandName, city, category, lang? }"],
  ["POST", "/api/localize-plan", "JSON { plan_text, city, category } or multipart with file (PDF/TXT)"],
  ["GET", "/api/projects", "X-Owner-Id header"],
  ["POST", "/api/projects", "{ brand, city, category }"],
  ["GET/PATCH/DELETE", "/api/projects/:id", ""],
  ["GET/POST", "/api/projects/:id/:collection", "milestones, documents, licenses, trademarks, sites, deals, channels, campaigns, kols, suppliers, import_items, budgets, kpis"],
  ["POST", "/api/projects/:id/copilot", "{ message, history?, lang? }"],
  ["GET", "/api/partners", "?city=&type="],
  ["POST", "/mcp", "MCP JSON-RPC (Streamable HTTP)"],
];

function CopyField({ label, value }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-stretch gap-2">
        <code className="flex min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 font-mono text-xs">{value}</code>
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard unavailable */
            }
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("dev.copied") : t("dev.copy")}
        </button>
      </div>
    </div>
  );
}

export default function Developers() {
  const { t } = useLang();
  const [health, setHealth] = useState(null);
  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  const curlAnalyze = `curl -X POST ${API_BASE}/api/analyze \\\n  -H 'Content-Type: application/json' \\\n  -d '{"brandName":"Blue Bottle Coffee","city":"hcmc","category":"coffee_tea"}'`;
  const curlMcp = `curl -X POST ${MCP_URL} \\\n  -H 'Content-Type: application/json' \\\n  -H 'Accept: application/json, text/event-stream' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("dev.label")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t("dev.title")}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("dev.sub")}</p>
        {health && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("dev.health")}</span>
            <Chip tone={health.ok ? "go" : "nogo"}>API {health.ok ? "online" : "offline"}</Chip>
            {health.ok && <Chip tone={health.qloo ? "go" : "nogo"}>Qloo {health.qloo ? "ready" : "key missing"}</Chip>}
            {health.ok && <Chip tone={health.llm ? "go" : "nogo"}>LLM {health.llm || "key missing"}</Chip>}
          </div>
        )}
      </FadeUp>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Section title={t("dev.mcpTitle")}>
          <CopyField label={t("dev.mcpUrl")} value={MCP_URL} />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("dev.tools")}</p>
          <ul className="mt-2 divide-y divide-border">
            {TOOLS.map(([name, args, desc]) => (
              <li key={name} className="py-2.5">
                <p className="font-mono text-xs">
                  {name}
                  <span className="text-muted-foreground">({args})</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ul>
        </Section>
        <div className="grid gap-6">
          <Section title={t("dev.claude")}>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>{t("dev.claude1")}</li>
              <li>{t("dev.claude2")}</li>
              <li>{t("dev.claude3")}</li>
            </ol>
          </Section>
          <Section title={t("dev.chatgpt")}>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>{t("dev.chatgpt1")}</li>
              <li>{t("dev.chatgpt2")}</li>
              <li>{t("dev.chatgpt3")}</li>
            </ol>
          </Section>
        </div>
      </div>

      <Section className="mt-6" title={t("dev.apiTitle")}>
        <CopyField label={t("dev.apiBase")} value={API_BASE} />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("dev.endpoints")}</p>
        <div className="-mx-5 mt-2 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
          <table className="w-full min-w-[640px] text-left text-xs">
            <tbody>
              {ENDPOINTS.map(([m, p, d]) => (
                <tr key={m + p} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3 font-mono text-muted-foreground">{m}</td>
                  <td className="py-2 pr-3 font-mono">{p}</td>
                  <td className="py-2 text-muted-foreground">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("dev.try")}</p>
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          <pre className="overflow-x-auto rounded-md border border-border bg-card p-3 font-mono text-[11px] leading-relaxed">{curlAnalyze}</pre>
          <pre className="overflow-x-auto rounded-md border border-border bg-card p-3 font-mono text-[11px] leading-relaxed">{curlMcp}</pre>
        </div>
      </Section>
    </div>
  );
}
