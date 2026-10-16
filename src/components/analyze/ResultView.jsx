import { useEffect } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cities, categories } from "@/lib/analyzeData";
import FadeUp from "@/components/FadeUp";
import VerdictHeader from "@/components/analyze/VerdictHeader";
import AffinityCard from "@/components/analyze/AffinityCard";
import SegmentsCard from "@/components/analyze/SegmentsCard";
import PartnersCard from "@/components/analyze/PartnersCard";
import CompetitorsCard from "@/components/analyze/CompetitorsCard";
import RisksCard from "@/components/analyze/RisksCard";
import ChannelsCard from "@/components/analyze/ChannelsCard";
import EvidenceCard from "@/components/analyze/EvidenceCard";
import NeighborhoodMap from "@/components/analyze/NeighborhoodMap";
import MemoPanel from "@/components/analyze/MemoPanel";

function NextCta({ label, onClick, reset }) {
  return (
    <div className="mt-8 flex justify-center">
      <button type="button" onClick={onClick} className="btn-primary h-11 px-6">
        {label}
        {reset ? <RotateCcw className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ResultView({ result, evidence, inputs, step, onStep, onReset }) {
  const { t, lang } = useLang();
  const city = cities.find((c) => c.id === inputs.cityId) || cities[0];
  const category = categories.find((c) => c.id === inputs.categoryId) || categories[0];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <div className="mt-10">
      {step === 4 && (
        <FadeUp>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {inputs.brandName} · {city.name[lang]} · {category.name[lang]}
            </p>
            <button type="button" onClick={onReset} className="btn-secondary h-9">
              {t("result.back")}
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-6">
            <VerdictHeader result={result} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <AffinityCard affinity={result.affinity} />
            <SegmentsCard segments={result.segments} />
          </div>
          <div className="mt-6">
            <NeighborhoodMap cityId={inputs.cityId} scores={result.neighborhoods || []} />
          </div>
          <NextCta label={t("cta.toPartners")} onClick={() => onStep(5)} />
        </FadeUp>
      )}

      {step === 5 && (
        <FadeUp>
          <PartnersCard partners={result.partners} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CompetitorsCard competitors={result.competitors} />
            <RisksCard risks={result.risks} />
            <ChannelsCard channels={result.channels} />
            <EvidenceCard evidence={evidence} />
          </div>
          <NextCta label={t("cta.toMemo")} onClick={() => onStep(6)} />
        </FadeUp>
      )}

      {step === 6 && (
        <FadeUp>
          <MemoPanel result={result} evidence={evidence} inputs={inputs} />
          <NextCta label={t("result.back")} onClick={onReset} reset />
        </FadeUp>
      )}
    </div>
  );
}