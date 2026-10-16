import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { neighborhoods } from "@/lib/analyzeData";
import { liveMarket, liveCities, roadmapMarkets } from "@/lib/marketsData";
import MarketSwitcher from "@/components/markets/MarketSwitcher";
import StatusBadge from "@/components/StatusBadge";
import Leaderboard from "@/components/markets/Leaderboard";

export default function Markets() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState("vietnam");
  const roadmap = roadmapMarkets.find((m) => m.id === selected);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("markets.label")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t("markets.title")}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("markets.sub")}</p>
      </FadeUp>

      <FadeUp delay={0.08}>
        <div className="mt-10">
          <MarketSwitcher
            markets={[liveMarket, ...roadmapMarkets]}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </FadeUp>

      {selected === "vietnam" ? (
        <FadeUp key="vietnam" delay={0.12}>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {liveCities.map((city) => (
              <div key={city.id} className="flex flex-col rounded-lg border border-border p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{city.name[lang]}</h3>
                  <StatusBadge live />
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {city.blurb[lang]}
                </p>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {neighborhoods[city.id].length} {t("markets.mapped")} · Qloo Taste AI
                </p>
                <Link to={`/analyze?city=${city.id}`} className="btn-primary mt-4 h-10">
                  {t("markets.cityCta")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </FadeUp>
      ) : (
        roadmap && (
          <FadeUp key={roadmap.id} delay={0.12}>
            <div className="mt-10 max-w-2xl rounded-lg border border-border p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{roadmap.name[lang]}</h3>
                <StatusBadge live={false} />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {roadmap.cities}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{roadmap.blurb[lang]}</p>
              <div className="mt-6 space-y-3 border-t border-border pt-6">
                {[
                  { label: t("pack.data"), value: "Qloo Taste AI (planned)" },
                  { label: t("pack.language"), value: roadmap.language[lang] },
                  { label: t("pack.partners"), value: t("markets.scoping") },
                ].map((r) => (
                  <div key={r.label} className="flex gap-4">
                    <p className="w-40 shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      {r.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground/60">
                {t("markets.roadmapNote")}
              </p>
              <Link to="/analyze" className="btn-secondary mt-6 h-10">
                {t("markets.meanwhile")}
              </Link>
            </div>
          </FadeUp>
        )
      )}

      <section className="mt-20">
        <Leaderboard />
      </section>
    </div>
  );
}