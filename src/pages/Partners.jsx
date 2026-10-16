import { useState } from "react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import DemoBadge from "@/components/DemoBadge";
import PartnerDirectory from "@/components/partners/PartnerDirectory";
import MatchFlow from "@/components/partners/MatchFlow";
import PipelineBoard from "@/components/partners/PipelineBoard";
import { pipelineStages, demoDeals } from "@/lib/partnersData";

export default function Partners() {
  const { t } = useLang();
  const [deals, setDeals] = useState(demoDeals);

  const shortlist = (partner) =>
    setDeals((d) =>
      d.some((x) => x.partner === partner)
        ? d
        : [...d, { id: `${partner}-${Date.now()}`, partner, stage: "intro" }]
    );

  const advance = (id) =>
    setDeals((d) =>
      d.map((x) => {
        if (x.id !== id) return x;
        const idx = pipelineStages.findIndex((s) => s.id === x.stage);
        return { ...x, stage: pipelineStages[Math.min(idx + 1, pipelineStages.length - 1)].id };
      })
    );

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <FadeUp>
        <div className="flex items-center gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("partners.label")}
          </p>
          <DemoBadge />
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("partners.title")}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("partners.sub")}</p>
      </FadeUp>

      <section className="mt-16">
        <PartnerDirectory deals={deals} onShortlist={shortlist} />
      </section>

      <section className="mt-20">
        <MatchFlow deals={deals} onShortlist={shortlist} />
      </section>

      <section className="mt-20">
        <PipelineBoard deals={deals} onAdvance={advance} />
      </section>
    </div>
  );
}