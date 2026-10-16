import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { demoPartners } from "@/lib/partnersData";

export default function PartnerDirectory({ deals, onShortlist }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all", label: t("partners.filter.all") },
    { id: "operator", label: t("partners.filter.operators") },
    { id: "franchisee", label: t("partners.filter.franchisees") },
  ];
  const list = demoPartners.filter((p) => filter === "all" || p.type === filter);

  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("partners.dirLabel")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("partners.dirTitle")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("partners.dirSub")}</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`h-8 rounded-md border px-3.5 text-xs transition-colors ${
              filter === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-4 divide-y divide-border rounded-lg border border-border">
        {list.map((p) => {
          const inPipeline = deals.some((d) => d.partner === p.name);
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <p className="text-sm font-medium">{p.name}</p>
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {p.typeLabel[lang]}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground/70">{p.note[lang]}</p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {p.stores} {t("partners.stores")} · {p.cities}
              </p>
              <button
                type="button"
                onClick={() => onShortlist(p.name)}
                disabled={inPipeline}
                className="btn-secondary h-8 px-3 text-xs disabled:opacity-50"
              >
                {inPipeline ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {inPipeline ? t("partners.shortlisted") : t("partners.shortlist")}
              </button>
            </div>
          );
        })}
      </div>
    </FadeUp>
  );
}