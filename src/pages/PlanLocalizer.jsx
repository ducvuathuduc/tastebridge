import { useEffect, useRef, useState } from "react";
import { Check, FileUp, Loader2, Wand2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api } from "@/api/client";
import { cities, categories } from "@/lib/analyzeData";
import FadeUp from "@/components/FadeUp";
import { Chip, DemoTag, Input, Section, Select } from "@/components/workspace/shared";

const SAMPLE_PLAN = `DEMO DATA — fictional plan for illustration.
Harbor & Pine Coffee — Portland, Oregon. Third-wave specialty coffee, 6 cafés in the US.
Menu: single-origin pour-over $6.00, 16oz cold brew $5.50, oat latte $6.25, almond croissant $4.75, seasonal pumpkin spice latte $6.75.
Format: 120 m² cafés with laptop seating, minimalist Scandinavian interior, no sugar added by default, large 16-20oz cups.
Plan for Asia: open a flagship in a CBD location within 6 months, then 3 more cafés in year one. Marketing via Instagram and a loyalty app. Beans roasted in Portland and shipped by air.
Revenue target year one: USD 900k. Staffing: 12 baristas per café trained on US recipes.`;

function Table({ head, rows }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr className="border-b border-border">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border align-top last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`py-3 pr-3 ${j === 0 ? "" : "text-muted-foreground"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlanLocalizer() {
  const { t, lang } = useLang();
  const fileRef = useRef(null);
  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("hcmc");
  const [category, setCategory] = useState("coffee_tea");
  const [plan, setPlan] = useState("");
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("form");
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [target, setTarget] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.listProjects().then((r) => setProjects(r.projects || [])).catch(() => setProjects([]));
  }, []);

  const run = async (e) => {
    e?.preventDefault();
    if (!file && plan.trim().length < 80) {
      setError(t("lz.tooShort"));
      return;
    }
    setPhase("running");
    setError(null);
    setAdded(false);
    try {
      const r = await api.localizePlan({ plan_text: plan, city, category, brand, lang, ...(file ? { file } : {}) });
      setData(r);
      setPhase("done");
    } catch (err) {
      setError(err.message);
      setPhase("form");
    }
  };

  const addToRoadmap = async () => {
    if (!target || !data) return;
    try {
      for (const [i, r] of data.result.regulations.entries()) {
        await api.createItem(target, "milestones", {
          phase: r.phase,
          department: "legal",
          title: r.item,
          title_vi: r.item,
          detail: r.action,
          detail_vi: r.action,
          authority: r.authority,
          status: "todo",
          sort: 100 + i,
        });
      }
      setAdded(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const r = data?.result;
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("lz.label")}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{t("lz.title")}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("lz.sub")}</p>
      </FadeUp>

      <form onSubmit={run} className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Section title={t("lz.plan")}>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder={t("lz.planPlaceholder")}
            rows={12}
            className="w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
              <FileUp className="h-3.5 w-3.5" /> {t("lz.upload")}
            </button>
            {file && (
              <Chip onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                {file.name} <X className="h-3 w-3" />
              </Chip>
            )}
            <button type="button" className="btn-secondary" onClick={() => { setPlan(SAMPLE_PLAN); setBrand("Harbor & Pine Coffee"); setCategory("coffee_tea"); }}>
              {t("lz.sample")}
            </button>
            <span className="text-[11px] text-muted-foreground">{t("lz.sampleNote")}</span>
          </div>
        </Section>
        <Section>
          <div className="space-y-3">
            <Input placeholder={t("lz.brand")} value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={80} />
            <Select aria-label={t("ws.city")} value={city} onChange={(e) => setCity(e.target.value)} options={cities.map((c) => ({ value: c.id, label: c.name[lang] }))} />
            <Select aria-label={t("ws.category")} value={category} onChange={(e) => setCategory(e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name[lang] }))} />
            <button type="submit" className="btn-primary h-11 w-full" disabled={phase === "running"}>
              {phase === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {t("lz.run")}
            </button>
            {phase === "running" && <p className="text-xs text-muted-foreground">{t("lz.running")}</p>}
            {error && <p className="rounded-md border border-verdict-nogo/40 bg-verdict-nogo/10 px-3 py-2 text-xs">{error}</p>}
          </div>
        </Section>
      </form>

      {phase === "done" && r && (
        <div className="mt-10 space-y-6">
          <Section title={t("lz.summary")} action={plan.startsWith("DEMO DATA") ? <DemoTag /> : null}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("lz.readiness")}</p>
                <p className="mt-1 font-mono text-5xl">{r.readiness}</p>
              </div>
              <p className="text-sm leading-relaxed">{r.summary}</p>
            </div>
          </Section>

          {r.pricing.length > 0 && (
            <Section title={t("lz.pricing")} hint={t("lz.estimates")}>
              <Table head={[t("lz.item"), t("lz.planPrice"), t("lz.suggested"), t("lz.why")]} rows={r.pricing.map((p) => [p.item, p.planPrice, <span className="font-mono text-foreground">{p.suggestedVnd}</span>, p.rationale])} />
            </Section>
          )}

          {r.productChanges.length > 0 && (
            <Section title={t("lz.product")}>
              <Table head={["", t("lz.current"), t("lz.change"), t("lz.why")]} rows={r.productChanges.map((p) => [p.area, p.current, p.change, p.why])} />
            </Section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title={t("lz.channels")}>
              <ul className="space-y-3">
                {r.channels.map((c, i) => (
                  <li key={i}>
                    <p className="text-sm">
                      {c.name} <span className="text-xs text-muted-foreground">· {c.role}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.action}</p>
                  </li>
                ))}
              </ul>
            </Section>
            <Section title={t("lz.risks")}>
              <ul className="space-y-3">
                {r.culturalRisks.map((c, i) => (
                  <li key={i} className="text-sm">
                    <Chip tone={c.severity === "high" ? "nogo" : c.severity === "low" ? "go" : "pilot"}>{c.severity}</Chip> {c.risk}
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.mitigation}</p>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title={t("lz.regulations")}>
            <Table head={["", t("lz.authority"), t("lz.change"), t("ws.stage")]} rows={r.regulations.map((x) => [x.item, x.authority, x.action, t(`phase.${x.phase}`)])} />
            {projects.length > 0 && (
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">{t("lz.addToProject")}</p>
                <Select className="sm:w-64" value={target} onChange={(e) => setTarget(e.target.value)} options={[{ value: "", label: t("lz.chooseProject") }, ...projects.map((p) => ({ value: p.id, label: p.brand }))]} />
                <button type="button" className="btn-secondary" disabled={!target || added} onClick={addToRoadmap}>
                  {added ? <Check className="h-3.5 w-3.5" /> : null}
                  {added ? t("lz.added") : t("os.add")}
                </button>
              </div>
            )}
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Section title={t("lz.next")}>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                {r.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </Section>
            <Section title={t("lz.evidence")}>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Brand</dt>
                  <dd>{data.evidence.matchedName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Related brands (affinity)</dt>
                  <dd>{data.evidence.relatedBrands.map((b) => `${b.name}${b.affinity != null ? ` ${b.affinity}` : ""}`).join(", ") || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">City places</dt>
                  <dd>{data.evidence.cityPlaces.join(", ") || "—"}</dd>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Qloo Taste AI · {data.meta?.provider}/{data.meta?.model}
                </div>
              </dl>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
