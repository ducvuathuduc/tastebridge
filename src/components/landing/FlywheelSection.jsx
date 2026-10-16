import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import Flywheel from "@/components/Flywheel";

export default function FlywheelSection() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {t("fly.label")}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t("fly.title")}</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{t("fly.sub")}</p>
      </FadeUp>
      <FadeUp delay={0.1}>
        <div className="mt-10">
          <Flywheel />
        </div>
      </FadeUp>
    </section>
  );
}