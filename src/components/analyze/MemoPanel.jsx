import { useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cities, categories, neighborhoods } from "@/lib/analyzeData";
import { agents as agentDefs } from "@/lib/agentsData";
import { verdictStyles } from "./badges";

export default function MemoPanel({ result, evidence, inputs }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const city = cities.find((c) => c.id === inputs.cityId) || cities[0];
  const category = categories.find((c) => c.id === inputs.categoryId) || categories[0];
  const date = new Date().toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const byId = Object.fromEntries((result.agents || []).map((a) => [a.id, a]));
  const ordered = agentDefs.filter((d) => byId[d.id]);
  const hoods = (neighborhoods[inputs.cityId] || []).map((nb) => {
    const s = (result.neighborhoods || []).find((n) => n.name === nb.name);
    return { name: lang === "vi" ? nb.vi : nb.name, score: s?.score, note: s?.note };
  });
  const v = verdictStyles[result.verdict] || verdictStyles.PILOT;

  const buildMarkdown = () =>
    [
      `# TasteBridge — ${t("result.memo")}`,
      ``,
      `- **${t("analyze.brand")}:** ${inputs.brandName}`,
      `- **${t("analyze.city")}:** ${city.name[lang]}`,
      `- **${t("analyze.category")}:** ${category.name[lang]}`,
      `- **${date}**`,
      `- **${t("result.verdict")}:** ${result.verdict} (${t("result.confidence")} ${result.confidence}%)`,
      ``,
      result.memoIntro,
      ``,
      `## ${t("agents.label")}`,
      ...ordered.flatMap((d) => [
        ``,
        `### ${d.name[lang]}`,
        byId[d.id].summary,
        ...(byId[d.id].findings || []).map((f) => `- ${f}`),
      ]),
      ``,
      `## ${t("result.segments")}`,
      ...(result.segments || []).map((s) => `- **${s.name}** (${s.appeal}/100) — ${s.why}`),
      ``,
      `## ${t("result.competitors")}`,
      ...(result.competitors || []).map((c) => `- **${c.name}** (${c.threat}) — ${c.positioning}`),
      ``,
      `## ${t("result.risks")}`,
      ...(result.risks || []).map((r) => `- **${r.risk}** (${r.severity}) — ${r.mitigation}`),
      ``,
      `## ${t("result.channels")}`,
      ...(result.channels || []).map((c) => `- ${c}`),
      ``,
      `## ${t("result.partners")}`,
      ...(result.partners || []).map((p) => `- **${p.name}** (${p.role}, fit ${p.fit}/100) — ${p.why}`),
      ``,
      `## ${t("result.map")}`,
      ...hoods.map((nb) => `- ${nb.name}: ${nb.score ?? "—"}${nb.note ? ` — ${nb.note}` : ""}`),
      ``,
      `---`,
      `*${t("footer.disclaimer")}*`,
    ].join("\n");

  const copyMemo = () => {
    navigator.clipboard
      .writeText(buildMarkdown())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const download = () => {
    const blob = new Blob([buildMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tastebridge-memo-${(inputs.brandName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("result.memo")}</h2>
        <div className="flex gap-3">
          <button type="button" onClick={download} className="btn-secondary">
            <Download className="h-3.5 w-3.5" />
            {t("result.download")}
          </button>
          <button type="button" onClick={copyMemo} className="btn-secondary">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("result.copied") : t("result.share")}
          </button>
          <button type="button" onClick={() => window.print()} className="btn-secondary">
            <Printer className="h-3.5 w-3.5" />
            {t("result.print")}
          </button>
        </div>
      </div>

      <article id="memo-print" className="mt-4 rounded-lg border border-border p-8 text-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          TasteBridge · {t("result.memo")}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{inputs.brandName}</h3>
        <div className="mt-4 grid gap-x-8 gap-y-1 font-mono text-xs text-muted-foreground sm:grid-cols-2">
          <p>{city.name[lang]}</p>
          <p>{category.name[lang]}</p>
          <p>{date}</p>
          <p>
            {t("result.confidence")}: {result.confidence}%
          </p>
          <p>
            {t("result.opportunity")}: {result.opportunityIndex ?? "—"}/100
          </p>
        </div>
        <p className={`mt-4 text-lg font-semibold ${v.text}`}>{result.verdict}</p>
        <p className="mt-4 leading-relaxed">{result.memoIntro}</p>

        <h4 className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("agents.label")}
        </h4>
        <div className="mt-2 space-y-4">
          {ordered.map((d) => (
            <div key={d.id} className="border-t border-border pt-3">
              <p className="text-sm font-medium">{d.name[lang]}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{byId[d.id].summary}</p>
              <ul className="mt-1.5 space-y-1">
                {(byId[d.id].findings || []).map((f, i) => (
                  <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                    — {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("result.segments")}
            </h4>
            <ul className="mt-2 space-y-2">
              {(result.segments || []).map((s) => (
                <li key={s.name} className="text-xs leading-relaxed">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground"> — {s.why}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("result.competitors")}
            </h4>
            <ul className="mt-2 space-y-2">
              {(result.competitors || []).map((c) => (
                <li key={c.name} className="text-xs leading-relaxed">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground"> — {c.positioning}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("result.risks")}
            </h4>
            <ul className="mt-2 space-y-2">
              {(result.risks || []).map((r, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  <span className="font-medium">{r.risk}</span>
                  <span className="text-muted-foreground"> — {r.mitigation}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("result.channels")}
            </h4>
            <ul className="mt-2 space-y-2">
              {(result.channels || []).map((c, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t("result.partners")}
            </h4>
            <ul className="mt-2 space-y-2">
              {(result.partners || []).map((p, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground"> — {p.why}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h4 className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("result.map")}
        </h4>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border font-mono uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {hoods.map((nb, i) => (
              <tr key={nb.name} className="border-b border-border/60">
                <td className="py-1.5 pr-4 font-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} · {nb.name}
                </td>
                <td className="py-1.5 pr-4 font-mono">{nb.score ?? "—"}</td>
                <td className="py-1.5 text-muted-foreground">{nb.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-8 border-t border-border pt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {t("footer.disclaimer")}
        </p>
      </article>
    </div>
  );
}