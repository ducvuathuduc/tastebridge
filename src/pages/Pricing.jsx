import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

const TIERS = [
  {
    id: "free",
    nameKey: "pricing.free.name",
    priceKey: "pricing.free.price",
    features: ["pricing.free.f1", "pricing.free.f2", "pricing.free.f3"],
    ctaKey: "pricing.cta.free",
    to: "/analyze",
    primary: false,
  },
  {
    id: "pro",
    nameKey: "pricing.pro.name",
    priceKey: "pricing.pro.price",
    features: ["pricing.pro.f1", "pricing.pro.f2", "pricing.pro.f3", "pricing.pro.f4"],
    ctaKey: "pricing.cta.pro",
    to: "/analyze",
    primary: true,
  },
  {
    id: "ent",
    nameKey: "pricing.ent.name",
    priceKey: "pricing.ent.price",
    features: ["pricing.ent.f1", "pricing.ent.f2", "pricing.ent.f3", "pricing.ent.f4"],
    ctaKey: "pricing.cta.ent",
    to: "/about",
    primary: false,
  },
];

export default function Pricing() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("pricing.label")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("pricing.title")}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("pricing.sub")}</p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-lg border p-8 ${
                tier.primary ? "border-foreground" : "border-border"
              }`}
            >
              {tier.primary && (
                <span className="absolute -top-2.5 left-8 rounded-md bg-foreground px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-background">
                  {t("pricing.popular")}
                </span>
              )}
              <h2 className="font-medium">{t(tier.nameKey)}</h2>
              <p className="mt-4 font-mono text-3xl">{t(tier.priceKey)}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t(f)}
                  </li>
                ))}
              </ul>
              <Link to={tier.to} className={`mt-8 h-10 ${tier.primary ? "btn-primary" : "btn-secondary"}`}>
                {t(tier.ctaKey)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div className="mt-6 rounded-lg border border-border p-8">
          <h2 className="font-medium">{t("pricing.success.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t("pricing.success.body")}
          </p>
        </div>
      </FadeUp>

      <p className="mt-6 text-xs text-muted-foreground/60">{t("pricing.note")}</p>
    </div>
  );
}