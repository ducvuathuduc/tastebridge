import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/i18n";
import { agents } from "@/lib/agentsData";
import { cities, categories, neighborhoods } from "@/lib/analyzeData";
import FadeUp from "@/components/FadeUp";
import Stepper from "@/components/Stepper";
import MarketCityStep from "@/components/analyze/MarketCityStep";
import BrandStep from "@/components/analyze/BrandStep";
import AgentTimeline from "@/components/analyze/AgentTimeline";
import ResultView from "@/components/analyze/ResultView";

export default function Analyze() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState("form"); // form | running | error | done
  const [wizardStep, setWizardStep] = useState(1);
  const [brandName, setBrandName] = useState("");
  const [cityId, setCityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [resultStep, setResultStep] = useState(4);
  const [result, setResult] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [errorKey, setErrorKey] = useState("error.generic");
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (phase !== "running") return undefined;
    const id = setInterval(() => {
      setActiveIdx((i) => Math.min(i + 1, agents.length - 2));
    }, 1600);
    return () => clearInterval(id);
  }, [phase]);

  const summaries = useMemo(() => {
    if (!result?.agents) return null;
    return Object.fromEntries(result.agents.map((a) => [a.id, a.summary]));
  }, [result]);

  const statuses = useMemo(() => {
    if (phase === "done") return agents.map(() => "done");
    if (phase === "error")
      return agents.map((_, i) => (i < activeIdx ? "done" : i === activeIdx ? "failed" : "queued"));
    if (phase === "running")
      return agents.map((_, i) => (i < activeIdx ? "done" : i === activeIdx ? "working" : "queued"));
    return agents.map(() => "queued");
  }, [phase, activeIdx]);

  const runAnalysis = async (override) => {
    const brand = override?.brandName ?? brandName;
    const city = override?.city ?? cityId;
    const category = override?.category ?? categoryId;
    setPhase("running");
    setActiveIdx(0);
    setResult(null);
    setEvidence(null);
    try {
      const res = await base44.functions.invoke("analyzeMarketEntry", {
        brandName: brand,
        city,
        category,
        lang,
        neighborhoods: (neighborhoods[city] || []).map((n) => n.name),
      });
      const data = res?.data ?? res;
      if (!data || !data.result || !data.result.verdict) {
        throw new Error(data?.error || "empty");
      }
      setResult(data.result);
      setEvidence(data.evidence || null);
      setResultStep(4);
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const code = err?.response?.data?.code;
      setErrorKey(code === "qloo_unavailable" ? "error.qloo" : "error.generic");
      setPhase("error");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get("city");
    if (["hcmc", "hanoi", "danang"].includes(cityParam)) {
      setCityId(cityParam);
    }
    if (urlParams.get("sample") !== "1") return;
    setBrandName("Blue Bottle Coffee");
    setCityId("hcmc");
    setCategoryId("coffee_tea");
    runAnalysis({ brandName: "Blue Bottle Coffee", city: "hcmc", category: "coffee_tea" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setPhase("form");
    setWizardStep(1);
    setResult(null);
    setEvidence(null);
  };

  const currentStep = phase === "form" ? wizardStep : phase === "done" ? resultStep : 3;
  const city = cities.find((c) => c.id === cityId);
  const category = categories.find((c) => c.id === categoryId);
  const onStepSelect =
    phase === "form" ? (n) => setWizardStep(n) : phase === "done" ? (n) => setResultStep(n) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <FadeUp>
        <Stepper current={currentStep} onSelect={onStepSelect} className="mx-auto max-w-3xl" />
      </FadeUp>

      {phase === "form" && (
        <>
          <div className="mx-auto mt-10 max-w-xl text-center">
            <FadeUp>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t("analyze.label")}
              </p>
              {wizardStep === 1 ? (
                <>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                    {t("analyze.title")}
                  </h1>
                  <p className="mt-4 text-muted-foreground">{t("analyze.sub")}</p>
                </>
              ) : (
                <>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                    {t("analyze.brandTitle")}
                  </h1>
                  <p className="mt-4 text-muted-foreground">{t("analyze.brandSub")}</p>
                </>
              )}
            </FadeUp>
          </div>
          {wizardStep === 1 ? (
            <FadeUp delay={0.08} className="mx-auto mt-8 max-w-xl">
              <MarketCityStep
                cityId={cityId}
                categoryId={categoryId}
                onCity={setCityId}
                onCategory={setCategoryId}
                onContinue={() => setWizardStep(2)}
              />
            </FadeUp>
          ) : (
            <FadeUp delay={0.08} className="mx-auto mt-8 max-w-xl">
              <BrandStep
                brandName={brandName}
                setBrandName={setBrandName}
                cityId={cityId}
                categoryId={categoryId}
                onBack={() => setWizardStep(1)}
                onSubmit={runAnalysis}
              />
            </FadeUp>
          )}
        </>
      )}

      {phase === "running" && (
        <>
          <div className="mx-auto mt-10 max-w-2xl text-center">
            <FadeUp>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t("analyze.workingTitle")}
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{brandName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {city?.name[lang]} · {category?.name[lang]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("analyze.workingSub")}</p>
            </FadeUp>
          </div>
          <FadeUp delay={0.1} className="mx-auto mt-10 max-w-2xl">
            <AgentTimeline statuses={statuses} summaries={summaries} />
          </FadeUp>
        </>
      )}

      {phase === "error" && (
        <FadeUp className="mx-auto mt-10 max-w-xl">
          <div className="rounded-lg border border-verdict-nogo/40 bg-verdict-nogo/10 p-8">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-verdict-nogo" />
              <h2 className="font-medium">{t("error.title")}</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(errorKey)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={runAnalysis} className="btn-primary">
                <RotateCcw className="h-3.5 w-3.5" />
                {t("error.retry")}
              </button>
              <button type="button" onClick={reset} className="btn-secondary">
                {t("result.back")}
              </button>
            </div>
          </div>
        </FadeUp>
      )}

      {phase === "done" && (
        <ResultView
          result={result}
          evidence={evidence}
          inputs={{ brandName, cityId, categoryId }}
          step={resultStep}
          onStep={setResultStep}
          onReset={reset}
        />
      )}
    </div>
  );
}