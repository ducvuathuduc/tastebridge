import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";
import { whitelabelAudiences } from "@/lib/platformData";

export default function WhiteLabel() {
  const { t, lang } = useLang();
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("whitelabel.label")}
      </p>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="text-3xl font-semibold tracking-tight">{t("whitelabel.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{t("whitelabel.sub")}</p>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {whitelabelAudiences.map((a) => (
          <div key={a.id} className="rounded-lg border border-border p-6">
            <h3 className="font-medium">{a.name[lang]}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.desc[lang]}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}