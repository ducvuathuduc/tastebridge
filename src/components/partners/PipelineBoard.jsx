import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { pipelineStages } from "@/lib/partnersData";

export default function PipelineBoard({ deals, onAdvance }) {
  const { t, lang } = useLang();
  const lastStage = pipelineStages[pipelineStages.length - 1].id;
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("partners.pipelineLabel")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("partners.pipelineTitle")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("partners.pipelineSub")}</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {pipelineStages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          return (
            <div key={stage.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between px-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {stage.label[lang]}
                </p>
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {String(stageDeals.length).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {stageDeals.length === 0 && (
                  <p className="px-2 py-3 text-xs text-muted-foreground/40">—</p>
                )}
                {stageDeals.map((d) =>
                  stage.id !== lastStage ? (
                    <div key={d.id} className="rounded-md border border-border bg-card px-3 py-2.5">
                      <p className="text-xs font-medium">{d.partner}</p>
                      <button
                        type="button"
                        onClick={() => onAdvance(d.id)}
                        className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowRight className="h-2.5 w-2.5" />
                        {t("partners.advance")}
                      </button>
                    </div>
                  ) : (
                    <div key={d.id} className="rounded-md border border-border bg-card px-3 py-2.5">
                      <p className="text-xs font-medium">{d.partner}</p>
                      <p className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-verdict-go">
                        <Check className="h-2.5 w-2.5" />
                        {t("partners.signed")}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </FadeUp>
  );
}