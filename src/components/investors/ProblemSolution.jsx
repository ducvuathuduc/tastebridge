import { useLang } from "@/lib/i18n";
import FadeUp from "@/components/FadeUp";

export default function ProblemSolution() {
  const { t } = useLang();
  const cards = [
    {
      label: t("inv.problemLabel"),
      title: t("inv.problemTitle"),
      body: t("inv.problemBody"),
      highlight: false,
    },
    {
      label: t("inv.solutionLabel"),
      title: t("inv.solutionTitle"),
      body: t("inv.solutionBody"),
      highlight: true,
    },
  ];
  return (
    <FadeUp>
      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border p-8 ${c.highlight ? "border-foreground" : "border-border"}`}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}