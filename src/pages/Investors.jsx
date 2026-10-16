import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import FlywheelSection from "@/components/landing/FlywheelSection";
import ProblemSolution from "@/components/investors/ProblemSolution";
import WhyMoat from "@/components/investors/WhyMoat";
import GrowthDoors from "@/components/investors/GrowthDoors";
import Roadmap from "@/components/investors/Roadmap";

export default function Investors() {
  const { t } = useLang();
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-20">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("inv.label")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("inv.title")}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("inv.sub")}</p>
        </FadeUp>
      </div>

      <FlywheelSection />

      <div className="mx-auto max-w-6xl px-6 pb-20">
        <section>
          <ProblemSolution />
        </section>
        <section className="mt-20">
          <WhyMoat />
        </section>
        <section className="mt-20">
          <GrowthDoors />
        </section>
        <section className="mt-20">
          <Roadmap />
        </section>
        <p className="mt-16 text-xs leading-relaxed text-muted-foreground/60">
          {t("inv.disclaimer")}
        </p>
      </div>
    </>
  );
}