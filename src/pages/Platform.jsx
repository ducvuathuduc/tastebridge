import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import PackCard from "@/components/platform/PackCard";
import AgentRegistry from "@/components/platform/AgentRegistry";
import ApiSection from "@/components/platform/ApiSection";
import WhiteLabel from "@/components/platform/WhiteLabel";
import DataVault from "@/components/platform/DataVault";
import { packs } from "@/lib/platformData";

export default function Platform() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("platform.label")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("platform.title")}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("platform.sub")}</p>
      </FadeUp>

      <section className="mt-16">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("packs.label")}
          </p>
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-semibold tracking-tight">{t("packs.title")}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t("packs.sub")}</p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <PackCard key={p.id} pack={p} />
            ))}
          </div>
        </FadeUp>
      </section>

      <section className="mt-20">
        <AgentRegistry />
      </section>

      <section className="mt-20">
        <ApiSection />
      </section>

      <section className="mt-20">
        <WhiteLabel />
      </section>

      <section className="mt-20">
        <DataVault />
      </section>
    </div>
  );
}