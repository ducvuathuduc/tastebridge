import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

export default function About() {
  const { t } = useLang();
  const limits = [1, 2, 3, 4, 5].map((i) => t(`about.limits.${i}`));

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("about.label")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t("about.title")}</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("about.sub")}</p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <section className="mt-12 rounded-lg border border-border p-8">
          <h2 className="font-medium">{t("about.qloo.title")}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.qloo.p1")}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.qloo.p2")}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("about.qloo.p3")}</p>
        </section>
      </FadeUp>

      <FadeUp delay={0.15}>
        <section className="mt-6 rounded-lg border border-border p-8">
          <h2 className="font-medium">{t("about.limits.title")}</h2>
          <ul className="mt-2 divide-y divide-border">
            {limits.map((item) => (
              <li key={item} className="flex gap-3 py-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="mt-10 text-center">
          <Link to="/analyze" className="btn-primary h-11 px-6">
            {t("about.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}