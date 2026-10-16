import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

export default function WhyMoat() {
  const { t } = useLang();
  const cards = [
    { label: t("inv.whyLabel"), title: t("inv.whyTitle"), body: t("inv.whyBody") },
    { label: t("inv.moatLabel"), title: t("inv.moatTitle"), body: t("inv.moatBody") },
  ];
  return (
    <FadeUp>
      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}