"use client";
import { motion } from "framer-motion";
import { LayoutGrid, AlertTriangle, Footprints } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { RunState } from "@/lib/useRun";
import { getPack } from "@/lib/markets";
import { budgetBand } from "@/lib/scoring";
import { Bar, Card, Chip, ScoreRing, SectionTitle, Skeleton, VerdictPill, VERDICT_COLOR } from "../ui";
import { formatMoney } from "@/lib/format";

export function CityBoard({ run }: { run: RunState }) {
  const { t, lang } = useI18n();
  const pack = getPack(run.input?.pack);
  const ids = run.input?.cities || [];
  const chair = run.agents.chair?.output;
  if (!run.scores) {
    return (
      <Card>
        <SectionTitle icon={LayoutGrid}>{t.run.board}</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">{ids.map((id) => <Skeleton key={id} className="h-64" />)}</div>
      </Card>
    );
  }
  const sorted = [...ids].sort((a, b) => (run.scores![b]?.score ?? 0) - (run.scores![a]?.score ?? 0));
  return (
    <Card id="board">
      <SectionTitle icon={LayoutGrid} hint={lang === "vi" ? "Điểm = 50% độ hợp tệp khách + 30% bằng chứng nhu cầu + 20% khoảng trống" : "Score = 50% audience fit + 30% demand proof + 20% white space"}>{t.run.board}</SectionTitle>

      {/* Comparison strip */}
      <div className="mb-6 space-y-2" role="list" aria-label="Score comparison">
        {sorted.map((id) => {
          const sc = run.scores![id];
          const city = pack.cities.find((c) => c.id === id);
          return (
            <div key={id} role="listitem" className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm sm:grid-cols-[160px_1fr_80px]">
              <span className="truncate font-medium text-ink-800">{city?.name[lang]}</span>
              <div className="h-3 overflow-hidden rounded-full bg-ink-100">
                <motion.div className="h-full rounded-full" style={{ background: VERDICT_COLOR[sc.verdict] }} initial={{ width: 0 }} animate={{ width: `${sc.score}%` }} transition={{ duration: 1, ease: "easeOut" }} />
              </div>
              <span className="text-right font-mono tabular-nums text-ink-900">{sc.score}<span className="text-ink-400">/100</span></span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {sorted.map((id, i) => {
          const sc = run.scores![id];
          const city = pack.cities.find((c) => c.id === id);
          const ch = chair?.cities?.find((c: any) => c.city_id === id);
          const band = budgetBand(sc.verdict, run.input?.budget?.amount);
          return (
            <motion.article key={id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-line bg-paper p-5">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold">{city?.name[lang]}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <VerdictPill verdict={sc.verdict} size="lg" />
                    <Chip>{t.run.confidence}: {sc.confidence}</Chip>
                  </div>
                </div>
                <ScoreRing score={sc.score} verdict={sc.verdict} />
              </header>
              <div className="mt-5 space-y-3">
                <Bar label={t.run.audienceFit} value={sc.parts.audienceFit} color="#13795b" />
                <Bar label={t.run.demandProof} value={sc.parts.demandProof} color="#e8a33d" />
                <Bar label={t.run.whitespace} value={sc.parts.whitespace} color="#2a3854" />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <Stat k={t.run.matched} v={sc.inputs.fnbMatches} />
                <Stat k={t.run.analogs} v={sc.inputs.analogCount >= 50 ? "50+" : sc.inputs.analogCount} />
                <Stat k={t.run.saturated} v={`${Math.round(sc.inputs.saturatedShare * 100)}%`} />
                <Stat k={t.run.heatCells} v={sc.inputs.heatCells} />
              </dl>
              <div className="mt-4 rounded-xl bg-white p-3 text-xs">
                <p className="font-semibold text-ink-800">{t.run.budgetBand}</p>
                <p className="mt-1 text-ink-600">
                  {Math.round(band.shareLo * 100)}–{Math.round(band.shareHi * 100)}% {t.run.ofBudget}
                  {run.input?.budget && band.lo != null && <> · <span className="font-mono text-ink-900">{formatMoney(band.lo, run.input.budget.currency, lang)} – {formatMoney(band.hi!, run.input.budget.currency, lang)}</span></>}
                </p>
              </div>
              {ch ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="leading-relaxed text-ink-700">{ch.rationale}</p>
                  {ch.risks?.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-nogo"><AlertTriangle className="h-3.5 w-3.5" /> {t.run.risks}</p>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-ink-600">{ch.risks.slice(0, 3).map((r: string, k: number) => <li key={k}>{r}</li>)}</ul>
                    </div>
                  )}
                  {ch.first_move && <p className="flex gap-1.5 text-xs text-ink-700"><Footprints className="mt-0.5 h-3.5 w-3.5 shrink-0 text-go" /><span><b>{t.run.firstMove}:</b> {ch.first_move}</span></p>}
                </div>
              ) : run.status === "running" ? <Skeleton className="mt-4 h-20" /> : null}
            </motion.article>
          );
        })}
      </div>
      {chair?.recommendation && (
        <div className="mt-6 rounded-2xl bg-ink-950 p-5 text-paper">
          <p className="text-xs font-semibold uppercase tracking-wider text-saffron-300">{t.run.chair}</p>
          <p className="mt-2 font-display text-lg leading-relaxed">{chair.recommendation}</p>
        </div>
      )}
      <p className="mt-4 text-[11px] text-ink-400">{t.run.humanReview}</p>
    </Card>
  );
}

function Stat({ k, v }: { k: string; v: number | string }) {
  return (
    <div className="rounded-lg bg-white px-2.5 py-2">
      <dt className="text-ink-500">{k}</dt>
      <dd className="font-mono text-sm tabular-nums text-ink-900">{v}</dd>
    </div>
  );
}
