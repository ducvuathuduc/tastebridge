"use client";
import { motion } from "framer-motion";
import { Printer, RotateCcw, CircleAlert, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRun } from "@/lib/useRun";
import { AnalyzeForm } from "@/components/analyze/AnalyzeForm";
import { AgentTimeline } from "@/components/analyze/AgentTimeline";
import { CityBoard } from "@/components/analyze/CityBoard";
import { HeatMap } from "@/components/analyze/HeatMap";
import { ProfileCard, Committee, LaunchPlan, Validate, Partners, CultureMenu, EvidenceLedger } from "@/components/analyze/Sections";
import { RoiCalculator } from "@/components/analyze/RoiCalculator";
import { Memo } from "@/components/analyze/Memo";
import { Card } from "@/components/ui";

export default function AnalyzePage() {
  const { t, lang } = useI18n();
  const { state: run, start } = useRun();
  const started = run.status !== "idle";

  return (
    <>
      <div className="no-print mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-saffron-600">{t.form.title}</p>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              {run.input ? run.input.brand : t.heroTitle}
            </h1>
          </div>
          {run.status === "done" && (
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-800"><Printer className="h-4 w-4" /> {t.run.memo}</button>
              <button onClick={() => run.input && start({ ...run.input, lang })} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:border-ink-400"><RotateCcw className="h-4 w-4" /> {t.run.retry}</button>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left rail */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
            <Card><AnalyzeForm onRun={start} running={run.status === "running"} /></Card>
            {started && <Card><AgentTimeline run={run} /></Card>}
          </aside>

          {/* Results */}
          <div className="min-w-0 space-y-6">
            {!started && <EmptyState />}
            {run.status === "error" && (
              <Card className="border-nogo/30 bg-nogo-soft/40">
                <div className="flex items-start gap-3" role="alert">
                  <CircleAlert className="mt-0.5 h-5 w-5 text-nogo" />
                  <div>
                    <p className="font-semibold text-nogo">{t.run.errorTitle}</p>
                    <p className="mt-1 text-sm text-ink-700">{run.error}</p>
                    {run.input && <button onClick={() => start(run.input!)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-paper"><RotateCcw className="h-3.5 w-3.5" /> {t.run.retry}</button>}
                  </div>
                </div>
              </Card>
            )}
            {started && (run.status !== "error" || !!run.profile) ? (
              <>
                <ProfileCard run={run} />
                <CityBoard run={run} />
                <HeatMap run={run} />
                <Committee run={run} />
                <LaunchPlan run={run} />
                <Validate run={run} />
                <Partners run={run} />
                <CultureMenu run={run} />
                {run.status === "done" && <RoiCalculator defaultCurrency={run.input?.budget?.currency || (run.input?.pack === "vn" && lang === "vi" ? "VND" : "USD")} />}
                <EvidenceLedger run={run} />
              </>
            ) : null}
          </div>
        </div>
      </div>
      <Memo run={run} />
    </>
  );
}

function EmptyState() {
  const { t, lang } = useI18n();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid min-h-[420px] place-items-center rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-white/60 p-10 text-center">
      <div className="max-w-md">
        <Sparkles className="mx-auto h-8 w-8 text-saffron-500" />
        <p className="mt-4 font-display text-2xl font-semibold">{t.run.empty}</p>
        <p className="mt-2 text-sm text-ink-500">
          {lang === "vi"
            ? "Chọn một thương hiệu mẫu ở bên trái hoặc nhập thương hiệu của bạn. Hội đồng 11 tác tử sẽ gọi Qloo trực tiếp và trả về phán quyết GO / PILOT / NO-GO cho từng thành phố trong khoảng một phút."
            : "Pick a preset on the left or type your own brand. The 11-agent committee calls Qloo live and returns a GO / PILOT / NO-GO verdict per city in about a minute."}
        </p>
      </div>
    </motion.div>
  );
}
