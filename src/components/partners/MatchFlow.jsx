import { Check, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { demoMatches } from "@/lib/partnersData";

export default function MatchFlow({ deals, onShortlist }) {
  const { t, lang } = useLang();
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("partners.matchLabel")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("partners.matchTitle")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("partners.matchSub")}</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("partners.matchFrom")}
          </p>
          <p className="mt-3 text-lg font-medium">Blue Bottle Coffee</p>
          <p className="mt-1 text-xs text-muted-foreground">Ho Chi Minh City · Coffee & Tea</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center rounded-md border border-verdict-pilot/40 bg-verdict-pilot/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-verdict-pilot">
              PILOT
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {t("result.opportunity")} 72
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-border p-6">
          <div className="divide-y divide-border">
            {demoMatches.map((m) => {
              const inPipeline = deals.some((d) => d.partner === m.name);
              return (
                <div key={m.name} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{m.fit}/100</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {m.role[lang]}
                  </p>
                  <div className="mt-1.5 h-1 rounded-full bg-border">
                    <div className="h-1 rounded-full bg-foreground" style={{ width: `${m.fit}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">{m.why[lang]}</p>
                    <button
                      type="button"
                      onClick={() => onShortlist(m.name)}
                      disabled={inPipeline}
                      className="btn-secondary h-7 shrink-0 px-2.5 text-[11px] disabled:opacity-50"
                    >
                      {inPipeline ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                      {inPipeline ? t("partners.added") : t("partners.addToPipeline")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}