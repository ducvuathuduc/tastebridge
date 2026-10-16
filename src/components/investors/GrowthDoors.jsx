import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

export default function GrowthDoors() {
  const { t } = useLang();
  const doors = [1, 2, 3, 4, 5].map((n) => ({
    n,
    title: t(`inv.door${n}`),
    desc: t(`inv.door${n}d`),
  }));
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("inv.doorsLabel")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("inv.doorsTitle")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("inv.doorsSub")}</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doors.map((d) => (
          <div key={d.n} className="rounded-lg border border-border p-6">
            <p className="font-mono text-[10px] text-muted-foreground/60">
              {String(d.n).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-medium">{d.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.desc}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}