import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

export default function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-b border-border print:hidden">
      <div className="grid-mask absolute inset-0 bg-grid-faint" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 py-28 text-center sm:py-40">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("hero.label")}
          </p>
        </FadeUp>
        <FadeUp delay={0.08}>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.h1")}
          </h1>
        </FadeUp>
        <FadeUp delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.sub")}
          </p>
        </FadeUp>
        <FadeUp delay={0.24}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/analyze" className="btn-primary h-11 px-6">
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary h-11 px-6">
              {t("hero.cta2")}
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}