import { useState } from "react";
import { Loader2, Play, RotateCcw, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api } from "@/api/client";
import { neighborhoods } from "@/lib/analyzeData";
import { verdictStyles } from "@/components/analyze/badges";
import { Chip, Section, expiryState, fmtDate } from "./shared";

export default function OverviewTab({ project, refresh, onTab }) {
  const { t, lang } = useLang();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const v = project.latestVerdict?.result;

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      await api.analyze({
        project_id: project.id,
        brandName: project.brand.replace(/\s*\(DEMO\)\s*$/, ""),
        city: project.city,
        category: project.category,
        lang,
        neighborhoods: (neighborhoods[project.city] || []).map((n) => n.name),
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const ms = project.milestones || [];
  const done = ms.filter((m) => m.status === "done").length;
  const docsAttention = (project.documents || []).filter((d) => ["nogo", "pilot"].includes(expiryState(d).tone));
  const activeDeals = (project.deals || []).filter((d) => d.stage !== "lost" && d.stage !== "signed");
  const next = ms.filter((m) => m.status !== "done").slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section
        className="lg:col-span-2"
        title={t("ov.verdict")}
        action={
          <button type="button" className={v ? "btn-secondary" : "btn-primary"} onClick={run} disabled={running}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : v ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {v ? t("ov.rerun") : t("ov.run")}
          </button>
        }
      >
        {running && <p className="text-sm text-muted-foreground">{t("ov.running")}</p>}
        {error && !running && (
          <div className="flex items-start gap-2 rounded-md border border-verdict-nogo/40 bg-verdict-nogo/10 p-3 text-sm">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-verdict-nogo" />
            <div>
              <p>{t("ov.runFailed")}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}
        {v && !running && (
          <div>
            <div className="flex flex-wrap items-end gap-8">
              <p className={`text-5xl font-semibold tracking-tight ${(verdictStyles[v.verdict] || verdictStyles.PILOT).text}`}>{v.verdict}</p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("ov.index")}</p>
                <p className="font-mono text-3xl">{v.opportunityIndex}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("ov.confidence")}</p>
                <p className="font-mono text-3xl">{v.confidence}%</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{v.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.verdictRationale}</p>
            {v.risks?.length > 0 && (
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("ov.risks")}</p>
                <ul className="mt-2 space-y-1.5">
                  {v.risks.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Chip tone={r.severity === "high" ? "nogo" : r.severity === "low" ? "go" : "pilot"}>{r.severity}</Chip>
                      <span>{r.risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Qloo · {fmtDate(project.latestVerdict.created_at, lang)}
              {project.latestVerdict.evidence?.matchedName ? ` · ${project.latestVerdict.evidence.matchedName}` : ""}
            </p>
          </div>
        )}
        {!v && !running && !error && <p className="text-sm text-muted-foreground">{t("ws.noVerdict")}</p>}
      </Section>

      <div className="grid gap-6">
        <Section title={t("ov.progress")}>
          <p className="font-mono text-3xl">
            {done}/{ms.length}
          </p>
          <div className="mt-3 h-1 rounded-full bg-border">
            <div className="h-1 rounded-full bg-foreground" style={{ width: `${ms.length ? (done / ms.length) * 100 : 0}%` }} />
          </div>
          <button type="button" className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => onTab("roadmap")}>
            {t("ws.tab.roadmap")} →
          </button>
        </Section>
        <Section title={t("ov.expiring")}>
          <p className={`font-mono text-3xl ${docsAttention.length ? "text-verdict-pilot" : ""}`}>{docsAttention.length}</p>
          <button type="button" className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => onTab("compliance")}>
            {t("ws.tab.compliance")} →
          </button>
        </Section>
        <Section title={t("ov.deals")}>
          <p className="font-mono text-3xl">{activeDeals.length}</p>
          <button type="button" className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={() => onTab("partners")}>
            {t("ws.tab.partners")} →
          </button>
        </Section>
      </div>

      <Section className="lg:col-span-3" title={t("ov.next")}>
        <ul className="divide-y divide-border">
          {next.map((m) => (
            <li key={m.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Chip>{t(`phase.${m.phase}`)}</Chip>
                <span className="text-sm">{lang === "vi" && m.title_vi ? m.title_vi : m.title}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {t(`dept.${m.department}`)} · {t("rm.due")} {fmtDate(m.due_date, lang)}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
