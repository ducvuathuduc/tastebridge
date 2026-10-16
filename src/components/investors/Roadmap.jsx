import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

const STEPS = ["inv.r1", "inv.r2", "inv.r3", "inv.r4"];

export default function Roadmap() {
  const { t } = useLang();
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("inv.roadLabel")}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">{t("inv.roadTitle")}</h2>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border">
        {STEPS.map((k, i) => (
          <div key={k} className="flex items-start gap-4 px-6 py-4">
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm text-foreground">{t(k)}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}